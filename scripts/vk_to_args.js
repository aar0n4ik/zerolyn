#!/usr/bin/env node
// Convert a snarkjs verification_key.json into the BytesN argument layout the
// ShieldPay Soroban verifier expects for set_vk. Prints JSON to stdout.
const fs = require("fs");
const path = process.argv[2];
if (!path) { console.error("usage: node vk_to_args.js <verification_key.json>"); process.exit(1); }
const vk = JSON.parse(fs.readFileSync(path, "utf8"));

const hex = (n) => BigInt(n).toString(16).padStart(64, "0");
const g1 = (p) => hex(p[0]) + hex(p[1]);                 // 64 bytes
const g2 = (p) => hex(p[0][0]) + hex(p[0][1]) + hex(p[1][0]) + hex(p[1][1]); // 128 bytes

const out = {
  alpha_g1: g1(vk.vk_alpha_1),
  beta_g2: g2(vk.vk_beta_2),
  gamma_g2: g2(vk.vk_gamma_2),
  delta_g2: g2(vk.vk_delta_2),
  ic: vk.IC.map(g1),
};
console.log(JSON.stringify(out, null, 2));
