/// <reference path="../libs/jquery-2.1.1.js" />
// setup.js is used to asynchronously load the JS dependencies "below the fold"
// Add JS files to the Dependencies Array in the order they should be loaded. 
// All files are assumed to be in "scripts/"

(function (settings) {

    var GlobalComponentUrl = settings.GlobalComponentUrl;
    var Dependencies = settings.ScriptFiles;
    var Loader = {
        LoadedAllScripts: false,
        ScriptIntervalTimeout: 200,
        ScriptInterval: 0
    };
    var max = Dependencies.length;

    var count = 0;

    function getMoreScripts() {
        if (Loader.ScriptInterval < Loader.ScriptIntervalTimeout) {
            if (typeof window.$ !== 'undefined' && Loader.LoadedAllScripts === false) {
                var url = GlobalComponentUrl + "scripts/" + Dependencies[count];

                if (count < max) {
                    count++;
                    $.getScript(url, getMoreScripts);
                } else {
                    Loader.LoadedAllScripts = true;
                }
            } else {
                Loader.ScriptInterval++;
                setTimeout(getMoreScripts, 50);
            }
        }
    }

    var jQueryScript = document.createElement("script");

    jQueryScript.id = "jQueryScript";

    jQueryScript.src = GlobalComponentUrl + "scripts/libs/jquery-2.1.1.min.js";

    document.body.appendChild(jQueryScript);

    window.onload = getMoreScripts;

})(window.appSettings || {});