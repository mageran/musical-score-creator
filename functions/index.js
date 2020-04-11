const functions = require('firebase-functions');
const app = require('express')();
const { createCanvas, loadImage } = require('canvas')

window = { console : { log : console.log }} // this is needed for vexflow to load
document = { getElementById() { return null } }

const Vex = require('vexflow')


app.get('/api/note', (req, res) => {
  const NoteNames = 'abcdefg'
  const width = 750;
  const height = 750;
  const scaleFactor = 2.0
  const w = width/scaleFactor
  const h = height/scaleFactor
  const canvas = createCanvas(width, height);
  canvas.style = {} // this is needed to avoid vexflow crashes
  
  const VF = Vex.Flow;
  var renderer = new VF.Renderer(canvas, VF.Renderer.Backends.CANVAS);
  renderer.resize(width, height);
  var context = renderer.getContext();
  context.scale(scaleFactor, scaleFactor);
  context.fillStyle = 'white';
  context.fillRect(0, 0, w, h);
  context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
  context.fillStyle = 'black';

  const query = req.query
  console.log(query);
  const clef = query.clef || 'treble';
  const note = query.note;
  const octave = query.octave || '3';

  /**
   * Creating a new stave
   */
  // Create a stave of width 400 at position x10, y40 on the canvas.
  var staves = new Array(5);
  var counter=10;
  for(var i=0;i<1;i++){
	staves[i] = new VF.Stave(10, counter, w - 20);
	staves[i].addClef(clef);
	staves[i].setContext(context).draw();
	counter += 100;
  }

  // Add a clef and time signature.
  //stave.addClef(clef)
  // Set the context of the stave our previous exposed context and execute the method draw !

  const drawNote = () => {

    if (!note) return;
    /*
    const accidental = note[note.length]
    var noteNames = new Array(note.length);
    //var octaveNums = new Array(note.length);
    var octaveNum = Number.parseInt(octave);
    var notes = new Array(note.length);
    for(var i = 0;i<note.length;i++){
      noteNames[i]= note[i].toLowerCase();
      //if (NoteNames[i].indexOf(noteNames[i]) < 0) return;
      //octaveNums[i] = Number.parseInt(octave.get(i));
      //if (isNaN(octaveNums[i])) return
      var noteObj = new VF.StaveNote({clef, keys: [`${noteNames[i]}/${octaveNum}`], duration: "4" })
      if (accidental === '#' || accidental === 's') {
        noteObj.addAccidental(0, new VF.Accidental("#"))
      }
      if (accidental === 'b') {
        noteObj.addAccidental(0, new VF.Accidental("b"))
      }
      notes[i]= noteObj;

    }
    */
    
    var octaveNum = Number.parseInt(octave);
    const notes = note.split('').map(n => {
      const keys = [`${n.toLowerCase()}/${octaveNum}`];
      return new VF.StaveNote({clef, keys, duration: "4" });
    });
    
    // Create a voice in 4/4 and add above notes
    var voice = new VF.Voice({num_beats: 4, beat_value: 4});
    voice.setStrict(false);
    voice.addTickables(notes);

    // Format and justify the notes to 400 pixels.
    var formatter = new VF.Formatter().joinVoices([voice]).format([voice], w - 20);
    
    // Render voice
    voice.draw(context, staves[0]);


  }

  drawNote()
  
  res.set('Cache-Control', 'public, max-age=60, s-maxage=31536000');
  res.writeHead(200, {'Content-Type': 'image/png'});
  canvas.pngStream().pipe(res);
});


exports.app = functions.https.onRequest(app);
