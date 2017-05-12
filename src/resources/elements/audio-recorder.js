import CustomAudioRecorder from '../../lib/custom-audio-recorder';

export class AudioRecorder {
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
    this.recorder.startRecording();
  }

  stopRecording() {
    this.isRecording = false;
    this.isProcessingRecording = true;
    this.recorder.stopRecording();
  }

  playRecording() {
    this.recorder.play();
  }

  detached() {
    this.resetDataModel();
  }
}
