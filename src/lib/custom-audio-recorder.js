/* ADAPTED FROM https://github.com/Authman2/AUAudioRecorder */

export default class AudioRecorder {
  permission = false;
  mediaRecorder;
  outputType = 'audio/mp3; codecs=opus'; // Default is mp3
  audio; // This 'audio' serves as the final recording by the user.
  blob; // The blob that can be used for file operations.
  mediaStream;
  shouldLoop = false;
  playing = false;

  recordingStopSuccessCallback;
  recordingStopErrorCallback;

  constructor(recordingStopSuccessCallback, recordingStopErrorCallback) {
    this.recordingStopSuccessCallback = recordingStopSuccessCallback;
    this.recordingStopErrorCallback = recordingStopErrorCallback;
  }
  /* Asks the user for their this.permission to access the computer's microphone. */

  requestPermission() {
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    if (navigator.getUserMedia) {
      // Definitions
      const constraints = { audio: true };
      let chunks = [];

      const onSuccess = (stream) => {
        // Initialize the media recorder
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaStream = stream;

        this.mediaRecorder.onstop = (e) => {
          // Create some new elements in the html
          const clipContainer = document.createElement('article');
          clipContainer.classList.add('clip');
          this.audio = document.createElement('audio');
          this.audio.setAttribute('controls', '');
          clipContainer.appendChild(this.audio);

          // Set some properties
          this.audio.controls = true;
          const blob = new Blob(chunks, { 'type': this.outputType });
          chunks = [];
          const audioURL = window.URL.createObjectURL(blob);
          this.audio.src = audioURL;
          this.blob = blob;

          if (typeof this.recordingStopSuccessCallback === 'function') {
            this.recordingStopSuccessCallback(blob);
          }
        };// End of onstop action.

        this.mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        }; // End of ondataavailable action.
      }; // End of onSuccess

      const onError = (err) => {
        if (typeof this.recordingStopErrorCallback === 'function') {
          this.recordingStopErrorCallback(err);
        }
      };// End of onError

      this.permission = true;
      navigator.getUserMedia(constraints, onSuccess, onError);
    } // End of if-supported-statement.
  }

  /* Starts the recording. */
  startRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.start();
    }
  }

  /* Stops the recording. */
  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }

  /* Plays the recording. */
  play() {
    if (this.audio) {
      this.audio.play();
      this.playing = true;
    }
  }
  /* Pauses the recording. */
  pause() {
    if (this.audio) {
      this.audio.pause();
      this.playing = false;
    }
  }

  /* Stops the recording from this.playing. Calling 'play' will start it from the beginning. */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.playing = false;
    }
  }

  /* Loops the recorded this.audio. */
  loop(bool) {
    if (this.audio) {
      (bool === true) ? this.audio.loop = true : this.audio.loop = false;
    }
  }

  /* Goes to the beginning of the this.audio. */
  stepBackward() {
    if (this.audio) {
      this.audio.currentTime = 0;
    }
  }

  /* Goes to the end of the this.audio. */
  stepForward() {
    if (this.audio) {
      this.audio.currentTime = this.audio.duration;
    }
  }

  /* Clears the current recording. */
  clear() {
    this.audio = null;
    this.playing = false;
  }

  /* Sets the file type for the this.audio recording.
  Ex.) mp3, wav, ogg, etc.... */
  setOutputFileType(fileType) {
    this.outputType = 'audio/' + fileType + '; codecs=opus';
  }

  /* Returns whether or not the program has the user's this.permission to use the microphone. */
  hasPermission() {
    if (this.permission === undefined) return false;
    return (this.permission === true) ? true : false;
  }

  /* Returns whether or not the this.audio will loop. */
  isLooping() {
    if (this.audio !== null && (typeof (this.audio) !== null) && this.audio !== undefined) {
      if (this.audio.loop === true) {
        return true;
      }
      return false;
    }
    return false;
  }

  /* Returns whether or not the this.audio is currently this.playing. */
  isPlaying() {
    if (this.audio !== null && (typeof (this.audio) !== null) && this.audio !== undefined) {
      if ((this.audio.currentTime === this.audio.duration && this.audio.loop === false) || (this.audio.currentTime === 0) || (this.isFinished())) {
        return false;
      }
      return true;
    }
    return false;
  }

  /* Returns the this.audio object that contains the final recording. */
  getRecording() {
    if (this.audio !== null && (typeof (this.audio) !== null) && this.audio !== undefined) { return this.audio; }
    return null;
  }

  /* Returns a Blob object, which can be used for file operations. */
  getRecordingFile() {
    return this.blob;
  }

  /* This returns the media stream from the web audio API. */
  getStream() {
    if (this.mediaStream !== null && (typeof (this.mediaStream) !== null) && this.mediaStream !== undefined) { return this.mediaStream; }
    return null;
  }

  /* Returns the output file type. */
  getOutputType() {
    if (this.outputType !== null && (typeof (this.outputType) !== null) && this.outputType !== undefined) { return this.outputType; }
    return null;
  }

  /* Returns whether or not the audio is finished playing. */
  isFinished() {
    if (this.audio !== null && (typeof (this.audio) !== null) && this.audio !== undefined) { return this.audio.ended; }
    return null;
  }
}

