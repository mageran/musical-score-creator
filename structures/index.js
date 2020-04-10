'use strict';

const dialogflowPackage = 'dialogflow-fulfillment';
const actionsOnGooglePackage = 'actions-on-google';

const functions = require('firebase-functions');
const {WebhookClient} = require(dialogflowPackage);
const {Card, Suggestion, BasicCard, Image, Button, Carousel, dialogflow, navigator} = require(dialogflowPackage);
const {Table} = require(actionsOnGooglePackage);
const {Suggestions} = require(actionsOnGooglePackage);
const {mysql} = require('mysql');
var compose_1 ='';
var counter=0;
var scenarioType = 0;
console.log(`******************* scenarioType set to  ${scenarioType}...`);
var level = 1;
var songPath='';
var repeat=false;
var test=false;
var save=false;
var userName='';
//const app = dialogflow();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
//exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  // initialise DB connection
  const admin = require('firebase-admin');
  try {
	  admin.initializeApp({
    	credential: admin.credential.applicationDefault(),
    	databaseURL: 'ws:https://musicninja-25923.firebaseio.com/',
  	  });
  } catch (err) {
    console.log(`ignored error initializing firebase database: ${err}`);
  }
  
  console.log(`******************* entering webhook: scenarioType is ${scenarioType}`);

  
  /**
   * Helper function to get the image url for a note
   */
  function _getNoteImageUrl(note, clef = 'treble', octave = 4) {
    //const urlprefix = 'http://localhost:5001/musicninja-25923/us-central1';
    const urlprefix = 'https://us-central1-musicninja-25923.cloudfunctions.net';
    //const urlprefix = 'https://us-central1-file-hosting-13205.cloudfunctions.net';
    const noteUrl= `${urlprefix}/app/api/note?note=${note}&clef=${clef}&octave=${octave}`;
 	return noteUrl;
  }

  function handleSong(agent) {
    const name = agent.parameters.songName;
    agent.add("Thank you...");
    return admin.database().ref('songName').once("value").then((snapshot) => {
      var contentOfMusic = snapshot.child("song1").val();
      agent.add("content" + contentOfMusic);
    });
  }
    
  function addSong(agent){
  	
    const newSongName = agent.parameters.songName;
    var compose = compose_1;
    var composerName = "yuksel";
    
    admin.database().ref('songName/' + newSongName).set({
      compose: compose,
      composerName: composerName,
    });
  	agent.add("Song is saved Succesfully");
  }
    
  function deleteSong(agent){

    const newSongName = agent.parameters.songName;
    var compose = compose_1;
    var composerName = "yuksel";
    admin.database().ref('songName/' + newSongName).remove();
    agent.add("Song is deleted Succesfully");
  }
    
  function welcome(agent) {
    const conv = agent.conv();
    console.log(JSON.stringify(conv, null, 2));
    compose_1 ='';
    counter=0;
    scenarioType = 0;
    console.log(`******************* scenarioType set to  ${scenarioType}...`);
    level = 1;
    songPath='';
    repeat=false;
    test=false;
    //conv.user.storage.scenarioType = 0;
    conv.ask("Welcome to MusicNinja. How can I help you?");
    conv.ask(new Suggestions(['Create a song']));
    agent.add(conv);
  }
 
  function getUserName(agent){
  	userName = agent.parameters.userName;
  	//agent.add("Hi"+userName+"How can I help you?");
    agent.add("yuksel");
  }
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function random(agent) {
    var rand = Math.random()*3 + 1;
    if(rand==1)
	return 'a';
    if(rand==2)
	return 'b';
    if(rand==3)
	return 'c';
    if(rand==4)
	return 'd';
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
    const noteUrl= _getNoteImageUrl(noteType);
  	agent.add('Here is a picture of note ' + noteType);
	agent.add(new Card({
			  title: noteType,
              imageUrl: noteUrl,
              text: 'picture of ' + noteType,
              buttonText: 'This is a button',
              buttonUrl: 'https://assistant.google.com/'
     }));
  }
  
  function listenNotes(agent){
    var noteUrl = agent.parameters.noteType;
    var str = 'test'+noteUrl;
    var n = str.length;
    var noteName = str.charAt(n-2).toLowerCase();
    //agent.add("Okay,Try to listen carefully!");
    const notePictureUrl = _getNoteImageUrl(noteName);
    agent.add(new Card({
			  title: noteName,
              imageUrl: notePictureUrl,
              text: 'picture of '+noteName,
              buttonText: 'This is a button',
              buttonUrl: 'https://assistant.google.com/'
        
    }));
    agent.add('<speak> Okay, listen carefully! <audio src=' + noteUrl + '></audio></speak>');
    
  }
  
  function createComposition(agent){
    //add names in later
    const conv = agent.conv();
    agent.add("Okay I am ready!");
    compose_1='';
    songPath='';
    scenarioType = 1;
    console.log(`******************* scenarioType set to  ${scenarioType}...`);
    //conv.user.storage.scenarioType = 1;
    agent.add("If you want to test your song,just say test it!");
  }
  function finish(agent){
  	scenarioType = 0;
    save=true;
    agent.add("Do you want to save it?"); // go to Yes/No intent
    //Do you want to listen it?  in later
    
  }
  function getNote(agent){
    const conv = agent.conv();
    //const _scenarioType = conv.user.storage.scenarioType;
    agent.add("scenario :" + scenarioType);
    console.log(JSON.stringify(conv, null, 2));
    if(scenarioType == 1){
    	var noteType = agent.parameters.noteType;
    	compose_1 = compose_1 + noteType;
    	//agent.add("compose_1 :"+compose_1);
    	//displayBoard(agent,compose_1);
        //var notePictureUrl= 'http://localhost:5001/musicninja-25923/us-central1/app/api/note?note='+compose_1+'&clef=treble&octave=4';
        var notePictureUrl = _getNoteImageUrl(compose_1);
        agent.add(new Card({
            title: 'SongName',//compose
            imageUrl: notePictureUrl,
            text: 'Test',
            buttonText: 'TestButton',
            buttonUrl: 'https://assistant.google.com/'
        }));
    }
   
    if(scenarioType == 2){
    	displayBoard(agent,compose_1);
        //var counter=0;
        var noteType2 =""+ agent.parameters.noteType;
        if(noteType2==compose_1[counter] && counter<compose_1.length){
        	counter++;
            //displayBoard(agent,compose_1);
            if(counter >= compose_1.length){
            	agent.add("Super, You completed the quiz!");
                scenarioType = 0;
				console.log(`******************* scenarioType set to  ${scenarioType}...`);
                //conv.user.storage.scenarioType = 0;
                counter = 0;
            }else{
            	agent.add("Correct Choice,What is name of note: "+ (counter+1) );
            }
        }else{
              agent.add("Wrong Choice! What is name of note: "+ (counter+1)); // ask that user wants to go learn scenario
        }
    }
  }
    
  function createSongPath(agent, compose, songPath, tmp){
    var pianoNote = '"https://storage.googleapis.com/musicninja-25923.appspot.com/PianoNotes/';
    var pianoNote2= '4vH.wav"';
    songPath += '<audio src=' + pianoNote+ compose[tmp].toUpperCase() + pianoNote2+ '></audio>' ;
    //agent.add('<speak> <audio src=' + pianoNote+ compose_1[counter].toUpperCase() + pianoNote2+ '></audio></speak>');
    //agent.add("pianoNote:"+pianoNote+ compose_1[i] + pianoNote2);
    return songPath;
  }
    
  function displayBoard(agent,compose){
    var notePictureUrl= 'http://localhost:5001/musicninja-25923/us-central1/app/api/note?note='+compose+'&clef=treble&octave=4';
    agent.add(new Card({
        
    	title: 'SongName',//compose
        imageUrl: notePictureUrl,
        text: 'Test',
        buttonText: 'TestButton',
        buttonUrl: 'https://assistant.google.com/'
        
    }));
    var tmp=0;
    if(repeat == false && test == false ){
      for(var i = 0;i<compose.length;i++){
        songPath = createSongPath(agent, compose, songPath, tmp);
        tmp++;
      }
    }
    //myMusicList.push(songPath);
    //counter=0;
  }

  function makeQuiz(agent){
    const conv = agent.conv();
    scenarioType = 2;
    console.log(`******************* scenarioType set to  ${scenarioType}...`);
    //conv.user.storage.scenarioType = 2;
    counter = 0;
    repeat = false;
    //var level = 1; // in later..
    compose_1 = '';
    agent.add("Pay attention here!");
    for(var i = 0;i<level;i++) {
    	compose_1 = compose_1 + 'abcd';//random(agent);
    }
    displayBoard(agent,compose_1);
    agent.add('<speak>'+songPath+'If you want to listen again,just say repeat.What is name of note:1'+'</speak>');
  }
  function testSong(agent){
    const conv = agent.conv();
    //const scenarioType = conv.user.storage.scenarioType;
        if(scenarioType==1){
        	test=true;
            var notePictureUrl= _getNoteImageUrl(compose_1);
            agent.add(new Card({
                title: 'SongName',//compose
                imageUrl: notePictureUrl,
                text: 'Test',
                buttonText: 'TestButton',
                buttonUrl: 'https://assistant.google.com/'
            }));
          	var tmp=0;
           	for(var i = 0;i<compose_1.length;i++){
            	songPath = createSongPath(agent,compose_1,songPath,tmp);
            	tmp++;
            }
    		agent.add(`<speak>${songPath}</speak>`);
    	}
  	test=false;
  }
  function listenAgain(agent){
    const conv = agent.conv();
    //const scenarioType = conv.user.storage.scenarioType;
    if(scenarioType == 2){
        repeat=true;
        displayBoard(agent,compose_1);
    	agent.add('<speak>'+songPath+'If you want to listen again,just say repeat.What is name of note: '+(counter+1)+'</speak>');
    }
    repeat=false;
  }

  function getMedia(constraints) {
    let stream = null;

    try {
      stream = agent.mediaDevices.getUserMedia(constraints);
      /* use the stream */
    }catch(err) {
      /* handle the error */
    }
  }
  function answers(agent){
  	var answer = agent.parameters.answer;
	if(answer == "yes"){
    	save=true;
      	agent.add("for saving just say: Save and the name of compose");
    }else
      save=false;
  } 
  function showTable(agent){
    const conv = agent.conv();
  	//agent.add("YK");
    conv.ask("YK");
    conv.ask(new Table({
  		dividers: true,
  		columns: ['header 1', 'header 2', 'header 3'],
        rows: [
          {
            cells: ['row 1 item 1', 'row 1 item 2', 'row 1 item 3'],
            dividerAfter: false,
          },
          {
            cells: ['row 2 item 1', 'row 2 item 2', 'row 2 item 3'],
            dividerAfter: true,
          },
          {
            cells: ['row 3 item 1', 'row 3 item 2', 'row 3 item 3'],
          },
        ],
	})
    );
    agent.add(conv);
  }

  //var mediaDevices = navigator.mediaDevices;
  /*
  function recordAudio(agent){
    
    agent.add("yuksel");
    
    agent.mediaDevices.getUserMedia({audio: true,  
        video:false}).then(function(stream) {
       agent.add("deneme"+stream);
    }).catch(function(err) {
      agent.add("Record Problem!");
    });
    
    
  }*/
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('random', random);
  intentMap.set('Show Note', showNote);
  intentMap.set('Listen Notes', listenNotes);
  intentMap.set('Create Composition', createComposition);
  intentMap.set('Create Composition/getNote', getNote);
  intentMap.set('Make Quiz', makeQuiz);
  intentMap.set('ListenAgain', listenAgain);
  intentMap.set('Finish', finish);
  intentMap.set('TestSong', testSong);
  intentMap.set('Show MusicList', showTable);
  intentMap.set('SaveMusic', addSong);
  intentMap.set('Yes/No', answers);
  intentMap.set('DeleteMusic', deleteSong);
  //intentMap.set('getUserName',getUserName);
  //intentMap.set('',handleSong);
  //intentMap.set('Make Quiz',recordAudio);
  agent.handleRequest(intentMap);
  
});

