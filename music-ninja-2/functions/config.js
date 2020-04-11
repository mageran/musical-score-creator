/**
 * Configuration parameters
 */

const Intents = {
  welcome: 'Default Welcome Intent',
  createSong: 'CreateSong',
  takeQuiz: 'TakeQuiz',
  noteName: 'NoteName',
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

module.exports = {
  Intents,
  Contexts,
  NoteNames,
};
