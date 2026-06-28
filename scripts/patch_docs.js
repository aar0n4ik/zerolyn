const fs = require('fs');
const path = 'docs/ARCHITECTURE.md';
let s = fs.readFileSync(path, 'utf8');
const edits = [
  { name: 'init authorization',
    old: "- **Verifier `init` front-running.** `init` records the admin on first call and is not access-controlled, so on a *fresh* deployment anyone could call it before the operator and then `set_vk`. The live contract is already initialized with the key installed, so this is a deployment-time hardening note: make `init` require the deployer's auth or fold it into a constructor.",
    new: "- **Verifier `init` authorization.** `init` is one-time and **access-controlled**: it calls `admin.require_auth()`, so the admin role cannot be front-run by a third party racing the first call (`set_vk` likewise requires the stored admin's auth). The live contract is already initialized with the key installed." },
  { name: 'demo-wallet disclosure',
    old: "- **Demo-wallet balance fallback.** When no real balance is available (e.g. the clearly-labelled demo wallet), the send page proves the entered amount as a labelled demo rather than against a real balance.",
    new: "- **Demo-wallet balance fallback.** When no real balance is available (e.g. the clearly-labelled demo wallet), the send page proves the entered amount as a labelled demo rather than against a real balance, and now shows an explicit on-screen notice that demo solvency uses a placeholder balance (balance set equal to amount)." }
];
for (const e of edits) {
  if (!s.includes(e.old)) { console.error('ANCHOR NOT FOUND: ' + e.name); process.exit(1); }
  s = s.replace(e.old, e.new);
  console.log('patched: ' + e.name);
}
fs.writeFileSync(path, s);
console.log('init now access-controlled:', s.includes('`init` is one-time and **access-controlled**'));
console.log('stale "not access-controlled" gone:', !s.includes('is not access-controlled'));
console.log('demo disclosure present:', s.includes('explicit on-screen notice that demo solvency uses a placeholder balance'));
