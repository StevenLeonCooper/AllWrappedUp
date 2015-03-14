/// <reference path="app.js" />
/// <reference path="main.js" />
/// <reference path="jobs.js" />


(function (app) {

    app.Widgets.RssFeeds = {
        // Activate any RSS Feed Widgets on the page
        Activate: function (customScript) {
            $(document).ready(function () {

                var FeedScriptUrl = customScript || "/GlobalComponents/RssFeed.js";

                $.getScript(FeedScriptUrl, function () {

                });

            });
        }

    };

})(window.app);