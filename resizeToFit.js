window.resizeToFit = (function makeResizeToFit(){
    const charges = [];
    let styleSheet = null;

    function setCSS(selector, properties, replaceIdx) {
        if (replaceIdx) {
            styleSheet.deleteRule(replaceIdx);
        }
        const idx = styleSheet.insertRule(selector + "{" + properties + "}", styleSheet.cssRules.length);
        return idx;
    }

    function interpolateOptimalFontSize(charge) {
        const element = charge[0];
        const selector = charge[1];
        const elementClientW = element.clientWidth;
        let fontSize = element.startFontSize;
        let fontSizeIdx = setCSS(selector, "font-size: " + fontSize + "px");
        if (element.scrollWidth > elementClientW) {
            while (element.scrollWidth > elementClientW) {
                fontSize -= 1;
                fontSizeIdx = setCSS(selector, "font-size: " + fontSize + "px", fontSizeIdx);
            }
        }
    }

    function resizeContent(charge) {
        //unit is always "px" for computed values
        const element = charge[0];
        const selector = charge[1];
        const computedStyles = window.getComputedStyle(element);
        const overflowIdx = setCSS(selector, "overflow: hidden")
        if (!element.startFontSize) {
            element.startFontSize = parseInt(computedStyles.fontSize.slice(0, -2), 10);
        }
        interpolateOptimalFontSize(charge);
        styleSheet.deleteRule(overflowIdx);
    }

    function resize() {
        charges.forEach(function (charge) {
            resizeContent(charge);
        });
    }

    function init(selectors) {
        const styleEl = document.createElement("style");
        styleEl.id = "resizeToFit_Styles";
        styleEl.type = "text/css";
        document.head.appendChild(styleEl);
        styleSheet = styleEl.sheet;

        selectors.forEach(function (selector) {
            const nodeList = document.querySelectorAll(selector);
            nodeList.forEach(function (element) {
                charges.push([element, selector]);
            });
        });
        resize();
    }

    return {
        init,
        resize
    }
}());