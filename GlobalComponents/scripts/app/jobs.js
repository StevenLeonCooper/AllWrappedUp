/// <reference path="app.js" />

(function (app) {

    function AsyncUnitData(Element, StarLevel) {

        $("body").trigger("UnitDataRequestInitiated");

        var ElementList = ["fire", "water", "earth", "thunder", "light", "dark"];

        window.lastUnitList = {};
        window.completedFiles = 0;
        window.fileQueue = [];

        if (Element === "all" && StarLevel === "all") {
            for (var i = 0; i < ElementList.length; i++) {
                for (var ii = 1; ii < 7; ii++) {
                    window.fileQueue.push(ElementList[i] + ii + ".json");
                }
            }
        } else
            if (StarLevel === "all" && Element !== "all") {

                for (var i = 1; i < 7; i++) {
                    window.fileQueue.push(Element + i + ".json");
                }
            } else

                if (Element === "all" && StarLevel !== "all") {
                    for (var i = 0; i < ElementList.length; i++) {
                        window.fileQueue.push(ElementList[i] + StarLevel + ".json");
                    }
                } else {
                    window.fileQueue.push(Element + StarLevel + ".json");
                }



        function CombineResults(results) {
            $.extend(window.lastUnitList, results);
            window.completedFiles++;

            if (window.completedFiles === window.fileQueue.length) {
                window.fileQueue = [];
                window.completedFiles = 0;

                var mainComponent = app.ActiveHash.toString().replace("#", "");


                $("body").trigger("UnitDataChanged." + mainComponent);
                $("body").trigger("UnitDataChanged.Global");

            }
        }

        for (var i = 0; i < window.fileQueue.length; i++) {
            app.Async
                .get("json")
                .from("../rawdata/" + window.fileQueue[i])
                .thenGo(CombineResults);
        }


    }

    app.Jobs.Template = {};

    app.Properties.Template = (function () {
        return {
            Symbols: {
                lcb: "&#123;",  //  {
                rcb: "&#125;",  //  }
                lsb: "&#91;",   //  [
                rsb: "&#43;",   //  ]
                lpr: "&#40;",   //  (
                rpr: "&#41;",   //  )
                dol: "&#36;",   //  $
            }
        };
    })();

    // DATA

    app.Jobs.Template.UnitData = (function () {
        return {
            Divide: function () {
                return function (inputs, render) {
                    inputs = render(inputs) || "1:1";
                    var inputArray = inputs.split(":");
                    var numerator = inputArray[0] || 1;
                    var denominator = inputArray[1] || 1;
                    var output = parseInt(numerator) / parseInt(denominator);
                    return Math.floor(output);
                };
            },
            Add: function () {
                return function (inputs, render) {
                    inputs = render(inputs) || "1:1";
                    var inputArray = inputs.split(":");
                    var numerator = inputArray[0] || 1;
                    var denominator = inputArray[1] || 1;
                    var output = parseInt(numerator) + parseInt(denominator);
                    return output;
                };
            },
            Subtract: function () {
                return function (inputs, render) {
                    inputs = render(inputs) || "1:1";
                    var inputArray = inputs.split(":");
                    var numerator = inputArray[0] || 1;
                    var denominator = inputArray[1] || 1;
                    var output = parseInt(numerator) - parseInt(denominator);
                    return output;
                };
            },
            Multiply: function () {
                return function (inputs, render) {
                    inputs = render(inputs) || "1:1";
                    var inputArray = inputs.split(":");
                    var numerator = inputArray[0] || 1;
                    var denominator = inputArray[1] || 1;
                    var output = parseInt(numerator) * parseInt(denominator);
                    return output;
                };
            },
            Average: function () {
                return function (inputs, render) {
                    inputs = render(inputs) || "1:1";
                    var inputArray = inputs.split(":");
                    var numerator = inputArray[0] || 1;
                    var denominator = inputArray[1] || 1;
                    var output = (parseInt(numerator) + parseInt(denominator)) / 2;
                    return Math.floor(output);
                };
            },
            RedditColor: function () {
                return function (input, render, extra) {

                    input = render(input);

                    var output = ("/tc");

                    switch (input) {
                        case "fire": output = "/tg"; break;
                        case "water": output = "/gt"; break;
                        case "earth": output = "/gg"; break;
                        case "thunder": output = "/ta"; break;
                        case "dark": output = "/cg"; break;
                        case "light": output = "/ca"; break;
                        default: break;
                    }

                    return output;
                };
            },
            ArenaType: function () {
                return function (input, render) {
                    input = render(input);

                    var output = ("Type Unknown");

                    if (parseInt(this.ai.length) === 4) {
                        output = "Type 3";

                    } else if (parseInt(this.ai.length) === 5) {

                        output = "Type 4";

                    } else {
                        switch (this.ai[0]["target conditions"]) {
                            case "random": output = "Type1"; break;
                            case "hp_50pr_over": output = "Type 2"; break;
                            case "hp_50pr_under": output = "Type 5"; break;
                            case "hp_75pr_under": output = "Type 6"; break;
                            default: break;
                        }

                    }
                    return output;
                };
            },
            RedditBB: function () {

                return function (bbType, render) {

                    bbType = bbType || "bb";

                    var output = "N/A";

                    if (typeof this[bbType] === 'undefined') {
                        return output;
                    }

                    var Hits = this[bbType].hits || "0";

                    var Cost = this[bbType].levels[9]["bc cost"] || "0";

                    var Damage = this[bbType].levels[9].effects[0]["bb atk%"] || "N/A";

                    var EffectLocation = 1;

                    if (Damage === "N/A") { EffectLocation = 0; }

                    var Effects = this[bbType].levels[9].effects[EffectLocation] || {};

                    var EffectsList = [];


                    for (var key in Effects) {
                        if (Effects.hasOwnProperty(key) && key !== "effect delay time(ms)/frame") {
                            EffectsList.push(key + ": " + Effects[key] + "\n");
                        }
                    }

                    output = Hits + " Hits,  " + Cost + "BC, " + Damage + "% Damage. Effects: " + EffectsList;

                    return output;
                };
            },

            RedditLS: function () {
                return function (input, render) {

                    var Effects = this["leader skill"].effects || [];

                    var EffectsList = [];

                    for (var i = 0; i < Effects.length; i++) {
                        if (typeof Effects[i] === typeof {}) {
                            for (var key in Effects[i]) {
                                if (Effects[i].hasOwnProperty(key)) {
                                    EffectsList.push("&nbsp;&nbsp;&nbsp;&nbsp;" + key + ": " + Effects[i][key] + "&#10;&#10;");
                                }
                            }
                        }
                    }

                    var output = EffectsList.toString().replace(",", "");

                    return output;

                };
            }

        };
    })();

    app.Jobs.MultiUpdate = function (senderId) {

        var $this = $(this);

        var Params = $(this).data("params") || "0;0";

        Params = Params.split(" ").join("").split(";");

        var Element = Params[0] || "fire";

        var StarLevel = Params[1] || "6";

        AsyncUnitData(Element, StarLevel);
    };

    app.Jobs.UpdateData = function (senderId) {

        var targetFile = "";
        var StarLevel = $("#StarLevelSelection").val() || "6";
        var Element = $("#ElementSelection").val() || "fire";

        AsyncUnitData(Element, StarLevel);
    };

    //Utility & Templates

    app.Jobs.EffectsBuilder = function (context, settings, override) {
        settings = settings || {
            startString: "<tr>",
            endString: "</tr>",
            keyPattern: "$KEY",
            valuePattern: "$VAL",
            template: "<td>$KEY</td> <td>$VAL</td>",
            enumeration: "even",
            enumTemplate: " </tr><tr>",
            skipList: []
        };

        override = override || "effects";

        var EffectList = settings.startString || "";

        var Effects = context;

        Effects = Effects.effects || (Effects[override] || []);

        var ii = 1;

        for (var i = 0; i < Effects.length; i++) {
            var target = Effects[i] || {};

            for (var key in target) {

                if (target.hasOwnProperty(key)) {

                    var value = target[key];


                    var cleanKey = key;
                    var cleanValue = value;

                    if (key.indexOf("%") > -1) {
                        cleanKey = key.replace("%", "");
                        cleanValue += "%";
                    }

                    var keyNeedle = settings.keyPattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

                    var keyNeedleReg = new RegExp(keyNeedle, 'g');

                    var keyBound = settings.template.replace(keyNeedleReg, cleanKey);

                    var valueNeedle = settings.valuePattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

                    var valueNeedleReg = new RegExp(valueNeedle, 'g');

                    var valueBound = keyBound.replace(valueNeedleReg, cleanValue);

                    if (settings.skipList.indexOf(key) < 0) {
                        EffectList += valueBound;
                    }


                    // Enumeration
                    if (isNaN(settings.enumeration)) {


                        if (settings.enumeration === "even") {
                            if (ii % 2 === 0) {
                                EffectList += settings.enumTemplate.toString().replace(valueNeedleReg, value).replace(keyNeedleReg, value);
                            }
                        }

                        if (settings.enumeration === "odd") {
                            if (ii % 2 !== 0) {
                                EffectList += settings.enumTemplate.toString().replace(valueNeedleReg, value).replace(keyNeedleReg, value);
                            }
                        }
                    } else {
                        if (ii === parseInt(settings.enumeration)) {
                            EffectList += settings.enumTemplate.toString().replace(valueNeedleReg, value).replace(keyNeedleReg, value);
                        }
                    }

                    ii++;
                }
            }
        }

        EffectList += settings.endString;

        return EffectList;
    };

    app.Jobs.Template.UnitData.LSDetails = function () {
        return function (input, render) {
            var rendered = render(input);
            var output;

            output = app.Jobs.EffectsBuilder(this["leader skill"] || {});

            return output;
        };
    };

    app.Jobs.Template.UnitData.BBExtras = function () {

        return function (input, render) {
            var settings = {
                startString: "",
                endString: "",
                keyPattern: "$KEY",
                valuePattern: "$VAL",
                template: " &bull; <span class='effect-text " + input + "'><strong>$KEY:</strong> $VAL</span>",
                enumeration: "NaN",
                enumTemplate: " ",
                skipList: [
                    'effect delay time(ms)/frame',
                    'bb atk%',
                    'target area',
                    'target type'
                ]
            };

            var context = this[input] || false;

            if (context !== false) {
                context = context.levels || false;

                if (context !== false) {
                    context = context[9];
                }
            }


            var output = app.Jobs.EffectsBuilder(context, settings);

            return output;
        };
    };

    app.Jobs.Template.UnitData.BBDamage = function () {
        return function (input, render) {
            var output;

            var context = this[input] || false;

            var collection = [];
            var record = [];

            if (context !== false && Array.isArray(context.levels)) {
                var levelTenEffects = context.levels[9].effects || false;

                if (levelTenEffects !== false) {
                    for (var i = 0; i < levelTenEffects.length; i++) {
                        var effect = levelTenEffects[i];

                        for (var key in effect) {
                            if (effect.hasOwnProperty(key)) {

                                var value = effect[key];

                                if (record.indexOf(key) > -1) {
                                    continue;
                                }

                                if (value == "aoe") {
                                    value = "Multi-Target";
                                }
                                switch (key) {
                                    case "bb atk%":
                                        collection.push(" <strong>" + value + "% Damage </strong>");
                                        break;
                                    case "target area":
                                        collection.push(" " + value);
                                        break;
                                    case "target type":
                                        collection.push(" " + value);
                                        break;
                                    case "heal high":
                                        collection.push(" " + "Heal High: " + value);
                                        break;
                                    case "heal low":
                                        collection.push(" " + "Heal Low: " + value);
                                        break;
                                    case "rec added% (from healer)":
                                        collection.push(" +" + value + "% Healer REC");
                                        break;
                                    default: break;
                                }

                                record.push(key);
                            }
                        }
                    }
                }
            }

            output = collection;

            return output;
        };
    };

    // UI Components

    app.Jobs.PopUpUnitCard = function (senderId) {

        var targetUnit = $(this).html() || " ";

        var output = false;

        targetUnit = targetUnit.split(" ").join("");

        targetUnit = window.lastUnitList[targetUnit] || false;

        if (targetUnit !== false) {
            output = app.Template.bind("#UnitCardTemplate", targetUnit).formatted("[]");
        }

        if (output !== false) {

            $("#Wrapper").css({ overflowY: "hidden" });

            $("<div>")
                .css({
                    backgroundColor: "rgba(000,000,000,0.5)",
                    position: "fixed",
                    zIndex: 9999,
                    top: "0", left: "0", right: "0", bottom: "0",
                    overflow: "auto"
                })
                .html(output)
                .click(function (e) {
                    $("#ContentWrapper").css({ overflowY: "auto" });
                    $(this).remove();
                }).appendTo("body");
        }

    };

    app.Jobs.UpdateUnitStatTable = function () {

        var StarLevel = $("#StarLevelSelection").val() || "6";

        var Element = $("#ElementSelection").val() || "fire";

        $("#UnitStatTable > tbody").html("");

        var results = window.lastUnitList || false;

        // Discontinue Check if No Data Exists
        if (results === false) { return; }

        $("#UnitSelectionTitle").html(StarLevel + "-Star " + Element.toUpperCase() + " Units");

        $.each(results, function (index, currentUnit) {

            var DataContext = currentUnit;

            DataContext.tasks = app.Jobs.Template.UnitData || {};

            var BoundResult = app.Template.bind("#UnitRowTemplate", DataContext).formatted("[]");

            $("#UnitStatTable > tbody").append(BoundResult);

            window.lastUnitData = DataContext;

        });
    };

    app.Jobs.toggleColumns = function (senderId) {

        var targetColumn = $(this).data("column") || false;

        var isChecked = this.checked;

        if (targetColumn !== false) {
            if (isChecked) {
                $("." + targetColumn).removeClass("noDisplay");
            }
            else {
                $("." + targetColumn).addClass("noDisplay");
            }
        }

    };

})(window.app);