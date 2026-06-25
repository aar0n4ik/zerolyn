#!/usr/bin/env node
// Convert a snarkjs (BLS12-381) proof.json into the Proof BytesN args for the
// Zerolyn verifier's `verify`. Prints {a,b,c} hex to stdout. Public signals
// (public.json) are passed separately as 32-byte big-endian field elements.
//
// Same serialization + G2_ORDER flag as vk_to_args.js. Stellar's host expects
// the Fp2 element c0 + c1*u as be_bytes(c1) || be_bytes(c0), so the DEFAULT is
// G2_ORDER=c1c0. Set G2_ORDER=c0c1 to flip the limb order.
const fs = require("fs");
const file = process.argv[2];
if (!file) { console.error("usage: node proof_to_args.js <proof.json>"); process.exit(1); }
const p = JSON.parse(fs.readFileSync(file, "utf8"));
const ORDER = process.env.G2_ORDER === "c0c1" ? "c0c1" : "c1c0";

const fp = (n) => BigInt(n).toString(16).padStart(96, "0");
const g1 = (P) => fp(P[0]) + fp(P[1]);
const g2 = (P) => {
  const x = P[0], y = P[1];
  return ORDER === "c0c1"
    ? fp(x[0]) + fp(x[1]) + fp(y[0]) + fp(y[1])
    : fp(x[1]) + fp(x[0]) + fp(y[1]) + fp(y[0]);
};

console.log(JSON.stringify({ a: g1(p.pi_a), b: g2(p.pi_b), c: g1(p.pi_c) }, null, 2));
