# musical-score-creator
Simple nodejs based webserver to create a png displaying a clef and a single note

It uses the [Vexflow Javascript
library](https://ourcodeworld.com/articles/read/293/rendering-music-notation-music-sheet-in-javascript-with-vexflow-2)
to generate a server-side png image of a single clef and a full
note. The code can easily be extended to make full use of the Vexflow
features.

## Installation

* run npm install in the functions directory
* setup a firebase project in order to deploy the code there (see https://firebase.google.com/)
* make sure the firebase command line interface is installed (see https://firebase.google.com/docs/cli)
* run "firebase init" and select the project you want to use for deployment (probably the one you just created)

## Test locally

Run

```
firebase emulators:start --only functions
```

in your project directory. This will start a local webserver. You can enter a URL like this in your browser:

```
http://localhost:5001/<YOUR_FIREBASE_PROJECT_ID>/us-central1/app/api/note?clef=treble&note=e&octave=5
```

and it should display a PNG image like this: ![note image](https://file-hosting-13205.firebaseapp.com/musicalnotes/note.png).

The url parameters should be self-explanatory.


