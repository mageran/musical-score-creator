'use strict';

const { dialogflow, Suggestions, BasicCard, Image, SimpleResponse } = require('actions-on-google');
const functions = require('firebase-functions');

const { Intents, Contexts, NoteNames, NoteLengths, FullNoteLengthInSeconds, QuizSettings } = require('./config');

const { Database, SongDatabase } = require('./database');

const app = dialogflow({debug: true});

class Fulfillment {

  constructor() {
    this.db = new SongDatabase();
  }

  /**
   * Helper function to get the image url for a note
   */
  getNotesImageUrl(notes, clef = 'treble', octave = 4) {
    //const urlprefix = 'http://localhost:5001/musicninja-25923/us-central1';
    //const urlprefix = 'https://us-central1-musicninja-25923.cloudfunctions.net';
    //const urlprefix = 'https://us-central1-file-hosting-13205.cloudfunctions.net';
    const urlprefix = 'https://us-central1-musicninja-25923.cloudfunctions.net';
    const noteUrl= `${urlprefix}/app/api/note?note=${notes}&clef=${clef}&octave=${octave}`;
    return noteUrl;
  }

  
  getActiveContext(conv, contexts = [Object.keys(Contexts)], checkLifespan = false) {
    contexts = new Set(contexts);
    return Object.keys(conv.contexts.input).find(
      (context) =>
        contexts.has(context) &&
        (!checkLifespan || conv.contexts.get(context).lifespan > 0)
    );
  }

  _formatSpokenList(list, conjunction = "and") {
    return list.reduceRight((elem, str, index) => {
      let sep = ", ";
      if (index === list.length - 2) {
        sep += `${conjunction} `;
      }
      return `${str}${sep}${elem}`;
    }, "")
  }

  _noteLengthToNumber(noteLength) {
    switch(noteLength) {
    case 'full': return 1;
    case 'half': return 2;
    case 'quarter': return 4;
    case 'eights': return 8;
    default: return 4;
    }
  }

  _getNotesImageForSongNotes(notesList, alt) {
    const notesString = notesList.map(n => n.toLowerCase()).join('');
    const url = this.getNotesImageUrl(notesString);
    return new Image({ url, alt });
  }

  _getSongAudioSsml(notesList, surroundWithSpeak = true) {
    const urlAndTimeForNote = note => {
      let [ noteUC, nlen ] = note.toUpperCase().split('');
      nlen = Number(nlen);
      if (isNaN(nlen) || nlen === 0) nlen = 4; 
      // substitute missing notes:
      if (noteUC === 'E') noteUC = 'D';
      if (noteUC === 'G') noteUC = 'F';
      const urlprefix = 'https://storage.googleapis.com/musicninja-25923.appspot.com/PianoNotes/';
      const url = `${urlprefix}${noteUC}4vH.wav`;
      const time = FullNoteLengthInSeconds/nlen;
      console.log(`note ${note}: ${noteUC}, time: ${time}`);
      return { url, time };
    }
    const ssmlElements = []
    if (surroundWithSpeak) ssmlElements.push("<speak>");
    for(let i = 0; i < notesList.length; i++) {
      let note = notesList[i];
      let { url, time } = urlAndTimeForNote(note)
      //let time = (i === notesList.length - 1) ? "3.0" : "1.5";
      ssmlElements.push(`<audio src="${url}" clipEnd="${time}s"></audio>`)
    }
    ssmlElements.push('<break time="1s"/>');
    if (surroundWithSpeak) ssmlElements.push("</speak>");
    return ssmlElements.join('\n');
  }
  
  [Intents.welcome](conv) {
    this[Intents.mainMenu](conv);
  }

  [Intents.mainMenu](conv) {
    conv.data.songInfos = null;
    conv.data.currentSongNotes = [];
    conv.data.currentSongInfo = null;
    if (conv.intent === Intents.welcome) {
      conv.ask("Hello, I'm your Music Ninja!");
    }
    //conv.ask("You can create a song or take a notes quiz. What do you want to do?");
    conv.ask("You can create a song, take a notes quiz, or list your saved songs. What do you want to do?");
    conv.ask(new Suggestions([
      'Create a song',
      'Take a quiz',
      'List saved songs'
    ]));
  }

  [Intents.createSong](conv) {
    console.log(`create song: context: ${this.getActiveContext(conv)}`);
    conv.data.currentSongNotes = [];
    conv.ask("Ok, let's create a song!");
    conv.ask('Just say one note at a time, for example "note E". When you are done, just say "done".');
    conv.ask(new Suggestions(NoteNames));
  }

  _resetQuiz(conv) {
    conv.data.quiz = {
      noteHistory: [],
      questionCounter: 0,
      correct: 0
    }
  }

  _getRandomNote(conv) {
    let note;
    do {
      let index = Math.trunc(Math.random() * NoteNames.length);
      note = NoteNames[index].toLowerCase();
    } while (conv.data.quiz.noteHistory.includes(note));
    conv.data.quiz.noteHistory.push(note);
    conv.data.quiz.questionCounter++;
    return note;
  }

  _getRandomPrompt(isCorrect, note) {
    const prompts = isCorrect ? QuizSettings.correctAnswerPrompts : QuizSettings.wrongAnswerPrompts;
    const index = Math.trunc(Math.random() * prompts.length);
    var prompt = prompts[index];
    if (!isCorrect) {
      prompt = prompt.replace(/NOTE/g, note);
    }
    return prompt;
  }

  _getCurrentQuizNote(conv) {
    return conv.data.quiz.noteHistory[conv.data.quiz.noteHistory.length - 1];
  }

  _nextQuizQuestion(conv, ssmlIn = [], isFirst = false) {
    var ssml = ssmlIn.slice();
    if (isFirst) {
      ssml.push("Ok, let's take a notes quiz!");
      ssml.push('<break time="0.5s"/>');
      ssml.push(`I ask you to name ${QuizSettings.numberOfQuestions} note, one by one.`);
    }
    const note = this._getRandomNote(conv);
    const noteAudio = [note + '1'];
    const noteDisplay = [note + '2'];
    const andFinal = conv.data.quiz.questionCounter >= QuizSettings.numberOfQuestions ? ' and final' : '';
    ssml.push(`Here is your <say-as interpret-as="ordinal">${conv.data.quiz.questionCounter}</say-as>${andFinal} note:`);
    ssml.push('<break time="0.5s"/>');
    ssml.push(this._getSongAudioSsml(noteAudio, false));
    
    conv.ask(`<speak>${ssml.join('\n')}</speak>`);
    const text = "Name that note";
    const image = this._getNotesImageForSongNotes(noteDisplay, text);
    conv.ask(new BasicCard({ text, image }))
    conv.ask(new Suggestions(NoteNames));    
  }

  _getQuizResultPrompt(conv) {
    const total = QuizSettings.numberOfQuestions;
    const count = conv.data.quiz.correct;
    const pkey = count === 0 ? 'none' : count < total ? 'some' : 'all';
    const prompts = QuizSettings[`${pkey}CorrectPrompts`];
    var prompt = prompts[Math.trunc(Math.random() * prompts.length)];
    prompt = prompt.replace(/COUNT/g, count);
    prompt = prompt.replace(/TOTAL/g, total);
    return prompt;
  }
  
  [Intents.takeQuiz](conv) {
    console.log(`take quiz: context: ${this.getActiveContext(conv)}`);
    this._resetQuiz(conv);
    this._nextQuizQuestion(conv, [], true);
  }

  [Intents.noteNameInQuiz](conv, { noteName }) {
    const note = this._getCurrentQuizNote(conv);
    const isCorrect = (typeof noteName === 'string') && noteName === note;
    const ssml = []
    ssml.push(this._getRandomPrompt(isCorrect, note));
    conv.data.quiz.correct += isCorrect ? 1 : 0;
    if (conv.data.quiz.questionCounter >= QuizSettings.numberOfQuestions) {
      ssml.push(this._getQuizResultPrompt(conv));
      ssml.push('<break time="1.5s"/>');
      conv.ask(`<speak>${ssml.join('\n')}</speak>`);
      const text = "Say \"Main Menu\" to go back";
      conv.ask(text);
      conv.ask(new Suggestions(['Main Menu']));
    } else {
      this._nextQuizQuestion(conv, ssml, false);
    }
  }
  
  [Intents.noteName](conv, { noteName }) {
    console.log(`note name: context: ${this.getActiveContext(conv)}`);
    conv.data.currentSongNotes.push(noteName);
    const text = "Your current song notes";
    const image = this._getNotesImageForSongNotes(conv.data.currentSongNotes, text);
    conv.ask(`<speak>
      ok, I added note ${noteName.toUpperCase()}.
      <break time="1s"/>
      If you want to change the length of this note, say "full, half, quarter, or eight";
      Otherwise, just say the next note, or "done".
      </speak>`);
    conv.ask(new BasicCard({ text, image }))
    conv.ask(new Suggestions([...NoteLengths, "done"]));
  }

  [Intents.noteLength](conv, { noteLength }) {
    const lastNote = conv.data.currentSongNotes.splice(conv.data.currentSongNotes.length - 1, 1);
    if (!lastNote || lastNote.length === 0) {
      conv.ask('Please say a note name first, or say "done".');
      conv.ask(new Suggestions([...NoteNames, "done"]));
    } else {
      const noteNameAndLength = `${lastNote[0]}${this._noteLengthToNumber(noteLength)}`;
      conv.data.currentSongNotes.push(noteNameAndLength);
      const text = "Your current song notes";
      const image = this._getNotesImageForSongNotes(conv.data.currentSongNotes, text);
      conv.ask(`<speak>
        ok, I changed the note's length to ${noteLength}.
        <break time="1s"/>
        Next note, or "done", please
        </speak>`);
      conv.ask(new BasicCard({ text, image }))
      conv.ask(new Suggestions([...NoteNames, "done"]));
    }
  }

  [Intents.doneCreateContext](conv) {
    const displaySongNotes = conv.data.currentSongNotes.map(n => n.toUpperCase());
    conv.ask("<speak>Thanks for this great composition!"
             + "<break time=\"1s\"/>"
             + "And here is how it sounds."
             + this._getSongAudioSsml(conv.data.currentSongNotes, false)
             + 'Do you want to save this song? If yes, just say <break time="0.5s"/>"save as" and then some name; otherwise just say no.'
             + "</speak>");
    const text = "Your current song";
    const image = this._getNotesImageForSongNotes(conv.data.currentSongNotes, text);
    conv.ask(new BasicCard({ text, image }))
    conv.ask(new Suggestions(['No', 'Save']));
  }

  [Intents.saveSong](conv, { songName }) {
    var text;
    if (!songName) {
      return this[Intents.saveSongNo](conv);
    } else {
      const composer = "You";
      const notes = conv.data.currentSongNotes;
      this.db.saveSong(songName, composer, notes)
        .then(() => {
          console.log('song save succeeded');
        })
        .catch(err => {
          console.error(err);
        })
      conv.ask(`ok, I have saved this song under the name "${songName}". Please say \"Main Menu\" to go back.`);
      conv.ask(new Suggestions(['Main Menu']));
    }
  }

  [Intents.saveSongNo](conv) {
    const text = "Ok, I won't save this composition. "
          + "Say \"Main Menu\" to go back";
    conv.ask(text);
    conv.ask(new Suggestions(['Main Menu']));
  }

  [Intents.listSongs](conv) {
    const songInfos = conv.data.songInfos;
    if (!songInfos) {
      return this.db.loadAllSongs()
        .then(obj => {
          const songInfos = Object.keys(obj).map(songName => {
            const { notes } = obj[songName];
            const image = this._getNotesImageForSongNotes(notes, 'song notes');
            return { songName, notes, image };
          });
          conv.data.songInfos = songInfos;
          return this._showNextSongInfo(conv);
        });
    } else {
      return this._showNextSongInfo(conv);
    }
  }

  [Intents.deleteSong](conv) {
    if (!conv.data.currentSongInfo) {
      conv.ask("Sorry, I can't find any song that I can delete;"
               + "say \"Main Menu\" to go back");
      conv.ask(new Suggestions(['Main Menu']));
    } else {
      const songInfo = conv.data.currentSongInfo;
      return this.db.deleteSong(songInfo.songName)
        .then(() => {
          conv.ask("<speak>"
                   + `Ok, song ${songInfo.songName} deleted;`
                   + "<break time=\"1s\"/>"
                   + "say \"Main Menu\" to go back"
                   + "</speak>");
          conv.ask(new Suggestions(['Main Menu']));
        })
    }
  }

  _showNextSongInfo(conv) {
    var songInfo = conv.data.songInfos.shift();
    if (!songInfo) {
      conv.ask("No more songs stored; say \"Main Menu\" to go back.");
      conv.ask(new Suggestions(['Main Menu']));
    } else {
      conv.data.currentSongInfo = songInfo;
      var text1 = `Here is your saved song titled "${songInfo.songName}.`;
      var ssml = "<speak>"
      ssml += text1;
      ssml += this._getSongAudioSsml(songInfo.notes, false);
      ssml += "</speak>"
      conv.ask(new SimpleResponse({
        text: text1,
        speech: ssml
      }));
      conv.ask(new BasicCard({ text: songInfo.songName, image: songInfo.image }))
      var s = "";
      s += "Say Next to go to the next saved song; ";
      s += "say Delete, if you want to delete this song; "
      s += "you can also say \"main menu\"";
      conv.ask(s);
      conv.ask(new Suggestions(['Next', 'Delete', 'Main Menu']));
    }
  }
      
    

}

const fulfillmentInstance = new Fulfillment();
Object.values(Intents).forEach(intentName => {
  app.intent(intentName, fulfillmentInstance[intentName].bind(fulfillmentInstance));
});

exports.musicNinja = functions.https.onRequest(app);
