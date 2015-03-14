/// <reference path="../scripts/app/app.js" />

window.app.onReady("SubPageNavMenu", function () {

    $(document).ready(function () {


        app.Jobs.MinifyNavMenu = function (senderId) {

            $("#ActionMenu, #ContentWrapper").addClass("CollapsedLeftNav");
            $("#" + senderId).data("click", "ExpandNavMenu");
        };

        app.Jobs.ExpandNavMenu = function(senderId)
        {
            $("#ActionMenu, #ContentWrapper").removeClass("CollapsedLeftNav");
            $("#" + senderId).data("click", "MinifyNavMenu");
        }

    });


});