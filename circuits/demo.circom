pragma circom 2.1.6;

// Zerolyn — minimal BLS12-381 demo circuit (standalone teaching example).
//
// Proves knowledge of a secret `x` such that x^3 + x + 5 == out, WITHOUT
// revealing x. `out` is the single public input.
//
// NOTE: this file is a tiny reference example only — it is NOT the live path.
// The circuit actually verified ON-CHAIN today is `circuits/transfer.circom`
// (the hidden-amount solvency + compliance statement). Its Groth16 proof is
// checked by the Soroban verifier using Stellar's native BLS12-381 host
// functions (Protocol 22). transfer.circom uses only circomlib's
// field-agnostic comparators (Num2Bits + arithmetic), so it requires NO
// curve-specific Poseidon and runs on BLS12-381 as-is. A fully shielded pool
// (Poseidon commitments / nullifiers / Merkle membership) is the roadmap
// target — see docs/ARCHITECTURE.md.
//
// Build:
//   circom circuits/demo.circom --r1cs --wasm --sym --prime bls12381 -o build

template Cube() {
    signal input x;     // private witness
    signal output out;  // public input to the verifier

    signal x2;
    signal x3;
    x2 <== x * x;
    x3 <== x2 * x;
    out <== x3 + x + 5;
}

component main = Cube();
