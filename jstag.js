var OX=OX||function(f,i){var c={},b,j,h,l,a={},n,k,e="OX_sd";var m=function(){var o=0;return function(){if(o){return}g();o=1}}();function g(){var p,o;if(!k.isFramed()){p=k.getCookie(e);if(parseInt(p)){p++}else{p=1}o=new Date(k.now()+1200000).toGMTString();k.cookie(e,p,o);n._requestArgs.sd=p}}function d(s,q){var o,x,w,p={},u={},t,v,r;if(s.vars){for(var y in s.vars){if(s.vars.hasOwnProperty(y)){p["c."+escape(y)]=s.vars[y]}}s.vars=null}if(s.gw){t=s.gw;s.gw=null}if(""){u.oxns=""}if(j){u.ju=j}if(h){u.jr=h}u.cb=k.rand();v=k.merge([s,u,p,k.contextArgs()]);r=k.serialize(v);o=k.template(k.Templates.GW_URL,{gw:t||b,v:"1.0",r:q,q:r});x=k.ensureRightProtocol(o);w=k.template(k.Templates.SCRIPT,{src:o,id:"ox_"+q+"_"+k.rand()});k.write(w)}n=function(p){var o=new OX.AdRequest(p,{url:j=j||k.detectPageURL(),ref:h=h||k.detectRefererURL(),gw:b});c[o.get("o")]=o;return o};n._customVars={};n._requestArgs={};n.addHook=function(p,o){if(!a[o]){a[o]=[]}a[o].push(p)};n.addVariable=function(q,s,r,p){var o=n._customVars,t=(r||"c")+"."+q;if(p||!o[t]){o[t]=[]}o[t].push(s)};n.appendTag=function(o){k.write(o)};n.dflt=function(q,r,o){var p=c[q];p&&p.dflt(r,o)};n.ifrmHTML=function(q,r,o){var p=c[q];p&&p.ifrmHTML(r,o)};n.frameCreatives=function(o){l=o};n.getFramed=function(){return l};n.getHooksByType=function(o){return a[o]};n.init=function(){k=OX.utils;m()};n.load=function(o){n(o).load()};n.requestAd=function(o){n(o).fetchAds()};n.recordAction=function(o){d(o,n.Resources.RAJ)};n.recordSegments=function(q){var o,r={};if(q.expires){o=Date.parse(q.expires);if(o<new Date()){return}}for(var p in q){if(q.hasOwnProperty(p)){switch(p){case"add":r.as=q[p];break;case"del":r.ds=q[p];break;default:r[p]=q[p]}}}d(r,n.Resources.RSJ)};n.renderCreative=function(o){k.write(o)};n.setGateway=function(o){b=k.ensureRightProtocol(o)};n.setPageURL=function(o){j=o};n.setRefererURL=function(o){h=o};n.Hooks={ON_AD_REQUEST:1,ON_AD_RESPONSE:2,ON_ADUNIT_CREATED:3,ON_ADUNIT_INITIALIZED:4,ON_ADUNIT_RENDER_START:5,ON_ADUNIT_RENDER_FINISH:6,ON_AD_RENDER_START:7,ON_AD_RENDER_FINISH:8,ON_AD_DEFAULTED:9,ON_AD_NOT_DEFAULTED:10};n.Modes={IMMEDIATE:1,DEFERRED:2};n.Resources={ACJ:"acj",RAJ:"raj",RDF:"rdf",RR:"rr",RI:"ri",RSJ:"rsj",RE:"re"};n.GeoLocationSources={GPS:1,IP_ADDRESS:2,USER_REGISTRATION:3};n.shareFrameContents=false;return n}(window,document);
OX.utils=OX.utils||function(d,e,g){var h,b="w",c=true,a=1000000;function i(k,l,j){var n;try{n=(h.isIE&&k)?e.createElement('<iframe name="'+k+'">'):e.createElement("iframe")}catch(m){n=e.createElement("iframe")}n.setAttribute("width",l);n.setAttribute("height",j);n.setAttribute("frameSpacing","0");n.setAttribute("frameBorder","no");n.setAttribute("scrolling","no");if(k){n.setAttribute("id",k);n.setAttribute("name",k)}return n}function f(k,j){if(k.attachEvent){k.attachEvent("onload",j)}else{k.onload=j}}h={append:function(k,j){k.parentNode.insertBefore(j,k.nextSibling);return j},attachListener:function(l,j,k){if(l.addEventListener){l.addEventListener(j,k,false)}else{if(l.attachEvent){l.attachEvent("on"+j,k)}}},beacon:function(j){var k=h.ensureRightProtocol(j);(new Image()).src=k},contextArgs:function(){var m=h.detectWindowDims(),k={res:screen.width+"x"+screen.height+"x"+screen.colorDepth,plg:h.detectPlugins(),ch:e.charset||e.characterSet,tz:(new Date()).getTimezoneOffset()},n=e.getElementsByTagName("meta"),j;if(m){k.ws=m[0]+"x"+m[1]}for(var l=0;l<n.length;l++){j=n[l];if(j.name&&j.name==="viewport"){k.vmt=1;break}}if(OX.browser_id&&OX.browser_id.get()!=undefined){k.bi=OX.browser_id.get()}return k},create:function(k){var j=e.createElement("div");j.innerHTML=k;return j.firstChild},cookie:function(l,m,j){if(c){var k=l+"=";k+=(m||"")+";path=/;";if(h.defined(j)){k+="expires="+j+";"}try{e.cookie=k}catch(n){}}},createScript:function(k){var j=e.createElement("script");j.type="text/javascript";k.id&&(j.id=k.id);k.src&&(j.src=k.src);return j},defined:function(j){return typeof j!="undefined"},detectWindowDims:function(){var l=e.documentElement,j=d.innerWidth,k=d.innerHeight;j=h.defined(j)?j:l.clientWidth;k=h.defined(k)?k:l.clientHeight;if(h.defined(j)&&h.defined(k)){return[j,k]}},detectWindowDimensions:function(o,n){var m=n.documentElement,k=n.getElementsByTagName("body")[0],l=o.innerWidth||m.clientWidth||k.clientWidth,j=o.innerHeight||m.clientHeight||k.clientHeight;return{width:l,height:j}},detectPlugins:function(){var l,k="OX_plg",m="ShockwaveFlash.ShockwaveFlash",j={swf:{activex:[m,m+".3",m+".4",m+".5",m+".6",m+".7"],plugin:/flash/gim},sl:{activex:["AgControl.AgControl"],plugin:/silverlight/gim},pdf:{activex:["acroPDF.PDF.1","PDF.PdfCtrl.1","PDF.PdfCtrl.4","PDF.PdfCtrl.5","PDF.PdfCtrl.6"],plugin:/adobe\s?acrobat/gim},qt:{activex:["QuickTime.QuickTime","QuickTime.QuickTime.4"],plugin:/quicktime/gim},wmp:{activex:["WMPlayer.OCX"],plugin:/(windows\smedia)|(Microsoft)/gim},shk:{activex:["SWCtl.SWCtl","SWCt1.SWCt1.7","SWCt1.SWCt1.8","SWCt1.SWCt1.9",m+".1"],plugin:/shockwave/gim},rp:{activex:["RealPlayer","rmocx.RealPlayer G2 Control.1"],plugin:/realplayer/gim}};return function(){var q,r,o="",n=[];if(l){return l}try{if(e.cookie){q=e.cookie.split((escape(k)+"="));if(2<=q.length){r=q[1].split(";");if(r[0]){if(r[0].indexOf("|")>=0){return unescape(r[0].split("|").join(","))}}}}}catch(v){}for(var u in j){if(j.hasOwnProperty(u)){if(d.ActiveXObject){for(var t=0;t<j[u].activex.length;++t){try{ActiveXObject(j[u].activex[t]);n.push(u);break}catch(v){}}}else{for(var s=0;s<g.plugins.length;++s){if(g.plugins[s].name.match(j[u].plugin)){n.push(u);break}}}}}if(d.postMessage){n.push("pm")}l=o=n.join(",");h.cookie(k,n.join("|"));return o}}(),detectPageURL:function(){var j;try{j=top.location.href}catch(k){}return j||h.detectRefererURL()},detectProtocol:function(){return location.protocol},detectRefererURL:function(){var j=e.referrer;try{j=top.document.referrer}catch(m){if(parent){try{j=parent.document.referrer}catch(l){}}}if(!j&&opener){try{j=opener.location.href}catch(k){}}return j||""},each:function(m,n){if(h.isArray(m)){for(var l=0;l<m.length;l++){n(m[l],l)}}else{for(var j in m){if(m.hasOwnProperty(j)){n(j,m[j])}}}},ensureRightProtocol:function(k){var j;if(k){j=k.indexOf("//");if(j!=5&&j!=6){k="http://"+k}return(h.detectProtocol()=="https:")?k.replace("http:","https:"):k}},get:function(j){return e.getElementById(j)},getCookie:function(j){try{var k=e.cookie.split(j+"=");if(k.length==2){return k[1].split(";")[0]}}catch(l){}},getMedium:function(){return b},setMedium:function(j){b=j},ieVersion:(function(){var m=0,j,k;if(g){try{j=g.userAgent;if(g.appName=="Microsoft Internet Explorer"){k=new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");if(k.exec(j)!=null){m=parseFloat(RegExp.$1)}}else{if(g.appName=="Netscape"){k=new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})");if(k.exec(j)!=null){m=parseFloat(RegExp.$1)}}}}catch(l){}return m}})(),isArray:function(j){return Object.prototype.toString.call(j)==="[object Array]"},isEmpty:function(k){for(var j in k){if(k.hasOwnProperty(j)){return false}}return true},isFramed:function(){return d.self!=d.top},isIE:0,lastScript:function(){var j=e.getElementsByTagName("script");return j[j.length-1]},merge:function(m){var j,n;if(h.isArray(m)){j={};for(var l=0;l<m.length;l++){n=m[l];for(var k in n){if(n.hasOwnProperty(k)){j[k]=n[k]}}}}return j},now:function(){return(new Date()).getTime()},postMessage:function(k){var j=false;if(d.addEventListener){d.addEventListener("message",k,j)}else{if(d.attachEvent){d.attachEvent("onmessage",k,j)}}},produceFrame:function(j){var k,p='javascript:window["contents"]',w,y=j.hookNode,l=j.name,n=j.width,z=j.height,m=j.onStart,o=j.onFinish,t=j.onSuccess,s=l+"_contents",x=h.template(h.Templates.IFRAME_DOC,{title:j.title||"OpenX",head:j.headHTML,body:j.bodyHTML}),q=i(l,n,z);k=(h.isIE&&(h.ieVersion<11))||d.opera;if(k){q.src=p}if(y){if(j.replace){h.replace(y,q)}else{if(!e.body&&h.isFramed()){h.write("<body style='margin:0;padding:0'></body>");e.body.appendChild(q)}else{h.append(y,q)}}}if(k){try{o&&f(q,o);q.contentWindow.contents=x;m&&m();q.src=p}catch(r){var v=q;q=i(l,n,z);d[s]=x;p=h.template(h.Templates.IFRAME_JS_URI,{contentsVar:s,domain:e.domain});o&&f(q,o);q.src=p;m&&m();h.replace(v,q)}}else{try{w=q.contentWindow||q.contentDocument;if(w.document){w=w.document}o&&f(q,o);if(w){w.open("text/html","replace");m&&m();w.write(x);w.close()}}catch(u){if(!j.isRetry){j.hookNode=q;j.isRetry=1;d.setTimeout(function(){h.produceFrame(j)},0)}}}t&&t(q)},rand:function(){return Math.floor(Math.random()*9999999999)+""},remove:function(j){j.parentNode.removeChild(j)},replace:function(k,j){k.parentNode.replaceChild(j,k);return j},replaceOrRemove:function(j,l,k){if(!j){l&&h.remove(l)}else{if(l){return h.replace(l,j)}else{return h.append(k,j)}}},serialize:function(k){var m="",l;if(typeof k=="object"){for(var j in k){if(k.hasOwnProperty(j)){l=k[j];if(h.defined(l)&&(l!=null)){if(h.isArray(l)){l=l.join(",")}m+=j+"="+escape(l)+"&"}}}}if(m.length>1){m=m.substr(0,m.length-1)}return m},store:function(){var o="1",p=630720000000,m="|",r,j,q,l={};try{r=localStorage;r.setItem(o,o);r.removeItem(o);j=1}catch(n){if(g.cookieEnabled&&c){q=1}}function k(v,u){var x="OX_"+v,t,s;if(j){s=r.getItem(x);u&&r.removeItem(x)}else{if(q){s=h.getCookie(x);u&&h.cookie(x)}else{s=l[x];u&&(delete l[x])}}if(s){t=s.split(m);for(var w=0;w<t.length;w++){t[w]=unescape(t[w])}if(t.length===1){return t[0]}else{return t}}}return{put:function(u,y){var w="OX_"+u,x,s,t;if(h.isArray(y)){s=[];for(var v=0;v<y.length;v++){s.push(escape(y[v]))}x=s.join(m)}else{x=escape(y)}if(j){r.setItem(w,x)}else{if(q){t=new Date(h.now()+p).toGMTString();h.cookie(w,x,t)}else{l[w]=x}}},get:function(s){return k(s)},remove:function(s){return k(s,1)}}}(),template:function(t,o,k,p){o=o||{};var m="",l=0,r="",j,k=k||"{",p=p||"}",s,n;for(var q=0;q<t.length;q++){j=t.charAt(q);switch(j){case k:l=1;break;case p:s=o[m];if(h.defined(s)&&s!=null){n=s}else{n=""}r+=n;l=0;m="";break;default:if(l){m+=j}else{r+=j}}}return r},Templates:{SCRIPT:"<script type='text/javascript' id='{id}' src='{src}'><\/script>",IFRAME_DOC:"<!DOCTYPE html><html><head><title>{title}</title><base target='_top'/>{head}</head><body style='margin:0;padding:0'>{body}</body></html>",GW_URL:"{gw}/{v}/{r}?{q}",IFRAME_JS_URI:"javascript:document.open();document.domain='{domain}';document.write(window.parent['{contentsVar}']);window.parent['{contentsVar}']=null;setTimeout('document.close()',5000)"},write:function(j){e.readyState!=="complete"&&e.write(j)},isCookieEnabled:function(){return g.cookieEnabled&&c},isValidDIM:function(j){if(j>a){return false}else{if(isNaN(j)){return false}}return true},isEmpty:function(j){for(var k in j){if(j.hasOwnProperty(k)){return false}}return true},inIframe:function(){return d.self!==d.top},getPosition:function(j){var k=yPosition=0;if(j==null){return null}while(j){if(j.tagName!="SCRIPT"){k+=j.offsetLeft;yPosition+=j.offsetTop;j=j.offsetParent}else{j=j.previousElementSibling}}return{left:Math.round(k),top:Math.round(yPosition)}},getPositionById:function(k,l){var j=k.getElementById(l);return h.getPosition(j)},getAdPosition:function(m,n){var k,j,p=d,o=d.document;try{m=d.frameElement?d.frameElement.parentNode:m;if(h.inIframe()){p=d.parent;o=d.parent.document}k=h.detectWindowDimensions(p,o);if(!h.isValidDIM(k.width)||!h.isValidDIM(k.height)){return null}if(n){j=h.getPositionById(o,m);if(j==null){return null}}else{j=h.getPosition(m)}if(!h.isValidDIM(j.left)||!h.isValidDIM(j.top)){return null}return{browserDims:k,adUnitStartPos:j}}catch(l){return null}}};if(h.ieVersion){h.isIE=1}return h}(window,document,navigator);
/*@cc_on OX.utils.isIE=1;@*/;
OX.AdRequest=OX.AdRequest||function(J,z){var N=OX.utils,d=N.rand(),E,j={},u,s=0,g,n,l={},e={},w,f,a,H,x,r={},O=false,t={o:d},p={mode:null,auid:null,record_tmpl:null,ad_units:[]},B=2048,v="OX_"+d,F="ox_"+OX.Resources.ACJ+"_"+d,K="<iframe src='{src}' width='0' height='0' style='display:none;'></iframe>",h=this,L=OX.Hooks,D=OX.Modes;function q(){return(t.rm>0)&&(t.rd>0)&&(t.rc<t.rm)}function c(){if((t.rd>0)&&(t.rm>0)&&(!t.rc)){t.rc=0}}function o(){var k=h.createAdRequestURL(),Q=t.rc&&("_"+t.rc),P=F+(Q||""),i=N.createScript({id:P,src:k});return i}function b(S,R){var k=e[S]||[],P=OX.getHooksByType(S)||[],U=P.concat(k),T;if(U){for(var Q=0;Q<U.length;Q++){T=U[Q];T.apply(this,R)}}}function C(P){var i,k;if(P){i=N.template(K,{src:P});k=N.create(i)}a=N.replaceOrRemove(k,a,w)}function G(){t.rc++;setTimeout(function(){h.refreshAds()},1000*t.rd)}function A(k){var i;if(k){i=document.createComment(" "+k.replace(/--/g,"- -"))}f=N.replaceOrRemove(i,f,w)}function m(){var k="ma",i="js";N.setMedium(k);E=E.replace(/\/m?w$/,"/"+k);t.sp=i;delete t.ju;delete t.jr}function y(k,i,R){var Q=new XMLHttpRequest(),S=k.split("?");try{S[1]=S[1].replace(/\&callback=.+?\&/,"&")}catch(P){}Q.open("POST",S[0],true);Q.setRequestHeader("Content-Type","application/x-www-form-urlencoded");Q.onreadystatechange=function(){if(this.readyState===4){if(this.status===200){i&&i(JSON.parse(this.responseText))}else{O=false;r={};delete t.openrtb;R&&R()}}};Q.send(S[1])}h.addAdUnit=function(P){var k=h.getOrCreateAdUnit(P),i;if(!t.auid){t.auid=[]}t.auid.push(P);if(true&&!h.isBidderEnabled()){if(k._public&&k._public.anchor){i=N.getAdPosition(k._public.anchor,false)}else{i=N.getAdPosition(N.lastScript(),false)}if(i!=null){h.setBrowserDims(i.browserDims.width+"x"+i.browserDims.height);h.setAdUnitLocation(i.adUnitStartPos.left+","+i.adUnitStartPos.top)}}};h.addContentTopic=function(i){t.tid=t.tid||[];t.tid.push(i)};h.addHook=function(k,i){if(!e[i]){e[i]=[]}e[i].push(k)};h.addPage=function(i){t.pgid=t.pgid||[];t.pgid.push(i)};h.addVariable=function(k,Q,P,i){var R=(P||"c")+"."+k;if(i||!l[R]){l[R]=[]}l[R].push(Q)};h.createAdRequestURL=function(){var k,i,Q="";c();if(!N.isEmpty(r)){try{t.openrtb=JSON.stringify(r)}catch(P){}}i=N.merge([t,l,N.contextArgs(),OX._customVars,OX._requestArgs]);Q&&(Q+="&");Q+=N.serialize(i);if(!N.isEmpty(r)&&Q.length>B){O=true}if(H){Q+="&r="+escape(H)}k=N.template(N.Templates.GW_URL,{gw:E,v:"1.0",r:OX.Resources.ACJ,q:Q});return k};h.dflt=function(P,i){var k=j[P];k&&k.dflt(i)};h.ifrmHTML=function(P,i){var k=j[P];k&&k.set("iframe_html",i)};h.disableFeature=function(i){t.df=t.df||[];t.df.push(i)};h.disableMarket=function(){h.disableFeature("m")};h.disableSegmentation=function(){t.ns=1};h.enableFeature=function(i){t.ef=t.ef||[];t.ef.push(i)};h.enableMarket=function(){h.enableFeature("m")};h.enableSegmentation=function(){t.ns=null};h.fetchAds=function(){var k,i;b(L.ON_AD_REQUEST,[h]);k=h.createAdRequestURL();if(O){y(k,window[v],h.fetchAds)}else{i=N.template(N.Templates.SCRIPT,{src:k,id:F});N.write(i)}};h.fetchAdsComplete=function(){switch(p.mode){case D.IMMEDIATE:h.showAdUnit(p.auid);break;case D.DEFERRED:for(var i in j){if(j.hasOwnProperty(i)){if(j[i].get("anchor")){h.showAdUnit(i)}}}break;default:}if(t.auid&&t.auid.length==1){if(t.rc==0){h.addHook(function(){q()&&G()},OX.Hooks.ON_ADUNIT_RENDER_FINISH)}}else{q()&&G()}};h.frameCreatives=function(i){u=i};h.getOrCreateAdUnit=function(i){if(!j[i]){j[i]=new OX.AdUnit(i,h.get("o"));p.ad_units.push(j[i]);b(L.ON_ADUNIT_CREATED,[j[i]])}return j[i]};h.get=function(i){return p.hasOwnProperty(i)?p[i]:t[i]};h.getQueryArgs=function(){return t};h.getProperties=function(){return p};h.isBidderEnabled=function(){if(OX.dfp_bidder_config){return !N.isEmpty(OX.dfp_bidder_config)}return false};h.isResponseEmpty=function(){var k,i;if(!(x&&x.ads&&x.ads.adunits&&(k=x.ads.adunits[0])&&(i=k.get("chain"))&&i.length)){return true}else{return false}};h.loadAdResponse=function(P){var R=P.ads,T=P.ads.adunits,k,S;w=w||N.get(F);x=P;C(R.pixels);A(p.debug=R.debug);for(var Q=0;Q<T.length;Q++){k=T[Q];if(k.refresh_delay){t.rd=k.refresh_delay}if(k.refresh_max){t.rm=k.refresh_max}c();if(q()){u=1}S=function(i){b(L.ON_ADUNIT_INITIALIZED,[i])};h.getOrCreateAdUnit(k.auid).load({adunit:k,rt:R.record_tmpl,oninit:S,chain:R.chain})}};h.load=function(){var k,i=h.createAdRequestURL();b(L.ON_AD_REQUEST,[h]);u=1;if(O){y(i,window[v],h.load)}else{k=o();w=N.append(N.lastScript(),k)}};h.refreshAds=function(){var k,i=h.createAdRequestURL();b(L.ON_AD_REQUEST,[h]);if(O){y(i,window[v],h.load)}else{k=o();w=N.replace(w,k)}};h.setAdUnitFallback=function(k,i){h.getOrCreateAdUnit(k).set("fallback",i)};h.setAdUnitImpBeacon=function(k,i){h.getOrCreateAdUnit(k).set("imp_beacon",i)};h.setAdUnitLocation=function(i){t.adxy=t.adxy||[];t.adxy.push(i)};h.setAdUnitMarketFloor=function(k,i){h.getOrCreateAdUnit(k);t.aumf=t.aumf||[];t.aumf.push(k+":"+i)};h.setAdUnitNGFloor=function(k,i){h.getOrCreateAdUnit(k);t.aungf=t.aungf||[];t.aungf.push(k+":"+i)};h.setAdUnitSlotId=function(k,i){h.getOrCreateAdUnit(k).set("anchor",N.get(i))};h.setAnchorTarget=function(i){t.tg=i};h.setBrowserDims=function(i){t.dims=t.dims||[];t.dims.push(i)};h.setClickRedirectURL=function(i){H=i};h.setGateway=function(i){E=N.ensureRightProtocol(i)};h.setMode=function(i){p.mode=i};h.setPageURL=function(i){t.ju=N.ensureRightProtocol(i)};h.setRefererURL=function(i){t.jr=i};h.setRefreshDelay=function(i){t.rd=i};h.setRefreshMax=function(i){t.rm=i};h.setTest=function(i){t.test=i?"true":null};h.setUserID=function(i){t.xid=i};h.setBidderEligibility=function(i){t.be=i?1:0};h.setCoords=function(i){if(i.latitude&&i.longitude){t.lat=i.latitude;t.lon=i.longitude;t.lt=i.source||OX.GeoLocationSources.GPS}};h.setAdSizes=function(i){t.aus=t.aus?t.aus+"|":"";t.aus=t.aus+i.join(",")};h.setAppName=function(i){if(i){t["app.name"]=i;m()}};h.setAppBundleID=function(i){if(i){t["app.bundle"]=i;m()}};h.setAppStoreURL=function(i){if(i){t.url=N.ensureRightProtocol(i);m()}};h.setAPIFrameworks=function(i){if(i.toString()){t.af=i.toString();m()}};h.addDeviceID=function(P,Q){var i={"did.ia":"did.iat","did.adid":"did.adid.enabled"},k;if(P.type&&P.id){k=(Q||"did.")+P.type;t[k]=P.id;if(i.hasOwnProperty(k)&&P.hasOwnProperty("tracking")){t[i[k]]=!!P.tracking}m()}};h.setOpenRTBParameters=function(k){var i;if(Object.prototype.toString.call(k)==="[object Object]"){r=k}else{if(typeof k==="string"){try{i=JSON.parse(k);this.setOpenRTBParameters(i)}catch(P){}}}};h.addOpenRTBParameter=function(T,U){var S=T.split("."),Q=r,V,P,k;for(var R=0;R<S.length;R++){V=S[R];if(R===S.length-1){Q[V]=U;break}P=V.match(/(\w+)\[(\d+)\]/);if(P){V=P[1];k=P[2];Q[V]=Q[V]||[];Q[V][k]=Q[V][k]||{};Q=Q[V][k]}else{Q[V]=Q[V]||{};Q=Q[V]}}};h.showAdUnit=function(P){var k=j[P],i;if(k){i=function(){if(s){return 0}if(k.get("framed")){return 1}if(N.defined(u)){return u}return !!OX.getFramed()}();k.render({framed:i,onAdUnitRenderStart:function(){b(L.ON_ADUNIT_RENDER_START,[k])},onAdUnitRenderFinish:function(){b(L.ON_ADUNIT_RENDER_FINISH,[k])},onAdRenderStart:function(){b(L.ON_AD_RENDER_START,[k])},onAdRenderFinish:function(R,S,Q){b(L.ON_AD_RENDER_FINISH,[R,S,Q])},onAdDefaulted:function(R,S,Q){b(L.ON_AD_DEFAULTED,[R,S,Q])},onAdNotDefaulted:function(R,S,Q){b(L.ON_AD_NOT_DEFAULTED,[R,S,Q])},shareFrameContents:OX.shareFrameContents})}};window[v]=function(i){h.loadAdResponse(i);b(L.ON_AD_RESPONSE,[h]);h.fetchAdsComplete()};t.callback=v;h.setGateway(J&&J.gw||z.gw);h.setPageURL(J&&J.url||z.url);h.setRefererURL(J&&J.ref||z.ref);if(!window.postMessage){h.disableFeature("c")}if(J){h.setMode(D.IMMEDIATE);p.auid=J.auid;J.auid&&h.addAdUnit(p.auid);J.tid&&h.addContentTopic(J.tid);J.aumf&&h.setAdUnitMarketFloor(p.auid,J.aumf);J.aungf&&h.setAdUnitNGFloor(p.auid,J.aungf);J.tg&&h.setAnchorTarget(J.tg);J.imp_beacon&&h.setAdUnitImpBeacon(p.auid,J.imp_beacon);J.slot_id&&h.setAdUnitSlotId(p.auid,J.slot_id);J.fallback&&h.setAdUnitFallback(p.auid,J.fallback);J.test&&h.setTest(J.test);J.userid&&h.setUserID(J.userid);J.r&&h.setClickRedirectURL(J.r);J.rd&&h.setRefreshDelay(J.rd);J.rm&&h.setRefreshMax(J.rm);J.md&&h.disableMarket();J.ns&&h.disableSegmentation();J.coords&&h.setCoords(J.coords);J.openrtb&&h.setOpenRTBParameters(J.openrtb);J.appName&&h.setAppName(J.appName);J.appBundle&&h.setAppBundleID(J.appBundle);J.appStoreURL&&h.setAppStoreURL(J.appStoreURL);J.af&&h.setAPIFrameworks(J.af);if(J.deviceIDs){for(var M=0;M<J.deviceIDs.length;M++){h.addDeviceID(J.deviceIDs[M])}}if(J.vars){for(var I in J.vars){J.vars.hasOwnProperty(I)&&h.addVariable(I,J.vars[I])}}if(J.ef){for(var M=0;M<J.ef.length;M++){h.enableFeature(J.ef[M])}}if(J.df){for(var M=0;M<J.df.length;M++){h.disableFeature(J.df[M])}}if(N.defined(J.frameCreatives)){u=J.frameCreatives}J.forceUnframed&&(s=1);J.onResponse&&h.addHook(J.onResponse,L.ON_AD_RESPONSE);J.onAdUnitRender&&h.addHook(J.onAdUnitRender,L.ON_ADUNIT_RENDER_START);J.onAdUnitLoaded&&h.addHook(J.onAdUnitLoaded,L.ON_ADUNIT_RENDER_FINISH)}else{h.setMode(D.DEFERRED)}};
OX.AdUnit=OX.AdUnit||function(L,i){var N=OX.utils,g=this,x=OX.Resources,M=L,A=i,K,p,F,j,C,y,q={adunit_id:L,anchor:null},s=false,o="dflt",f="loaded",c="flash",a="ox_"+A+"_"+M,l=parseInt("2500")||2500,O=0,B="<script type='text/javascript'>var OX_swfobject = window.parent.OX.swfobject(window, document, navigator);<\/script>",u,h=a+"_ch_{i}",v="<div style='position:absolute;left:0px;top:0px;visibility:hidden;'><img src='{src}'/></div>",E="<script type='text/javascript'>(new Image()).src='{src}'{suffix}<\/script>",t="<script type='text/javascript'>function [fn](e) {if (e.data=='[data]') {window.parent.OX.dflt('[rid]','[auid]',[idx]);}}if (window.addEventListener) {addEventListener('message', [fn], false);} else {attachEvent('onmessage', [fn]);}<\/script>",w="<script type='text/javascript'>window.onload = function() {var html = document.documentElement.innerHTML;window.parent.OX.ifrmHTML('[rid]', '[auid]', html);};<\/script>";var D=function(P){this.renderStrategy=P};D.prototype.render=function(P){return this.renderStrategy(P)};function I(P){n(P)}function n(Q){var S=q.fallback,R,P,T=function(){Q.onAdRenderFinish(g,K,0);Q.onAdUnitRenderFinish()};if(K&&K.html&&(g.get("type")!=c)){R=N.template(u,{medium:N.getMedium(),rtype:x.RI,txn_state:K.ts});P=z(v,{src:R});K.html=K.html+P}if(g.get("is_fallback")){S=q.fallback||(K&&K.html)}else{if(K&&K.html){S=K.html+(q.imp_beacon||"")}}if(S){Q.onAdUnitRenderStart();if(Q.framed){J(S,a,g.get("type")==c?B:"",g.get("width")||g.get("primary_width"),g.get("height")||g.get("primary_height"),Q.onAdRenderStart,T,Q.shareFrameContents)}else{Q.onAdRenderStart();r(S);T()}}}function H(P){y=N.now();C=P;C.onAdUnitRenderStart();d(0)}function k(Q){var P,R;if(K&&K.html){P=N.template(u,{medium:N.getMedium(),rtype:x.RR,txn_state:K.ts});R=z(v,{src:P});K.html=R+K.html}n(Q)}function d(U){var W="",R="",aa="",V="",Q,X,Y,T="",S,Z="",P=q.chain,ab=N.template(h,{i:U});K=P[U];if(!C.renderTest){Y=N.template(u,{medium:N.getMedium(),rtype:x.RR,txn_state:K.ts});if(s&&(U<P.length-1)){Y+="&cts=";T=" + new Date().getTime();"}R=z(E,{src:Y,suffix:T})}if(U<P.length-1){W=N.template(t,{fn:"OX_dflt",data:"dflt",rid:A,auid:M,idx:U},"[","]");K.dflting=1;Q=e(U);X=function(){Q();C.onAdRenderFinish(g,K,U)}}else{if(g.get("type")==c){W=B}else{if(!C.renderTest){S=N.template(u,{medium:N.getMedium(),rtype:x.RI,txn_state:K.ts});aa=z(E,{src:S,suffix:Z})}}if(g.get("is_fallback")){V=q.fallback||(K&&K.html)}else{if(K&&K.html){V=K.html+(q.imp_beacon||"")}}X=function(){C.onAdRenderFinish(g,K,U);C.onAdUnitRenderFinish()}}J(R+(V||K.html)+aa,ab,W,K.width,K.height,C.onAdRenderStart,X,C.shareFrameContents)}function G(){return(N.now()-y)>q.chain_timeout}function e(P){return function(){window.setTimeout(function(){var S=q.chain[P],Q=P+1,R;S[f]=1;if(S.hasOwnProperty(o)){if(G()){Q=q.chain.length-1}d(Q)}else{C.onAdNotDefaulted(g,S,P);if(!C.renderTest){R=N.template(u,{medium:N.getMedium(),rtype:x.RI,txn_state:K.ts});if(s){R+="&cte="+N.now()}N.beacon(R)}C.onAdUnitRenderFinish()}},O)}}function J(S,P,T,X,R,Y,U,Z){var W=(q.pre_html||"")+S+(q.post_html||""),V="",Q;if(Z){V=N.template(w,{rid:A,auid:M},"[","]")}Q=(q.head_html||"")+T+V;N.produceFrame({hookNode:q.anchor||N.lastScript(),replace:!!q.anchor,name:P,headHTML:Q,bodyHTML:W,width:X,height:R,onStart:Y,onFinish:U,onSuccess:function(aa){q.anchor=aa}});g.set("iframe_id",P)}function r(P){var R=(q.pre_html||"")+P+(q.post_html||""),Q=R;if(!document.body&&N.isFramed()){Q="<body style='margin:0;padding:0'>"+R+"</body>"}N.write(R)}function b(P){var Q=N.template(u,{medium:N.getMedium(),rtype:x.RDF,txn_state:P.ts});if(s){Q+="&cte="+N.now()}N.beacon(Q)}var m=[{shouldDefer:function(){return(window.mraid&&typeof mraid.isViewable==="function"&&!mraid.isViewable())},defer:function(P){mraid.addEventListener("viewableChange",(function(){var Q=false;return function(R){if(!Q&&R){N.beacon(P);Q=true}}})())}},{shouldDefer:function(){return typeof trackImpressionHelper==="function"},defer:function(P){var Q=trackImpressionHelper;trackImpressionHelper=function(){N.beacon(P);Q()}}}];function z(S,V,W,T){var Q=V.src,P="",U;for(var R=0;R<m.length;R++){U=m[R];if(U.shouldDefer()){U.defer(Q);return P}}P=N.template(S,V,W,T);return P}g.dflt=function(Q){var R=q.chain[Q],P=Q+1;if(R[o]){return}R[o]=1;b(K);C.onAdDefaulted(g,R,Q);if(!C.renderTest){if(R.hasOwnProperty(f)){if(G()){P=q.chain.length-1}d(P)}}};g.get=function(P){return q.hasOwnProperty(P)?q[P]:(K&&K[P])};g.getProperties=function(){return N.merge([q,K])};g.load=function(R){var Q=R.adunit,S;u=R.rt;for(var P in Q){if(Q.hasOwnProperty(P)){q[P]=Q[P]}}if(q.size){S=q.size.split("x");q.primary_width=S[0];q.primary_height=S[1]}q.chain_timeout=q.chain_timeout||l;if(R.chain){if(q.chain&&q.chain.length>0){if(q.chain.length>1){p=new D(H)}else{K=q.chain&&q.chain[0];p=new D(k)}}else{p=new D(I)}}else{K=q.chain&&q.chain[0];p=new D(n)}F=1;j=0;R.oninit&&R.oninit(g)};g.render=function(P){if(j){return}g.set("framed",P.framed);if(!F){p=new D(I)}p.render(P);j=1};g.set=function(P,Q){q[P]=Q}};
/*! SWFObject v2.2 <http://code.google.com/p/swfobject/> is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> */
;OX.swfobject=function(N,j,t){var P=OX.utils.defined,r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",N=N||window,j=j||document,t=t||navigator,T=false,U=[h],o=[],M=[],H=[],l,Q,D,B,I=false,a=false,n,F,m=true,L=function(){var aa=P(j.getElementById)&&P(j.getElementsByTagName)&&P(j.createElement),ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(P(t.plugins)&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(P(t.mimeTypes)&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(P(N.ActiveXObject)){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!L.w3){return}if((P(j.readyState)&&j.readyState=="complete")||(!P(j.readyState)&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!I){if(P(j.addEventListener)){j.addEventListener("DOMContentLoaded",f,false)}if(L.ie&&L.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(N==top){(function(){if(I){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(L.wk){(function(){if(I){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(I){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}I=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function J(X){if(I){X()}else{U[U.length]=X}}function s(Y){if(P(N.addEventListener)){N.addEventListener("load",Y,false)}else{if(P(j.addEventListener)){j.addEventListener("load",Y,false)}else{if(P(N.attachEvent)){i(N,"onload",Y)}else{if(typeof N.onload=="function"){var X=N.onload;N.onload=function(){X();Y()}}else{N.onload=Y}}}}}function h(){if(T){V()}else{G()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(P(Z.GetVariable)){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");L.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;G()})()}else{G()}}function G(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(L.pv[0]>0){var ae=c(Y);if(ae){if(E(o[af].swfVersion)&&!(L.wk&&L.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}O(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&P(Z.SetVariable)){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(P(Y.SetVariable)){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&E("6.0.65")&&(L.win||L.mac)&&!(L.wk&&L.wk<312)}function O(aa,ab,X,Z){a=true;D=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(!P(aa.width)||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(!P(aa.height)||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=L.ie&&L.win?"ActiveX":"PlugIn",ac="MMredirectURL="+N.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(P(ab.flashvars)){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(L.ie&&L.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(L.ie&&L.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(L.win&&L.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(L.wk&&L.wk<312){return X}if(aa){if(!P(ai.id)){ai.id=Y}if(L.ie&&L.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";M[M.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(L.ie&&L.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);H[H.length]=[Z,X,Y]}function E(Z){var Y=L.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(L.ie&&L.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;F=null}if(!n||F!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(L.ie&&L.win&&P(j.styleSheets)&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}F=X}if(L.ie&&L.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&P(j.createTextNode)){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(I&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function K(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&P(encodeURIComponent)?encodeURIComponent(Y):Y}var d=function(){if(L.ie&&L.win){window.attachEvent("onunload",function(){var ac=H.length;for(var ab=0;ab<ac;ab++){H[ab][0].detachEvent(H[ab][1],H[ab][2])}var Z=M.length;for(var aa=0;aa<Z;aa++){y(M[aa])}for(var Y in L){L[Y]=null}L=null;for(var X in OX_swfobject){OX_swfobject[X]=null}OX_swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(L.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(L.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(L.w3&&!(L.wk&&L.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);J(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(P(am.flashvars)){am.flashvars+="&"+ai+"="+escape(Z[ai])}else{am.flashvars=ai+"="+escape(Z[ai])}}}if(E(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;O(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:L,getFlashPlayerVersion:function(){return{major:L.pv[0],minor:L.pv[1],release:L.pv[2]}},hasFlashPlayerVersion:E,createSWF:function(Z,Y,X){if(L.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(L.w3&&A()){O(Z,aa,X,Y)}},removeSWF:function(X){if(L.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(L.w3){v(aa,Z,Y,X)}},addDomLoadEvent:J,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return K(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return K(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(L.ie&&L.win){l.style.display="block"}}if(D){D(B)}}a=false}}}};var OX_swfobject=OX_swfobject||OX.swfobject(window,document,navigator);
!function(){if(!window.console){console={log:function(){}}}function g(i){var e=new Date();var r=[e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()].join(":");console.log(r+" "+i)}if(window===parent||!window.OX_ads||!window.OX_config.rich_media){b();return}var o=OX.utils;var a=document.createElement("div");for(var h=0;h<OX_ads.length;h++){var p=OX_ads[h];p.slot_id=p.slot_id||"OX_slot_"+h;var m=document.createElement("div");m.id=p.slot_id;a.appendChild(m)}var f=o.lastScript();var n=o.createScript({src:f.src});try{parent.OX_ads=OX_ads;parent.OX_config=OX_config;a.appendChild(n);g("Friendly iframe. Hide it and insert ad in the parent. If not displayed, check if you disabled adblock");console.log("");var d=window.frameElement;d.style.display="none";d.parentNode.insertBefore(a,d)}catch(k){g(k);g("Unfriendly iframe. Check postMessage support...");if(!window.postMessage){g("postMessage support: No, stop busting");b();return}g("postMessage support: Yes");g("Start loading iframe buster...");var j=document.referrer.split("/");var l=j[0]+"//"+j[2];var q=l+window.OX_config.buster_path;var d=document.createElement("iframe");d.src=q;d.setAttribute("width",0);d.setAttribute("height",0);document.body.appendChild(d);var c=false;o.attachListener(window,"message",function(e){if(!e.source||!d.contentWindow){g("OOPS, no source or contentWindow!")}if(e.source===d.contentWindow){g("Buster found copy");c=true}});o.attachListener(d,"load",function(){setTimeout(function(){d.style.display="none";if(!c){g("Can not find buster at "+q+", stop busting");b();return}g("Buster loaded");var e={config:OX_config,ads:OX_ads,html:a.outerHTML,scriptSrc:n.src};g("Start passing ads to parent...");window.parent.postMessage(JSON.stringify(e),"*")},50)})}function b(){OX.init();OX.setGateway("http://dev:8000/w");var t;while(window.OX_cmds&&(t=OX_cmds.shift())){if(typeof t==="function"){t()}}var u=window.OX_reporter_cmds;if(!u){try{u=window.top.OX_reporter_cmds}catch(s){}}for(var e in u){if(typeof u[e]==="function"){u[e](window)}}var r;while(window.OX_ads&&(r=OX_ads.shift())){r.hasOwnProperty("slot_id")?OX.load(r):OX.requestAd(r)}}}();
