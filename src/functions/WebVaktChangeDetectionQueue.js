const { app } = require('@azure/functions');
const compareWebContent = require('./services/webcompare');

const externalServerURL = 'https://localhost:7114/api/task';

app.storageQueue('checkQueueTrigger', {
    connection: 'AzureWebJobsStorage', 
    queueName: 'monitor-tasks', 
    handler: async (message, context) => {
        try {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

            // Assume message might already be an object
            let parsedMessage = message;
            // If message is a string, try to parse it as JSON
            if (typeof message === 'string') {
                parsedMessage = JSON.parse(message);
            }

            context.log(`Queue trigger function processed snapshot: ${JSON.stringify(parsedMessage.SnapshotID)}`);
            const { WebsiteURL, Monitors } = parsedMessage;
            const changesDetected = await compareWebContent(WebsiteURL, Monitors);

            let response = JSON.stringify({
                message: "Changes detected successfully.",
                changes: changesDetected
            });

            const fetch = (await import('node-fetch')).default;

            context.log(response);

            const externalResponse = await fetch(externalServerURL, {
                method: 'POST', 
                body: response, 
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!externalResponse.ok) {
                context.log(`External server error: Status ${externalResponse.status}`);
                throw new Error(`External server error: Status ${externalResponse.status}`);
            }

            context.log(`External server responded with OK.`);
        } catch (error) {
            context.log(`Error: ${error.message}`);
            throw error; 
        }
    }
});
