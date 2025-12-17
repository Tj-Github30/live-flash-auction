var _inside = _inside || [];
// var _inside = [];
var _insideLoaded = _insideLoaded || false;
var _insideConnectImmediately = true;
var _insideChatConsent = "";

(function () {
	if (_insideLoaded)
		return;
	_insideLoaded = true;

	var accountKey = "IN-1000600";
	var trackerURL = "us5-track.inside-graph.com";
	var subsiteId = null;
	var useCustomFunctionForCheckout = true;
	var maxLoop = 30;
	var curLoop = 0;
	var firstCall = false;
	var cursize = "";
	var insideOrderTotal = 0;
	var tempJQ = tempJQ || null;
	var curvisitorobj = null;
	var sizevisible = false;
	var visitorLoggedInData = false;
	var _insideCheckConnected = false;
	var tempcururl = window.location.href;

	var detectSearchByUrl = true;
	var searchUrl = "/newsearchpage?";
	var searchClassName = null;
	var detectProductCategoryByUrl = true;
	var productCategoryUrl = "/capsule/gucci-guilty-fragrance";
	var productCategoryClassName = null;
	var detectProductByUrl = true;
	var productUrl = null;
	var productClassName = null;
	var detectCheckoutByUrl = true;
	var checkoutUrl = "/cart";
	var checkoutClassName = null;
	var detectOrderConfirmedByUrl = true;
	var orderConfirmedUrl = "checkout/orderConfirmation";
	var orderConfirmedClassName = null;
	var eventsBound = false;

	// BEGIN - No cookie implemenation
	try {
		if (typeof (window.OnetrustActiveGroups) != "undefined" && window.OnetrustActiveGroups) {
			_insideChatConsent = window.OnetrustActiveGroups.indexOf('GCC01') > -1 ? "granted" : "denied";
		}
	} catch (chatconsentex) { }

	var STATUS = {
		STARTING: "starting",
		READY: "ready",
		RESETTING: "resetting"
	}

	window._insideStatus = STATUS.STARTING;

	window.addEventListener("cookie-category-GCC01-enabled", function () { reset(true) });
	window.addEventListener("cookie-category-GCC01-disabled", function () { reset(false) });

	function setStatus(status) {
		window._insideStatus = status;
	}

	function getConfig() {
		return {
			action: "getTracker",
			crossDomain: false,
			account: accountKey,
			noCookie: _insideChatConsent !== "granted",
			resetCallback: resetCallback
		};
	}

	function reset(optin) {
		if (_insideStatus === STATUS.READY) {
			hideChatTab();
			_insideGraph.reset(optin);
		}
	}

	function resetCallback(optin) {
		if (_insideStatus !== STATUS.READY) {
			return;
		}

		setStatus(STATUS.RESETTING);

		hideChatTab();

		// Temporary fix until 2.0 release
		if (typeof (insideChatPane) !== "undefined") {
			insideChatPane.activeChat = false;
			insideChatPane.clearChats();
			insideChatPane.lastMessage = document.createElement("div");
			insideChatPane.lastMessage.classList.add("cards");
		}

		if (typeof (optin) === "boolean") {
			setChatConsent(optin);
		}

		deferWait(function () {
			initializeInside();
			startInside();
		}, function () {
			if (typeof (window.OnetrustActiveGroups) != "undefined" && window.OnetrustActiveGroups) {
				_insideChatConsent = window.OnetrustActiveGroups.indexOf('GCC01') > -1 ? "granted" : "denied";
				return typeof (optin) !== "boolean" || optin && _insideChatConsent === "granted" || !optin && _insideChatConsent !== "granted";
			}
		});
	}

	function setChatConsent(optin) {
		//OneTrust.setConsentProfile({ "purposes": [{ "Id": "1A7C07B5-9492-482F-B0C8-1904F5F4EB89", "TransactionType": optin ? "CONFIRMED" : "OPT_OUT" }] });
		//OneTrust.Close();
		if (optin) {
			OneTrust.UpdateConsent("Category", "GCC01:1");
		} else {
			//OneTrust.UpdateConsent("Category", "GCC01:0");
		}
	}

	function hideChatTab() {
		var tabHolder = document.querySelector("#inside_custom_tab_holder");
		if (tabHolder) {
			tabHolder.classList.remove("chatAvailable");
		}
	}
	// END - No cookie implemenation

	// Utility Functions
	function log() {
		if (typeof (console) != "undefined" && typeof (console.log) != "undefined") {
			//console.log("[INSIDE]", Array.prototype.slice.call(arguments));
		}
	}

	// function checkVisitorData() {
	// 	var tempapiurl = "/customer/ajax/check-customer-info";
	// 	var tempsplit = window.location.href.split("://")[1].split("/");
	// 	tempapiurl = "/" + tempsplit[1] + "/" + tempsplit[2] + tempapiurl;

	// 	tempJQ.ajax({
	// 		url: tempapiurl,
	// 		success: function (result) {
	// 			if (typeof (result) != "undefined" && result != null) {
	// 				curvisitorobj = result;
	// 			}
	// 		}
	// 	});
	// }

	function addCommas(nStr) {
		try {
			nStr += '';
			x = nStr.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}

			return x1 + x2;
		}
		catch (tempex) {
		}

		return nStr;
	}

	function getDecimalSign(number) {
		try {
			var tempnum = myTrim(number);

			if (number.length > 3) {
				var tempres = number.charAt(number.length - 3);
				if (tempres == "." || tempres == ",")
					return tempres;
			}
		}
		catch (signex) {
		}

		return ".";
	}

	function deferWait(callback, test) {
		if (test()) {
			callback();
			return;
		}
		var _interval = 10;
		var _spin = function () {
			if (test()) {
				callback();
			}
			else {
				_interval = _interval >= 500 ? 500 : _interval * 2;
				setTimeout(_spin, _interval);
			}
		};
		setTimeout(_spin, _interval);
	}

	function keepWait(callback, test) {
		if (test()) {
			callback();
			if (curLoop >= maxLoop) {
				return;
			}
		}
		var _interval = 1000;
		var _spin = function () {
			if (test()) {
				curLoop = curLoop + 1;
				callback();
				if (curLoop >= maxLoop) {
					return;
				}
			}
			setTimeout(_spin, _interval);
		};
		setTimeout(_spin, _interval);
	}

	var indexOf = [].indexOf || function (prop) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] === prop)
				return i;
		}
		return -1;
	};

	var getElementsByClassNameManual = function (className, context) {
		if (context.getElementsByClassName)
			return context.getElementsByClassName(className);
		var elems = document.querySelectorAll ? context.querySelectorAll("." + className) : (function () {
			var all = context.getElementsByTagName("*"), elements = [], i = 0;
			for (; i < all.length; i++) {
				if (all[i].className && (" " + all[i].className + " ").indexOf(" " + className + " ") > -1 && indexOf.call(elements, all[i]) === -1)
					elements.push(all[i]);
			}
			return elements;
		})();
		return elems;
	};

	function myTrim(text) {
		if (typeof (text) != "undefined" && text != null)
			return typeof (text.trim) === "function" ? text.trim() : text.replace(/^\s+|\s+$/gm, '');

		return null;
	}

	function isNumber(o) {
		return !isNaN(o - 0) && o !== null && o !== "" && o !== false;
	}

	function isNumeric(n) {
		try {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}
		catch (tempex) {
		}

		return false;
	}

	function randomIntFromInterval(min, max) {
		try {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		catch (tempex) {
		}

		return min;
	}

	function setInsideCookie(cname, cvalue, exdays) {
		try {
			sessionStorage.setItem(cname, cvalue);
		} catch (tempex) { }
	}

	function getInsideCookie(cname) {
		try {
			return sessionStorage.getItem(cname);
		} catch (tempex) { }
		return null;
	}

	function deleteInsideCookie(cname) {
		try {
			sessionStorage.removeItem(cname);
		} catch (tempex) { }
	}

	function jsUcfirst(string) {
		try {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
		catch (tempex) {
		}

		return string;
	}

	function toTitleCase(string) {
		try {
			return string.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}
		catch (tempex) {
		}

		return string;
	}

	function roundToTwo(num) {
		if (Math != "undefined" && Math.round != "undefined")
			return +(Math.round(num + "e+2") + "e-2");
		else
			return num;
	}

	function getSearchParameters() {
		var prmstr = window.location.search.substr(1);
		return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : [];
	}

	function transformToAssocArray(prmstr) {
		var params = [];
		var prmarr = prmstr.split("&");
		for (var i = 0; i < prmarr.length; i++) {
			params[i] = prmarr[i];
		}

		return params;
	}

	try {
		if (typeof (callEventListener) == "undefined") {
			window.callEventListener = function (eventLabel) {
				if (typeof (insideFrontInterface) != "undefined" && insideFrontInterface != null && typeof (insideFrontInterface.triggerVisitorEvent) != "undefined" && insideFrontInterface.triggerVisitorEvent != null) {
					insideFrontInterface.triggerVisitorEvent(eventLabel);
				}
				else {
					// Below will set the function to wait for INSIDE to finish loading.
					setTimeout(function () { callEventListener(eventLabel) }, 1000);
					return;
				}
			}
		}
	} catch (tempex) { }

	var insideCountryStoreLocatorIndex = 0;
	try {
		if (window.location.pathname.indexOf("/store") != -1) {
			var tempcountry = window.location.pathname.split("/")[1].toUpperCase();
			deferWait(function () {
				callEventListener("storeSearchCountryDifferent");
			}, function () {
				if (typeof (_insideGraph) != "undefined" && _insideGraph != null) {
					if (typeof (dataLayer) != "undefined" && dataLayer != null && dataLayer) {
						for (var i = insideCountryStoreLocatorIndex; i < dataLayer.length - 1; i++) {
							insideCountryStoreLocatorIndex = i;
							if (dataLayer[i] && dataLayer[i].event && dataLayer[i].event == "store-search" && dataLayer[i].stores) {
								if (dataLayer[i].stores[0] && dataLayer[i].stores[0].countryCode) {
									if (dataLayer[i].stores[0].countryCode.toUpperCase() != tempcountry) {
										if (tempcountry == "UK" && dataLayer[i].stores[0].countryCode.toUpperCase() == "GB") {
											// Do not trigger
										}
										else
											return true;
									}
								}
							}
						}
					}
				}

				return false;
			});
		}
	} catch (tempex) { }

	// End of utility functions

	function getViewData() {
		try {

			// Output view data
			// Default view data is "unknown"

			var data = {};

			data.action = "trackView";
			data.type = "article";
			data.url = window.location.href;
			data.name = "Current Page: " + window.location.href;

			var temp_loc = window.location.href.split("://")[1].split("/");
			var page = "";

			var params = getSearchParameters();
			var searchterm = "Search"; // Find the searchterm the visitor
			// entered for the search page to be
			// used as the page name
			if (params != null && params.length > 0) {
				for (var i = 0; i < params.length; i++) {
					if (params[i].indexOf("searchString=") == 0) {
						searchterm = params[i].split("searchString=")[1];
					}
				}
			}

			for (var i = 1; i < temp_loc.length; i++) {
				if (temp_loc[i] != null && temp_loc[i].length > 0)
					page = temp_loc[i];
			}
			var curpage = page.split("?")[0];

			// Identify and assign the correct page type here
			// The part below is actually very flexible, can use dataLayer too
			// sometimes, etc so if needed can also just delete the global
			// variable parts and make your own algorithm. From my experience
			// the following part will rarely work for all websites.

			var temphome = tempJQ('section[data-testid="FhHeroCarousel"]');
			if ((curpage == "" || curpage == "/" || curpage == "index.html" || curpage == "#") && temp_loc.length < 3) {
				data.type = "homepage";
			}
			else if (typeof (pageType) != "undefined" && pageType != null && pageType.length > 0) {
				if (pageType.toLowerCase().indexOf("category") == 0) {
					data.type = "productcategory";
				}
				else if (pageType.toLowerCase().indexOf("product") == 0) {
					data.type = "product";
				}
				else if (pageType.toLowerCase().indexOf("shopthelook") == 0) {
					data.type = "shopthelook";
				}
			}
			else if (tempJQ('div[data-testid="pdp-main"]').length > 0) {
				data.type = "product";
			}
			else if (data.url.toLowerCase().indexOf("/login") != -1 || data.url.toLowerCase().indexOf("/signin") != -1) {
				data.type = "login";
			}
			else if (temphome != null && temphome.length > 0) {
				data.type = "homepage";
			}

			try {
				if (data.type == "article" && typeof (dataLayer) != "undefined" && dataLayer != null) {
					for (var i = 0; i < dataLayer.length; i++) {
						if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && dataLayer[i] && dataLayer[i].category && dataLayer[i].category == "home page") {
							data.type = "homepage";
							break;
						}
					}
				}
			} catch (homepageex) { }

			if (detectSearchByUrl && searchUrl != null) {
				if (data.url.indexOf(searchUrl) != -1) {
					data.type = "search";
				}
			}
			else if (searchClassName != null) {
				var tempelem = getElementsByClassNameManual(searchClassName, document);
				if (tempelem != null && tempelem.length > 0) {
					data.type = "search";
				}
			}

			if (detectProductCategoryByUrl && productCategoryUrl != null) {
				if (data.url.indexOf(productCategoryUrl) != -1) {
					data.type = "productcategory";
				}
			}
			else if (productCategoryClassName != null) {
				var tempelem = getElementsByClassNameManual(productCategoryClassName, document);
				if (tempelem != null && tempelem.length > 0) {
					data.type = "productcategory";
				}
			}

			if (detectProductByUrl && productUrl != null) {
				if (data.url.indexOf(productUrl) != -1) {
					data.type = "product";
				}
			}
			else if (productClassName != null) {
				var tempelem = getElementsByClassNameManual(productClassName, document);
				if (tempelem != null && tempelem.length > 0) {
					data.type = "product";
				}
			}

			if (detectCheckoutByUrl && checkoutUrl != null) {
				if (data.url.indexOf(checkoutUrl) != -1 || data.url.indexOf("/checkout") != -1) {
					data.type = "checkout";
				}
			}
			else if (checkoutClassName != null) {
				var tempelem = getElementsByClassNameManual(checkoutClassName, document);
				if (tempelem != null && tempelem.length > 0) {
					data.type = "checkout";
				}
			}

			if (detectOrderConfirmedByUrl && orderConfirmedUrl != null) {
				if (data.url.indexOf(orderConfirmedUrl) != -1) {
					data.type = "orderconfirmed";
				}
			}
			else if (orderConfirmedClassName != null) {
				var tempelem = getElementsByClassNameManual(orderConfirmedClassName, document);
				if (tempelem != null && tempelem.length > 0) {
					data.type = "orderconfirmed";
				}
			}

			try {
				if (data.type != "orderconfirmed" && typeof (_insideData) != "undefined" && _insideData != null && _insideData.page && _insideData.page.type) {
					var temppagetype = _insideData.page.type.toLowerCase();
					data.type = _insideData.page.type;

					if (temppagetype == "home page") {
						data.type = "homepage";
					}
					else if (temppagetype == "search") {
						data.type = "search";
					}
					else if (temppagetype == "category page") {
						data.type = "productcategory";
					}
					else if (temppagetype == "product page") {
						data.type = "product";
					}
					else if (temppagetype == "shopping bag" || temppagetype == "checkout") {
						data.type = "checkout";
					}
					else if (temppagetype == "order confirmation") {
						data.type = "orderconfirmed";
					}
					else if (temppagetype == "login") {
						data.type = "login";
					}
					else if (temppagetype == "stories") {
						data.type = "article";
					}
					else if (temppagetype == "other") {
						data.type = "other";
					}
				}
			} catch (insidedatapgeex) { }

			try {
				if (typeof (dataLayer) != "undefined" && dataLayer != null && dataLayer.length > 0) {
					for (var i = 0; i < dataLayer.length; i++) {
						if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
							&& typeof (dataLayer[i].ecommerce.purchase) != "undefined" && dataLayer[i].ecommerce.purchase != null
							&& typeof (dataLayer[i].ecommerce.purchase.actionField) != "undefined"
							&& dataLayer[i].ecommerce.purchase.actionField != null
							&& typeof (dataLayer[i].ecommerce.purchase.actionField.id) != "undefined"
							&& dataLayer[i].ecommerce.purchase.actionField.id != null && dataLayer[i].ecommerce.purchase.actionField.id.length > 0) {
							data.type = "orderconfirmed";
						}
					}
				}
			} catch (tempex) { }

			// Finish identying

			switch (data.type) {
				case "homepage":
					data.name = "Home";
					break;
				case "search":
					data.name = decodeURIComponent(searchterm);
					if (data.name.length == 0) {
						data.name = "Search Page"
					}
					break;
				case "shopthelook":
					var tempPageName = getPageName();
					if (tempPageName != null && tempPageName.length > 0)
						data.name = tempPageName;

					var tempval = getLookImage();
					if (tempval != null && tempval.length > 0)
						data.img = tempval;
					break;
				case "productcategory":
					var tempcat = getCategory();
					if (tempcat != null && tempcat.length > 0)
						data.category = tempcat;

					var tempPageName = getPageName();
					if (tempPageName != null && tempPageName.length > 0)
						data.name = tempPageName;

					break;
				case "product":
					var tempPageName = getPageName();
					if (tempPageName != null && tempPageName.length > 0)
						data.name = tempPageName;

					tempPageName = getProductName();
					if (tempPageName != null && tempPageName.length > 0)
						data.name = tempPageName;
					else
						data.type = "other";

					var tempcat = getCategory();
					if (tempcat != null && tempcat.length > 0)
						data.category = tempcat;

					var tempval = getProductImage();
					if (tempval != null && tempval.length > 0)
						data.img = tempval;
					else
						data.type = "other";

					var tempsku = getProductSku();
					if (tempsku != null && tempsku.length > 0) {
						data.sku = tempsku;
						if (data.name.toLowerCase().indexOf(tempsku.toLowerCase()) == -1) {
							data.name = data.name + " #" + tempsku;
						}
					}
					else
						data.type = "other";

					var tempprice = getProductPrice();
					if (tempprice != null) {
						data.price = tempprice;

						try {
							var temptextprice = tempprice;
							if (typeof temptextprice === 'string' || temptextprice instanceof String)
								temptextprice = parseFloat(temptextprice);
							data.name = "$" + addCommas(Math.trunc(temptextprice).toString()) + " - " + data.name;
						}
						catch (temppriceex) {
						}
					}
					else
						data.type = "other";

					var sizeavail = getProductSizeAvailable();
					if (typeof (data.data) == "undefined") {
						data.data = {};
					}
					data.data.sizeavailable = sizeavail;

					var tempavail = getProductAvailability();
					if (tempavail != null) {
						data.data.availability = tempavail;
					}

					if (sizeavail) {
						var tempsize = getProductSize();
						if (tempsize != null && tempsize.length > 0) {
							data.data.size = tempsize;
						}
					}

					try {
						if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product && typeof (_insideData.product.findInStoreOnly) != "undefined" && _insideData.product.findInStoreOnly != null) {
							if (typeof (data.data) == "undefined") {
								data.data = {};
							}
							data.data.findInStoreOnly = _insideData.product.findInStoreOnly;
						}
					} catch (tempex) { }

					break;
				case "orderconfirmed":
					data.name = "Order Confirmed";
					break;
				default:
					data.name = curpage;
					try {
						data.name = curpage.replace(/_/g, ' ');
					}
					catch (tempex) {
					}

				// var tempPageName = getPageName();
				// if (tempPageName != null && tempPageName.length > 0)
				// {
				// data.name = tempPageName;
				// if (data.name.indexOf("Gucci Official Site") == 0)
				// {
				// data.name = curpage;
				// }
				// }
			}

			// Get view data from page

			if (data.type == "shopthelook")
				data.type = "productcategory";

			if (data.type != "product")
				data.name = toTitleCase(data.name);

			var tempnode = getNode();

			if (data.type != "homepage" && tempnode != null) {
				data.node = tempnode;
			}
			else if (tempnode == null && (data.type == "article" || data.type == "search")) {
				data.node = 1;
			}
			else if (data.type != "checkout" && data.type != "orderconfirmed" && data.type != "homepage") {
				var temprandom = randomIntFromInterval(1, 10);
				if (temprandom <= 5)
					data.node = 11;
				else
					data.node = 13;
			}

			try {
				var tempcontent = tempJQ("#size-guide-overlay-shoes");
				if (tempcontent != null && tempcontent.length == 1) {
					if (tempcontent.is(":visible")) {
						if (typeof (data.tags) == "undefined")
							data.tags = "sizehelpvisible";
						else
							data.tags = data.tags + ",sizehelpvisible";
					}
				}
			}
			catch (tempex) {
			}

			return data;
		}
		catch (ex) {
			if (typeof (console) != "undefined" && typeof (console.log) != "undefined")
				log("getViewData error: ", ex);
			return null;
		}
	}

	function getNode() {
		var tempurl = window.location.href;
		tempurl = tempurl.toLowerCase();
		var temp_loc = document.location.href.split("://")[1].split("/");

		var page = "";
		for (var i = 1; i < temp_loc.length; i++) {
			if (temp_loc[i] != null && temp_loc[i].length > 0)
				page = temp_loc[i];
		}
		var curpage = page.split("?")[0];
		curpage = curpage.toLowerCase();
		var temppage = null;
		if (curpage.length > 3)
			temppage = curpage.substr(curpage.length - 3);

		if (tempurl != null && tempurl.length > 0) {
			if (tempurl.indexOf("/stories") != -1) {
				return 7;
			}
			else if (tempurl.indexOf("/runway") != -1 || tempurl.indexOf("/shop-the-look") != -1) {
				return 4;
			}
			else if (tempurl.indexOf("/gifts") != -1) {
				return 3;
			}
			else if (tempurl.indexOf("/children") != -1) {
				return 8;
			}
			else if (tempurl.indexOf("/womens-fragrances/") != -1) {
				return 12;
			}
			else if (tempurl.indexOf("/women") != -1) {
				return 6;
			}
			else if (tempurl.indexOf("/men") != -1) {
				return 5;
			}
			else if (tempurl.indexOf("/beauty") != -1 || tempurl.indexOf("/gucci-guilty-fragrance") != -1) {
				return 12;
			}
			else if (tempurl.indexOf("/jewelry-watches") != -1 || tempurl.indexOf("/jewellery-watches") != -1) {
				return 2;
			}
		}

		return null;
	}

	function getPageName() {
		// Modify if necessary
		var content = document.getElementsByTagName("title");
		if (typeof (content) != "undefined" && content != null && content.length > 0) {
			var result = content[0].textContent || content[0].innerText;
			if (typeof (result) != "undefined" && result != null && result.length > 0) {
				if (result.indexOf("| Shop Gucci.com") != -1) {
					result = result.split("| Shop Gucci.com")[0];
				}
				return myTrim(result);
			}
		}

		return null;
	}

	function getProductImage() {
		try {
			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product && _insideData.product.image) {
				return _insideData.product.image;
			}
		} catch (tempex) { }

		try {
			var tempimg = tempJQ("#accordion-product-details .product-thumb img");
			if (tempimg.length > 0) {
				var tempimageurl = tempimg.get(0).currentSrc;

				// To use bigger size image
				if (tempimageurl && tempimageurl.split('/').length > 2) {
					try {
						var metaTags = document.getElementsByTagName("meta");

						var fbAppIdContent = "";
						for (var i = 0; i < metaTags.length; i++) {
							if (metaTags[i].getAttribute("property") == "og:image") {
								fbAppIdContent = metaTags[i].getAttribute("content");
								if (fbAppIdContent) {
									fbAppIdContent = fbAppIdContent.split('/').slice(0, -2).join("/");
									var tempurlarr = tempimageurl.split('/');
									tempimageurl = fbAppIdContent + "/" + tempurlarr[tempurlarr.length - 2] + "/" + tempurlarr[tempurlarr.length - 1];
									break;
								}
							}
						}
					} catch (tempex) { }

					return tempimageurl;
				}
			}
		} catch (tempex) { }

		try {
			var metaTags = document.getElementsByTagName("meta");

			var fbAppIdContent = "";
			for (var i = 0; i < metaTags.length; i++) {
				if (metaTags[i].getAttribute("property") == "og:image") {
					fbAppIdContent = metaTags[i].getAttribute("content");
					return fbAppIdContent;
				}
			}
		}
		catch (imageex) {
		}

		return null;
	}

	function getLookImage() {
		try {
			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product && _insideData.product.image) {
				return _insideData.product.image;
			}
		} catch (tempex) { }

		try {
			var tempimg = tempJQ(".main-carousel-shop-the-look .carousel-slide.slick-active .stl-header-image._loaded");
			if (tempimg != null && tempimg.length > 0) {
				var tempattr = tempimg[0].getAttribute("data-src");
				if (tempattr != null && tempattr.length > 0) {
					return tempattr;
				}
				else {
					return tempimg[0].src;
				}
			}
		}
		catch (imageex) {
		}

		return null;
	}

	function getProductName() {
		try {
			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product && _insideData.product.name) {
				return _insideData.product.name;
			}
		} catch (tempex) { }

		try {
			for (var i = dataLayer.length - 1; i >= 0; i--) {
				if (typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
					&& typeof (dataLayer[i].ecommerce.detail) != "undefined" && dataLayer[i].ecommerce.detail != null
					&& typeof (dataLayer[i].ecommerce.detail.products) != "undefined" && dataLayer[i].ecommerce.detail.products != null
					&& dataLayer[i].ecommerce.detail.products.length > 0) {
					return myTrim(dataLayer[i].ecommerce.detail.products[0].name);
				}
			}
		}
		catch (tempex) {
		}

		try {
			if (typeof (dataLayer) != "undefined" && dataLayer != null && dataLayer.length > 0) {
				for (var i = dataLayer.length - 1; i >= 0; i--) {
					if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && typeof (dataLayer[i].event) != "undefined" && dataLayer[i].event != null && dataLayer[i].event == "view_item" && typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
						&& typeof (dataLayer[i].ecommerce.items) != "undefined" && dataLayer[i].ecommerce.items != null && dataLayer[i].ecommerce.items.length > 0) {
						if (dataLayer[i].ecommerce.items[0].item_name)
							return dataLayer[i].ecommerce.items[0].item_name;
					}
				}
			}
		}
		catch (tempex) {
		}

		return null;
	}

	function getProductPrice() {
		try {
			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product && _insideData.product.price) {
				return _insideData.product.price;
			}
		} catch (tempex) { }

		try {
			for (var i = dataLayer.length - 1; i >= 0; i--) {
				if (typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
					&& typeof (dataLayer[i].ecommerce.detail) != "undefined" && dataLayer[i].ecommerce.detail != null
					&& typeof (dataLayer[i].ecommerce.detail.products) != "undefined" && dataLayer[i].ecommerce.detail.products != null
					&& dataLayer[i].ecommerce.detail.products.length > 0) {
					return dataLayer[i].ecommerce.detail.products[0].price;
				}
			}
		}
		catch (tempex) {
		}

		try {
			for (var i = dataLayer.length - 1; i >= 0; i--) {
				if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && typeof (dataLayer[i].event) != "undefined" && dataLayer[i].event != null && dataLayer[i].event == "view_item" && typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
					&& typeof (dataLayer[i].ecommerce.items) != "undefined" && dataLayer[i].ecommerce.items != null && dataLayer[i].ecommerce.items.length > 0) {
					if (dataLayer[i].ecommerce.items[0].price)
						return dataLayer[i].ecommerce.items[0].price;
				}
			}
		}
		catch (tempex) {
		}

		return null;
	}

	function getProductSku() {
		try {
			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product) {
				if (_insideData.product.stylecode) {
					return _insideData.product.stylecode;
				}
				else if (_insideData.product.sku) {
					return _insideData.product.sku;
				}
			}
		} catch (tempex) { }

		try {
			for (var i = dataLayer.length - 1; i >= 0; i--) {
				if (typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
					&& typeof (dataLayer[i].ecommerce.detail) != "undefined" && dataLayer[i].ecommerce.detail != null
					&& typeof (dataLayer[i].ecommerce.detail.products) != "undefined" && dataLayer[i].ecommerce.detail.products != null
					&& dataLayer[i].ecommerce.detail.products.length > 0) {
					var sku = dataLayer[i].ecommerce.detail.products[0].id;
					try {
						sku = sku.replace(/[^a-zA-Z0-9]/g, '');
					}
					catch (skuex) {
					}
					return sku;
				}
			}
		}
		catch (tempex) {
		}

		try {
			for (var i = dataLayer.length - 1; i >= 0; i--) {
				if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && typeof (dataLayer[i].event) != "undefined" && dataLayer[i].event != null && dataLayer[i].event == "view_item" && typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
					&& typeof (dataLayer[i].ecommerce.items) != "undefined" && dataLayer[i].ecommerce.items != null && dataLayer[i].ecommerce.items.length > 0) {
					if (dataLayer[i].ecommerce.items[0].item_id)
						return dataLayer[i].ecommerce.items[0].item_id;
				}
			}
		}
		catch (tempex) {
		}

		return null;
	}

	function getCategory() {
		try {
			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product && _insideData.product.category) {
				return _insideData.product.category;
			}
		} catch (tempex) { }

		try {
			for (var i = dataLayer.length - 1; i >= 0; i--) {
				if (typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
					&& typeof (dataLayer[i].ecommerce.detail) != "undefined" && dataLayer[i].ecommerce.detail != null
					&& typeof (dataLayer[i].ecommerce.detail.products) != "undefined" && dataLayer[i].ecommerce.detail.products != null
					&& dataLayer[i].ecommerce.detail.products.length > 0) {
					return dataLayer[i].ecommerce.detail.products[0].category;
				}
			}
		}
		catch (tempex) {
		}

		return null;
	}

	function getProductSize() {
		try {
			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product && _insideData.product.selectedSize) {
				return _insideData.product.selectedSize;
			}
		}
		catch (tempex) {
		}

		try {
			var temptext = myTrim(tempJQ(
				"#product-detail-add-to-shopping-bag-form .size-dropdown .content-select .selectric-size-select .selectric > .label").first()
				.text());

			if (temptext != null && temptext.length > 0 && temptext.indexOf("Select") != 0) {
				return temptext;
			}
		}
		catch (tempex) {
		}

		return null;
	}

	function getProductSizeAvailable() {
		try {
			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product && typeof (_insideData.product.isSizable) != "undefined" && _insideData.product.isSizable != null) {
				return _insideData.product.isSizable;
			}
		}
		catch (tempex) {
		}

		try {
			var tempcontent = tempJQ("#product-detail-add-to-shopping-bag-form .size-dropdown").first();

			return tempcontent.is(':visible');
		}
		catch (tempex) {
		}

		return false;
	}

	function getProductAvailability() {
		try {
			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.product && typeof (_insideData.product.isAvailableOnline) != "undefined" && _insideData.product.isAvailableOnline != null) {
				return _insideData.product.isAvailableOnline;
			}
		}
		catch (tempex) {
		}

		try {
			return myTrim(tempJQ("#product-detail-add-to-shopping-bag-form .shipping-info").first().text());
		}
		catch (tempex) {
		}

		return null;
	}

	function getOrderData() {
		try {
			var data = [];
			var totalprice = 0;
			var orderId = "auto";

			tempJQ(".header-nav-bag-item").each(function (index) {
				var skus = tempJQ(this).find(".header-nav-bag-item-details")[0].getElementsByTagName("li");

				var item_name = tempJQ(this).find("strong").text();
				var img_link = tempJQ(this).find("img")[0].src;
				var price = tempJQ(this).find(".header-price").text();
				var decimalSign = getDecimalSign(myTrim(price.replace(/[^\d.,]/g, '')));
				if (decimalSign == ",") {
					price = price.replace(/[.]/g, "");
					price = price.replace(",", ".");
				}
				price = parseFloat(price.replace(/[^0-9\.\-\+]/g, ""));
				var qty = skus[1].innerText || skus[1].textContent;
				qty = parseFloat(qty.replace(/[^0-9\.\-\+]/g, ""));
				var sku = skus[0].innerText || skus[0].textContent;
				try {
					sku = sku.replace(/[^a-zA-Z0-9]/g, '');
				}
				catch (skuex) {
				}
				if (sku.indexOf("Stile") == 0) {
					sku = sku.split("Stile")[1];
				}
				if (sku.indexOf("Style") == 0) {
					sku = sku.split("Style")[1];
				}
				if (sku.indexOf("#") != -1) {
					sku = sku.split("#")[1];
				}
				sku = sku.replace(/\s+/g, '');

				totalprice = totalprice + (price * qty);

				var insideitem = { "action": "addItem", "orderId": "auto", "name": myTrim(item_name), "price": price, "sku": myTrim(sku), "img": img_link, "qty": qty };

				try {
					var temphref = tempJQ(this).find("a:first").prop("href");
					if (temphref.indexOf("-p-") != -1) {
						var tempsku = temphref.split("-p-");
						if (tempsku.length > 1) {
							insideitem.sku = tempsku[tempsku.length - 1];
							insideitem.url = temphref;
						}
					}
				} catch (tempex) { }

				data.push(insideitem);
			});

			if (data.length > 0) {
				data.push({
					"action": "trackOrder",
					"orderId": orderId,
					"orderTotal": totalprice
				});

				setInsideCookie("inside-ordertotal", totalprice, 1);

				return data;
			}

			return null;
		}
		catch (ex) {
			log("getOrderData error. ", ex);
			return null;
		}
	}

	function getOrderDataCart() {
		try {
			var data = [];
			var totalprice = 0;
			var orderId = "auto";

			var templist = tempJQ(".shopping-bag-content .baglist .baglist-item-summary");

			tempJQ(".shopping-bag-content .baglist .baglist-item-summary").each(function (index) {
				if (!tempJQ(this).find(".baglist-item-removed").first().is(':visible')) {
					var tempdata = tempJQ(this).data();

					var item_name = tempdata.itemTitle;
					var img_link = tempJQ(this).find("img")[0].src;
					var price = tempdata.itemPrice;
					var decimalSign = getDecimalSign(myTrim(price.replace(/[^\d.,]/g, '')));
					if (decimalSign == ",") {
						price = price.replace(/[.]/g, "");
						price = price.replace(",", ".");
					}
					price = parseFloat(price.replace(/[^0-9\.\-\+]/g, ""));
					var qty = tempdata.itemQuantity;
					var sku = tempdata.itemBaseproduct;
					try {
						sku = sku.replace(/[^a-zA-Z0-9]/g, '');
					}
					catch (skuex) {
					}
					var tempcat = tempdata.itemCategory;

					totalprice = totalprice + (price * qty);

					try {// Getting item availability
						var temptext = tempJQ(this).find(".baglist-item-availability > .shipping-info > .title").first().text();
						if (temptext != null && myTrim(temptext).length > 0) {
							item_name = myTrim(temptext) + ": " + item_name;
						}
					}
					catch (tempex) {
					}

					data.push({
						"action": "addItem",
						"orderId": "auto",
						"name": myTrim(item_name),
						"price": price,
						"sku": sku,
						"img": img_link,
						"category": myTrim(tempcat),
						"qty": qty
					});
				}
			});

			if (data.length > 0) {
				try {
					var tempcontent = tempJQ(".order-details-totals-total");
					if (tempcontent != null && tempcontent.length == 1) {
						var temptext = tempcontent.text();
						if (temptext != null && temptext.length > 0) {
							var decimalSign = getDecimalSign(myTrim(temptext.replace(/[^\d.,]/g, '')));
							if (decimalSign == ",") {
								temptext = temptext.replace(/[.]/g, "");
								temptext = temptext.replace(",", ".");
							}
							totalprice = parseFloat(temptext.replace(/[^0-9\.\-\+]/g, ""));
						}
					}
				}
				catch (tempex) {
				}

				data.push({
					"action": "trackOrder",
					"orderId": orderId,
					"orderTotal": totalprice
				});

				setInsideCookie("inside-ordertotal", totalprice, 1);

				return data;
			}

			return null;
		}
		catch (ex) {
			log("getOrderDataCart error. ", ex);
			return null;
		}
	}

	function getOrderDataCheckout() {
		try {
			var data = [];
			var totalprice = 0;
			var orderId = "auto";

			var tempdetails = null;
			for (var i = 0; i < dataLayer.length; i++) {
				if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && typeof (dataLayer[i].ecommerce) != "undefined"
					&& dataLayer[i].ecommerce != null && typeof (dataLayer[i].ecommerce.products) != "undefined"
					&& dataLayer[i].ecommerce.products != null) {
					tempdetails = dataLayer[i].ecommerce.products;
				}
			}

			tempJQ(".order-details-product-list:first .order-details-product-item").each(
				function (index) {
					var item_name = tempJQ(this).find(".order-details-product-item-title").text();
					var img_link = tempJQ(this).find("img")[0].src;
					var price = tempJQ(this).find(".order-details-product-item-price").text();
					var decimalSign = getDecimalSign(myTrim(price.replace(/[^\d.,]/g, '')));
					if (decimalSign == ",") {
						price = price.replace(/[.]/g, "");
						price = price.replace(",", ".");
					}
					price = parseFloat(price.replace(/[^0-9\.\-\+]/g, ""));
					var qty = tempJQ(this).find(".order-details-product-item-quantity").text();
					qty = parseFloat(qty.replace(/[^0-9\.\-\+]/g, ""));
					var sku = tempJQ(this).find(".order-details-product-item-reference").text();
					try {
						sku = sku.replace(/[^a-zA-Z0-9]/g, '');
					}
					catch (skuex) {
					}
					if (sku.indexOf("Stile") == 0) {
						sku = sku.split("Stile")[1];
					}
					if (sku.indexOf("Style") == 0) {
						sku = sku.split("Style")[1];
					}
					if (sku.indexOf("#") != -1) {
						sku = sku.split("#")[1];
					}

					if (tempdetails != null && tempdetails.length > index) {
						sku = tempdetails[index].id;
						try {
							sku = sku.replace(/[^a-zA-Z0-9]/g, '');
						}
						catch (skuex) {
						}
						price = parseFloat(tempdetails[index].price);
						qty = parseFloat(tempdetails[index].quantity);
						item_name = tempdetails[index].name;

						if (typeof (tempdetails[index].variant) != "undefined" && tempdetails[index].variant != null
							&& tempdetails[index].variant.length > 0) {
							item_name = tempdetails[index].variant;
						}

						totalprice = totalprice + (price * qty);
					}
					else {
						totalprice = totalprice + price;
						price = price / qty;
					}

					try {// Getting item availability
						var temptext = tempJQ(this).find(".shipping-info-and-price > .shipping-info > .title").first().text();
						if (temptext != null && myTrim(temptext).length > 0) {
							item_name = myTrim(temptext) + ": " + item_name;
						}
					}
					catch (tempex) {
					}

					data.push({
						"action": "addItem",
						"orderId": "auto",
						"name": myTrim(item_name),
						"price": price,
						"sku": myTrim(sku),
						"img": img_link,
						"qty": qty
					});

					if (tempdetails != null && tempdetails.length > index) {
						data[index].category = tempdetails[index].category;
					}
				});

			if (data.length > 0) {
				try {
					var tempcontent = tempJQ(".order-details-totals-total");
					if (tempcontent != null && tempcontent.length > 0) {
						var temptext = tempcontent.first().text();
						if (temptext != null && temptext.length > 0) {
							var decimalSign = getDecimalSign(myTrim(temptext.replace(/[^\d.,]/g, '')));
							if (decimalSign == ",") {
								temptext = temptext.replace(/[.]/g, "");
								temptext = temptext.replace(",", ".");
							}
							totalprice = parseFloat(temptext.replace(/[^0-9\.\-\+]/g, ""));
						}
					}
				}
				catch (tempex) {
				}

				try {
					for (var i = 0; i < dataLayer.length; i++) {
						if (typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
							&& typeof (dataLayer[i].ecommerce.products) != "undefined" && dataLayer[i].ecommerce.products != null
							&& dataLayer[i].ecommerce.products.length > 0 && typeof (dataLayer[i]["cart total"]) != "undefined"
							&& dataLayer[i]["cart total"] != null) {
							totalprice = dataLayer[i]["cart total"];
							break;
						}
					}
				}
				catch (tempex) {
				}

				data.push({
					"action": "trackOrder",
					"orderId": orderId,
					"orderTotal": totalprice
				});

				setInsideCookie("inside-ordertotal", totalprice, 1);

				return data;
			}

			return null;
		}
		catch (ex) {
			log("getOrderDataCheckout error. ", ex);
			return null;
		}
	}

	function getOrderDataCheckoutJS() {
		try {
			var data = [];
			var totalprice = 0;

			var tables = null;
			if (typeof (dataLayer) != "undefined" && dataLayer != null && dataLayer.length > 0) {
				for (var i = 0; i < dataLayer.length; i++) {
					if (typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
						&& typeof (dataLayer[i].ecommerce.products) != "undefined" && dataLayer[i].ecommerce.products != null
						&& dataLayer[i].ecommerce.products.length > 0) {
						tables = dataLayer[i].ecommerce.products;
						break;
					}
				}
			}

			if (tables != null && tables.length > 0) {
				for (var i = 0; i < tables.length; i++) {
					var row = tables[i];

					var item_name = row.name;
					var sku = row.id;
					try {
						sku = sku.replace(/[^a-zA-Z0-9]/g, '');
					}
					catch (skuex) {
					}
					var tempcat = row.category;
					var price = row.price;
					price = parseFloat(price);
					var qty = row.quantity;
					totalprice = totalprice + (price * qty);

					data.push({
						"action": "addItem",
						"orderId": "auto",
						"name": myTrim(item_name),
						"price": price,
						"sku": myTrim(sku),
						"category": myTrim(tempcat),
						"qty": qty
					});
				}

				if (data.length > 0) {
					try {
						for (var i = 0; i < dataLayer.length; i++) {
							if (typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
								&& typeof (dataLayer[i].ecommerce.products) != "undefined" && dataLayer[i].ecommerce.products != null
								&& dataLayer[i].ecommerce.products.length > 0 && typeof (dataLayer[i]["cart total"]) != "undefined"
								&& dataLayer[i]["cart total"] != null) {
								totalprice = dataLayer[i]["cart total"];
								break;
							}
						}
					}
					catch (tempex) {
					}

					data.push({
						"action": "trackOrder",
						"orderId": "auto",
						"orderTotal": totalprice
					});

					setInsideCookie("inside-ordertotal", totalprice, 1);

					return data;
				}
			}
		}
		catch (ex) {
			log("getOrderDataCheckoutJS error. ", ex);
		}

		try {
			var data = [];
			var totalprice = 0;
			var orderId = "auto";

			var tempcartitems = null;
			if (typeof (dataLayer) != "undefined" && dataLayer != null && dataLayer.length > 0) {
				for (var i = dataLayer.length - 1; i >= 0; i--) {
					if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && typeof (dataLayer[i].event) != "undefined" && dataLayer[i].event != null && (dataLayer[i].event == "view_cart" || dataLayer[i].event == "begin_checkout") && typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
						&& typeof (dataLayer[i].ecommerce.items) != "undefined" && dataLayer[i].ecommerce.items != null
						&& dataLayer[i].ecommerce.items.length > 0) {
						tempcartitems = dataLayer[i].ecommerce.items;
						break;
					}
				}
			}

			if (tempcartitems != null && tempcartitems.length > 0) {
				for (var i = 0; i < tempcartitems.length; i++) {
					var insideitem = {};
					insideitem.action = "addItem";
					insideitem.orderId = orderId;
					var tempitem = tempcartitems[i];
					insideitem.sku = tempitem.item_id;
					insideitem.name = insideitem.sku;
					if (tempitem.item_name)
						insideitem.name = tempitem.item_name;
					insideitem.price = parseFloat(tempitem.price);
					insideitem.qty = parseFloat(tempitem.quantity);

					totalprice = totalprice + (insideitem.price * insideitem.qty);

					data.push(insideitem);
				}

				if (data.length > 0) {

					data.push({
						"action": "trackOrder",
						"orderId": "auto",
						"orderTotal": totalprice
					});

					return data;
				}
			}
		}
		catch (ex) {
			log("getOrderData error. ", ex);
		}

		return null;
	}

	function checkCart() {
		try {
			if (typeof (dataLayer) != "undefined" && dataLayer != null && dataLayer.length > 0) {
				for (var i = 0; i < dataLayer.length; i++) {
					if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
						&& typeof (dataLayer[i].ecommerce.cart) != "undefined" && dataLayer[i].ecommerce.cart != null
						&& dataLayer[i].ecommerce.cart.total) {
						return parseFloat(dataLayer[i].ecommerce.cart.total);
					}
				}
			}
		}
		catch (tempex) { }

		try {
			var tempcount = tempJQ(".shopping-bag-product-count").text();
			if (tempcount != null && tempcount.length > 0) {
				tempcount = tempcount.replace(/[^\d.]/g, '');
				return parseFloat(tempcount);
			}
		}
		catch (numex) {
		}

		return 0;
	}

	function orderConfirmProcess() {
		try {
			var data = [];

			var detail = null;
			if (typeof (dataLayer) != "undefined" && dataLayer != null && dataLayer.length > 0) {
				for (var i = 0; i < dataLayer.length; i++) {
					if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && typeof (dataLayer[i].ecommerce) != "undefined" && dataLayer[i].ecommerce != null
						&& typeof (dataLayer[i].ecommerce.purchase) != "undefined" && dataLayer[i].ecommerce.purchase != null
						&& typeof (dataLayer[i].ecommerce.purchase.actionField) != "undefined"
						&& dataLayer[i].ecommerce.purchase.actionField != null
						&& typeof (dataLayer[i].ecommerce.purchase.actionField.id) != "undefined"
						&& dataLayer[i].ecommerce.purchase.actionField.id != null && dataLayer[i].ecommerce.purchase.actionField.id.length > 0) {
						detail = dataLayer[i].ecommerce.purchase;
					}
				}
			}

			if (detail != null) {
				var totalprice = detail.actionField.revenue;
				var orderID = detail.actionField.id;

				try {
					var lastOrderID = sessionStorage.getItem("insidelastorderid");
					if (lastOrderID == orderID) {
						return null;
					}
				}
				catch (numex) {
				}

				try {
					if (typeof (detail.actionField.tax) != "undefined" && detail.actionField.tax != null) {
						if (typeof totalprice === 'string' || totalprice instanceof String)
							totalprice = parseFloat(totalprice);

						if (typeof detail.actionField.tax === 'string' || detail.actionField.tax instanceof String)
							totalprice = totalprice + parseFloat(detail.actionField.tax);
						else
							totalprice = totalprice + detail.actionField.tax;
					}
				}
				catch (tempex) {
				}

				try {
					if (typeof (detail.shipping) != "undefined" && detail.shipping != null) {
						temppurchasedata.shipping = detail.shipping;
					}
					if (typeof (detail.tax) != "undefined" && detail.tax != null) {
						temppurchasedata.tax = detail.tax;
					}

					let itemDetails = detail.products;

					for (let i = 0; i < itemDetails.length; i++) {
						let tempInsideItem = {};
						tempInsideItem.action = "addItem";
						tempInsideItem.orderId = "auto";
						tempInsideItem.name = itemDetails[i].name;
						tempInsideItem.price = parseFloat(itemDetails[i].price);
						tempInsideItem.qty = parseFloat(itemDetails[i].quantity);
						tempInsideItem.sku = itemDetails[i].id;

						try {
							if (itemDetails[i].category) {
								tempInsideItem.category = itemDetails[i].category;
								if (tempInsideItem.category.length > 149)
									tempInsideItem.category = tempInsideItem.category.substring(0, 149);
							}
						} catch (tempex) { }

						data.push(tempInsideItem);
					}
				} catch (tempex) { }

				if (typeof (orderID) != "undefined" && orderID != null && orderID.length > 0 && orderID != "auto") {

					var tempdata = {};
					try {
						for (var key in detail.actionField) {
							if (detail.actionField.hasOwnProperty(key)) {
								if (detail.actionField[key] != null) {
									if (typeof detail.actionField[key] === 'string' || detail.actionField[key] instanceof String) {
										if (detail.actionField[key].length > 0)
											tempdata[key] = encodeURIComponent(detail.actionField[key]);
									}
									else if (isNumeric(detail.actionField[key])) {
										tempdata[key] = detail.actionField[key];
									}
									else if (typeof (detail.actionField[key]) == typeof (true)) {
										tempdata[key] = detail.actionField[key];
									}
								}
							}
						}
					}
					catch (tempex) {
					}

					let updateBool = true;
					try {
						if (data.length > 0) {
							updateBool = false;
						}
					}
					catch (orderidex) {
					}

					data.push({
						"action": "trackOrder",
						"orderId": "auto",
						"newOrderId": orderID,
						"orderTotal": totalprice,
						"data": temppurchasedata,
						"update": updateBool,
						"complete": true
					});
				}

				return data;
			}
		}
		catch (ex) {
			log("orderConfirmProcess error. ", ex);
		}

		try {
			let data = [];
			let tempcurrency = null;

			let detail = null;
			if (typeof (dataLayer) != "undefined" && dataLayer != null && dataLayer.length > 0) {
				for (let i = dataLayer.length - 1; i >= 0; i--) {
					if (typeof (dataLayer[i]) != "undefined" && dataLayer[i] != null && dataLayer[i].event && dataLayer[i].event == "purchaseGA4" && typeof (dataLayer[i].transaction_id) != "undefined" && dataLayer[i].transaction_id != null && dataLayer[i].transaction_id && typeof (dataLayer[i].value) != "undefined" && dataLayer[i].value != null) {
						detail = dataLayer[i];
						try {
							if (dataLayer[i].local_currency) {
								tempcurrency = dataLayer[i].local_currency.toUpperCase();
							}
						} catch (currencyex) { }
					}
				}
			}

			if (detail != null) {
				let totalprice = detail.value;
				let orderID = detail.transaction_id;
				let temppurchasedata = {};

				try {
					if (typeof (detail.local_value) != "undefined" && detail.local_value != null && isNumeric(detail.local_value)) {
						totalprice = parseFloat(detail.local_value);
					}
					if (typeof (detail.local_shipping) != "undefined" && detail.local_shipping != null) {
						temppurchasedata.shipping = detail.local_shipping;
					}
					if (typeof (detail.local_tax) != "undefined" && detail.local_tax != null && isNumeric(detail.local_tax)) {
						temppurchasedata.tax = parseFloat(detail.local_tax);
						totalprice = totalprice + temppurchasedata.tax;
					}
					if (tempcurrency != null) {
						temppurchasedata.currency = tempcurrency;
					}

					let itemDetails = detail.items;

					for (let i = 0; i < itemDetails.length; i++) {
						let tempInsideItem = {};
						tempInsideItem.action = "addItem";
						tempInsideItem.orderId = "auto";
						tempInsideItem.name = itemDetails[i].item_name;
						tempInsideItem.price = parseFloat(itemDetails[i].local_price);
						tempInsideItem.qty = parseFloat(itemDetails[i].quantity);
						tempInsideItem.sku = itemDetails[i].item_id;

						try {
							if (itemDetails[i].item_category) {
								tempInsideItem.category = itemDetails[i].item_category;
								if (tempInsideItem.category.length > 149)
									tempInsideItem.category = tempInsideItem.category.substring(0, 149);
							}
						} catch (tempex) { }

						data.push(tempInsideItem);
					}
				} catch (tempex) { }

				if (typeof (orderID) != "undefined" && orderID != null && orderID != "auto") {

					let updateBool = true;
					try {
						var lastOrderID = sessionStorage.getItem("insidelastorderid");
						if (lastOrderID == orderID) {
							return null;
						}

						if (data.length > 0) {
							updateBool = false;
						}
					}
					catch (orderidex) {
					}

					data.push({
						"action": "trackOrder",
						"orderId": "auto",
						"newOrderId": orderID,
						"orderTotal": totalprice,
						"data": temppurchasedata,
						"update": updateBool,
						"complete": true
					});
				}

				return data;
			}
		}
		catch (ex) {
			log("orderConfirmProcess error. ", ex);
		}

		try {
			var data = [];
			var detail = null;

			if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.order)
				detail = _insideData.order;

			if (detail != null) {
				var totalprice = detail.total;
				var orderID = detail.id;
				var temppurchasedata = {};

				if (typeof (detail.shipping) != "undefined" && detail.shipping != null) {
					temppurchasedata.shipping = detail.shipping;
				}
				if (typeof (detail.tax) != "undefined" && detail.tax != null) {
					temppurchasedata.tax = detail.tax;
				}
				if (_insideCurrency != null) {
					temppurchasedata.currency = _insideCurrency;
				}

				// try {
				// 	var temporderdata = getOrderData();
				// 	if (temporderdata && temporderdata.length > 0)
				// 		data = temporderdata;
				// } catch (orderex) { }

				if (typeof (orderID) != "undefined" && orderID != null && orderID != "auto") {
					try {
						var lastOrderID = sessionStorage.getItem("insidelastorderid");
						if (lastOrderID == orderID) {
							return null;
						}
					}
					catch (orderidex) {
					}

					data.push({
						"action": "trackOrder",
						"orderId": "auto",
						"newOrderId": orderID,
						"orderTotal": totalprice,
						"data": temppurchasedata,
						"update": true,
						"complete": true
					});
				}

				return data;
			}
		}
		catch (ex) {
			log("orderConfirmProcess error. ", ex);
		}

		return null;
	}

	function getVisitorId() {
		try {
			if (typeof (window.LiveChatNamespace) != "undefined" && window.LiveChatNamespace != null && typeof (window.LiveChatNamespace.uid) != "undefined"
				&& window.LiveChatNamespace.uid != null && window.LiveChatNamespace.uid.length > 0 && typeof (window.LiveChatNamespace.user_logged) != "undefined"
				&& window.LiveChatNamespace.user_logged != null && window.LiveChatNamespace.user_logged.length > 0 && window.LiveChatNamespace.user_logged == 'true')
				return window.LiveChatNamespace.uid;
		}
		catch (visitidex) {
		}

		// try {
		// 	if (typeof (curvisitorobj) != "undefined" && curvisitorobj != null && typeof (curvisitorobj.uid) != "undefined"
		// 		&& curvisitorobj.uid != null && curvisitorobj.uid.length > 0)
		// 		return curvisitorobj.uid;
		// }
		// catch (visitidex) {
		// }

		return null;
	}

	function getVisitorName() {
		try {
			if (typeof (window.LiveChatNamespace) != "undefined" && window.LiveChatNamespace != null && typeof (window.LiveChatNamespace.firstName) != "undefined"
				&& window.LiveChatNamespace.firstName != null && window.LiveChatNamespace.firstName.length > 0 && typeof (window.LiveChatNamespace.user_logged) != "undefined"
				&& window.LiveChatNamespace.user_logged != null && window.LiveChatNamespace.user_logged.length > 0 && window.LiveChatNamespace.user_logged == 'true') {
				var tempname = window.LiveChatNamespace.firstName;
				if (typeof (window.LiveChatNamespace) != "undefined" && window.LiveChatNamespace != null && typeof (window.LiveChatNamespace.lastName) != "undefined"
					&& window.LiveChatNamespace.lastName != null && window.LiveChatNamespace.lastName.length > 0) {
					tempname = tempname + " " + window.LiveChatNamespace.lastName;
				}
				if (typeof (window.LiveChatNamespace) != "undefined" && window.LiveChatNamespace != null && typeof (window.LiveChatNamespace.lastname) != "undefined"
					&& window.LiveChatNamespace.lastname != null && window.LiveChatNamespace.lastname.length > 0) {
					tempname = tempname + " " + window.LiveChatNamespace.lastname;
				}
				return tempname;
			}
		}
		catch (visitidex) {
		}

		// try {
		// 	if (typeof (curvisitorobj) != "undefined" && curvisitorobj != null && typeof (curvisitorobj.name) != "undefined"
		// 		&& curvisitorobj.name != null && curvisitorobj.name.length > 0 && curvisitorobj.name.toUpperCase().indexOf("N/A") == -1)
		// 		return curvisitorobj.name
		// }
		// catch (visitidex) {
		// }

		return "";
	}

	function getVisitorData() {
		try {
			var tempdata = {};

			// No longer used due to request from Gucci
			// if (typeof (certona) != "undefined" && certona != null) {
			//     for (var key in certona) {
			//         if (certona.hasOwnProperty(key)) {
			//             if (certona[key] != null) {
			//                 if (typeof certona[key] === 'string' || certona[key] instanceof String) {
			//                     if (certona[key].length > 0) {
			//                         tempdata[key] = certona[key];
			//                         if (key.toLowerCase() == "languagecode") { tempdata.language = certona[key]; }
			//                         if (key.toLowerCase() == "countrycode") { tempdata[key] = certona[key]; }
			//                     }
			//                 }
			//                 else if (isNumeric(certona[key])) {
			//                     tempdata[key] = certona[key];
			//                 }
			//             }
			//         }
			//     }
			// }

			try {
				var templocsplit = window.location.pathname.split("/");
				if (templocsplit.length > 2) {
					tempdata.language = templocsplit[2];
					if (tempdata.language.indexOf("_") != -1) {
						tempdata.language = tempdata.language.split("_")[0];
					}
				}
			} catch (tempex) { }

			try {
				if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.website && _insideData.website.country) {
					tempdata.country = _insideData.website.country;
				}

				if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.website && _insideData.website.language) {
					tempdata.language = _insideData.website.language;
					if (tempdata.language.indexOf("_") != -1) {
						tempdata.language = tempdata.language.split("_")[0];
					}
				}
			} catch (tempex) { }

			try {
				if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.page && _insideData.page.type && _insideData.page.type.toLowerCase() == "product page" && _insideData.product && _insideData.product.name) {
					tempdata.productPageName = _insideData.product.name;
				}
			} catch (tempex) { }

			return tempdata;
		}
		catch (visitidex) {
		}

		return {};
	}

	function insertInsideTag() {
		if (typeof (_insideGraph) != "undefined" && _insideGraph != null) {
			_insideGraph.processQueue();
		}
		else {
			var inside = document.createElement('script');
			inside.setAttributeNode(document.createAttribute("data-ot-ignore"));
			inside.type = 'text/javascript';
			inside.async = true;
			inside.src = 'https://' + trackerURL + '/ig.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(inside, s);
		}
	}

	function sendToInside() {
		try {
			var visitorId = getVisitorId();
			var visitorName = getVisitorName();
			var visitorData = getVisitorData();

			if (_insideStatus === STATUS.STARTING || _insideStatus === STATUS.RESETTING) {
				var _insideTracker = getConfig();

				if (subsiteId != null)
					_insideTracker.subsiteId = subsiteId;

				if (visitorId != null && visitorId.length > 0) {
					_insideTracker.visitorId = visitorId;
					visitorData.user_email = visitorId;
					visitorData.salesforce_id = visitorId;
					visitorLoggedInData = true;
				}
				if (visitorName != null && visitorName.length > 0) {
					_insideTracker.visitorName = visitorName;
					visitorData.user_name = visitorName;
				}

				_insideTracker.visitorData = visitorData;

				_inside.push(_insideTracker);
			}
			else {
				if (visitorId != null && visitorId.length > 0) {
					_insideGraph.current.visitorId = visitorId;
					visitorData.user_email = visitorId;
					visitorData.salesforce_id = visitorId;
					visitorLoggedInData = true;
				}
				if (visitorName != null && visitorName.length > 0) {
					_insideGraph.current.visitorName = visitorName;
					visitorData.user_name = visitorName;
				}

				_insideGraph.current.visitorData = visitorData;

				_insideGraph.current.url = window.location.href;
			}

			var view = getViewData();
			if (view != null) {
				if (view.type == "orderconfirmed") {
					var tempconfirm = orderConfirmProcess();
					if (tempconfirm != null && tempconfirm.length > 0) {
						for (var i = 0; i < tempconfirm.length; i++) {
							_inside.push(tempconfirm[i]);

							try {
								if (tempconfirm[i].action == "trackOrder") {
									sessionStorage.setItem("insidelastorderid", tempconfirm[i].newOrderId);
								}
							}
							catch (tempex) {
							}
						}
					}

					_inside.push(view);

					deleteInsideCookie("inside-ordertotal");
				}
				else {
					_inside.push(view);
					var orderData = getOrderData();
					if (useCustomFunctionForCheckout && view.type == "checkout") {
						orderData = getOrderDataCheckout();
						if (orderData == null || orderData.length == 0) {
							orderData = getOrderDataCart();
							if (orderData == null || orderData.length == 0) {
								orderData = getOrderDataCheckoutJS();
							}
						}
					}

					if (orderData != null && orderData.length > 0) {
						for (var i = 0; i < orderData.length; i++) {
							_inside.push(orderData[i]);
							if (orderData[i].action == "trackOrder") {
								view.orderId = orderData[i].orderId;
								view.orderTotal = orderData[i].orderTotal;
								insideOrderTotal = orderData[i].orderTotal;
							}
						}
					}
					else if (view.type == "checkout" && view.url.indexOf("/cart") != -1) {
						deleteInsideCookie("inside-ordertotal");
					}
					else if (checkCart() > 0) {
						var total_temp = getInsideCookie("inside-ordertotal");
						try {
							total_temp = parseFloat(total_temp);
						}
						catch (numex) {
							total_temp = 0;
						}

						if (total_temp != null && total_temp > 0) {
							view.orderId = "auto";
							view.orderTotal = total_temp;
						}
					}
				}

				// Add currency code
				try {
					var _insideCurrency = null;

					try {
						if (typeof (_insideData) != "undefined" && _insideData != null && typeof (_insideData.siteCurrency) != "undefined" && _insideData.siteCurrency != null) {
							_insideCurrency = _insideData.siteCurrency.toUpperCase();
						}
					}
					catch (subsitex) { }

					try {
						if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.website && _insideData.website.currency) {
							_insideCurrency = _insideData.website.currency.toUpperCase();
						}
					} catch (currencyex) { }

					// if (window.location.href.toLowerCase().indexOf(".com/us") != -1) {
					// 	_insideCurrency = "USD";
					// }
					// else if (window.location.href.toLowerCase().indexOf(".com/ca") != -1) {
					// 	_insideCurrency = "CAD";
					// }
					// else if (window.location.href.toLowerCase().indexOf(".com/mx") != -1) {
					// 	_insideCurrency = "MXN";
					// }

					// if (typeof (certona) != "undefined" && certona != null && certona.currencycode && certona.currencycode.length == 3) {
					// 	_insideCurrency = certona.currencycode.toUpperCase();
					// }

					if (_insideCurrency) {
						if (_inside != null && _inside.length > 0) {
							for (var i = 0; i < _inside.length; i++) {
								if (_inside[i].action == "trackOrder") {
									if (typeof (_inside[i].data) == "undefined" || _inside[i].data == null) {
										_inside[i].data = {};
									}

									if (typeof (_inside[i].data.currency) == "undefined" || _inside[i].data.currency == null) {
										_inside[i].data.currency = _insideCurrency;
									}
								}

								if (_inside[i].action == "getTracker") {
									if (typeof (_inside[i].visitorData) == "undefined" || _inside[i].visitorData == null) {
										_inside[i].visitorData = {};
									}

									if (typeof (_inside[i].visitorData.currency) == "undefined" || _inside[i].visitorData.currency == null) {
										_inside[i].visitorData.currency = _insideCurrency;
									}
								}
							}
						}

						if (typeof (view.data) == "undefined" || view.data == null) {
							view.data = {};
						}
						view.data.currency = _insideCurrency;

						if (typeof (_insideGraph) != "undefined" && _insideGraph != null && _insideGraph.current) {
							if (typeof (_insideGraph.current.visitorData) == "undefined" || _insideGraph.current.visitorData == null) {
								_insideGraph.current.visitorData = {};
							}

							if (typeof (_insideGraph.current.visitorData.currency) == "undefined" || _insideGraph.current.visitorData.currency == null) {
								_insideGraph.current.visitorData.currency = _insideCurrency;
							}
						}
					}
				} catch (currencyex) { }

				// Add language data
				try {
					if (visitorData.language) {
						if (typeof (view.data) == "undefined" || view.data == null) {
							view.data = {};
						}
						view.data.language = visitorData.language;
					}
				} catch (langex) { }

				log("Inside Debug: ", _inside);
			}
		}
		catch (sendex) {
			_inside = [];

			if (typeof (_insideGraph) == "undefined" || _insideGraph == null) {
				var _insideTracker = getConfig();

				if (subsiteId != null)
					_insideTracker.subsiteId = subsiteId;

				_inside.push(_insideTracker);
			}

			_inside.push({
				"action": "trackView",
				"type": "other",
				"name": "Check: " + window.location.href
			});

			log(sendex);
		}

		insertInsideTag();
		if (!firstCall)
			firstCall = true;
	}

	function startInside() {
		var tempview = getViewData();
		if (tempview != null && typeof (tempview.type) != "undefined" && tempview.type != null && tempview.type == "orderconfirmed") {
			deferWait(sendToInside, function () {
				var tempconfirm = orderConfirmProcess();
				if (tempconfirm != null && tempconfirm.length > 0) {
					return true;
				}

				if (document.readyState != 'loading' && document.readyState != 'interactive') {
					deferWait(sendToInside, function () {
						var tempconfirm = orderConfirmProcess();
						if (tempconfirm != null && tempconfirm.length > 0) {
							return true;
						}

						return false;
					});

					return true;
				}
			});
		}
		else {
			deferWait(sendToInside, function () {
				if (document.readyState != 'loading') {
					var curtempview = getViewData();

					keepWait(function () {
						setTimeout(function () {
							sendToInside();
							curtempview = getViewData();
						}, 500);
					}, function () {
						if (!firstCall)
							return false;

						if (typeof (_insideGraph) != "undefined" && _insideGraph != null && _insideCheckConnected) {
							var temporderdata = getOrderData();
							if (useCustomFunctionForCheckout && tempview.type == "checkout") {
								temporderdata = getOrderDataCheckout();
								if (temporderdata == null || temporderdata.length == 0) {
									temporderdata = getOrderDataCart();
									if (temporderdata == null || temporderdata.length == 0) {
										temporderdata = getOrderDataCheckoutJS();
									}
								}
								log(temporderdata);
							}

							if (temporderdata != null && temporderdata.length > 0) {
								for (var i = 0; i < temporderdata.length; i++) {
									if (temporderdata[i].action == "trackOrder") {
										if (insideOrderTotal != temporderdata[i].orderTotal) {
											return true;
										}
									}
								}
							}
							else if (insideOrderTotal > 0) {
								insideOrderTotal = 0;
								return true;
							}

							if (!visitorLoggedInData) {
								if (typeof (window.LiveChatNamespace) != "undefined" && window.LiveChatNamespace != null && window.LiveChatNamespace.user_logged) {
									if (window.LiveChatNamespace.user_logged != "false" && typeof (window.LiveChatNamespace.uid) != "undefined"
										&& window.LiveChatNamespace.uid != null && window.LiveChatNamespace.uid.length > 0) {
										visitorLoggedInData = true;
										return true;
									}
								}
							}

							if (curtempview.type == "product") {
								var tempcurview = getViewData();

								var boolupdateview = false;
								if (typeof (tempcurview.data) != "undefined" && tempcurview.data && tempcurview.data.availability) {
									if (typeof (curtempview.data) == "undefined") {
										curtempview.data = tempcurview.data;
										boolupdateview = true;
									}
									else if (curtempview.data && typeof (curtempview.data.availability) == "undefined") {
										curtempview.data = tempcurview.data;
										boolupdateview = true;
									}
								}

								if (typeof (tempcurview.data) != "undefined" && tempcurview.data != null) {
									if (typeof (tempcurview.data.size) != "undefined" && tempcurview.data.size != null
										&& tempcurview.data.size.length > 0 && tempcurview.data.size != cursize) {
										cursize = tempcurview.data.size;
										boolupdateview = true;
									}
									if (typeof (tempcurview.data.findInStoreOnly) != "undefined" && tempcurview.data.findInStoreOnly != null && typeof (curtempview.data.findInStoreOnly) != "undefined" && curtempview.data.findInStoreOnly != null
										&& tempcurview.data.findInStoreOnly != curtempview.data.findInStoreOnly) {
										boolupdateview = true;
									}
								}

								var tempcontent = tempJQ("#size-guide-overlay-shoes");
								if (tempcontent != null && tempcontent.length == 1) {
									if (tempcontent.is(":visible") && !sizevisible) {
										sizevisible = true;
										boolupdateview = true;
									}
									else if (!tempcontent.is(":visible") && sizevisible) {
										sizevisible = false;
										boolupdateview = true;
									}
								}

								var temppageurl = window.location.href;
								if (temppageurl != tempcururl) {
									tempcururl = temppageurl;
									boolupdateview = true;
								}

								if (boolupdateview)
									return true;
							}
						}

						return false;
					});

					return true;
				}

				return false;
			});
		}
	}

	function initializeInside() {
		var insideTracker = getConfig();

		try {
			try {
				var subsiteMapping = {
					"us": "24",
					"ca": "23",
					"mx": "35"
				};

				if (typeof (_insideData) != "undefined" && _insideData != null && _insideData.website && _insideData.website.country) {
					var tempcountry = _insideData.website.country.toLowerCase();
					if (subsiteMapping[tempcountry]) {
						subsiteId = subsiteMapping[tempcountry];
					}
				}
			} catch (subsiteex) { }

			if (window.location.href.toLowerCase().indexOf(".com/us") != -1) {
				subsiteId = "24";
			}
			else if (window.location.href.toLowerCase().indexOf(".com/ca") != -1) {
				subsiteId = "23";
			}
			else if (window.location.href.toLowerCase().indexOf(".com/mx") != -1) {
				subsiteId = "35";
			}
		}
		catch (subsitex) { }

		if (subsiteId != null)
			insideTracker.subsiteId = subsiteId;

		_inside.push(insideTracker);

		if (!eventsBound) {
			eventsBound = true;
			_inside.push({
				"action": "bind",
				"name": "onload",
				"callback": function () {
					setStatus(STATUS.READY);
				}
			});
			_inside.push({
				"action": "bind",
				"name": "onconnected",
				"callback": function (insideConnectedVar) {
					_insideCheckConnected = insideConnectedVar;
				}
			});
		}

		insertInsideTag();
	}

	if (window.location.href.indexOf("inside_testing") != -1) {
		if (typeof (_insideGraph) == "undefined" || _insideGraph == null) {
			initializeInside();
		}

		deferWait(startInside, function () {
			if (typeof (_insideGraph) != "undefined" && _insideGraph != null && typeof (_insideGraph.jQuery) != "undefined"
				&& _insideGraph.jQuery != null) {
				if (tempJQ == null) {
					tempJQ = _insideGraph.jQuery;
				}

				return true;
			}

			return false;
		});
	}
	else if (window.location.href.indexOf("no_inside") != -1) {
		return;
	}
	else {
		if (typeof (_insideGraph) == "undefined" || _insideGraph == null) {
			initializeInside();
		}

		deferWait(startInside, function () {
			if (typeof (_insideGraph) != "undefined" && _insideGraph != null && typeof (_insideGraph.jQuery) != "undefined"
				&& _insideGraph.jQuery != null && typeof (_insideGraph.current) != "undefined" && _insideGraph.current != null
				&& typeof (_insideGraph.current.url) != "undefined" && _insideGraph.current.url != null) {
				if (tempJQ == null) {
					tempJQ = _insideGraph.jQuery;
				}

				return true;
			}

			return false;
		});
	}

	deferWait(function () {
		var websiteId = insideFrontInterface.chat.userid.split(':')[1];
		_insideGraph.loadJS(_insideCDN + 'custom/' + websiteId + '-customScript.js?v=' + _insideScriptVersion);
	}, function () {
		return typeof _insideGraph != 'undefined' && _insideGraph.loadJS && typeof insideFrontInterface != 'undefined' && insideFrontInterface.chat && insideFrontInterface.chat.userid;
	});
})();