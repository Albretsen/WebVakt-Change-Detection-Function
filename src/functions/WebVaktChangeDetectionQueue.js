const { app } = require('@azure/functions');
const compareWebContent = require('./services/webcompare');

const externalServerURL = 'https://webvakt-app-service.azurewebsites.net/api/task';

app.storageQueue('checkQueueTrigger', {
    connection: 'AzureWebJobsStorage', 
    queueName: 'monitor-tasks', 
    handler: async (message, context) => {
        try {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

            let parsedMessage = message;
            if (typeof message === 'string') {
                parsedMessage = JSON.parse(message);
            }

            context.log(`Queue trigger function processed snapshot JSON.stringify(parsedMessage): ${message}`);
            context.log(`Queue trigger function processed snapshot JSON.stringify(parsedMessage): ${JSON.stringify(parsedMessage)}`);
            context.log(`Queue trigger function processed snapshot parsedMessage: ${parsedMessage}`);
            context.log(`Queue trigger function processed snapshot JSON.stringify(parsedMessage.SnapshotID): ${JSON.stringify(parsedMessage.SnapshotID)}`);
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
        } catch (error) {
            context.log(`Error: ${error.message}`);
            throw error; 
        }
    }
});
