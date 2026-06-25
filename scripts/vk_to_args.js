#!/usr/bin/env node
// Convert a snarkjs (BLS12-381) verification_key.json into the BytesN argument
// layout the Zerolyn Soroban verifier expects for set_vk. Prints JSON to stdout.
//
// BLS12-381 uncompressed serialization (Stellar host-function format):
//   Fp = 48 bytes, big-endian
//   G1 = x(48) || y(48)                                = 96 bytes
//   G2 = x.c1(48) || x.c0(48) || y.c1(48) || y.c0(48)  = 192 bytes
//
// The Stellar host serializes an Fp2 element c0 + c1*u as be_bytes(c1) || be_bytes(c0)
// (see rs-soroban-sdk soroban-sdk/src/crypto/bls12_381.rs). snarkjs stores each Fp2
// coordinate as [c0, c1], so the DEFAULT below emits c1||c0 (G2_ORDER=c1c0).
// Set G2_ORDER=c0c1 only if a future host build expects the opposite limb order.
const fs = require("fs");
const file = process.argv[2];
if (!file) { console.error("usage: node vk_to_args.js <verification_key.json>"); process.exit(1); }
const vk = JSON.parse(fs.readFileSync(file, "utf8"));
const ORDER = process.env.G2_ORDER === "c0c1" ? "c0c1" : "c1c0";

const fp = (n) => BigInt(n).toString(16).padStart(96, "0");   // 48 bytes
const g1 = (p) => fp(p[0]) + fp(p[1]);                         // 96 bytes
const g2 = (p) => {
  const x = p[0], y = p[1];                                    // each [c0, c1]
  return ORDER === "c0c1"
    ? fp(x[0]) + fp(x[1]) + fp(y[0]) + fp(y[1])
    : fp(x[1]) + fp(x[0]) + fp(y[1]) + fp(y[0]);
};

const out = {
  alpha_g1: g1(vk.vk_alpha_1),
  beta_g2: g2(vk.vk_beta_2),
  gamma_g2: g2(vk.vk_gamma_2),
  delta_g2: g2(vk.vk_delta_2),
  ic: vk.IC.map(g1),
};
console.log(JSON.stringify(out, null, 2));
