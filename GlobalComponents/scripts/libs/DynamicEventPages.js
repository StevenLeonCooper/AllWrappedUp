/// <reference path="jquery-1.11.1.min.js" />
(function ($) {


    function LoadDynamicEventPage(url) {
        var target = url.split("#")[1] || false;

        if (target !== false) {
            $.get(target, {}, function (newContent) {
                $("#column-center").html(newContent);

            }, "html");
        }
    }

    $(document).ready(function () {

        $.get("Dynamic/Events.html", {}, function (content) {

            $("#upcoming-event-container").html(content);

            $(".uee-main-link").click(function (e) {
                LoadDynamicEventPage(this.href)
            });


        }, "html");

        LoadDynamicEventPage(document.location.href);

    });
})(window.$);