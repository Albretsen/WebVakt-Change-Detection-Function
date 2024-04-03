/**
 * Web Element Comparison Tool
 * 
 * This script allows for comparing web elements against snapshot values to detect changes.
 * Different comparison types are supported to cover various aspects of web elements:
 * 
 * - 'text': Compares the text content of an element.
 *   Example: Comparing the text of a <p> tag to see if it has been updated.
 * 
 * - 'attribute': Compares one or more attributes of an element.
 *   Example: Checking if the 'src' attribute of an <img> tag has changed to a different URL.
 * 
 * - 'style': Compares the computed style of an element.
 *   Example: Detecting changes in the 'color' or 'font-size' CSS properties of an element.
 * 
 * - 'children': Compares the child elements of a parent element, looking at the structure and content.
 *   Example: Checking if new <li> items have been added to or removed from a <ul> list.
 * 
 * - 'custom': Allows for custom comparison logic, suitable for complex or specific needs.
 *   Example: Custom logic to compare data-bound attributes or JavaScript-generated content.
 * 
 * Each comparison type provides a targeted approach to detecting changes, offering flexibility
 * and precision for monitoring web content modifications.
 * 
 * Copyright (c) Asgeir Albretsen, 2023
 */


/**
 * Represents a selector with its comparison details.
 * 
 * @typedef {Object} SelectorDetail
 * @property {string} selector - The CSS selector for the element.
 * @property {string} comparisonType - The type of comparison ('text', 'attribute', 'style', 'children', 'custom').
 * @property {Array<string>} attributes - The list of attributes to compare, relevant if comparisonType is 'attribute'.
 * @property {*} snapshotValue - The expected value for the comparison.
 */

const puppeteer = require('puppeteer');

/**
 * Fetches details of a web element based on the provided SelectorDetail.
 * 
 * @param {object} page - The Puppeteer page instance.
 * @param {SelectorDetail} selectorDetail - The detailed information for selector and comparison.
 * @returns {Promise<object>} - An object containing the fetched element details.
 */
async function fetchElementDetails(page, selectorDetail) {
    return page.evaluate(({ selector, comparisonType, attributes }) => {
        const element = document.querySelector(selector);
        if (!element) return {};

        let details = {};
        switch (comparisonType) {
            case 'text':
                details['text'] = element.textContent || null;
                break;
            case 'attribute':
                attributes.forEach(attr => {
                    let attrValue = element.getAttribute(attr);
                    if (attr === 'href' && attrValue) {
                        const anchor = document.createElement('a');
                        anchor.href = attrValue;  // Converts to absolute URL
                        attrValue = anchor.href;
                    }
                    details[attr] = attrValue;
                });
                break;
            case 'style':
                const computedStyle = window.getComputedStyle(element);
                details['style'] = Array.from(computedStyle).reduce((acc, propName) => {
                    acc[propName] = computedStyle[propName];
                    return acc;
                }, {});
                break;
            case 'children':
                details['children'] = Array.from(element.children).map(child => child.outerHTML).join('');
                break;
            case 'custom':
                details['custom'] = {}; // Placeholder for custom logic
                break;
        }
        return details;
    }, selectorDetail);
}

/**
 * Compares web content against provided snapshot values using specified SelectorDetails.
 * 
 * @param {string} url - The URL of the web page to check.
 * @param {Array<SelectorDetail>} selectorDetails - An array of SelectorDetail objects for comparison.
 * @returns {Promise<Array>} - An array of objects detailing detected changes.
 */
async function compareContent(url, selectorDetails) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const comparisons = await Promise.all(selectorDetails.map(async (selectorDetail) => {
        const details = await fetchElementDetails(page, selectorDetail);

        if (JSON.stringify(details) !== JSON.stringify(selectorDetail.snapshotValue)) {
            return {
                url,
                selector: selectorDetail.selector,
                changes: {
                    current: details,
                    expected: selectorDetail.snapshotValue
                }
            };
        }
    }));

    await browser.close();
    return comparisons.filter(comp => comp !== undefined);
}

module.exports = compareContent;