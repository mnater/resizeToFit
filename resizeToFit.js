window.resizeToFit = (function makeResizeToFit() {
    "use strict";
    const charges = [];
    let cssHandler = null;

    /**
     * Factory for a CSS handling object
     * @param {CSSStyleSheet} styleSheet - An existing CSSOM styleSheet
     */
    function makeCSSHandler(styleSheet) {
        const sel2Id = new Map();

        /**
         * Creates or changes a CSS rule.
         * @param {string} selector - The selector, where the properties are added to
         * @param {array} properties - Array of properties. e.g. ["color: red", "font-size: 12px"]
         * @param {boolen} important - True if the rule is !important
         */
        function setProp(selector, properties, important) {
            if (sel2Id.has(selector)) {
                // Add to existing rule
                const idx = sel2Id.get(selector);
                properties.forEach(function eachProp(prop) {
                    const propNameValue = prop.split(":");
                    const propName = propNameValue[0].trim();
                    const propValue = propNameValue[1].trim();
                    const propImportant = important ? "important" : "";
                    styleSheet.cssRules.item(idx).style.setProperty(
                        propName,
                        propValue,
                        propImportant
                    );
                });
            } else {
                // Create new rule
                let propString = "";
                properties.forEach(function eachProp(prop) {
                    propString += prop + "; ";
                });
                const idx = styleSheet.insertRule(
                    selector + "{" + propString + "}",
                    styleSheet.cssRules.length
                );
                sel2Id.set(selector, idx);
            }
        }

        /**
         * Delete properties for a specified selector
         * @param {string} selector - The selector, whose properties are deleted
         * @param {array} properties - Array of properties. e.g. ["color", "font-size"]
         */
        function deleteProp(selector, properties) {
            const idx = sel2Id.get(selector);
            properties.forEach(function eachProp(prop) {
                styleSheet.cssRules.item(idx).style.removeProperty(prop);
            });
        }

        return {
            deleteProp,
            setProp
        };
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
        cssHandler.setProp(selector, ["font-size: " + fontSize + "px"]);
        if (element.scrollWidth > elementClientW) {
            while (element.scrollWidth > elementClientW) {
                fontSize -= 1;
                cssHandler.setProp(selector, ["font-size: " + fontSize + "px"]);
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
        cssHandler.setProp(selector, ["overflow: hidden", "color: red"]);
        if (!element.startFontSize) {
            element.startFontSize = parseInt(
                computedStyles.fontSize.slice(0, -2),
                10
            );
        }
        interpolateOptimalFontSize(charge);
        cssHandler.deleteProp(selector, ["overflow", "color"]);
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
        cssHandler = makeCSSHandler(styleEl.sheet);
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
