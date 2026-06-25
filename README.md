# Zerolyn — Compliant Private Payments on Stellar

> **Privacy by default, provability on demand.** Zerolyn hides amounts and balances
> with zero-knowledge proofs, while still letting auditors and regulators verify the
> truth on-chain. Built for **Stellar Hacks: Real-World ZK**.

Live demo: a multi-page web app in `index.html` + `assets/` (deploys to Vercel as a static site).
The Soroban contracts are **deployed and live on Stellar Testnet** — see the IDs below — and the
**Verify** page generates a real Groth16 proof in your browser and verifies it **on-chain**.

---

## ✅ Live on Stellar Testnet

All three Soroban contracts are deployed and callable on Testnet. Open any contract in the
explorer to see its deployment and invocations:

| Contract | ID | Explorer |
|---|---|---|
| **Verifier** (Groth16 / BLS12-381) | `CC47UVUPXER6VGOFZJWGIR4DQHMRA426NHLJDBGTPKA5C5HLG3LOB54Y` | [view](https://stellar.expert/explorer/testnet/contract/CC47UVUPXER6VGOFZJWGIR4DQHMRA426NHLJDBGTPKA5C5HLG3LOB54Y) |
| **Pool** (shielded transfers) | `CDKZPEIVUNGRGIYD6ZT4RWLZBERQX6MUO5FZVIIQP3FRPD67LM624NW3` | [view](https://stellar.expert/explorer/testnet/contract/CDKZPEIVUNGRGIYD6ZT4RWLZBERQX6MUO5FZVIIQP3FRPD67LM624NW3) |
| **ASP** (association-set allow-list) | `CDATVE3EWOOCTINRRF27GGH4MNHF7NUOAWJ6VY2SXHLXOWCZMGUTSZ3J` | [view](https://stellar.expert/explorer/testnet/contract/CDATVE3EWOOCTINRRF27GGH4MNHF7NUOAWJ6VY2SXHLXOWCZMGUTSZ3J) |

The verifier's **verifying key is installed on-chain** (via `set_vk` during deployment), so a
live `verify(proof, public_inputs)` call runs the real BLS12-381 pairing inside Stellar's host.
These IDs are wired into `assets/app.js → CONFIG`.

---

## Why this exists (the problem the hackathon is about)

Public blockchains expose everything — salaries, suppliers, balances. That kills real-world
adoption. But full anonymity blocks KYC/AML, so institutions can't use rails they can't verify.
Real money needs **both privacy and compliance at once**. Zerolyn closes exactly that gap
on Stellar, which exists to move real people's and institutions' money.

## What it does

| Module | What it proves (in zero knowledge) | Page |
|---|---|---|
| **On-chain verifier** | A real Groth16 proof is verified on-chain by a Soroban contract (BLS12-381 pairing in Stellar's host) | `verify.html` |
| **Shielded transfers** | A USDC/EURC/XLM transfer is valid & balances reconcile, amount hidden | `send.html` |
| **zkKYC identity** | You passed KYC, are 18+, and are not sanctioned — without revealing identity | `compliance.html` |
| **Selective disclosure** | A one-time auditor *view key* opens exactly one transaction | `compliance.html` |
| **Privacy pool / proof-of-innocence** | Your funds belong to a clean association set | `pools.html` |
| **Proof of reserves** | A custodian is solvent (reserves ≥ liabilities), balances hidden | `pools.html` |

> **Today, the full ZK path is real end-to-end on the `verify.html` page** (real prover → real
> on-chain verification). The other modules show the product experience with simulated,
> Groth16-shaped proofs and are clearly labelled **"(demo)"** in the UI. See the honesty section below.

Plus an **Ecosystem** page (`ecosystem.html`) mapping Zerolyn onto the Stellar stack
(USDC/EURC, Freighter, Albedo, Soroban, Horizon, CCTP, SEP standards, and the **Protocol 22**
BLS12-381 host functions this project relies on).

## How the ZK works

1. **Circuit** — `circuits/demo.circom` is a small Circom circuit compiled over the **bls12381** prime.
   It proves knowledge of a secret `x` such that `x³ + x + 5 == out`, where `out` is the only public input.
2. **Trusted setup / keys** — `scripts/setup.sh` runs the Groth16 setup with snarkjs and exports the
   proving key (`assets/zk/demo_final.zkey`), the WASM witness generator (`assets/zk/demo.wasm`), and the
   verifying key, which `scripts/vk_to_args.js` serializes for Soroban (uncompressed, big-endian).
3. **On-chain verifier** — `contracts/verifier/src/lib.rs` is a Soroban contract that runs the standard
   Groth16 equation `e(-A,B)·e(α,β)·e(vk_x,γ)·e(C,δ) == 1` using Stellar's native BLS12-381 host
   functions (`env.crypto().bls12_381()`: `g1_msm`, `g1_add`, `g1_mul`, `pairing_check`). **No stub.**
4. **In-browser proving + verification** — `verify.html` calls `snarkjs.groth16.fullProve` in the browser,
   then submits `verify(proof, public_inputs)` to the deployed contract via Soroban RPC. The pairing runs
   inside Stellar's host; you can optionally record it as a real on-chain transaction with Freighter.

## Key product features

- **Real Stellar address validation** — full StrKey base32 + CRC16 checksum check. Invalid
  addresses and secret keys (`S…`) are rejected; the app never reports a fake success.
- **Multi-wallet connect** — **Freighter** (desktop extension) and **Albedo** (works on mobile,
  no install needed). The indicator turns green only after a real connection. With no wallet present,
  a clearly-labelled demo wallet keeps the flow testable.
- **SEP-7 payment requests** — generate a `web+stellar:` QR any Stellar wallet can pay.
- **PDF compliance receipt** — download a real, Unicode-safe PDF receipt of each shielded transfer.
- **5 languages** — English, Español, Deutsch, Русский, Українська with native translations
  (technical terms like ZK, Groth16, Soroban, KYC are intentionally kept in English).
- **Blue/black dark UI** — a calm, institutional interface with zero audio and zero distractions.

---

## ⚠️ Exactly what is and isn't real (please read)

We keep the marketing honest. Here is the precise status:

**Real and verifiable**
- The verifier is real Rust/Soroban code (`contracts/verifier/src/lib.rs`) running a real **Groth16
  pairing check on BLS12-381** via Stellar's native host functions — there is **no stub and no placeholder**.
- It is **deployed on Stellar Testnet** (ID above) and its **verifying key is installed on-chain** via `set_vk`.
- `verify.html` does the whole path for real: it **generates a Groth16 proof in your browser** with snarkjs
  over the BLS12-381 circuit (`circuits/demo.circom`, artifacts in `assets/zk/`), then **verifies it on-chain**
  by calling the contract through Soroban RPC. The pairing actually executes inside Stellar's host, and you can
  optionally record a real on-chain transaction with Freighter.
- Address validation, multi-wallet connect (Freighter + Albedo), SEP-7 QR generation and the PDF receipt are
  real, working features.

**Demo / simulated (clearly labelled in the UI)**
- The circuit verified on-chain today is an intentionally small **demo circuit** (`x³ + x + 5 == out`). It proves
  the prove-in-browser → verify-on-chain **pipeline** is real, not the full payment statement.
- The **send / compliance / pools** pages illustrate the product UX with locally-generated, Groth16-shaped proof
  objects and are labelled **"(demo)"**. They do not yet produce real circuit proofs or settle value.
- The production shielded-transfer circuit (`circuits/transfer.circom`) plus a BLS12-381-correct Poseidon is the
  roadmap target that will let the payment pages use this same real verifier.

Nothing in the UI claims settled value, or an on-chain-verified proof it hasn't actually produced.

---

## Project structure

```
index.html            Home (hero, problem, features, how-it-works, ecosystem, roadmap, about)
send.html             Shielded transfer app (wallet, validation, proof pipeline, QR, PDF)
compliance.html       zkKYC + selective disclosure
pools.html            Privacy pool / proof-of-innocence + proof of reserves
verify.html           REAL in-browser prover + REAL on-chain verification
ecosystem.html        Stellar ecosystem & integrations
assets/
  styles.css          Design system (blue + black, dark)
  app.js              Core: config (live contract IDs), i18n, nav/footer, wallet, StrKey validation, QR
  send.js / compliance.js / pools.js / verify.js   Page logic
  i18n.en|es|de|ru|uk.js                            Translation dictionaries
  zk/                 Built prover artifacts (demo.wasm, demo_final.zkey, verification_key.json)
circuits/             Circom circuit(s): demo.circom (live), transfer.circom (roadmap)
contracts/            Soroban verifier / pool / ASP contracts (Rust)
scripts/              setup.sh, deploy.sh, vk_to_args.js, proof_to_args.js
docs/ARCHITECTURE.md  Architecture notes
```

## Run locally

It's a static site — no build step:

```bash
# any static server, e.g.
python3 -m http.server 8080
# then open http://localhost:8080
```

## Reproduce the Testnet deployment

1. Install the Stellar CLI and the Rust toolchain (`rustup target add wasm32v1-none`), plus `circom`, `snarkjs`, `jq`, and Node.
2. `bash scripts/setup.sh` — compiles `circuits/demo.circom` over bls12381, runs the Groth16 setup, and writes the prover artifacts to `assets/zk/` and the serialized verifying key.
3. `bash scripts/deploy.sh` — builds and deploys the verifier/ASP/pool contracts to **Stellar Testnet**, runs `init`, and calls `set_vk` to install the verifying key. Prints the contract IDs.
4. Put the printed IDs into `assets/app.js → CONFIG` (`verifierContractId`, `poolContractId`, `aspContractId`).

## Hackathon submission checklist

- [x] Public repository with clear README (this file)
- [x] Zero-knowledge is load-bearing (real Groth16 proof verified on-chain on Stellar Testnet)
- [x] Built on Stellar (Soroban BLS12-381 verifier, USDC/EURC, Freighter/Albedo, Horizon, SEP standards)
- [x] Soroban contracts deployed & callable on Stellar Testnet (IDs above)
- [ ] 2–3 minute demo video (record next; link it here and in the footer)
- [ ] Submit on DoraHacks before the deadline

## Author

Designed, built, and shipped solo by a 17-year-old developer — circuit, Soroban contracts,
and this interface. Socials are in the site footer (GitHub → X → Instagram).

## License

MIT — see `LICENSE`.
