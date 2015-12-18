/**
 * Utility functions
 */
utils = function(window, document, navigator) {

  var self,

      // medium set by Gateway
      _medium = "$medium$",

      // don't set cookies with javascript (1st party domain)
      _js_cookies_enabled = false,

      MAX_DIM = 1000000;

  /**
   * Attach an onload callback to an iframe
   *
   * @param Object frame The iframe to attach to
   * @param Function The funciton to call on load
   */
  function attachOnloadToFrame(frame, onload) {
    if (frame.attachEvent) {
      frame.attachEvent("onload", onload);
    } else {
      frame.onload = onload;
    }
  }

  // <!-- BEGIN PUBLIC API
  self = {
     IMAGE_BEACON_TEMPLATE :
       "<div style='" +
         "position:absolute;left:0px;top:0px;visibility:hidden;'>" +
         "<img src='{src}'/>" +
       "</div>",

    /**
     * Adds a node to the DOM after the specified node. Wraps native
     * insertBefore function
     *
     * @param {Object} node The node to append to
     * @param {Object} newNode The node to append
     *
     * @return {Object} The appended node
     */
    append : function(appendNode, newNode) {
      appendNode.parentNode.insertBefore(newNode, appendNode.nextSibling);
      return newNode;
    },

    /**
     * X-browser function to attach an event to a DOM element.
     *
     * @param {Object} target The target DOM element
     * @param {String} type The type of event
     * @param {Functoin} listener The function to run
     */
    attachListener : function(target, type, listener) {
      if (target.addEventListener) {
        target.addEventListener(type, listener, false);
      } else if (target.attachEvent) {
        target.attachEvent("on" + type, listener);
      }
    },

    /**
     * "Beacons" to the specified URL. Uses JS image technique, ensures right
     * protocol.
     *
     * @param {String} url The url to request
     */
    beacon : function(url) {
      var ensured = self.ensureRightProtocol(url);// check for https
      (new Image()).src = ensured;
    },

    /**
     * Return the HTML code for the "Beacon" to the specified URL.
     *
     * @param {String} url The url to request
    */
    getImgBeacon : function(url) {
      var ensured = self.ensureRightProtocol(url);// check for https
      return self.template(self.IMAGE_BEACON_TEMPLATE, {src : ensured});
    },

    /**
     * Gets a map of arguments for enriching requests
     *
     * @return {Object} The context args
     */

    /**
     * Turns a string of HTML into a DOM node
     *
     * @param {String} html The HTML to transform
     * @return {Object} A DOM node of the first element in the input
     */
    create : function(html) {
      var temp = document.createElement("div");
      temp.innerHTML = html;
      return temp.firstChild;
    },

    /**
     * Sets a cookie
     *
     * @param {String} name The cookie name
     * @param {String} [value] The cookie value, removes cookie if unset
     * @param {String} [expires] When the cookie expires
     */
    cookie : function(name, value, expires) {
      if (_js_cookies_enabled) {
        var cookieStr = name + "=";
        cookieStr += (value || "") + ";path=/;";
        if (self.defined(expires)) {
          cookieStr += "expires=" + expires + ";";
        }

        try {
          document.cookie = cookieStr;
        } catch (e) {}
      }
    },

    /**
     * Creates a script element
     *
     * @param {Object} init The object to initialize the script from
     * @param {String} init.id The id of the script element
     * @param {String} init.src The source URL for the script
     *
     * @return {Object} The created script element
     */
    createScript : function(init) {
      var script = document.createElement("script");
          script.type = "text/javascript";
          init.id && (script.id = init.id);
          init.src && (script.src = init.src);
      return script;
    },

    /**
     * Checks if the argument is defined
     *
     * @param arg The argument to check
     * @return {Boolean} true if the argument is undefined
     */
    defined : function(arg) {
      return typeof arg != "undefined";
    },

    /**
     * X-Browser detection of the dimensions of the browser viewport.
     *
     * @return {Array} An tuple of [width, height] as numbers.
     */
    detectWindowDims : function() {
      var docEl = document.documentElement,
          w = window.innerWidth,
          h = window.innerHeight;

      w = self.defined(w) ? w : docEl.clientWidth;
      h = self.defined(h) ? h : docEl.clientHeight;

      if (self.defined(w) && self.defined(h)) {
        return [w, h];
      }
    },

    /**
     * Returns main browser window dimensions
     *
     * @param {Object} parentWindow The window object
     * @param {Object} parentDocument The document object
     */
    detectWindowDimensions : function(parentWindow, parentDocument) {
      var doc = parentDocument.documentElement,
          body = parentDocument.getElementsByTagName('body')[0],
          width = parentWindow.innerWidth || doc.clientWidth || body.clientWidth,
          height = parentWindow.innerHeight|| doc.clientHeight|| body.clientHeight;

      return { width : width, height : height };
    },

    /**
     * Returns a comma separated list of plugins, keeps results in a session
     * cookie. Memoized.
     *
     * @return {String} Comma-separated list of plugins
     */
    detectPlugins : function() {

      var pluginListMemo,
          cookie = "OX_plg",
          SHOCKWAVE_FLASH = "ShockwaveFlash.ShockwaveFlash",
          plugins = {
            swf: {
              activex: [SHOCKWAVE_FLASH,
                        SHOCKWAVE_FLASH + ".3",
                        SHOCKWAVE_FLASH + ".4",
                        SHOCKWAVE_FLASH + ".5",
                        SHOCKWAVE_FLASH + ".6",
                        SHOCKWAVE_FLASH + ".7"],
              plugin: /flash/gim
            },
            sl: {
              activex: ["AgControl.AgControl"],
              plugin: /silverlight/gim
            },
            pdf: {
              activex: ["acroPDF.PDF.1", "PDF.PdfCtrl.1", "PDF.PdfCtrl.4",
                        "PDF.PdfCtrl.5", "PDF.PdfCtrl.6"],
              plugin: /adobe\s?acrobat/gim
            },
            qt: {
              activex: ["QuickTime.QuickTime", "QuickTime.QuickTime.4"],
              plugin: /quicktime/gim
            },
            wmp: {
              activex: ["WMPlayer.OCX"],
              plugin: /(windows\smedia)|(Microsoft)/gim
            },
            shk: {
              activex: ["SWCtl.SWCtl", "SWCt1.SWCt1.7", "SWCt1.SWCt1.8",
                        "SWCt1.SWCt1.9", SHOCKWAVE_FLASH + ".1"],
              plugin: /shockwave/gim
            },
            rp: {
              activex: ["RealPlayer", "rmocx.RealPlayer G2 Control.1"],
              plugin: /realplayer/gim
            }
          };

      return function() {

        var arr,
            arr2,
            pluginList = "",
            supported = [];

        if (pluginListMemo) return pluginListMemo;// memoized

        try {
          if (document.cookie) {
            arr = document.cookie.split((escape(cookie) + "="));
            if (2 <= arr.length) {
              arr2 = arr[1].split(";");
              if (arr2[0]) {
                //add logic to deal with legacy comma delimited cookies
                if (arr2[0].indexOf("|") >= 0)
                  return unescape(arr2[0].split("|").join(","));
              }
            }
          }
        } catch (e) {}

        for (var p in plugins) {
          if (plugins.hasOwnProperty(p)) {
            if (window.ActiveXObject) {
              for (var i = 0; i < plugins[p].activex.length; ++i) {
                try {
                  ActiveXObject(plugins[p].activex[i]);
                  supported.push(p);
                  break;
                } catch (e) {}
              }
            } else {
              for (var j = 0; j < navigator.plugins.length; ++j) {
                if (navigator.plugins[j].name.match(plugins[p].plugin)) {
                  supported.push(p);
                  break;
                }
              }
            }
          }
        }
        if (window.postMessage) supported.push("pm");

        pluginListMemo = pluginList = supported.join(",");
        self.cookie(cookie, supported.join("|"));
        return pluginList;
      };

    }(),

    /**
     * Detects the current page URL (top), falls back to referrer
     *
     * @return {String} The detected page URL
     */
    detectPageURL : function() {
      var url;
      try {
        url = top.location.href;
      } catch (e) {}
      return url || self.detectRefererURL();
    },

    /**
     * Detects the protocol of the current page
     *
     * @return {String} The detected protocol
     */
    detectProtocol : function() {
      return location.protocol;
    },

    /**
     * Detects the referrer, falls back to opener, empty string
     *
     * @return {String} The referrer
     */
    detectRefererURL : function() {
      var ref = document.referrer;
      try {
        ref = top.document.referrer;
      } catch (e1) {
        if (parent) {
          try {
            ref = parent.document.referrer;
          } catch(e2) {}
        }
      }
      // try opener instead of referrer
      if (!ref && opener) {
        try {
          ref = opener.location.href;
        } catch (e) {}
      }
      return ref || "";
    },

    /**
     * Safe looper for arrays and objects.
     */
    each : function(iterable, callback) {
      if (self.isArray(iterable)) {
        for (var i = 0; i < iterable.length; i++) {
          callback(iterable[i], i);
        }
      } else {
        for (var k in iterable) {
          if (iterable.hasOwnProperty(k)) {
            callback(k, iterable[k]);
          }
        }
      }
    },

    /**
     * Make sure a url has the right protocol for the page. Prepends protocol if
     * missing, and changes http:// to https:// if necessary.
     *
     * @param {String} url The url to be matched with the page protocol
     * @return {String} The URL with correct protocol
     */
    ensureRightProtocol : function(url) {
      var protoEndIdx;
      if (url) {
        // Look for protocol and prepend if missing
        protoEndIdx = url.indexOf("//");
        if (protoEndIdx != 5 && protoEndIdx != 6) url = "http://" + url;
        return (self.detectProtocol() == "https:") ?
                      url.replace("http:", "https:") : url;
      }
    },

    /**
     * Gets the DOM node with the specified ID. Currently a wrapper for
     * document.getELementById, may be expanded for other queries.
     *
     * @param {String} id The HTML id of the node to get
     */
    get : function(id) {
      return document.getElementById(id);
    },

    /**
     * Gets the value of a named cookie
     *
     * @param {String} name The name of the cookie to get
     * @return {String} The cookie value
     */
    getCookie : function(name) {
      try {
        var pieces = document.cookie.split(name + "=");
        if (pieces.length == 2) return pieces[1].split(";")[0];
      } catch (e) {}
    },

    /**
     * Gets the delivery medium set by the Gateway
     *
     * @return {String} The delivery medium
     */
    getMedium : function() {
      return _medium;
    },

    /**
     * Sets the delivery medium
     *
     * @param {String} The delivery medium
     */
    setMedium : function(medium) {
      _medium = medium;
    },

    /**
     * The Internet Explorer version as a float Number. 0 if IE version not detected.
     */
    ieVersion : (function() {
      var rv = 0, ua, re;
      if (navigator) {
        try {
          ua = navigator.userAgent;
          if (navigator.appName == "Microsoft Internet Explorer") {
            re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
            if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
          } else if (navigator.appName == "Netscape") {
            re = new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})");
            if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
          }
        } catch (e) {}
        return rv;
      }
    })(),

    /**
     * Checks if an object is an array
     *
     * @param {Object} test The object to test
     * @return True if the object is an array
     */
    isArray : function(test) {
      return Object.prototype.toString.call(test) === "[object Array]";
    },

    /**
     * Checks if an object is empty
     *
     * @param {Object} test The object to test
     * @return True if the object is empty
     */
    isEmpty : function(test) {
      for (var key in test) {
        if (test.hasOwnProperty(key)) {
          return false;
        }
      }

      return true;
    },

    /**
     * Checks if we are in a frame
     *
     * @return {Boolean} True if we are in a frame
     */
    isFramed : function() {
      return window.self != window.top;
    },

    /**
     * Checks if we are in a friendly frame
     *
     * @return {Boolean} True if we are in a friendly frame
     */
    isFriendlyFramed : function() {
      if (!self.isFramed()) return false;

      try {
        // Try to access the parent DOM. It will throw an exception
        // if the frame is unfriendly
        window.parent.document.getElementsByTagName('body');
        return true;
      }
      catch (e) {
        return false;
      }
    },

    /**
     * Checks if we are in an unfriendly frame
     *
     * @return {Boolean} True if we are in an unfriendly frame
     */
    isUnfriendlyFramed : function() {
      return self.isFramed() && !self.isFriendlyFramed();
    },

    /**
     * Will be set to true in all versions of Internet Explorer
     */
    isIE : 0,

    /**
     * Gets the last script loaded on the page.
     *
     * @return {Object} The last script
     */
    lastScript : function() {
      var allScripts = document.getElementsByTagName("script");
      return allScripts[allScripts.length - 1];
    },

    /**
     * Performs a shallow merge of a list of objects into a single object.
     *
     * @param {Array} objects A list of objects to merge
     *
     * @param {Object} A new merged object
     */
    merge : function(objects) {

      var merged,
          obj;

      if (self.isArray(objects)) {
        merged = {};
        for (var i = 0; i < objects.length; i++) {
          obj = objects[i];
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              merged[key] = obj[key];
            }
          }
        }
      }

      return merged;
    },

    /**
     * Gets the current time in millis since epoch
     *
     * @return {Number} The current millis since epoch
     */
    now : function() {
      return (new Date()).getTime();
    },

    /**
     * Adds a postMessage handler to the window.
     *
     * @param {Function} callback The postMessage handler to add
     */
    postMessage : function(callback) {
      var falseAlias = false;
      if (window.addEventListener) {
        window.addEventListener("message", callback, falseAlias);
      } else if (window.attachEvent) {
        window.attachEvent("onmessage", callback, falseAlias);
      }
    },

    /**
     * Creates an empty frame with specified id and dimensions.
     * The frame element is returned but not added to the DOM.
     *
     * @param {String} name The name and id of the frame
     * @param {Number|String} width The width of the frame in pixels
     * @param {Number|String} height The height of the frame in pixels
     *
     * @return {Object} The created frame element
     */
    createFrameElement : function(name, width, height) {

      var frame = document.createElement("iframe");

      if (name) {
        frame.setAttribute("id", name);
        frame.setAttribute("name", name);
      }
      frame.setAttribute("width", width);
      frame.setAttribute("height", height);
      frame.setAttribute("frameSpacing", "0");
      frame.setAttribute("frameBorder", "no");
      frame.setAttribute("scrolling", "no");

      return frame;
    },

    /**
     * Renders a creative into an IFRAME
     *
     * @param opts {object}  Frame settings
     *
     *  {Number|String} width The width of the created iframe
     *  {Number|String} height The height of the created iframe
     *  {Object} hookNode The iframe will be appended to or replace this node
     *  {String} [name] The name and ID of the iframe element
     *  {String} [title] Title of the iframe document, defaults to "OpenX"
     *  {Boolean} [replace] If true the hook node will be replaced
     *  {String} [headHTML] HTML to add to the head
     *  {String} [bodyHTML] HTML to add to the body
     *  {Function} [onStart] onStart Callback function
     *  {Function} [onLoad] onLoad callback function
     *  {Function} [onSuccess] called after iframe is written
     *  {Boolean} [isRetry]
     *
     * @return {object}  The iframe element
     */
    produceFrame : function(opts) {

      var ifrm,
          useAlt,
          altIframeSrc = 'javascript:window["contents"]',
          ifrmDoc,
          hook = opts.hookNode,
          name = opts.name,
          width = opts.width,
          height = opts.height,
          onstart = opts.onStart,
          onload = opts.onFinish,
          onSuccess = opts.onSuccess,
          altIframeContentsVar = name + "_contents",
          creativePage = self.template(self.Templates.IFRAME_DOC, {
            title : opts.title || "OpenX",
            head : opts.headHTML,
            body : opts.bodyHTML
          });

      ifrm = self.createFrameElement(name, width, height);
      if (opts.replace) {
        self.replace(hook, ifrm);
      } else {
        hook.appendChild(ifrm);
      }

      // IE < 11 and Opera browsers
      useAlt = (self.isIE && (self.ieVersion < 11)) || window.opera;

      if (useAlt) {
        ifrm.src = altIframeSrc;
      }

      if (useAlt) {
        try {
          //try to set content on the window
          onload && attachOnloadToFrame(ifrm, onload);
          ifrm.contentWindow.contents = creativePage;
          onstart && onstart();
          ifrm.src = altIframeSrc;
        } catch (e) {
          //try setting document.domain
          var firstFrame = ifrm;
          // create new iframe with clean src
          ifrm = self.createFrameElement(name, width, height);
          // pass contents through global
          window[altIframeContentsVar] = creativePage;
          altIframeSrc = self.template(self.Templates.IFRAME_JS_URI, {
            contentsVar : altIframeContentsVar,
            domain : document.domain
          });
          onload && attachOnloadToFrame(ifrm, onload);
          ifrm.src = altIframeSrc;
          onstart && onstart();
          self.replace(firstFrame, ifrm);
        }
      } else {
        // other browsers
        try {
          ifrmDoc = ifrm.contentWindow || ifrm.contentDocument;
          if (ifrmDoc.document) {
            ifrmDoc = ifrmDoc.document;
          }
          onload && attachOnloadToFrame(ifrm, onload);
          if (ifrmDoc) {
            ifrmDoc.open("text/html", "replace");
            onstart && onstart();
            ifrmDoc.write(creativePage);
            ifrmDoc.close();
          }
        } catch (except) {
          if (!opts.isRetry) {
            opts.hookNode = ifrm;
            opts.replace = true;
            opts.isRetry = true;
            window.setTimeout(function(){
              self.produceFrame(opts);
            }, 0);
          }
        }
      }
      onSuccess && onSuccess(ifrm);
    },

    /**
     * Generates a string of base 10 integers. Typically 10 digits long, though
     * may be shorter.
     *
     * @return {String} The randomly generated number
     */
    rand : function() {
      return Math.floor(Math.random() * 9999999999) + "";
    },

    /**
     * Removes the specified node from the DOM
     *
     * @param {Object} node The node to remove
     */
    remove : function(node) {
      node.parentNode.removeChild(node);
    },

    /**
     * Replaces an existing DOM node with another. Wraps native replaceChild
     *
     * @param {Object} replaceNode  The node to replace.
     * @param {Object} newNode The new node
     *
     * @return {Object} The new node
     */
    replace : function(replaceNode, newNode) {
      replaceNode.parentNode.replaceChild(newNode, replaceNode);
      return newNode;
    },

    /**
     *
     */
    replaceOrRemove : function(newNode, replaceNode, appendNode) {
      if (!newNode) {
        replaceNode && self.remove(replaceNode);
      } else {
        if (replaceNode) {
          return self.replace(replaceNode, newNode);
        } else {
          return self.append(appendNode, newNode);
        }
      }
    },

    /**
     * Serializes a map of properties into a query arg string. Arrays values are
     * joined with a comma, otherwise the default toString is used. Ignores
     * properties that have null or undefined values.
     *
     * @param {Object} properties The property map to serialize
     *
     * @return {String} The serialized properties or undefined on bad input
     */
    serialize : function(properties) {

      var queryString = "",
          value;

      if (typeof properties === "object") {
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            value = properties[key];
            if (self.defined(value) && (value !== null)) {
              if (self.isArray(value)) {
                value = value.join(",");
              }
              queryString += key + "=" + escape(value) + "&";
            }
          }
        }
      }

      if (queryString.length > 1) {// remove trailing '&'
        queryString = queryString.substr(0, queryString.length - 1);
      }

      return queryString;

    },

    /**
     * Stores key value pair in either local storage or cookie
     */

    /**
     * Applies a set of replacement values to a template. If a token has no
     * replacement value, or the value is null or undefined, the empty string is
     * used.
     *
     * @param {String} template The formatted template string
     * @param {Object} params Maps token_names to replacement values
     * @param {String} [start] Optional override for the start character
     * @param {String} [end] Optional override for the end character
     *
     * @return {String} The post-application string
     */
    template : function(template, params, start, end) {

      params = params || {};

      var buf = "",
          bufOpen = false,
          res = "",
          ch,
          start = start || "{",
          end = end || "}",
          value,
          replacement;

      // process template char by char, look for tokens
      for (var i = 0; i < template.length; i++) {
        ch = template.charAt(i);

        if (!bufOpen && ch === start) {
          bufOpen = true;
        }
        else if (bufOpen && ch === end) {
          value = params[buf];
          if (self.defined(value) && value !== null) {
            replacement = value;
          } else {
            replacement = "";// default to empty string
          }
          res += replacement;
          bufOpen = false;
          buf = "";
        }
        else {
          if (bufOpen) {
            buf += ch;
          } else {
            res += ch;
          }
        }
      }
      return res;

    },

    // TODO move out
    // common template strings for use with the templater
    Templates : {
      SCRIPT : "<script type='text/javascript' id='{id}' src='{src}'><\/script>",
      IFRAME_DOC : "<!DOCTYPE html><html><head><title>{title}</title><base target='_top'/>{head}</head><body style='margin:0;padding:0'>{body}</body></html>",
      GW_URL : "{gw}/{v}/{r}?{q}",//TODO need this stil?
      IFRAME_JS_URI : "javascript:document.open();document.domain='{domain}';document.write(window.parent['{contentsVar}']);window.parent['{contentsVar}']=null;setTimeout('document.close()',5000)"
    },

    /**
     * A wrapper for document.write that checks if the page is loaded
     * before writing, to avoid wiping out the document.
     *
     * @param value {String} The value to write
     */
    write : function(value) {
      document.readyState !== "complete" && document.write(value);
    },

    /**
     * check if cookie is enabled
     */
    isCookieEnabled : function(){
      return navigator.cookieEnabled && _js_cookies_enabled;
    },

    /**
     * Returns true if input value is within bounds.
     * Otherwise returns false if value is out of Bounds or NaN
     * (bounds limit set to 1000000)
     *
     * @param {Number} val input value to be checked
     */
    isValidDIM : function(val){
      if (val > MAX_DIM) {
        return false;
      } else if (isNaN(val)) {
        return false;
      }
      return true;
    },

    /**
     * Returns true if an input object is empty
     *
     * @param {Object} obj Input object to check
     */
    isEmpty : function(obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }
      return true;
    },

    /**
     * Check if subList is a subset of superList.
     * If used for cache the format of both inputs ideally be like
     * ["w1xh1", "w2xh2", .., "wnxhn"]
     *
     * @param superList super list to be checked against for subset comparison
     * @param subList sub list to be checked whether it is subset of super list
     * @returns {Boolean} true if sub list is subset of super list;
     *                    false otherwise
     */
    isSubset : function(superList, subList) {
      var subListIndex,
          superListIndex;

      //check edge cases for superList and subList
      if (!self.isValidArray(superList) || !self.isValidArray(subList)) {
        return false;
      }

      //check if superList is smaller than subList
      if (superList.length < subList.length) {
        return false;
      }

      //for each element in sub list
      for (subListIndex = 0;subListIndex < subList.length; subListIndex++) {
        //lookup each element in super list
        for (superListIndex = 0;superListIndex < superList.length; superListIndex++) {
          //if current sub list element found move to next sub list element
          if (subList[subListIndex] === superList[superListIndex]) {
            break;
          }
          if (superListIndex === superList.length - 1) {
            return false;
          }
        }
      }

      return true;
    },

    /**
     * Check if input is a valid and non-empty array
     *
     * @param arr input list to be checked
     */
    isValidArray : function(arr) {
      return arr && self.isArray(arr) && arr.length !== 0;
    },

    /**
     * Returns true if current context is in an iframe
     */
    inIframe : function() {
      return window.self !== window.top;
    },

    /**
     * Returns top left co-ordinates by traversing an element's parent hierarchy
     *
     * @param {Object} node The DOM element whose top left position is to be calculated
     */
    getPosition : function(node) {
      var xPosition = yPosition = 0;

      if (node == null) {
        return null;
      }

      while (node) {
        if (node.tagName != 'SCRIPT') {
          xPosition += node.offsetLeft;
          yPosition += node.offsetTop;
          node = node.offsetParent;
        } else {
          node = node.previousElementSibling;
        }
      }
      return { left: Math.round(xPosition), top: Math.round(yPosition) };
    },

    /**
     * Returns top left position of an element from its id
     *
     * @param {Object} doc The document object
     * @param {String} id The id of DOM element whose top left position is to be calculated
     */
    getPositionById : function(doc, id) {
      var node = doc.getElementById(id);
      return self.getPosition(node);
    },

    /**
     * Calculates ad position data (browser dimensions and adunit's top left location)
     * for an input element
     *
     * @param {Object} node The DOM element whose dimensions are to be calculated
     * @param {Boolean} bidderEnabled Boolean value indicating if Bidder is enabled or not
     *
     * return {Object} adPosition Ad/Page position object containing browser dimensions
     *                            and ad unit top left location. Returns null in case of
     *                            cross domain requests and in bidder scenarios when
     *                            ad unit dom element is still not created at the time
     *                            OX ad request is made
     */
    getAdPosition : function(node, bidderEnabled) {
      var browserDims,
          adPosition,
          parentWindow = window,
          parentDocument = window.document;

      try {
        node = window.frameElement? window.frameElement.parentNode : node;

        if (self.inIframe()) {
          parentWindow = window.parent;
          parentDocument = window.parent.document;
        }

        browserDims = self.detectWindowDimensions(parentWindow, parentDocument);
        //check if screen dimensions - width and height are within bounds
        if (!self.isValidDIM(browserDims.width) || !self.isValidDIM(browserDims.height)) {
          return null;
        }

        if (bidderEnabled) {
          adPosition = self.getPositionById(parentDocument, node);
          if (adPosition == null) { //if dom not created for a div in bidder scenario, return null
            return null;
          }
        } else {
          adPosition = self.getPosition(node);
        }
        //check if ad position left and top values are within bounds
        if (!self.isValidDIM(adPosition.left) || !self.isValidDIM(adPosition.top)) {
          return null;
        }

        return { browserDims : browserDims, adUnitStartPos : adPosition };
      } catch(err) {
        return null;
      }
    }
  };
  // END PUBLIC API -->

  if (self.ieVersion) {
    self.isIE = 1;
  }

  return self;

}(window, document, navigator);
