/* Buttondown adapter. UNTESTED (no real account used). Docs: https://docs.buttondown.com/building-your-subscriber-base
   Buttondown says embed-subscribe must be a normal HTML form action, not fetch() (CAPTCHA / validation pages).
   So this submits a real form POST into ONE named tab (repeat submits reuse it: R6) and returns "handoff": it never reports success itself.
   If a popup blocker stops the tab, it returns an error instead of claiming the tab opened.
   Double opt-in: Buttondown sends its own confirmation email (enable it in Buttondown settings). */
(function(){
  var P = window.CS_PROVIDERS = window.CS_PROVIDERS || {}, TAB = "cs-buttondown-signup";
  P.buttondown = { submit: function(ctx){
    return new Promise(function(resolve){
      var w = null; try { w = window.open("", TAB); } catch (e) {}
      if (!w) return resolve({ state: "error", code: "popup" });
      var f = document.createElement("form");
      f.method = "post"; f.action = ctx.endpoint; f.target = TAB; f.style.display = "none";
      var add = function(n, v){ var i = document.createElement("input"); i.type = "hidden"; i.name = n; i.value = v; f.appendChild(i); };
      add("email", ctx.email); add("embed", "1");
      add("metadata__country", ctx.country); add("metadata__consent_text", ctx.consentText); add("metadata__consent_at", ctx.consentAt);
      if (ctx.row) add("metadata__row", ctx.row);
      document.body.appendChild(f); f.submit(); document.body.removeChild(f);
      resolve({ state: "handoff", message: "Buttondown opened in a new tab. Finish there, then click the link in the confirmation email Buttondown sends you." });
    });
  }};
})();
