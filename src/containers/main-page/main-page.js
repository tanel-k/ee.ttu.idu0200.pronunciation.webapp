import { inject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';

import { normalizeWord } from '../../lib/word-utils';
import { DataAPI } from '../../gateways/data/data-api';

import * as Toastr from 'toastr';

@inject(Element, DataAPI)
export class MainPage {
  @bindable query = '';
  normalizedQuery = '';

  constructor(element, api) {
    this.element = element;
    this.api = api;
    this.handleSavePronunciation = this.handleSavePronunciation.bind(this);
    this.handlePronunciationFileValidation = this.handlePronunciationFileValidation.bind(this);
    this.handleSavePronunciationFile = this.handleSavePronunciationFile.bind(this);
    this.handleSaveNewWord = this.handleSaveNewWord.bind(this);
  }

  activate() {
    this.initDataModel();
  }

  attached() {
    this.audioPlayer = new window.Audio();
    this.initDOMHooks();
    this.wireEventListeners();
  }

  initDataModel() {
    this.uploadingForWordId = null;
    this.recordingForWordId = null;
    this.isUploadingRecording = false;

    this.isCreatingWord = false;
    this.isUploadingNewWord = false;
    this.isRecordingNewWord = false;

    this.pronunciationLoadMap = {};
    this.pronunciationCache = {};
    this.queryStoredInBackend = true;

    this.isLoadingWords = false;
    this.wordsLoadedPct = 0;
  }

  initDOMHooks() {
    this.wordFinderInput = this.element.querySelector('#word-finder');
    this.wordFinderErrorLabel = this.element.querySelector('#word-finder-error');
  }

  wireEventListeners() {
    let lastMessageTimeout;
    let lastClearTimeout;
    this.wordFinderInput.addEventListener('disallowed-key', () => {
      this.wordFinderErrorLabel.classList.remove('fadeOut');

      if (lastMessageTimeout) {
        clearTimeout(lastMessageTimeout);
        if (lastClearTimeout) {
          clearTimeout(lastClearTimeout);
        }
      }

      this.wordFinderErrorLabel.classList.add('fadeIn');
      this.wordFinderErrorLabel.innerText = 'Words can only contain alphabetical characters';

      // message should be temporary
      lastMessageTimeout = setTimeout(() => {
        this.wordFinderErrorLabel.classList.remove('fadeIn');
        this.wordFinderErrorLabel.classList.add('fadeOut');
        // delay for fadeout
        lastClearTimeout = setTimeout(() => {
          this.wordFinderErrorLabel.innerText = '';
        }, 500);
      }, 1000);
    });
  }

  queryChanged() {
    this.queryWords();
  }

  queryWords() {
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
    const downloadAudio = (lastModified) => {
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
    };

    // check cache
    let lastModified;
    const prevPronunciation = this.pronunciationCache[wordId];
    let hasNotChanged = true;
    this.api.getWordRequest(wordId)
      .send()
      .then((response) => {
        const word = response.content;
        lastModified = word.lastModified;
        hasNotChanged = prevPronunciation && prevPronunciation.lastModified === lastModified;
        if (hasNotChanged && prevPronunciation.audioBlob) {
          this.playAudioBlob(prevPronunciation.audioBlob);
          return;
        }
        downloadAudio(lastModified);
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
        notifySuccess('Saved!');
        this.isUploadingRecording = false;
        this.recordingForWordId = null;
      })
      .catch((err) => {
        notifyFailure('An unexpected error occurred');
        this.isUploadingRecording = false;
      });
  }

  handleSavePronunciationFile(file) {
    this.isUploadingRecording = true;
    this.api.getWordPronunciationUpdateRequest(this.uploadingForWordId, file)
      .send()
      .then(() => {
        notifySuccess('Saved!');
        this.isUploadingRecording = false;
        this.uploadingForWordId = null;
      })
      .catch((err) => {
        notifyFailure('An unexpected error occurred');
        this.isUploadingRecording = false;
      });
  }

  handleSaveNewWord(audioBlob) {
    this.isUploadingRecording = true;
    this.api.getWordCreationRequest(this.normalizedQuery, audioBlob)
      .send()
      .then(() => {
        notifySuccess('Saved!');
        this.isUploadingRecording = false;
        this.setNotRegisteringWord();
        this.queryWords();
      })
      .catch((err) => {
        notifyFailure('An unexpected error occurred');
        this.isUploadingRecording = false;
      });
  }

  setRegisteringWord() {
    this.isCreatingWord = true;
    this.isUploadingNewWord = false;
    this.isRecordingNewWord = false;
  }

  setNotRegisteringWord() {
    this.isCreatingWord = false;
    this.isUploadingNewWord = false;
    this.isRecordingNewWord = false;
  }

  handleRegisterWordClick() {
    this.setRegisteringWord();
  }

  handleRegisterWordCancelClick() {
    this.setNotRegisteringWord();
  }

  handleNewWordRecordClick() {
    this.isUploadingNewWord = false;
    this.isRecordingNewWord = true;
  }

  handleNewWordUploadClick() {
    this.isUploadingNewWord = true;
    this.isRecordingNewWord = false;
  }

  handlePronunciationFileValidation(file) {
    const errors = [];
    if (file.type !== 'audio/mp3') {
      errors.push('We only accept .mp3 files');
    }

    if (file.size >= 1000000) {
      errors.push('The size of the file exceeds 1MB');
    }

    return errors;
  }

  playAudioBlob(audioBlob) {
    this.audioPlayer.src = window.URL.createObjectURL(audioBlob);
    this.audioPlayer.play();
  }
}

const notifySuccess = (message) => {
  Toastr.info(message, '', { timeOut: 750 });
};

const notifyFailure = (message) => {
  Toastr.warning(message, '', { timeOut: 1000  });
};
