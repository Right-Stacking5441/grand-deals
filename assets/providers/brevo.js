/* Brevo adapter. UNTESTED (no real account used). Docs: https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo
   endpoint = the sign-up form's HTML embed action: https://<id>.sibforms.com/serve/<hash>
   Fields follow Brevo's embed HTML (EMAIL, email_address_check honeypot left empty, locale). isAjax=1 asks for a JSON reply the way
   Brevo's own form script does; this is an assumption that must be checked against a real form before go-live.
   Turn on "Double confirmation email" in the form settings. Needs _fetch.js. Success only on a 2xx JSON response with success:true. */
(function(){
  var P = window.CS_PROVIDERS = window.CS_PROVIDERS || {};
  P.brevo = { submit: function(ctx){
    return P._post(ctx.endpoint, { EMAIL: ctx.email, email_address_check: "", locale: ctx.locale || "en", isAjax: "1" });
  }};
})();
