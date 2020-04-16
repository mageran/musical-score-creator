/**
 * Configuration parameters
 */

const Intents = {
  welcome: 'Default Welcome Intent',
  createSong: 'CreateSong',
  takeQuiz: 'TakeQuiz',
  noteName: 'NoteName',
  noteNameInQuiz: 'NoteNameInQuiz',
  noteLength: 'NoteLength',
  doneCreateContext: 'DoneCreateSong',
  saveSong: 'SaveSong',
  saveSongNo: 'SaveSongNo',
  listSongs: 'ListSongs',
  deleteSong: 'DeleteSong',
  mainMenu: 'MainMenu'
}

const Contexts = {
  createSong: 'createsongcontext',
  quiz: 'quizcontext'
}

const NoteNames = ['C','D','E','F','G','A','B'];

const NoteLengths = ['full', 'half', 'quarter', 'eights'];

const FullNoteLengthInSeconds = 6;

const QuizSettings = {
  numberOfQuestions: 5,
  correctAnswerPrompts: [
    'Yes, this is correct!',
    'Perfect, this was the right answer!',
    'Fantastic, correct!',
    'Correct answer, super!'
  ],
  wrongAnswerPrompts: [
    'Sorry, that was wrong; this is note <break time="0.5s"/>NOTE<break time="0.5s"/>.',
    'No, that is not correct. You should have said <break time="0.5s"/>NOTE<break time="0.5s"/>.',
    'This is unfortunately not correct, <break time="0.5s"/>NOTE<break time="0.5s"/> would have been the right answer.'
  ],
  noneCorrectPrompts: [
    'Sorry, you got no note named correctly'
  ],
  someCorrectPrompts: [
    'You have COUNT out of TOTAL correct; not bad, but there is still room for improvement.'
  ],
  allCorrectPrompts: [
    'Perfect score! COUNT out of TOTAL. You are a musical genius!',
    'Congratulation, you can call yourself a true MusicNinja now; you have named all TOTAL notes correctly!'
  ]
}


module.exports = {
  Intents,
  Contexts,
  NoteNames,
  NoteLengths,
  FullNoteLengthInSeconds,
  QuizSettings
};
