/*
 * Propersafe analytics loader.
 *
 * To activate: create a PostHog project for Propersafe and paste its
 * project API key below (Settings → Project → Project API key).
 * Until a key is set, psTrack() is a safe no-op everywhere.
 */
(function () {
  var POSTHOG_KEY = ""; // e.g. "phc_XXXXXXXX"
  var POSTHOG_HOST = "https://us.i.posthog.com";

  window.psTrack = function (event, props) {
    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(event, props || {});
    }
  };

  if (!POSTHOG_KEY) return;

  var script = document.createElement("script");
  script.src = POSTHOG_HOST + "/static/array.js";
  script.async = true;
  script.onload = function () {
    if (window.posthog && typeof window.posthog.init === "function") {
      window.posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST });
    }
  };
  document.head.appendChild(script);
})();
