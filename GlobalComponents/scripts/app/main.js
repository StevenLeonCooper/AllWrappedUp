/// <reference path="app.js" />
// The main.js file always runs immediately after app.js is loaded. 
// This is the place to do your event binding and setup. 

(function () {

    var app = window.app;

    function LoadPageContents() {

        var DefaultPage = app.Settings.DefaultPage;

        var PostBack = app.Routing.getHash("value") || false; // document.location.href.split("#")[1] || false;

        if (PostBack !== false) {
            DefaultPage = PostBack;
        }

        var DefaultEventObject = {
            ComponentName: DefaultPage,
            Parent: "#MainContent",
            Event: false,
            IsGlobal: false,
            StyleSheet: false
        };



        window.app.loadComponent(DefaultEventObject, function () {



            LoadSubComponents(window.location.href);

            $("#LoadingDiv").animate({ opacity: 0 }, 500, "swing", function () {
                $("#LoadingDiv").css({ display: "none" });
            });


            if (window.location.hash === "") {
                window.IgnoreHash = true;
                window.location.hash = "#Default";
                window.IgnoreHash = false;
            }
        });
    }

    function LoadSubComponents(targetHref, callback) {
        var HrefArray = targetHref.toString().split("#")[1] || "empty";

        var TargetControl = HrefArray.split("/")[0];

        var RouteArray = HrefArray.split("/");


        if (TargetControl !== "empty" && RouteArray.length > 2) {

            var TargetParent = "#" + RouteArray[1];

            var TargetSubControl = RouteArray[2] || RouteArray[0];

            var TargetCss = RouteArray[3] || false;

            var EventObject = {
                ComponentName: TargetSubControl,
                Parent: TargetParent,
                Event: false,
                IsGlobal: false,
                StyleSheet: TargetCss
            };

            if (TargetSubControl !== false) {

                window.app.onReady(TargetControl, function () {

                    window.app.loadComponent(EventObject, function (e) {

                        callback = callback || function () { };

                        callback.call(this);
                    });

                });
            }

        }
    }

    function HandleEvent(eventObject, eventType) {

        var sender = eventObject.target;

        var $target = $(sender);

        var targetId = $target.attr("id");

        var targetJob = $target.data(eventType) || ($target.data("job") || false);

        var targetParams = $target.data("params") || ($target.data("options") || "undefined");

        targetParams = targetParams.split(" ").join();

        var paramArray = $.merge([eventObject], targetParams.split(";"));

        var jobAction = app.Jobs[targetJob] || function (params) { };

        if (targetJob !== false && jobAction !== false) {

            jobAction.apply(sender, paramArray);
        }
    }

    // Jobs
    //=====================================

    app.Jobs.ScrollTo = function (e, targetId) {
        var targetElement = $("#" + targetId);

        if (targetElement.length > 0) {
            targetElement[0].scrollIntoView(true);
        }
    };

    app.Jobs.SearchGoogle = function (e, sourceId) {

        var querySelector = $(this).data("query") || sourceId;

        var query = $("#" + querySelector).val() || "CSUF Mihaylo";

        var SearchUrl = "https://www.google.com/search?as_sitesearch=http%3A%2F%2Fbusiness.fullerton.edu&as_q=";

        window.location.href = SearchUrl + query;
    };

    // EVENT BINDING
    //=====================================
    $(document).ready(LoadPageContents);

    window.onhashchange = function (e) {

        if (window.IgnoreHash === true) {
            return;
        }

        var HashArray = window.location.hash.split("/");


        if (window.location.hash.length > 1 && HashArray[0] !== window.app.ActiveHash) {
            LoadPageContents();
        }

        LoadSubComponents(window.location.href, function () {
            // Completed
        });

        var scrollTo = app.Routing.getUrlParam("section") || false;

        if (scrollTo !== false) {
            app.Jobs.ScrollTo(scrollTo);
        }
    };

    // The simplest form of binding
    $(document.body).click(function (e) {

        HandleEvent(e, "click");
    });

    $(document.body).change(function (e) {

        HandleEvent(e, "change");
    });

    $(document.body).keydown(function (e) {

        HandleEvent(e, "keydown");
    });

    $(document.body).click(function (e) {

        var targetHref = e.target.href || "";

        var resetControl = $(e.target).data("reset") || false;

        var TargetControl = false;

        if (targetHref.split("#").length > 1) {
            TargetControl = window.app.Routing.getHash("value", targetHref); //targetHref.split("#")[1].split("/")[0].split("?")[0];   
        }
        else {
            TargetControl = app.Routing.hashValue;
        }

        if (resetControl === true && TargetControl !== false) {
            var DefaultEventObject = {
                ComponentName: TargetControl,
                Parent: "#MainContent",
                Event: false,
                IsGlobal: false,
                StyleSheet: false
            };

            window.location.hash = app.Routing.hashValue;

            window.app.loadComponent(DefaultEventObject, function () {

                //Done
            });
        }
        else {

            if (targetHref === "") {
                var Source = app.getEventObject(e.target);

                if (Source.ComponentName !== false && (Source.Event === "click" || Source.Event === null)) {
                    window.app.loadComponent(Source);
                }
            } else {

                // LoadSubComponents(targetHref);
            }
        }
    });

    // AUTO BINDING
    //=====================================
    $("*[data-action='auto']").each(function (index, el) {

        var Source = app.getEventObject(el);

        if (Source.ComponentName !== false) {
            window.app.loadComponent(Source);
        }

    });

    // In and Out events must be bound to individual elements
    app.addBinding(function () {
        $("*[data-action='hover']").hover(
            function (eIn) {

                var Source = app.getEventObject(eIn.target);

                if (Source.ComponentName !== false) {

                    app.loadComponent(Source.ComponentName, Source.Parent);
                }

            }, function (eOut) {

                var Source = app.getEventObject(eOut.target);

                if (Source.ComponentName !== false) {

                    app.unloadComponent(Source.ComponentName);
                }

            });

    });

    app.addBinding(function () {

        $('form').off('submit');

        $('form').submit(function (e) {

            e.preventDefault();

            var $this = $(this);

            var ResultContext = $this.serializeObject();

            window.LastFormObject = ResultContext;

            var FormId = $this.attr("id");

            var FormAction = $this.attr("action").toString().replace("#", "");

            var selectSuccess = ".form-success[data-parent='" + FormId + "']";

            var selectFailure = ".form-failure[data-parent='" + FormId + "']";

            var formCallback = $this.data("callback") || false;

            var onSubmitType = $this.data("on-submit") || (formCallback !== false ? "callback" : "nothing");

            var onSubmitActions = {
                show: function (data) {
                    var success = data.success || false;

                    if (success === true) {
                        $(selectSuccess).removeClass("hidden");
                        $(selectFailure).addClass("hidden");
                    }
                    else {
                        $(selectSuccess).addClass("hidden");
                        $(selectFailure).removeClass("hidden");
                    }
                },

                replace: function (data) {
                    var newHtml;
                    var success = data.success || false;
                    if (success === true) {

                        $(selectSuccess).removeClass("hidden");

                        newHtml = $(selectSuccess).html();

                        $('#' + FormId).replaceWith(newHtml);

                        $(selectSuccess).remove();

                        $(selectFailure).addClass("hidden");
                    }
                    else {
                        $(selectFailure).removeClass("hidden");

                        newHtml = $(selectFailure).html();

                        $('#' + FormId).replaceWith(newHtml);

                        $(selectFailure).remove();

                        $(selectSuccess).addClass("hidden");
                    }
                },

                transfer: function (data) {
                    var success = data.success || false;

                    var TransferUrl = $(this).attr("action")
                        || $(this).data("transfer")
                        || "#Default";

                    var FailureUrl = $(this).data("fail-transfer") || "#Default";

                    if (success === true) {
                        window.location.href = TransferUrl;
                    }
                    else {

                        window.location.href = FailureUrl;
                    }
                },

                nothing: function (data) {
                },

                populate: function (data) {
                },

                alert: function (data) {

                    var success = data.success || false;

                    var AlertText = $(selectSuccess).data("alert")
                        || $(selectSuccess + "#AlertText").html()
                        || $(selectSuccess + "#AlertText").html()
                        || "Your Request Has Been Submitted";

                    var RedirectUrl = $(selectSuccess).data("redirect")
                        || $(selectSuccess + "#Redirect").html()
                        || false;

                    window.alert(AlertText);

                    if (RedirectUrl !== false) {
                        window.location.href = RedirectUrl;
                    }
                },

                callback: function (data) {
                    data.success = data.success || false;

                    if (typeof window[formCallback] === typeof function () { }) {
                        window[formCallback](data);
                    }
                }
            };



            app.Async
                .postTo(FormAction)
                .with(ResultContext)
                .then(function (result) {



                    var success = false;

                    ResultContext.Result = result;

                    app.Properties.lastAsyncResult = result;

                    app.Template.render(selectSuccess, result || ResultContext);

                    app.Template.render(selectFailure, result || ResultContext);

                    if (typeof result.success !== 'undefined') {
                        if (result.success.toString().toLowerCase() === "true" || result.success === true) {
                            result.success = true;
                        }
                        if (result.success.toString().toLowerCase() === "false" || result.success === false) {
                            result.success = false;
                        }
                    }
                    else {
                        result.success = false;
                    }

                    // If the form has a valid onSubmit action, now we can execute it!
                    if (typeof onSubmitActions[onSubmitType] === 'function') {

                        onSubmitActions[onSubmitType](result);
                    }

                }).go();
        });
    });

    app.addBinding(function () {

        $("*[data-widget]").each(function (index, el) {

            $el = $(el);

            if ($el.data("widget") === "new") {
                var context = { context: (eval($(el).data("context")) || {}) };

                window.app.Widgets.add(app.Widgets.newWidget($el.data()));

                window.app.Widgets.activate($el.data('name'));
            } else {

                var param = $el.data("target") || $el.attr("id");

                var widget = $el.data("name") || $el.data("widget");

                app.Widgets.echo(widget, param, $el.data());
            }
        });
    });



})();