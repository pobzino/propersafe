/* Propersafe cookie consent — pairs with the Consent Mode defaults set before GTM.
 * Stores the choice in localStorage ('ps_consent' = 'granted' | 'denied') and
 * sends a Google Consent Mode v2 update so GTM/GA only measure after opt-in. */
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

  if (stored()) return; // already chose; defaults snippet already re-applied it

  var bar = document.createElement("div");
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", "Cookie consent");
  bar.style.cssText =
    "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#0d1b2a;" +
    "color:#e8eef5;padding:16px 20px;display:flex;flex-wrap:wrap;gap:14px;" +
    "align-items:center;justify-content:center;font-size:14px;line-height:1.5;" +
    "font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;" +
    "box-shadow:0 -2px 18px rgba(0,0,0,.35)";

  var msg = document.createElement("p");
  msg.style.cssText = "margin:0;flex:1 1 320px;max-width:640px";
  msg.innerHTML =
    "We use cookies to measure traffic and improve the site. You can accept or " +
    'reject analytics cookies — see our <a href="/privacy" ' +
    'style="color:#9ec5ff;text-decoration:underline">Privacy Policy</a>.';

  var btns = document.createElement("div");
  btns.style.cssText = "display:flex;gap:8px;flex:0 0 auto";

  function mkBtn(label, primary) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.cssText =
      "cursor:pointer;border-radius:8px;padding:10px 18px;font-size:14px;" +
      "font-weight:600;border:1px solid " + (primary ? "#2f6fed" : "#3a4a5e") +
      ";background:" + (primary ? "#2f6fed" : "transparent") +
      ";color:" + (primary ? "#fff" : "#e8eef5") + ";";
    return b;
  }

  var reject = mkBtn("Reject", false);
  var accept = mkBtn("Accept", true);

  function close() {
    if (bar.parentNode) bar.parentNode.removeChild(bar);
  }
  reject.addEventListener("click", function () { save("denied"); apply(false); close(); });
  accept.addEventListener("click", function () { save("granted"); apply(true); close(); });

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
