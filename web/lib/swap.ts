// unk swap — Solana.
//
// PRE-LAUNCH: SWAP_LIVE=false -> /swap shows a placeholder. At the $UNK launch
// the swap goes live on Jupiter (https://station.jup.ag/docs): quote via the
// Jupiter quote API, swap via the swap API — real routes across every Solana
// DEX, price impact included, any token in/out. No pool math on our side.
//   1) set UNK_MINT to the pump.fun mint
//   2) build the Jupiter-backed SwapWidget (quote -> swapTransaction -> sign)
//   3) flip SWAP_LIVE to true
export const SWAP_LIVE = false;

export const UNK_MINT = ''; // $UNK mint address — set at launch
export const SOL_MINT = 'So11111111111111111111111111111111111111112'; // wrapped SOL
