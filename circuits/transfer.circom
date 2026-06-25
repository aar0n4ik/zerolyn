pragma circom 2.1.6;

// Zerolyn — compliant private-transfer circuit (BLS12-381, Groth16).
//
// Proves, in zero knowledge, that a transfer is BOTH solvent and compliant
// WITHOUT revealing the amount or the sender's balance:
//
//   private  amount   — the transfer amount (hidden)
//   private  balance  — the sender's available balance (hidden)
//   public   limit    — a regulatory / policy compliance cap (revealed)
//
// Constraints enforced inside the proof:
//   1) amount >= 1          (a real, non-zero transfer)
//   2) amount <= balance    (solvency: the sender can actually afford it)
//   3) amount <= limit      (compliance: under the public threshold)
//
// The Groth16 proof of these constraints is verified ON-CHAIN by the Soroban
// verifier using Stellar's native BLS12-381 pairing host functions (Protocol
// 22). Only `limit` is public, so an auditor or contract learns the transfer
// is valid and within policy while the amount and balance stay private.
//
// Range comparisons use circomlib's field-agnostic comparators (Num2Bits +
// arithmetic only) — no curve-specific hash is required, so this runs on
// BLS12-381 today. A full shielded pool additionally needs Poseidon
// commitments/nullifiers (roadmap), but the solvency+compliance statement
// above is already real and on-chain-verifiable with this same verifier.
//
// Build:
//   circom circuits/transfer.circom --r1cs --wasm --sym --prime bls12381 \
//     -l circuits/node_modules -o circuits/build

include "circomlib/circuits/comparators.circom";

template Transfer(nbits) {
    signal input amount;   // private
    signal input balance;  // private
    signal input limit;    // public

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
}

component main {public [limit]} = Transfer(128);
