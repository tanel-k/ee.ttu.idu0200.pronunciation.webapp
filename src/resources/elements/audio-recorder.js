import { bindable } from 'aurelia-framework';

import CustomAudioRecorder from '../../lib/custom-audio-recorder';

export class AudioRecorder {
  @bindable save;
  @bindable isSaving = false;
  @bindable durationSeconds = 10;

  constructor() {
    this.initDataModel();
    this.onRecorderSuccess = this.onRecorderSuccess.bind(this);
  }

  initDataModel() {
    this.isAttached = false;
    this.isRecording = false;
    this.isProcessingRecording = false;
    this.audioBlob = null;
  }

  resetDataModel() {
    this.initDataModel();
  }

  attached() {
    const recorder = this.recorder = new CustomAudioRecorder(this.onRecorderSuccess);
    this.isAttached = true;
    if (!recorder.hasPermission()) {
      recorder.requestPermission();
    }
  }

  onRecorderSuccess(audioBlob) {
    this.audioBlob = audioBlob;
    this.isProcessingRecording = false;
  }

  get hasPermission() {
    return this.recorder && this.recorder.hasPermission();
  }

  get hasAudioData() {
    return this.audioBlob;
  }

  get isPlaying() {
    return this.recorder.isPlaying();
  }

  startRecording() {
    this.audioBlob = null;
    this.isRecording = true;
    this.timeLeft = parseInt(this.durationSeconds, 10);
    const killTimeMillis = new Date().getTime() + this.timeLeft * 1000;
    this.countdownInterval = setInterval(() => {
      const currTimeMillis = new Date().getTime();
      const currTimeLeft = parseInt(Math.round((killTimeMillis - currTimeMillis) / 1000.0, 0), 10);
      this.timeLeft = currTimeLeft >= 0 ? currTimeLeft : 0;
      if (currTimeMillis >= killTimeMillis) {
        this.stopRecording();
      }
    }, 1000);
    this.recorder.startRecording();
  }

  stopRecording() {
    this.isRecording = false;
    this.isProcessingRecording = true;
    this.recorder.stopRecording();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  playRecording() {
    this.recorder.play();
  }

  detached() {
    this.resetDataModel();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  handleSaveClicked() {
    if (typeof this.save === 'function') {
      this.save(this.audioBlob);
    } else {
      console.warn('No save callback provided');
    }
  }
}
