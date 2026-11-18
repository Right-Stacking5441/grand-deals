/* MailerLite adapter. UNTESTED (no real account used). Docs: https://www.mailerlite.com/help/how-to-create-an-embedded-form
   endpoint = the embedded form's action URL: https://assets.mailerlite.com/jsonp/<account>/forms/<form>/subscribe
   Fields follow MailerLite's own embed HTML (fields[email], ml-submit, anticsrf). Double opt-in is a per-form MailerLite setting.
   Needs _fetch.js. Success only on a 2xx JSON response with success:true. */
(function(){
  var P = window.CS_PROVIDERS = window.CS_PROVIDERS || {};
  P.mailerlite = { submit: function(ctx){
    return P._post(ctx.endpoint, { "fields[email]": ctx.email, "ml-submit": "1", "anticsrf": "true" });
  }};
})();
