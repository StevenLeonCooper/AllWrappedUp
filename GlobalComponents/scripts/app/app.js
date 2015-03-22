/// <reference path="../libs/jquery-2.1.1.js" />
/// <reference path="../libs/mustache.js" />
window.appSettings = window.appSettings || {

    ServiceUrl: "NO_VALUE_SET",
    ComponentUrl: "NO_VALUE_SET",
    GlobalComponentUrl: "NO_VALUE_SET",
    DefaultPage: "NO_VALUE_SET",
    ComponentPath: "{{autoDir}}/{{fileType}}/{{componentName}}.{{fileExtension}}"
};

// The primary namespace for all things contained within the app
window.app = (function (settings) {

    var blankFunction = function () { };
    var CommonData = window.appSettings || {};
    var Settings = settings;
    var ActiveHash = false;
    var Widgets = {};
    var Components = {};
    var Properties = {};
    var Jobs = {};

    // Safely adds an event handler without disturbing existing handlers of the same name.
    Jobs.addEventHandler = function (name, callback, pushToTop) {

        if (typeof this[name] === 'undefined') {
            this[name] = callback;
        }
        else {
            var original = this[name];

            var callbackList = [this[name], callback];

            if (pushToTop === true) {
                callbackList.reverse();
            }

            var output = function (e) {

                var target = e.target || window;

                callbackList[0].call(target, e);

                callbackList[1].call(target, e);
            };

            this[name] = output;
        }

    };

    // Safely adds an event handler and pushes it to the top of the stack so it executes first. 
    Jobs.prependEventHandler = function (name, callback) {
        this.addEventHandler(name, callback, true);
    };

    // Deciphering the Address Bar
    var Routing = (function () {

        var ro = {};

        ro.getHash = function (options, override) {

            var hash = override || location.hash;

            switch (options) {

                case "full": return hash || false;
                case "hash": return hash.split("/")[0].split("?")[0] || false;
                case "query": return hash.split("/")[0].split("?")[1] || false;
                case "value": return hash.split("/")[0].split("?")[0].replace("#", "") || false;
                default: return hash.split("/")[0].split("?")[0] || false;
            }
        };

        // Standard URL Params formatted as: [#hash?param=value&param2=value2]
        ro.urlParams = function (override) {
            override = override || false;
            var baseValue = location.href.split("?")[1] || false;
            var paramObject = {};

            if (override !== false) {
                baseValue = override.split("?")[1] || false;
            }

            if (baseValue !== false) {

                baseValue = baseValue.split("&");

                for (var i = 0; i < baseValue.length; i++) {

                    var target = baseValue[i].split("=");

                    paramObject[target[0]] = target[1];

                }
            }
            return paramObject;
        };

        ro.getUrlParam = function (input, override) {
            override = override || false;
            return this.getUrlParams(override)[input] || false;
        };

        // Array containing individual path values [value1/value2/value3] post hash.
        ro.urlPathVariables = function () {

            var postHashParams = (location.hash || "").split("/");

            postHashParams = postHashParams.slice(1, (postHashParams.length - 1));

            return postHashParams;

        };

        // Setup a new Routing Object
        ro.setup = function () {
            return {

                Hash: this.getHash("hash"),
                hashValue: this.getHash("value"),
                hashFull: this.getHash("full"),
                hashQuery: this.getHash("query"),
                urlParams: this.urlParams(),
                urlPaths: this.urlPathVariables(),
                getUrlParams: this.urlParams,
                getUrlParam: this.getUrlParam,
                getUrlPaths: this.urlPathVariables,
                getHash: this.getHash
            };
        };

        return ro;
    })();

    // Functions that run after everything is loaded + CSS Theme Injection
    var LastMinuteCallbackList = [function () {
        window.app.ActiveHash = Routing.getHash("hash") || window.location.hash.split("?")[0];

        var cssTheme = settings.theme || "classic";

        var cssTag = '<link href="/GlobalComponents/themes/' + cssTheme + '/default.css" rel="stylesheet" type="text/css" />';

        $(document.head).append(cssTag);
    }];

    // Wrapper for all AJAX Operations
    var Async = (function ($) {

        // Syntactic Sugar at it's finest.

        function call(params) {
            $.ajax(params);
        }

        var AsyncObject = {
            Url: "",
            DataType: "",
            Params: {},
            Method: "GET",
            Callback: blankFunction
        };

        AsyncObject.get = function (dataType) {
            this.DataType = dataType || "";

            this.Method = "GET";

            return this;
        };

        AsyncObject.from = function (url) {

            url = url || "";

            url = url.replace("~/", window.app.Settings.ServiceUrl);

            this.Url = url || false;

            return this;
        };

        AsyncObject.post = function (dataType) {
            this.DataType = dataType || ""; //Optional

            this.Method = "POST";

            return this;
        };

        AsyncObject.to = AsyncObject.from;

        AsyncObject.postTo = function (url) {
            return this.post().to(url);
        };

        AsyncObject.expect = function (dataType) {
            this.DataType = dataType || "";
        };

        AsyncObject.using = function (inputParams) {
            this.Params = inputParams || {};

            return this;
        };

        AsyncObject.with = AsyncObject.using;

        AsyncObject.then = function (callbackFunction) {
            this.Callback = callbackFunction || blankFunction;

            return this;
        };

        AsyncObject.thenGo = function (callbackFunction) {

            this.Callback = callbackFunction || blankFunction;

            this.go();

            return this;
        };

        AsyncObject.go = function () {
            var url = this.Url || settings.dataUrl;
            var dataType = this.DataType || "";
            var data = this.Params || {};
            var callback = this.Callback || blankFunction;
            var method = this.Method || "GET";

            call({
                type: method,
                dataType: dataType,
                url: url,
                data: data,
                success: callback,
                error: function (data) {
                    window.lastErrorData = data || "No Error Data";
                },
                complete: function (data) {
                    window.lastCompleteData = data || "No Data";
                }
            });
        };

        return AsyncObject;

    })($);

    // Wrapper for Template System 
    var Template = (function (Mustache, $) {

        var Engine = {};

        Engine.FormTemplates = {};

        // Convert your template convention to Curly Braces. Default Opener: {{, Closer: }}
        // Need to convert to RegExp Object for better performance [!]
        Engine.prepare = function (sourceHtml, opener, closer) {
            sourceHtml = sourceHtml || "";

            opener = opener || false;

            closer = closer || false;

            if (opener !== false && closer !== false) {
                return sourceHtml.toString().replace(/\[\[/g, opener).replace(/\]\]/g, closer);
            }

            if (opener !== false && closer === false) {
                switch (opener) {
                    case '()':
                        return sourceHtml.toString().replace(/\(\(/g, "{{").replace(/\)\)/g, "}}");
                    case '[]':
                        return sourceHtml.toString().replace(/\[\[/g, "{{").replace(/\]\]/g, "}}");
                    case '{}':
                        return sourceHtml.toString();
                    default:
                        return sourceHtml.toString().replace(/\[\[/g, "{{").replace(/\]\]/g, "}}");
                }
            }

            if (opener === false && closer === false) {
                return sourceHtml.toString().replace(/\[\[/g, "{{").replace(/\]\]/g, "}}");
            }
        };

        // Render a template to the innerHTML of a jQuery Selection. 
        Engine.render = function (selector, context, source) {

            source = source || ($(selector).length > 0 ? $(selector)[0].innerHTML : "");

            //Auto Detect jQuery Selectors
            if (source[0] == "#" || source[0] == ".") {
                source = $(source).html();
            }

            if ($(selector).length > 0) {

                if (typeof this.FormTemplates[selector] === 'undefined') {

                    this.FormTemplates[selector] = source;
                }

                var sourceHtml = this.FormTemplates[selector];

                sourceHtml = Engine.prepare(sourceHtml); // sourceHtml.toString().replace(/\[\[/g, '{{').replace(/\]\]/g, '}}');

                var boundHtml = Mustache.to_html(sourceHtml, context);

                $(selector).html(boundHtml);
            }
            else {
                // There is nothing to render to
            }
        };

        Engine.bind = function (template, context) {

            if (template[0] == "#" || template[0] == ".") {
                template = $(template).html() || "No Template Found";
            }

            var prep = this.prepare;

            return {
                data: Mustache.render(template, context),
                renderTo: function (selector) {
                    Engine.render(selector, context, this.data);
                },
                formatted: function (format) {

                    return Mustache.render(prep(template, format), context);
                }
            };
        };

        Engine.import = function (url) {

            return {
                context: false,

                withCSS: function (url) {
                    $("head").append("<link href='" + url + "' rel='stylesheet' type='text/css' />");
                    return this;
                },

                using: function (input) {
                    this.context = input;
                    return this;
                },

                getContext: function () {
                    return this.context;
                },

                // Directly attach template to DOM + Optionally execute a method
                to: function (target, callback) {

                    var context = this.getContext();

                    Async.get("html").from(url).thenGo(function (template) {

                        if ($(target).length > 0) {
                            $(target).each(function (index, el) {

                                if (context !== false) {
                                    template = Engine.bind(template, context).formatted("{}");
                                }

                                $(el).append(template);
                            });
                        }

                        if (typeof target === typeof {}) {
                            target = template;
                        }

                        callback = callback || function () { };

                        callback.call(this, template);

                    });

                },

                // Import template and choose what to do with the result
                then: function (callback) {

                    callback = callback || function () { };

                    Async.get("html").from(url).thenGo(callback);
                }
            };

        };

        return Engine;

    })(Mustache, $);

    // Wrapper for Event Handling
    var Events = (function () {

        return function (selector) {
            var sourceEngine = $(selector);
            return {
                on: function (eventName, callback) {

                    return sourceEngine.on(eventName, callback);
                },
                ignore: function (eventName) {

                    return sourceEngine.off(eventName);
                },
                trigger: function (eventname, params) {

                    params = params || [];

                    return sourceEngine.trigger(eventname, params);
                },
                whisper: function (eventName, params) {

                    params = params || [];

                    return sourceEngine.triggerHandler(eventName, params);
                },
            };
        };
    })();

    Components = (function () {

        // Object representing a page Component
        function newComponent(name, parentSelector, isGlobal) {

            isGlobal = isGlobal || false;

            // As a paradigm, always assign a "self" variable for use in
            // any anonymous callbacks you may want to create
            var self = this;

            // This is our new component object, the alternative to 
            // assigning values to "this" and using constructor logic later. 
            var Com = {};

            // A list of data-related properties for use when rendering.
            Com.Data = { DataContext: false, js: "", css: "", html: "" };

            Com.FileExtension = "html";

            Com.StyleSheet = false;

            // The very first callback always executes the Last-Minute-Callbacks. 
            Com.renderCallbacks = [executeLMCallbacks];

            // The jQuery selector to inject the template on the 'render' command.
            Com.ParentSelector = parentSelector || "body";

            // The component name, REQUIRED to find the component. 
            // Random generation is just for testing purposes
            Com.Name = name || ("A" + Math.random().toString());

            Com.HtmlId = Com.Name + "Container";

            // Asynchronously load the HTML and JavaScript file for the component. 
            // The CSS is already gleaned from the name so we'll just assign it later. 
            Com.load = function (callback) {

                var self = this;

                callback = callback || blankFunction;

                var name = this.Name;

                var CssFile = this.StyleSheet || name;

                var rootUrl = settings.ComponentUrl;

                if (isGlobal === true) {
                    rootUrl = settings.GlobalComponentUrl;
                }

                var preparePath = function (name, type, extension) {

                    if (extension.indexOf(".") !== 0) {
                        extension = "." + extension;
                    }

                    var PathContext = {
                        siteRoot: settings.GlobalComponentUrl,
                        componentRoot: settings.ComponentUrl,
                        autoRoot: rootUrl,
                        fileType: type,
                        fileExtension: extension,
                        componentName: name,
                    };

                    var PathTemplate = settings.ComponentPath || "{{autoRoot}}/{{fileType}}/{{componentName}}{{fileExtension}}";

                    PathTemplate = PathTemplate.replace(/\{\{/g, "{{&");

                    var boundPath = Template.bind(PathTemplate, PathContext).data.replace(/\/\//g, "/");

                    var randomToken = Math.random().toString();

                    return boundPath + "?token=" + randomToken;
                };

                var fileExtension = this.FileExtension || "html";

                var htmlUrl = preparePath(name, "html", fileExtension); // rootUrl + "html/" + name + "." + fileExtension + "?token=" + Math.random().toString();

                var cssUrl = preparePath(CssFile, "css", ".css"); // rootUrl + "css/" + CssFile + ".css?token=" + Math.random().toString();

                var jsUrl = preparePath(name, "js", ".js"); // rootUrl + "js/" + name + ".js";

                var cssTagId = name + "CSS";

                var StyleClass = "global-style";

                if (parentSelector == "#MainContent") { StyleClass = "mc-stylesheet"; }

                self.Data.css = "<link id='" + cssTagId + "' class='" + StyleClass + "' rel='stylesheet' type='text/css' href='" + cssUrl + "'/>";

                $.get(htmlUrl, function (htmlData) {

                    self.Data.html = htmlData;

                }).done(function (html, status) {
                    $.getScript(jsUrl, function (jsData) {

                        self.Data.js = jsData || false;

                    }).done(function (script, status) {
                        window.LastGoodScript = script || true;

                    }).fail(function () {
                        window.LastBadScript = self.Name;
                    }).always(function () {
                        callback.call(self);

                        if (typeof self.Data.DataContext === typeof {} && self.Data.DataContext.autoUpdate === true) {
                            // If the DataContext specifies, bind the view to its Model. 
                            $(document).on("Update." + self.Name, self.quickRender);
                        }
                    });
                });
            };

            // Render the HTML template to the page using Mustache, binding to 
            // any dataContext object we may have set up & including the CSS. ****
            Com.render = function (data, dataContext) {

                if (data === false) {
                    // figure something out for this ... ???
                    return;
                }

                dataContext = dataContext || CommonData;



                var self = this;

                var parentSelector = this.ParentSelector || "body";

                var CurlyData = Template.prepare(data, '{}');

                var renderedHtml = Template.bind(CurlyData, dataContext).data; //$(Mustache.to_html(data, dataContext));

                var BodyHtml = $(renderedHtml).filter('#' + this.Name)[0].outerHTML;

                var Title = $(renderedHtml).filter('title').html();

                if (typeof Title !== 'undefined' && Title !== "") {
                    $("#MainTitle").html(Title);
                }

                $(parentSelector).html(BodyHtml);

                this.HtmlId = this.Name + "Container";

                $('#' + this.Name).attr("id", this.HtmlId);


                if (typeof self.Data.css !== 'undefined') {
                    var newCSS = self.Data.css;

                    var cssTagId = self.Name + "CSS";

                    $(document).ready(function () {
                        if (self.ParentSelector == "#MainContent") {
                            $('.mc-stylesheet').remove();
                        }

                        $("#" + cssTagId).remove();

                        $("head").append(newCSS);
                    });
                }

                this.renderCallbacks.unshift(function () {

                    $("#" + this.HtmlId + " [data-action='auto']").each(function (index, el) {


                        var Source = window.app.getEventObject(el);

                        if (Source.ComponentName !== false) {

                            window.app.loadComponent(Source);
                        }

                    });

                });

                var currentCallbacks = this.renderCallbacks.length;
                var blank = blankFunction;
                for (var i = 0; i < currentCallbacks; i++) {
                    var rCallback = this.renderCallbacks[i] || blank;

                    if (typeof rCallback === 'function') {
                        rCallback.call(this);
                    }
                }
            };

            // Render with the default values, without providing excplicit HTML and dataContext. 
            Com.quickRender = function () {

                var self = this;

                var htmlData = self.Data.html || false;

                var dataContext = self.Data.DataContext || CommonData;



                self.render(htmlData, dataContext);
            };

            Com.unload = function () {
                $('#' + this.Name).remove();
            };

            Com.reload = function () {
                // Components[this.Name + this.ParentSelector]
            };

            // Adds the component to the window.app.Components List. 
            Components[name + parentSelector] = Com;

            //Update the Data Context for this component
            Com.Update = function (data, silent) {

                silent = silent || false;

                Com.Data.DataContext = data;

                //Silent Update Ignores Event Trigger
                if (silent === true) {
                    $(document).trigger("Update." + Com.Name);
                }
            };

            Com.InitialBinding = false;

            // Return the component in case you want to chain some commands to it. 
            // e.g.: var myComponent = newComponent("blah","#Blah").load(myCallback);
            return Com;
        }

        // Creates a new Component, loads the files and renderes them
        function loadComponent(eventObject, callback) {

            eventObject = eventObject || getEventObject(null);

            var name = eventObject.ComponentName || "";

            var parentSelector = eventObject.Parent;

            var isGlobal = eventObject.IsGlobal || false;

            var componentName = name.split(".")[0];

            var fileExtension = name.split(".")[1] || "html";

            callback = callback || blankFunction;

            var renderCallback, globalComponent;

            if (typeof isGlobal == 'function') {
                renderCallback = isGlobal;
                globalComponent = false;
            }
            else {
                renderCallback = callback;
                globalComponent = isGlobal;
            }

            if (typeof Components[componentName + parentSelector] === 'undefined') {
                var newCom = newComponent(componentName, parentSelector, globalComponent);

                newCom.FileExtension = fileExtension;

                newCom.StyleSheet = eventObject.StyleSheet;

                newCom.renderCallbacks.push(renderCallback);

                newCom.Data.DataContext = eventObject.DataContext;

                newCom.Data.Options = eventObject.Options;

                newCom.load(function (data) {

                    this.quickRender();
                });
            }
            else {

                var existingCom = Components[componentName + parentSelector];

                existingCom.Data.Options = eventObject.Options;

                existingCom.Data.DataContext = eventObject.DataContext;

                Components[componentName + parentSelector].quickRender();
            }

        }

        // Removes a Component (Unfinished)[!]
        function unloadComponent(name, parentSelector) {
            var target = Components[name + parentSelector] || newComponent();
            target.unload();
        }

        function updateAutoComponents(filter) {
            $(filter + " [data-action='auto']").each(function (index, el) {
                var Source = window.app.getEventObject(el);
                if (Source.ComponentName !== false) {
                    loadComponent(Source.ComponentName, Source.Parent, Source.IsGlobal);
                }
            });
        }

        return {

            newComponent: newComponent,
            loadComponent: loadComponent,
            unloadComponent: unloadComponent,
            updateAutoComponents: updateAutoComponents
        };

    })();

    Widgets = (function () {

        var widget_template = {
            active: false,
            name: "string",
            url: "string",
            targetSelector: "#MainContent", // Any jQuery Selector
            injectionMethod: "append", // prepend | html | val | text
            context: {},
            formatStyle: "{}" // Any Mustache Format: "{}" | "[]" | "()"
        };

        var wg = {};


        wg.Collection = {};

        wg.newWidget = function (name, url, targetSelector, injectionMethod, context, formatStyle) {


            if (typeof name === typeof {}) {

                var newWidget = {};

                $.extend(newWidget, widget_template, name);

                return newWidget;
            }

            else {
                return {
                    active: false,
                    name: name,
                    url: url,
                    targetSelector: targetSelector || "#MainContent",
                    injectionMethod: injectionMethod || "append",
                    context: context || {},
                    formatStyle: formatStyle || "{}"
                };
            }
        };

        wg.add = function (widget, name) {

            var widgetName = (widget.name || name) || Math.random().toString();

            this.Collection[widgetName] = widget;
        };

        wg.activate = function (name, callback) {

            callback = callback || function (result) { };

            var widget = this.Collection[name] || widget_template;

            Async.get("html")
                .from(widget.url)
                .using(widget.context)
                .thenGo(function (result) {

                    var boundResult = Template.bind(result, { context: widget.context }).formatted(widget.formatStyle || "{}");

                    $(widget.targetSelector)[widget.injectionMethod](boundResult);

                    $(document.body).trigger("WidgetActivation." + widget.name);

                    widget.active = true;

                    callback.call(widget, result);

                });
        };

        wg.deactivate = function (name, callback) {
            callback = callback || function (result) { };

            var widget = this.Collection[name] || widget_template;

            widget.active = false;

            $(document).trigger("WidgetDeactivation." + widget.name);
        };

        wg.echo = function (name, target, data) {

            var widget = this.Collection[name] || widget_template;

            if (widget.active === true) {
                $(document).trigger("WidgetEcho." + widget.name, [target, data]);
            }
            else {
                this.activate(widget.name, function (result) {

                    // this = widget 
                    $(document).trigger("WidgetEcho." + this.name, [target, data]);

                });
            }
        };

        return wg;

    })();


    // Ensures the provided callback only fires if the HTML elements of the Component exist
    function onReady(componentName, callback) {
        $.each(Components, function (index, componentObject) {

            var nameLength = componentName.length;

            // If the Component hasn't fully loaded, add the Callback to its queue
            if (index.substr(0, nameLength) == componentName) {

                if (componentObject.InitialBinding === false) {
                    componentObject.renderCallbacks.unshift(
                        function () {
                            callback.call(componentObject);
                        });
                    componentObject.InitialBinding = true;
                }
                else {
                    // Otherwise just call the callback since the Component is ready
                    if (window.app.RunOnce[componentName] !== true) {
                        callback.call(componentObject);
                    }
                }
            }

        });
    }

    // Creates an object with details on how to implement the Component
    function getEventObject(target) {

        var targetData = $(target).data() || {};

        var targetHref = $(target).attr("href") || "";

        var componentName = $(target).data("component") || targetHref.split("#")[1] || false;

        var componentParent = $(target).data("target") || false;

        var componentEvent = $(target).data("action") || null;

        var componentIsGlobal = $(target).data("source") || false;

        var componentStyleSheet = $(target).data("css") || false;

        var componentOptions = $(target).data("options") || targetData;

        // Should find a way not to require the window object [!]
        var componentDataContext = (window[($(target).data("context") || false)]) || false;

        if (componentParent === false) {
            if (typeof $(target).attr("id") !== 'undefined') {
                if (targetHref.length > 0) {
                    componentParent = "#MainContent";
                }
                else {
                    componentParent = "#" + $(target).attr("id");
                }
            }
            else {
                componentParent = "#MainContent";
            }
        }

        if (componentIsGlobal !== false && componentIsGlobal.toString().toLowerCase() === "global") {
            componentIsGlobal = true;
        }

        return {
            ComponentName: componentName,
            Parent: componentParent,
            Event: componentEvent,
            IsGlobal: componentIsGlobal,
            StyleSheet: componentStyleSheet,
            DataContext: componentDataContext,
            Options: componentOptions
        };
    }

    // Final callbacks
    function lastMinuteCallbacks(callback) {
        LastMinuteCallbackList.unshift(callback);
    }

    function executeLMCallbacks() {
        for (var i = 0; i < LastMinuteCallbackList.length; i++) {
            var callback = LastMinuteCallbackList[i] || blankFunction;
            callback.call(this);
        }
    }

    //Depricated [!]
    function getUrlParameter(ParamIn, UrlOverride) {

        var sURL = UrlOverride || window.document.location.href;

        if (sURL.indexOf("?") > 0) {
            var arrParams = sURL.split("?");
            var arrURLParams = arrParams[1].split("&");
            var arrParamNames = new Array(arrURLParams.length);
            var arrParamValues = new Array(arrURLParams.length);

            for (var i = 0; i < arrURLParams.length; i++) {
                var sParam = arrURLParams[i].split("=");
                arrParamNames[i] = sParam[0];
                if (sParam[1] !== "")
                    arrParamValues[i] = decodeURI(sParam[1]);
                else
                    arrParamValues[i] = "No Value";
            }

            for (var temp = 0; temp < arrParamNames.length; temp++) {
                if (arrParamNames[temp] == ParamIn)
                    return arrParamValues[temp];
            }
            return null;
        }
        else {
            return null;
        }
    }

    return {
        //Deprecated Properties
        getUrlParameter: Routing.getUrlParam, //Deprecated
        CurlTemplate: Template.prepare, //Deprecated
        BindTemplate: Template.render, // Deprecated

        //Properties
        $: $,
        ActiveHash: ActiveHash,
        Async: Async,
        Components: Components,
        Events: Events,
        Jobs: Jobs,
        Mustache: Mustache,
        Properties: Properties,
        Routing: Routing.setup(),
        RunOnce: {},
        Settings: Settings,
        Template: Template,
        Widgets: Widgets,

        //Methods
        addBinding: lastMinuteCallbacks,
        addComponent: Components.newComponent,
        executeLMC: executeLMCallbacks,
        getEventObject: getEventObject,
        loadComponent: Components.loadComponent,
        onReady: onReady,
        unloadComponent: Components.unloadComponent
    };

})(window.appSettings);



