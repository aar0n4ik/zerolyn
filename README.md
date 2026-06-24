# Veyndra — Compliant Private Payments on Stellar

> **Privacy by default, provability on demand.** Veyndra hides amounts and balances
> with zero-knowledge proofs, while still letting auditors and regulators verify the
> truth on-chain. Built for **Stellar Hacks: Real-World ZK**.

Live demo: a multi-page web app in `index.html` + `assets/` (deploys to Vercel as a static site).

---

## Why this exists (the problem the hackathon is about)

Public blockchains expose everything — salaries, suppliers, balances. That kills real-world
adoption. But full anonymity blocks KYC/AML, so institutions can't use rails they can't verify.
Real money needs **both privacy and compliance at once**. Veyndra closes exactly that gap
on Stellar, which exists to move real people's and institutions' money.

## What it does

| Module | What it proves (in zero knowledge) | Page |
|---|---|---|
| **Shielded transfers** | A USDC/EURC/XLM transfer is valid & balances reconcile, amount hidden | `send.html` |
| **zkKYC identity** | You passed KYC, are 18+, and are not sanctioned — without revealing identity | `compliance.html` |
| **Selective disclosure** | A one-time auditor *view key* opens exactly one transaction | `compliance.html` |
| **Privacy pool / proof-of-innocence** | Your funds belong to a clean association set | `pools.html` |
| **Proof of reserves** | A custodian is solvent (reserves ≥ liabilities), balances hidden | `pools.html` |
| **On-chain verifier** | Any proof is checked by a Soroban contract on Stellar Testnet | `verify.html` |

Plus an **Ecosystem** page (`ecosystem.html`) mapping Veyndra onto the Stellar stack
(USDC/EURC, Freighter, Soroban, Horizon, CCTP, MoneyGram, SEP standards, Protocol 25 "X-Ray").

## Key product features

- **Real Stellar address validation** — full StrKey base32 + CRC16 checksum check. Invalid
  addresses and secret keys (`S…`) are rejected; the app never reports a fake success.
- **Honest wallet state** — the "connected" indicator only turns green after a real Freighter
  connection. No wallet = no green light, no send.
- **SEP-7 payment requests** — generate a `web+stellar:` QR any Stellar wallet can pay.
- **PDF compliance receipt** — download a real, Unicode-safe PDF receipt of each shielded transfer.
- **5 languages** — English, Español, Deutsch, Русский, Українська with native translations
  (technical terms like ZK, Groth16, Soroban, KYC are intentionally kept in English).
- **Pleasant audio feedback** — contextual Web Audio cues (mutable, with a startup chime).

---

## ⚠️ Honesty about demo data (please read)

This is a hackathon prototype. To keep the demo runnable in any browser **without a funded
account**, the proving/verification pipeline runs in **demo mode** by default:

- ZK proofs shown in the UI are **Groth16/bn254-shaped mock objects** generated client-side.
- On-chain verification is **simulated** and shows a sample transaction hash **until you
  deploy the real verifier** and fill in the contract IDs (see below).
- The privacy circuits and Soroban verifier/pool contracts live in `circuits/` and
  `contracts/` and are real Rust/Circom sources intended for testnet deployment.

When `assets/app.js → CONFIG.verifierContractId` (and friends) are filled in, the verify page
labels the real contract and links the real transaction. Nothing in the UI claims to have
settled value that it hasn't.

---

## Project structure

```
index.html            Home (hero, problem, features, how-it-works, ecosystem, roadmap, about)
send.html             Shielded transfer app (wallet, validation, proof pipeline, QR, PDF)
compliance.html       zkKYC + selective disclosure
pools.html            Privacy pool / proof-of-innocence + proof of reserves
verify.html           Proof verifier (local structure + on-chain)
ecosystem.html        Stellar ecosystem & integrations
assets/
  styles.css          Design system (white + colorful)
  app.js              Core: i18n, sound, nav/footer, Freighter wallet, StrKey validation, QR
  send.js / compliance.js / pools.js / verify.js   Page logic
  i18n.en|es|de|ru|uk.js                            Translation dictionaries (244 keys each)
circuits/             Circom circuit(s)
contracts/            Soroban verifier / pool / ASP contracts (Rust)
scripts/              setup.sh, deploy.sh, vk_to_args.js
docs/ARCHITECTURE.md  Architecture notes
```

## Run locally

It's a static site — no build step:

```bash
# any static server, e.g.
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy (Vercel)

The repo includes `vercel.json` (`cleanUrls`, no trailing slash). Import the repo in Vercel
and deploy — the root `index.html` is served directly. No environment variables required for
the demo.

## Going live on Testnet (optional, for real proofs)

1. Install the Stellar CLI and Rust toolchain.
2. `bash scripts/setup.sh` — compiles the circuit and builds the Soroban contracts.
3. `bash scripts/deploy.sh` — deploys the verifier/pool contracts to **Stellar Testnet**
   and prints their contract IDs.
4. Paste those IDs into `assets/app.js → CONFIG.verifierContractId` / `poolContractId`.
5. Reload `verify.html` — proofs are now checked on-chain with a real transaction hash.

## Hackathon submission checklist

- [x] Public repository with clear README (this file)
- [x] Zero-knowledge is load-bearing (privacy + selective disclosure + proof of reserves)
- [x] Built on Stellar (Soroban verifier, USDC/EURC, Freighter, Horizon, SEP standards)
- [ ] 2–3 minute demo video (record after deploy; link it here and in the footer)
- [ ] Submit on DoraHacks before the deadline

## Author

Designed, built, and shipped solo by a 17-year-old developer — circuits, Soroban contracts,
and this interface. Socials are in the site footer (GitHub → X → Instagram).

## License

MIT — see `LICENSE`.
