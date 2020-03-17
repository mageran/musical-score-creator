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
  var stave = new VF.Stave(10, 10, w - 20);
  var stave2 = new VF.Stave(10, 70, w - 20);
  var stave3 = new VF.Stave(10, 130, w - 20);
  var stave4 = new VF.Stave(10, 190, w - 20);
  var stave5 = new VF.Stave(10, 250, w - 20);
  // Add a clef and time signature.
  stave.addClef(clef)
  // Set the context of the stave our previous exposed context and execute the method draw !
  stave.setContext(context).draw();
  stave2.setContext(context).draw();
  stave3.setContext(context).draw();
  stave4.setContext(context).draw();
  stave5.setContext(context).draw();
  const drawNote = () => {

    if (!note) return;
    if (note.length > 3) return

    const noteName = note[0].toLowerCase();
    const noteName2= note[1].toLowerCase();
    const accidental = note[2]
    if (NoteNames.indexOf(noteName) < 0 || NoteNames.indexOf(noteName2) < 0 ) return;
    var octaveNum = Number.parseInt(octave);
    var octaveNum2 = Number.parseInt(octave+1);
    if (isNaN(octaveNum) || isNaN(octaveNum2)) return
  
    var noteObj = new VF.StaveNote({clef, keys: [`${noteName}/${octaveNum}`], duration: "2" })
    var noteObj2 = new VF.StaveNote({clef, keys: [`${noteName2}/${octaveNum}`], duration: "2" })

    if (accidental === '#' || accidental === 's') {
      noteObj.addAccidental(0, new VF.Accidental("#"))
    }
    if (accidental === 'b') {
      noteObj.addAccidental(0, new VF.Accidental("b"))
    }
    
    var notes = [ noteObj, noteObj2];
    
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
