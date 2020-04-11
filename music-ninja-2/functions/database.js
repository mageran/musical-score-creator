/**
 * Database access
 */

const DATABASE_URL = 'https://musicninja2-7ebcf.firebaseio.com/';

const serviceAccount = require('./musicninja2-7ebcf-firebase-adminsdk-y4ob9-1e13ed9794.json')

class Database {

  constructor() {
    this.admin = require('firebase-admin');
    console.log('************ in Database constructor ************');
    try {
      this.admin.initializeApp({
        credential: this.admin.credential.cert(serviceAccount),
        databaseURL: DATABASE_URL
      });
    } catch(err) {
    }
  }

  
  /**
   * saves the object under path collection -> name
   * @returns Promise
   */
  save(collection, name, object) {
    const ref = this.admin.database().ref(collection);
    return ref.child(name).set(object)
      .then(() => {
        console.log('save succeeded');
      });
  }

  load(collection, name = null) {
    const ref = this.admin.database().ref(collection);
    const cref = name ? ref.child(name) : ref;
    return ref.once("value")
      .then(snapshot => {
        return snapshot.val();
      });
  }

  deleteEntry(collection, name) {
    const ref = this.admin.database().ref(collection);
    return ref.child(name).remove()
      .then(() => {
        console.log("delete succeeded");
      });
  }
  
}


class SongDatabase extends Database {

  constructor(collectionName = "songName") {
    super();
    this.collectionName = collectionName;
  }

  /**
   * saves a song with name composer and notes string
   */
  saveSong(name, composer, notes) {
    return this.save(this.collectionName, name, { composer, notes });
  }

  /**
   * retrieves the song with the given name
   */
  loadSong(name) {
    return this.load(this.collectionName, name);
  }

  /**
   * returns all songs; if composer is specified it only returns songs
   * with the given composer field.
   */
  loadAllSongs(composer = null) {
    if (composer) {
      const ref = this.admin.database().ref(this.collectionName);
      return ref.orderByChild('composer').equalTo(composer)
        .once("value")
        .then(snapshot => {
          return snapshot.val();
        })
    } else {
      return this.load(this.collectionName);
    }
  }

  deleteSong(songName) {
    return this.deleteEntry(this.collectionName, songName);
  }
  
}


module.exports = { Database, SongDatabase }


// --------------------------------------------------------------------------------
// unit tests

if (require.main === module) {
  console.log('testing database access...');
  const db = new SongDatabase();
  const operation = process.argv[2] || "load";
  if (operation === "save") {
    Promise.all([
      db.saveSong("A little Night Music", "Mozart", "fcfcf"),
      db.saveSong("Hallelujah", "Beethoven", "eeec"),
      db.saveSong("Row Your Boat", "Folk Song", "cccde")
    ])
      .then(() => {
        process.exit();
      })
  }

  if (operation === "load") {
    db.loadAllSongs()
      .then(object => {
        console.log(object);
        process.exit();
      })
  }

  if (operation === "delete") {
    db.deleteSong("Hallelujah")
      .then(() => {
        process.exit();
      })
  }
  
}
