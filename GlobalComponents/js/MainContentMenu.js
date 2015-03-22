/// <reference path="../scripts/app/app.js" />


window.app.onReady("MainContentMenu", function () {

    var defaultSection = this.Data.Options.section || false;

    var defaultBannerUrl = this.Data.Options.banner || false;

    function UpdateMenu() {

        var ActiveSection = defaultSection || app.Routing.hashValue;

        var ActiveMenu = ActiveSection + "Menu";

        var MenuContents = $("#" + ActiveMenu).html();

        $("#ContentMenuHyperlinks").html(MenuContents);

        var BannerUrl = defaultBannerUrl || ("assets/banners/" + ActiveMenu + "default.jpg");

        $("#ContentMenuBanner").css({ backgroundImage: 'url(' + BannerUrl + ')' });
       
    };

    UpdateMenu();

    //window.addEventListener("hashchange", UpdateMenu)

});