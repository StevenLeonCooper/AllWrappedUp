/// <reference path="C:\Solutions\Business.Fullerton.Edu\Root\GlobalComponents/scripts/app/app.js" />


window.app.onReady("MainContentMenu", function () {

    function UpdateBanner() {

        var ActiveSection = window.location.hash.replace("#", "").split("/")[0];

        var ActiveMenu = ActiveSection + "Menu";

        var MenuContents = $("#" + ActiveMenu).html();

        $("#ContentMenuHyperlinks").empty().append(MenuContents);

        var BannerUrl = "assets/banners/" + ActiveMenu + ".jpg";

        $("#ContentMenuBanner").css({ backgroundImage: 'url(' + BannerUrl + ')' });
    };

    $(document).ready(UpdateBanner);

    window.addEventListener("hashchange", UpdateBanner)

});