const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('node:path');

// Known benign Electron race with <webview> navigation: a render frame can be
// disposed before Electron reads its info. Swallow it instead of popping a crash dialog.
process.on('uncaughtException', (err) => {
  const msg = err && err.message ? err.message : String(err);
  if (msg.includes('Render frame was disposed') || msg.includes('WebFrameMain')) return;
  console.error('[main] uncaughtException:', err);
});

// Minimal tracker/ad blocklist (prototype). A real build uses a maintained list
// like EasyList. This already makes the browser meaningfully more private.
const BLOCKED_HOSTS = [
  'doubleclick.net',
  'googlesyndication.com',
  'google-analytics.com',
  'googletagmanager.com',
  'adservice.google.com',
  'connect.facebook.net',
  'facebook.net',
  'ads-twitter.com',
  'analytics.tiktok.com',
  'scorecardresearch.com',
  'adnxs.com',
  'criteo.com',
  'taboola.com',
  'outbrain.com',
  'hotjar.com',
  'mixpanel.com',
];

let blockerEnabled = true;
let blockedCount = 0;
let vpnOn = false;
let mainWindow = null;

// unk VPN for the browser: route the app's traffic through an HTTP proxy on one of
// our region nodes — per-app, like Tor Browser (hides your IP for browsing without
// touching the rest of the system). Pick a country; browsing exits from that node.
// (HTTP proxy, not SOCKS5 — Chromium can't authenticate SOCKS5 proxies.)
// Prototype: shared credentials; a real build issues them per holder.
// TODO(launch): point at the unk API once the new domain is live.
const API_BASE = 'https://api.unk.example';
// Baked-in fallback used only if the API is unreachable at startup.
// Empty until the unk fleet exists — the list is fetched from the API.
const DEFAULT_REGIONS = [];
let VPN_REGIONS = DEFAULT_REGIONS.slice();
const VPN_USER = 'unk';
const VPN_PASS = 'unk-beta';
let vpnRegion = VPN_REGIONS[0]?.id ?? null;

// Pull the live exit-node list from the API so new countries show up without
// shipping a new app build. Silently keeps the defaults if the fetch fails.
async function loadRegions() {
  try {
    const res = await fetch(`${API_BASE}/vpn/nodes`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return;
    const data = await res.json();
    const nodes = Array.isArray(data.nodes) ? data.nodes.filter((n) => n && n.id && n.proxy) : [];
    if (nodes.length) {
      VPN_REGIONS = nodes;
      if (!VPN_REGIONS.some((r) => r.id === vpnRegion)) vpnRegion = VPN_REGIONS[0].id;
    }
  } catch {
    /* keep defaults */
  }
}

function publicRegions() {
  return VPN_REGIONS.map(({ id, name, flag }) => ({ id, name, flag }));
}

function isBlocked(url) {
  try {
    const host = new URL(url).hostname;
    return BLOCKED_HOSTS.some((d) => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
}

function installBlocker(ses) {
  ses.webRequest.onBeforeRequest((details, callback) => {
    if (blockerEnabled && isBlocked(details.url)) {
      blockedCount += 1;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('privacy:blocked', blockedCount);
      }
      return callback({ cancel: true });
    }
    callback({});
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 720,
    minHeight: 480,
    backgroundColor: '#06070a',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));
}

app.whenReady().then(() => {
  installBlocker(session.defaultSession);
  createWindow();

  // Fetch the live node list; when it arrives, refresh the renderer's picker.
  loadRegions().then(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vpn:regions', publicRegions());
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Supply the proxy credentials when the VPN proxy asks for authentication.
// Only while the VPN is ON — never hand the shared credentials to arbitrary
// proxies when we are routing direct.
app.on('login', (event, _webContents, _request, authInfo, callback) => {
  if (vpnOn && authInfo && authInfo.isProxy) {
    event.preventDefault();
    callback(VPN_USER, VPN_PASS);
  }
});

// <webview> pages must not spawn free-floating windows: open target=_blank
// links in the same view instead of silently dropping (or popping) them.
app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() === 'webview') {
    contents.setWindowOpenHandler(({ url }) => {
      if (/^https?:\/\//i.test(url)) contents.loadURL(url);
      return { action: 'deny' };
    });
  }
});

ipcMain.handle('app:versions', () => ({
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node,
}));

ipcMain.handle('privacy:toggleBlocker', (_event, on) => {
  blockerEnabled = Boolean(on);
  return blockerEnabled;
});

ipcMain.handle('vpn:regions', () => publicRegions());

ipcMain.handle('vpn:toggle', async (_event, on, regionId) => {
  const ses = session.defaultSession;
  if (regionId && VPN_REGIONS.some((r) => r.id === regionId)) vpnRegion = regionId;
  const region = VPN_REGIONS.find((r) => r.id === vpnRegion) || VPN_REGIONS[0];
  // No exit nodes yet (empty list / API unreachable): stay safely OFF.
  if (!region || !region.proxy) {
    vpnOn = false;
    await ses.setProxy({ mode: 'direct' });
    return { on: false, region: null, error: 'no-regions' };
  }
  vpnOn = Boolean(on);
  // Route (or stop routing) the whole app — including every tab's <webview> —
  // through the chosen region's node. Your browsing exits from that node's IP.
  if (vpnOn) {
    await ses.setProxy({ proxyRules: region.proxy });
  } else {
    await ses.setProxy({ mode: 'direct' });
  }
  return { on: vpnOn, region: region.id };
});
