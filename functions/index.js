const functions = require('firebase-functions');
const app = require('express')();
const { createCanvas, loadImage } = require('canvas')

window = { console : { log : console.log }} // this is needed for vexflow to load
document = { getElementById() { return null } }

const Vex = require('vexflow')


app.get('/api/note', (req, res) => {
  const NoteNames = 'abcdefg'
  const width = 260;
  const height = 260;
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
  var stave = new VF.Stave(10, 10, w - 20);
  // Add a clef and time signature.
  stave.addClef(clef)
  // Set the context of the stave our previous exposed context and execute the method draw !
  stave.setContext(context).draw();

  const drawNote = () => {

    if (!note) return;
    if (note.length > 2) return

    const noteName = note[0].toLowerCase();
    const accidental = note[1]
    if (NoteNames.indexOf(noteName) < 0) return;
    var octaveNum = Number.parseInt(octave);
    if (isNaN(octaveNum)) return
  
    var noteObj = new VF.StaveNote({clef, keys: [`${noteName}/${octaveNum}`], duration: "1" })
    if (accidental === '#' || accidental === 's') {
      noteObj.addAccidental(0, new VF.Accidental("#"))
    }
    if (accidental === 'b') {
      noteObj.addAccidental(0, new VF.Accidental("b"))
    }
    
    var notes = [ noteObj ];
    
    // Create a voice in 4/4 and add above notes
    var voice = new VF.Voice({num_beats: 4,  beat_value: 4});
    voice.addTickables(notes);
    
    // Format and justify the notes to 400 pixels.
    var formatter = new VF.Formatter().joinVoices([voice]).format([voice], w - 20);
    
    // Render voice
    voice.draw(context, stave);
  }

  drawNote()
  
  res.set('Cache-Control', 'public, max-age=60, s-maxage=31536000');
  res.writeHead(200, {'Content-Type': 'image/png'});
  canvas.pngStream().pipe(res);
});


exports.app = functions.https.onRequest(app);
