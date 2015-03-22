/// <reference path="C:\Solutions\Business.Fullerton.Edu\Root\NewSectionTemplate/scripts/app/app.js" />

window.app.onReady("SubPageNavMenu", function () {

    var ww = document.body.clientWidth;
    
    var adjustMenu = function () {
        if (ww < 768) {
            $(".toggleMenu").css("display", "inline-block");
            if (!$(".toggleMenu").hasClass("active")) {
                $(".menu-dropdown").hide();
            } else {
                $(".menu-dropdown").show();
            }
            $(".menu-dropdown li").unbind('mouseenter mouseleave');
            $(".menu-dropdown li a.parent").unbind('click').bind('click', function (e) {
                // must be attached to anchor element to prevent bubbling
                e.preventDefault();
                $(this).parent("li").toggleClass("hover");
            });
        }
        else if (ww >= 768) {
            $(".toggleMenu").css("display", "none");
            $(".menu-dropdown").show();
            $(".menu-dropdown li").removeClass("hover");
            $(".menu-dropdown li a").unbind('click');
            $(".menu-dropdown li").unbind('mouseenter mouseleave').bind('mouseenter mouseleave', function () {
                // must be attached to li so that mouseleave is not triggered when hover over submenu
                $(this).toggleClass('hover');
            });
        }
    }


    $(document).ready(function () {
        $(".menu-dropdown li a").each(function () {
            if ($(this).next().length > 0) {
                $(this).addClass("parent");
            };
        })

        $(".toggleMenu").click(function (e) {
            e.preventDefault();
            $(this).toggleClass("active");
            $(".menu-dropdown").toggle();
        });
        adjustMenu();
    })

    $(window).bind('resize orientationchange', function () {
        ww = document.body.clientWidth;
        adjustMenu();
    });


});