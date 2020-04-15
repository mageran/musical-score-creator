'use strict';

const { dialogflow, Suggestions, BasicCard, Image, SimpleResponse } = require('actions-on-google');
const functions = require('firebase-functions');

const { Intents, Contexts, NoteNames } = require('./config');

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

  _getNotesImageForSongNotes(notesList, alt) {
    const notesString = notesList.map(n => n.toLowerCase()).join('');
    const url = this.getNotesImageUrl(notesString);
    return new Image({ url, alt });
  }

  _getSongAudioSsml(notesList, surroundWithSpeak = true) {
    const urlForNote = note => {
      let noteUC = note.toUpperCase();
      // substitute missing notes:
      if (noteUC === 'E') noteUC = 'D';
      if (noteUC === 'G') noteUC = 'F';
      const urlprefix = 'https://storage.googleapis.com/musicninja-25923.appspot.com/PianoNotes/';
      return `${urlprefix}${noteUC}4vH.wav`
    }
    const ssmlElements = []
    if (surroundWithSpeak) ssmlElements.push("<speak>");
    for(let i = 0; i < notesList.length; i++) {
      let note = notesList[i];
      let time = (i === notesList.length - 1) ? "3.0" : "1.5";
      ssmlElements.push(`<audio src="${urlForNote(note)}" clipEnd="${time}s"></audio>`)
    }
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
    conv.ask("You can create a song or list your saved songs. What do you want to do?");
    conv.ask(new Suggestions([
      'Create a song',
      'List saved songs'
    ]));
  }

  [Intents.createSong](conv) {
    console.log(`create song: context: ${this.getActiveContext(conv)}`);
    conv.data.currentSongNotes = [];
    conv.ask("Ok, let's create a song!");
    conv.ask('Just say one note at a time, for example "note D". When you are done, just say "done".');
    conv.ask(new Suggestions(NoteNames));
  }

  [Intents.takeQuiz](conv) {
    console.log(`take quiz: context: ${this.getActiveContext(conv)}`);
    conv.close("Ok, let's take a quiz!");
  }

  [Intents.noteName](conv, { noteName }) {
    console.log(`note name: context: ${this.getActiveContext(conv)}`);
    conv.data.currentSongNotes.push(noteName);
    const text = "Your current song notes";
    const image = this._getNotesImageForSongNotes(conv.data.currentSongNotes, text);
    conv.ask(`<speak>
      ok, I added note ${noteName.toUpperCase()}.
      <break time="1s"/>
      Next note, or say "done", please?
      </speak>`);
    conv.ask(new BasicCard({ text, image }))
    conv.ask(new Suggestions([...NoteNames, "done"]));
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
          + "say \"Main Menu\" to go back";
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
      conv.close(`deleting song "${songInfo.songName}"...`);
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
