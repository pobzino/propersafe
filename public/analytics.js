/*
 * Propersafe analytics loader.
 * PostHog project: "Propersafe" (id 489885, US Cloud).
 */
(function () {
  var POSTHOG_KEY = "phc_z4Rw9zTmWxezCsZtHAQFD7Zz5gkGuTJm4EY9hjnrcheB";
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
