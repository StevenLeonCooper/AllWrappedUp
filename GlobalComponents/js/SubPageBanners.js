/// <reference path="../scripts/app/app.js" />

window.app.onReady("SubPageBanners", function () {

    var customBanner = window.appSettings.BannerUrl || false;

    function GoogleSearch(Query) {
        var Question = Query || $("#SearchInputText").val() || " ";

        window.location.href = "https://www.google.com/?gws_rd=ssl#q=" + Question + "+site:business.fullerton.edu";
    }

    if (customBanner === false) {
        window.appSettings.BannerUrl = "/GlobalComponents/themes/classic/images/MihayloBanner.png";

        $("#MainBanners-MihayloImage").css("background-image", "url('" + window.appSettings.BannerUrl + "')")
    }
    
    $("#SearchInputText").focus(function (e) {

        $("#SearchInputText").val("");
    });

    app.Jobs.KeyDown13 = function (event) {
        
        if ($("#SearchInputText").is(":focus")) {
            GoogleSearch();
        }
    };

    app.Jobs.redirectFromBanner = function (e) {

        if (this.id) {
            if (this.id === "mihaylo-banner-link") {
                location.href = "http://business.fullerton.edu";
            }

            if (this.id === "department-banner-link") {
                location.href = (location.protocol + "//" + location.host + location.pathname + "#Default");
            }
        }
    };

    app.Jobs.SearchGoogle = function (e, sourceId) {

        var querySelector = $(this).data("query") || sourceId;

        var query = $("#" + querySelector).val() || "CSUF Mihaylo";

        var SearchUrl = "https://www.google.com/search?as_sitesearch=http%3A%2F%2Fbusiness.fullerton.edu&as_q=";

        window.location.href = SearchUrl + query;
    };
});