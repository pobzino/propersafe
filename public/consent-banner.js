/* Propersafe cookie consent — pairs with the Consent Mode defaults set before GTM.
 * Stores the choice in localStorage ('ps_consent' = 'granted' | 'denied'),
 * sends a Google Consent Mode v2 update so GTM/GA only measure after opt-in, and
 * loads the Meta Pixel only after consent (Meta isn't covered by Consent Mode). */
(function () {
  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }
  function stored() {
    try { return localStorage.getItem("ps_consent"); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem("ps_consent", v); } catch (e) {}
  }
  function apply(granted) {
    var state = granted ? "granted" : "denied";
    gtag("consent", "update", {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
  }

  /* Meta Pixel — loaded only after the visitor grants consent (Meta isn't governed
   * by Google Consent Mode, so it's gated here). Idempotent: safe to call twice. */
  function loadMetaPixel() {
    if (window.__psMetaPixel) return;
    window.__psMetaPixel = true;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", "1024632820076738");
    fbq("track", "PageView");
  }

  var choice = stored();
  if (choice === "granted") loadMetaPixel(); // returning visitor who already opted in
  if (choice) return; // already chose; defaults snippet already re-applied it

  var bar = document.createElement("div");
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", "Cookie consent");
  bar.style.cssText =
    "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;" +
    "background:rgba(21,18,14,0.96);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);" +
    "border-top:1px solid rgba(196,145,56,0.30);color:rgba(255,249,239,0.82);" +
    "padding:16px 24px;display:flex;flex-wrap:wrap;gap:16px;" +
    "align-items:center;justify-content:center;font-size:14px;line-height:1.55;" +
    "font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;" +
    "box-shadow:0 -8px 30px rgba(0,0,0,.35)";

  var msg = document.createElement("p");
  msg.style.cssText = "margin:0;flex:1 1 320px;max-width:640px";
  msg.innerHTML =
    "We use cookies to measure traffic and improve Propersafe. You can accept or " +
    'reject analytics cookies — see our <a href="/privacy" ' +
    'style="color:#c49138;text-decoration:underline;font-weight:500">Privacy Policy</a>.';

  var btns = document.createElement("div");
  btns.style.cssText = "display:flex;gap:10px;flex:0 0 auto";

  function mkBtn(label, primary) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.cssText =
      "cursor:pointer;border-radius:999px;padding:11px 24px;font-size:13px;" +
      "font-weight:600;letter-spacing:0.02em;transition:background .2s ease,border-color .2s ease;" +
      "border:1px solid " + (primary ? "#fff9ef" : "rgba(255,249,239,0.30)") +
      ";background:" + (primary ? "#fff9ef" : "transparent") +
      ";color:" + (primary ? "#15120e" : "rgba(255,249,239,0.82)") + ";";
    b.onmouseenter = function () {
      b.style.background = primary ? "#e8dcc8" : "rgba(255,249,239,0.08)";
    };
    b.onmouseleave = function () {
      b.style.background = primary ? "#fff9ef" : "transparent";
    };
    return b;
  }

  var reject = mkBtn("Reject", false);
  var accept = mkBtn("Accept", true);

  function close() {
    if (bar.parentNode) bar.parentNode.removeChild(bar);
  }
  reject.addEventListener("click", function () { save("denied"); apply(false); close(); });
  accept.addEventListener("click", function () { save("granted"); apply(true); loadMetaPixel(); close(); });

  btns.appendChild(reject);
  btns.appendChild(accept);
  bar.appendChild(msg);
  bar.appendChild(btns);

  function mount() {
    document.body.appendChild(bar);
    accept.focus();
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
