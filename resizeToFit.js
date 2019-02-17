window.resizeToFit = (function makeResizeToFit() {
    "use strict";
    const charges = [];
    let styleSheet = null;

    /**
     * Adds or replaces a rule.
     * @param {string} selector - The selector for the rule
     * @param {string} properties - The properties to be set
     * @param {number} replaceIdx - The index of the rule this rule replaces
     * @returns {number} - The new index
     */
    function setCSS(selector, properties, replaceIdx) {
        if (replaceIdx) {
            styleSheet.deleteRule(replaceIdx);
        }
        const idx = styleSheet.insertRule(selector + "{" + properties + "}", styleSheet.cssRules.length);
        return idx;
    }

    /**
     * Reduce font-size until the elements scrollWidth is equal or smaller
     * than the elements client width.
     * Getting element.scrollWidth forces a layout. This is really bad
     * for performance.
     * @param {array} charge - An array of element and selector
     * @returns {undefined}
     */
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

    /**
     * Prepare element for resizing.
     * @param {array} charge - An array of element and selector
     * @returns {undefined}
     */
    function resizeContent(charge) {
        // The unit is always "px" for computed values
        const element = charge[0];
        const selector = charge[1];
        const computedStyles = window.getComputedStyle(element);
        const overflowIdx = setCSS(selector, "overflow: hidden");
        if (!element.startFontSize) {
            element.startFontSize = parseInt(
                computedStyles.fontSize.slice(0, -2),
                10
            );
        }
        interpolateOptimalFontSize(charge);
        styleSheet.deleteRule(overflowIdx);
    }

    /**
     * Resize each element
     */
    function resize() {
        charges.forEach(function eachCharge(charge) {
            resizeContent(charge);
        });
    }

    /**
     * Create a styleSheet and collect all elements. Then call resize().
     * @param {array} selectors - An array of selectors that need to be resized
     * @returns {undefined}
     */
    function init(selectors) {
        const styleEl = document.createElement("style");
        styleEl.id = "resizeToFit_Styles";
        styleEl.type = "text/css";
        document.head.appendChild(styleEl);
        styleSheet = styleEl.sheet;

        selectors.forEach(function eachSelector(selector) {
            const nodeList = document.querySelectorAll(selector);
            nodeList.forEach(function eachElement(element) {
                charges.push([element, selector]);
            });
        });
        resize();
    }

    return {
        init,
        resize
    };
}());
