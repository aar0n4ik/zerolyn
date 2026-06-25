# Zerolyn — Compliant Private Payments on Stellar

> **Privacy by default, provability on demand.** Zerolyn hides amounts and balances
> with zero-knowledge proofs, while still letting auditors and regulators verify the
> truth on-chain. Built for **Stellar Hacks: Real-World ZK**.

Live demo: a multi-page web app in `index.html` + `assets/` (deploys to Vercel as a static site).
The Soroban contracts are **deployed and live on Stellar Testnet** — see the IDs below.

---

## ✅ Live on Stellar Testnet

All three Soroban contracts are deployed and callable on Testnet:

| Contract | ID | Explorer |
|---|---|---|
| **Verifier** (Groth16) | `CC47UVUPXER6VGOFZJWGIR4DQHMRA426NHLJDBGTPKA5C5HLG3LOB54Y` | [view](https://stellar.expert/explorer/testnet/contract/CC47UVUPXER6VGOFZJWGIR4DQHMRA426NHLJDBGTPKA5C5HLG3LOB54Y) |
| **Pool** (shielded transfers) | `CDKZPEIVUNGRGIYD6ZT4RWLZBERQX6MUO5FZVIIQP3FRPD67LM624NW3` | [view](https://stellar.expert/explorer/testnet/contract/CDKZPEIVUNGRGIYD6ZT4RWLZBERQX6MUO5FZVIIQP3FRPD67LM624NW3) |
| **ASP** (association-set allow-list) | `CDATVE3EWOOCTINRRF27GGH4MNHF7NUOAWJ6VY2SXHLXOWCZMGUTSZ3J` | [view](https://stellar.expert/explorer/testnet/contract/CDATVE3EWOOCTINRRF27GGH4MNHF7NUOAWJ6VY2SXHLXOWCZMGUTSZ3J) |

- **Admin / deployer:** `GCY6UL7B6P5LNOEGAU2FULWNX6Q6RZFN4QUW2DC5CY26J6DKR6GFRJBE`
- **Verifier deploy tx:** [`40542a58…1566e`](https://stellar.expert/explorer/testnet/tx/40542a580b4c09a91747cabb9ab629a06b88627a044d62d9c2cca5d5a1b1566e)
- **ASP deploy tx:** [`52accf54…d62cc`](https://stellar.expert/explorer/testnet/tx/52accf549bf64fb285e0eb9f7719c033b408f57fa9c0e77926395fe9428d62cc)
- **Pool deploy tx:** [`ba3be885…7a94f132`](https://stellar.expert/explorer/testnet/tx/ba3be88538c0b7fd5e6064bccc4ca1542384e21ae37803d921b03faa7b94f132)

These IDs are wired into `assets/app.js → CONFIG`, so the site links the real contracts and a real on-chain transaction.

---

## Why this exists (the problem the hackathon is about)

Public blockchains expose everything — salaries, suppliers, balances. That kills real-world
adoption. But full anonymity blocks KYC/AML, so institutions can't use rails they can't verify.
Real money needs **both privacy and compliance at once**. Zerolyn closes exactly that gap
on Stellar, which exists to move real people's and institutions' money.

## What it does

| Module | What it proves (in zero knowledge) | Page |
|---|---|---|
| **Shielded transfers** | A USDC/EURC/XLM transfer is valid & balances reconcile, amount hidden | `send.html` |
| **zkKYC identity** | You passed KYC, are 18+, and are not sanctioned — without revealing identity | `compliance.html` |
| **Selective disclosure** | A one-time auditor *view key* opens exactly one transaction | `compliance.html` |
| **Privacy pool / proof-of-innocence** | Your funds belong to a clean association set | `pools.html` |
| **Proof of reserves** | A custodian is solvent (reserves ≥ liabilities), balances hidden | `pools.html` |
| **On-chain verifier** | A Soroban verifier contract is deployed & callable on Stellar Testnet | `verify.html` |

Plus an **Ecosystem** page (`ecosystem.html`) mapping Zerolyn onto the Stellar stack
(USDC/EURC, Freighter, Soroban, Horizon, CCTP, MoneyGram, SEP standards, Protocol 25 "X-Ray").

## Key product features

- **Real Stellar address validation** — full StrKey base32 + CRC16 checksum check. Invalid
  addresses and secret keys (`S…`) are rejected; the app never reports a fake success.
- **Honest wallet state** — the "connected" indicator turns green after a real Freighter
  connection; with no extension it connects a clearly-labelled **demo wallet** so the flow stays testable.
- **SEP-7 payment requests** — generate a `web+stellar:` QR any Stellar wallet can pay.
- **PDF compliance receipt** — download a real, Unicode-safe PDF receipt of each shielded transfer.
- **5 languages** — English, Español, Deutsch, Русский, Українська with native translations
  (technical terms like ZK, Groth16, Soroban, KYC are intentionally kept in English).
- **Blue/black dark UI** — a calm, institutional interface with zero audio and zero distractions.

---

## ⚠️ Exactly what is and isn't real (please read)

We keep the marketing honest. Here is the precise status:

**Real and verifiable**
- The verifier, pool and ASP contracts are **deployed and callable on Stellar Testnet** (IDs + txs above) — anyone can open them in the explorer.
- The contracts are real Rust/Soroban code (`contracts/`) and the Circom circuit lives in `circuits/`.
- Address validation, wallet connection, SEP-7 QR generation and the PDF receipt are real, working features.

**Demo / not yet real (clearly labelled in the UI)**
- The ZK proofs shown in the browser are **Groth16/bn254-shaped objects generated client-side** — the in-browser flow is a **simulation** of the proving pipeline, not a live prover.
- The site **does not submit a transaction per transfer/verification**; the "send" and "verify" pages link the **real verifier contract and its real deployment transaction** so every link resolves, and the UI labels these as demo / simulated.
- The verifier's on-chain pairing is a **placeholder**: full BN254 pairing depends on Stellar's BN254 host functions (planned for Protocol 25/26). Today the contract performs structural Groth16 checks; `set_vk` has not been called, so a live `verify` call would return `NotInitialized`.

Nothing in the UI claims to have settled value or verified a proof on-chain that it hasn't.

---

## Project structure

```
index.html            Home (hero, problem, features, how-it-works, ecosystem, roadmap, about)
send.html             Shielded transfer app (wallet, validation, proof pipeline, QR, PDF)
compliance.html       zkKYC + selective disclosure
pools.html            Privacy pool / proof-of-innocence + proof of reserves
verify.html           Proof verifier (local structure + live contract link)
ecosystem.html        Stellar ecosystem & integrations
assets/
  styles.css          Design system (blue + black, dark)
  app.js              Core: config (live contract IDs), i18n, nav/footer, Freighter wallet, StrKey validation, QR
  send.js / compliance.js / pools.js / verify.js   Page logic
  i18n.en|es|de|ru|uk.js                            Translation dictionaries
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
and deploy — the root `index.html` is served directly. No environment variables required.

## Reproduce the Testnet deployment

1. Install the Stellar CLI (`cargo binstall stellar-cli`) and the Rust toolchain (`rustup target add wasm32v1-none`).
2. `bash scripts/setup.sh` — compiles the circuit and prepares the proving/verification keys.
3. `bash scripts/deploy.sh` — builds and deploys the verifier/ASP/pool contracts to **Stellar Testnet** and prints their contract IDs.
4. The printed IDs are already wired into `assets/app.js → CONFIG`. Replace them there if you redeploy.

## Hackathon submission checklist

- [x] Public repository with clear README (this file)
- [x] Zero-knowledge is load-bearing (privacy + selective disclosure + proof of reserves)
- [x] Built on Stellar (Soroban verifier, USDC/EURC, Freighter, Horizon, SEP standards)
- [x] Soroban contracts deployed & callable on Stellar Testnet (IDs above)
- [ ] 2–3 minute demo video (record next; link it here and in the footer)
- [ ] Submit on DoraHacks before the deadline

## Author

Designed, built, and shipped solo by a 17-year-old developer — circuits, Soroban contracts,
and this interface. Socials are in the site footer (GitHub → X → Instagram).

## License

MIT — see `LICENSE`.
