const { app } = require('@azure/functions');
const PageDifferenceChecker = require('./services/difference')

app.http('check', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const { target, userId } = await request.json();

        const selectors = await getSelectors(target, userId);

        const differences = await PageDifferenceChecker.findDifferences(target, selectors);

        return { body: `Hello, ${JSON.stringify(differences)}!` };
    }
});

const getSelectors = async (target, userId) => {
    return [{
        "SelectorID": 1,
        "WebsiteID": 1,
        "UserID": 1,
        "SelectorString": "body > center > table > tbody > tr:nth-child(1) > td:nth-child(1) > ul > li > a",
        "Attribute": "textContent",
        "SnapshotValue": "A Message from Warren E. Buffett",
        "LastCheckDate": "2023-01-01",
    }, {
        "SelectorID": 2,
        "WebsiteID": 1,
        "UserID": 1,
        "SelectorString": "body > center > table > tbody > tr:nth-child(1) > td:nth-child(1) > ul > li > a",
        "Attribute": "href",
        "SnapshotValue": "https://www.berkshirehathaway.com/message.html",
        "LastCheckDate": "2023-01-01",
    }]
}