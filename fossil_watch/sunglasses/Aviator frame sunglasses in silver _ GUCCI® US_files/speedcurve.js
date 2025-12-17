LUX=(function(){var a=("undefined"!==typeof(LUX)&&"undefined"!==typeof(LUX.gaMarks)?LUX.gaMarks:[]);var d=("undefined"!==typeof(LUX)&&"undefined"!==typeof(LUX.gaMeasures)?LUX.gaMeasures:[]);var j="LUX_start";var k=window.performance;var l=("undefined"!==typeof(LUX)&&LUX.ns?LUX.ns:(Date.now?Date.now():+(new Date())));if(k&&k.timing&&k.timing.navigationStart){l=k.timing.navigationStart}function f(){if(k&&k.now){return k.now()}var o=Date.now?Date.now():+(new Date());return o-l}function b(n){if(k){if(k.mark){return k.mark(n)}else{if(k.webkitMark){return k.webkitMark(n)}}}a.push({name:n,entryType:"mark",startTime:f(),duration:0});return}function m(p,t,n){if("undefined"===typeof(t)&&h(j)){t=j}if(k){if(k.measure){if(t){if(n){return k.measure(p,t,n)}else{return k.measure(p,t)}}else{return k.measure(p)}}else{if(k.webkitMeasure){return k.webkitMeasure(p,t,n)}}}var r=0,o=f();if(t){var s=h(t);if(s){r=s.startTime}else{if(k&&k.timing&&k.timing[t]){r=k.timing[t]-k.timing.navigationStart}else{return}}}if(n){var q=h(n);if(q){o=q.startTime}else{if(k&&k.timing&&k.timing[n]){o=k.timing[n]-k.timing.navigationStart}else{return}}}d.push({name:p,entryType:"measure",startTime:r,duration:(o-r)});return}function h(n){return c(n,g())}function c(p,o){for(i=o.length-1;i>=0;i--){var n=o[i];if(p===n.name){return n}}return undefined}function g(){if(k){if(k.getEntriesByType){return k.getEntriesByType("mark")}else{if(k.webkitGetEntriesByType){return k.webkitGetEntriesByType("mark")}}}return a}return{mark:b,measure:m,gaMarks:a,gaMeasures:d}})();LUX.ns=(Date.now?Date.now():+(new Date()));LUX.ac=[];LUX.cmd=function(a){LUX.ac.push(a)};LUX.init=function(){LUX.cmd(["init"])};LUX.send=function(){LUX.cmd(["send"])};LUX.addData=function(a,b){LUX.cmd(["addData",a,b])};LUX_ae=[];window.addEventListener("error",function(a){LUX_ae.push(a)});LUX_al=[];if("function"===typeof(PerformanceObserver)&&"function"===typeof(PerformanceLongTaskTiming)){var LongTaskObserver=new PerformanceObserver(function(c){var b=c.getEntries();for(var a=0;a<b.length;a++){var d=b[a];LUX_al.push(d)}});try{LongTaskObserver.observe({type:["longtask"]})}catch(e){}};

LUX.samplerate = 40; 
var luxConfig = {};
luxConfig.urlArray = window.location.href.split('/');
luxConfig.country = luxConfig.urlArray[3];
luxConfig.language = luxConfig.urlArray[4];

/**
 * This function calculates the label which should be passed to speedcurve
 * @param {string} path The page path
 * @returns {string} The template label
 */
luxConfig.getTemplate = function(path){
    if( path.includes('/pr/') ) return "Product Page";
    if( RegExp('/lo/.*-p-').test(path) ) return "Looks Detail Page";
    if( RegExp('/lo/.*-c-').test(path) ) return "Looks Grid";
    if( RegExp('^/'+luxConfig.country+'/'+luxConfig.language+'/ca/').test(path) ) return "Category Page";
    if( path.includes('/wishlist/saved-items') ) return "Wishlist";
    if( path.toLowerCase().includes('/orderconfirmation/') ) return "Order Confirmation";
    if( path.includes('/checkout') ) return "Checkout";
    if( path.includes('/st/capsule') ) return "Capsule";
    if( path.includes('/search') ) return "Search";
    if( path.includes('/newsearchpage') ) return "Algolia search";
    if( RegExp('^/'+luxConfig.country+'/'+luxConfig.language+'/store').test(path) ) return "Store";
    if( path.includes('/my-account') ) return "My Account";
    if( path.includes('/cart') ) return "Shopping Bag";
    if( RegExp('/stories(?!/st/stories/article/video_how_to_shop_on_gucci_website)').test(path) ) return "Stories";
    if( RegExp('/'+luxConfig.country+'/'+luxConfig.language+'/?$').test(path) ) return "Home Page";
    return "Not Defined";
};

luxConfig.template = luxConfig.getTemplate(window.location.pathname) + " NP";
LUX.label = luxConfig.template;

if (luxConfig.template==="Order Confirmation NP") {
    LUX.addData('purchase', 'yes');
}