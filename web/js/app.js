/*
 * ShieldPay client — browser proof generation + Soroban submission.
 *
 * This is the wiring layer the demo button calls in production. It keeps all
 * secrets client-side: only the proof + public signals are sent on-chain.
 *
 * Dependencies (loaded via <script> in a real build):
 *   - snarkjs (groth16 fullProve)
 *   - @stellar/stellar-sdk
 *   - @creit.tech/stellar-wallets-kit
 *
 * Fill in CONTRACT_IDS after running scripts/deploy.sh.
 */

export const CONFIG = {
  network: "TESTNET",
  rpcUrl: "https://soroban-testnet.stellar.org",
  poolContractId: "<POOL_CONTRACT_ID>",
  verifierContractId: "<VERIFIER_CONTRACT_ID>",
  aspContractId: "<ASP_CONTRACT_ID>",
  usdcSac: "<USDC_SAC_ADDRESS>",
  wasm: "/circuits/transfer.wasm",
  zkey: "/circuits/transfer_final.zkey",
};

// Generate a Groth16 proof entirely in the browser.
export async function proveTransfer(inputs) {
  // inputs = { root, nullifierHash, newCommitment, aspRoot, publicAmount,
  //            inAmount, inBlinding, inSecret, inPathElements, inPathIndex,
  //            outAmount, outBlinding, outPubkey, aspPathElements, aspPathIndex }
  const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
    inputs,
    CONFIG.wasm,
    CONFIG.zkey,
  );
  return { proof, publicSignals };
}

// Convert a snarkjs proof into the BytesN layout the Soroban verifier expects.
export function encodeProof(proof) {
  const g1 = (p) => hexToBytes(padG1(p));
  const g2 = (p) => hexToBytes(padG2(p));
  return {
    a: g1(proof.pi_a),
    b: g2(proof.pi_b),
    c: g1(proof.pi_c),
  };
}

// Submit the verified transfer to the pool contract.
export async function submitTransfer(kit, encoded, publicSignals) {
  const { Contract, TransactionBuilder, nativeToScVal, Networks } = window.StellarSdk;
  const pool = new Contract(CONFIG.poolContractId);
  const op = pool.call(
    "transfer",
    nativeToScVal(encoded),
    nativeToScVal(publicSignals[0]), // root
    nativeToScVal(publicSignals[1]), // nullifierHash
    nativeToScVal(publicSignals[2]), // newCommitment
    nativeToScVal(publicSignals),    // full public inputs vector
  );
  // ... build, simulate, sign with wallet kit, send, poll for result ...
  return op;
}

function hexToBytes(hex) { const h = hex.replace(/^0x/, ""); const out = new Uint8Array(h.length / 2); for (let i = 0; i < out.length; i++) out[i] = parseInt(h.substr(i * 2, 2), 16); return out; }
function padG1(p) { return p.slice(0, 2).map((x) => BigInt(x).toString(16).padStart(64, "0")).join(""); }
function padG2(p) { return p.slice(0, 2).flat().map((x) => BigInt(x).toString(16).padStart(64, "0")).join(""); }
