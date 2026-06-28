const fs = require("fs");
const F = "assets/sendzk.js";
let s = fs.readFileSync(F, "utf8");
function rep(oldStr, newStr){
  if (s.indexOf(oldStr) < 0){ console.error("ERROR: anchor not found:\n"+oldStr); process.exit(1); }
  s = s.replace(oldStr, newStr);
}

// (1) после успешной проверки: если баланс НЕ реальный -> явно пометить demo-платёжеспособность
rep(
  "    if(realBal) line('mut',t('zk_balreal'));",
  "    if(realBal) line('mut',t('zk_balreal')); else line('warn',t('zk_demo_solv'));"
);

// (2) i18n: ключ zk_demo_solv во все 5 языков
rep("zk_paytx:'Payment transaction'});",
    "zk_paytx:'Payment transaction',zk_demo_solv:'Demo: solvency uses a placeholder balance (balance set equal to amount) — connect Freighter and send a real payment to prove it against your real on-chain balance.'});");
rep("zk_paytx:'Транзакция платежа'});",
    "zk_paytx:'Транзакция платежа',zk_demo_solv:'Демо: платёжеспособность использует условный баланс (баланс равен сумме) — подключите Freighter и отправьте реальный платёж, чтобы доказать её против вашего реального ончейн-баланса.'});");
rep("zk_paytx:'Transacción de pago'});",
    "zk_paytx:'Transacción de pago',zk_demo_solv:'Demo: la solvencia usa un saldo de marcador de posición (saldo igual al importe) — conecta Freighter y envía un pago real para probarla contra tu saldo on-chain real.'});");
rep("zk_paytx:'Zahlungstransaktion'});",
    "zk_paytx:'Zahlungstransaktion',zk_demo_solv:'Demo: Solvenz nutzt einen Platzhalter-Kontostand (Kontostand gleich Betrag) — verbinde Freighter und sende eine echte Zahlung, um sie gegen dein echtes On-Chain-Guthaben zu beweisen.'});");
rep("zk_paytx:'Транзакція платежу'});",
    "zk_paytx:'Транзакція платежу',zk_demo_solv:'Демо: платоспроможність використовує умовний баланс (баланс дорівнює сумі) — підключіть Freighter і надішліть реальний платіж, щоб довести її проти вашого реального ончейн-балансу.'});");

fs.writeFileSync(F, s);
console.log("OK patched", F);
console.log("disclosure line present:", s.indexOf("else line('warn',t('zk_demo_solv'));") >= 0);
console.log("zk_demo_solv defs (expect 5):", (s.match(/zk_demo_solv:/g) || []).length);
