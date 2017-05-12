import { inject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';

import { DataAPI } from '../../gateways/data/data-api';

@inject(DataAPI)
export class MainPage {
  @bindable query = '';

  constructor(api) {
    this.api = api;
  }

  activate() {
    this.initDataModel();
  }

  attached() {
    this.audioPlayer = new window.Audio();
  }

  initDataModel() {
    this.pronunciationLoadMap = {};
    this.pronunciationCache = {};
    this.isLoadingWords = false;
    this.wordsLoadedPct = 0;
    this.isLoadingAudio = false;
    this.audioLoadedPct = 0;
  }

  queryChanged() {
    this.queryResult = [];
    if (this.query) {
      this.isLoadingWords = true;
      this.loaded = 0;
      this.api.getWordsRequest(this.query)
        .withDownloadProgressCallback(({ loaded, total }) => this.wordsLoadedPct = parseInt(loaded * 100.0 / total))
        .send()
        .then((response) => (response.content))
        .then((words) => {
          this.queryResult = words;
          this.wordsLoadedPct = 100;
          setTimeout(() => {
            this.isLoadingWords = false;
          }, 150);
        })
        .catch((err) => {
          this.wordsLoadedPct = 100;
          setTimeout(() => {
            this.isLoadingWords = false;
          }, 150);
        });
    }
  }

  playPronunciation(wordId) {
    if (this.pronunciationCache[wordId]) {
      this.playAudioBlob(this.pronunciationCache[wordId]);
      return;
    }

    const loadMap = this.pronunciationLoadMap[wordId] = {
      isAudioLoading: true,
      audioLoadedPct: 0
    };

    this.api.getPronunciationRequest(wordId)
      .withResponseType('blob')
      .withDownloadProgressCallback(({ loaded, total }) => {loadMap.audioLoadedPct = parseInt(loaded * 100.0 / total); console.log(loadMap.audioLoadedPct);})
      .send()
      .then((response) => (response.content))
      .then((audioBlob) => {
        this.pronunciationCache[wordId] = audioBlob;
        loadMap.audioLoadedPct = 100;
        setTimeout(() => {
          loadMap.isAudioLoading = false;
          this.playAudioBlob(audioBlob);
        }, 150);
      })
      .catch((err) => {
        loadMap.audioLoadedPct = 100;
        setTimeout(() => loadMap.isAudioLoading = false, 150);
      });
  }

  playAudioBlob(audioBlob) {
    this.audioPlayer.src = window.URL.createObjectURL(audioBlob);
    this.audioPlayer.play();
  }
}
