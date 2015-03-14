/// <reference path="../scripts/app/app.js" />


window.app.onReady("RssFeed", function () {

    return;

    $ = $ || app.$;

    function parseRSS(url, callback) {

        $.ajax({
            url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(url),
            dataType: 'json',
            success: function (data) {
                callback(data.responseData.feed);
            }
        });
    }



    var DefaultSettings = {
        FeedUrl: "http://bizblogs.fullerton.edu/marketing/feed/",
        FeedCategory: "cathere",
        FeedLimit: 4,
        FeedName: "namehere"
    };

    var DataContext = {
        FeedUrl: $("#RssFeedContainer .ContextKey").data("feed-url") || DefaultSettings.FeedUrl,
        FeedCategory: $("#RssFeedContainer .ContextKey").data("feed-category") || DefaultSettings.FeedCategory,
        FeedLimit: $("#RssFeedContainer .ContextKey").data("feed-limit") || DefaultSettings.FeedLimit,
        FeedName: $("#RssFeedContainer .ContextKey").data("feed-name") || DefaultSettings.FeedName
    };


    var FeedName = DataContext.FeedName; //("#column-left").closest(".rss-widget").attr("id") || "EventWidget";

    var FeedObject = DataContext || {};

    var feedUrl = FeedObject.FeedUrl || "http://bizblogs.fullerton.edu/feed/";

    var feedFilter = FeedObject.FeedCategory || false;

    var feedLimit = FeedObject.FeedLimit || 7;



    parseRSS(feedUrl, function (rss) {

        var feedSelector = "#" + FeedName + " .feed-content";

        

        $(feedSelector)
            .empty()
            .append("<p class='feedTitle'><a href='" + rss.link + "'>" + rss.title + "</a></p>")
            .append("<ul id='" + FeedName + "-rss-ul' style='margin-left:-20px;'>");

        $("#" + FeedName + "-rss-ul").empty();

        for (var i = 0; i < feedLimit; i++) {
            var value = rss.entries[i];

            if (typeof value.category === 'undefined')
            {
                feedFilter = false;
            }

            if (feedFilter === false || (value.category === feedFilter)) {
                $("<li style='list-style: url(\"/GlobalComponents/assets/list-arrow.gif\");'>")
                    .appendTo("#" + FeedName + "-rss-ul")
                    .append("<span class='headline'><a href='" + value.link + "'>" + value.title + "</a></span>")
                    .append("<div>" + value.contentSnippet + "</div>")
            }

        }

        window.ecNewsRss = rss;
    });


});