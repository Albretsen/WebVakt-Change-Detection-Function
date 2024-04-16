// func host start --watch
const { app } = require('@azure/functions');
const compareWebContent = require('./webcompare');

const externalServerURL = 'https://webvakt-app-service.azurewebsites.net/api/task';

app.http('check', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            context.log(`HTTP function processed request for URL "${request.url}"`);

            const { WebsiteURL, Monitors } = await request.json();

            const changesDetected = await compareWebContent(WebsiteURL, Monitors);

            let response = JSON.stringify({
                message: "Changes detected successfully.",
                changes: changesDetected
            })

            const fetch = (await import('node-fetch')).default;

            const externalResponse = await fetch(externalServerURL, {
                method: 'POST', 
                body: response, 
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!externalResponse.ok) { 
                context.log(`External server error: Status ${externalResponse.status}`);
                return {
                    body: JSON.stringify({
                        message: "External server error."
                    }),
                    status: 500
                };
            }

            context.log(`External server responded with OK.`);
            return {
                body: response,
                status: 200 
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