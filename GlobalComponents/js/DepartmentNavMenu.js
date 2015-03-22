/// <reference path="../scripts/app/app.js" />
/// <reference path="../scripts/libs/jquery-2.1.1.js" />

window.app.onReady("DepartmentNavMenu", function () {

    var mediaQuery_MobilePhone = 500;
    var mediaQuery_TabletDevice = 840;

    // Menu Setup
    (function () {

        var extraItemsTemplate = $("#DepartmentNavMenu_template").text();

        var extraItems, defaultSections = [];

        if (extraItemsTemplate) {

            extraItems = $(app.Template.bind(extraItemsTemplate, {}).formatted("{}"));

            $(".menu-wrapper").each(function (index, el) {

                var $source = $(el);

                var sectionName = $source.data("section") || "";

                defaultSections.push(sectionName);

                $("#" + sectionName + "_tmpl", extraItems).each(function (index2, el2) {

                    if ($(el2).html()) {
                        $('a', el2).each(function (index3, el3) {

                            var $li = $("<li class='menu-item'>");

                            $li.append($(el3));

                            $source.children("ul").append($li);
                        });
                    }
                });
            });

            $(".custom-nav", extraItems).each(function (index4, el4) {

                var $newNavItem = $(el4);

                var customTemplate = $("#NewNavItem_template").text();

                var customContext = {
                    sectionName: $newNavItem.attr("id"),
                    sectionTitle: $newNavItem.data("title"),
                    sectionLink: $newNavItem.data("link")
                };

                customTemplate = app.Template.bind(customTemplate, customContext).formatted("[]");

                $(customTemplate).appendTo("#DepartmentNavWrapper");

                $(el4).children("a").each(function (index5, el5) {

                    var newLinks = $(el5)[0].outerHTML || "";


                    $("[data-section='" + customContext.sectionName + "']")
                        .children(".menu-list")
                        .append("<li class='menu-item'>" + newLinks + "</li>");
                });
            });
        }

        $(".menu-wrapper ul").each(function (idx, el) {
            if ($(el).children().length > 0) {
                var specialStyle = "position: absolute; left: 0px; top: 0px; width: 150px; height: 10px; margin-top: -9px;";
                var specialDiv = "<div aria-hidden='true' style='" + specialStyle + "'></div>";
                $(el).prepend("<li class='menu-item'>" + specialDiv + "</li>");
            }

        });

    })();


    // Menu Manipulation & Events
    $("#DepartmentNavMenuContainer a").attr("title", function () {
        var $me = $(this), $title = $me.attr("title"), $html = $me.html();
        if (!$title) { return $html; } else { return $title; }
    });

    $(".menu-list").hide();

    $(".menu-wrapper").hover(function (inEvent) {

        $(".menu-list", this).each(function (index, el) {

            var $el = $(el);

            if ($el.html()) {
                $el.show();
            }
        });

    }, function () {

        $(".menu-list", this).each(function (index, el) {

            var $el = $(el);

            if ($el.data("sticky") !== true) {
                $el.hide();
            }
        });

    });

    $(".menu-wrapper").dblclick(function (e) {

        $(".menu-list", this).each(function (index, el) {

            var $el = $(el);

            if (typeof !$el.data("sticky") === 'undefined') {
                $el.data("sticky", true);
            }
            else {
                $el.data("sticky", !$el.data("sticky"));
            }

            if ($el.data("sticky") === true) {
                $el.addClass("sticky");

                var now = (new Date().getTime()).toString();

                now = now.substr(8, now.length);

                now = parseInt(now);

                $el.css({ zIndex: now });
            }
            else {
                $el.removeClass("sticky");

                $el.css({ zIndex: 999 });
            }
        });

    });

    app.Jobs.KeyDown35 = function (e) {

        e.preventDefault();
        e.stopPropagation();

        $(".menu-list").hide();
    };

    app.Jobs.KeyDown36 = function (e) {

        e.preventDefault();
        e.stopPropagation();
        
        $(".menu-list").show();
    };
});