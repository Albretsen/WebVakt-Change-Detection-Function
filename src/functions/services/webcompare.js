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
 * Represents a monitor with its comparison details.
 * 
 * @typedef {Object} Monitor
 * @property {number} MonitorID - The ID of the monitor.
 * @property {string} Selector - The CSS selector for the element.
 * @property {string} Type - The type of comparison ('text', 'attribute', 'style', 'children', 'custom').
 * @property {Array<string>} Attributes - The list of attributes to compare, relevant if Type is 'attribute'.
 * @property {*} Value - The expected value for the comparison.
 */

const puppeteer = require('puppeteer');

/**
 * Launches a Puppeteer browser and navigates to the specified URL.
 * @param {string} url - The URL to navigate to.
 * @returns {Promise<object>} - The Puppeteer page instance.
 */
async function navigateToPage(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    return { page, browser };
}

/**
 * Fetches details of a web element based on the provided monitor detail.
 * @param {object} page - The Puppeteer page instance.
 * @param {object} monitor - Detailed information for the monitor and comparison type.
 * @returns {Promise<object>} - An object containing the fetched element details.
 */
async function getElementDetails(page, monitor) {
    const { Selector, Type, Attributes } = monitor;
    return page.evaluate(({ Selector, Type, Attributes }) => {
        const evaluateElement = ({ element, Type, Attributes }) => {
            switch (Type) {
                case 'text':
                    return element.textContent || null;
                case 'attribute':
                    let attributesDetails = {};
                    Attributes.forEach(attr => {
                        let attrValue = element.getAttribute(attr);
                        if (attr === 'href' && attrValue) {
                            const anchor = document.createElement('a');
                            anchor.href = attrValue; // Converts to absolute URL
                            attrValue = anchor.href;
                        }
                        attributesDetails[attr] = attrValue;
                    });
                    return attributesDetails;
                case 'style':
                    const computedStyle = window.getComputedStyle(element);
                    return {
                        style: Array.from(computedStyle).reduce((acc, propName) => {
                            acc[propName] = computedStyle[propName];
                            return acc;
                        }, {})
                    };
                case 'children':
                    return {
                        children: Array.from(element.children).map(child => child.outerHTML).join('')
                    };
                case 'custom':
                    // Custom logic should be implemented here based on the specific requirements.
                    return {
                        custom: {} // Placeholder for custom logic
                    };
                default:
                    return {};
            }
        };

        const element = document.querySelector(Selector);
        if (!element) {
            return Type === 'text' ? null : {};
        }
        return evaluateElement({ element, Type, Attributes });
    }, { Selector, Type, Attributes });
}

/**
 * Compares web content against provided snapshot values using specified monitor details.
 * @param {string} url - The URL of the web page to check.
 * @param {Array<object>} monitors - An array of objects for comparison.
 * @returns {Promise<Array>} - An array of objects detailing detected changes.
 */
async function compareWebContent(url, monitors) {
    const { page, browser } = await navigateToPage(url);

    const comparisons = await Promise.all(monitors.map(async (monitor) => {
        const currentDetails = await getElementDetails(page, monitor);

        if (JSON.stringify(currentDetails) !== JSON.stringify(monitor.Value)) {
            return {
                MonitorID: monitor.MonitorID,
                WebsiteID: monitor.WebsiteID,
                UserID: monitor.UserID,
                Selector: monitor.Selector,
                Type: monitor.Type,
                Attributes: monitor.Attributes,
                SnapshotID: monitor.SnapshotID,
                Value: monitor.Value,
                changes: {
                    current: currentDetails,
                    expected: monitor.Value
                }
            };
        }
    }));

    await browser.close();
    return comparisons.filter(change => change !== undefined);
}

module.exports = compareWebContent;