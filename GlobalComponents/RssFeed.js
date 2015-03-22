/// <reference path="scripts/app/app.js" />


$(document).ready(function () {
    $("[data-widget='RssFeed']").each(function (i, el) {

        $el = $(el);

        var feedUrl = $el.data("feed-url") || "";
        var feedLimit = parseInt($el.data("feed-limit")) || 4;
        var feedOptions = $el.data("feed-options") || "titles:on;snippets:on";
        var feedName = $el.attr("id") || "EventWidget";

        var Options = feedOptions.split(";");
        var OptionalSettings = { title: true, snippets: true };

        for (var i = 0; i < Options.length; i++) {

            debugger;

            var setting = Options[i].split(":")[0];
            var value = Options[i].split(":")[1]

            if (value.toString().toLowerCase() === 'off') {
                value = true;
            }
            else {
                value = false;
            }

            OptionalSettings[setting] = value;
        }

        if (typeof window.rssFeeds === 'undefined') {
            window.rssFeeds = {};
        }


        window.rssFeeds[feedName] =
            {
                FeedUrl: feedUrl,
                FeedLimit: feedLimit,
                DisableSnippets: OptionalSettings.snippets,
                DisableFeedTitle: OptionalSettings.title
            };


    });

    // INSERT FEED CODE

    for (var rssFeed in window.rssFeeds) {

        if (rssFeeds.hasOwnProperty(rssFeed)) {
            (function (target) {
                $.get("/GlobalComponents/RssFeedClassic.html", {}, function (data) {
                    window.rssFeeds[target] = window.rssFeeds[target] || {};
                    window.rssFeeds[target].EventWidget = {
                        Debug: {},
                        EventWidget: $(data),
                        Debug: data
                    };
                    $("#" + target).html(data);

                    InstallFeed(target);

                }, "html");
            })(rssFeed);
        }
    }

    // FEED CODE 
    var InstallFeed = function (feedName) {

        function parseRSS(url, callback) {

            $.ajax({
                url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(url),
                dataType: 'json',
                success: function (data) {
                    callback(data.responseData.feed);
                }
            });
        }

        var FeedName = feedName || "EventWidget";

        var FeedObject = window.rssFeeds[FeedName] || {};

        var feedUrl = FeedObject.FeedUrl || "http://bizblogs.fullerton.edu/feed/";

        var feedFilter = FeedObject.FeedCategory || false;

        var feedLimit = FeedObject.FeedLimit || 7;

        var feedSnippets = !FeedObject.DisableSnippets;

        var feedTitleLink = !FeedObject.DisableFeedTitle;


        parseRSS(feedUrl, function (rss) {


            var FeedTitleLink = "<p class='feedTitle FeedTitle'><a href='" + rss.link + "'>" + rss.title + "</a></p>";

            if (feedTitleLink === false) {
                FeedTitleLink = "";
            }

            $("#" + FeedName + " .feed-content")
                .empty()
                .append(FeedTitleLink)
                .append("<ul class='FeedList' id='" + FeedName + "-rss-ul' style=''>");

            $("#" + FeedName + "-rss-ul").empty();

            for (var i = 0; i < feedLimit; i++) {
                var value = rss.entries[i];

                var Snippet = value.contentSnippet;

                if (feedSnippets === false) {
                    Snippet = "";
                }

                if (feedFilter === false || (value.category === feedFilter)) {
                    $("<li class='FeedListItem' style='list-style: url(\"/GlobalComponents/assets/list-arrow.gif\");'>")
                        .appendTo("#" + FeedName + "-rss-ul")
                        .append("<span class='headline FeedHeadline'><a href='" + value.link + "'>" + value.title + "</a></span>")
                        .append("<div class='FeedSnippet'>" + Snippet + "</div>")
                }

            }

            window.ecNewsRss = rss;
        });
    };

});