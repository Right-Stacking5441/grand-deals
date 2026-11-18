(function(){
"use strict";
var H=document.documentElement, ROOT=H.getAttribute("data-root")||"/", PAGE=H.getAttribute("data-page")||"", CC=H.getAttribute("data-cc")||"";
var KEY="cs_cc", $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function j(p){return fetch(ROOT+p,{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error(p+" "+r.status);return r.json()})}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]})}

function detect(list){
var en=list.filter(function(c){return c.enabled}), byCC={};en.forEach(function(c){byCC[c.cc]=c});
var saved=get(KEY); if(saved&&byCC[saved]) return {c:byCC[saved],saved:true,how:"saved"};
var tz=""; try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(e){}
for(var i=0;i<en.length;i++){var d=en[i].detect||{};
if((d.timezones||[]).indexOf(tz)>-1||(d.tz_prefixes||[]).some(function(p){return tz.indexOf(p)===0})) return {c:en[i],how:"tz"};}
var langs=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""]).map(function(l){return l.toLowerCase()});
for(var a=0;a<langs.length;a++){for(var b=0;b<en.length;b++){
if(((en[b].detect||{}).languages||[]).some(function(l){return l.toLowerCase()===langs[a]})) return {c:en[b],how:"lang"};}}
return {c:byCC[window.CS_DEFAULT]||en[0],fallback:true,how:"default"};
}
var SUB={home:"",storage:"storage/",gear:"controllers/"};
function pathFor(c,page){ if(!c.built) return ROOT+"c/?cc="+c.cc; return c.path+(SUB[page]||""); }
function initCountry(data){
var list=data.countries; window.CS_DEFAULT=data.default;
var en=list.filter(function(c){return c.enabled}), here=list.filter(function(c){return c.cc===CC})[0];

$$(".sw a").forEach(function(a){a.addEventListener("click",function(){set(KEY,a.getAttribute("data-cc")); if(location.hash&&a.href.indexOf("#")<0) a.href+=location.hash})});
var det=detect(list);
if(PAGE==="choose"){
if(det.saved){location.replace(pathFor(det.c,"home"));return}
$$(".choose tr[data-cc]").forEach(function(tr){ if(tr.getAttribute("data-cc")===det.c.cc){var s=tr.querySelector(".hint"); if(s) s.textContent=det.fallback?"(default)":"(suggested)"} });
$$(".choose a").forEach(function(a){a.addEventListener("click",function(){set(KEY,a.getAttribute("data-cc"))})});
return;
}
var geo=$("#geo");
if(geo&&!geo.hidden){
var ga=geo.querySelector(".geo-go"); ga.addEventListener("click",function(){set(KEY,ga.getAttribute("data-cc"))});
geo.querySelector(".geo-stay").addEventListener("click",function(){set(KEY,CC);geo.hidden=true});
}
return here;
}
function affUrl(aff,cc,key,url){
var a=(aff[cc]||{})[key]; if(!a||!a.live) return url;
if(a.mode==="query"){return url+(url.indexOf("?")>-1?"&":"?")+encodeURIComponent(a.param)+"="+encodeURIComponent(a.value)}
if(a.mode==="wrap"&&a.template){return a.template.replace("{url_enc}",encodeURIComponent(url)).replace("{url}",url)}
return url;
}

var SYM={GBP:"£",USD:"$"}, TZL={uk:"UK time",us:"ET"};
var LB={in_stock:"In stock",low:"Low stock",out:"Out of stock",unknown:"Check stock",preorder:"Pre-order"};
var STOCK_RANK={in_stock:0,low:1,preorder:2,unknown:3,out:4};
var NAMES={ps_direct:"PlayStation Direct"};
function plat(p){p=String(p).toLowerCase();var x=p.indexOf("xbox")>-1,s=p.indexOf("ps5")>-1;return (x&&s)||!(x||s)?"any":(x?"xbox":"ps5")}
function pshort(p){var k=plat(p);return k==="any"?"PS5 & Xbox":(k==="xbox"?"Xbox":"PS5")}
function nf(c){try{return new Intl.NumberFormat(c.locale,{style:"currency",currency:c.currency})}catch(e){return {format:function(n){return n}}}}

function absT(c,iso){try{return new Intl.DateTimeFormat(c.spelling==="us"?"en-US":"en-GB",{day:"numeric",month:"short",hour:c.spelling==="us"?"numeric":"2-digit",minute:"2-digit",hour12:c.spelling==="us",timeZone:c.tz}).format(new Date(iso))}catch(e){return iso}}
function hm(c,iso){try{return new Intl.DateTimeFormat(c.spelling==="us"?"en-US":"en-GB",{hour:c.spelling==="us"?"numeric":"2-digit",minute:"2-digit",hour12:c.spelling==="us",timeZone:c.tz}).format(new Date(iso))}catch(e){return iso}}
function ymd(c,d){try{return new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:c.tz}).format(d)}catch(e){return ""}}
function stamp(c,iso){var d=new Date(iso),n=new Date(),y=new Date(n.getTime()-864e5),t=hm(c,iso);
if(ymd(c,d)===ymd(c,n))return t; if(ymd(c,d)===ymd(c,y))return "yesterday "+t;
try{return new Intl.DateTimeFormat(c.spelling==="us"?"en-US":"en-GB",{day:"numeric",month:"short",timeZone:c.tz}).format(d)+" "+t}catch(e){return t}}
function relT(iso){if(!iso)return "not checked";var s=(Date.now()-new Date(iso).getTime())/1000;
if(s<3600)return Math.max(1,Math.floor(s/60))+"m ago"; if(s<86400)return Math.floor(s/3600)+"h ago"; if(s<172800)return "yesterday"; return Math.floor(s/86400)+"d ago"}
function relLong(iso){if(!iso)return "not checked";var s=(Date.now()-new Date(iso).getTime())/1000;
if(s<3600)return Math.max(1,Math.floor(s/60))+" min ago";
if(s<86400){var n=Math.floor(s/3600);return n===1?"1 hour ago":n+" hours ago"}
if(s<172800)return "yesterday";
var d=Math.floor(s/86400);return d===1?"1 day ago":d+" days ago"}
function priceTs(r){return r.price!=null&&r.price_seen_at?r.price_seen_at:r.last_checked}
function tier(r,h){var amz=/^amazon/.test(r.retailer); if(r.stock==="not_listed")return null; if(r.price==null||amz)return 9;
var pts=r.price!=null&&r.price_seen_at?r.price_seen_at:r.last_checked; if(pts&&(Date.now()-new Date(pts).getTime())>h*36e5)return 3; return {in_stock:1,low:1,unknown:2,preorder:4,out:5}[r.stock]||2}
function nameOf(aff,c,k){return NAMES[k]||((aff[c.cc]||{})[k]||{}).name||k}
function editionLine(r){var ed=r.edition||"Standard",fmt=String(r.format||"").split("(")[0].trim().toLowerCase();return fmt?ed+" ("+fmt+")":ed}
function keyLt(a,b){for(var i=0;i<a.length;i++){if(a[i]<b[i])return true;if(a[i]>b[i])return false}return false}
function heroSortKey(c,r,aff){var ts=r.last_checked?new Date(r.last_checked).getTime():0;
return [r.price!=null?r.price:1e9,STOCK_RANK[r.stock]!=null?STOCK_RANK[r.stock]:9,-ts,nameOf(aff,c,r.retailer).toLowerCase(),pshort(r.platform),r.id||""]}
function pickHero(c,rows,f,aff,h){
var cands=rows.filter(function(r){return tier(r,h)===1&&(f==="all"||plat(r.platform)===f)});
if(!cands.length)return null;
return cands.reduce(function(best,r){return keyLt(heroSortKey(c,r,aff),heroSortKey(c,best,aff))?r:best});
}
function lowestInfo(rows,h){
var ins=rows.filter(function(r){return tier(r,h)===1});
var lo=ins.length?Math.min.apply(null,ins.map(function(r){return r.price})):null;
var fresh=rows.filter(function(r){return tier(r,h)===1&&r.price!=null});
var same=null;
if(fresh.length>=2&&fresh.every(function(r){return r.price===fresh[0].price})) same=fresh[0].price;
return {lo:lo,same:same};
}
function vis(el){if(!el)return false;var r=el.getBoundingClientRect();return r.bottom>0&&r.top<(window.innerHeight||0)&&r.width>0&&r.height>0}
function rowHTML(r,c,aff,h,lowest,signup){
var t=tier(r,h), nm=nameOf(aff,c,r.retailer), f=nf(c), stale=t===3, low=lowest!=null&&t===1&&r.price===lowest;
var pts=priceTs(r);
var lb=Object.assign({},LB,{preorder:c.spelling==="us"?"Preorder":"Pre-order"}), stock=r.stock, sl=lb[stock]||stock, w=relT(pts);
if(stale){stock="stale";sl="Checked "+w}
var price=(stock==="out"&&r.price!=null)?'<s class="num" title="last seen">'+esc(f.format(r.price))+'</s>':stale?'<span class="chk" title="last seen '+esc(f.format(r.price))+'">Check price</span>':'<b class="num">'+esc(f.format(r.price))+'</b>';
var href=esc(affUrl(aff,c.cc,r.retailer,r.url));
var btn=stock==="out"?(signup?'<a class="buy" href="#alerts" data-alert="'+esc(r.id)+'">Alert me</a>':'<a class="buy" href="'+href+'" rel="sponsored nofollow noopener" target="_blank" data-aff="'+esc(r.retailer)+'">Check</a>')
:'<a class="buy" href="'+href+'" rel="sponsored nofollow noopener" target="_blank" data-aff="'+esc(r.retailer)+'" aria-label="Go to '+esc(nm)+', '+esc(pshort(r.platform))+'. Buy at '+esc(nm)+'"><span class="buy-s">Buy</span><span class="buy-l">Go to '+esc(nm)+'</span></a>';
var ed=r.edition||"", edp=(ed&&ed!=="Standard")?esc(ed)+" · ":"", lowt="Lowest", lowl=low?'<span class="lowl">'+lowt+'</span> ':"";
var stockTitle=(pts&&r.last_checked&&r.last_checked!==pts)?' title="Stock checked '+esc(absT(c,r.last_checked)+" "+(TZL[c.cc]||""))+'"':"";
var stockLine=(pts&&r.last_checked&&r.last_checked!==pts)?'<span class="stk">stock checked '+esc(relT(r.last_checked))+'</span>':"";
var dot='<span class="stock s-'+esc(stock)+'"'+stockTitle+'>'+esc(sl)+'</span>';
var tm=pts?'<time datetime="'+esc(pts)+'" title="'+esc(absT(c,pts)+" "+(TZL[c.cc]||""))+'">'+esc(w)+'</time>':'<span>not checked</span>';
var tm2=pts?'<time datetime="'+esc(pts)+'" title="'+esc(absT(c,pts)+" "+(TZL[c.cc]||""))+'">'+esc(w)+'</time>':"";
return '<tr class="row'+(low?" low":"")+(stale?" stale":"")+'" data-kind="'+esc(r.kind)+'" data-plat="'+plat(r.platform)+'" data-id="'+esc(r.id)+'" data-tier="'+t+'" data-price="'+(r.price!=null?r.price:"")+'" data-ts="'+(r.last_checked?Math.floor(new Date(r.last_checked).getTime()/1000):0)+'" data-name="'+esc(nm)+'" data-stock="'+esc(r.stock)+'" data-href="'+href+'" data-edition="'+esc(ed)+'" data-format="'+esc(r.format||"")+'">'+
'<th scope="row" class="who"><span class="nm">'+esc(nm)+(low?' <span class="lowm">'+lowt+'</span>':'')+'</span><span class="m2">'+edp+esc(pshort(r.platform))+' · '+dot+(stale||!pts?"":' · '+tm2)+(stockLine&&!stale?' · '+stockLine:"")+'</span></th>'+
'<td class="what">'+esc(String(r.product).replace("Grand Theft Auto VI","GTA 6"))+' '+esc(ed)+(r.format?'<small>'+esc(r.format)+'</small>':'')+'</td>'+
'<td class="plat"><span class="nw">'+esc(pshort(r.platform))+'</span></td><td class="st">'+lowl+dot+'<span class="ck2">'+tm+stockLine+'</span></td><td class="ck">'+tm+stockLine+'</td>'+
'<td class="pr">'+price+'</td><td class="go">'+btn+'</td></tr>';
}
function moreHTML(list,c,aff){
if(!list.length)return "";
return '<tr class="more"><td colspan="7"><details><summary>+ <span class="n">'+list.length+'</span> more '+(c.spelling==="us"?"stores":"shops")+', price not confirmed</summary><ul>'+
list.map(function(r){return '<li data-plat="'+plat(r.platform)+'"><span>'+esc(nameOf(aff,c,r.retailer))+' · '+esc(pshort(r.platform))+(r.kind!=="game"?' · '+esc(String(r.product).replace("Grand Theft Auto VI","GTA 6")):"")+'</span><a href="'+esc(affUrl(aff,c.cc,r.retailer,r.url))+'" rel="sponsored nofollow noopener" target="_blank" data-aff="'+esc(r.retailer)+'">Check price</a></li>'}).join("")+'</ul></details></td></tr>';
}
function joinNames(list){
if(!list.length)return "";
if(list.length===1)return list[0];
if(list.length===2)return list[0]+" and "+list[1];
return list.slice(0,-1).join(", ")+" and "+list[list.length-1];
}
function heroHTML(c,rows,f,aff,h,rrp){
var hero=pickHero(c,rows,f,aff,h), us=c.spelling==="us", fmt=nf(c);
if(!hero){
var cands=rows.filter(function(r){return tier(r,h)!==null&&(f==="all"||plat(r.platform)===f)});
var r=cands.length?cands.reduce(function(best,x){return keyLt(heroSortKey(c,x,aff),heroSortKey(c,best,aff))?x:best}):null;
var rrpS=rrp!=null?(us?"MSRP ":"RRP ")+esc(fmt.format(rrp)):"";
if(!r) return '<section id="best" class="fallback"><div class="best-copy"><p class="best-kicker">No confirmed in-stock price yet</p><p class="best-sub">'+rrpS+'</p></div></section>';
var nm=nameOf(aff,c,r.retailer), href=esc(affUrl(aff,c.cc,r.retailer,r.url));
return '<section id="best" class="fallback"><div class="best-copy"><p class="best-kicker">No confirmed in-stock price yet</p><p class="best-sub">'+rrpS+'</p></div><a class="buy-hero" href="'+href+'" rel="sponsored nofollow noopener" target="_blank" data-aff="'+esc(r.retailer)+'">Check '+esc(nm)+' →</a></section>';
}
var nm=nameOf(aff,c,hero.retailer), href=esc(affUrl(aff,c.cc,hero.retailer,hero.url)), p=pshort(hero.platform);
var sl=hero.stock==="preorder"?(us?"Preorder":"Pre-order"):(LB[hero.stock]||hero.stock);
var hpts=priceTs(hero);
var when=relLong(hpts), tt=hpts?absT(c,hpts)+" "+(TZL[c.cc]||""):"";
var tm=hpts?'<time id="updated" datetime="'+esc(hpts)+'" title="'+esc(tt)+'">'+esc(when)+'</time>':"not checked";
var stockBit=(hpts&&hero.last_checked&&hero.last_checked!==hpts)?" · stock checked "+relLong(hero.last_checked):"";
var others=[];
rows.forEach(function(r){if(r===hero||r.price!==hero.price||tier(r,h)!==1)return;var n=nameOf(aff,c,r.retailer);if(n!==nm&&others.indexOf(n)<0)others.push(n)});
var tie=others.length?"Same price at "+esc(joinNames(others)):"";
var save=(rrp!=null&&hero.price<rrp)?((us?"MSRP ":"RRP ")+esc(fmt.format(rrp))+", you save "+esc(fmt.format(rrp-hero.price))):"";
var sub=[tie,save].filter(Boolean).join(" · ");
var seo="Cheapest confirmed price: "+esc(fmt.format(hero.price))+" at "+esc(nm)+" (price seen "+esc(when)+")";
var kicker="Cheapest right now · "+esc(p)+" · "+esc(editionLine(hero));
return '<section id="best" data-id="'+esc(hero.id)+'"><div class="best-copy"><p class="best-kicker">'+kicker+'</p><p class="best-shop">'+esc(nm)+'</p><p class="best-meta"><span class="stock s-'+esc(hero.stock)+'">'+esc(sl)+'</span> · price seen '+tm+stockBit+'</p><p class="best-price">'+esc(fmt.format(hero.price))+'</p><p class="best-seo">'+seo+'</p>'+(sub?'<p class="best-sub">'+sub+'</p>':'')+'</div><a class="buy-hero" href="'+href+'" rel="sponsored nofollow noopener" target="_blank" data-aff="'+esc(hero.retailer)+'">Buy at '+esc(nm)+' for '+esc(fmt.format(hero.price))+' →</a></section>';
}
function buybarHTML(c,rows,f,aff,h){
var hero=pickHero(c,rows,f,aff,h);
if(!hero) return '<div id="buybar" hidden></div>';
var nm=nameOf(aff,c,hero.retailer), href=esc(affUrl(aff,c.cc,hero.retailer,hero.url)), fmt=nf(c);
return '<div id="buybar" hidden><div><div class="buybar-meta"><span class="ad">Ad</span> '+esc(nm)+' · '+esc(pshort(hero.platform))+'</div><div class="buybar-price">'+esc(fmt.format(hero.price))+'</div></div><a class="buy-bar" href="'+href+'" rel="sponsored nofollow noopener" target="_blank" data-aff="'+esc(hero.retailer)+'">Buy '+esc(fmt.format(hero.price))+' →</a></div>';
}
function heroOffscreen(){
var hero=$("#best"); if(!hero) return true;
var r=hero.getBoundingClientRect();
return r.bottom<=0 || r.top>=(window.innerHeight||0);
}
function footerInView(){
var foot=$(".site-f"); if(!foot) return false;
return foot.getBoundingClientRect().top < (window.innerHeight||0);
}
function syncBuybar(){
var bar=$("#buybar"); if(!bar) return;
var desktop=window.matchMedia && window.matchMedia("(min-width: 768px)").matches;
var has=!!bar.querySelector(".buy-bar");
var show=!desktop && has && heroOffscreen() && !footerInView();
bar.hidden=false;
bar.classList.toggle("on", show);
document.body.classList.toggle("has-bar", show);
}
function qs(k){var m=location.search.match(new RegExp("[?&]"+k+"=([a-z]+)"));return m?m[1]:null}
function initTracker(here,countries){
var box=$("#tracker"); if(!box) return;
var cc=box.getAttribute("data-cc")||CC, c=countries.filter(function(x){return x.cc===cc})[0], h=+box.getAttribute("data-stale")||12; if(!c) return;
var signup=!!$("#alert-form[data-live='1']"), ann=false, state={f:qs("p")||"all",sort:qs("sort")||"price"}, P=null, AFF=null;
if(["all","ps5","xbox"].indexOf(state.f)<0)state.f="all"; if(["price","recent","az"].indexOf(state.sort)<0)state.sort="price";
var sel=$("#sort",box); if(sel) sel.value=state.sort;
function sortRows(rows){
var by={price:function(a,b){return (a.t-b.t)||((a.r.price||1e9)-(b.r.price||1e9))||(b.ts-a.ts)},
recent:function(a,b){return (b.ts-a.ts)||(a.t-b.t)},
az:function(a,b){return a.n.localeCompare(b.n)||(a.t-b.t)}}[state.sort]||null;
return rows.map(function(r){return {r:r,t:tier(r,h),ts:r.last_checked?new Date(r.last_checked).getTime():0,n:nameOf(AFF,c,r.retailer)}}).sort(by).map(function(x){return x.r});
}
function visibleGames(rows){
return rows.filter(function(r){return r.kind==="game"&&tier(r,h)!==null&&(state.f==="all"||plat(r.platform)===state.f||plat(r.platform)==="any")});
}
function renderHero(){
if(!P) return;
var rows=visibleGames(P.rows), rrp=P.reference&&P.reference[0]?P.reference[0].price:null;
var html=heroHTML(c,rows,state.f,AFF,h,rrp);
var cur=$("#best"); if(cur) cur.outerHTML=html;
var bar=$("#buybar"); if(bar) bar.outerHTML=buybarHTML(c,rows,state.f,AFF,h);
syncBuybar();
}
function render(tbl,rows){
var tb=$(".ledger",tbl); if(!tb) return;
rows=rows.filter(function(r){return tier(r,h)!==null&&(state.f==="all"||plat(r.platform)===state.f||plat(r.platform)==="any")});
var info=lowestInfo(rows,h), lo=info.lo;
var rrp=P.reference&&P.reference[0]?P.reference[0].price:null;
var s=sortRows(rows), main=s.filter(function(r){return tier(r,h)!==9}), more=s.filter(function(r){return tier(r,h)===9});
if(tbl.id==="px-game") tbl.setAttribute("data-shown",String(main.length+more.length));
tb.innerHTML=(main.map(function(r){return rowHTML(r,c,AFF,h,lo,signup)}).join("")+moreHTML(more,c,AFF))||'<tr class="row"><td colspan="7">Prices go live at launch. Check the retailer.</td></tr>';
}
function all(){ if(!P) return;
render($("#px-game"),P.rows.filter(function(r){return r.kind==="game"}));
var bt=$("#px-bundle"); if(bt) render(bt,P.rows.filter(function(r){return r.kind!=="game"}));
renderHero();
$$(".seg button",box).forEach(function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-f")===state.f))});
var dir={price:"ascending",az:"ascending",recent:"descending"};
$$(".px thead button").forEach(function(b){var on=b.getAttribute("data-sort")===state.sort; b.setAttribute("aria-pressed",String(on)); b.parentNode.setAttribute("aria-sort",on?dir[state.sort]:"none")});
var st=$("#tstatus"); if(st&&ann){var g=$("#px-game"),n=g?+g.getAttribute("data-shown"):0;
st.textContent="Showing "+n+" "+(state.f==="all"?"":(state.f==="ps5"?"PS5 ":"Xbox "))+"price"+(n===1?"":"s")+", "+{price:"cheapest first",recent:"most recently checked first",az:"A to Z by retailer"}[state.sort]+"."}
if(sel) sel.value=state.sort; syncSwitch(state);
}
function push(){ann=true;var q=[];if(state.f!=="all")q.push("p="+state.f);if(state.sort!=="price")q.push("sort="+state.sort);
try{history.replaceState(null,"",location.pathname+(q.length?"?"+q.join("&"):"")+location.hash)}catch(e){} all()}
$$(".seg button",box).forEach(function(b){b.addEventListener("click",function(){state.f=b.getAttribute("data-f");push()})});
if(sel) sel.addEventListener("change",function(){state.sort=sel.value;push()});
$$(".px thead button").forEach(function(b){b.addEventListener("click",function(){state.sort=b.getAttribute("data-sort");push()})});
window.addEventListener("scroll",syncBuybar,{passive:true});
window.addEventListener("resize",syncBuybar);
Promise.all([j("data/prices/"+cc+".json"),j("data/affiliates.json")]).then(function(res){
P=res[0];AFF=res[1]; all();
}).catch(function(e){ if(window.console) console.warn("tracker: kept prerendered rows", e); syncBuybar(); });
}

function syncSwitch(st){
var q=[]; if(st&&st.f&&st.f!=="all")q.push("p="+st.f); if(st&&st.sort&&st.sort!=="price")q.push("sort="+st.sort);
$$(".sw a").forEach(function(a){var base=a.getAttribute("href").split("?")[0]; a.setAttribute("href",base+(q.length?"?"+q.join("&"):""))});
}

function initCalc(){
var i=$("#free"), u=$("#unit"), o=$("#need"), cs=$("#console"), wh=$("#where"); if(!i||!o) return;
var size=+i.getAttribute("data-size"), room=+i.getAttribute("data-headroom")||size;
function con(){var op=cs?cs.options[cs.selectedIndex]:null; return op?{name:op.textContent,usable:+op.getAttribute("data-usable"),adv:+op.getAttribute("data-adv"),plat:op.getAttribute("data-plat"),src:op.getAttribute("data-src")}:null}
function say(msg,cls,inv){o.textContent=msg;o.className=cls||"";i.setAttribute("aria-invalid",inv?"true":"false")}
function orderPicks(k){var l=$("#picks");if(!l||!k)return;var it=$$(".pick",l);it.sort(function(a,b){return (b.getAttribute("data-plat")===k)-(a.getAttribute("data-plat")===k)});
it.forEach(function(x,n){l.appendChild(x);var r=x.querySelector(".rk");if(r)r.textContent=(n+1)+"."})}
function syncWhere(k){ if(!wh||!k) return;
$$("option",wh).forEach(function(op){var p=op.getAttribute("data-plat"),ok=!p||p===k.plat; op.hidden=!ok; op.disabled=!ok});
if(wh.options[wh.selectedIndex].disabled) wh.value="int" }
function run(){
var k=con(); if(k){var us=$("#usable"),sr=$("#usrc"); if(us)us.textContent=k.usable.toLocaleString("en"); if(sr)sr.textContent=k.src; syncWhere(k)}
var raw=i.value.trim().replace(/\s/g,"").replace(",","."); if(raw===""){say("");return}
if(!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)){say("Enter a number, like 150 or 1.5.","err",true);return}
var v=parseFloat(raw), gb=u&&u.value==="TB"?v*1000:v;
if(v<0){say("Free space can't be negative. Enter the free space your console shows, like 150.","err",true);return}
var wop=wh?wh.options[wh.selectedIndex]:null, wcap=wop?+wop.getAttribute("data-cap"):0;
var path=k&&k.plat==="xbox"?"Settings › System › Storage devices":"Settings › Storage";
if(wcap){ if(gb>wcap){say("That's more than fits on "+(k&&k.plat==="xbox"?"an Xbox":"a PS5")+" "+wop.getAttribute("data-lbl")+". Check "+path+".","err",true);return} }
else if(k&&gb>k.usable){say("That's more than the "+k.name.split(" · ")[0]+" internal SSD has (about "+k.usable.toLocaleString("en")+" GB usable). On "+(k.plat==="xbox"?"an expansion card":"an M.2 SSD")+"? Change Where. Or check "+path+".","err",true);return}
if(u&&u.value==="GB"&&v>0&&v<=8&&/\.\d/.test(raw)){say("Did you mean "+v+" TB? Switch the unit to TB.","warn");return}
if(gb>=room) say("Yes, with "+Math.floor(gb-size).toLocaleString("en")+" GB spare for patches.","ok");
else if(gb>=size) say("Only just. Free up about "+Math.ceil(room-gb).toLocaleString("en")+" GB for day-one patches.","warn");
else { say("You need "+Math.ceil(size-gb).toLocaleString("en")+" GB more, or "+Math.ceil(room-gb).toLocaleString("en")+" GB to leave room for patches.","bad"); orderPicks(k&&k.plat) }
}
i.addEventListener("input",run); [u,cs,wh].forEach(function(x){if(x)x.addEventListener("change",run)});
i.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();run()}}); run();
}

function loadScript(src){return new Promise(function(res,rej){var s=document.createElement("script");s.src=src;s.onload=res;s.onerror=function(){rej(new Error("load "+src))};document.head.appendChild(s)})}
function initForm(){
var f=$("#alert-form"); if(!f) return;
var m=$("#form-msg",f), er=$("#form-err",f), live=f.getAttribute("data-live")==="1", name=f.getAttribute("data-provider")||"", btn=f.querySelector("button[type=submit]");
var LABEL=btn?btn.textContent:"", sending=false, ready=null, quietUntil=0;
function adapter(){ if(!ready){ var srcs=(f.getAttribute("data-adapter")||"").split(" ").filter(Boolean);
ready=srcs.reduce(function(p,src){return p.then(function(){return loadScript(src)})},Promise.resolve()).then(function(){var a=(window.CS_PROVIDERS||{})[name]; if(!a||typeof a.submit!=="function") throw new Error("no adapter "+name); return a}) }
return ready }
if(live) adapter().catch(function(){});

function ok(t){er.textContent="";m.className="form-msg"+(t?" ok":"");m.textContent=t||""}
function info(t){er.textContent="";m.className="form-msg";m.textContent=t}
function fail(t){m.textContent="";er.textContent=t}
var ERR={email:"Check your email address and try again.",popup:"Your browser blocked the sign-up tab. Allow pop-ups for this site and try again.",
network:"We couldn't confirm your signup. Check your inbox before trying again.",
unconfirmed:"We couldn't confirm your signup. Check your inbox before trying again.",
rejected:"Sorry, the alerts service didn't accept that signup. Please try again in a minute.",
server:"Sorry, the alerts service isn't responding properly. Please try again in a minute.",
broken:"Sorry, alerts aren't working right now. Please try again later."};
function lock(on){ sending=on; if(!btn) return;

if(on){btn.setAttribute("aria-disabled","true");btn.textContent="Sending…"} else {btn.removeAttribute("aria-disabled");btn.textContent=LABEL} }
$$("[data-alert]").forEach(function(b){b.addEventListener("click",function(){f.row.value=b.getAttribute("data-alert");setTimeout(function(){f.email.focus()},0)})});
f.addEventListener("submit",function(e){
e.preventDefault(); if(!live||sending||Date.now()<quietUntil) return;
var em=f.email.value.trim(); f.email.setAttribute("aria-invalid","false");
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){fail("Enter a valid email address.");f.email.setAttribute("aria-invalid","true");f.email.focus();return}
var ctx={endpoint:f.getAttribute("data-endpoint"),email:em,country:f.country.value,row:f.row.value,consentText:f.getAttribute("data-consent")||"",consentAt:new Date().toISOString(),locale:"en"};
var hadFocus=document.activeElement===btn; lock(true); ok("");
adapter().then(function(a){return a.submit(ctx)}).then(function(r){
r=r||{};
if(r.state==="ok"){ f.reset(); ok("Check your inbox and click the confirmation link. You won't get alerts until you do.") }
else if(r.state==="handoff"){ quietUntil=Date.now()+2000; f.reset(); info(r.message||"Finish signing up in the tab that opened.") }
else { if(r.code==="email"){f.email.setAttribute("aria-invalid","true")} fail(ERR[r.code]||ERR.rejected) }
},function(){ fail(ERR.broken) })
.then(function(){ lock(false); if(hadFocus||document.activeElement===document.body) btn.focus() },function(){ lock(false) });
});
}
function initGeneric(countries){
if(PAGE!=="generic") return null;
var q=(location.search.match(/[?&]cc=([a-z]{2})/)||[])[1], c=countries.filter(function(x){return x.cc===q&&x.enabled})[0];
if(!c){ $("#g-title").textContent="Country not available yet"; return null }
CC=c.cc; H.setAttribute("lang",c.hreflang); $("#tracker").setAttribute("data-cc",c.cc);
$("#g-title").textContent="Price and stock tracker: "+c.name; document.title=c.name+" price and stock tracker";
return c;
}
j("data/countries.json").then(function(d){
initGeneric(d.countries); var here=initCountry(d); if(PAGE!=="choose") initTracker(here,d.countries);
}).catch(function(){});
initCalc(); initForm();
})();
