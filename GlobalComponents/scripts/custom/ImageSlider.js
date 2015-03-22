/// <reference path="../libs/jquery-2.1.1.js" />

var ImageSlider = (function () {
    window.SliderActive = true;
    window.SliderBusy = false;

    var ImageData = null;

    function getImageData(url, callback) {

        this.ImageData = null;

        var Self = this;

        app.Async.from(url).get("json").then(function (data) {

            Self.ImageData = data;

            callback(data);

        }).go();

        return this;
    }

    function injectSlider(selector, data, transitionOptions) {

        var imageCount = data.Images.length;

        for (var i = 0; i < imageCount; i++) {

            var targetImage = new Image();

            $(targetImage)
                .addClass('slider-image')
                .data("info", data.Images[i]);

            targetImage.src = data.Images[i].Url;

            transitionOptions.Data = data.Images[i];

            // !IMPORTANT: The image must have a parent for translation effects to work!
            // Otherwise you must use the onload event and use the images width/height. 
            $(selector).prepend(targetImage);



            addTransition(targetImage, transitionOptions, i);
        }

        $(selector).append("<div id='image-info-div'><p id='image-info-text'></p></div>");


        updateImageInfo($('.slider-image').first().data("info"));


        return this;
    }

    function updateImageInfo(newData) {

        newData = newData || { Description: "No Description" };

        var Description = newData.Description;

        $('#image-info-text').html(Description);
    }

    function addTransition(targetImage, options, index) {

        (function (targetImage, option, index) {

            $(document).ready(function () {

                targetImage = targetImage || new Image();

                options = options || { style: 'slideByImageSize', Data: {} };

                options.index = index;

                Transitions[options.style](targetImage, options);
            })
        })(targetImage, options, index);
    }

    var Transitions = {

        slideByImageSize: function (targetImage, params) {

            params.targetImage = targetImage;

            (function (params) {

                var data = params.Data;
                var targetImage = params.targetImage;
                var index = params.index;
                var offset = $(targetImage).parent().width();
                var direction = params.direction || "marginRight";
                var units = params.units || "px";
                var duration = params.duration || 5000;


                $(targetImage)
                    .data("index", index)
                    .data("offset", offset)
                    .data("direction", direction)
                    .data("units", units)
                    .attr('id', "SliderImage-" + index)
                    .css({ marginRight: "0px", position: "absolute", top: 0, right: 0, cursor: "pointer", zIndex: index })
                    .on("Slide", function () {

                        window.SliderBusy = true;

                        var index = $(this).data("index");
                        var offset = $(this).data("offset");
                        var direction = $(this).data("direction");
                        var units = $(this).data("units");

                        var animationSettings = {};

                        animationSettings[direction] = "-" + offset + units;
                        
                        $('#image-info-text').html("");

                        $(this).animate(animationSettings, 1000, "swing", function () {

                            var topZ = 0;

                            var topImage = $(".slider-image").first();

                            $(".slider-image").each(function () {

                                var zIndex = parseInt($(this).css("z-index"), 10);

                                $(this).css("z-index", zIndex + 1);
                            });

                            var topZValue = parseInt($(this).css("z-index"), 10);

                            $(".slider-image").each(function () {

                                var zIndex = parseInt($(this).css("z-index"), 10);

                                if (zIndex == (topZValue - 1)) {
                                    updateImageInfo($(this).data("info"));
                                }
                            })

                            var resetCss = { zIndex: 0 };

                            resetCss[direction] = 0;

                            $(this).css(resetCss);

                            window.SliderBusy = false;
                        });

                    })
                    .click(function (e) { window.SliderActive = (!window.SliderActive); });



            })(params);

        },

        slideByTargetSize: function (targetImage, params) {

        },

        fadeOut: function (targetImage, params) {

        }
    };

    function AutoStart(options) {
        options = options || {};

        var ImageDataUrl = options.ImageDataUrl || "assets/images.txt";

        var soStyle = options.Style || "slideByImageSize";

        var soDirection = options.Direction || "marginRight";

        var soUnits = options.Units || "px";

        var parentSelector = options.ParentSelector || "#top-banner-div";

        var imageClass = "." + (options.ImageClass || "slider-image");

        var soDuration = options.Duration || 5000;

        ImageSlider.getImageData(ImageDataUrl, function (data) {

            var sliderOptions = {
                style: soStyle,
                direction: soDirection,
                units: soUnits,
                duration:soDuration
            };

            ImageSlider.injectSlider(parentSelector, data, sliderOptions);

            window.iterated = [];

            function infiniSlide(child) {

                window.COUNT = window.COUNT || 0;

                window.COUNT++;

                return function () {

                    var newChild = child;

                    if (window.SliderActive !== false && window.SliderBusy === false) {
                        child.trigger("Slide");

                        if ($(child).next(imageClass).length > 0) {
                            newChild = $(child).next(imageClass);
                        }
                        else {
                            // $(child).first() broke out of the inheritence chain for some reason
                            newChild = $(child).parent().children(imageClass).first();
                        }
                    }

                    setTimeout(infiniSlide(newChild), soDuration);
                }
            }

            setTimeout(function () {
                infiniSlide($(parentSelector).children(imageClass).first())();
            }, soDuration);
        });

    }


    return {
        ImageData: ImageData,
        getImageData: getImageData,
        injectSlider: injectSlider,
        AutoStart: AutoStart
    };

})();

