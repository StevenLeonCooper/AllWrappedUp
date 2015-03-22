/// <reference path="app.js" />
/// <reference path="main.js" />
/// <reference path="jobs.js" />

(function (app) {

    app.Widgets.add(app.Widgets.newWidget({
            name: "RssFeeds",
            url: "/GlobalComponents/RssFeedWidget.html",
            targetSelector: "body",
            injectionMethod: "append",
            context: {},
            formatStyle: "{}"
    }));

})(window.app);