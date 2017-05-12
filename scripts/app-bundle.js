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
    config.globalResources(['./elements/audio-recorder']);
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
    }

    MainPage.prototype.activate = function activate() {
      this.initDataModel();
    };

    MainPage.prototype.attached = function attached() {
      this.audioPlayer = new window.Audio();
    };

    MainPage.prototype.initDataModel = function initDataModel() {
      this.recordingForWordId = null;
      this.pronunciationLoadMap = {};
      this.pronunciationCache = {};
      this.queryStoredInBackend = true;
      this.isLoadingWords = false;
      this.wordsLoadedPct = 0;
      this.isLoadingAudio = false;
      this.audioLoadedPct = 0;
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
      this.recordingForWordId = wordId;
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

    return DataAPI;
  }()) || _class);
});
define('resources/elements/audio-recorder',['exports', '../../lib/custom-audio-recorder'], function (exports, _customAudioRecorder) {
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

  var AudioRecorder = exports.AudioRecorder = function () {
    function AudioRecorder() {
      _classCallCheck(this, AudioRecorder);

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
      this.audioBlob = null;
      this.isRecording = true;
      this.recorder.startRecording();
    };

    AudioRecorder.prototype.stopRecording = function stopRecording() {
      this.isRecording = false;
      this.isProcessingRecording = true;
      this.recorder.stopRecording();
    };

    AudioRecorder.prototype.playRecording = function playRecording() {
      this.recorder.play();
    };

    AudioRecorder.prototype.detached = function detached() {
      this.resetDataModel();
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
  }();
});
define('text!app.html', ['module'], function(module) { module.exports = "<template><div class=\"container\"><router-view></router-view></div></template>"; });
define('text!containers/main-page/main-page.html', ['module'], function(module) { module.exports = "<template><require from=\"./main-page.css\"></require><div class=\"page-header\" id=\"banner\"><div class=\"row\"><div class=\"col-lg-8 col-md-7 col-sm-6\"><h1>Word.ly</h1><p class=\"lead\">Explore and share pronunciations</p></div></div></div><div class=\"row\"><div class=\"col-sm-12\"><input type=\"text\" placeholder=\"Start typing to find or register words...\" class=\"form-control\" value.bind=\"query\"><template if.bind=\"!queryStoredInBackend && normalizedQuery\"><span>'${normalizedQuery}' does not have an exact match. <a href=\"#\">Register this word?</a></span></template></div></div><hr><div class=\"row\"><div class=\"col-sm-12\"><div if.bind=\"isLoadingWords\" class=\"progress progress-striped active\"><div class=\"progress-bar\" css=\"width: ${wordsLoadedPct}%;\"></div></div><template if.bind=\"!isLoadingWords && queryResult.length\"><ul class=\"list-group\"><li repeat.for=\"wordResult of queryResult\" class=\"list-group-item\"><h4>${wordResult.word}</h4><div class=\"btn-group btn-group-justified word-controls-group ${pronunciationLoadMap[wordResult.id].isAudioLoading ? '' : 'not-loading'}\" role=\"group\"><div class=\"btn-group\"><button disabled.bind=\"pronunciationLoadMap[wordResult.id].isAudioLoading\" click.delegate=\"playPronunciation(wordResult.id)\" class=\"btn btn-default\"><i if.bind=\"!pronunciationLoadMap[wordResult.id].isAudioLoading\" class=\"fa fa-music\"></i> <i if.bind=\"pronunciationLoadMap[wordResult.id].isAudioLoading\" class=\"fa fa-circle-o-notch fa-spin\"></i> Listen</button></div><div class=\"btn-group\"><button class=\"btn btn-default ${recordingForWordId === wordResult.id ? 'active' : null}\" click.delegate=\"handleRecordPronunciationClick(wordResult.id)\"><i class=\"fa fa-microphone\"></i> Record</button></div><div class=\"btn-group\"><button class=\"btn btn-default\"><i class=\"fa fa-upload\"></i> Upload</button></div></div><div if.bind=\"pronunciationLoadMap[wordResult.id].isAudioLoading\" class=\"progress progress-striped active\"><div class=\"progress-bar\" css=\"width: ${pronunciationLoadMap[wordResult.id].audioLoadedPct}%;\"></div></div><audio-recorder if.bind=\"recordingForWordId === wordResult.id\"></audio-recorder></li></ul></template><template if.bind=\"!isLoadingWords && !queryResult.length && normalizedQuery\"><h4>No results for '${normalizedQuery}'</h4></template></div></div></template>"; });
define('text!containers/main-page/main-page.css', ['module'], function(module) { module.exports = ".progress {\n  margin-bottom: 0 !important; }\n\n.word-controls-group.not-loading {\n  margin-bottom: 6px; }\n"; });
define('text!resources/elements/audio-recorder.html', ['module'], function(module) { module.exports = "<template><div if.bind=\"hasPermission && isAttached\" class=\"btn-group btn-group-justified\"><div class=\"btn-group\"><button if.bind=\"!isRecording\" click.delegate=\"startRecording()\" class=\"btn btn-default btn-primary\"><i class=\"fa fa-circle\"></i> Start</button> <button if.bind=\"isRecording\" click.delegate=\"stopRecording()\" class=\"btn btn-default btn-danger\"><i class=\"fa fa-stop\"></i> Stop</button></div><div class=\"btn-group\"><button disabled.bind=\"!hasAudioData || isPlaying\" class=\"btn btn-default btn-success\" click.delegate=\"playRecording()\"><i class=\"fa fa-music\"></i> ${isPlaying? 'Playing' : 'Play'}</button></div><div class=\"btn-group\"><button disabled.bind=\"!hasAudioData\" class=\"btn btn-default btn-success\"><i class=\"fa fa-save\"></i> Save</button></div></div><p if.bind=\"!hasPermission && isAttached\">You have disallowed access to your recording device.</p></template>"; });
//# sourceMappingURL=app-bundle.js.map