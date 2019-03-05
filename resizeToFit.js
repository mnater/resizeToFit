/**
 * @license resizeToFit 0.2.0-devel - Resize text until it fits to its container.
 * ©2019  Mathias Nater, Zürich (mathiasnater at gmail dot com)
 * https://github.com/mnater/resizeToFit
 *
 * Released under the MIT license
 * http://mnater.github.io/resizeToFit/LICENSE
 */

window.resizeToFit = (function makeResizeToFit() {
    "use strict";

    // Storage for elements to be fitted
    const charges = [];

    // The cssHandler-object, created by init()
    let cssHandler = null;

    // Map from selectors to current font-size
    const resizedSelectors = new Map();

    /**
     * Factory for a CSS handling object
     * @param {CSSStyleSheet} styleSheet - An existing CSSOM styleSheet
     */
    function makeCSSHandler(styleSheet) {
        // Map selectors to rule-IDs
        const sel2Id = new Map();

        /**
         * Creates or changes a CSS rule.
         * @param {string} selector - The selector, where the properties are added to
         * @param {array} properties - Array of properties. e.g. ["color: red", "font-size: 12px"]
         */
        function setProp(selector, properties) {
            if (sel2Id.has(selector)) {
                // Add to existing rule
                const idx = sel2Id.get(selector);
                properties.forEach(function eachProp(prop) {
                    const propNameValue = prop.split(":");
                    const propName = propNameValue[0].trim();
                    const propValue = propNameValue[1].trim();
                    styleSheet.cssRules.item(idx).style.setProperty(
                        propName,
                        propValue
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
     * Resize font-size of the element
     * @param {DOMElement} el - The element whose text is to be resized
     * @param {string} selector - The selector that found this element
     * @returns {undefined}
     */
    function resizeContent(el, selector) {
        // Previously calculated font-size for the same selector are stored in the `resizedSelectors`-Map.
        const currentFontSize = resizedSelectors.has(selector)
            ? resizedSelectors.get(selector)
            : el.originalFontSize;

        // Set properties to get accurate results for clientWidth and scrollWidth
        cssHandler.setProp(
            selector,
            ["overflow: hidden", "display: block", "font-size: " + el.originalFontSize + "px"]
        );

        /*
         * Calculate the font-size proportionally to clientWidth and scrollWidth
         * but don't grow bigger than originalFontSize or currentFontSize
         */
        const fontSize = Math.min(
            Math.min(
                el.clientWidth / el.scrollWidth * el.originalFontSize,
                el.originalFontSize
            ),
            currentFontSize
        );

        // Store font-size for this selector
        resizedSelectors.set(selector, fontSize);

        // Set font-size for that element
        cssHandler.setProp(selector, ["font-size: " + fontSize + "px"]);

        // Remove properties needed for calculation, restoring original values
        cssHandler.deleteProp(selector, ["overflow", "display"]);
    }

    /**
     * Resize each element previously collected by init
     * @returns {undefined}
     */
    function resize() {
        // Clear the map that stores current font-sizes for selectors
        resizedSelectors.clear();
        // Call resizeContent() for each element in charges
        charges.forEach(function eachCharge(charge) {
            resizeContent(charge[0], charge[1]);
        });
    }

    /**
     * Create a styleSheet and collect all elements. Then call resize().
     * @param {array} selectors - An array of selectors that need to be resized
     * @returns {undefined}
     */
    function init(selectors) {
        // Let's create a new style sheet where we put the styles
        const styleEl = document.createElement("style");
        styleEl.id = "resizeToFit_Styles";
        styleEl.type = "text/css";
        document.head.appendChild(styleEl);

        // Create cssHandler to easily manipulate the style sheet
        cssHandler = makeCSSHandler(styleEl.sheet);

        // Find all elements according to user provided selectors
        selectors.forEach(function eachSelector(selector) {
            const nodeList = document.querySelectorAll(selector);
            nodeList.forEach(function eachElement(element) {
                // Save original font-size to each element object
                const computedStyles = window.getComputedStyle(element);
                const elementCurrentFontSize = parseFloat(
                    computedStyles.fontSize
                );
                element.originalFontSize = elementCurrentFontSize;
                // Save each element and its selector in the `charges` array
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
