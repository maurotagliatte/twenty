import {
  META_GRAPH_API_VERSION,
  META_JAVASCRIPT_SDK_URL,
} from 'src/constants/meta-graph-api.constant';

export type WhatsappSignupPageConfig = {
  appId: string;
  configId: string;
  callbackUrl: string;
};

// Inlined into a <script>, so "<" is escaped to keep "</script>" out of it.
const toInlineJson = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c');

// Embedded Signup only runs from the Facebook JavaScript SDK in a popup. This
// page hosts it, then sends the browser to Twenty's callback with the code and
// the session info. The state is read client side and never echoed by the server.
export const buildWhatsappSignupPageHtml = (
  config: WhatsappSignupPageConfig,
): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>Connect WhatsApp</title>
<style>
body{font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#f7f7f7;color:#333}
main{background:#fff;border-radius:12px;padding:32px;max-width:420px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.08)}
button{background:#1877f2;color:#fff;border:0;border-radius:8px;padding:12px 20px;font-size:16px;cursor:pointer}
button:disabled{opacity:.5;cursor:default}
</style>
</head>
<body>
<main>
<h1>Connect WhatsApp</h1>
<p id="status">Sign in with Facebook, then pick or create the WhatsApp Business account and number to connect.</p>
<button id="start" type="button" disabled>Continue with Facebook</button>
</main>
<script>
(function () {
  var config = ${toInlineJson({ ...config, graphApiVersion: META_GRAPH_API_VERSION })};
  var state = new URLSearchParams(window.location.search).get('state');
  var sessionInfo = {};
  var button = document.getElementById('start');
  var status = document.getElementById('status');

  if (!state) {
    status.textContent = 'This link is incomplete. Start again from Twenty.';
    return;
  }

  var goToCallback = function (params) {
    var url = new URL(config.callbackUrl);
    url.searchParams.set('state', state);
    Object.keys(params).forEach(function (key) {
      if (params[key]) url.searchParams.set(key, params[key]);
    });
    window.location.assign(url.toString());
  };

  window.addEventListener('message', function (event) {
    if (!/^https:\\/\\/([a-z0-9-]+\\.)*facebook\\.com$/.test(event.origin)) return;
    try {
      var message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (message && message.type === 'WA_EMBEDDED_SIGNUP' && String(message.event).indexOf('FINISH') === 0) {
        sessionInfo = message.data || {};
      }
    } catch (error) {}
  });

  window.fbAsyncInit = function () {
    FB.init({ appId: config.appId, autoLogAppEvents: true, xfbml: false, version: config.graphApiVersion });
    button.disabled = false;
  };

  button.addEventListener('click', function () {
    button.disabled = true;
    FB.login(function (response) {
      var code = response && response.authResponse && response.authResponse.code;
      if (!code) {
        goToCallback({ error: 'access_denied', error_description: 'WhatsApp signup was not finished' });
        return;
      }
      // The session info message can land just after the login callback.
      setTimeout(function () {
        goToCallback({ code: code, waba_id: sessionInfo.waba_id, phone_number_id: sessionInfo.phone_number_id });
      }, sessionInfo.phone_number_id ? 0 : 1000);
    }, {
      config_id: config.configId,
      response_type: 'code',
      override_default_response_type: true,
      extras: { setup: {} }
    });
  });
})();
</script>
<script async defer crossorigin="anonymous" src="${META_JAVASCRIPT_SDK_URL}"></script>
</body>
</html>
`;
