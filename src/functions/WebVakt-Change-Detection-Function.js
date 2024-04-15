// func host start --watch
const { app } = require('@azure/functions');
const compareWebContent = require('./services/webcompare');

app.http('check', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
          context.log(`HTTP function processed request for URL "${request.url}"`);

            const { WebsiteURL, Monitors } = await request.json();

            const changesDetected = await compareWebContent(WebsiteURL, Monitors);

            return {
                body: JSON.stringify({
                    message: "Changes detected successfully.",
                    changes: changesDetected
                })
            };
        } catch (error) {
            context.log(`Error: ${error.message}`);
            return {
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                }),
                status: 500
            };
        }
    }
});