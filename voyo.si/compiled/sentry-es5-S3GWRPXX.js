"use strict";

(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", {
    value,
    configurable: true
  });
  if (window.Sentry && window.Sentry.init) {
    Sentry.init({
      dsn: "https://284561061c97a75e45ae443693ed075e@bugs.24ur.dev/136",
      release: "voyo@1888",
      ignoreErrors: ["The play() request was interrupted", "canceled_play", "is not the last"],
      environment: "production",
      beforeSend: /* @__PURE__ */__name(function (event, hint) {
        var exception = hint.originalException;
        if (exception && exception.name === "GqlError") {
          event.fingerprint = ["GQL error"];
        }
        if (exception instanceof Error && exception.message.includes("Fetch request timed out")) {
          event.fingerprint = ["Fetch error"];
        }
        if (exception instanceof Error && exception.message.includes("Failed to fetch")) {
          event.fingerprint = ["Failed to fetch"];
        }
        return event;
      }, "beforeSend"),
      // Disable session tracking and client reports so that we will send only errors to sentry
      autoSessionTracking: false,
      sendClientReports: false,
      // Remove performance/tracing integrations — keep only the default error ones
      integrations: /* @__PURE__ */__name(defaults => defaults.filter(i => i.name !== "BrowserTracing" && i.name !== "Replay"), "integrations")
    });
  }
})();
//# sourceMappingURL=sentry-S3GWRPXX.js.map