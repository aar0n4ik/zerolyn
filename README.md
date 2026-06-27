# Zerolyn — Compliant Private Payments on Stellar

> **Privacy by default, provability on demand.** Zerolyn hides amounts and balances
> with zero-knowledge proofs, while still letting auditors and regulators verify the
> truth on-chain. Built for **Stellar Hacks: Real-World ZK**.

Live demo: a multi-page web app in `index.html` + `assets/` (deploys to Vercel as a static site).
The Soroban contracts are **deployed and live on Stellar Testnet** — see the IDs below — and both the
**Verify** page and the **Send** page generate a real Groth16 proof in your browser and verify it **on-chain**.

---

## ✅ Live on Stellar Testnet

All three Soroban contracts are deployed and callable on Testnet. Open any contract in the
explorer to see its deployment and invocations:

| Contract | ID | Explorer |
|---|---|---|
| **Verifier** (Groth16 / BLS12-381) | `CC47UVUPXER6VGOFZJWGIR4DQHMRA426NHLJDBGTPKA5C5HLG3LOB54Y` | [view](https://stellar.expert/explorer/testnet/contract/CC47UVUPXER6VGOFZJWGIR4DQHMRA426NHLJDBGTPKA5C5HLG3LOB54Y) |
| **Pool** (shielded transfers — roadmap) | `CDKZPEIVUNGRGIYD6ZT4RWLZBERQX6MUO5FZVIIQP3FRPD67LM624NW3` | [view](https://stellar.expert/explorer/testnet/contract/CDKZPEIVUNGRGIYD6ZT4RWLZBERQX6MUO5FZVIIQP3FRPD67LM624NW3) |
| **ASP** (association-set allow-list — roadmap) | `CDATVE3EWOOCTINRRF27GGH4MNHF7NUOAWJ6VY2SXHLXOWCZMGUTSZ3J` | [view](https://stellar.expert/explorer/testnet/contract/CDATVE3EWOOCTINRRF27GGH4MNHF7NUOAWJ6VY2SXHLXOWCZMGUTSZ3J) |

The verifier's **verifying key is installed on-chain** (via `set_vk`), so a live
`verify(proof, public_inputs)` call runs the real BLS12-381 pairing inside Stellar's host.
These IDs are wired into `assets/app.js → CONFIG`.

> **Note on scope:** the live, on-chain-verified ZK path is the **Verifier** + `circuits/transfer.circom`
> (a real Groth16 proof of solvency + compliance, checked by the BLS12-381 pairing). The **Pool** and
> **ASP** contracts are deployed scaffolding for the **shielded-pool roadmap** (Poseidon commitments /
> nullifiers / Merkle membership) and are **not yet on the verified path** — see the honesty section.

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
| **Compliant transfer** | A transfer's hidden amount is `>= 1`, `<=` your hidden balance (solvency), and `<=` a public compliance limit — verified on-chain | `send.html` |
| **zkKYC identity** (demo) | You passed KYC, are 18+, and are not sanctioned — without revealing identity | `compliance.html` |
| **Selective disclosure** (demo) | A one-time auditor *view key* opens exactly one transaction | `compliance.html` |
| **Privacy pool / proof-of-innocence** (demo) | Your funds belong to a clean association set | `pools.html` |
| **Proof of reserves** (demo) | A custodian is solvent (reserves ≥ liabilities), balances hidden | `pools.html` |

> **The full ZK path is real end-to-end on two pages today:** `verify.html` (real prover → real
> on-chain verification) and `send.html`, where the **"Prove this transfer"** action generates a real
> Groth16 proof for the amount you entered and **verifies it on-chain**. The send page also performs a
> real Stellar Testnet payment. The `compliance.html` / `pools.html` modules show the product experience
> with simulated, Groth16-shaped proofs and are clearly labelled **"(demo)"** in the UI. See the honesty section below.

Plus an **Ecosystem** page (`ecosystem.html`) mapping Zerolyn onto the Stellar stack
(USDC/EURC, Freighter, Albedo, Soroban, Horizon, CCTP, SEP standards, and the **Protocol 22**
BLS12-381 host functions this project relies on).

## How the ZK works

1. **Circuit** — `circuits/transfer.circom` is a Circom circuit compiled over the **bls12381** prime.
   It proves, in zero knowledge, that a transfer is **solvent and compliant** without revealing the numbers:
   private `amount` and `balance`, public `limit`, with constraints `amount >= 1`, `amount <= balance`
   (solvency) and `amount <= limit` (compliance). Range checks use circomlib's field-agnostic comparators
   (`Num2Bits` + arithmetic), so **no curve-specific Poseidon is required** — it runs on BLS12-381 today.
2. **Trusted setup / keys** — `scripts/setup.sh` runs the Groth16 setup with snarkjs and exports the
   proving key (`assets/zk/transfer_final.zkey`), the WASM witness generator (`assets/zk/transfer.wasm`), and the
   verifying key, which `scripts/vk_to_args.js` serializes for Soroban (uncompressed, big-endian).
3. **On-chain verifier** — `contracts/verifier/src/lib.rs` is a Soroban contract that runs the standard
   Groth16 equation `e(-A,B)·e(α,β)·e(vk_x,γ)·e(C,δ) == 1` using Stellar's native BLS12-381 host
   functions (`env.crypto().bls12_381()`: `g1_msm`, `g1_add`, `g1_mul`, `pairing_check`). **No stub.** It reads
   the public inputs generically, so the same contract verifies any circuit whose verifying key is installed.
4. **In-browser proving + verification** — `verify.html` and `send.html` call `snarkjs.groth16.fullProve` in
   the browser, then submit `verify(proof, public_inputs)` to the deployed contract via Soroban RPC. The pairing
   runs inside Stellar's host; you can optionally record it as a real on-chain transaction with Freighter.

## Key product features

- **Real Stellar address validation** — full StrKey base32 + CRC16 checksum check. Invalid
  addresses and secret keys (`S…`) are rejected; the app never reports a fake success.
- **Multi-wallet connect** — **Freighter** on desktop (browser extension) and **Freighter Mobile** on phones
  via **WalletConnect v2 / Reown** (`assets/walletconnect.js`), so the app opens automatically to link the page.
  The indicator turns green only after a real connection.
- **SEP-7 payment requests** — generate a `web+stellar:` QR any Stellar wallet can pay.
- **PDF compliance receipt** — download a real, Unicode-safe PDF receipt of each transfer.
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
- The on-chain circuit is a **meaningful compliance + solvency statement** (`circuits/transfer.circom`):
  it proves a hidden `amount` is `>= 1`, `<=` a hidden `balance`, and `<=` a public `limit`. Only the limit is public.
- `verify.html` does the whole path for real: it **generates a Groth16 proof in your browser** with snarkjs
  over that BLS12-381 circuit (artifacts in `assets/zk/`), then **verifies it on-chain** by calling the contract
  through Soroban RPC. The pairing actually executes inside Stellar's host; you can optionally record a real tx.
- `send.html` does **two real things**: (1) a real Stellar Testnet payment signed in your wallet and submitted via
  Horizon (real tx hash), and (2) **"Prove this transfer"**, which builds a real Groth16 proof for the amount you
  entered (hidden) against your balance (hidden) and the public compliance limit, and **verifies it on-chain**.
- Address validation, wallet connect (Freighter desktop + Freighter Mobile via WalletConnect), SEP-7 QR and the PDF receipt are real features.

**Demo / simulated (clearly labelled in the UI)**
- The **compliance / pools** pages illustrate the product UX with locally-generated, Groth16-shaped proof objects
  and are labelled **"(demo)"**. They do not yet produce real circuit proofs.
- The public Stellar payment on `send.html` is transparent by design; the ZK proof attached to it demonstrates the
  compliance+solvency statement, but a **fully shielded transfer** — hiding sender/recipient and settling value
  inside the pool via Poseidon commitments/nullifiers and a Merkle membership proof — is the **roadmap target**
  (`circuits/transfer.circom` here covers the amount/solvency/compliance portion; the commitment layer needs a
  BLS12-381-correct Poseidon). The **Pool** and **ASP** contracts are deployed scaffolding for that roadmap.
- **Witness binding (roadmap):** the proof's `amount` and `balance` are **prover-supplied private witnesses**. The
  circuit *soundly* proves `amount >= 1`, `amount <= balance`, and `amount <= limit`, but it does **not yet read your
  real on-chain balance or bind the proof to the specific Stellar payment** (recipient/asset/amount). The browser
  prover uses your displayed balance when known and **refuses** an amount above it (instead of fabricating
  `balance = amount`). Binding the proof to settlement — a public payment commitment, or proving inside the pool's
  `transfer` — is the top roadmap item. See `docs/ARCHITECTURE.md` §6.

Nothing in the UI claims settled shielded value, or an on-chain-verified proof it hasn't actually produced.

---

## Project structure

```
index.html            Home (hero, problem, features, how-it-works, ecosystem, roadmap, about)
send.html             Real Testnet payment + REAL on-chain ZK proof of the transfer (wallet, validation, QR, PDF)
compliance.html       zkKYC + selective disclosure (demo)
pools.html            Privacy pool / proof-of-innocence + proof of reserves (demo)
verify.html           REAL in-browser prover + REAL on-chain verification
ecosystem.html        Stellar ecosystem & integrations
assets/
  styles.css          Design system (blue + black, dark)
  app.js              Core: config (live contract IDs), i18n, nav/footer, wallet, StrKey validation, QR
  send.js             Send page: real Stellar payments (Freighter desktop + Freighter Mobile via WalletConnect)
  walletconnect.js    Freighter Mobile connect via WalletConnect v2 / Reown (window.SPWC)
  sendzk.js           Send page: real Groth16 proof of the transfer + on-chain verification
  verify.js / compliance.js / pools.js              Page logic
  i18n.en|es|de|ru|uk.js                            Translation dictionaries
  zk/                 Built prover artifacts (transfer.wasm, transfer_final.zkey, verification_key.json)
circuits/             Circom circuits: transfer.circom (live on-chain circuit), demo.circom (minimal example)
contracts/            Soroban verifier (live) / pool / ASP (roadmap scaffolding) contracts (Rust)
scripts/              setup.sh, deploy.sh, vk_to_args.js, proof_to_args.js
docs/ARCHITECTURE.md  Architecture notes
```

> **Naming:** the product and on-chain brand is **Zerolyn**. The Git repository is named `shieldplay`
> and the compiled Soroban wasm crates/artifacts are still named `shieldpay_*` (see `scripts/deploy.sh`).
> These are legacy build names for the *same* contracts; the crate rename is purely cosmetic and is deferred
> to avoid churning the already-deployed-and-verified build. When you rename, update the crate `name` in each
> `contracts/*/Cargo.toml`, the wasm paths in `scripts/deploy.sh`, and any `contractimport!` macro path.

## Run locally

It's a static site — no build step:

```bash
# any static server, e.g.
python3 -m http.server 8080
# then open http://localhost:8080
```

## Reproduce the Testnet deployment

1. Install the Stellar CLI and the Rust toolchain (`rustup target add wasm32v1-none`), plus `circom`, `snarkjs`, `jq`, and Node.
2. `bash scripts/setup.sh` — compiles `circuits/transfer.circom` over bls12381 (with circomlib), runs the Groth16 setup, and writes the prover artifacts to `assets/zk/` and the serialized verifying key.
3. `bash scripts/deploy.sh` — builds and deploys the verifier/ASP/pool contracts to **Stellar Testnet**, runs `init`, and calls `set_vk` to install the verifying key. Prints the contract IDs. (To update only the key on the existing verifier, skip the deploy and run the `set_vk` invoke printed by `setup.sh`.)
4. Put the printed IDs into `assets/app.js → CONFIG` (`verifierContractId`, `poolContractId`, `aspContractId`).

## Verify it yourself (no trust required)

- Open the **Verifier** contract in the explorer (link above) and inspect its `verify` invocations.
- On `verify.html`, generate a proof in your browser and watch it return `true` from the on-chain `verify` call via Soroban RPC.
- On `send.html`, send a real Testnet payment and open the resulting tx hash on Stellar Expert.

## Hackathon submission checklist

- [x] Public repository with clear README (this file)
- [x] Zero-knowledge is load-bearing (real Groth16 proof verified on-chain on Stellar Testnet)
- [x] The on-chain circuit is meaningful (compliance + solvency), not a toy
- [x] Built on Stellar (Soroban BLS12-381 verifier, USDC/EURC, Freighter/WalletConnect, Horizon, SEP standards)
- [x] Soroban contracts deployed & callable on Stellar Testnet (IDs above)
- [ ] Submit on DoraHacks before the deadline

## Author

Designed, built, and shipped solo by a 17-year-old developer — circuit, Soroban contracts,
and this interface. Socials are in the site footer (GitHub → X → Instagram).

## License

MIT — see `LICENSE`.
