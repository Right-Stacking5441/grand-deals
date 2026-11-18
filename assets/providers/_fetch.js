/* Shared helper for fetch-based adapters: POST FormData, 15 s timeout, success only on 2xx + JSON success:true.
   Returns {state:"ok"} or {state:"error", code:"email"|"rejected"|"unconfirmed"|"server"|"network"} (R7: no raw status codes shown to users). */
(function(){
  var P = window.CS_PROVIDERS = window.CS_PROVIDERS || {};
  /* N4: only a FIELD-SPECIFIC error maps to "check your email address": an errors object keyed by the email field,
     or a known provider error code. Free text such as "Invalid form id" never does.
     TODO(R9): refine EMAIL_KEYS / EMAIL_CODES with real error samples captured during the real-account test. */
  var EMAIL_KEYS = /^(email|e-mail|email_address|fields\.email|fields\[email\]|EMAIL)$/i;
  var EMAIL_CODES = ["invalid_email", "email_invalid", "invalid_email_address"];
  function emailFieldError(j){
    if (!j || typeof j !== "object") return false;
    var e = j.errors;
    if (e && typeof e === "object" && !Array.isArray(e)) {
      if (Object.keys(e).some(function(k){ return EMAIL_KEYS.test(k); })) return true;
      if (e.fields && typeof e.fields === "object" && Object.keys(e.fields).some(function(k){ return EMAIL_KEYS.test(k); })) return true;
    }
    return EMAIL_CODES.indexOf(String(j.code || j.error_code || "").toLowerCase()) > -1;
  }
  P._post = function(url, fields){
    var fd = new FormData(); Object.keys(fields).forEach(function(k){ fd.append(k, fields[k]); });
    var ac = window.AbortController ? new AbortController() : null, t = setTimeout(function(){ if (ac) ac.abort(); }, 15000);
    return fetch(url, { method: "POST", body: fd, signal: ac ? ac.signal : undefined, credentials: "omit" }).then(function(r){
      clearTimeout(t);
      return r.text().then(function(txt){
        var j = null; try { j = JSON.parse(txt); } catch (e) {}
        var two = r.status >= 200 && r.status < 300;
        if (two && j && j.success === true) return { state: "ok", status: r.status };
        if ((r.status === 400 || r.status === 422 || (two && j && j.success === false)) && emailFieldError(j)) return { state: "error", code: "email", status: r.status };
        if (two && !(j && j.success === false)) return { state: "error", code: "unconfirmed", status: r.status };   // N3: 2xx we can't read -> may have been stored
        if (two || (r.status >= 400 && r.status < 500)) return { state: "error", code: "rejected", status: r.status };
        return { state: "error", code: "server", status: r.status };
      });
    }, function(){ clearTimeout(t); return { state: "error", code: "network", status: 0 }; });
  };
})();
