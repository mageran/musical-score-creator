//exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);


const {dialogflow} = require('actions-on-google');

const {
  dialogflow,
  Permission,
  Suggestions,
} = require('actions-on-google');

app.intent('Default Welcome Intent', (conv) => {
  conv.ask(new Permission({
    context: 'Hi there, to get to know you better',
    permissions: 'NAME'
  }));
});
