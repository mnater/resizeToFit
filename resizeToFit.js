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
    const charges = [];
    let cssHandler = null;
    const resizedSelectors = new Map();

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
        const currentFontSize = resizedSelectors.has(selector)
            ? resizedSelectors.get(selector)
            : el.originalFontSize;
        cssHandler.setProp(
            selector,
            ["overflow: hidden", "display: block", "font-size: " + el.originalFontSize + "px"]
        );
        const fontSize = Math.min(
            Math.min(
                el.clientWidth / el.scrollWidth * el.originalFontSize,
                el.originalFontSize
            ),
            currentFontSize
        );
        resizedSelectors.set(selector, fontSize);
        cssHandler.setProp(selector, ["font-size: " + fontSize + "px"]);
        cssHandler.deleteProp(selector, ["overflow", "display"]);
    }

    /**
     * Resize each element.
     * @returns {undefined}
     */
    function resize() {
        resizedSelectors.clear();
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
        const styleEl = document.createElement("style");
        styleEl.id = "resizeToFit_Styles";
        styleEl.type = "text/css";
        document.head.appendChild(styleEl);
        cssHandler = makeCSSHandler(styleEl.sheet);
        selectors.forEach(function eachSelector(selector) {
            const nodeList = document.querySelectorAll(selector);
            nodeList.forEach(function eachElement(element) {
                const computedStyles = window.getComputedStyle(element);
                const elementCurrentFontSize = parseFloat(
                    computedStyles.fontSize
                );
                if (!element.originalFontSize) {
                    element.originalFontSize = elementCurrentFontSize;
                }
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
