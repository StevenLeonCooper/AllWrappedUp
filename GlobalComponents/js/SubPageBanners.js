/// <reference path="../scripts/app/app.js" />

window.app.onReady("SubPageBanners", function () {

    var customBanner = window.appSettings.BannerUrl || false;

    if (customBanner === false)
    {
        window.appSettings.BannerUrl = "http://www.business.fullerton.edu/NewSectionTemplate/themes/classic/images/MihayloBanner.png";

        $("#MainBanners-MihayloImage").css("background-image","url('" + window.appSettings.BannerUrl + "')")
    }

    function GoogleSearch(Query) {
        var Question = Query || $("#SearchInputText").val() || " ";

        window.location.href = "https://www.google.com/?gws_rd=ssl#q=" + Question + "+site:business.fullerton.edu";
    }

    $("#SearchButton").click(function (e) {

        GoogleSearch();
    });

    $("#SearchInputText").focus(function (e) {

        $("#SearchInputText").val("");
    });

    $(document).keydown(function (event) {
        if ($("#SearchInputText").is(":focus")) {

            if (event.keyCode == 13) { //g 

                GoogleSearch();
            }
        }
    });


});