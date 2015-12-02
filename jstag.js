var OX = OX || function(window, document) {

  var _adRequests = {}, // references to ad requests on this page
      _gateway,         // the OX gateway URL to use
      _pageURL,         // current page url
      _refURL,          // the referrer url
      _frameCreatives,  // flag to frame all creatives
      _hooks = {},      // references to callback functions

      self,             // outward facing object
      utils,            // utils module alias

      DOS_COOKIE = "OX_sd"; // name of the session cookie

  // <!-- BEGIN PRIVATE METHODS

  // special function that will only run once
  var _oncePerPageLoad = function() {

    var hasRun = 0;// only run once

    return function() {
      if (hasRun) return;
      _sessionDepth();
      hasRun = 1;
    };

  }();

  function _sessionDepth() {
    var dosCookieValue,
        expirationDate;
    if (!utils.isFramed()) {
      // create or increment depth of session
      dosCookieValue = utils.getCookie(DOS_COOKIE);
      if (parseInt(dosCookieValue)) {
        dosCookieValue++;
      } else {
        dosCookieValue = 1;
      }
      expirationDate = new Date(utils.now() + 1200000).toGMTString();
      utils.cookie(DOS_COOKIE, dosCookieValue, expirationDate);
      self._requestArgs.sd = dosCookieValue;
    }
  }

  // write JSONP pixels
  function _writePixel(data, resource) {

    var src,
        finalSrc,
        script,
        customArgs = {},
        extraArgs = {},
        userGateway,
        args,
        queryStr;

    // process custom vars
    if (data.vars) {
      for (var key in data.vars) {
        if (data.vars.hasOwnProperty(key)) {
          customArgs["c." + escape(key)] = data.vars[key];
        }
      }
      data.vars = null;// send only the modified keys
    }

    // check for user-specified gateway
    if (data.gw) {
      userGateway = data.gw;
      data.gw = null;
    }

    // set additional query args
    if ("") extraArgs.oxns = "";
    if (_pageURL) extraArgs.ju = _pageURL;
    if (_refURL) extraArgs.jr = _refURL;
    extraArgs.cb = utils.rand();

    args = utils.merge([data, extraArgs, customArgs, utils.contextArgs()]);
    queryStr = utils.serialize(args);

    src = utils.template(utils.Templates.GW_URL, {
      gw : userGateway || _gateway,
      v : "1.0",
      r : resource,
      q : queryStr
    });

    finalSrc = utils.ensureRightProtocol(src);

    script = utils.template(utils.Templates.SCRIPT, {
      src : src,
      id : "ox_" + resource + "_" + utils.rand()
    });

    utils.write(script);// TODO allow async

  };

  // END PRIVATE METHODS -->

  // <!-- BEGIN PUBLIC API

  /**
   * Creates a new adRequest object using the provided initialization data.
   * See OX.AdRequest for details on the accepted initialization data.
   *
   * @param {Object} init The initialization object.
   */
  self = function(init) {
    var adRequest = new OX.AdRequest(init, {
      url : _pageURL = _pageURL || utils.detectPageURL(),
      ref : _refURL = _refURL || utils.detectRefererURL(),
      gw : _gateway
    });
    _adRequests[adRequest.get("o")] = adRequest;
    return adRequest;
  };

  self._customVars = {}; // page-level custom variables
  self._requestArgs = {}; // page-level request args

  /**
   * Registers callback functions or "hooks" provided from user or other modules
   * that will be called at the appropriate times. Hook types are denoted under
   * AdRequest.prototype.Hook
   *
   * @param {Function} callback The hook
   * @param {Number} The hook type
   */
  self.addHook = function(callback, type) {
    if (!_hooks[type]) {
      _hooks[type] = [];
    }
    _hooks[type].push(callback);
  };

  /**
   * Adds a custom variable for all ad requests. Variables are
   * stored as maps of arrays
   *
   * @param {String} key The custom variable name
   * @param {String} value The custom variable value
   * @param {String} [prefix] If present, use instead of "c."
   * @param {Boolean} [overwrite] If truthy, first clear entries for this key
   */
  self.addVariable = function(key, value, prefix, overwrite) {
    var customVars = self._customVars,
        customKey = (prefix || "c") + "." + key;
    if (overwrite || !customVars[customKey]) {
      customVars[customKey] = [];
    }
    customVars[customKey].push(value);
  };

  /**
   * Static method to write something to the document. Used for piggyback
   * pixels.
   *
   * @param {String} html The markup to write to the document
   */
  self.appendTag = function(html) {
    utils.write(html);
  };

  /**
   * Static method called by the default resource when a default is detected.
   * The parameters are used to identify the particular request, adunit and
   * chain link the default originated from on the page.
   *
   * @param {String} reqId The request ID
   * @param {String} auid The adUnit ID
   * @param {Number} index The index in the chain that defaulted
   */
  self.dflt = function(reqId, auid, index) {
    var request = _adRequests[reqId];
    request && request.dflt(auid, index);
  };

  /**
   * Static method called from within a friendly iframe to set the rendered HTML
   * on the respective adunit object.
   *
   * @param {String} reqid The request ID
   * @param {String} auid The adUnit ID
   * @param {String} html The HTML to set
   */
  self.ifrmHTML = function(reqId, auid, html) {
    var request = _adRequests[reqId];
    request && request.ifrmHTML(auid, html);
  };

  /**
   * Sets universal flag to frame all creatives
   *
   * @param {Boolean} enable
   */
  self.frameCreatives = function(enable) {
    _frameCreatives = enable;
  };

  /**
   * Returns the global setting for frameCreatives
   *
   * @return {Boolean} True if the frameCreatives has been set
   */
  self.getFramed = function() {
    return _frameCreatives;
  };

  /**
   * Gets all registered callbacks by type
   *
   * @param {String} type The hook type
   * @return {Array} A list of hooks
   */
  self.getHooksByType = function(type) {
    return _hooks[type];
  };

  /**
   * Any tasks that should occur after other modules have loaded. Called from
   * the driver.
   */
  self.init = function() {
    utils = OX.utils;
    _oncePerPageLoad();
  };

  /**
   * Static method to asynchronously request an ad
   * See OX.AdRequest for detail on the accepted initialization object.
   *
   * @param {Object} init Object from which to initialize the ad request
   */
  self.load = function(init) {
    self(init).load();
  };

  /**
   * Static method to synchronously request an ad.
   * See OX.AdRequest for details on the accepted initialization data.
   *
   * @param {Object} init Object from which to initialize the ad request
   */
  self.requestAd = function(init) {
    self(init).fetchAds();
  };

  /**
   * Static method to fire conversion pixels.
   *
   * @param {Object} init Object from which to build the conversion request
   * TODO document
   */
  self.recordAction = function(data) {
    _writePixel(data, self.Resources.RAJ);
  };

  /**
   * Static method to fire segmentation pixels.
   *
   * @param {Object} json Object from which to build the segmentation request
   * TODO document
   */
  self.recordSegments = function(json) {

    var expires,
        data = {};// query args

    if (json.expires) {// don't send expired pixel
      expires = Date.parse(json.expires);
      if (expires < new Date()) return;
    }

    for (var key in json) {
      if (json.hasOwnProperty(key)) {
        switch (key) {// have to change some keys
          case "add": data.as = json[key]; break;
          case "del": data.ds = json[key]; break;
          default:
            data[key] = json[key];
        }
      }
    }

    _writePixel(data, self.Resources.RSJ);
  };

  /**
   * Writes the creative into the page at the current location in the DOM. Has
   * no effect if document is done loading. Identical to appendTag.
   *
   * @param {String} html the creative markup to render
   */
  self.renderCreative = function(html) {
    utils.write(html);
  };

  /**
   * Sets the gateway for all ad requests
   *
   * @param {String} url The gateway to set
   */
  self.setGateway = function(url) {
    _gateway = utils.ensureRightProtocol(url);
  };

  /**
   * Sets the page url for all ad requests
   *
   * @param {String} url The page URL to set
   */
  self.setPageURL = function(url) {
    _pageURL = url;
  };

  /**
   * Sets the referrer url for all ad requests
   *
   * @param {String} url The referer URL to set
   */
  self.setRefererURL = function(url) {
    _refURL = url;
  };

  /**
   * An enum of places to hook functions into via addHook()
   */
  self.Hooks = {
    ON_AD_REQUEST : 1,// useful for adding args
    ON_AD_RESPONSE : 2,// after load, before render
    ON_ADUNIT_CREATED : 3,// runs once per adunit
    ON_ADUNIT_INITIALIZED : 4,// when setting from adresponse data
    ON_ADUNIT_RENDER_START : 5,
    ON_ADUNIT_RENDER_FINISH : 6,
    ON_AD_DEFAULTED : 7,
    ON_AD_NOT_DEFAULTED : 8
  };

  /**
   * An enum of request modes.
   */
  self.Modes = {
    IMMEDIATE : 1,
    DEFERRED : 2
  };

  /**
   * An enum of gateway resources
   */
  self.Resources = {// TODO include versions
    ACJ : "acj",
    RAJ : "raj",
    RDF : "rdf",
    RR : "rr",
    RI : "ri",
    RSJ : "rsj",
    RE : "re"
  };

  /**
   * An enum of geo location values.
   */
  self.GeoLocationSources = {
    GPS : 1,
    IP_ADDRESS : 2,
    USER_REGISTRATION : 3
  };

  /**
   * Whether to expose friendly iframe contents.
   */
  self.shareFrameContents = false;

  return self;

  // END PUBLIC API -->

}(window, document);

/**
 * Utility functions
 */
OX.utils = OX.utils || function(window, document, navigator) {

  var self,

      // medium set by Gateway
      _medium = "w",

      // don't set cookies with javascript (1st party domain)
      _js_cookies_enabled = true,

      MAX_DIM = 1000000;

  /**
   * Create an empty frame with specified id and dimensions.
   * The frame element is returned but not added to the DOM.
   *
   * @param String id The id of the frame
   * @param String width The width of the frame in pixels
   * @param String height The height of the frame in pixels
   *
   * @return Object The created frame element
   */
  function createFrameElement(id, width, height) {

    var frame = document.createElement("iframe");

    frame.setAttribute("id", id);
    frame.setAttribute("width", width);
    frame.setAttribute("height", height);
    frame.setAttribute("frameSpacing", "0");
    frame.setAttribute("frameBorder", "no");
    frame.setAttribute("scrolling", "no");

    return frame;
  }

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
    contextArgs : function() {

      var windowDims = self.detectWindowDims(),
          args = {
            res : screen.width + "x" + screen.height + "x" + screen.colorDepth,
            plg : self.detectPlugins(),
            ch : document.charset || document.characterSet,
            tz : (new Date()).getTimezoneOffset()
          },
          metas = document.getElementsByTagName("meta"),
          tag;

      // window dims
      if (windowDims) {
        args.ws = windowDims[0] + "x" + windowDims[1];
      }
      args.ifr = self.isFramed() ? 1 : 0;
      if (args.ifr) {
        try {
          tWin = window.top;
          tDoc = window.top.document;
          tDims = self.detectWindowDimensions(tWin, tDoc);
          if (tDims) {
            args.tws = tDims.width + "x" + tDims.height;
          }
        } catch (crossDomainErr) {}
      } else {
        args.tws = args.ws;
      }
      // detect viewport meta tag
      for (var i = 0; i < metas.length; i++) {
        tag = metas[i];
        if (tag.name && tag.name === "viewport") {
          args.vmt = 1;
          break;
        };
      };

      // detect browser_id
      if (OX.browser_id && OX.browser_id.get() != undefined) {
          args.bi = OX.browser_id.get();
      }

      // detect xdi_tapad
      if (OX.tp_xdi_tapad) {
          OX.tp_xdi_tapad.sync();
      }

      // detect Criteo presync
      if (OX.tp_presync_criteo) {
          var presync_criteo = OX.tp_presync_criteo.get();
          args["tp.presync.criteo"] = presync_criteo['id'];
          args["tp.presync.criteo.status"] = presync_criteo['status'];
      }

      // detect MediaMath presync
      if (OX.tp_presync_mediamath) {
          var presync_mediamath = OX.tp_presync_mediamath.get();
          args["tp.presync.mediamath"] = presync_mediamath['id'];
          args["tp.presync.mediamath.status"] = presync_mediamath['status'];
      }

      return args;
    },

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
      // use != instead of !== because of IE8 quirks
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
     * Renders a creative into an IFRAME
     *
     * @param opts {object}  Frame settings
     *
     *  {Number|String} width The width of the created iframe
     *  {Number|String} height The height of the created iframe
     *  {Object} hookNode The iframe will be appended to or replace this node
     *  {Boolean} [replace] If true the hook node will be replaced
     *  {String} [id] The id of the iframe element
     *  {String} [title] Title of the iframe document, defaults to "OpenX"
     *  {String} [headHTML] HTML to add to the head
     *  {String} [bodyHTML] HTML to add to the body
     *  {Function} [onload] Frame onload callback function
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
          id = opts.id,
          width = opts.width,
          height = opts.height,
          onload = opts.onload,
          altIframeContentsVar = id + "_contents",
          creativePage = self.template(self.Templates.IFRAME_DOC, {
            title : opts.title || "OpenX",
            head : opts.headHTML,
            body : opts.bodyHTML
          });

      ifrm = createFrameElement(id, width, height);
      if (useAlt) {
        ifrm.src = altIframeSrc;
      }
      if (opts.replace) {
        self.replace(hook, ifrm);
      } else {
        hook.appendChild(ifrm);
      }

      // IE < 11 and Opera browsers
      useAlt = (self.isIE && (self.ieVersion < 11)) || window.opera;

      if (useAlt) {
        try {
          //try to set content on the window
          onload && attachOnloadToFrame(ifrm, onload);
          ifrm.contentWindow.contents = creativePage;
          ifrm.src = altIframeSrc;
        } catch (e) {
          //try setting document.domain
          var firstFrame = ifrm;
          // create new iframe with clean src
          ifrm = createFrameElement(id, width, height);
          // pass contents through global
          window[altIframeContentsVar] = creativePage;
          altIframeSrc = self.template(self.Templates.IFRAME_JS_URI, {
            contentsVar : altIframeContentsVar,
            domain : document.domain
          });
          onload && attachOnloadToFrame(ifrm, onload);
          ifrm.src = altIframeSrc;
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
            ifrmDoc.write(creativePage);
            ifrmDoc.close();
          }
        } catch (except) {
          if (!opts.isRetry) {
            opts.hookNode = ifrm;
            opts.replace = true;
            opts.isRetry = 1;
            window.setTimeout(function(){
              self.produceFrame(opts);
            }, 0);
          }
        }
      }

      return ifrm;

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
    store : function() {

      var TEST_VALUE = "1",
          TWENTY_YRS_MILLIS = 630720000000,
          ARRAY_DELIMITER = "|",
          LS,
          _hasLocalStorage,
          _hasEnabledCookies,
          _storeMap = {};

      // check if browser has local storage or cookies enabled
      try {
        LS = localStorage;
        LS.setItem(TEST_VALUE, TEST_VALUE);
        LS.removeItem(TEST_VALUE);
        _hasLocalStorage = 1;
      } catch (e) {
        if (navigator.cookieEnabled && _js_cookies_enabled) _hasEnabledCookies = 1;
      }

      function read(name, remove) {
        var key = "OX_" + name,
              result_arr,
              result;
        if (_hasLocalStorage) {
          result = LS.getItem(key);
          remove && LS.removeItem(key);
        } else if (_hasEnabledCookies) {
          result = self.getCookie(key);
          remove && self.cookie(key);
        } else {
          result = _storeMap[key];
          remove && (delete _storeMap[key]);
        }
        if (result) {
          result_arr = result.split(ARRAY_DELIMITER);
          for (var i = 0; i < result_arr.length; i++) {
            result_arr[i] = unescape(result_arr[i]);
          }
          if (result_arr.length === 1) {
            return result_arr[0];
          } else {
            return result_arr;
          }
        }
      }

      return {

        put : function(name, value) {
          var key = "OX_" + name,
              sanitized_value,
              escaped_arr,
              twenty_years;

          if (self.isArray(value)) {
            escaped_arr = [];
            for (var i = 0; i < value.length; i++) {
              escaped_arr.push(escape(value[i]));
            }
            sanitized_value = escaped_arr.join(ARRAY_DELIMITER);
          } else {
            sanitized_value = escape(value);
          }

          if (_hasLocalStorage) {
            LS.setItem(key, sanitized_value);
          } else if (_hasEnabledCookies) {
            twenty_years = new Date(self.now() + TWENTY_YRS_MILLIS).toGMTString();
            self.cookie(key, sanitized_value, twenty_years);
          } else {
            _storeMap[key] = sanitized_value;
          }
        },

        get : function(name) {
          return read(name);
        },

        remove : function(name) {
          return read(name, 1);
        }

      };

    }(),

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

        if (self.isFramed()) {
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
/*@cc_on OX.utils.isIE=1;@*/

/**
 * Manages an ad request sequence, aliased by OX.
 *
 * @constructor
 *
 * @param {Object} init Contains data to intialize the ad request
 *
 * @param {String} init.auid The adunit ID for an ox3 direct request
 * @param {String} init.tid A content topic ID for this ad request
 * @param {String} init.aumf The adunit's market floor
 * @param {String} init.aungf The adunit's NG market floor
 * @param {String} init.tg Target window to open clicked ads
 * @param {String} init.imp_beacon Impression beacon
 * @param {String} init.slot_id ID of the placeholder element for async request
 *
 * @param {String} init.gw The gateway URL to use for this request
 * @param {String} init.url The page URL
 * @param {String} init.ref The referrer URL
 * @param {String} init.r The click redirect URL
 * @param {String} init.fallback Fallback
 * @param {String} init.test Test flag should be "true" or "false"
 * @param {String} init.userid The user ID for this ad request
 * @param {String|Number} init.rd The refresh delay in seconds for auto-refresh
 * @param {String|Number} init.rm The max number of refreshes for auto-refresh
 * @param {String} init.md If truthy, disable market for this ad request
 * @param {String} init.ns If truthy, disable segmentation for this ad request
 * @param {Object} init.vars Custom variables
 * @param {Array} init.ef An array of strings of features to enable
 * @param {Array} init.df An array of strings of features to disable
 *
 * @param {Object} init.coords The Coordinates object for the users location
 * @param {Object|String} init.openrtb The OpenRTB BidRequest-like object with additional data for buyers
 * @param {String} init.appName The mobile application name
 * @param {String} init.appBundle The mobile application bundle identifier
 * @param {String} init.appStoreURL The app store URL
 * @param {Array} init.deviceIDs An array of device ID representations
 * @param {Array|String} init.af List of supported API frameworks on user's device.
 *
 * @param {String} [init.frameCreatives] If truthy, frame all creatives
 * @param {String} [init.forceUnframed] If truthy, never frame any creatives
 * @param {Function} [init.onResponse] Callback function for ad response
 * @param {Function} [init.onAdUnitRender] Callback function for adunit render start
 * @param {Function} [init.onAdUnitLoaded] Callback function for adunit render finish
 *
 * @param {Object} defaults Default settings overriden by init
 *
 * @param {String} defaults.url The default page URL
 * @param {String} defaults.ref The default referrer URL
 *
 */
OX.AdRequest = OX.AdRequest || function(init, defaults) {

  var utils = OX.utils,   // utils module alias

      _uid = utils.rand(),    // this ad request's unique identifier
      _gateway,               // the OX HTTP gateway to use for this ad request
      _adunits = {},          // the adunit container
      _frameCreatives,        // flag to frame all creatives
      _forceUnframed = false, // force creatives to be unframed
      _frameDoctype,          // doctype for iframe documents
      _frameHTMLAttributes,   // HTML attributes for iframes
      _customVars = {},       // container for custom variables
      _hooks = {},            // references to callback functions
      _requestNode,           // script element for the ad request
      _debugNode,             // refers to the debug comment
      _pixelNode,             // refers to the pixel iframe
      _clickRedirectURL,      // special case for this request arg
      _response,              // store response for dfp_bidder use
      _ortb = {},             // store OpenRTB data
      _attemptPOST = false,   // flag to attempt a POST request

      _properties = {         // request query args
        o : _uid              // unique id
      },

      _public = {             // non-query-arg public properties
        mode : null,          // the request mode
        auid : null,          // the auid if mode is IMMEDIATE
        record_tmpl : null,   // record template from the ad response
        ad_units : []         // list of all ad units
      },

      URL_CHARACTER_LIMIT = 2048, // A conservative limit for IE
      CALLBACK_FN = "OX_" + _uid,
      REQUEST_NODE_ID = "ox_" + OX.Resources.ACJ + "_" + _uid,

      PIXEL_IFRAME_TEMPLATE =
          "<iframe src='{src}' width='0' height='0' style='display:none;'>" +
          "</iframe>",

      self = this,          // alias of 'this' for compression
      Hooks = OX.Hooks, // Hooks alias
      Modes = OX.Modes; // Modes alias

  // <!-- BEGIN PRIVATE METHODS

  // checks if auto refresh is enabled, returns false once refresh is exhausted
  function _autoRefreshEnabled() {
    return (_properties.rm > 0) && (_properties.rd > 0)
              && (_properties.rc < _properties.rm);
  }

  // initialize auto-refresh count to 0 if necessary
  function _initializeRefreshCount() {
    if ((_properties.rd > 0) && (_properties.rm > 0) && (!_properties.rc)) {
      _properties.rc = 0;
    }
  }

  function _createRequestScript() {
    var src = self.createAdRequestURL(),
        idsuffix = _properties.rc && ("_" + _properties.rc),
        id = REQUEST_NODE_ID + (idsuffix || ""),// TODO template out
        script = utils.createScript({
          id : id,
          src : src
        });
    return script;
  }

  // executes hook functions of the provided type
  function _executeHooks(type, applyArgs) {

    var localHookList = _hooks[type] || [],
        globalHookList = OX.getHooksByType(type) || [],
        hookList = globalHookList.concat(localHookList),
        hook;

    if (hookList) {
      for (var i = 0; i < hookList.length; i++) {
        hook = hookList[i];
        hook.apply(this, applyArgs);
      }
    }
  }

  // adds or refreshes the sourced iframe for third-party pixels into the DOM
  function _loadPixels(pixelSrc) {

    var markup,
        node,
        pixelFrame;

    if (pixelSrc) {
      markup = utils.template(PIXEL_IFRAME_TEMPLATE, {
        src : pixelSrc
      });
      pixelFrame = utils.create(markup);

      if (_pixelNode) {
        utils.replace(_pixelNode, pixelFrame);
      } else if (node = document.body) {
        // we can only append iframes the body, so if the body does not
        // exist we cannot append pixels
        node.appendChild(pixelFrame);
      }
    }
  }

  // queues the next auto-refresh request
  function _queueAutoRefresh() {
    _properties.rc++;// increment refresh count
    setTimeout(function() {
      self.refreshAds();
    }, 1000 * _properties.rd);
  }

  // adds or refreshes the ad request info into the DOM
  function _writeDebug(debug) {
    var debugComment;
    if (debug) {
      debugComment = document.createComment(" " + debug.replace(/--/g,"- -"));
    }
    _debugNode = utils.replaceOrRemove(debugComment, _debugNode, _requestNode);
  }

  // side effects from being in mobile app context
  function _setMobileApp() {
    var mobileAppDeliveryMedium = "ma",
        softwarePlatform = "js";

    utils.setMedium(mobileAppDeliveryMedium);
    _gateway = _gateway.replace(/\/m?w$/, "/" + mobileAppDeliveryMedium);
    _properties.sp = softwarePlatform;

    // Removed auto-detected page URLs as these can confuse buyers in exchange.
    delete _properties.ju;
    delete _properties.jr;
  }

  // Utility to make a POST request. Intended for OpenRTB use case, but should
  // probably be refactored and exposed in oxns.utils.js.
  function _performPOST(url, successCallback, failureCallback) {
    var xhr = new XMLHttpRequest(),
        urlParts = url.split("?");

    // Gateway will return JSONP response if callback parameter is
    // in the request wether it is GET or POST. So we remove callback parameter
    // to get the raw JSON.
    try {
      // If callback is the last parameter
      urlParts[1] = urlParts[1].replace(/(^|&)callback=[^&]*$/, '');
      // Otherwise
      urlParts[1] = urlParts[1].replace(/(^|&)callback=.*?&/, '$1');
    } catch (e) {}

    xhr.open("POST", urlParts[0]);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          successCallback && successCallback(JSON.parse(this.responseText));
        } else {
          // POST attempt failed, so remove OpenRTB data and ideally try again as GET
          _attemptPOST = false;
          _ortb = {};
          delete _properties.openrtb;
          failureCallback && failureCallback();
        }
      }
    };

    xhr.send(urlParts[1]);
  }

  // Collect top left position of each adunit
  function _collectAdUnitsPosition() {
    var auids,
        auid,
        adunit,
        anchor,
        pos,
        dims = '',
        adxy = [];

    if (true && !self.isBidderEnabled()) {

      auids = _properties.auid || [];

      for (var i = 0; i < auids.length; i++) {
        auid = auids[i];
        adunit = _adunits[auid];
        anchor = adunit.get('anchor') || utils.lastScript();
        pos = utils.getAdPosition(anchor, false);
        if (pos) {
          dims = pos.browserDims.width + 'x' + pos.browserDims.height;
          adxy.push(pos.adUnitStartPos.left + ',' + pos.adUnitStartPos.top);
        }
        else {
          adxy.push('');
        }
      }

      self.setBrowserDims(dims);
      self.setAdUnitLocation(adxy.join('|'));
    }

  }

  // END PRIVATE METHODS -->

  // <!-- BEGIN PUBLIC API

  /**
   * This method indicates that we actually want to request this adunit,
   * as it's technically possible to configure settings for an adunit
   * that doesn't end up getting requested. Also used to distinguish between
   * regular and auto-refreshed requests for adunit groups.
   *
   * @param {String} auid The adunit ID to add
   */
  self.addAdUnit = function(auid) {
    var adunit = self.getOrCreateAdUnit(auid),
        adPosition;
    if (!_properties.auid) {
      _properties.auid = [];
    }
    _properties.auid.push(auid);
  };

  /**
   * Adds a content topic to this OX instance.
   *
   * @param {String} id The content topic to add
   */
  self.addContentTopic = function(id) {
    _properties.tid = _properties.tid || [];
    _properties.tid.push(id);
  };

  /**
   * Registers callback functions or "hooks" provided from user or other modules
   * that will be called at the appropriate times. Hook types are denoted under
   * AdRequest.prototype.Hook
   *
   * @param {Function} callback The hook
   * @param {Number} The hook type
   */
  self.addHook = function(callback, type) {
    if (!_hooks[type]) {
      _hooks[type] = [];
    }
    _hooks[type].push(callback);
  };

  /**
   * Adds a page id to this ad request.
   *
   * @param {String} id The page id to add
   */
  self.addPage = function(pgid) {
    _properties.pgid = _properties.pgid || [];
    _properties.pgid.push(pgid);
  };

  /**
   * Adds a custom variable to this ad request. Variables are stored as a map of
   * arrays
   *
   * @param {String} key The custom variable name
   * @param {String} value The custom variable value
   * @param {String} [prefix] If present, use instead of "c."
   * @param {Boolean} [overwrite] If truthy, first clear entries for this key
   */
  self.addVariable = function(key, value, prefix, overwrite) {
    var customKey = (prefix || "c") + "." + key;
    if (overwrite || !_customVars[customKey]) {
      _customVars[customKey] = [];
    }
    _customVars[customKey].push(value);
  };

  /**
   * Creates the ad request URL
   */
  self.createAdRequestURL = function() {

    var url,
        args,
        queryStr = "ef=c";// include args set by other requests

    _initializeRefreshCount();

    _collectAdUnitsPosition();

    // Serialize ortb parameters into a JSON string.
    if (!utils.isEmpty(_ortb)) {
      try {
        _properties["openrtb"] = JSON.stringify(_ortb);
      } catch (e) {}
    }

    args = utils.merge(
      [ _properties,
        _customVars,
        utils.contextArgs(),
        OX._customVars,
        OX._requestArgs
      ]);

    queryStr && (queryStr += "&");
    queryStr += utils.serialize(args);

    if (_clickRedirectURL) // this arg must be last
      queryStr += "&r=" + escape(_clickRedirectURL);

    url = utils.template(utils.Templates.GW_URL, {
      gw : _gateway,
      v : "1.0",
      r : OX.Resources.ACJ,
      q : queryStr
    });

    if (!utils.isEmpty(_ortb) && url.length > URL_CHARACTER_LIMIT) {
      _attemptPOST = true;
    }

    return url;
  };

  /**
   * Relays a global default notification to the appropriate adunit.
   *
   * @param {String} auid The adunit ID
   * @param {Number} index The index in the chain that defaulted
   */
  self.dflt = function(auid, index) {
    var adunit = _adunits[auid];
    adunit && adunit.dflt(index);
  };

  /**
   * Set the rendered HTML on the respective adunit object.
   *
   * @param {String} reqid The request ID
   * @param {String} auid The adUnit ID
   */
  self.ifrmHTML = function(auid, html) {
    var adunit = _adunits[auid];
    adunit && adunit.set("iframe_html", html);
  };

  /**
   * Adds a feature to the disabled list for this ad request
   *
   * @param {String} feature The feature to disable
   */
  self.disableFeature = function(feature) {
    _properties.df = _properties.df || [];
    _properties.df.push(feature);
  };

  /**
   * Disables market for this ad request
   */
  self.disableMarket = function() {
    self.disableFeature("m");
  };

  /**
   * Disables segmentation for this ad request
   */
  self.disableSegmentation = function() {
    _properties.ns = 1;
  };

  /**
   * Adds a feature to the enabled list for this ad request
   *
   * @param {String} feature The feature to enable
   */
  self.enableFeature = function(feature) {
    _properties.ef = _properties.ef || [];
    _properties.ef.push(feature);
  };

  /**
   * Enables market for this ad request
   */
  self.enableMarket = function() {
    self.enableFeature("m");
  };

  /**
   * Enables segmentation for this ad request
   */
  self.enableSegmentation = function() {
    _properties.ns = null;
  };

  /**
   * Performs an ad request for this AdRequest object.
   */
  self.fetchAds = function() {

    var src,
        script;

    _executeHooks(Hooks.ON_AD_REQUEST, [self]);
    src = self.createAdRequestURL();

    if (_attemptPOST) {
      _performPOST(src, window[CALLBACK_FN], self.fetchAds);
    } else {

      script = utils.template(utils.Templates.SCRIPT, {
        src : src,
        id : REQUEST_NODE_ID
      });

      utils.write(script);
    }

  };

  /**
   * Called after the request has loaded. Displays an ad depending on the mode.
   */
  self.fetchAdsComplete = function() {
    switch (_public.mode) {
      case Modes.IMMEDIATE:
        self.showAdUnit(_public.auid);
        break;
      case Modes.DEFERRED:
        for (var auid in _adunits) {
          // group auto-refresh and group async tags
          if (_adunits.hasOwnProperty(auid)) {
            if (_adunits[auid].get("anchor")) {
              self.showAdUnit(auid);
            }
          }
        }
        break;
      default:
    }
    // queue auto refresh
    if (_properties.auid && _properties.auid.length === 1) {
      // special refresh case for single adunit
      if (_properties.rc === 0) {
        self.addHook(function() {
          _autoRefreshEnabled() && _queueAutoRefresh();
        }, OX.Hooks.ON_ADUNIT_RENDER_FINISH);
      }
    } else {
      _autoRefreshEnabled() && _queueAutoRefresh();
    }
  };

  /**
   * Flag to frame all creatives associated with this ad request
   *
   * @param {Boolean} enable
   */
  self.frameCreatives = function(enable) {
    _frameCreatives = enable;
  };

  /**
   * Gets the adunit specified, creating a new adunit if necessary.
   *
   * @param {String} auid The adunit ID to get/create
   */
  self.getOrCreateAdUnit = function(auid) {
    if (!_adunits[auid]) {
      _adunits[auid] = new OX.AdUnit(auid, self.get("o"));
      // add adunit to publicly accessible adunits
      _public.ad_units.push(_adunits[auid]);
      _executeHooks(Hooks.ON_ADUNIT_CREATED, [_adunits[auid]]);// TODO push down
    }
    return _adunits[auid];
  };

  /**
   * Gets a public property, secondly searching the query arg properties
   *
   * @param {String} name The property name
   * @return The property value
   */
  self.get = function(name) {
    return _public.hasOwnProperty(name) ? _public[name] : _properties[name];
  };

  self.getQueryArgs = function() {
    return _properties;
  };

  self.getProperties = function() {
    return _public;
  };

  /**
   * Returns true if bidder is enabled and mapping exists
   */
  self.isBidderEnabled = function() {
    if (OX.dfp_bidder_config) {
      return !utils.isEmpty(OX.dfp_bidder_config);
    }
    return false;
  };

  /**
   * Check if the ad response is 'empty'
   */
  self.isResponseEmpty = function() {
    var adunit, chain;
    if (!(_response &&
          _response.ads &&
          _response.ads.adunits &&
          (adunit = _response.ads.adunits[0]) &&
          (chain = adunit.chain) &&
          chain.length)) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Fetch the template for recording events, from the
   * ad response
   */
  self.getRecordTemplate = function() {
    if (_response && _response.ads) {
      return _response.ads["record_tmpl"];
    }
    return "";
  };

  /**
   * Load the ad response for this ad request
   *
   * @param {Object} response The response object
   */
  self.loadAdResponse = function(response) {

    var ads = response.ads,
        adunits = response.ads.adunits,
        adunit,
        adunitObj;

    // request-level properties
    _requestNode = _requestNode || utils.get(REQUEST_NODE_ID);//TODO fix
    _response = response;

    _loadPixels(ads.pixels);
    _writeDebug(_public.debug = ads.debug);

    for (var i = 0; i < adunits.length; i++) {
      adunit = adunits[i];

      if (adunit.refresh_delay) _properties.rd = adunit.refresh_delay;
      if (adunit.refresh_max) _properties.rm = adunit.refresh_max;
      _initializeRefreshCount();
      if (_autoRefreshEnabled()) _frameCreatives = 1;

      adunitObj = self.getOrCreateAdUnit(adunit.auid);
      adunitObj.load({
        adunit : adunit,
        rt : ads.record_tmpl,
        chain : ads.chain
      });

      _executeHooks(Hooks.ON_ADUNIT_INITIALIZED, [adunitObj]);
    }

  };

  /**
   * Performs an ad request, and prepares ads to be loaded asynchronously.
   * Async equivalent to fetchAds().
   */
  self.load = function() {
    var script,
        node,
        reqURL = self.createAdRequestURL();

    _executeHooks(Hooks.ON_AD_REQUEST, [self]);

    _frameCreatives = 1;

    if (_attemptPOST) {
      _performPOST(reqURL, window[CALLBACK_FN], self.load);
    } else {
      script = _createRequestScript();
      node = document.head || document.body;
      if (node) {
        node.appendChild(script);
        _requestNode = script;
      } else {
        _requestNode = utils.append(utils.lastScript(), script);
      }
    }
  };

  /**
   * Refreshes all adunits managed by this AdRequest.
   */
  self.refreshAds = function() {
    var script,
        reqURL = self.createAdRequestURL();

    _executeHooks(Hooks.ON_AD_REQUEST, [self]);

    if (_attemptPOST) {
      _performPOST(reqURL, window[CALLBACK_FN], self.load);
    } else {
      script = _createRequestScript();
      _requestNode = utils.replace(_requestNode, script);
    }
  }

  /**
   * Sets the fallback for an adunit in this OX instance.
   *
   * @param {String} auid The auid targeted
   * @param {String} fallback The fallback to set
   */
  self.setAdUnitFallback = function(auid, fallback) {
    self.getOrCreateAdUnit(auid).set("fallback", fallback);
  };

  /**
   * Sets the impression beacon for an adunit in this ad request
   *
   * @param {String} auid The auid targeted
   * @param {String} impBeacon The impression beacon to set
   */
  self.setAdUnitImpBeacon = function(auid, impBeacon) {
    self.getOrCreateAdUnit(auid).set("imp_beacon", impBeacon);
  };

  /**
   * Sets the market floor for an adunit in this ad request
   *
   * @param {String} auid The auid targeted
   * @param {String} floor The market floor to set
   */
  self.setAdUnitMarketFloor = function(auid, floor) {
    self.getOrCreateAdUnit(auid);
    _properties.aumf = _properties.aumf || [];
    _properties.aumf.push(auid + ":" + floor);
  };

  /**
   * Sets the NG floor for an adunit in this ad request
   *
   * @param {String} auid The auid targeted
   * @param {String} floor The NG floor to set
   */
  self.setAdUnitNGFloor = function(auid, floor) {
    self.getOrCreateAdUnit(auid);
    _properties.aungf = _properties.aungf || [];
    _properties.aungf.push(auid + ":" + floor);
  };

  /**
   * Sets the ID of the DOM element used as a placeholder for this adunit
   *
   * @param {String} auid The auid targeted
   * @param {String} slotID The ID of the placeholder
   */
  self.setAdUnitSlotId = function(auid, slotID) {
    self.getOrCreateAdUnit(auid).set("anchor", utils.get(slotID));
  };

  /**
   * Sets the anchor target for this ad request
   *
   * @param {String} target The anchor target to set
   */
  self.setAnchorTarget = function(target) {
    _properties.tg = target;
  };

  /**
   * Sets Browser Viewport's dimensions for a specific ad unit
   *
   * @param {String} browserDims Browser Dimensions in form of 'widthXheight'
   */
  self.setBrowserDims = function(browserDims) {
    _properties.dims = browserDims;
  };

  /**
   * Sets Ad Unit's topleft location for a specific ad unit
   *
   * @param {String} adPosition Ad Unit's topleft location in form of 'X,Y'
   */
  self.setAdUnitLocation = function(adPosition) {
    _properties.adxy = adPosition;
  };

  /**
   * Sets the click redirect URL for this ad request
   *
   * @param {String} url The click redirect URL to set
   */
  self.setClickRedirectURL = function(url) {
    _clickRedirectURL = url;
  };

  /**
   * Sets the gateway URL for this ad request
   *
   * @param {String} url The gateway to set
   */
  self.setGateway = function(url) {
    _gateway = utils.ensureRightProtocol(url);
  };

  /**
   * Sets the mode for this ad request. Possibilities
   * "immediate" and "deferred".
   *
   * @param {String} mode The mode to set
   */
  self.setMode = function(mode) {
    _public.mode = mode;
  };

  /**
   * Sets the page URL for this ad request
   *
   * @param {String} url The page URL to set
   */
  self.setPageURL = function(url) {
    _properties.ju = utils.ensureRightProtocol(url);
  };

  /**
   * Sets the referrer URL for this ad request
   *
   * @param {String} url The referrer URL to set
   */
  self.setRefererURL = function(url) {
    _properties.jr = url;
  };

  /**
   * Sets the refresh delay for this ad request
   *
   * @param {Number|String} rd The refresh to delay to set in seconds
   */
  self.setRefreshDelay = function(rd) {
    _properties.rd = rd;
  };

  /**
   * Sets the maximum number of refreshes for this ad request
   *
   * @param {Number|String} rm The refresh max to set
   */
  self.setRefreshMax = function(rm) {
    _properties.rm = rm;
  };

  /**
   * Flag this ad request as a test
   *
   * @param {Boolean} test Test will be set to 'true' if truthy
   */
  self.setTest = function(test) {
    _properties.test = test ? "true" : null;
  };

  /**
   * Sets the user ID for this ad request
   *
   * @param {String} xid The user ID to set
   */
  self.setUserID = function(xid) {
    _properties.xid = xid;
  };

  /**
   * Sets the bidder eligibility of the AdRequest
   *
   * @param {Boolean} eligible - indicates if the request is bidder eligible.
   */
  self.setBidderEligibility = function(eligible) {
    _properties.be = eligible ? 1 : 0;
  };

  /**
   * Sets the flag to indicate if the ad response from this request
   * can potentially be cached at the client (browser) side
   *
   * @param {Boolean} flag - indicates if ad response can be cached
   */
  self.setCacheEnabled = function(flag) {
    _properties.ce = flag ? 1 : 0;
  };

  /**
   * Sets the location coordinates for this ad request
   *
   * @param {Object} coords The Coordinates object for the users location
   */
  self.setCoords = function(coords) {
    if (coords.latitude && coords.longitude) {
      _properties.lat = coords.latitude;
      _properties.lon = coords.longitude;

      // Coordinates set here are always considered as user registration source.
      _properties.lt = coords.source || OX.GeoLocationSources.GPS;
    }
  };

  /**
   * Sets the list of ad sizes to be requested.
   *
   * @param {List} sizes List of sizes of the form "HxW[|H2xW2]"
   */
  self.setAdSizes = function(sizes) {
    _properties.aus = _properties.aus ? _properties.aus + "|" : "";
    _properties.aus = _properties.aus + sizes.join(",");
  };

  /**
   * Sets the app name for this ad request.
   *
   * @param {String} appName The name of the app
   */
  self.setAppName = function(appName) {
    if (appName) {
      _properties["app.name"] = appName;
      _setMobileApp();
    }
  };

  /**
   * Sets the app bundle ID for this ad request.
   *
   * @param {String} appBundleID The bundle ID for the app
   */
  self.setAppBundleID = function(appBundleID) {
    if (appBundleID) {
      _properties["app.bundle"] = appBundleID;
      _setMobileApp();
    }
  };

  /**
   * Sets the app store URL
   *
   * @param {String} url The app store URL
   */
  self.setAppStoreURL = function(url) {
    if (url) {
      _properties.url = utils.ensureRightProtocol(url);
      _setMobileApp();
    }
  };

  /**
   * Sets the supported API frameworks on user's device.
   *
   * @param {Array|String} frameworks Array or comma delimited string of supported frameworks
   */
  self.setAPIFrameworks = function(frameworks) {
    if (frameworks.toString()) {
      _properties.af = frameworks.toString();
      _setMobileApp();
    }
  };

  /**
   * Adds a device identifier to this ad request.
   *
   * @param {Object} deviceID
   * @param {String} [prefix] If present, used instead of 'did.'
   */
  self.addDeviceID = function(deviceID, prefix) {
    // TODO: trackingEnabledIDTypes should probably be an enum somewhere for
    // customers to use.
    var trackingEnabledIDTypes = {
          "did.ia": "did.iat",
          "did.adid": "did.adid.enabled"
        },
        type;

    if (deviceID.type && deviceID.id) {
      type = (prefix || "did.") + deviceID.type;
      _properties[type] = deviceID.id;

      // Tracking parameters vary by device ID. If tracking is enabled we set
      // the appopriate ad server parameter.
      if (trackingEnabledIDTypes.hasOwnProperty(type) && deviceID.hasOwnProperty("tracking")) {
        _properties[trackingEnabledIDTypes[type]] = !!deviceID.tracking;
      }
      _setMobileApp();
    }
  };

  /**
   * Sets the OpenRTB BidRequest-like object with additional data for buyers.
   * This can be passed as an object that will be converted to JSON or a JSON
   * string.
   *
   * @param {Object|String} ortb The OpenRTB data.
   */
  self.setOpenRTBParameters = function(ortb) {
    var ortb_obj;

    if (Object.prototype.toString.call(ortb) === "[object Object]") {
      _ortb = ortb;
    } else if (typeof ortb === "string") {
      try {
        ortb_obj = JSON.parse(ortb);
        this.setOpenRTBParameters(ortb_obj);
      } catch (e) {}
    }

  };

  /**
   * Adds an OpenRTB parameter.
   * The parameter is specified as a key path (i.e app.ver)
   *
   * @param {String} key The OpenRTB key name
   * @param {String|Number|Array} value The OpenRTB value
   */
  self.addOpenRTBParameter = function(key, value) {
    var componentKeys = key.split("."),
        currentComponent = _ortb,
        currentKey,
        arrayMatch,
        arrayIndex;

    for (var i=0; i < componentKeys.length; i++) {
      currentKey = componentKeys[i];

      // If this is the last element in the key path, we just add it.
      if (i === componentKeys.length - 1) {
        currentComponent[currentKey] = value;
        break;
      }

      arrayMatch = currentKey.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        // This is an array, so we need to make sure we set up an array and set
        // the currentComponent to the correct index of the array.
        currentKey = arrayMatch[1];
        arrayIndex = arrayMatch[2];
        currentComponent[currentKey] = currentComponent[currentKey] || [];
        currentComponent[currentKey][arrayIndex] = currentComponent[currentKey][arrayIndex] || {};
        currentComponent = currentComponent[currentKey][arrayIndex];
      } else {
        // In all other cases we can safely create just an object.
        currentComponent[currentKey] = currentComponent[currentKey] || {};
        currentComponent = currentComponent[currentKey];
      }

    }

  };

  /**
   * Renders an ad unit
   *
   * @param {String} auid The auid of the targeted ad unit
   */
  self.showAdUnit = function(auid) {

    var adunit = _adunits[auid],
        framed;

    if (adunit) {

      framed = function() {//TODO move to adunit init
        if (_forceUnframed) return 0;
        if (adunit.get("framed")) return 1;// ad unit
        if (utils.defined(_frameCreatives)) return _frameCreatives;// ad request
        return !!OX.getFramed();// global
      }();

      adunit.render({// TODO make some of these optional
        framed : framed,
        onAdUnitRenderStart : function() {
          _executeHooks(Hooks.ON_ADUNIT_RENDER_START, [adunit]);
        },
        onAdUnitRenderFinish : function() {
          _executeHooks(Hooks.ON_ADUNIT_RENDER_FINISH, [adunit]);
        },
        onAdDefaulted : function(adunit, link, index) {
          _executeHooks(Hooks.ON_AD_DEFAULTED, [adunit, link, index]);
        },
        onAdNotDefaulted : function(adunit, link, index) {
          _executeHooks(Hooks.ON_AD_NOT_DEFAULTED, [adunit, link, index]);
        },
        shareFrameContents : OX.shareFrameContents
      });
    }

  };

  // END PUBLIC API -->

  // <!-- BEGIN INITIALIZATION

  // set up the JSONP callback function
  window[CALLBACK_FN] = function(response) {
    self.loadAdResponse(response);
    _executeHooks(Hooks.ON_AD_RESPONSE, [self]);
    self.fetchAdsComplete();
  };
  _properties.callback = CALLBACK_FN;

  // set these for all modes
  self.setGateway(init && init.gw || defaults.gw);
  self.setPageURL(init && init.url || defaults.url);
  self.setRefererURL(init && init.ref || defaults.ref);

  // feature detection
  if (!window.postMessage) self.disableFeature("c");// chains need postMessage

  if (init) {

    // ad will be shown immediately
    self.setMode(Modes.IMMEDIATE);
    _public.auid = init.auid;

    // ad request properties
    init.auid && self.addAdUnit(_public.auid);
    init.tid && self.addContentTopic(init.tid);
    init.aumf && self.setAdUnitMarketFloor(_public.auid, init.aumf);
    init.aungf && self.setAdUnitNGFloor(_public.auid, init.aungf);
    init.tg && self.setAnchorTarget(init.tg);
    init.imp_beacon && self.setAdUnitImpBeacon(_public.auid, init.imp_beacon);
    init.slot_id && self.setAdUnitSlotId(_public.auid, init.slot_id);
    init.fallback && self.setAdUnitFallback(_public.auid, init.fallback);
    init.test && self.setTest(init.test);
    init.userid && self.setUserID(init.userid);
    init.r && self.setClickRedirectURL(init.r);
    init.rd && self.setRefreshDelay(init.rd);
    init.rm && self.setRefreshMax(init.rm);
    init.md && self.disableMarket();
    init.ns && self.disableSegmentation();

    init.coords && self.setCoords(init.coords);
    init.openrtb && self.setOpenRTBParameters(init.openrtb);

    // Mobile specific parameters
    init.appName && self.setAppName(init.appName);
    init.appBundle && self.setAppBundleID(init.appBundle);
    init.appStoreURL && self.setAppStoreURL(init.appStoreURL);
    init.af && self.setAPIFrameworks(init.af);
    if (init.deviceIDs) {
      for (var i = 0; i < init.deviceIDs.length; i++) {
        self.addDeviceID(init.deviceIDs[i]);
      }
    }

    // custom variables
    if (init.vars) {
      for (var k in init.vars) {
        init.vars.hasOwnProperty(k) && self.addVariable(k, init.vars[k]);
      }
    }

    // features
    if (init.ef) {
      for (var i = 0; i < init.ef.length; i++) {
        self.enableFeature(init.ef[i]);
      }
    }
    if (init.df) {
      for (var i = 0; i < init.df.length; i++) {
        self.disableFeature(init.df[i]);
      }
    }

    // frame settings
    if (utils.defined(init.frameCreatives)) {
      _frameCreatives = init.frameCreatives;
    }
    init.forceUnframed && (_forceUnframed = true);

    // callback functions
    init.onResponse && self.addHook(init.onResponse, Hooks.ON_AD_RESPONSE);
    init.onAdUnitRender && self.addHook(init.onAdUnitRender, Hooks.ON_ADUNIT_RENDER_START);
    init.onAdUnitLoaded && self.addHook(init.onAdUnitLoaded, Hooks.ON_ADUNIT_RENDER_FINISH);

  } else {

    // user is building up a customized ad request
    self.setMode(Modes.DEFERRED);

  }

  // END INITIALIZATION -->

};

/**
 * Creates a new AdUnit.
 * @constructor
 *
 * @param {String} auid The ad unit ID
 * @param {String} req_id Id of the OX.AdRequest this adunit belongs to
 */
OX.AdUnit = OX.AdUnit || function(auid, req_id) {

  var utils = OX.utils,         // utils module alias
      self = this,                  // this alias for compression
      Resources = OX.Resources, // resources alias

      _auid = auid,                 // the ad unit ID
      _reqID = req_id,              // UID of the parent adrequest object
      _adLink,                      // the chain link that rendered
      _rendered,                    // this adunit has been rendered
      _renderOptions,
      _renderStrategy,              // the function that renders ad

      _public = {                   // public properties
        adunit_id : auid,           // the ad unit ID
        anchor : null,              // the encapsulating node of ad
        rm_anchor : null            // the encapsulating node of rich media ad
      },

      _chainEnabled,                // chain rendering enabled
      _chainStartTime,              // time chain rendering started
      _chain_timing_enabled = false,

      // CONSTANTS

      DEFAULT = "dflt",                         // the default message
      LINK_DEFAULTED_FLAG = "dflt",             // link iframe defaulted
      LINK_LOADED_FLAG = "loaded",              // link iframe loaded
      FLASH_AD = "flash",                       // flash ad type
      IFRAME_ID = "ox_" + _reqID + "_" + _auid, // iframe name and ID
      CHAIN_TIMEOUT = parseInt("2500") || 2500, // max render time in millis
      ONLOAD_WAIT = 0,                          // time to wait after link onload
      IFRAME_SWF_SCRIPT =                       // support for framed flash ads
        "<script type='text/javascript'>" +
          "var OX_swfobject = " +
            "window.parent.OX.swfobject(window, document, navigator);" +
        "<\/script>",

      // STRING TEMPLATES

      RECORD_TEMPLATE,                                  // for gateway beacons
      CHAIN_IFRAME_ID_TEMPLATE = IFRAME_ID + "_ch_{i}", // chain iframe
      RI_BEACON_TEMPLATE =                              // record impression beacon
        "<script type='text/javascript'>" +
          "(new Image()).src='{src}'" +
        "<\/script>",
      RR_BEACON_TEMPLATE =                              // record render beacon
        "<script type='text/javascript'>" +
          "(new Image()).src='{src}'{suffix}" +
        "<\/script>",
      IFRAME_DFLT_TEMPLATE =                            // ad default message listener
        "<script type='text/javascript'>" +
          "(function() {" +
            "attachListener(window, 'message', dflt);" +
            // ad default listener
            "function dflt(e) {" +
              "if (e.data === '#data#') {" +
                "var msg = JSON.stringify({" +
                  "action : '#data#'," +
                  "params : ['#rid#','#auid#',#index#]" +
                "});" +
                // Send default message to every window that
                // could possibly create this ad
                "window.parent.postMessage(msg, '*');" +
                "var frames = window.parent.frames;" +
                "for (var i = 0; i < frames.length; i++) {" +
                  "frames[i].postMessage(msg, '*');" +
                "}" +
                "if (document.readyState === 'complete') {" +
                  // window is already loaded
                  "removeFrame();" +
                "} else {" +
                  "attachListener(window, 'load', removeFrame);" +
                "}" +
              "}" +
            "}" +
            // remove the defaulted ad frame
            "function removeFrame() {" +
              // In FF, the load event of the frame window is fired before the
              // load event of the frame. If the frame is removed from the DOM,
              // its load event (hooks are registered on it) won't be fired. To
              // stop this from happening, we defer the removal of the frame.
              "setTimeout(function() {" +
                "window.frameElement.parentNode.removeChild(window.frameElement);" +
              "}, 0);" +
            "}" +
            // X-browser function to attach a listener
            "function attachListener(target, type, listener) {" +
              "if (target.addEventListener) {" +
                "target.addEventListener(type, listener, false);" +
              "} else {" +
                "target.attachEvent('on' + type, listener);" +
              "}" +
            "}" +
          "})();" +
        "<\/script>",
      IFRAME_SHARE_CONTENTS_TEMPLATE =
        "<script type='text/javascript'>" +
          "window.onload = function() {" +
            "var html = document.documentElement.innerHTML;" +
            "window.parent.OX.ifrmHTML('[rid]', '[auid]', html);" +
          "};" +
        "<\/script>";

  // <!-- BEGIN PRIVATE METHODS

  // single ad rendering strategy
  function _renderSingleAd() {

    var html,
        recordImpressionURL,
        recordImpressionHTML;

    if (!_renderOptions.renderTest) {
      // Append impression beacon to non-flash ads.
      // Flash ads manage impression from within.
      if (_adLink && _adLink.html && _adLink.type !== FLASH_AD) {
        recordImpressionURL = utils.template(RECORD_TEMPLATE, {
            medium : utils.getMedium(),
            rtype : Resources.RI,
            txn_state : _adLink.ts
        });
        recordImpressionHTML = _getTemplateOrDeferBeacon(RI_BEACON_TEMPLATE, {
          src : recordImpressionURL
        });
        _adLink.html += recordImpressionHTML;
      }
    }

    if (_adLink && _adLink.html && !_adLink.is_fallback) {
      // only append third-party impression beacon when it's not a fallback
      html = _adLink.html + (_public.imp_beacon || "");
    }
    else {
      // prefer client-side fallback
      html = _public.fallback || _adLink && _adLink.html;
    }

    if (html) {
      _renderOptions.onAdUnitRenderStart();

      _produceFramedAd(
        IFRAME_ID,
        self.get("width"),
        self.get("height"),
        self.get("type") === FLASH_AD ? IFRAME_SWF_SCRIPT : "",
        html,
        _renderOptions.onAdUnitRenderFinish,
        _renderOptions.shareFrameContents
      );
    }

  }

  // ad chain rendering strategy
  function _renderAdChain() {
    _chainStartTime = utils.now();
    _renderOptions.onAdUnitRenderStart();
    _renderChainLink(0);
  }

  // Renders a particular link of an ad chain.
  // Let n be the number of ads in the chain. The first n-1 ads are
  // defaulting, the last one is non-defaulting. A record render
  // beacon is fired for each ad attempted.
  function _renderChainLink(i) {

    var headHTML,
        recordRenderURL,
        recordRenderURLSuffix,
        recordRenderHTML,
        onload,
        chain = _public.chain,
        frameID = utils.template(CHAIN_IFRAME_ID_TEMPLATE, {
          i : i
        });

    _adLink = chain[i];

    if (!_renderOptions.renderTest) {
      recordRenderURL = utils.template(RECORD_TEMPLATE, {
        medium : utils.getMedium(),
        rtype : Resources.RR,
        txn_state : _adLink.ts
      });
      // if we are collecting chain timing data, send
      // 'time' as a parameter for defaulting ads.
      if (_chain_timing_enabled && i < chain.length - 1) {
        recordRenderURL += '&cts=';
        recordRenderURLSuffix = ' + new Date().getTime();';
      }
      recordRenderHTML = _getTemplateOrDeferBeacon(RR_BEACON_TEMPLATE, {
        src : recordRenderURL,
        suffix : recordRenderURLSuffix || ''
      });
      // insert rr beacon before ad html
      _adLink.html = recordRenderHTML + _adLink.html;
    }

    if (i < chain.length - 1) { // defaulting
      _attachAdDefaultListener();

      // ad default message listener in iframe <head>
      headHTML = utils.template(IFRAME_DFLT_TEMPLATE, {
        data : DEFAULT,
        rid : _reqID,
        auid : _auid,
        index : i
      }, '#', '#');

      onload = function() {
        _onLinkLoad(i);
      };

      _produceFramedAd(
        frameID,
        _adLink.width,
        _adLink.height,
        headHTML,
        _adLink.html,
        onload,
        _renderOptions.shareFrameContents
      );
    }
    else { // non-defaulting
      _renderSingleAd();
    }

  }

  function _hasTimeoutOccured() {
    return (utils.now() - _chainStartTime) > _public.chain_timeout;
  }

  function _onLinkLoad(index) {

    window.setTimeout(function() {
      var link = _public.chain[index],
          nextIndex = index + 1,
          url;

      link[LINK_LOADED_FLAG] = 1;

      if (link.hasOwnProperty(LINK_DEFAULTED_FLAG)) {
        if (_hasTimeoutOccured()) {
          nextIndex = _public.chain.length - 1;// skip to fill-all if time is up
        }
        _renderChainLink(nextIndex);// continue
      }
      else {
        _renderOptions.onAdNotDefaulted(self, link, index);

        // record impression if ok
        if (!_renderOptions.renderTest) {
          url = utils.template(RECORD_TEMPLATE, {
            medium : utils.getMedium(),
            rtype : Resources.RI,
            txn_state : _adLink.ts
          });
          if (_chain_timing_enabled) {
             url += '&cte=' + utils.now();
          }
          utils.beacon(url);
        }

        _renderOptions.onAdUnitRenderFinish();
      }
    }, ONLOAD_WAIT);

  }

  // produce a framed ad in the DOM, wraps utils.produceFrame
  function _produceFramedAd(id, w, h, head, body, onload, shareFrameContents) {

    var getContentsScript = '',
        hook;

    if (shareFrameContents) {
      getContentsScript = utils.template(IFRAME_SHARE_CONTENTS_TEMPLATE, {
        rid : _reqID,
        auid : _auid
      }, "[", "]");
    }

    head = (_public.head_html || '') + head + getContentsScript;
    body = (_public.pre_html || '') + body + (_public.post_html || '');

    // we are in an unfriendly iframe and have a rich media ad
    if (utils.isUnfriendlyFramed() && self.get('type') === 'rich_media') {
      // TODO: add unfriendly iframe support
      console.log("Unfriendly iframe");
      return;
    }

    // we are in a friendly iframe and have a rich media ad
    if (utils.isFriendlyFramed() && self.get('type') === 'rich_media') {
      if (!_public.rm_anchor) {
        // insert an anchor after the current frame in parent DOM
        _public.rm_anchor = document.createElement('div');
        utils.append(window.frameElement, _public.rm_anchor);
      }
      hook = _public.rm_anchor;
      // We'll append the rich media ad to the anchor in parent DOM.
      // The current frame needs to be hidden.
      window.frameElement.style.display = 'none';
    }
    else {
      hook = _public.anchor;
    }

    utils.produceFrame({
      hookNode : hook,
      id : id,
      width : w,
      height : h,
      headHTML : head,
      bodyHTML : body,
      onload : onload
    });

    self.set('iframe_id', id);
  }

  // synchronously writes ad HTML to the document
  function _produceSyncAd(html) {
    var paddedHTML = (_public.pre_html || "") + html + (_public.post_html || ""),
        finalHTML = paddedHTML;
    if (!document.body && utils.isFramed()) {
      finalHTML = "<body style='margin:0;padding:0'>" + paddedHTML + "</body>";
    }
    utils.write(paddedHTML);
  }

  // attach ad default listener to current window
  function _attachAdDefaultListener() {
    utils.attachListener(window, "message", function(event) {
      try {
        var msg = JSON.parse(event.data);
        if (msg.action === DEFAULT) {
          OX.dflt.apply(OX, msg.params);
        }
      } catch (e) {}
    });

    // replace it with no-op so it only run once
    _attachAdDefaultListener = function(){};
  }

  // fire default beacon for the given 'ad link'
  function _fireDefaultBeacon(adLink) {
    var recordDefaultURL = utils.template(RECORD_TEMPLATE, {
      medium : utils.getMedium(),
      rtype : Resources.RDF,
      txn_state : adLink.ts
    });
    if (_chain_timing_enabled) {
      recordDefaultURL += '&cte=' + utils.now();
    }
    utils.beacon(recordDefaultURL);
  }

  var deferredStrategies = [
    // MRAID
    {
      shouldDefer: function() {
        return (window.mraid && typeof mraid.isViewable === "function" && !mraid.isViewable());
      },
      defer: function(beaconURL) {
        var beaconFired = false;
        mraid.addEventListener("viewableChange", function(isViewable) {
          if (!beaconFired && isViewable) {
            utils.beacon(beaconURL);
            beaconFired = true;
          }
        });
      }
    },

    // MoPub
    {
      shouldDefer: function() {
        return typeof trackImpressionHelper === "function";
      },
      defer: function(beaconURL) {
        var _trackImpressionHelper = trackImpressionHelper;
        trackImpressionHelper = function() {
          utils.beacon(beaconURL);
          _trackImpressionHelper();
        }
      }
    }
  ];

  // Wrapper over utils.template for cases that an impression should be deferred.
  // Currently this is needed in the context of mobile apps where some SDKs
  // render content off screen; we should only fire impression beacon when
  // content is shown on screen.
  function _getTemplateOrDeferBeacon(template, params, startToken, endToken) {
    var beaconURL = params.src,
        strategy;

    for (var i = 0; i < deferredStrategies.length; i++) {
      strategy = deferredStrategies[i];
      if (strategy.shouldDefer()) {
        strategy.defer(beaconURL);
        return "";
      }
    }

    return utils.template(template, params, startToken, endToken);
  }

  // END PRIVATE METHODS -->

  // <!-- BEGIN PUBLIC API

  self.dflt = function(index) {

    var link = _public.chain[index],
        nextIndex = index + 1;

    if (link[LINK_DEFAULTED_FLAG]) return; // don't process duplicate default
    link[LINK_DEFAULTED_FLAG] = 1;

    _fireDefaultBeacon(_adLink);

    _renderOptions.onAdDefaulted(self, link, index);

    // we are in an unfriendly iframe and the defaulted ad is rich media
    if (utils.isUnfriendlyFramed() && link.type === 'rich_media') {
      // TODO: restore current frame
      console.log("Unfriendly iframe rich media defaulted");
    }
    // we are in a friendly iframe and the defaulted ad is rich media
    else if (utils.isFriendlyFramed() && link.type === 'rich_media') {
      window.frameElement.style.display = ''; // restore current frame
    }

    if (!_renderOptions.renderTest) {
      if (link.hasOwnProperty(LINK_LOADED_FLAG)) {
        /*
          'onload' fired before postMessage received!

           This scenario happens on some browsers (mostly IE).
           At this point we have already fired an 'impression'
           beacon. But in reality this 'ad' defaulted and we
           should let 'grid' know about the default even though
           its after the fact.

           Also notice we are going to the next link in the
           chain, since we know for sure this particular 'ad'
           defaulted. This has the side effect of grid getting
           potentially multiple impression events for the same
           ad request. But grid ignores all the impression beacons
           but the one from the higest 'link' no (last link chain
           effectively).
        */
        if (_hasTimeoutOccured()) {
          nextIndex = _public.chain.length - 1;
        }
        _renderChainLink(nextIndex);// continue to the 'next' link
      }
    }
  }

  /**
   *
   */
  self.get = function(name) {
    return _public.hasOwnProperty(name) ? _public[name] :
              (_adLink && _adLink[name]);
  };

  /**
   *
   */
  self.set = function(key, value) {
    _public[key] = value;
  };

  self.getProperties = function() {
    return utils.merge([_public, _adLink]);
  }

  /**
   * Initializes this adunit from the ad response
   */
  self.load = function(opts) {

    var adunit = opts.adunit,
        dims;

    _public.chain = adunit.chain;
    _public.chain_timeout = adunit.chain_timeout || CHAIN_TIMEOUT;

    // Adunit size (w x h) is returned only if the ad chain is empty.
    // If a client-side fallback is provided, we'll use it to create
    // an ad with this size
    if (adunit.size) {
      dims = adunit.size.split('x');
      _public.width = dims[0];
      _public.height = dims[1];
    }

    RECORD_TEMPLATE = opts.rt;

    // if anchor is not set, jstag is and has to be loaded synchronously
    if (!_public.anchor) {
      _public.anchor = document.createElement('div');
      // some ad servers load our ad tag in an iframe with no body
      if (!document.body && utils.isFramed()) {
        utils.write("<body style='margin:0;padding:0'></body>");
        document.body.appendChild(_public.anchor);
      }
      else { // append anchor after jstag
        utils.append(utils.lastScript(), _public.anchor);
      }
    }

    // set rendering strategy
    // chain feature is enabled and chain has ads
    if (opts.chain && _public.chain && _public.chain.length > 0) {
      _renderStrategy = _renderAdChain;
    }
    else {
      // treat the first link as a standalone ad
      _adLink = _public.chain && _public.chain[0];
      _renderStrategy = _renderSingleAd;
    }

    _rendered = false;

  };

  /**
   * Renders ad unit
   *
   * @param {Object} [options] Render-time options
   *
   *
   */
  self.render = function(renderOptions) {

    var dims,
        height = self.get('height'),
        width = self.get('width');

    // if the creative is too big for our iframe we make it
    // larger if the frame is friendly
    if (utils.isFramed()) {
      try {
        dims = utils.detectWindowDimensions(window, document);
        if (dims.height < height) {
          window.frameElement.height = height;
          window.frameElement.style.height = height + 'px';
        }
        if (dims.width < width) {
          window.frameElement.width = width;
          window.frameElement.style.width = width + 'px';
        }
      } catch (e) {}
    }

    if (!_renderStrategy || _rendered) return;

    _renderOptions = renderOptions;
    self.set("framed", _renderOptions.framed);

    _renderStrategy();
    _rendered = true;

  };

  // END PUBLIC API -->

};

/* NOTICE  if you are updating swfobject, please make sure to replace the use of
 * $version with $version, otherwise sgte will break
 */
/*! SWFObject v2.2 <http://code.google.com/p/swfobject/> is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> */
OX.swfobject = function(win, doc, nav) {

  var defined = OX.utils.defined,
      OBJECT = "object",
      SHOCKWAVE_FLASH = "Shockwave Flash",
      SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
      FLASH_MIME_TYPE = "application/x-shockwave-flash",
      EXPRESS_INSTALL_ID = "SWFObjectExprInst",
      ON_READY_STATE_CHANGE = "onreadystatechange",

      win = win || window,
      doc = doc || document,
      nav = nav || navigator,

      plugin = false,
      domLoadFnArr = [main],
      regObjArr = [],
      objIdArr = [],
      listenersArr = [],
      storedAltContent, storedAltContentId, storedCallbackFn, storedCallbackObj, isDomLoaded = false,
      isExpressInstallActive = false,
      dynamicStylesheet, dynamicStylesheetMedia, autoHideShow = true,

      /* Centralized function for browser feature detection
                - User agent string detection is only used when no good alternative is possible
                - Is executed directly for optimal performance
        */

      ua = function() {
      var w3cdom = defined(doc.getElementById) && defined(doc.getElementsByTagName) && defined(doc.createElement),
          u = nav.userAgent.toLowerCase(),
          p = nav.platform.toLowerCase(),
          windows = p ? /win/.test(p) : /win/.test(u),
          mac = p ? /mac/.test(p) : /mac/.test(u),
          webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,

          // returns either the webkit version or false if not webkit
          ie = !+"\v1",

          // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
          playerVersion = [0, 0, 0],
          d = null;
      if (defined(nav.plugins) && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
        d = nav.plugins[SHOCKWAVE_FLASH].description;
        if (d && !(defined(nav.mimeTypes) && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
          plugin = true;
          ie = false; // cascaded feature detection for Internet Explorer
          d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
          playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
          playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
          playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
        }
      } else if (defined(win.ActiveXObject)) {
        try {
          var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
          if (a) { // a will return null when ActiveX is disabled
            d = a.GetVariable("$version");
            if (d) {
              ie = true; // cascaded feature detection for Internet Explorer
              d = d.split(" ")[1].split(",");
              playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
            }
          }
        } catch (e) {}
      }
      return {
        w3: w3cdom,
        pv: playerVersion,
        wk: webkit,
        ie: ie,
        win: windows,
        mac: mac
      };
      }(),

      /* Cross-browser onDomLoad
                - Will fire an event as soon as the DOM of a web page is loaded
                - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
                - Regular onload serves as fallback
        */

      onDomLoad = function() {
      if (!ua.w3) {
        return;
      }
      if ((defined(doc.readyState) && doc.readyState == "complete") || (!defined(doc.readyState) && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically
        callDomLoadFunctions();
      }
      if (!isDomLoaded) {
        if (defined(doc.addEventListener)) {
          doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
        }
        if (ua.ie && ua.win) {
          doc.attachEvent(ON_READY_STATE_CHANGE, function() {
            if (doc.readyState == "complete") {
              doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
              callDomLoadFunctions();
            }
          });
          if (win == top) { // if not inside an iframe
            (function() {
              if (isDomLoaded) {
                return;
              }
              try {
                doc.documentElement.doScroll("left");
              } catch (e) {
                setTimeout(arguments.callee, 0);
                return;
              }
              callDomLoadFunctions();
            })();
          }
        }
        if (ua.wk) {
          (function() {
            if (isDomLoaded) {
              return;
            }
            if (!/loaded|complete/.test(doc.readyState)) {
              setTimeout(arguments.callee, 0);
              return;
            }
            callDomLoadFunctions();
          })();
        }
        addLoadEvent(callDomLoadFunctions);
      }
      }();

  function callDomLoadFunctions() {
    if (isDomLoaded) {
      return;
    }
    try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
      var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
      t.parentNode.removeChild(t);
    } catch (e) {
      return;
    }
    isDomLoaded = true;
    var dl = domLoadFnArr.length;
    for (var i = 0; i < dl; i++) {
      domLoadFnArr[i]();
    }
  }

  function addDomLoadEvent(fn) {
    if (isDomLoaded) {
      fn();
    } else {
      domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
    }
  }

/* Cross-browser onload
                - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
                - Will fire an event as soon as a web page including all of its assets are loaded
         */

  function addLoadEvent(fn) {
    if (defined(win.addEventListener)) {
      win.addEventListener("load", fn, false);
    } else if (defined(doc.addEventListener)) {
      doc.addEventListener("load", fn, false);
    } else if (defined(win.attachEvent)) {
      addListener(win, "onload", fn);
    } else if (typeof win.onload == "function") {
      var fnOld = win.onload;
      win.onload = function() {
        fnOld();
        fn();
      };
    } else {
      win.onload = fn;
    }
  }

/* Main function
                - Will preferably execute onDomLoad, otherwise onload (as a fallback)
        */

  function main() {
    if (plugin) {
      testPlayerVersion();
    } else {
      matchVersions();
    }
  }

/* Detect the Flash Player version for non-Internet Explorer browsers
                - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
                  a. Both release and build numbers can be detected
                  b. Avoid wrong descriptions by corrupt installers provided by Adobe
                  c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
                - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
        */

  function testPlayerVersion() {
    var b = doc.getElementsByTagName("body")[0];
    var o = createElement(OBJECT);
    o.setAttribute("type", FLASH_MIME_TYPE);
    var t = b.appendChild(o);
    if (t) {
      var counter = 0;
      (function() {
        if (defined(t.GetVariable)) {
          var d = t.GetVariable("$version");
          if (d) {
            d = d.split(" ")[1].split(",");
            ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
          }
        } else if (counter < 10) {
          counter++;
          setTimeout(arguments.callee, 10);
          return;
        }
        b.removeChild(o);
        t = null;
        matchVersions();
      })();
    } else {
      matchVersions();
    }
  }

/* Perform Flash Player and SWF version matching; static publishing only
        */

  function matchVersions() {
    var rl = regObjArr.length;
    if (rl > 0) {
      for (var i = 0; i < rl; i++) { // for each registered object element
        var id = regObjArr[i].id;
        var cb = regObjArr[i].callbackFn;
        var cbObj = {
          success: false,
          id: id
        };
        if (ua.pv[0] > 0) {
          var obj = getElementById(id);
          if (obj) {
            if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
              setVisibility(id, true);
              if (cb) {
                cbObj.success = true;
                cbObj.ref = getObjectById(id);
                cb(cbObj);
              }
            } else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
              var att = {};
              att.data = regObjArr[i].expressInstall;
              att.width = obj.getAttribute("width") || "0";
              att.height = obj.getAttribute("height") || "0";
              if (obj.getAttribute("class")) {
                att.styleclass = obj.getAttribute("class");
              }
              if (obj.getAttribute("align")) {
                att.align = obj.getAttribute("align");
              }
              // parse HTML object param element's name-value pairs
              var par = {};
              var p = obj.getElementsByTagName("param");
              var pl = p.length;
              for (var j = 0; j < pl; j++) {
                if (p[j].getAttribute("name").toLowerCase() != "movie") {
                  par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                }
              }
              showExpressInstall(att, par, id, cb);
            } else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
              displayAltContent(obj);
              if (cb) {
                cb(cbObj);
              }
            }
          }
        } else { // if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
          setVisibility(id, true);
          if (cb) {
            var o = getObjectById(id); // test whether there is an HTML object element or not
            if (o && defined(o.SetVariable)) {
              cbObj.success = true;
              cbObj.ref = o;
            }
            cb(cbObj);
          }
        }
      }
    }
  }

  function getObjectById(objectIdStr) {
    var r = null;
    var o = getElementById(objectIdStr);
    if (o && o.nodeName == "OBJECT") {
      if (defined(o.SetVariable)) {
        r = o;
      } else {
        var n = o.getElementsByTagName(OBJECT)[0];
        if (n) {
          r = n;
        }
      }
    }
    return r;
  }

/* Requirements for Adobe Express Install
                - only one instance can be active at a time
                - fp 6.0.65 or higher
                - Win/Mac OS only
                - no Webkit engines older than version 312
        */

  function canExpressInstall() {
    return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
  }

/* Show the Adobe Express Install dialog
                - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
        */

  function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
    isExpressInstallActive = true;
    storedCallbackFn = callbackFn || null;
    storedCallbackObj = {
      success: false,
      id: replaceElemIdStr
    };
    var obj = getElementById(replaceElemIdStr);
    if (obj) {
      if (obj.nodeName == "OBJECT") { // static publishing
        storedAltContent = abstractAltContent(obj);
        storedAltContentId = null;
      } else { // dynamic publishing
        storedAltContent = obj;
        storedAltContentId = replaceElemIdStr;
      }
      att.id = EXPRESS_INSTALL_ID;
      if (!defined(att.width) || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) {
        att.width = "310";
      }
      if (!defined(att.height) || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) {
        att.height = "137";
      }
      doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
      var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
          fv = "MMredirectURL=" + win.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
      if (defined(par.flashvars)) {
        par.flashvars += "&" + fv;
      } else {
        par.flashvars = fv;
      }
      // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
      // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
      if (ua.ie && ua.win && obj.readyState != 4) {
        var newObj = createElement("div");
        replaceElemIdStr += "SWFObjectNew";
        newObj.setAttribute("id", replaceElemIdStr);
        obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
        obj.style.display = "none";
        (function() {
          if (obj.readyState == 4) {
            obj.parentNode.removeChild(obj);
          } else {
            setTimeout(arguments.callee, 10);
          }
        })();
      }
      createSWF(att, par, replaceElemIdStr);
    }
  }

/* Functions to abstract and display alternative content
        */

  function displayAltContent(obj) {
    if (ua.ie && ua.win && obj.readyState != 4) {
      // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
      // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
      var el = createElement("div");
      obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
      el.parentNode.replaceChild(abstractAltContent(obj), el);
      obj.style.display = "none";
      (function() {
        if (obj.readyState == 4) {
          obj.parentNode.removeChild(obj);
        } else {
          setTimeout(arguments.callee, 10);
        }
      })();
    } else {
      obj.parentNode.replaceChild(abstractAltContent(obj), obj);
    }
  }

  function abstractAltContent(obj) {
    var ac = createElement("div");
    if (ua.win && ua.ie) {
      ac.innerHTML = obj.innerHTML;
    } else {
      var nestedObj = obj.getElementsByTagName(OBJECT)[0];
      if (nestedObj) {
        var c = nestedObj.childNodes;
        if (c) {
          var cl = c.length;
          for (var i = 0; i < cl; i++) {
            if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
              ac.appendChild(c[i].cloneNode(true));
            }
          }
        }
      }
    }
    return ac;
  }

/* Cross-browser dynamic SWF creation
        */

  function createSWF(attObj, parObj, id) {
    var r, el = getElementById(id);
    if (ua.wk && ua.wk < 312) {
      return r;
    }
    if (el) {
      if (!defined(attObj.id)) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
        attObj.id = id;
      }
      if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
        var att = "";
        for (var i in attObj) {
          if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
            if (i.toLowerCase() == "data") {
              parObj.movie = attObj[i];
            } else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
              att += ' class="' + attObj[i] + '"';
            } else if (i.toLowerCase() != "classid") {
              att += ' ' + i + '="' + attObj[i] + '"';
            }
          }
        }
        var par = "";
        for (var j in parObj) {
          if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
            par += '<param name="' + j + '" value="' + parObj[j] + '" />';
          }
        }
        el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
        objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
        r = getElementById(attObj.id);
      } else { // well-behaving browsers
        var o = createElement(OBJECT);
        o.setAttribute("type", FLASH_MIME_TYPE);
        for (var m in attObj) {
          if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
            if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
              o.setAttribute("class", attObj[m]);
            } else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
              o.setAttribute(m, attObj[m]);
            }
          }
        }
        for (var n in parObj) {
          if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
            createObjParam(o, n, parObj[n]);
          }
        }
        el.parentNode.replaceChild(o, el);
        r = o;
      }
    }
    return r;
  }

  function createObjParam(el, pName, pValue) {
    var p = createElement("param");
    p.setAttribute("name", pName);
    p.setAttribute("value", pValue);
    el.appendChild(p);
  }

/* Cross-browser SWF removal
                - Especially needed to safely and completely remove a SWF in Internet Explorer
        */

  function removeSWF(id) {
    var obj = getElementById(id);
    if (obj && obj.nodeName == "OBJECT") {
      if (ua.ie && ua.win) {
        obj.style.display = "none";
        (function() {
          if (obj.readyState == 4) {
            removeObjectInIE(id);
          } else {
            setTimeout(arguments.callee, 10);
          }
        })();
      } else {
        obj.parentNode.removeChild(obj);
      }
    }
  }

  function removeObjectInIE(id) {
    var obj = getElementById(id);
    if (obj) {
      for (var i in obj) {
        if (typeof obj[i] == "function") {
          obj[i] = null;
        }
      }
      obj.parentNode.removeChild(obj);
    }
  }

/* Functions to optimize JavaScript compression
        */

  function getElementById(id) {
    var el = null;
    try {
      el = doc.getElementById(id);
    } catch (e) {}
    return el;
  }

  function createElement(el) {
    return doc.createElement(el);
  }

/* Updated attachEvent function for Internet Explorer
                - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
        */

  function addListener(target, eventType, fn) {
    target.attachEvent(eventType, fn);
    listenersArr[listenersArr.length] = [target, eventType, fn];
  }

/* Flash Player and SWF content version matching
        */

  function hasPlayerVersion(rv) {
    var pv = ua.pv,
        v = rv.split(".");
    v[0] = parseInt(v[0], 10);
    v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
    v[2] = parseInt(v[2], 10) || 0;
    return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
  }

/* Cross-browser dynamic CSS creation
                - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
        */

  function createCSS(sel, decl, media, newStyle) {
    if (ua.ie && ua.mac) {
      return;
    }
    var h = doc.getElementsByTagName("head")[0];
    if (!h) {
      return;
    } // to also support badly authored HTML pages that lack a head element
    var m = (media && typeof media == "string") ? media : "screen";
    if (newStyle) {
      dynamicStylesheet = null;
      dynamicStylesheetMedia = null;
    }
    if (!dynamicStylesheet || dynamicStylesheetMedia != m) {
      // create dynamic stylesheet + get a global reference to it
      var s = createElement("style");
      s.setAttribute("type", "text/css");
      s.setAttribute("media", m);
      dynamicStylesheet = h.appendChild(s);
      if (ua.ie && ua.win && defined(doc.styleSheets) && doc.styleSheets.length > 0) {
        dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
      }
      dynamicStylesheetMedia = m;
    }
    // add style rule
    if (ua.ie && ua.win) {
      if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
        dynamicStylesheet.addRule(sel, decl);
      }
    } else {
      if (dynamicStylesheet && defined(doc.createTextNode)) {
        dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
      }
    }
  }

  function setVisibility(id, isVisible) {
    if (!autoHideShow) {
      return;
    }
    var v = isVisible ? "visible" : "hidden";
    if (isDomLoaded && getElementById(id)) {
      getElementById(id).style.visibility = v;
    } else {
      createCSS("#" + id, "visibility:" + v);
    }
  }

/* Filter to avoid XSS attacks
        */

  function urlEncodeIfNecessary(s) {
    var regex = /[\\\"<>\.;]/;
    var hasBadChars = regex.exec(s) != null;
    return hasBadChars && defined(encodeURIComponent) ? encodeURIComponent(s) : s;
  }

/* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
        */
  var cleanup = function() {
    if (ua.ie && ua.win) {
      window.attachEvent("onunload", function() {
        // remove listeners to avoid memory leaks
        var ll = listenersArr.length;
        for (var i = 0; i < ll; i++) {
          listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
        }
        // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
        var il = objIdArr.length;
        for (var j = 0; j < il; j++) {
          removeSWF(objIdArr[j]);
        }
        // cleanup library's main closures to avoid memory leaks
        for (var k in ua) {
          ua[k] = null;
        }
        ua = null;
        for (var l in OX_swfobject) {
          OX_swfobject[l] = null;
        }
        OX_swfobject = null;
      });
    }
  }();

  return {
/* Public API
                        - Reference: http://code.google.com/p/swfobject/wiki/documentation
                */
    registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
      if (ua.w3 && objectIdStr && swfVersionStr) {
        var regObj = {};
        regObj.id = objectIdStr;
        regObj.swfVersion = swfVersionStr;
        regObj.expressInstall = xiSwfUrlStr;
        regObj.callbackFn = callbackFn;
        regObjArr[regObjArr.length] = regObj;
        setVisibility(objectIdStr, false);
      } else if (callbackFn) {
        callbackFn({
          success: false,
          id: objectIdStr
        });
      }
    },

    getObjectById: function(objectIdStr) {
      if (ua.w3) {
        return getObjectById(objectIdStr);
      }
    },

    embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
      var callbackObj = {
        success: false,
        id: replaceElemIdStr
      };
      if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
        setVisibility(replaceElemIdStr, false);
        addDomLoadEvent(function() {
          widthStr += ""; // auto-convert to string
          heightStr += "";
          var att = {};
          if (attObj && typeof attObj === OBJECT) {
            for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
              att[i] = attObj[i];
            }
          }
          att.data = swfUrlStr;
          att.width = widthStr;
          att.height = heightStr;
          var par = {};
          if (parObj && typeof parObj === OBJECT) {
            for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
              par[j] = parObj[j];
            }
          }
          if (flashvarsObj && typeof flashvarsObj === OBJECT) {
            for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
              if (defined(par.flashvars)) {
                par.flashvars += "&" + k + "=" + escape(flashvarsObj[k]);
              } else {
                par.flashvars = k + "=" + escape(flashvarsObj[k]);
              }
            }
          }
          if (hasPlayerVersion(swfVersionStr)) { // create SWF
            var obj = createSWF(att, par, replaceElemIdStr);
            if (att.id == replaceElemIdStr) {
              setVisibility(replaceElemIdStr, true);
            }
            callbackObj.success = true;
            callbackObj.ref = obj;
          } else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
            att.data = xiSwfUrlStr;
            showExpressInstall(att, par, replaceElemIdStr, callbackFn);
            return;
          } else { // show alternative content
            setVisibility(replaceElemIdStr, true);
          }
          if (callbackFn) {
            callbackFn(callbackObj);
          }
        });
      } else if (callbackFn) {
        callbackFn(callbackObj);
      }
    },

    switchOffAutoHideShow: function() {
      autoHideShow = false;
    },

    ua: ua,

    getFlashPlayerVersion: function() {
      return {
        major: ua.pv[0],
        minor: ua.pv[1],
        release: ua.pv[2]
      };
    },

    hasFlashPlayerVersion: hasPlayerVersion,

    createSWF: function(attObj, parObj, replaceElemIdStr) {
      if (ua.w3) {
        return createSWF(attObj, parObj, replaceElemIdStr);
      } else {
        return undefined;
      }
    },

    showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
      if (ua.w3 && canExpressInstall()) {
        showExpressInstall(att, par, replaceElemIdStr, callbackFn);
      }
    },

    removeSWF: function(objElemIdStr) {
      if (ua.w3) {
        removeSWF(objElemIdStr);
      }
    },

    createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
      if (ua.w3) {
        createCSS(selStr, declStr, mediaStr, newStyleBoolean);
      }
    },

    addDomLoadEvent: addDomLoadEvent,

    addLoadEvent: addLoadEvent,

    getQueryParamValue: function(param) {
      var q = doc.location.search || doc.location.hash;
      if (q) {
        if (/\?/.test(q)) {
          q = q.split("?")[1];
        } // strip question mark
        if (param == null) {
          return urlEncodeIfNecessary(q);
        }
        var pairs = q.split("&");
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
            return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
          }
        }
      }
      return "";
    },

    // For internal usage only
    expressInstallCallback: function() {
      if (isExpressInstallActive) {
        var obj = getElementById(EXPRESS_INSTALL_ID);
        if (obj && storedAltContent) {
          obj.parentNode.replaceChild(storedAltContent, obj);
          if (storedAltContentId) {
            setVisibility(storedAltContentId, true);
            if (ua.ie && ua.win) {
              storedAltContent.style.display = "block";
            }
          }
          if (storedCallbackFn) {
            storedCallbackFn(storedCallbackObj);
          }
        }
        isExpressInstallActive = false;
      }
    }
  };
};
var OX_swfobject = OX_swfobject || OX.swfobject(window, document, navigator);

/**
 * JSTag Chains Module. Defines chain-specific functionality like the lift
 * cookie.
 *
 */
OX.chains = OX.chains || function() {

  var Hooks = OX.Hooks,
      utils = OX.utils,

      DEFAULTS_COOKIE_NAME = "OX_nd",
      MILLIS_24_HRS = 86400000,// 24 hours of millis
      ONE_MONTH = 2592000000,// 30 days of millis
      COOKIE_OUTER_LIST_CHAR = "|",
      COOKIE_INNER_LIST_CHAR = "_";

  // cookie format OX_lc=advid1_numconsec_time|advid2_numconsec_time

  // get default stats for a particular network
  function importNetworkFromCookie(networkID) {

    var cookieValue = utils.getCookie(DEFAULTS_COOKIE_NAME),
        networkStartsWith = networkID + COOKIE_INNER_LIST_CHAR,
        networkValue,
        networkStats;

    if (cookieValue) {
      networkEntries = cookieValue.split(COOKIE_OUTER_LIST_CHAR);
      for (var i = 0; i < networkEntries.length; i++) {
        networkValue = networkEntries[i];
        if (networkValue.lastIndexOf(networkStartsWith, 0) === 0) {
          networkStats = networkValue.split(COOKIE_INNER_LIST_CHAR);
          if (networkStats.length == 3) {
            return {
              id : networkStats[0],
              defaults : networkStats[1],
              last : networkStats[2]
            };
          }
        }
      }
    }

  }

  // add network cookie data to next ad request
  function attachNDToRequest(nd) {
    OX._requestArgs.nd = nd || utils.getCookie(DEFAULTS_COOKIE_NAME);
  }

  function networkEntryIsClean(entry) {
    return entry.charAt(0) !== '_';
  }

  // commit default stats for a particular network
  function commitNetworkData(networkID, stats) {

    var cookieValue = utils.getCookie(DEFAULTS_COOKIE_NAME),
        networkStartsWith = networkID + COOKIE_INNER_LIST_CHAR,
        networkEntries,
        networkEntry,
        strNetworkStats,
        resultNetworkEntries = [],
        updatedFlag = 0,
        expirationDate,
        finalCookieValue;

    if (stats)
      strNetworkStats =
        [stats.id, stats.defaults, stats.last].join(COOKIE_INNER_LIST_CHAR);

    if (cookieValue) {
      networkEntries = cookieValue.split(COOKIE_OUTER_LIST_CHAR);
      for (var i = 0; i < networkEntries.length; i++) {
        networkEntry = networkEntries[i];
        if (networkEntryIsClean(networkEntry)) {//filter out bad entries
          if (networkEntry.lastIndexOf(networkStartsWith, 0) === 0) {
            if (stats) {
              resultNetworkEntries.push(strNetworkStats);
              updatedFlag = 1;
            }
          } else {
            resultNetworkEntries.push(networkEntry);// re-push existing stats
          }
        }
      }
    }

    // entry for this network was not already present
    if (!updatedFlag && stats) {
      resultNetworkEntries.push(strNetworkStats);
    }

    // commit cookie
    finalCookieValue = resultNetworkEntries.join(COOKIE_OUTER_LIST_CHAR);
    expirationDate = new Date(utils.now() + ONE_MONTH).toGMTString();
    utils.cookie(DEFAULTS_COOKIE_NAME, finalCookieValue, expirationDate);

    // update query args
    attachNDToRequest(finalCookieValue);
  }

  OX.addHook(function(adunit, link, index) {

    var networkID = link.adv_acct_id,
        networkStats,
        now = utils.now();

    if (networkID && networkID.length) {
      networkStats = importNetworkFromCookie(networkID);
      if (networkStats) {// network entry found
        if (now - networkStats.last <= MILLIS_24_HRS) {
          networkStats.defaults++;
        } else {// its expired
          networkStats.defaults=1;
        }
        networkStats.last = now;
      } else {// no entry for this network
        networkStats = {
          id : networkID,
          defaults : 1,
          last : now
        }
      }
      commitNetworkData(networkID, networkStats);
    }

  }, Hooks.ON_AD_DEFAULTED);

  OX.addHook(function(adunit, link, index) {
    commitNetworkData(link.adv_acct_id);
  }, Hooks.ON_AD_NOT_DEFAULTED);

  attachNDToRequest();
  return {};

}();
/**
 * Runs after all modules are loaded
 */
!function() {

  OX.init();

  // set gateway and media type every time TODO need this?
  OX.setGateway("http://dev:8000/w");

  // Execute any pre-queued 'hooks'. These hooks are
  // executed by an instance of taglib on the page.
  var cmd;
  while (window.OX_cmds && (cmd = OX_cmds.shift())) {
    if (typeof cmd === "function") {
      cmd();
    }
  }

  // Execute 'hooks' inserted by the 'ad reporter'
  // browser plugin. These hooks are executed for
  // all instances of tag lib on the page.
  var OX_reporter_cmds = window.OX_reporter_cmds;
  if (!OX_reporter_cmds) {
    try {
      OX_reporter_cmds = window.top.OX_reporter_cmds;
    } catch (err) {}
  }
  for (var i in OX_reporter_cmds) {
    //do not need to shift since all iframe jstags need to use the hooks
    if (typeof OX_reporter_cmds[i] === "function") {
      //need to send the current window to the hook
      OX_reporter_cmds[i](window);
    }
  }

  // Request any pre-queued ads
  var ad;
  while (window.OX_ads && (ad = OX_ads.shift())) {
    // async vs. synchronous ad load
    ad.hasOwnProperty("slot_id") ? OX.load(ad) : OX.requestAd(ad);
  }

}();
