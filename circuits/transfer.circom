pragma circom 2.1.6;

// Zerolyn — compliant private-transfer circuit (BLS12-381, Groth16).
//
// Proves, in zero knowledge, that a transfer is solvent AND compliant AND is
// bound to the actual on-chain payment, WITHOUT revealing the sender's balance:
//
//   private  amount   — the transfer amount (hidden)
//   private  balance  — the sender's available balance (hidden)
//   public   limit    — a regulatory / policy compliance cap (revealed)
//   public   paid     — the actual on-chain payment amount (revealed)
//
// Constraints enforced inside the proof:
//   1) amount >= 1          (a real, non-zero transfer)
//   2) amount <= balance    (solvency: the sender can actually afford it)
//   3) amount <= limit      (compliance: under the public threshold)
//   4) amount === paid      (binding: the proven amount IS the on-chain payment)
//
// Why exposing `paid` leaks nothing: the send-page Stellar payment is a
// transparent public payment, so its amount is already on-chain. Publishing
// `paid` (== amount) therefore reveals nothing new, while `balance` stays
// private. The app/contract compares `paid` against the real Horizon payment,
// so the solvency+compliance proof is now CRYPTOGRAPHICALLY BOUND to the real
// payment instead of being an abstract statement about a prover-chosen amount.
//
// The Groth16 proof is verified ON-CHAIN by the Soroban verifier using
// Stellar's native BLS12-381 pairing host functions (Protocol 22).
//
// Range comparisons use circomlib's field-agnostic comparators (Num2Bits +
// arithmetic only) — no curve-specific hash is required, so this runs on
// BLS12-381 today. A full shielded pool additionally needs Poseidon
// commitments/nullifiers (roadmap).
//
// Build:
//   circom circuits/transfer.circom --r1cs --wasm --sym --prime bls12381 \
//     -l circuits/node_modules -o circuits/build
//
// IMPORTANT: adding the `paid` public input changes the verifying key. After
// rebuilding you MUST re-run the trusted setup (scripts/setup.sh) and install
// the new key via set_vk. The verifier contract is generic over the number of
// public inputs, so it does NOT need to be redeployed.

include "circomlib/circuits/comparators.circom";

template Transfer(nbits) {
    signal input amount;   // private
    signal input balance;  // private
    signal input limit;    // public
    signal input paid;     // public

    // amount >= 1
    component ge1 = GreaterEqThan(nbits);
    ge1.in[0] <== amount;
    ge1.in[1] <== 1;
    ge1.out === 1;

    // amount <= balance  (solvency)
    component leBal = LessEqThan(nbits);
    leBal.in[0] <== amount;
    leBal.in[1] <== balance;
    leBal.out === 1;

    // amount <= limit  (compliance)
    component leLim = LessEqThan(nbits);
    leLim.in[0] <== amount;
    leLim.in[1] <== limit;
    leLim.out === 1;

    // amount == paid  (bind the proof to the real on-chain payment)
    amount === paid;
}

component main {public [limit, paid]} = Transfer(128);
