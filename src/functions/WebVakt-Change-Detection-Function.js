// func host start --watch
const { app } = require('@azure/functions');
const compareWebContent = require('./services/webcompare');

app.http('check', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            context.log(`Http function processed request for url "${request.url}"`);

            const { WebsiteURL, Monitors } = await request.json();

            const differences = await detectChanges(WebsiteURL, Monitors);

            return { body: JSON.stringify(differences) };
        } catch (error) {
            return {
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                })
            };
        }
    }
});

/**
 * Detects changes in web elements for a given URL based on an array of Monitors.
 * 
 * @param {string} target - The URL of the target web page.
 * @param {Array<Monitor>} monitors - Array containing monitor details.
 * @returns {Promise<Array>} - An array of change objects with details for each detected change.
 */
async function detectChanges(WebsiteURL, monitors) {
    const detectedChanges = await compareWebContent(WebsiteURL, monitors);

    const currentTime = new Date().toISOString();
    return detectedChanges.map((change) => ({
        MonitorID: change.MonitorID,
        WebsiteID: change.WebsiteID,
        UserID: change.UserID,
        SelectorString: change.Selector,
        Attribute: change.Type,
        SnapshotValue: change.Value,
        LastCheckDate: currentTime
    }));
}