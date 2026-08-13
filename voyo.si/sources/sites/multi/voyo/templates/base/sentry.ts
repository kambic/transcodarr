
export {};

if (window.Sentry && window.Sentry.init) {
    Sentry.init({
        dsn: '{{ .Config.SentryJsDSN }}',
        release: 'voyo@{{ .Config.Version }}',
        ignoreErrors: ['The play() request was interrupted', 'canceled_play', 'is not the last'],
        environment: '{{ if .Config.IsProd }}production{{ else }}development{{ end }}',
        beforeSend: function (event: any, hint: any) {
            const exception = hint.originalException;

            if (exception && exception.name === 'GqlError') {
                event.fingerprint = ["GQL error"];
            }
            if (exception instanceof Error && exception.message.includes('Fetch request timed out')) {
                event.fingerprint = ["Fetch error"];
            }
            if (exception instanceof Error && exception.message.includes('Failed to fetch')) {
                event.fingerprint = ["Failed to fetch"];
            }

            return event;
        },

        // Disable session tracking and client reports so that we will send only errors to sentry
        autoSessionTracking: false,
        sendClientReports: false,
        // Remove performance/tracing integrations — keep only the default error ones
        integrations: (defaults: any) =>
            defaults.filter(
                (i: any) => i.name !== "BrowserTracing" && i.name !== "Replay"
            ),
    });
}