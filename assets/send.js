/* Zerolyn — send.js bootstrap.
   The deployed assets/send.js kept getting truncated on push, which broke the
   whole send page (script failed to parse, so the Connect button did nothing).
   To stay reliable, the full send-page script is loaded from a pinned, immutable
   CDN copy (jsDelivr @ commit ab81187 — a complete 46.5KB build) so the live page
   always runs a full, untruncated script.
   Behaviour of that build: desktop = Freighter browser extension (detect & use it;
   if missing, show an "Install Freighter" modal linking to https://www.freighter.app/);
   phone = Freighter Mobile via WalletConnect.
   This loader runs as a normal parser-blocking script, so document.write injects
   the real script synchronously, before sendzk.js / send-lux.js, preserving order. */
document.write('<script src="https://cdn.jsdelivr.net/gh/aar0n4ik/shieldplay@ab81187f6045f4affeddfce54b3507a713cb8c55/assets/send.js"><\/script>');
