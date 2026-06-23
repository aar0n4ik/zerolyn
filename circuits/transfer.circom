pragma circom 2.1.6;

// ShieldPay — shielded transfer circuit
// Proves a valid private USDC transfer inside a fixed-depth Merkle commitment
// tree WITHOUT revealing the amount, the sender note, or the recipient.
//
// This circuit is "load-bearing": the on-chain pool only accepts a state
// transition if this proof verifies. Remove it and no transfer can settle.
//
// Public signals:
//   root            - Merkle root of the commitment tree the input note is in
//   nullifierHash   - unique nullifier preventing double-spends
//   newCommitment   - commitment of the recipient's output note
//   aspRoot         - Merkle root of the ASP allow-list (compliance gate)
//   publicAmount    - 0 for internal transfers (kept for deposit/withdraw reuse)
//
// Private signals: amount, blindings, secret keys, Merkle paths, ASP path.
//
// Hash: Poseidon (matches Stellar Protocol 25 "X-Ray" host function so the
// same hashing can be recomputed cheaply on-chain).

include "poseidon.circom";
include "comparators.circom";
include "bitify.circom";

// ----- Merkle inclusion proof over Poseidon -----
template MerkleProof(depth) {
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndex[depth]; // 0 = leaf on left, 1 = leaf on right
    signal output root;

    component hashers[depth];
    signal cur[depth + 1];
    cur[0] <== leaf;

    for (var i = 0; i < depth; i++) {
        // pathIndex must be boolean
        pathIndex[i] * (1 - pathIndex[i]) === 0;
        hashers[i] = Poseidon(2);
        // swap order based on the path bit
        hashers[i].inputs[0] <== cur[i] + pathIndex[i] * (pathElements[i] - cur[i]);
        hashers[i].inputs[1] <== pathElements[i] + pathIndex[i] * (cur[i] - pathElements[i]);
        cur[i + 1] <== hashers[i].out;
    }
    root <== cur[depth];
}

template ShieldedTransfer(treeDepth, aspDepth) {
    // ---- public ----
    signal input root;
    signal input nullifierHash;
    signal input newCommitment;
    signal input aspRoot;
    signal input publicAmount;

    // ---- private: input note ----
    signal input inAmount;
    signal input inBlinding;
    signal input inSecret;          // owner spending key
    signal input inPathElements[treeDepth];
    signal input inPathIndex[treeDepth];

    // ---- private: output note ----
    signal input outAmount;
    signal input outBlinding;
    signal input outPubkey;         // recipient public key (Poseidon of recipient secret)

    // ---- private: ASP membership of recipient ----
    signal input aspPathElements[aspDepth];
    signal input aspPathIndex[aspDepth];

    // 1) Derive the input commitment = Poseidon(amount, pubkey, blinding)
    component inPub = Poseidon(1);
    inPub.inputs[0] <== inSecret;
    component inCommit = Poseidon(3);
    inCommit.inputs[0] <== inAmount;
    inCommit.inputs[1] <== inPub.out;
    inCommit.inputs[2] <== inBlinding;

    // 2) Prove the input commitment is in the tree at `root`
    component mp = MerkleProof(treeDepth);
    mp.leaf <== inCommit.out;
    for (var i = 0; i < treeDepth; i++) {
        mp.pathElements[i] <== inPathElements[i];
        mp.pathIndex[i] <== inPathIndex[i];
    }
    mp.root === root;

    // 3) Nullifier = Poseidon(inCommitment, inSecret) — unlinkable, unique
    component nf = Poseidon(2);
    nf.inputs[0] <== inCommit.out;
    nf.inputs[1] <== inSecret;
    nf.out === nullifierHash;

    // 4) Output commitment = Poseidon(outAmount, outPubkey, outBlinding)
    component outCommit = Poseidon(3);
    outCommit.inputs[0] <== outAmount;
    outCommit.inputs[1] <== outPubkey;
    outCommit.inputs[2] <== outBlinding;
    outCommit.out === newCommitment;

    // 5) Value conservation: inAmount == outAmount + publicAmount
    inAmount === outAmount + publicAmount;

    // 6) Range checks (prevent overflow / negative via field wraparound)
    component inRange = Num2Bits(64);
    inRange.in <== inAmount;
    component outRange = Num2Bits(64);
    outRange.in <== outAmount;

    // 7) Compliance: recipient pubkey must be in the ASP allow-list `aspRoot`
    component aspProof = MerkleProof(aspDepth);
    aspProof.leaf <== outPubkey;
    for (var j = 0; j < aspDepth; j++) {
        aspProof.pathElements[j] <== aspPathElements[j];
        aspProof.pathIndex[j] <== aspPathIndex[j];
    }
    aspProof.root === aspRoot;
}

// 20-level note tree, 16-level ASP tree.
component main { public [root, nullifierHash, newCommitment, aspRoot, publicAmount] } = ShieldedTransfer(20, 16);
