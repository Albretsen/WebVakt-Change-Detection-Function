const puppeteer = require('puppeteer');

class PageDifferenceChecker {
    static async setupBrowser() {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
    }

    static async getElementAttribute(selectorString, attribute, baseUrl) {
        return this.page.evaluate((selector, attr, base) => {
            const element = document.querySelector(selector);
            let value = null;
            if (element) {
                if (attr === 'href' && element.href) {
                    value = new URL(element.href, base).href; // Normalize href
                } else if (element[attr]) {
                    value = element[attr];
                } else {
                    value = element.getAttribute(attr);
                }
            }
            return value;
        }, selectorString, attribute, baseUrl);
    }

    static async findDifferences(target, selectors) {
        await this.setupBrowser();
        await this.page.goto(target, { waitUntil: 'networkidle0' });

        const differences = [];
        const targetURL = new URL(target);
        const now = new Date();

        for (const selector of selectors) {
            const { SelectorString, Attribute, SnapshotValue } = selector;
            const currentValue = await this.getElementAttribute(SelectorString, Attribute, targetURL.origin);

            if (currentValue !== SnapshotValue) {
                differences.push({
                    ...selector,
                    SnapshotValue: currentValue, 
                    LastCheckDate: now.toISOString(), 
                });
            } else {
                differences.push({
                    ...selector,
                    LastCheckDate: now.toISOString(), 
                });
            }
        }

        await this.browser.close();
        return differences;
    }
}

module.exports = PageDifferenceChecker;
