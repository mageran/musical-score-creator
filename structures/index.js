'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion, BasicCard, Image, Button, Carousel, dialogflow} = require('dialogflow-fulfillment','actions-on-google');
var compose_1 ='';
//const app = dialogflow();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
//exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to MusicNinja. How can I help you?`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function random(agent) {
      var number = Math.floor(Math.random() * 6) + 1;
      agent.add(`Here's your random number `+number);
  }
  const noteImageMap = {
    'd': {
      title: 'Indigo Taco',
      text: 'Indigo Taco is a subtle bluish tone.',
      image: {
        url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDN1JRbF9ZMHZsa1k/style-color-uiapplication-palette1.png',
        accessibilityText: 'Indigo Taco Color',
      },
      display: 'WHITE',
    },
  };
  function showNote(agent){
      const noteType = agent.parameters.noteType;
      //let conv=agent.conv();
      var noteUrl= 'http://localhost:5001/musicninja-25923/us-central1/app/api/note?note='+noteType+'&clef=treble&octave=4';
  	  agent.add('Here is a picture of note ' + noteType);
	  agent.add(new Card({
        
			  title: noteType,
              imageUrl: noteUrl,
              text: 'picture of '+noteType,
              buttonText: 'This is a button',
              buttonUrl: 'https://assistant.google.com/'
        
      }));
  }
  
  function listenNotes(agent){
  	var noteUrl = agent.parameters.videoType;
    var str = 'test'+noteUrl;
    var n = str.length;
    var noteName = str.charAt(n-2).toLowerCase();
    //agent.add("Okay,Try to listen carefully!");
    var notePictureUrl= 'http://localhost:5001/musicninja-25923/us-central1/app/api/note?note='+noteName+'&clef=treble&octave=4';
    agent.add(new Card({
        
			  title: noteName,
              imageUrl: notePictureUrl,
              text: 'picture of '+noteName,
              buttonText: 'This is a button',
              buttonUrl: 'https://assistant.google.com/'
        
    }));
    agent.add('<speak> Okay,Try to listen carefully! <audio src=' + noteUrl + '></audio></speak>');
    
  }
  
  function createComposition(agent){
    //add names in future
  	agent.add("Okay I am ready to help! The balls in your court");
    compose_1='';
  }
  
  function createCompositiongetNote(agent){
    //agent.add("HelloA!");
  	var noteType = agent.parameters.noteType;
    compose_1 = compose_1 + noteType;
    agent.add("compose_1 :"+compose_1);
    displayBoard(agent);
  }
  
  function displayBoard(agent){
    var notePictureUrl= 'http://localhost:5001/musicninja-25923/us-central1/app/api/note?note='+compose_1+'&clef=treble&octave=4';
    agent.add(new Card({
        
			  title: 'SongName',
              imageUrl: notePictureUrl,
              text: 'Test',
              buttonText: 'TestButton',
              buttonUrl: 'https://assistant.google.com/'
        
    }));
    var pianoNote = '"https://storage.googleapis.com/musicninja-25923.appspot.com/PianoNotes/';
    var pianoNote2= '4vH.wav"';
    for(var i =0;i<compose_1.length;i++){
    	agent.add('<speak> <audio src=' + pianoNote+ compose_1[i].toUpperCase() + pianoNote2+ '></audio></speak>');
        agent.add('<speak>This is a sentence with a <break time="6000s"/> pause</speak>');
      	//agent.add("pianoNote:"+pianoNote+ compose_1[i] + pianoNote2);
    }  
  }
  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('random',random);
  intentMap.set('Show Note',showNote);
  intentMap.set('Listen Notes',listenNotes);
  intentMap.set('Create Composition',createComposition);
  intentMap.set('Create Composition/getNote',createCompositiongetNote);
  agent.handleRequest(intentMap);
  
});


/*

// Enter your calendar ID and service account JSON below.
const calendarId = '<INSERT CALENDAR ID HERE>'; // Example: 6ujc6j6rgfk02cp02vg6h38cs0@group.calendar.google.com
const serviceAccount = {}; // The JSON object looks like: { "type": "service_account", ... }

// Set up Google Calendar service account credentials
const serviceAccountAuth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
process.env.DEBUG = 'dialogflow:*'; // It enables lib debugging statements

const timeZone = 'America/Los_Angeles';  // Change it to your time zone
const timeZoneOffset = '-07:00';         // Change it to your time zone offset

function createCalendarEvent (dateTimeStart, dateTimeEnd) {
  return new Promise((resolve, reject) => {
    calendar.events.list({  // List all events in the specified time period
      auth: serviceAccountAuth,
      calendarId: calendarId,
      timeMin: dateTimeStart.toISOString(),
      timeMax: dateTimeEnd.toISOString()
    }, (err, calendarResponse) => {
      // Check if there exists any event on the calendar given the specified the time period
      if (err || calendarResponse.data.items.length > 0) {
        reject(err || new Error('Requested time conflicts with another appointment'));
      } else {
        // Create an event for the requested time period
        calendar.events.insert({ auth: serviceAccountAuth,
          calendarId: calendarId,
          resource: {summary: 'Bike Appointment',
            start: {dateTime: dateTimeStart},
            end: {dateTime: dateTimeEnd}}
        }, (err, event) => {
          err ? reject(err) : resolve(event);
        }
        );
      }
    });
  });
}
*/
/*
function makeAppointment (agent) {
    // Use the Dialogflow's date and time parameters to create Javascript Date instances, 'dateTimeStart' and 'dateTimeEnd',
    // which are used to specify the appointment's time.
    const appointmentDuration = 1;// Define the length of the appointment to be one hour.
    const dateTimeStart = convertParametersDate(agent.parameters.date, agent.parameters.time);
    const dateTimeEnd = addHours(dateTimeStart, appointmentDuration);
    const appointmentTimeString = getLocaleTimeString(dateTimeStart);
    const appointmentDateString = getLocaleDateString(dateTimeStart);
    // Check the availability of the time slot and set up an appointment if the time slot is available on the calendar
    return createCalendarEvent(dateTimeStart, dateTimeEnd).then(() => {
      agent.add(`Got it. I have your appointment scheduled on ${appointmentDateString} at ${appointmentTimeString}. See you soon. Good-bye.`);
    }).catch(() => {
      agent.add(`Sorry, we're booked on ${appointmentDateString} at ${appointmentTimeString}. Is there anything else I can do for you?`);
    });
  }*/
