const { app } = require('@azure/functions');
const compareContent = require('./services/webcompare')

app.http('check', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            context.log(`Http function processed request for url "${request.url}"`);

            const { target, selectors } = await request.json();

            const differences = await detectChanges(target, selectors);

            return { body: JSON.stringify(differences) };
        } catch (error) {
            return {
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                })
            }
        }
    }
});

/**
 * Detects changes in web elements for a given URL based on an array of SelectorDetails.
 * 
 * @param {string} target - The URL of the target web page.
 * @param {Array<SelectorDetail>} selectorDetails - Configuration array containing detailed selector information.
 * @returns {Promise<Array>} - An array of change objects with details for each detected change.
 */
async function detectChanges(target, selectorDetails) {
    const detectedChanges = await compareContent(target, selectorDetails);

    const currentTime = new Date().toISOString();
    return detectedChanges.map((change) => ({
        SelectorID: selectorDetails.find(sd => sd.selector === change.selector).SelectorID,
        Original: change.changes.expected,
        Current: change.changes.current,
        DetectedChange: `Change detected in ${change.selector}`,
        Timestamp: currentTime
    }));
}

// [{
//     "SelectorID": 1,
//     "WebsiteID": 1,
//     "UserID": 1,
//     "SelectorString": "body > center > table > tbody > tr:nth-child(1) > td:nth-child(1) > ul > li > a",
//     "Attribute": "textContent",
//     "SnapshotValue": "A Message from Warren E. Buffett",
//     "LastCheckDate": "2023-01-01",
// }, {
//     "SelectorID": 2,
//     "WebsiteID": 1,
//     "UserID": 1,
//     "SelectorString": "body > center > table > tbody > tr:nth-child(1) > td:nth-child(1) > ul > li > a",
//     "Attribute": "href",
//     "SnapshotValue": "https://www.berkshirehathaway.com/message.html",
//     "LastCheckDate": "2023-01-01",
// }]