pragma circom 2.1.6;

// Zerolyn — minimal BLS12-381 demo circuit.
//
// Proves knowledge of a secret `x` such that x^3 + x + 5 == out, WITHOUT
// revealing x. `out` is the single public input.
//
// This is the circuit whose Groth16 proof is verified ON-CHAIN by the Soroban
// verifier contract using Stellar's native BLS12-381 host functions (Protocol
// 22). It is intentionally small so the full "prove in browser -> verify
// on-chain" path is real and demonstrable today. The larger shielded-transfer
// circuit (transfer.circom) is the roadmap target and needs a BLS12-381-correct
// Poseidon before it can use this same verifier.
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
