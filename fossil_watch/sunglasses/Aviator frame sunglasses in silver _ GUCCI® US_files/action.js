!function(){if("undefined"!=typeof MFB)return MFB.start(),null
;MFB={},MFB.start=function(){
_Mfb_domain="gucci.com","undefined"==typeof _Mfb_useCookie&&(window._Mfb_useCookie=!0),
MFB.checkEp="https://actor.myfeelback.com/visitorAcceptance",
MFB.websiteJs="https://room.cxr.skeepers.io/lib/frontend/handy/js/libraries/",
MFB.websiteStyle="https://actor.cxr.skeepers.io/stylesheet",
MFB.responsiveStyle="https://actor.cxr.skeepers.io/responsive",
MFB.inPageUrl="https://actor.cxr.skeepers.io/inPage",
MFB.inPageStyle="https://actor.cxr.skeepers.io/stylesheet/in-page",
MFB.actorUid="140b17a4d31bfcc75510994cd17e73d6-2181",
MFB.themeJs="https://room.cxr.skeepers.io/lib/frontend/",
MFB.protocol="https",MFB.host="room.myfeelback.com",
MFB.geoIPUrl="undefined",MFB.cdnHost="room.cxr.skeepers.io",
MFB.geoIPUrl="https://c7hn3ry3r4.execute-api.us-east-1.amazonaws.com/Prod?lang=",
MFB.flashUrl="undefined://undefinedundefined",
MFB_loaderBackground="undefined",MFB.deployment_timestamp="1765793359",
MFB_CONDITION_CACHE_KEY="mfb.actor.beta.conditions",
MFB_RESPONDENT_ATTR_CACHE_KEY="mfb.actor.beta.respondent",
MFB.timestamp="1765874697",
MFB_datalayerless=null,Function.prototype.bind||(Function.prototype.bind=function(oThis){
if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable")
;var aArgs=Array.prototype.slice.call(arguments,1),fToBind=this,fNOP=function(){},fBound=function(){
return fToBind.apply(this instanceof fNOP&&oThis?this:oThis,aArgs.concat(Array.prototype.slice.call(arguments)))
};return fNOP.prototype=this.prototype,fBound.prototype=new fNOP,fBound
}),"indexOf"in Array.prototype||(Array.prototype.indexOf=function(find,i){
void 0===i&&(i=0),i<0&&(i+=this.length),i<0&&(i=0)
;for(var n=this.length;i<n;i++)if(i in this&&this[i]===find)return i;return-1}),
"forEach"in Array.prototype||(Array.prototype.forEach=function(action,that){
for(var i=0,n=this.length;i<n;i++)i in this&&action.call(that,this[i],i,this)}),
Object.keys||(Object.keys=function(){"use strict"
;var hasOwnProperty=Object.prototype.hasOwnProperty,hasDontEnumBug=!{
toString:null
}.propertyIsEnumerable("toString"),dontEnums=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],dontEnumsLength=dontEnums.length
;return function(obj){
if("object"!=typeof obj&&("function"!=typeof obj||null===obj))throw new TypeError("Object.keys called on non-object")
;var prop,i,result=[]
;for(prop in obj)hasOwnProperty.call(obj,prop)&&result.push(prop)
;if(hasDontEnumBug)for(i=0;i<dontEnumsLength;i++)hasOwnProperty.call(obj,dontEnums[i])&&result.push(dontEnums[i])
;return result}
}()),Array.prototype.filter||(Array.prototype.filter=function(fun){"use strict"
;if(null==this)throw new TypeError;var t=Object(this),len=t.length>>>0
;if(len>t.length||"function"!=typeof fun)throw new TypeError
;for(var res=[],thisArg=arguments.length>=2?arguments[1]:void 0,i=0;i<len;i++)if(i in t){
var val=t[i];fun.call(thisArg,val,i,t)&&res.push(val)}return res}),function(){
var elementIds=["mfbNavbar","mfbIframeOverlay","mfbIframeBlock"]
;for(var index in elementIds){
var elementId=elementIds[index],htmlElement=document.getElementById(elementId)
;htmlElement&&document.body.removeChild(htmlElement)}
const elements=document.getElementsByClassName("mfb-website-vendors mfb-survey")
;for(;elements.length>0;)elements[0].parentNode.removeChild(elements[0])
}(),$$globalActorMFBD$$=null,$$globalActorMFBDAccepted$$=!1
;var websitejs,_loaded,effectsStylesheet,stylesheet,d,_opened,toLoad,Iframe=(_loaded=!1,
effectsStylesheet=".mfbFade-in .mfbIframeContent{-webkit-transform:scale(0);-moz-transform:scale(0);-ms-transform:scale(0);transform:scale(0);opacity:0;-webkit-transition:all 0.2s;-moz-transition:all 0.2s;transition:all 0.2s}.mfbVisible.mfbFade-in .mfbIframeContent{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);transform:scale(1);opacity:1}.mfbScale-out .mfbIframeContent{-webkit-transform:scale(10);-moz-transform:scale(10);-ms-transform:scale(10);transform:scale(10);opacity:0;-webkit-transition:all 0.2s;-moz-transition:all 0.2s;transition:all 0.2s}.mfbVisible.mfbScale-out .mfbIframeContent{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);transform:scale(1);opacity:1}.mfbSlide-in-right .mfbIframeContent{-webkit-transform:translateX(1000%);-moz-transform:translateX(1000%);-ms-transform:translateX(1000%);transform:translateX(1000%);opacity:1;-webkit-transition:all 0.2s;-moz-transition:all 0.2s;transition:all 0.2s}.mfbVisible.mfbSlide-in-right .mfbIframeContent{-webkit-transform:translateX(0);-moz-transform:translateX(0);-ms-transform:translateX(0);transform:translateX(0);opacity:1}.mfbSlide-in-bottom .mfbIframeContent{-webkit-transform:translateY(1000%);-moz-transform:translateY(1000%);-ms-transform:translateY(1000%);transform:translateY(1000%);opacity:1;-webkit-transition:all 0.2s;-moz-transition:all 0.2s;transition:all 0.2s}.mfbVisible.mfbSlide-in-bottom .mfbIframeContent{-webkit-transform:translateY(0);-moz-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0);opacity:1}.mfbSlide-in-top .mfbIframeContent{-webkit-transform:translateY(-1000%);-moz-transform:translateY(-1000%);-ms-transform:translateY(-1000%);transform:translateY(-1000%);opacity:1;-webkit-transition:all 0.2s;-moz-transition:all 0.2s;transition:all 0.2s}.mfbVisible.mfbSlide-in-top .mfbIframeContent{-webkit-transform:translateY(0);-moz-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0);opacity:1}.mfbSlide-in-left .mfbIframeContent{-webkit-transform:translateX(-1000%);-moz-transform:translateX(-1000%);-ms-transform:translateX(-1000%);transform:translateX(-1000%);opacity:1;-webkit-transition:all 0.2s;-moz-transition:all 0.2s;transition:all 0.2s}.mfbVisible.mfbSlide-in-left .mfbIframeContent{-webkit-transform:translateX(0);-moz-transform:translateX(0);-ms-transform:translateX(0);transform:translateX(0);opacity:1}",
stylesheet=".mfbHidden{visibility: hidden;} #mfbIframeOverlay{z-index:1000;background-color:rgba(0,0,0,0.5);opacity:1;display:block;position:fixed;top:0;left:0;width:100%;height:100%;font-weight:bold;text-align:center;font-size:24px;}#mfbIframeBlock{z-index:1600000;position:fixed;}#mfbIframe{z-index:1400000;width:100%;height:100%;border:0;border-radius:3px 3px 3px 3px}#mfbIframeClose{float:right;font-weight:bold;text-align:right;color:#ddd;top:5px;right:5px;position:absolute;z-index:1600000;font-size:28px;background:none;border:none;}.mfbVisible{visibility:visible;}.noOutline{outline:none;}",
d=document,_opened=!1,toLoad=1,{load:function(params){if(!_loaded){
for(h=d.getElementsByTagName("head")[0];h.querySelector("style[provider=SkeepersDiv]");)h.removeChild(h.querySelector("style[provider=SkeepersDiv]"))
;var css=d.createElement("style");css.setAttribute("provider","SkeepersDiv")
;var textnode,effectsCss=d.createElement("style")
;effectsCss.setAttribute("provider","SkeepersDiv"),
websitejs=d.createElement("script"),
css.setAttribute("type","text/css"),effectsCss.setAttribute("type","text/css"),
websitejs.setAttribute("type","text/javascript"),
websitejs.setAttribute("async","false"),
websitejs.setAttribute("src",MFB.websiteJs+params.themeDeployment+"-libraries.js?_="+MFB.timestamp),
null!=css.styleSheet&&null!=css.styleSheet?css.styleSheet.cssText=stylesheet:(textnode=d.createTextNode(stylesheet),
css.appendChild(textnode)),
null!=effectsCss.styleSheet&&null!=effectsCss.styleSheet?effectsCss.styleSheet.cssText=effectsStylesheet:(textnode=d.createTextNode(effectsStylesheet),
effectsCss.appendChild(textnode)),h.appendChild(css),h.appendChild(effectsCss)
;var defaultSettingCss=d.createElement("style"),iframeBlockCss=function(params){
var position={},origin="",settingWidth="",settingHeight="",device=PlatformDetect.getPlatform(window.navigator.userAgent,600)
;if("expand"===(params.settings.displayType||"")){try{
var displayTypeNameSplitted=params.settings.effect.split("-")
;origin=displayTypeNameSplitted[displayTypeNameSplitted.length-1]}catch(err){
origin=""}switch(origin){case"bottom":position={left:"0px",right:"0px",
bottom:"0px"
},settingWidth=params.settings.width?(params.settings.width||80)+(params.settings.widthSymbol||"%"):"80%",
settingHeight=params.settings.height?(params.settings.height||50)+(params.settings.heightSymbol||"%"):"500px"
;break;case"top":position={left:"0px",right:"0px",top:"0px"
},settingWidth=params.settings.width?(params.settings.width||80)+(params.settings.widthSymbol||"%"):"80%",
settingHeight=params.settings.height?(params.settings.height||50)+(params.settings.heightSymbol||"%"):"500px"
;break;case"left":position={left:"0px",top:"0px",bottom:"0px"
},settingWidth=params.settings.width?(params.settings.width||80)+(params.settings.widthSymbol||"%"):"500px",
settingHeight=params.settings.height?(params.settings.height||50)+(params.settings.heightSymbol||"%"):"50%"
;break;default:position={right:"0px",top:"0px",bottom:"0px"
},settingWidth=params.settings.width?(params.settings.width||80)+(params.settings.widthSymbol||"%"):"500px",
settingHeight=params.settings.height?(params.settings.height||50)+(params.settings.heightSymbol||"%"):"50%"
}}else position={top:"0px",bottom:"0px",right:"0px",left:"0px"
},settingWidth=params.settings.width?(params.settings.width||80)+(params.settings.widthSymbol||"%"):"80%",
settingHeight=params.settings.height?(params.settings.height||50)+(params.settings.heightSymbol||"%"):"50%"
;switch(device){case"phone":case"mobile":
void 0!==params.settings.widthMobile&&(settingWidth=params.settings.widthMobile+(params.settings.widthMobileSymbol||"px")),
void 0!==params.settings.heightMobile&&(settingHeight=params.settings.heightMobile+(params.settings.heightMobileSymbol||"px"))
;break;case"tablet":
void 0!==params.settings.widthTablet&&(settingWidth=params.settings.widthTablet+(params.settings.widthTabletSymbol||"px")),
void 0!==params.settings.heightTablet&&(settingHeight=params.settings.heightTablet+(params.settings.heightTabletSymbol||"px"))
;break;case"desktop":
void 0!==params.settings.widthDesktop&&(settingWidth=params.settings.widthDesktop+(params.settings.widthDesktopSymbol||"px")),
void 0!==params.settings.heightDesktop&&(settingHeight=params.settings.heightDesktop+(params.settings.heightDesktopSymbol||"px"))
}return mfbTools.apply(position,{width:settingWidth,height:settingHeight,
margin:"auto"}),position}(params);mfbTools.apply(iframeBlockCss,{
background:MFB_loaderBackground
}),mfbTools.addDefaultAndSettingCss(defaultSettingCss,iframeBlockCss,"mfbIframeBlock"),
mfbTools.addDefaultAndSettingCss(defaultSettingCss,{height:"inherit",
"overflow-x":"auto"
},"mfbIframeContent"),mfbTools.addDefaultAndSettingCss(defaultSettingCss,{
position:"absolute",color:"#dddddd","font-size":"25px",cursor:"pointer"
},"mfbIframeClose"),h.appendChild(defaultSettingCss)
;var cssAdvancedStyle=d.createElement("style")
;mfbTools.addAdvancedSettingCss(cssAdvancedStyle,params.settings.overlayStyle),
mfbTools.addAdvancedSettingCss(cssAdvancedStyle,params.settings.closeTextStyle),
mfbTools.addAdvancedSettingCss(cssAdvancedStyle,params.settings.parentContainerStyle),
h.appendChild(cssAdvancedStyle),_loaded=!0}},open:function(params){
if(_opened)return!1;_opened=!0,params.settings.effect=params.settings.effect||""
;let language=null;const languageMode=params.language_mode
;language="force"===languageMode&&params.forced_language?params.forced_language:_Mfb_ud?._context?.lang?_Mfb_ud._context.lang:navigator.language??null
;var overlay=mfbTools.createEl("div",{id:"mfbIframeOverlay",class:"mfbHidden"
}),displayTypeClass=params.settings.displayType?" MFBdisplay-"+params.settings.displayType:"",iframeBlock=mfbTools.createEl("div",{
id:"mfbIframeBlock",
class:"mfbHidden mfbModal mfb-survey "+params.settings.effect+displayTypeClass,
role:"dialog","aria-modal":"true",
"aria-label":mfbTools.getTranslatedSetting(params,"deploymentNames")
}),iframeContent=mfbTools.createEl("div",{id:"mfbIframeContent",
class:"mfbIframeContent"});let title="Close"
;language&&language.includes("fr")&&(title="Fermer")
;var closeButton=mfbTools.createEl("button",{id:"mfbIframeClose",title:title,
type:"Button",class:"mfbHidden noOutline closeButton",tabindex:"0",
"aria-label":title});closeButton.innerHTML="&times;"
;var maxHeight=params.settings.height+(params.settings.heightSymbol||"px")
;switch(PlatformDetect.getPlatform(window.navigator.userAgent,600)){case"phone":
case"mobile":
void 0!==params.settings.heightMobile&&(maxHeight=params.settings.heightMobile+(params.settings.heightMobileSymbol||"px"))
;break;case"tablet":
void 0!==params.settings.heightTablet&&(maxHeight=params.settings.heightTablet+(params.settings.heightTabletSymbol||"px"))
;break;case"desktop":
void 0!==params.settings.heightDesktop&&(maxHeight=params.settings.heightDesktop+(params.settings.heightDesktopSymbol||"px"))
}var div=mfbTools.createEl("div",{id:"mfb-website-actor"},{
"max-height":maxHeight});function done(){if(0==toLoad){
overlay.setAttribute("class",overlay.getAttribute("class")+" mfbVisible")
;var deploymentStyleUrl="",depUid=params.urlDeployment.match(/\/([a-z0-9A-Z=_-]{10,})\//)
;depUid&&(depUid=depUid[depUid.length-1],
deploymentStyleUrl=MFB.websiteStyle+"/"+depUid+".css")
;var deploymentResponsiveUrl=MFB.responsiveStyle+"/"+depUid+".css",mainConfig={
host:MFB.host,protocol:MFB.protocol,responsiveURL:deploymentResponsiveUrl,
fontUrl:params.fontUrl,cdnHost:MFB.cdnHost,deploymentUid:depUid,
enableGeoloc:params.enableGeoloc,trackingDisabled:params.trackingDisabled,
previewMode:params.previewMode,isOffline:params.isOffline,
timestamp:MFB.timestamp,testMode:params.testMode,lang:language,
originalLanguage:params.originalLanguage
},website=new MFBWebsite(params.urlDeployment,deploymentStyleUrl,mainConfig)
;window.MfbTracking._setData(MFB.getVarsDatas()),
website.build("#mfb-website-actor",{},{actor:!0},function(){
iframeBlock.setAttribute("class",iframeBlock.getAttribute("class")+" mfbVisible"),
setTimeout(function(){
closeButton.setAttribute("class",closeButton.getAttribute("class")+" mfbVisible"),
closeButton.focus()
},1e3),iframeBlock.setAttribute("style",iframeBlock.getAttribute("style")+" background:transparent"),
sessionStorage.removeItem(MFB_CONDITION_CACHE_KEY)
;var focusableElements=iframeBlock.querySelectorAll('a, button, input:not([type="hidden"]), textarea, select, [tabindex]:not([tabindex="-1"])'),first=focusableElements[0],last=focusableElements[focusableElements.length-1]
;document.getElementById("mfbIframeBlock").addEventListener("keydown",function(e){
"Tab"===e.key&&(e.shiftKey?document.activeElement===first&&(last.focus(),
e.preventDefault()):document.activeElement===last&&(first.focus(),
e.preventDefault()))}),closeButton.addEventListener("keydown",function(event){
if("Enter"===event.key||" "===event.key){var el=iframeBlock.parentNode
;el.removeChild(iframeBlock),el.removeChild(overlay)}})})}}
return on("click",overlay,function(ev){
var el=d.getElementById("mfbIframeOverlay").parentNode
;el.removeChild(iframeBlock),el.removeChild(overlay)
;const elements=document.getElementsByClassName("mfb-website-vendors mfb-survey")
;for(;elements.length>0;)elements[0].parentNode.removeChild(elements[0])
;_opened=!1}),on("click",iframeContent,function(ev){
if(ev.target==d.getElementById("mfbIframeContent")||ev.target==d.getElementsByClassName("mfb-website")[0]){
var el=d.getElementById("mfbIframeOverlay").parentNode
;el.removeChild(iframeBlock),el.removeChild(overlay)
;const elements=document.getElementsByClassName("mfb-website-vendors mfb-survey")
;for(;elements.length>0;)elements[0].parentNode.removeChild(elements[0])
;_opened=!1}}),on("click",closeButton,function(ev){
var el=d.getElementById("mfbIframeOverlay").parentNode
;el.removeChild(iframeBlock),el.removeChild(overlay)
;const elements=document.getElementsByClassName("mfb-website-vendors mfb-survey")
;for(;elements.length>0;)elements[0].parentNode.removeChild(elements[0])
;_opened=!1}),0==toLoad?done():websitejs.onload=function(){toLoad-=1,done()
},d.getElementsByTagName("head")[0].appendChild(websitejs),
iframeBlock.appendChild(iframeContent),
iframeBlock.appendChild(closeButton),iframeContent.appendChild(div),
d.body.appendChild(iframeBlock),d.body.appendChild(overlay),!0},
isOpened:function(){return _opened},setOpened:function(opened){_opened=opened}})
;function on(evt,elem,fct,id){
id=id||"",elem.getAttribute instanceof Function&&"1"===elem.getAttribute("mfb-"+evt+id)||(MFB.evenListeners=MFB.evenListeners||[],
MFB.evenListeners.push({event:evt,element:elem,function:fct,id:id
}),elem.setAttribute instanceof Function&&elem.setAttribute("mfb-"+evt+id,1),
elem.addEventListener?elem.addEventListener(evt,fct):elem.attachEvent?elem.attachEvent("on"+evt,fct):elem[evt]=fct)
}!function(){"use strict";var ie=function(){var map,jscript,version=0,browser=!1
;map={5.5:5.5,5.6:6,5.7:7,5.8:8,9:9,10:10}
;var matches=navigator.userAgent.match(/MSIE\s?(\d+)(?:\.(\d+))?/i)
;return null!==matches&&(browser=!0,
(void 0===(version=map[jscript=matches[1]])||parseInt(jscript)>10)&&(browser=!1,
version=0)),{version:version,browser:browser}}(),converters={text:{
mime:"text/plain",encode:function(data){return data},decode:function(data){
return data}},json:{mime:"application/json",encode:function(data){
return JSON.stringify(data)},decode:function(data){return JSON.parse(data)}}
},convert=function(text,type){var data=text
;converters[type]&&(data=(0,converters[type].decode)(data));return data
},cors=!("XDomainRequest"in window)||ie.browser&&10==ie.version,error=function(response,options){
var packet=response.data
;if("number"==typeof packet[options.status]&&(response.status=packet[options.status]),
"object"==typeof packet[options.error]){var status=""+response.status
;/^2/.test(status)||packet[options.error].message&&(response.error=new Error(""+packet[options.error].message))
}},jsonp=function(url,options){this.url=url,this.options=options}
;jsonp.counter=-1,jsonp.prototype.send=function(message){
var self=this,cb="__jsonp__"+ ++jsonp.counter
;this.options.callback&&(cb=this.options.callback),
this.url+=-1==this.url.indexOf("?")?"?":"&",
this.url+=encodeURIComponent(this.options.jsonp)+"="+encodeURIComponent(cb)
;var elem=function(tag,attrs,text){var el=document.createElement(tag)
;for(var z in attrs)el.setAttribute(z,attrs[z])
;return text&&el.appendChild(document.createTextNode(text)),el}("script",{
src:this.url});window[cb]=function(packet){
if("function"==typeof self.options.callback){var res={status:200,xhr:self,
headers:null,error:null}
;res.data=packet,error(res,self.options),self.options.callback(res)}}
;var head=document.getElementsByTagName("head")[0]||document.documentElement,done=!1
;elem.onload=elem.onreadystatechange=function(){
done||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState||(done=!0,
elem.onload=elem.onreadystatechange=null,function(){window[cb]=null;try{
delete window[cb]}catch(e){}head&&elem.parentNode&&head.removeChild(elem)}())
},head.insertBefore(elem,head.firstChild)},jsonp.prototype.abort=function(){}
;var ajax=function(options,callback){var req,z,data,jsp=!1
;if("object"!=typeof options||!("JSON"in window))return!1
;var type=options.type||"text"
;if("jsonp"==type&&(jsp=!0,type="json",options.jsonp=options.jsonp||ajax.defaults.jsonp),
!(type in converters))return!1
;if(!jsp&&(ie.browser&&ie.version<8||!("XMLHttpRequest"in window)&&!("XDomainRequest"in window)))return!1
;if("function"==typeof callback&&(options.callback=callback),options.data){
var encoder=converters[type].encode;data=encoder(options.data)}
options.error=options.error||ajax.defaults.error,
options.status=options.status||ajax.defaults.status,
data&&(jsp||"string"==typeof options.parameter)&&(options.params=options.params||{},
options.params[options.parameter||ajax.defaults.parameter]=data)
;var url=function(url,params){if(!params||"object"!=typeof params)return url
;var u=new String(url),q=[]
;for(var z in params)q.push(encodeURIComponent(z)+"="+encodeURIComponent(params[z]))
;var qs=q.join("&");return u+=-1==u.indexOf("?")?"?":"&",u+qs
}(options.url||"",options.params),method=options.method||ajax.defaults.method,headers=options.headers||{},async="boolean"==typeof options.async?options.async:ajax.defaults.async
;options.credentials=options.credentials||{},
headers["content-type"]||(headers["content-type"]=converters[type].mime)
;var response=function(response){
"function"==typeof options.callback&&(error(response,options),
options.callback(response))}
;if(jsp)(req=new jsonp(url,options)).send(data),url=req.url;else{
if(req=cors?window.XMLHttpRequest?new XMLHttpRequest:null:new XDomainRequest,
cors){if(options.fields)for(z in options.fields)req[z]=options.fields[z]
;for(z in req.open(method,url,async,options.credentials.username,options.credentials.password),
options.mime&&"function"==typeof req.overrideMimeType&&req.overrideMimeType(options.mime),
ajax.defaults.headers)req.setRequestHeader(z,ajax.defaults.headers[z])
;for(z in headers)req.setRequestHeader(z,headers[z])
;req.onreadystatechange=function(){if(4==this.readyState){
var status=""+(this.status||0),res={status:this.status,xhr:this,error:null}
;/^2/.test(status)||(res.error=new Error("XMLHttpRequest error "+status)),
res.headers=function(headers){var i,p,k,v,output={}
;for(headers=(headers=(headers=headers||"").replace("\r","")).split("\n"),
i=0;i<headers.length;i++)p=headers[i].indexOf(":"),
k=headers[i].substr(0,p),v=headers[i].substr(p+1),
k&&v&&(k=k.replace(/^\s+/,"").replace(/\s+$/,""),
v=v.replace(/^\s+/,"").replace(/\s+$/,""),output[k.toLowerCase()]=v)
;return output
}(this.getAllResponseHeaders()),""===this.responseText&&"json"===type?res.data={}:res.data=convert(this.responseText,type),
response(res)}}}else req.open(method,url),req.onload=function(){var res={
status:this.status||200,xhr:this,headers:null,error:null}
;res.data=convert(this.responseText,type),response(res)},req.onerror=function(){
var res={status:this.status||500,xhr:this,headers:null,error:null}
;res.error=new Error("XDomainRequest error"),response(res)
},req.ontimeout=req.onprogress=function(){}
;req.timeout=options.timeout||ajax.defaults.timeout,
cors?req.send(data):setTimeout(function(){req.send(data)
},options.delay||ajax.defaults.delay)}return{xhr:req,abort:req.abort,cors:cors,
ie:ie,url:url,jsonp:jsp}}
;ajax.ie=ie,ajax.jsonp=jsonp,ajax.converters=converters,ajax.defaults={
method:"GET",timeout:1e4,delay:0,async:!0,parameter:"packet",jsonp:"callback",
error:"error",status:"code",headers:{"X-Requested-With":"XMLHttpRequest"}
},window&&(window.ajaxMFB=ajax)}();var Base64={
_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
encode:function(input){var chr1,chr2,chr3,enc1,enc2,enc3,enc4,output="",i=0
;for(input=Base64._utf8_encode(input);i<input.length;)enc1=(chr1=input.charCodeAt(i++))>>2,
enc2=(3&chr1)<<4|(chr2=input.charCodeAt(i++))>>4,
enc3=(15&chr2)<<2|(chr3=input.charCodeAt(i++))>>6,
enc4=63&chr3,isNaN(chr2)?enc3=enc4=64:isNaN(chr3)&&(enc4=64),
output=output+Base64._keyStr.charAt(enc1)+Base64._keyStr.charAt(enc2)+Base64._keyStr.charAt(enc3)+Base64._keyStr.charAt(enc4)
;return output},decode:function(input){
var chr1,chr2,chr3,enc2,enc3,enc4,output="",i=0
;for(input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");i<input.length;)chr1=Base64._keyStr.indexOf(input.charAt(i++))<<2|(enc2=Base64._keyStr.indexOf(input.charAt(i++)))>>4,
chr2=(15&enc2)<<4|(enc3=Base64._keyStr.indexOf(input.charAt(i++)))>>2,
chr3=(3&enc3)<<6|(enc4=Base64._keyStr.indexOf(input.charAt(i++))),
output+=String.fromCharCode(chr1),64!=enc3&&(output+=String.fromCharCode(chr2)),
64!=enc4&&(output+=String.fromCharCode(chr3))
;return output=Base64._utf8_decode(output)},_utf8_encode:function(string){
string=string.replace(/\r\n/g,"\n");for(var utftext="",n=0;n<string.length;n++){
var c=string.charCodeAt(n)
;c<128?utftext+=String.fromCharCode(c):c>127&&c<2048?(utftext+=String.fromCharCode(c>>6|192),
utftext+=String.fromCharCode(63&c|128)):(utftext+=String.fromCharCode(c>>12|224),
utftext+=String.fromCharCode(c>>6&63|128),
utftext+=String.fromCharCode(63&c|128))}return utftext},
_utf8_decode:function(utftext){
for(var string="",i=0,c=c1=c2=0;i<utftext.length;)(c=utftext.charCodeAt(i))<128?(string+=String.fromCharCode(c),
i++):c>191&&c<224?(c2=utftext.charCodeAt(i+1),
string+=String.fromCharCode((31&c)<<6|63&c2),
i+=2):(c2=utftext.charCodeAt(i+1),c3=utftext.charCodeAt(i+2),
string+=String.fromCharCode((15&c)<<12|(63&c2)<<6|63&c3),i+=3);return string}
},StorageValues=function(){function shouldSaveInCookie(storageKeyDef){
return storageKeyDef.hasOwnProperty("storeInCookie")&&storageKeyDef.storeInCookie
}function orderCookieStorageKeyDef(storageKeyDef1,storageKeyDef2){
return(storageKeyDef1.hasOwnProperty("positionInCookie")?storageKeyDef1.positionInCookie:Number.MAX_VALUE)<(storageKeyDef2.hasOwnProperty("positionInCookie")?storageKeyDef2.positionInCookie:Number.MAX_VALUE)?-1:1
}var changeAllValues=function(value,operator,number){if(""!=value){
for(key in value=JSON.parse(value))value[key]="/"==operator?Math.ceil(value[key]/number):value[key]*number
;value=JSON.stringify(value)}return value},storageKeyDef=[{name:"s.cvs",
storeInPrivateMode:!0,storeInCookie:!1},{name:"s.ttl",storeInPrivateMode:!0,
storeInCookie:!1,positionInCookie:8},{name:"pagesHistory",storeInPrivateMode:!1,
storeInCookie:!1},{name:"deploymentVisits",getValueForCookie:function(value){
return changeAllValues(value,"/",1e3)},getValueFromCookie:function(value){
return changeAllValues(value,"*",1e3)},storeInPrivateMode:!0,
storeInLocalStorageInPrivateMode:!0,storeInCookie:!0,positionInCookie:2},{
name:"s.pagesVisited",getValueForCookie:function(value){
return!!(_Mfb_ud.hasOwnProperty("_context")&&_Mfb_ud._context.hasOwnProperty("_page")&&_Mfb_ud._context._page.hasOwnProperty("storePagesVisitedInCookie"))&&_Mfb_ud._context._page.storePagesVisitedInCookie?value:""
},storeInPrivateMode:!0,storeInCookie:!0,positionInCookie:4},{
name:"s.selectors",storeInPrivateMode:!1,storeInCookie:!0,positionInCookie:6},{
name:"s.dvs",storeInPrivateMode:!0,storeInCookie:!1},{
name:"s.startDateTimeOnSite",storeInPrivateMode:!0,storeInCookie:!1},{
name:"campaignVisits",getValueForCookie:function(value){
return changeAllValues(value,"/",1e3)},getValueFromCookie:function(value){
return changeAllValues(value,"*",1e3)},storeInPrivateMode:!0,storeInCookie:!0,
storeInLocalStorageInPrivateMode:!0,positionInCookie:1},{
name:"s.session__Mfb_ud",storeInPrivateMode:!0,storeInCookie:!1},{name:"s.nbp",
storeInPrivateMode:!0,storeInCookie:!0,positionInCookie:3},{name:"s.random",
getValueForCookie:function(value){return value.substr(0,11)},
storeInPrivateMode:!0,storeInCookie:!0,positionInCookie:5},{
name:"s.random_percent",storeInPrivateMode:!0,storeInCookie:!0,
positionInCookie:10},{name:"s.timeOutMinSite",storeInPrivateMode:!0,
storeInCookie:!0,positionInCookie:7},{name:"s.clicks",storeInPrivateMode:!0,
storeInCookie:!0,positionInCookie:9}];return{
setValuesFromCookie:function(items,ns){
storageKeyDef.filter(shouldSaveInCookie).sort(orderCookieStorageKeyDef).forEach(function(definition,index){
try{
items.hasOwnProperty(index)&&""!=items[index]&&(definition.getValueFromCookie?localStorage.setItem(ns+definition.name,definition.getValueFromCookie(items[index])):localStorage.setItem(ns+definition.name,items[index]))
}catch(err){}})},getValueForCookieStorage:function(ns){var items=""
;return storageKeyDef.filter(shouldSaveInCookie).sort(orderCookieStorageKeyDef).forEach(function(definition,index){
var orignalKey=definition.name
;if(definition.getValueForCookie)var value=definition.getValueForCookie(localStorage.getItem(ns+orignalKey)||"");else value=localStorage.getItem(ns+orignalKey)||""
;items+=value+"|"}),items},
updateCookieValueWhenChangingName:function(cookieValue){
var items=cookieValue.split("|"),newItems=""
;return storageKeyDef.filter(shouldSaveInCookie).sort(orderCookieStorageKeyDef).forEach(function(definition,index){
if(items.hasOwnProperty(index)&&""!=items[index]){definition.name
;if(definition.getValueFromCookie)var value=""!=items[index]?definition.getValueForCookie(items[index]):"";else value=items[index]
;newItems+=value+"|"}}),newItems},getStorageKeyDef:function(key,type){
return type&&"session"===type&&(key="s."+key),
storageKeyDef.find(function(definition){return definition.name===key})}}
},Storage=function(){
var localStorage=void 0===window.localStorage?{}:window.localStorage,sessionStorage=void 0===window.sessionStorage?{}:window.sessionStorage,ns="mfb.actor.beta.",storageValues=new StorageValues,privacyMode=_Mfb_ud.hasOwnProperty("_context")&&_Mfb_ud._context.hasOwnProperty("privacyMode")&&_Mfb_ud._context.privacyMode
;if(privacyMode&&(_Mfb_useCookie=!1,
Object.keys(localStorage).filter(onlyStoredInSessionStorage).forEach(expireItem)),
!0===_Mfb_useCookie&&"undefined"!=typeof _Mfb_domain){
var cookieValue=readCookie(_Mfb_domain,ns)
;cookieValue&&(cookieValue=storageValues.updateCookieValueWhenChangingName(cookieValue),
createCookie(_Mfb_domain,"_MFB_",cookieValue,360),removeCookie(_Mfb_domain,ns))}
function expireItem(key){if(localStorage.getItem(key))try{
return localStorage.removeItem(key)}catch(err){console.warn(err)}}
function belongsToCache(key){return-1!==key.indexOf(ns+"s.")}function now(){
return+new Date}function createCookie(domain,name,value,days){if(days){
var date=new Date;date.setTime(date.getTime()+24*days*60*60*1e3)
;var expires="; expires="+date.toGMTString()}else expires=""
;value=Base64.encode(value),
domain.length>0&&"."==domain.charAt(0)?document.cookie=name+"="+value+expires+";domain="+domain+"; path=/":(removeCookie("."+domain,name),
document.cookie=name+"="+value+expires+"; path=/")}
function readCookie(domain,name){
for(var nameEQ=name+"=",ca=document.cookie.split(";"),i=0;i<ca.length;i++){
for(var c=ca[i];" "==c.charAt(0);)c=c.substring(1,c.length)
;if(0==c.indexOf(nameEQ)){var value=c.substring(nameEQ.length,c.length)
;return decode=-1==value.indexOf("|"),decode?Base64.decode(value):value}}
return null}function removeCookie(domain,name){var date=new Date
;date.setTime(date.getTime()+-864e5);var expires="; expires="+date.toGMTString()
;domain.length>0&&"."==domain.charAt(0)?document.cookie=name+"=''"+expires+";domain="+domain+"; path=/":document.cookie=name+"=''"+expires+"; path=/"
}function shouldStoreKey(type,key){if(privacyMode){
var storageKeyDef=storageValues.getStorageKeyDef(key,type)
;return storageKeyDef&&storageKeyDef.storeInPrivateMode}return!0}
function onlyStoredInSessionStorage(key){var keyWithoutNs=function(key,ns){
return key.substring(ns.length)
}(key,ns),storageKeyDef=storageValues.getStorageKeyDef(keyWithoutNs)
;return storageKeyDef&&(!storageKeyDef.hasOwnProperty("storeInLocalStorageInPrivateMode")||storageKeyDef.hasOwnProperty("storeInLocalStorageInPrivateMode")&&0==storageKeyDef.storeInLocalStorageInPrivateMode)
}function getStore(type,key){if(privacyMode){
var storageKeyDef=storageValues.getStorageKeyDef(key,type)
;return storageKeyDef&&storageKeyDef.hasOwnProperty("storeInLocalStorageInPrivateMode")?localStorage:sessionStorage
}return localStorage}
return"undefined"!=typeof _Mfb_domain&&_Mfb_domain!=document.domain&&!0===_Mfb_useCookie&&function(domain,ns){
if(cookie_value=readCookie(domain,"_MFB_"),cookie_value){
if((items=cookie_value.split("|")).length>1)storageValues.setValuesFromCookie(items,ns);else{
var items=JSON.parse(cookie_value);Object.keys(items).forEach(function(key){try{
localStorage.setItem(ns+key,JSON.stringify(items[key]))}catch(err){}})}}
}(_Mfb_domain,ns),
_Mfb_useCookie||"undefined"==typeof _Mfb_domain||(removeCookie(_Mfb_domain,ns),
removeCookie(_Mfb_domain,"_MFB_")),function(){
var s_ttl=getStore("session","ttl").getItem(ns+"s.ttl")
;if(s_ttl&&(ttl=s_ttl,ttl<now())){
Object.keys(localStorage).filter(belongsToCache).forEach(expireItem)}var ttl}(),
{set:function(type,key,value){var skey=ns+key,store=getStore(type,key)
;if("session"==type){skey=ns+"s."+key;var sttl=now()+36e5
;if(shouldStoreKey("session","ttl"))getStore("session","ttl").setItem(ns+"s.ttl",sttl)
}
shouldStoreKey(type,key)&&store.setItem(skey,JSON.stringify(value)),"undefined"!=typeof _Mfb_domain&&1==_Mfb_useCookie&&function(domain,ns){
var cookie_value=storageValues.getValueForCookieStorage(ns)
;cookie_value.length<500&&createCookie(domain,"_MFB_",cookie_value,360)
}(_Mfb_domain,ns)},get:function(type,key,defaultValue){
var skey=ns+key,value=defaultValue,store=getStore(type,key);if("session"==type){
skey=ns+"s."+key;var item=store.getItem(skey);item&&(value=JSON.parse(item))
}else(item=store.getItem(skey))&&(value=JSON.parse(item));return value},
remove:function(type,key){var skey=ns+key
;"session"===type&&(skey=ns+"s."+key),expireItem(skey)}}}(),mfbTools={
IncPageVisited:function(){var nbp=Storage.get("session","nbp",0)
;nbp+=1,Storage.set("session","nbp",nbp)},StorePageVisited:function(){
var pagesVisited=Storage.get("session","pagesVisited",{}),pathname=document.location.pathname
;void 0===pagesVisited[pathname]?pagesVisited[pathname]=1:pagesVisited[pathname]+=1,
Storage.set("session","pagesVisited",pagesVisited)},
GetNumberOfVisits:function(duration){duration||(duration=30)
;var timeMin=mfbTools.getTimeMin(duration),pagesHistory=Storage.get("local","pagesHistory",{}),nbVisits=0
;if(pagesHistory&&pagesHistory.visitedPages){var sessionsIds=[]
;for(var key in pagesHistory.visitedPages){
var visitedPage=pagesHistory.visitedPages[key]
;visitedPage.time>timeMin&&sessionsIds.push(visitedPage.idSession)}
if(sessionsIds.length){sessionsIds.sort()
;var sessionsIdsFiltered=sessionsIds.filter(function(item,pos,array){
return 0===pos||item!==array[pos-1]})}nbVisits=sessionsIdsFiltered.length}
return nbVisits},StoreHistory:function(){var url,pageProperties,storageDuration
;_Mfb_ud.hasOwnProperty("_context")&&_Mfb_ud._context.hasOwnProperty("_page")?(url=_Mfb_ud._context._page.url?_Mfb_ud._context._page.url:location.pathname,
pageProperties=_Mfb_ud._context._page.pageProperties?_Mfb_ud._context._page.pageProperties:void 0,
storageDuration=_Mfb_ud._context._page.hasOwnProperty("storageDuration")?_Mfb_ud._context._page.storageDuration:30):(url=location.pathname,
pageProperties=void 0,storageDuration=30);var newHistory={url:url,
time:Date.now(),pageProperties:pageProperties,idSession:1
},history=Storage.get("local","pagesHistory",void 0)
;if(history&&history.visitedPages.length>0){
var timeMin=this.getTimeMin(storageDuration)
;history.visitedPages=history.visitedPages.filter(function(item){
return item.time>timeMin});var isOnError,nbp=Storage.get("session","nbp",0)
;if(history.visitedPages.length>0)var lastIdSession=history.visitedPages.slice(-1)[0].idSession;else lastIdSession=0
;newHistory.idSession=1==nbp?++lastIdSession:lastIdSession,
newHistory.time>timeMin&&history.visitedPages.push(newHistory);do{try{
isOnError=!1,
"string"!=typeof JSON.parse(JSON.stringify(history))?Storage.set("local","pagesHistory",history):console.log("JSON reimplementation : impossible to store history on this page.")
}catch(error){
history.visitedPages.length>0&&(history.visitedPages.shift(),isOnError=!0)}
}while(!0===isOnError)}else history={visitedPages:[newHistory]
},"string"!=typeof JSON.parse(JSON.stringify(history))?Storage.set("local","pagesHistory",history):console.log("JSON reimplementation : impossible to store history on this page.")
},getTimeMin:function(nbDay){return Date.now()-864e5*nbDay},
getLangAndCountry:function(params){var contextLang=null
;_Mfb_ud&&void 0!==_Mfb_ud._context&&void 0!==_Mfb_ud._context.lang&&(contextLang=_Mfb_ud._context.lang)
;var forceLanguage=params.forced_language||null,browserLanguage=navigator.language||null
;return forceLanguage||(contextLang||browserLanguage)},
getLangAndCountryAsArray:function(params){
var lang=this.getLangAndCountry(params),country=null;if(lang){
var locale=lang.split("-")
;locale&&2===locale.length&&(lang=locale[0],country=locale[1])}
return[lang,country]},getTranslatedSetting:function(params,key){
var langAndCountry=this.getLangAndCountryAsArray(params),lang=langAndCountry[0],country=langAndCountry[1],settings=params.settings||[]
;if(void 0!==settings[key]){
if(lang&&country&&void 0!==settings[key][lang+"-"+country])return settings[key][lang+"-"+country]
;if(lang&&void 0!==settings[key][lang])return settings[key][lang]
;if(void 0!==settings[key].inputLanguage)return settings[key].inputLanguage
;if("string"==typeof settings[key])return settings[key]}
return console.warn("Unable to get the translated setting text!"),""},
abortDeployment:function(){
var iframeContent=document.getElementById("mfbIframeContent"),iframeOverlay=document.getElementById("mfbIframeOverlay")
;iframeContent&&iframeContent.parentNode.removeChild(iframeContent),
iframeOverlay&&iframeOverlay.parentNode.removeChild(iframeOverlay)
;var navBar=document.getElementById("mfbNavbar")
;throw navBar&&navBar.parentNode.removeChild(navBar),
new Error("unable to get visitorAcceptance")},
visitorAcceptanceJsonPCallback:function(visitorAcceptance){
visitorAcceptance&&visitorAcceptance&&visitorAcceptance.visitorUID?$$globalActorMFBD$$=visitorAcceptance.visitorUID:mfbTools.abortDeployment()
},checkDepStatus:function(params,url,index){
if($$globalActorMFBDAccepted$$=!1,"undefined"!=typeof _Mfb_domain&&-1==document.domain.indexOf(_Mfb_domain))return!1
;if("inPage"!=params.triggered_action)if(void 0===_Mfb_ud.preview||!1===_Mfb_ud.preview){
var show;if(0==(show=function(){
if(void 0!==params.campaign_id&&0!=params.campaign_id&&""!=params.campaign_id){
var cv=mfbTools.getCampaignVisits(params.campaign_id)
;if(cv)if((new Date).getTime()<cv+36e5)return!1
;var campaignTriggerSession=Storage.get("session","cvs",[])
;if(campaignTriggerSession.indexOf(params.campaign_id)>=0)return!1
;campaignTriggerSession.push(params.campaign_id),
Storage.set("session","cvs",campaignTriggerSession)}
if(void 0!==params.deployment_id&&0!=params.deployment_id&&""!=params.deployment_id){
var dv=mfbTools.getDeploymentVisits(params.deployment_id)
;if(dv)if((new Date).getTime()<dv+36e5)return!1
;var deploymentTriggerSession=Storage.get("session","dvs",[])
;if(deploymentTriggerSession.indexOf(params.deployment_id)>=0)return!1
;deploymentTriggerSession.push(params.deployment_id),
Storage.set("session","dvs",deploymentTriggerSession)}return!0
}())&&(void 0===params.settings.forceShow||"on"!=params.settings.forceShow))return!1
;if(1==show||0==show&&void 0!==params.settings.forceShow&&"on"==params.settings.forceShow)if(MFB.checkedDep.hasOwnProperty(params.deployment_id))null!=$$globalActorMFBD$$&&mfbTools.callback(params);else{
var datas={deployment_id:params.deployment_id,visitData:MFB.getVarsDatas(),
campaign_id:params.campaign_id,object_id:params.object_id,
testMode:params.testMode,previewMode:params.previewMode}
;0==show&&void 0!==params.settings.forceShow&&"on"==params.settings.forceShow&&(datas.onlyGetVisitor=!0),
"displayPopin"==params.triggered_action&&"URL"==params.settings.displayMode&&(datas.onlyGetVisitor=!0),
1==params.testMode||void 0!==params.triggered_action&&"actionEvent"===params.triggered_action||(mfbTools._isIE()?ajaxMFB({
url:url,type:"jsonp",headers:{Accept:"application/json, text/json, */*; q=0.01"
},method:"POST",callback:"MFB.visitorAcceptanceJsonPCallback",data:datas,
fields:{withCredentials:!0}}):ajaxMFB({url:url,type:"json",headers:{
Accept:"application/json, text/json, */*; q=0.01"},method:"POST",data:datas,
fields:{withCredentials:!0}},function(data){if(data){
var visitorAcceptance=data.data
;visitorAcceptance&&visitorAcceptance.visitorUID?$$globalActorMFBD$$=visitorAcceptance.visitorUID:mfbTools.abortDeployment()
}else mfbTools.abortDeployment()
})),mfbTools.callback(params),MFB.checkedDep[params.deployment_id]=1}
}else mfbTools.callback(params);else mfbTools.callback(params)},
callback:function(params){
if(void 0!==params.triggered_action&&"actionEvent"===params.triggered_action){
var elem=document.querySelector(params.source)
;null!==elem&&mfbTools.triggerEvent(elem,params.value,params.data)}else{
var varDatasQS=window.MFB.getVarsDatasAsQueryString(),contextVarDatasQS=window.MFB.getContextVarsDatasAsQueryString()
;if(varDatasQS){var src=params.urlDeployment
;src.indexOf("?")>=0?src+="&":src+="?",params.urlDeployment=src}
var actionTriggered=!1;switch(params.triggered_action||""){case"pixel":
actionTriggered=Pixel.load({fvidx:index,src:params.urlDeployment});break
;case"image":Image.load(params),actionTriggered=Image.open({
src:params.urlDeployment+(varDatasQS||""),img:params.img,
width:params.settings.width||"",height:params.settings.height||""});break
;case"exitPopup":
params.varsDatas=MFB.getVarsDatas(),actionTriggered=mfbExitPopup.open(params)
;break;case"popup":
if(popup=window.open(params.urlDeployment+(varDatasQS||"")),Storage.get("session","popupBlocked",!1))return!1
;if("undefined"!=typeof popup)break
;return Storage.set("session","popupBlocked",!0),!1;case"bar":case"button":
Navbar.load(params),
params.src=params.urlDeployment+(varDatasQS||""),params.urlDeployment=params.urlDeployment+(contextVarDatasQS||""),
actionTriggered=Navbar.display(params);break;case"displayPopin":
DisplayPopin.load(params),
params.src=params.urlDeployment+(varDatasQS||""),params.urlDeployment=params.urlDeployment+(contextVarDatasQS||""),
actionTriggered=DisplayPopin.display(params);break;case"inPage":
params.src=params.urlDeployment+(varDatasQS||""),
params.urlDeployment=params.urlDeployment+(varDatasQS||""),
actionTriggered=InPage.load(params);break;default:
Iframe.load(params),params.src=params.urlDeployment+(varDatasQS||""),
params.urlDeployment=params.urlDeployment+(contextVarDatasQS||""),
actionTriggered=Iframe.open(params)}
if(actionTriggered&&(void 0===_Mfb_ud.preview||!1===_Mfb_ud.preview)){
var cv=(new Date).getTime(),campaignVisits=Storage.get("local","campaignVisits",{})
;campaignVisits[params.campaign_id]=cv,
Storage.set("local","campaignVisits",campaignVisits)
;var dv=(new Date).getTime(),deploymentVisits=Storage.get("local","deploymentVisits",{})
;deploymentVisits[params.deployment_id]=dv,
Storage.set("local","deploymentVisits",deploymentVisits)}
actionTriggered&&mfbTools.triggerEvent(window,"MFB_Triggered_Action",{
action:params.triggered_action,campaign_id:params.campaign_id,
deployment_id:params.deployment_id})}},contains:function(container,maybe){
return container.contains?container.contains(maybe):!!(16&container.compareDocumentPosition(maybe))
},mouseEnterLeave:function(elem,type,method){
var mouseEnter="mouseenter"===type,ie=mouseEnter?"fromElement":"toElement",method2=function(e){
var target=(e=e||window.event).target||e.srcElement,related=e.relatedTarget||e[ie]
;elem!==target&&!contains(elem,target)||contains(elem,related)||method()}
;return on(type=mouseEnter?"mouseover":"mouseout",elem,method2),method2},
apply:function(o,c){if(o&&c&&"object"==typeof c)for(var p in c)o[p]=c[p]
;return o},createEl:function(type,attributes,styles,parent){
void 0===parent&&(parent=window.document);var attr,n=parent.createElement(type)
;for(attr in attributes)"innerHTML"==attr?n.innerHTML=attributes[attr]:n.setAttribute(attr,attributes[attr])
;return n=mfbTools.applyStyle(n,styles)},applyStyle:function(el,styles){
if(styles){var styleStr=""
;for(style in styles)styleStr+=style+":"+styles[style]+";"
;el.setAttribute("style",styleStr)}return el},
addDefaultAndSettingCss:function(defaultCss,defaultCssValues,id,cssClass){
if(defaultCssValues&&id){var styleStr="#"+id
;for(defaultCssValue in cssClass&&(styleStr+="."+cssClass),
styleStr+="{",defaultCssValues)defaultCssValue&&(styleStr+=defaultCssValue+":"+defaultCssValues[defaultCssValue]+";")
;styleStr+="}";var cssNode=document.createTextNode(styleStr)
;defaultCss.appendChild(cssNode)}},
addAdvancedSettingCss:function(cssAdvancedStyle,value){if(value){
value=JSON.stringify(value).substring(1).slice(0,-1)
;var cssNode=document.createTextNode(value)
;cssAdvancedStyle.appendChild(cssNode)}},getTextWidth:function(text,font){
var context=(mfbTools.getTextWidth.canvas||(mfbTools.getTextWidth.canvas=document.createElement("canvas"))).getContext("2d")
;return context.font=font,context.measureText(text).width},
getCampaignVisits:function(campaign_id){
var storage_cv=Storage.get("local","campaignVisits",{})[campaign_id]||0,cv=void 0
;return"object"!=typeof storage_cv?cv=storage_cv:storage_cv.hasOwnProperty("date")&&(cv=storage_cv.date),
cv},getDeploymentVisits:function(deployment_id){
var storage_dv=Storage.get("local","deploymentVisits",{})[deployment_id]||0,dv=void 0
;return"object"!=typeof storage_dv?dv=storage_dv:storage_dv.hasOwnProperty("date")&&(dv=storage_dv.date),
dv},triggerEvent:function(el,eventName,options){var event
;window.CustomEvent&&"function"==typeof window.CustomEvent?event=new CustomEvent(eventName,{
detail:options
}):(event=document.createEvent("CustomEvent")).initCustomEvent(eventName,!0,!0,{
detail:options}),el.dispatchEvent(event)},_isIE:function(){
var myNav=navigator.userAgent.toLowerCase(),isIeBefore11=-1!=myNav.indexOf("msie")&&parseInt(myNav.split("msie")[1]),isIe11=!!window.MSInputMethodContext&&!!document.documentMode
;return isIeBefore11||isIe11},
removeEventListener:function(element,event,functionToRemove,scenario_id){
element.getAttribute instanceof Function&&"1"===element.getAttribute("mfb-"+event+scenario_id)&&element.setAttribute("mfb-"+event+scenario_id,0),
element.removeEventListener(event,functionToRemove)}}
;MFB.getVarsDatasAsQueryString=function(){
var qs="",session__Mfb_ud=MFB.getSessionMfbUd()
;keys=Object.keys(session__Mfb_ud);for(var i=0;i<keys.length;i++){
if(keys[i].indexOf("utm_")>=0)qs+=keys[i]+"="+encodeURIComponent(session__Mfb_ud[keys[i]]);else if("_context"==keys[i]){
var contextUrlParts=[],context=session__Mfb_ud[keys[i]]
;contextKeys=Object.keys(context)
;for(var k=0;k<contextKeys.length;k++)"_page"!=contextKeys[k]&&contextUrlParts.push(contextKeys[k]+"="+encodeURIComponent(context[contextKeys[k]]))
;qs+=contextUrlParts.join("&")}else{var value=session__Mfb_ud[keys[i]]
;if(Array.isArray(value)){
for(var urlParts=[],j=0;j<value.length;j++)if("object"==typeof value[j])for(var objKeys=Object.keys(value[j]),objectKey=0;objectKey<objKeys.length;objectKey++)urlParts.push("d:"+keys[i]+"["+j+"]["+objKeys[objectKey]+"]="+encodeURIComponent(value[j][objKeys[objectKey]]));else urlParts.push("d:"+keys[i]+"["+j+"]="+encodeURIComponent(value[j]))
;qs+=urlParts.join("&")}else if("object"==typeof value){
for(urlParts=[],objKeys=Object.keys(value),
objectKey=0;objectKey<objKeys.length;objectKey++)urlParts.push("d:"+keys[i]+"[0]["+objKeys[objectKey]+"]="+encodeURIComponent(value[objKeys[objectKey]]))
;qs+=urlParts.join("&")}else qs+="d:"+keys[i]+"="+encodeURIComponent(value)}
i+1<keys.length&&(qs+="&")}return qs=""!=qs?qs:void 0
},MFB.getContextVarsDatasAsQueryString=function(){
var qs="",session__Mfb_ud=MFB.getSessionMfbUd()
;keys=Object.keys(session__Mfb_ud)
;for(var i=0;i<keys.length;i++)if("_context"==keys[i]){
var contextUrlParts=[],context=session__Mfb_ud[keys[i]]
;contextKeys=Object.keys(context)
;for(var k=0;k<contextKeys.length;k++)"_page"!=contextKeys[k]&&contextUrlParts.push(contextKeys[k]+"="+encodeURIComponent(context[contextKeys[k]]))
;qs+=contextUrlParts.join("&")}return qs=""!=qs?qs:void 0
},MFB.getVarsDatas=function(){
var varDatas={},session__Mfb_ud=MFB.getSessionMfbUd()
;return session__Mfb_ud&&(varDatas=session__Mfb_ud)._context&&delete varDatas._context,
varDatas},MFB.getContext=function(){var session__Mfb_ud=MFB.getSessionMfbUd()
;if(session__Mfb_ud&&session__Mfb_ud._context)return session__Mfb_ud._context
},MFB.getNowLocalized=function(){return new Date
},MFB.getSessionMfbUd=function(){
var session__Mfb_ud=Storage.get("session","session__Mfb_ud",{})
;return"object"==typeof session__Mfb_ud&&null!==session__Mfb_ud?session__Mfb_ud:null
},MFB.visitorAcceptanceJsonPCallback=mfbTools.visitorAcceptanceJsonPCallback
;var PlatformDetect={getBrowsersPatterns:function(){return{
fullPattern:/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,
shortPattern:/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,
tabletPattern:/android|ipad|playbook|silk/i}},
getPlatform:function(userAgent,maxPhoneWidth){
return PlatformDetect.isMobile(userAgent)?(phoneSized=PlatformDetect.isPhoneSized(maxPhoneWidth),
void 0===phoneSized?"mobile":phoneSized?"phone":"tablet"):PlatformDetect.isTablet(userAgent)?"tablet":"desktop"
},isPhoneSized:function(width){
if("undefined"!=typeof window&&window.screen&&null!=width){
var smallerSide=window.screen.width<window.screen.height?window.screen.width:window.screen.height
;return width<0?void 0:smallerSide<=width}},isMobile:function(userAgent){
var pattern=PlatformDetect.getBrowsersPatterns()
;return pattern.fullPattern.test(userAgent)||pattern.shortPattern.test(userAgent.substr(0,4))
},isTablet:function(userAgent){
return PlatformDetect.getBrowsersPatterns().tabletPattern.test(userAgent)}}
;function each(data,_$){var l
;if(data)if("[object Array]"===Object.prototype.toString.call(data))for(l=data.length,
i=0;i<l&&!1!==_$(i,data[i]);i++);else for(var i in data)if(!1===_$(i,data[i]))break
}!function(){
if(MFB&&MFB.evenListeners&&MFB.evenListeners.length>0)for(var i=0;i<MFB.evenListeners.length;i++){
var current=MFB.evenListeners[i]
;mfbTools.removeEventListener(current.element,current.event,current.function,current.id)
}
if(MFB.evenListeners=[],MFB&&MFB.existingTimeouts&&MFB.existingTimeouts.length>0)for(i=0;i<MFB.existingTimeouts.length;i++){
current=MFB.existingTimeouts[i];clearTimeout(current)}
if(MFB.existingTimeouts=[],
MFB.checkedDep={},void 0===window.sessionStorage)return!1
;Function.prototype.bind||(Function.prototype.bind=function(oThis){
if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable")
;var aArgs=Array.prototype.slice.call(arguments,1),fToBind=this,fNOP=function(){},fBound=function(){
return fToBind.apply(this instanceof fNOP&&oThis?this:oThis,aArgs.concat(Array.prototype.slice.call(arguments)))
};return fNOP.prototype=this.prototype,fBound.prototype=new fNOP,fBound
}),Object.keys||(Object.keys=function(){"use strict"
;var hasOwnProperty=Object.prototype.hasOwnProperty,hasDontEnumBug=!{
toString:null
}.propertyIsEnumerable("toString"),dontEnums=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],dontEnumsLength=dontEnums.length
;return function(obj){
if("object"!=typeof obj&&("function"!=typeof obj||null===obj))throw new TypeError("Object.keys called on non-object")
;var prop,i,result=[]
;for(prop in obj)hasOwnProperty.call(obj,prop)&&result.push(prop)
;if(hasDontEnumBug)for(i=0;i<dontEnumsLength;i++)hasOwnProperty.call(obj,dontEnums[i])&&result.push(dontEnums[i])
;return result}
}()),0==Storage.get("session","startDateTimeOnSite",0)&&Storage.set("session","startDateTimeOnSite",(new Date).getTime()),
Storage.remove("local","visits"),
mfbTools.IncPageVisited(),mfbTools.StorePageVisited(),
mfbTools.StoreHistory(),Storage.set("session","selectors",[])
;var ud_keys=Object.keys(_Mfb_ud),session__Mfb_ud=Storage.get("session","session__Mfb_ud",{})
;for(i=0;i<ud_keys.length;i++){var ud_key=ud_keys[i],ud_val=_Mfb_ud[ud_key]
;if(""!=ud_val)if(ud_val instanceof Array)session__Mfb_ud[ud_key]=ud_val;else if(ud_val instanceof Object){
var ud_val_keys=Object.keys(ud_val);session__Mfb_ud[ud_key]={}
;for(var j=0;j<ud_val_keys.length;j++){var ud_val_key=ud_val_keys[j]
;session__Mfb_ud[ud_key][ud_val_key]=ud_val[ud_val_key]}
}else session__Mfb_ud[ud_key]=ud_val}
if(Storage.set("session","session__Mfb_ud",session__Mfb_ud),
on("message",window,function(message){var l=document.createElement("a")
;if(l.href=message.origin,
"room.myfeelback.com"==l.hostname||"mfb.li"==l.hostname)try{
var ctx=(message=JSON.parse(message.data)).context;message.post
;if(message.ctx&&message.post){
var campaignVisits=Storage.get("local","campaignVisits",{}),cv=campaignVisits[ctx[1]]||0
;cv&&(cv.fb=!0,
campaignVisits[ctx[1]]=cv,Storage.set("local","campaignVisits",campaignVisits))}
}catch(e){}}),on("message",window,function(message){try{var data=message.data
;if(data.get&&"getDatas"==data.get){var postData={
varsDatas:MFB.getVarsDatas()||"",context:MFB.getContext()||""}
;message.source.postMessage(postData,"*")}}catch(e){}}),MFB_datalayerless){
var attributeValue=null,respondentCache=sessionStorage.getItem(MFB_RESPONDENT_ATTR_CACHE_KEY),attributeName=MFB_datalayerless.attributeName
;null!==respondentCache&&(respondentCache=JSON.parse(respondentCache),
_Mfb_ud&&_Mfb_ud.hasOwnProperty(attributeName)&&(attributeValue=void 0===_Mfb_ud[attributeName]?null:_Mfb_ud[attributeName])!==respondentCache.attributeValue&&(sessionStorage.removeItem(MFB_CONDITION_CACHE_KEY),
sessionStorage.removeItem(MFB_RESPONDENT_ATTR_CACHE_KEY),
Storage.remove("local","campaignVisits"),
Storage.remove("local","deploymentVisits"),
Storage.remove("session","cvs"),Storage.remove("session","dvs"))),
_Mfb_ud.hasOwnProperty(attributeName)&&(attributeValue=void 0===_Mfb_ud[attributeName]?null:_Mfb_ud[attributeName],
sessionStorage.setItem(MFB_RESPONDENT_ATTR_CACHE_KEY,JSON.stringify({
attributeValue:attributeValue})))}}(),function(a){
var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+-new Date,v=a.document,w=0,x=0,y=eb(),z=eb(),A=eb(),B=function(a,b){
return a===b&&(l=!0),0
},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){
for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1
},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+L+"*\\]",O=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+N+")*)|.*)\\)|)",P=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),Q=new RegExp("^"+L+"*,"+L+"*"),R=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),S=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),T=new RegExp(O),U=new RegExp("^"+M+"$"),V={
ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),
TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),
CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),
bool:new RegExp("^(?:"+K+")$","i"),
needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")
},W=/^(?:input|select|textarea|button)$/i,X=/^h\d$/i,Y=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,$=/[+~]/,_=/'|\\/g,ab=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),bb=function(a,b,c){
var d="0x"+b-65536
;return d!=d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)
};try{
H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType
}catch(cb){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){
for(var c=a.length,d=0;a[c++]=b[d++];);a.length=c-1}}}function db(a,b,d,e){
var f,h,j,k,l,o,r,s,w,x
;if((b?b.ownerDocument||b:v)!==n&&m(b),d=d||[],!a||"string"!=typeof a)return d
;if(1!==(k=(b=b||n).nodeType)&&9!==k)return[];if(p&&!e){
if(f=Z.exec(a))if(j=f[1]){if(9===k){
if(!(h=b.getElementById(j))||!h.parentNode)return d
;if(h.id===j)return d.push(h),d
}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),
d}else{if(f[2])return H.apply(d,b.getElementsByTagName(a)),d
;if((j=f[3])&&c.getElementsByClassName)return H.apply(d,b.getElementsByClassName(j)),
d}if(c.qsa&&(!q||!q.test(a))){
if(s=r=u,w=b,x=9===k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){
for(o=g(a),(r=b.getAttribute("id"))?s=r.replace(_,"\\$&"):b.setAttribute("id",s),
s="[id='"+s+"'] ",l=o.length;l--;)o[l]=s+ob(o[l])
;w=$.test(a)&&mb(b.parentNode)||b,x=o.join(",")}if(x)try{
return H.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{
r||b.removeAttribute("id")}}}return i(a.replace(P,"$1"),b,d,e)}function eb(){
var a=[];return function b(c,e){
return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}}
function fb(a){return a[u]=!0,a}function gb(a){var b=n.createElement("div");try{
return!!a(b)}catch(c){return!1}finally{
b.parentNode&&b.parentNode.removeChild(b),b=null}}function hb(a,b){
for(var c=a.split("|"),e=a.length;e--;)d.attrHandle[c[e]]=b}function ib(a,b){
var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C)
;if(d)return d;if(c)for(;c=c.nextSibling;)if(c===b)return-1;return a?1:-1}
function jb(a){return function(b){
return"input"===b.nodeName.toLowerCase()&&b.type===a}}function kb(a){
return function(b){var c=b.nodeName.toLowerCase()
;return("input"===c||"button"===c)&&b.type===a}}function lb(a){
return fb(function(b){return b=+b,fb(function(c,d){
for(var e,f=a([],c.length,b),g=f.length;g--;)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}
function mb(a){return a&&void 0!==a.getElementsByTagName&&a}
for(b in c=db.support={},f=db.isXML=function(a){
var b=a&&(a.ownerDocument||a).documentElement;return!!b&&"HTML"!==b.nodeName
},m=db.setDocument=function(a){var b,e=a?a.ownerDocument||a:v,g=e.defaultView
;return e!==n&&9===e.nodeType&&e.documentElement?(n=e,
o=e.documentElement,p=!f(e),
g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){m()
},!1):g.attachEvent&&g.attachEvent("onunload",function(){m()
})),c.attributes=gb(function(a){
return a.className="i",!a.getAttribute("className")
}),c.getElementsByTagName=gb(function(a){
return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),
c.getElementsByClassName=Y.test(e.getElementsByClassName),
c.getById=gb(function(a){
return o.appendChild(a).id=u,!e.getElementsByName||!e.getElementsByName(u).length
}),c.getById?(d.find.ID=function(a,b){if(void 0!==b.getElementById&&p){
var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}
},d.filter.ID=function(a){var b=a.replace(ab,bb);return function(a){
return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){
var b=a.replace(ab,bb);return function(a){
var c=void 0!==a.getAttributeNode&&a.getAttributeNode("id")
;return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){
return void 0!==b.getElementsByTagName?b.getElementsByTagName(a):void 0
}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){
for(;c=f[e++];)1===c.nodeType&&d.push(c);return d}return f
},d.find.CLASS=c.getElementsByClassName&&function(a,b){
return p?b.getElementsByClassName(a):void 0
},r=[],q=[],(c.qsa=Y.test(e.querySelectorAll))&&(gb(function(a){
a.innerHTML="<select msallowcapture=''><option selected=''></option></select>",
a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),
a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),
a.querySelectorAll(":checked").length||q.push(":checked")}),gb(function(a){
var b=e.createElement("input")
;b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),
a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),
a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),
a.querySelectorAll("*,:x"),q.push(",.*:")
})),(c.matchesSelector=Y.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&gb(function(a){
c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",O)
}),q=q.length&&new RegExp(q.join("|")),
r=r.length&&new RegExp(r.join("|")),b=Y.test(o.compareDocumentPosition),
t=b||Y.test(o.contains)?function(a,b){
var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode
;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))
}:function(a,b){if(b)for(;b=b.parentNode;)if(b===a)return!0;return!1
},B=b?function(a,b){if(a===b)return l=!0,0
;var d=!a.compareDocumentPosition-!b.compareDocumentPosition
;return d||(1&(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1)||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===v&&t(v,a)?-1:b===e||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)
}:function(a,b){if(a===b)return l=!0,0
;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],i=[b]
;if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:k?J(k,a)-J(k,b):0
;if(f===g)return ib(a,b);for(c=a;c=c.parentNode;)h.unshift(c)
;for(c=b;c=c.parentNode;)i.unshift(c);for(;h[d]===i[d];)d++
;return d?ib(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},e):n
},db.matches=function(a,b){return db(a,null,null,b)
},db.matchesSelector=function(a,b){
if((a.ownerDocument||a)!==n&&m(a),b=b.replace(S,"='$1']"),
!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b)
;if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d
}catch(e){}return db(b,n,null,[a]).length>0},db.contains=function(a,b){
return(a.ownerDocument||a)!==n&&m(a),t(a,b)},db.attr=function(a,b){
(a.ownerDocument||a)!==n&&m(a)
;var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0
;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null
},db.error=function(a){
throw new Error("Syntax error, unrecognized expression: "+a)
},db.uniqueSort=function(a){var b,d=[],e=0,f=0
;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){
for(;b=a[f++];)b===a[f]&&(e=d.push(f));for(;e--;)a.splice(d[e],1)}return k=null,
a},e=db.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){
if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent
;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)
}else if(3===f||4===f)return a.nodeValue}else for(;b=a[d++];)c+=e(b);return c
},d=db.selectors={cacheLength:50,createPseudo:fb,match:V,attrHandle:{},find:{},
relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{
dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{
ATTR:function(a){
return a[1]=a[1].replace(ab,bb),a[3]=(a[3]||a[4]||a[5]||"").replace(ab,bb),
"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){
return a[1]=a[1].toLowerCase(),
"nth"===a[1].slice(0,3)?(a[3]||db.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),
a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&db.error(a[0]),a},PSEUDO:function(a){
var b,c=!a[6]&&a[2]
;return V.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&T.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),
a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){
var b=a.replace(ab,bb).toLowerCase();return"*"===a?function(){return!0
}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},
CLASS:function(a){var b=y[a+" "]
;return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){
return b.test("string"==typeof a.className&&a.className||void 0!==a.getAttribute&&a.getAttribute("class")||"")
})},ATTR:function(a,b,c){return function(d){var e=db.attr(d,a)
;return null==e?"!="===b:!b||(e+="",
"="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b&&(e===c||e.slice(0,c.length+1)===c+"-"))
}},CHILD:function(a,b,c,d,e){
var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b
;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){
var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h
;if(q){if(f){for(;p;){
for(l=b;l=l[p];)if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1
;o=p="only"===a&&!o&&"nextSibling"}return!0}
if(o=[g?q.firstChild:q.lastChild],g&&s){
for(n=(j=(k=q[u]||(q[u]={}))[a]||[])[0]===w&&j[1],
m=j[0]===w&&j[2],l=n&&q.childNodes[n];l=++n&&l&&l[p]||(m=n=0)||o.pop();)if(1===l.nodeType&&++m&&l===b){
k[a]=[w,n,m];break}
}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else for(;(l=++n&&l&&l[p]||(m=n=0)||o.pop())&&((h?l.nodeName.toLowerCase()!==r:1!==l.nodeType)||!++m||(s&&((l[u]||(l[u]={}))[a]=[w,m]),
l!==b)););return(m-=e)===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){
var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||db.error("unsupported pseudo: "+a)
;return e[u]?e(b):e.length>1?(c=[a,a,"",b],
d.setFilters.hasOwnProperty(a.toLowerCase())?fb(function(a,c){
for(var d,f=e(a,b),g=f.length;g--;)a[d=J(a,f[g])]=!(c[d]=f[g])}):function(a){
return e(a,0,c)}):e}},pseudos:{not:fb(function(a){
var b=[],c=[],d=h(a.replace(P,"$1"));return d[u]?fb(function(a,b,c,e){
for(var f,g=d(a,null,e,[]),h=a.length;h--;)(f=g[h])&&(a[h]=!(b[h]=f))
}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:fb(function(a){
return function(b){return db(a,b).length>0}}),contains:fb(function(a){
return a=a.replace(ab,bb),function(b){
return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:fb(function(a){
return U.test(a||"")||db.error("unsupported lang: "+a),
a=a.replace(ab,bb).toLowerCase(),function(b){var c;do{
if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return(c=c.toLowerCase())===a||0===c.indexOf(a+"-")
}while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){
var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){
return a===o},focus:function(a){
return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)
},enabled:function(a){return!1===a.disabled},disabled:function(a){
return!0===a.disabled},checked:function(a){var b=a.nodeName.toLowerCase()
;return"input"===b&&!!a.checked||"option"===b&&!!a.selected},
selected:function(a){
return a.parentNode&&a.parentNode.selectedIndex,!0===a.selected},
empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1
;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){
return X.test(a.nodeName)},input:function(a){return W.test(a.nodeName)},
button:function(a){var b=a.nodeName.toLowerCase()
;return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b
;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())
},first:lb(function(){return[0]}),last:lb(function(a,b){return[b-1]}),
eq:lb(function(a,b,c){return[0>c?c+b:c]}),even:lb(function(a,b){
for(var c=0;b>c;c+=2)a.push(c);return a}),odd:lb(function(a,b){
for(var c=1;b>c;c+=2)a.push(c);return a}),lt:lb(function(a,b,c){
for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:lb(function(a,b,c){
for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq,{
radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=jb(b);for(b in{
submit:!0,reset:!0})d.pseudos[b]=kb(b);function nb(){}function ob(a){
for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function pb(a,b,c){
var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){
for(;b=b[d];)if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){
var h,i,j=[w,f];if(g){for(;b=b[d];)if((1===b.nodeType||e)&&a(b,c,g))return!0
}else for(;b=b[d];)if(1===b.nodeType||e){
if((h=(i=b[u]||(b[u]={}))[d])&&h[0]===w&&h[1]===f)return j[2]=h[2]
;if(i[d]=j,j[2]=a(b,c,g))return!0}}}function qb(a){
return a.length>1?function(b,c,d){
for(var e=a.length;e--;)if(!a[e](b,c,d))return!1;return!0}:a[0]}
function sb(a,b,c,d,e){
for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),
j&&b.push(h));return g}function tb(a,b,c,d,e,f){
return d&&!d[u]&&(d=tb(d)),e&&!e[u]&&(e=tb(e,f)),fb(function(f,g,h,i){
var j,k,l,m=[],n=[],o=g.length,p=f||function(a,b,c){
for(var d=0,e=b.length;e>d;d++)db(a,b[d],c);return c
}(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:sb(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q
;if(c&&c(q,r,h,i),
d)for(j=sb(r,n),d(j,[],h,i),k=j.length;k--;)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))
;if(f){if(e||a){if(e){for(j=[],k=r.length;k--;)(l=r[k])&&j.push(q[k]=l)
;e(null,r=[],j,i)}
for(k=r.length;k--;)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}
}else r=sb(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}
function ub(a){
for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=pb(function(a){
return a===b},h,!0),l=pb(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){
return!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d))
}];f>i;i++)if(c=d.relative[a[i].type])m=[pb(qb(m),c)];else{
if((c=d.filter[a[i].type].apply(null,a[i].matches))[u]){
for(e=++i;f>e&&!d.relative[a[e].type];e++);
return tb(i>1&&qb(m),i>1&&ob(a.slice(0,i-1).concat({
value:" "===a[i-2].type?"*":""
})).replace(P,"$1"),c,e>i&&ub(a.slice(i,e)),f>e&&ub(a=a.slice(e)),f>e&&ob(a))}
m.push(c)}return qb(m)}function vb(a,b){
var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){
var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length
;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){
for(m=0;o=a[m++];)if(o(l,g,h)){i.push(l);break}k&&(w=v)}
c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){for(m=0;o=b[m++];)o(r,s,g,h)
;if(f){if(p>0)for(;q--;)r[q]||s[q]||(s[q]=F.call(i));s=sb(s)}
H.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&db.uniqueSort(i)}
return k&&(w=v,j=t),r};return c?fb(f):f}
nb.prototype=d.filters=d.pseudos,d.setFilters=new nb,
g=db.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "]
;if(k)return b?0:k.slice(0);for(h=a,i=[],j=d.preFilter;h;){
for(g in(!c||(e=Q.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,
(e=R.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(P," ")
}),h=h.slice(c.length)),
d.filter)!(e=V[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,
type:g,matches:e}),h=h.slice(c.length));if(!c)break}
return b?h.length:h?db.error(a):z(a,i).slice(0)},h=db.compile=function(a,b){
var c,d=[],e=[],f=A[a+" "];if(!f){
for(b||(b=g(a)),c=b.length;c--;)(f=ub(b[c]))[u]?d.push(f):e.push(f)
;(f=A(a,vb(e,d))).selector=a}return f},i=db.select=function(a,b,e,f){
var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a)
;if(e=e||[],1===o.length){
if((j=o[0]=o[0].slice(0)).length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){
if(!(b=(d.find.ID(k.matches[0].replace(ab,bb),b)||[])[0]))return e
;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}
for(i=V.needsContext.test(a)?0:j.length;i--&&(k=j[i],
!d.relative[l=k.type]);)if((m=d.find[l])&&(f=m(k.matches[0].replace(ab,bb),$.test(j[0].type)&&mb(b.parentNode)||b))){
if(j.splice(i,1),!(a=f.length&&ob(j)))return H.apply(e,f),e;break}}
return(n||h(a,o))(f,b,!p,e,$.test(a)&&mb(b.parentNode)||b),e
},c.sortStable=u.split("").sort(B).join("")===u,
c.detectDuplicates=!!l,m(),c.sortDetached=gb(function(a){
return 1&a.compareDocumentPosition(n.createElement("div"))}),gb(function(a){
return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")
})||hb("type|href|height|width",function(a,b,c){
return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)
}),c.attributes&&gb(function(a){
return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),
""===a.firstChild.getAttribute("value")})||hb("value",function(a,b,c){
return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue
}),gb(function(a){return null==a.getAttribute("disabled")
})||hb(K,function(a,b,c){var d
;return c?void 0:!0===a[b]?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null
}),a.Sizzle=db}(window),MFB.element0=function(datas,clientDatas,nextCond){
each(Sizzle(datas.selector),function(i,v){
"mouseenter"==datas.event?mfbTools.mouseEnterLeave(v,"mouseenter",function(){
nextCond()
}):"mouseleave"==datas.event?mfbTools.mouseEnterLeave(v,"mouseleave",function(){
nextCond()}):on(datas.event,v,function(e){nextCond()},datas.id)})}
;var element0000Datas={event:"click",selector:".intent-survey-open",
id:"element0000",name:"element",internalName:"element000"},element0100Datas={
event:"click",selector:".intent-survey-mobile",id:"element0100",name:"element",
internalName:"element010"},scenario0={settings:{effect:"mfbSlide-in-top",
widthDesktop:"50",widthDesktopSymbol:"%",heightDesktop:"80",
heightDesktopSymbol:"%",widthTablet:"50",widthTabletSymbol:"%",
heightTablet:"80",heightTabletSymbol:"%",widthMobile:"95",widthMobileSymbol:"%",
heightMobile:"95",heightMobileSymbol:"%",
parentContainerStyle:"#mfbIframeBlock {  height: auto !important;  top: 10% !important;}#mfbIframeBlock #mfbIframeClose {  color: #1b1b1b !important;}#mfbIframeBlock #mfbIframeContent {  border-radius: 6px !important;  min-height: auto !important;}@media (min-width: 320px) and (max-width: 767px) {  #mfbIframeBlock {    top: 5% !important;  }}",
closeTextStyle:"",overlayStyle:"",forceShow:"on",position:"",deploymentNames:{
inputLanguage:"Intent Deployment V3"}},object_id:7507,campaign_id:65409,
deployment_id:107502,
urlDeployment:"https://room.myfeelback.com/website/l8kd1u2x7ZDnqwVy/data?oid=7507&cid=65409",
triggered_action:"popin",themeDeployment:"horizon",fontUrl:"",
trackingDisabled:!1,enableGeoloc:!1,previewMode:!1,isOffline:!1,testMode:0,
forced_language:null,language_mode:"default",originalLanguage:null,conditions:[{
name:"GroupOr",children:[{name:"GroupAnd",children:[{name:"element",
hasServerEvaluation:"false",orderPriority:null,datas:{event:"click",
selector:".intent-survey-open"}}]},{name:"GroupAnd",children:[{name:"element",
hasServerEvaluation:"false",orderPriority:null,datas:{event:"click",
selector:".intent-survey-mobile"}}]}]}]},InPage=function(){
var websitejs,toLoad=1,_loaded=!1,doc=document,_opened=!1,loadJsAndCss=(doc.getElementsByTagName("head")[0],
function(params){
_loaded||((websitejs=doc.createElement("script")).setAttribute("type","text/javascript"),
websitejs.setAttribute("async","false"),
websitejs.setAttribute("src",MFB.websiteJs+params.themeDeployment+"-libraries.js?_="+MFB.timestamp),
doc.getElementsByTagName("head")[0].appendChild(websitejs),_loaded=!0)
}),done=function(value,selector,params){if(0===toLoad){
var url=params.urlDeployment
;url.includes("?")?url+="&":url+="?",url+="value="+value+"&jsCheck=1",ajaxMFB({
url:url,type:"json",headers:{Accept:"application/json, text/json, */*; q=0.01"},
method:"GET",fields:{withCredentials:!0}},function(data){if(data){
var bodyResponse=data.data.body,timestamp=bodyResponse.timestamp,deploymentUrl=bodyResponse.urlDeployment,deploymentUid=bodyResponse.uidDeployment,deploymentStyleUrl=bodyResponse.urlDeploymentStyle,deploymentResponsiveUrl=bodyResponse.urlResponsiveDeployment,host=bodyResponse.host,protocol=bodyResponse.protocol,formPageId=bodyResponse.formPageId,fontUrl=bodyResponse.fontURL,mfbv=bodyResponse.mfbv,mfbd=bodyResponse.mfbd,slid=bodyResponse.slid,cdnHost=bodyResponse.cdnHost,sid=bodyResponse.sid,testMode=bodyResponse.testMode,enableGeoloc=bodyResponse.enableGeoloc,trackingDisabled=bodyResponse.trackingDisabled,previewMode=bodyResponse.previewMode,isOffline=bodyResponse.isOffline,submittedPages=bodyResponse.submittedPages,submittedInputs=bodyResponse.submittedInputs,submittedFormFields=bodyResponse.submittedFormFields,langAndCountry=mfbTools.getLangAndCountry(params)||null,analyticsCallback=bodyResponse.analyticsCallbacks,config={
host:host,protocol:protocol,timestamp:timestamp,
responsiveURL:deploymentResponsiveUrl,fontUrl:fontUrl,cdnHost:cdnHost,
deploymentUid:deploymentUid,enableGeoloc:Boolean(parseInt(enableGeoloc)),
trackingDisabled:Boolean(parseInt(trackingDisabled)),
previewMode:Boolean(parseInt(previewMode)),
isOffline:Boolean(parseInt(isOffline)),testMode:testMode,lang:langAndCountry,
originalLanguage:params.originalLanguage},context={inpage:!0,template:!0,
slid:slid},website=new MFBWebsite(deploymentUrl,deploymentStyleUrl,config)
;website.applyAnalyticsCallbackSubmit(config,context,analyticsCallback),
window.MfbTracking._setData(MFB.getVarsDatas()),website.build(selector,{
fpid:formPageId,sid:sid,mfbv:mfbv,mfbd:mfbd,submittedPages:submittedPages,
submittedInputs:submittedInputs,submittedFormFields:submittedFormFields,
slid:slid},context,function(){sessionStorage.removeItem(MFB_CONDITION_CACHE_KEY)
})}else Sizzle(".mfb-loader")[0].classList.remove("mfb-loader")})}
},htmlContent="",getContent=function(params,callback){
var uid=MFB.actorUid||"0",deploymentId=params.deployment_id||"0",langAndCountry=mfbTools.getLangAndCountry(params)||"null",url=MFB.inPageUrl+"/"+uid+"/"+deploymentId+"/"+langAndCountry+".html"
;ajaxMFB({url:url,headers:{
Accept:"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"},
method:"GET"},function(result){if(result&&!result.error&&result.data){
var items=Sizzle(params.settings.selector)
;items&&items.length&&(htmlContent=result.data,function(params,callback){
var url=""
;if(params&&params.settings&&void 0!==params.settings.has_css&&"1"==params.settings.has_css){
var uid=MFB.actorUid||"0",deploymentId=params.deployment_id||"0"
;url=MFB.inPageUrl+"/"+uid+"/"+deploymentId+"/css.css"}else{
var depUid=params.urlDeployment.match(/\/([a-z0-9A-Z=_-]{10,})\//)
;url=MFB.inPageStyle+"/"+depUid[1]+".css?widget="+params.template}ajaxMFB({
url:url,headers:{Accept:"text/css,*/*;q=0.1"},method:"GET"},function(result){
if(result&&!result.error&&result.data){
var items=Sizzle(params.settings.selector);if(items&&items.length){
var currentItem=items[0],css=result.data
;currentItem.innerHTML="<style>"+css+"</style>"+htmlContent,callback()}}})
}(params,callback))}})};return{load:function(params){
return!_opened&&(getContent(params,function(){_opened=!0
;var items=Sizzle(params.settings.selector);if(!items||!items.length)return!1
;var currentItem=items[0]
;currentItem.style.display="block",currentItem.classList.add("mfb-inpage-container"),
each(Sizzle("a[data-value]",currentItem),function(index,linkItem){
var linkValue=linkItem.getAttribute("data-value")
;on("click",linkItem,function(e){
e.preventDefault(),Iframe.isOpened()?currentItem.style.display="none":(!function(selector){
var mfbWebsiteDivs=Sizzle(selector+" .mfb-website-style")
;if(mfbWebsiteDivs&&mfbWebsiteDivs.length){var inPageStyle={
"background-color":"#000000",
"-ms-filter":"progid:DXImageTransform.Microsoft.Alpha(Opacity=40)",
filter:"alpha(opacity=40)","z-index":"2000",
"background-image":"url('data:image/gif;base64,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')",
"background-position":"center","background-repeat":"no-repeat",
width:parseFloat(window.getComputedStyle(mfbWebsiteDivs[0]).width)+parseFloat(window.getComputedStyle(mfbWebsiteDivs[0]).getPropertyValue("padding-left"))+parseFloat(window.getComputedStyle(mfbWebsiteDivs[0]).getPropertyValue("padding-right"))+"px",
height:parseFloat(window.getComputedStyle(mfbWebsiteDivs[0]).height)+parseFloat(window.getComputedStyle(mfbWebsiteDivs[0]).getPropertyValue("padding-top"))+parseFloat(window.getComputedStyle(mfbWebsiteDivs[0]).getPropertyValue("padding-bottom"))+"px",
padding:0,margin:0,opacity:.05}
;mfbTools.applyStyle(mfbWebsiteDivs[0],inPageStyle),
mfbWebsiteDivs[0].innerHTML=null}
}(params.settings.selector),function(value,selector,params){
loadJsAndCss(params),
Iframe.setOpened(!0),0===toLoad?done(value,selector,params):websitejs.onload=function(){
toLoad-=1,done(value,selector,params)}
}(linkValue,params.settings.selector,params),
mfbTools.triggerEvent(doc,"MFB_ACTION_EVENT",{
action:params.triggered_action||null,campaign_id:params.campaign_id||null,
deployment_id:params.deployment_id||null,event_type:"in_page"}))})})}),!0)}}}()
;MFB.event_load1=function(datas,clientDatas,nextCond){return nextCond(),!0}
;var event0001Datas={event:"load",unit:"seconds",id:"event0001",name:"event",
internalName:"event000"},scenario1={settings:{position:"",
selector:"#skeepers-pp-survey",deploymentNames:{
inputLanguage:"Post Checkout on site",fr:"Post Checkout on site",
es:"Post Checkout on site",de:"Post Checkout on site",
it:"Post Checkout on site",ko:"Post Checkout on site",
ja:"Post Checkout on site",zh:"Post Checkout on site",
ar:"Post Checkout on site","es-MX":"Post Checkout on site"},has_css:"1"},
object_id:7507,campaign_id:85938,deployment_id:140636,
urlDeployment:"https://room.myfeelback.com/website/62p0eljdb0dLE8HHC/form/85938/7507/inPageSubmit",
triggered_action:"inPage",template:"nps",themeDeployment:"november",inPage:!0,
fontUrl:"https://room.cxr.skeepers.io/lib/frontend/fonts/open-sans-v27-vietnamese_latin-ext_latin_hebrew_greek-ext_greek_cyrillic-ext_cyrillic/font.css",
trackingDisabled:!1,enableGeoloc:!1,previewMode:!1,isOffline:!1,testMode:0,
forced_language:null,language_mode:null,originalLanguage:"en",conditions:[{
name:"GroupAnd",children:[{name:"GroupOr",children:[{name:"event",
hasServerEvaluation:"false",orderPriority:2,datas:{event:"load",unit:"seconds"}
}]}]}]};MFB.event_load2=function(datas,clientDatas,nextCond){
return nextCond(),!0};var event0002Datas={event:"load",unit:"seconds",
id:"event0002",name:"event",internalName:"event000"},scenario2={settings:{
position:"",selector:"#skeepers-pp-survey",deploymentNames:{
inputLanguage:"POst checkout (new Q2)",fr:"POst checkout (newQ2)",
es:"POst checkout (new Q2) ",de:"POst checkout (new Q2)",
it:"POst checkout (new Q2)",ko:"POst checkout (new Q2) ",
ja:"POst checkout (new Q2) ",zh:"POst checkout (new Q2) ",
ar:"POst checkout (new Q2) ","es-MX":"POst checkout (new Q2) "},has_css:"1"},
object_id:7507,campaign_id:92824,deployment_id:152170,
urlDeployment:"https://room.myfeelback.com/website/690wvmv3jqSomuTOt/form/92824/7507/inPageSubmit",
triggered_action:"inPage",template:"nps",themeDeployment:"november",inPage:!0,
fontUrl:"https://room.cxr.skeepers.io/lib/frontend/fonts/open-sans-v27-vietnamese_latin-ext_latin_hebrew_greek-ext_greek_cyrillic-ext_cyrillic/font.css",
trackingDisabled:!1,enableGeoloc:!1,previewMode:!1,isOffline:!1,testMode:0,
forced_language:null,language_mode:"default",originalLanguage:"en",conditions:[{
name:"GroupAnd",children:[{name:"GroupOr",children:[{name:"event",
hasServerEvaluation:"false",orderPriority:2,datas:{event:"load",unit:"seconds"}
}]}]}]}
;MFB.element0(element0000Datas,_Mfb_ud,mfbTools.checkDepStatus.bind(null,scenario0,MFB.checkEp,0)),
MFB.element0(element0100Datas,_Mfb_ud,mfbTools.checkDepStatus.bind(null,scenario0,MFB.checkEp,0)),
MFB.event_load1(event0001Datas,_Mfb_ud,mfbTools.checkDepStatus.bind(null,scenario1,MFB.checkEp,1)),
MFB.event_load2(event0002Datas,_Mfb_ud,mfbTools.checkDepStatus.bind(null,scenario2,MFB.checkEp,2))
};try{if(document.all&&!document.addEventListener)throw"ie<9";MFB.start()
}catch(e){console.log(e)}}();