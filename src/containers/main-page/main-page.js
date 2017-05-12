import { inject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';

import { normalizeWord } from '../../lib/word-utils';
import { DataAPI } from '../../gateways/data/data-api';

@inject(DataAPI)
export class MainPage {
  @bindable query = '';
  normalizedQuery = '';

  constructor(api) {
    this.api = api;
    this.handleSavePronunciation = this.handleSavePronunciation.bind(this);
    this.handlePronunciationFileValidation = this.handlePronunciationFileValidation.bind(this);
  }

  activate() {
    this.initDataModel();
  }

  attached() {
    this.audioPlayer = new window.Audio();
  }

  initDataModel() {
    this.uploadingForWordId = null;
    this.recordingForWordId = null;
    this.isUploadingRecording = false;

    this.pronunciationLoadMap = {};
    this.pronunciationCache = {};
    this.queryStoredInBackend = true;

    this.isLoadingWords = false;
    this.wordsLoadedPct = 0;
  }

  queryChanged() {
    const normalizedQuery = this.normalizedQuery = normalizeWord(this.query);
    this.queryResult = [];
    this.queryStoredInBackend = true;
    if (normalizedQuery) {
      this.isLoadingWords = true;
      this.loaded = 0;

      const doneLoading = (words) => {
        this.wordsLoadedPct = 100;
        setTimeout(() => {
          this.isLoadingWords = false;
          this.queryStoredInBackend = typeof words.find(word => word.word === normalizedQuery) !== 'undefined';
          this.queryResult = words;
        }, 150);
      };

      this.api.getWordsRequest(normalizedQuery)
        .withDownloadProgressCallback(({ loaded, total }) => this.wordsLoadedPct = parseInt(loaded * 100.0 / total, 10))
        .send()
        .then((response) => {
          const words = response.content;
          doneLoading(words);
        })
        .catch((err) => {
          doneLoading();
        });
    }
  }

  playPronunciation(wordId) {
    // check cache
    let lastModified;
    if (this.pronunciationCache[wordId]) {
      const prevPronunciation = this.pronunciationCache[wordId];
      let hasNotChanged = true;
      this.api.getWordRequest(wordId)
        .send()
        .then((response) => {
          const word = response.content;
          lastModified = word.lastModified;
          hasNotChanged = prevPronunciation.lastModified === lastModified;
        });

      if (hasNotChanged) {
        this.playAudioBlob(prevPronunciation.audioBlob);
        return;
      }
    }

    // download audio
    const loadMap = this.pronunciationLoadMap[wordId] = {
      isAudioLoading: true,
      audioLoadedPct: 0
    };
    const doneLoading = (audioBlob) => {
      loadMap.audioLoadedPct = 100;
      setTimeout(() => {
        loadMap.isAudioLoading = false;
        if (audioBlob) {
          this.playAudioBlob(audioBlob);
        }
      }, 150);
    };

    this.api.getPronunciationRequest(wordId)
      .withResponseType('blob')
      .withDownloadProgressCallback(({ loaded, total }) => loadMap.audioLoadedPct = parseInt(loaded * 100.0 / total, 10))
      .send()
      .then((response) => {
        const audioBlob = response.content;
        this.pronunciationCache[wordId] = { audioBlob, lastModified };
        doneLoading(audioBlob);
      })
      .catch((err) => {
        doneLoading();
      });
  }

  handleRecordPronunciationClick(wordId) {
    this.uploadingForWordId = null;
    if (this.recordingForWordId === wordId) {
      this.recordingForWordId = null;
      return;
    }
    this.recordingForWordId = wordId;
  }

  handleUploadPronunciationClick(wordId) {
    this.recordingForWordId = null;
    if (this.uploadingForWordId === wordId) {
      this.uploadingForWordId = null;
      return;
    }
    this.uploadingForWordId = wordId;
  }

  handleSavePronunciation(audioBlob) {
    this.isUploadingRecording = true;
    this.api.getWordPronunciationUpdateRequest(this.recordingForWordId, audioBlob)
      .send()
      .then(() => {
        this.isUploadingRecording = false;
        this.recordingForWordId = null;
      })
      .catch((err) => {
        console.warn(err);
        this.isUploadingRecording = false;
      });
  }

  handleSavePronunciationFile(file) {
    console.log(file);
  }

  handlePronunciationFileValidation(file) {
    const errors = [];
    if (file.type !== 'audio/mp3') {
      errors.push('We only accept .mp3 files');
    }

    if (file.size >= 1000000) {
      errors.push('The size of the file exceeds the maximum limitation of 1MB');
    }

    return errors;
  }

  playAudioBlob(audioBlob) {
    this.audioPlayer.src = window.URL.createObjectURL(audioBlob);
    this.audioPlayer.play();
  }
}
