define('app',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function () {
    function App() {
      _classCallCheck(this, App);
    }

    App.prototype.configureRouter = function configureRouter(cfg, router) {
      this.router = router;
      cfg.title = 'Word.ly';

      cfg.map([{
        route: '',
        name: 'main',
        moduleId: 'containers/main-page/main-page'
      }]);
    };

    return App;
  }();
});
define('environment',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true,
    gatewayRootURL: 'http://localhost:8080'
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('lib/custom-audio-recorder',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var AudioRecorder = function () {
    function AudioRecorder(recordingStopSuccessCallback, recordingStopErrorCallback) {
      _classCallCheck(this, AudioRecorder);

      this.permission = false;
      this.outputType = 'audio/mp3; codecs=opus';
      this.shouldLoop = false;
      this.playing = false;

      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      this.recordingStopSuccessCallback = recordingStopSuccessCallback;
      this.recordingStopErrorCallback = recordingStopErrorCallback;
    }

    AudioRecorder.prototype.requestPermission = function requestPermission() {
      var _this = this;

      if (navigator.getUserMedia) {
        var constraints = { audio: true };
        var chunks = [];

        var onSuccess = function onSuccess(stream) {
          _this.mediaRecorder = new MediaRecorder(stream);
          _this.mediaStream = stream;

          _this.mediaRecorder.onstop = function (e) {
            var clipContainer = document.createElement('article');
            clipContainer.classList.add('clip');
            _this.audio = document.createElement('audio');
            _this.audio.setAttribute('controls', '');
            clipContainer.appendChild(_this.audio);

            _this.audio.controls = true;
            var blob = new Blob(chunks, { 'type': _this.outputType });
            chunks = [];
            var audioURL = window.URL.createObjectURL(blob);
            _this.audio.src = audioURL;
            _this.blob = blob;

            if (typeof _this.recordingStopSuccessCallback === 'function') {
              _this.recordingStopSuccessCallback(blob);
            }
          };

          _this.mediaRecorder.ondataavailable = function (e) {
            chunks.push(e.data);
          };
        };

        var onError = function onError(err) {
          if (typeof _this.recordingStopErrorCallback === 'function') {
            _this.recordingStopErrorCallback(err);
          }
        };

        this.permission = true;
        navigator.getUserMedia(constraints, onSuccess, onError);
      }
    };

    AudioRecorder.prototype.startRecording = function startRecording() {
      if (this.mediaRecorder !== null) {
        this.mediaRecorder.start();
      }
    };

    AudioRecorder.prototype.stopRecording = function stopRecording() {
      if (this.mediaRecorder !== null) {
        this.mediaRecorder.stop();
      }
    };

    AudioRecorder.prototype.play = function play() {
      if (this.audio !== null) {
        this.audio.play();
        this.playing = true;
      }
    };

    AudioRecorder.prototype.pause = function pause() {
      if (this.audio !== null) {
        this.audio.pause();
        this.playing = false;
      }
    };

    AudioRecorder.prototype.stop = function stop() {
      if (this.audio !== null) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playing = false;
      }
    };

    AudioRecorder.prototype.loop = function loop(bool) {
      if (this.audio !== null) {
        bool === true ? this.audio.loop = true : this.audio.loop = false;
      }
    };

    AudioRecorder.prototype.stepBackward = function stepBackward() {
      if (this.audio !== null) {
        this.audio.currentTime = 0;
      }
    };

    AudioRecorder.prototype.stepForward = function stepForward() {
      if (this.audio !== null) {
        this.audio.currentTime = this.audio.duration;
      }
    };

    AudioRecorder.prototype.clear = function clear() {
      this.audio = null;
      this.playing = false;
    };

    AudioRecorder.prototype.setOutputFileType = function setOutputFileType(fileType) {
      this.outputType = 'audio/' + fileType + '; codecs=opus';
    };

    AudioRecorder.prototype.hasPermission = function hasPermission() {
      if (this.permission === undefined) return false;
      return this.permission === true ? true : false;
    };

    AudioRecorder.prototype.isLooping = function isLooping() {
      if (this.audio !== null && typeof this.audio !== null && this.audio !== undefined) {
        if (this.audio.loop === true) {
          return true;
        }
        return false;
      }
      return false;
    };

    AudioRecorder.prototype.isPlaying = function isPlaying() {
      if (this.audio !== null && typeof this.audio !== null && this.audio !== undefined) {
        if (this.audio.currentTime === this.audio.duration && this.audio.loop === false || this.audio.currentTime === 0 || this.isFinished()) {
          return false;
        }
        return true;
      }
      return false;
    };

    AudioRecorder.prototype.getRecording = function getRecording() {
      if (this.audio !== null && typeof this.audio !== null && this.audio !== undefined) {
        return this.audio;
      }
      return null;
    };

    AudioRecorder.prototype.getRecordingFile = function getRecordingFile() {
      return this.blob;
    };

    AudioRecorder.prototype.getStream = function getStream() {
      if (this.mediaStream !== null && typeof this.mediaStream !== null && this.mediaStream !== undefined) {
        return this.mediaStream;
      }
      return null;
    };

    AudioRecorder.prototype.getOutputType = function getOutputType() {
      if (this.outputType !== null && typeof this.outputType !== null && this.outputType !== undefined) {
        return this.outputType;
      }
      return null;
    };

    AudioRecorder.prototype.isFinished = function isFinished() {
      if (this.audio !== null && typeof this.audio !== null && this.audio !== undefined) {
        return this.audio.ended;
      }
      return null;
    };

    return AudioRecorder;
  }();

  exports.default = AudioRecorder;
});
define('lib/word-utils',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var normalizeWord = exports.normalizeWord = function normalizeWord(word) {
    return word ? word.trim().toLowerCase() : word;
  };
});
define('resources/index',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {
    config.globalResources(['./elements/audio-recorder', './elements/file-dropper']);
  }
});
define('containers/main-page/main-page',['exports', 'aurelia-framework', '../../lib/word-utils', '../../gateways/data/data-api'], function (exports, _aureliaFramework, _wordUtils, _dataApi) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MainPage = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor;

  var MainPage = exports.MainPage = (_dec = (0, _aureliaFramework.inject)(_dataApi.DataAPI), _dec(_class = (_class2 = function () {
    function MainPage(api) {
      _classCallCheck(this, MainPage);

      _initDefineProp(this, 'query', _descriptor, this);

      this.normalizedQuery = '';

      this.api = api;
      this.handleSavePronunciation = this.handleSavePronunciation.bind(this);
    }

    MainPage.prototype.activate = function activate() {
      this.initDataModel();
    };

    MainPage.prototype.attached = function attached() {
      this.audioPlayer = new window.Audio();
    };

    MainPage.prototype.initDataModel = function initDataModel() {
      this.uploadingForWordId = null;
      this.recordingForWordId = null;
      this.isUploadingRecording = false;

      this.pronunciationLoadMap = {};
      this.pronunciationCache = {};
      this.queryStoredInBackend = true;

      this.isLoadingWords = false;
      this.wordsLoadedPct = 0;
    };

    MainPage.prototype.queryChanged = function queryChanged() {
      var _this = this;

      var normalizedQuery = this.normalizedQuery = (0, _wordUtils.normalizeWord)(this.query);
      this.queryResult = [];
      this.queryStoredInBackend = true;
      if (normalizedQuery) {
        this.isLoadingWords = true;
        this.loaded = 0;

        var doneLoading = function doneLoading(words) {
          _this.wordsLoadedPct = 100;
          setTimeout(function () {
            _this.isLoadingWords = false;
            _this.queryStoredInBackend = typeof words.find(function (word) {
              return word.word === normalizedQuery;
            }) !== 'undefined';
            _this.queryResult = words;
          }, 150);
        };

        this.api.getWordsRequest(normalizedQuery).withDownloadProgressCallback(function (_ref) {
          var loaded = _ref.loaded,
              total = _ref.total;
          return _this.wordsLoadedPct = parseInt(loaded * 100.0 / total, 10);
        }).send().then(function (response) {
          var words = response.content;
          doneLoading(words);
        }).catch(function (err) {
          doneLoading();
        });
      }
    };

    MainPage.prototype.playPronunciation = function playPronunciation(wordId) {
      var _this2 = this;

      var lastModified = void 0;
      if (this.pronunciationCache[wordId]) {
        var prevPronunciation = this.pronunciationCache[wordId];
        var hasNotChanged = true;
        this.api.getWordRequest(wordId).send().then(function (response) {
          var word = response.content;
          lastModified = word.lastModified;
          hasNotChanged = prevPronunciation.lastModified === lastModified;
        });

        if (hasNotChanged) {
          this.playAudioBlob(prevPronunciation.audioBlob);
          return;
        }
      }

      var loadMap = this.pronunciationLoadMap[wordId] = {
        isAudioLoading: true,
        audioLoadedPct: 0
      };
      var doneLoading = function doneLoading(audioBlob) {
        loadMap.audioLoadedPct = 100;
        setTimeout(function () {
          loadMap.isAudioLoading = false;
          if (audioBlob) {
            _this2.playAudioBlob(audioBlob);
          }
        }, 150);
      };

      this.api.getPronunciationRequest(wordId).withResponseType('blob').withDownloadProgressCallback(function (_ref2) {
        var loaded = _ref2.loaded,
            total = _ref2.total;
        return loadMap.audioLoadedPct = parseInt(loaded * 100.0 / total, 10);
      }).send().then(function (response) {
        var audioBlob = response.content;
        _this2.pronunciationCache[wordId] = { audioBlob: audioBlob, lastModified: lastModified };
        doneLoading(audioBlob);
      }).catch(function (err) {
        doneLoading();
      });
    };

    MainPage.prototype.handleRecordPronunciationClick = function handleRecordPronunciationClick(wordId) {
      this.uploadingForWordId = null;
      if (this.recordingForWordId === wordId) {
        this.recordingForWordId = null;
        return;
      }
      this.recordingForWordId = wordId;
    };

    MainPage.prototype.handleUploadPronunciationClick = function handleUploadPronunciationClick(wordId) {
      this.recordingForWordId = null;
      if (this.uploadingForWordId === wordId) {
        this.uploadingForWordId = null;
        return;
      }
      this.uploadingForWordId = wordId;
    };

    MainPage.prototype.handleSavePronunciation = function handleSavePronunciation(audioBlob) {
      var _this3 = this;

      this.isUploadingRecording = true;
      this.api.getWordPronunciationUpdateRequest(this.recordingForWordId, audioBlob).send().then(function () {
        _this3.isUploadingRecording = false;
        _this3.recordingForWordId = null;
      }).catch(function (err) {
        console.warn(err);
        _this3.isUploadingRecording = false;
      });
    };

    MainPage.prototype.playAudioBlob = function playAudioBlob(audioBlob) {
      this.audioPlayer.src = window.URL.createObjectURL(audioBlob);
      this.audioPlayer.play();
    };

    return MainPage;
  }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'query', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return '';
    }
  })), _class2)) || _class);
});
define('gateways/data/data-api',['exports', 'aurelia-framework', 'aurelia-http-client', '../../environment'], function (exports, _aureliaFramework, _aureliaHttpClient, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DataAPI = undefined;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var DataAPI = exports.DataAPI = (_dec = (0, _aureliaFramework.inject)(_aureliaHttpClient.HttpClient), _dec(_class = function () {
    function DataAPI(client) {
      _classCallCheck(this, DataAPI);

      this.client = client.configure(function (cfg) {
        return cfg.withBaseUrl(_environment2.default.gatewayRootURL);
      });
    }

    DataAPI.prototype.getWordsRequest = function getWordsRequest(prefix) {
      return this.client.createRequest('/words?query=' + prefix).asGet();
    };

    DataAPI.prototype.getPronunciationRequest = function getPronunciationRequest(wordId) {
      return this.client.createRequest('/words/' + wordId + '/pronunciation').asGet();
    };

    DataAPI.prototype.getWordRequest = function getWordRequest(wordId) {
      return this.client.createRequest('/words/' + wordId).asGet();
    };

    DataAPI.prototype.getWordPronunciationUpdateRequest = function getWordPronunciationUpdateRequest(wordId, audioBlob) {
      var formData = new FormData();
      formData.append('pronunciation', audioBlob);
      return this.client.createRequest('/words/' + wordId + '/pronunciation').asPut().withContent(formData);
    };

    DataAPI.prototype.getWordCreationRequest = function getWordCreationRequest(word, audioBlob) {
      return this.client.createRequest('/words').asPut();
    };

    return DataAPI;
  }()) || _class);
});
define('resources/elements/audio-recorder',['exports', 'aurelia-framework', '../../lib/custom-audio-recorder'], function (exports, _aureliaFramework, _customAudioRecorder) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AudioRecorder = undefined;

  var _customAudioRecorder2 = _interopRequireDefault(_customAudioRecorder);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3;

  var AudioRecorder = exports.AudioRecorder = (_class = function () {
    function AudioRecorder() {
      _classCallCheck(this, AudioRecorder);

      _initDefineProp(this, 'save', _descriptor, this);

      _initDefineProp(this, 'isSaving', _descriptor2, this);

      _initDefineProp(this, 'durationSeconds', _descriptor3, this);

      this.initDataModel();
      this.onRecorderSuccess = this.onRecorderSuccess.bind(this);
    }

    AudioRecorder.prototype.initDataModel = function initDataModel() {
      this.isAttached = false;
      this.isRecording = false;
      this.isProcessingRecording = false;
      this.audioBlob = null;
    };

    AudioRecorder.prototype.resetDataModel = function resetDataModel() {
      this.initDataModel();
    };

    AudioRecorder.prototype.attached = function attached() {
      var recorder = this.recorder = new _customAudioRecorder2.default(this.onRecorderSuccess);
      this.isAttached = true;
      if (!recorder.hasPermission()) {
        recorder.requestPermission();
      }
    };

    AudioRecorder.prototype.onRecorderSuccess = function onRecorderSuccess(audioBlob) {
      this.audioBlob = audioBlob;
      this.isProcessingRecording = false;
    };

    AudioRecorder.prototype.startRecording = function startRecording() {
      var _this = this;

      this.audioBlob = null;
      this.isRecording = true;
      this.timeLeft = parseInt(this.durationSeconds, 10);
      var killTimeMillis = new Date().getTime() + this.timeLeft * 1000;
      this.countdownInterval = setInterval(function () {
        var currTimeMillis = new Date().getTime();
        var currTimeLeft = parseInt(Math.round((killTimeMillis - currTimeMillis) / 1000.0, 0), 10);
        _this.timeLeft = currTimeLeft >= 0 ? currTimeLeft : 0;
        if (currTimeMillis >= killTimeMillis) {
          _this.stopRecording();
        }
      }, 1000);
      this.recorder.startRecording();
    };

    AudioRecorder.prototype.stopRecording = function stopRecording() {
      this.isRecording = false;
      this.isProcessingRecording = true;
      this.recorder.stopRecording();
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    };

    AudioRecorder.prototype.playRecording = function playRecording() {
      this.recorder.play();
    };

    AudioRecorder.prototype.detached = function detached() {
      this.resetDataModel();
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    };

    AudioRecorder.prototype.handleSaveClicked = function handleSaveClicked() {
      if (typeof this.save === 'function') {
        this.save(this.audioBlob);
      } else {
        console.warn('No save callback provided');
      }
    };

    _createClass(AudioRecorder, [{
      key: 'hasPermission',
      get: function get() {
        return this.recorder && this.recorder.hasPermission();
      }
    }, {
      key: 'hasAudioData',
      get: function get() {
        return this.audioBlob;
      }
    }, {
      key: 'isPlaying',
      get: function get() {
        return this.recorder.isPlaying();
      }
    }]);

    return AudioRecorder;
  }(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'save', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'isSaving', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return false;
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, 'durationSeconds', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 10;
    }
  })), _class);
});
define('resources/elements/file-dropper',['exports', 'aurelia-framework', 'jquery'], function (exports, _aureliaFramework) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.FileDropper = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2;

  var FileDropper = exports.FileDropper = (_dec = (0, _aureliaFramework.inject)(Element), _dec(_class = (_class2 = function () {
    function FileDropper(element) {
      _classCallCheck(this, FileDropper);

      _initDefineProp(this, 'stagedFile', _descriptor, this);

      _initDefineProp(this, 'validateStagedFile', _descriptor2, this);

      this.element = element;
    }

    FileDropper.prototype.attached = function attached() {
      this.initializeDataModel();
      this.initializeDOMHooks();
      this.wireEventListeners();
    };

    FileDropper.prototype.initializeDataModel = function initializeDataModel() {
      this.stagedFileErrors = [];
    };

    FileDropper.prototype.initializeDOMHooks = function initializeDOMHooks() {
      this.$element = $(this.element);
      this.$dropzone = this.$element.find('.dropzone');
      this.$fileInput = this.$dropzone.find('input[type="file"]');
    };

    FileDropper.prototype.wireEventListeners = function wireEventListeners() {
      var _this = this;

      var $fileInput = this.$fileInput;
      var $dropzone = this.$dropzone;

      var isAdvancedUpload = function () {
        var div = document.createElement('div');
        return ('draggable' in div || 'ondragstart' in div && 'ondrop' in div) && 'FormData' in window && 'FileReader' in window;
      }();

      $fileInput.on('change', function (e) {
        var fileList = e.target.files;
        _this.handleNewFileList(fileList);
      });

      $dropzone.on('click', function (e) {
        $fileInput.click();
      });

      $fileInput.on('click', function (e) {
        e.stopPropagation();
      });

      if (isAdvancedUpload) {
        $dropzone.addClass('has-advanced-upload').on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
          e.preventDefault();
          e.stopPropagation();
        }).on('dragover dragenter', function () {
          $dropzone.addClass('is-dragover');
        }).on('dragleave dragend drop', function () {
          $dropzone.removeClass('is-dragover');
        }).on('drop', function (e) {
          var fileList = e.originalEvent.dataTransfer.files;
          _this.handleNewFileList(fileList);
        });
      }
    };

    FileDropper.prototype.handleNewFileList = function handleNewFileList(fileList) {
      if (fileList.length) {
        var stagedFile = this.stagedFile = fileList[0];
        console.log(stagedFile);
        if (typeof this.validateStagedFile === 'function') {
          this.stagedFileErrors = validateStagedFile(stagedFile);
        } else {
          this.stagedFileErrors = [];
        }
      } else {
        this.stagedFile = null;
      }
    };

    FileDropper.prototype.detached = function detached() {
      this.stagedFile = null;
    };

    FileDropper.prototype.getByteSizes = function getByteSizes(bytes) {
      return {
        kiloBytes: parseInt(Math.round(bytes / 1000.0, 0), 10),
        megaBytes: parseInt(Math.round(bytes / 1000000.0, 0), 10)
      };
    };

    FileDropper.prototype.getFileSizeString = function getFileSizeString(file) {
      var byteSizes = this.getByteSizes(file.size);
      if (byteSizes.megaBytes) {
        return '~' + byteSizes.megaBytes + ' MB';
      }

      return '~' + byteSizes.kiloBytes + ' MB';
    };

    _createClass(FileDropper, [{
      key: 'hasStagedFile',
      get: function get() {
        return this.stagedFile;
      }
    }, {
      key: 'isStagedFileValid',
      get: function get() {
        return this.stagedFile && !this.stagedFileErrors.length;
      }
    }]);

    return FileDropper;
  }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'stagedFile', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'validateStagedFile', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class);
});
define('text!app.html', ['module'], function(module) { module.exports = "<template><div class=\"container\"><router-view></router-view></div></template>"; });
define('text!containers/main-page/main-page.html', ['module'], function(module) { module.exports = "<template><require from=\"./main-page.css\"></require><div class=\"page-header\" id=\"banner\"><div class=\"row\"><div class=\"col-lg-8 col-md-7 col-sm-6\"><h1>Word.ly</h1><p class=\"lead\">Explore and share pronunciations</p></div></div></div><div class=\"row\"><div class=\"col-sm-12\"><input type=\"text\" placeholder=\"Start typing to find or register words...\" class=\"form-control\" value.bind=\"query\"><template if.bind=\"!queryStoredInBackend && normalizedQuery\"><span>'${normalizedQuery}' does not have an exact match. <a href=\"#\">Register this word?</a></span></template></div></div><hr><div class=\"row\"><div class=\"col-sm-12\"><div if.bind=\"isLoadingWords\" class=\"progress progress-striped active\"><div class=\"progress-bar\" css=\"width: ${wordsLoadedPct}%;\"></div></div><template if.bind=\"!isLoadingWords && queryResult.length\"><ul class=\"list-group\"><li repeat.for=\"wordResult of queryResult\" class=\"list-group-item\"><h4>${wordResult.word}</h4><div class=\"btn-group btn-group-justified word-controls-group ${pronunciationLoadMap[wordResult.id].isAudioLoading ? '' : 'not-loading'}\" role=\"group\"><div class=\"btn-group\"><button disabled.bind=\"pronunciationLoadMap[wordResult.id].isAudioLoading\" click.delegate=\"playPronunciation(wordResult.id)\" class=\"btn btn-default\"><i if.bind=\"!pronunciationLoadMap[wordResult.id].isAudioLoading\" class=\"fa fa-music\"></i> <i if.bind=\"pronunciationLoadMap[wordResult.id].isAudioLoading\" class=\"fa fa-circle-o-notch fa-spin\"></i> Listen</button></div><div class=\"btn-group\"><button disabled.bind=\"isUploadingRecording\" class=\"btn btn-default ${recordingForWordId === wordResult.id ? 'active' : null}\" click.delegate=\"handleRecordPronunciationClick(wordResult.id)\"><i class=\"fa fa-microphone\"></i> ${recordingForWordId === wordResult.id ? 'Cancel' : 'Record'}</button></div><div class=\"btn-group\"><button disabled.bind=\"isUploadingRecording\" class=\"btn btn-default ${uploadingForWordId === wordResult.id ? 'active' : null}\" click.delegate=\"handleUploadPronunciationClick(wordResult.id)\"><i class=\"fa fa-upload\"></i> ${uploadingForWordId === wordResult.id ? 'Cancel' : 'Upload'}</button></div></div><div if.bind=\"pronunciationLoadMap[wordResult.id].isAudioLoading\" class=\"progress progress-striped active\"><div class=\"progress-bar\" css=\"width: ${pronunciationLoadMap[wordResult.id].audioLoadedPct}%;\"></div></div><audio-recorder duration-seconds=\"5\" save.bind=\"handleSavePronunciation\" is-saving.bind=\"isUploadingRecording\" if.bind=\"recordingForWordId === wordResult.id\"></audio-recorder><file-dropper if.bind=\"uploadingForWordId === wordResult.id\"></file-dropper></li></ul></template><template if.bind=\"!isLoadingWords && !queryResult.length && normalizedQuery\"><h4>No results for '${normalizedQuery}'</h4></template></div></div></template>"; });
define('text!containers/main-page/main-page.css', ['module'], function(module) { module.exports = ".progress {\n  margin-bottom: 0 !important; }\n\n.word-controls-group.not-loading {\n  margin-bottom: 6px; }\n"; });
define('text!resources/elements/audio-recorder.html', ['module'], function(module) { module.exports = "<template><div if.bind=\"hasPermission && isAttached\" class=\"btn-group btn-group-justified\"><div class=\"btn-group\"><button if.bind=\"!isRecording\" disabled.bind=\"isSaving || isPlaying\" click.delegate=\"startRecording()\" class=\"btn btn-default btn-primary\"><i class=\"fa fa-circle\"></i> ${hasAudioData? 'Restart' : 'Start'}</button> <button if.bind=\"isRecording\" click.delegate=\"stopRecording()\" disabled.bind=\"isSaving\" class=\"btn btn-default btn-danger\"><i class=\"fa fa-stop\"></i> Stop (${timeLeft})</button></div><div class=\"btn-group\"><button disabled.bind=\"!hasAudioData || isPlaying || isSaving\" class=\"btn btn-default\" click.delegate=\"playRecording()\"><i class=\"fa fa-music\"></i> ${isPlaying? 'Playing' : 'Play'}</button></div><div class=\"btn-group\"><button disabled.bind=\"!hasAudioData || isSaving\" click.delegate=\"handleSaveClicked()\" class=\"btn btn-default btn-success\"><i if.bind=\"!isSaving\" class=\"fa fa-save\"></i> <i if.bind=\"isSaving\" class=\"fa fa-circle-o-notch fa-spin\"></i> ${isSaving? 'Saving...' : 'Save'}</button></div></div><p if.bind=\"!hasPermission && isAttached\">You have disallowed access to your recording device.</p></template>"; });
define('text!resources/elements/file-dropper.css', ['module'], function(module) { module.exports = ".dropzone {\n  font-size: 1.25rem;\n  background-color: #f1f0f0;\n  position: relative;\n  padding-top: 25px;\n  padding-bottom: 25px;\n  cursor: pointer;\n  margin-bottom: 10px; }\n\n.dropzone.has-advanced-upload {\n  outline: 2px dashed #92b0b3;\n  outline-offset: -10px;\n  -webkit-transition: outline-offset .15s ease-in-out, background-color .15s linear;\n  transition: outline-offset .15s ease-in-out, background-color .15s linear; }\n\n.dropzone.is-dragover {\n  outline-offset: -20px;\n  outline-color: #f1f0f0;\n  background-color: #fff; }\n\n.dropzone_dragdrop,\n.dropzone_icon {\n  display: none; }\n\n.dropzone.has-advanced-upload .dropzone_dragdrop {\n  display: inline; }\n\n.dropzone.has-advanced-upload .dropzone_icon {\n  width: 100%;\n  height: 80px;\n  fill: #92b0b3;\n  display: block;\n  margin-bottom: 40px; }\n\n.dropzone_input_ctr {\n  width: 250px;\n  margin: 0 auto; }\n\n@-webkit-keyframes appear-from-inside {\n  from {\n    -webkit-transform: translateY(-50%) scale(0); }\n  75% {\n    -webkit-transform: translateY(-50%) scale(1.1); }\n  to {\n    -webkit-transform: translateY(-50%) scale(1); } }\n\n@keyframes appear-from-inside {\n  from {\n    transform: translateY(-50%) scale(0); }\n  75% {\n    transform: translateY(-50%) scale(1.1); }\n  to {\n    transform: translateY(-50%) scale(1); } }\n\n.btn-file {\n  position: relative;\n  overflow: hidden; }\n\n.btn-file input[type=file] {\n  position: absolute;\n  top: 0;\n  right: 0;\n  min-width: 100%;\n  min-height: 100%;\n  font-size: 100px;\n  text-align: right;\n  filter: alpha(opacity=0);\n  opacity: 0;\n  outline: none;\n  background: white;\n  cursor: inherit;\n  display: block; }\n"; });
define('text!resources/elements/file-dropper.html', ['module'], function(module) { module.exports = "<template><require from=\"./file-dropper.css\"></require><div hidden.bind=\"hasStagedFile\" class=\"dropzone\"><div class=\"dropzone_input_ctr\"><svg class=\"dropzone_icon\" xmlns=\"http://www.w3.org/2000/svg\" width=\"50\" height=\"43\" viewBox=\"0 0 50 43\"><path d=\"M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z\"/></svg><label class=\"btn btn-primary btn-file btn-block dropzone_file_input\">Browse <input type=\"file\" hidden></label><label>Drag the file here or click to select</label></div></div><p if.bind=\"hasStagedFile\">${stagedFile.name} ${getFileSizeString(stagedFile)}</p><button disabled.bind=\"!(hasStagedFile && isStagedFileValid)\" class=\"btn btn-block btn-success\">Save</button></template>"; });
//# sourceMappingURL=app-bundle.js.map