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
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('containers/main-page/main-page',['exports', 'aurelia-framework', '../../gateways/data/data-api'], function (exports, _aureliaFramework, _dataApi) {
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

      this.api = api;
    }

    MainPage.prototype.activate = function activate() {
      this.initDataModel();
    };

    MainPage.prototype.attached = function attached() {
      this.audioPlayer = new window.Audio();
    };

    MainPage.prototype.initDataModel = function initDataModel() {
      this.pronunciationLoadMap = {};
      this.pronunciationCache = {};
      this.isLoadingWords = false;
      this.wordsLoadedPct = 0;
      this.isLoadingAudio = false;
      this.audioLoadedPct = 0;
    };

    MainPage.prototype.queryChanged = function queryChanged() {
      var _this = this;

      this.queryResult = [];
      if (this.query) {
        this.isLoadingWords = true;
        this.loaded = 0;
        this.api.getWordsRequest(this.query).withDownloadProgressCallback(function (_ref) {
          var loaded = _ref.loaded,
              total = _ref.total;
          return _this.wordsLoadedPct = parseInt(loaded * 100.0 / total);
        }).send().then(function (response) {
          return response.content;
        }).then(function (words) {
          _this.queryResult = words;
          _this.wordsLoadedPct = 100;
          setTimeout(function () {
            _this.isLoadingWords = false;
          }, 150);
        }).catch(function (err) {
          _this.wordsLoadedPct = 100;
          setTimeout(function () {
            _this.isLoadingWords = false;
          }, 150);
        });
      }
    };

    MainPage.prototype.playPronunciation = function playPronunciation(wordId) {
      var _this2 = this;

      if (this.pronunciationCache[wordId]) {
        this.playAudioBlob(this.pronunciationCache[wordId]);
        return;
      }

      var loadMap = this.pronunciationLoadMap[wordId] = {
        isAudioLoading: true,
        audioLoadedPct: 0
      };

      this.api.getPronunciationRequest(wordId).withResponseType('blob').withDownloadProgressCallback(function (_ref2) {
        var loaded = _ref2.loaded,
            total = _ref2.total;
        loadMap.audioLoadedPct = parseInt(loaded * 100.0 / total);console.log(loadMap.audioLoadedPct);
      }).send().then(function (response) {
        return response.content;
      }).then(function (audioBlob) {
        _this2.pronunciationCache[wordId] = audioBlob;
        loadMap.audioLoadedPct = 100;
        setTimeout(function () {
          loadMap.isAudioLoading = false;
          _this2.playAudioBlob(audioBlob);
        }, 150);
      }).catch(function (err) {
        loadMap.audioLoadedPct = 100;
        setTimeout(function () {
          return loadMap.isAudioLoading = false;
        }, 150);
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

    return DataAPI;
  }()) || _class);
});
define('text!app.html', ['module'], function(module) { module.exports = "<template><div class=\"container\"><router-view></router-view></div></template>"; });
define('text!containers/main-page/main-page.css', ['module'], function(module) { module.exports = ""; });
define('text!containers/main-page/main-page.html', ['module'], function(module) { module.exports = "<template><require from=\"./main-page.css\"></require><div class=\"page-header\" id=\"banner\"><div class=\"row\"><div class=\"col-lg-8 col-md-7 col-sm-6\"><h1>Word.ly</h1><p class=\"lead\">Explore and share pronunciations</p></div></div></div><div class=\"row\"><div class=\"col-sm-12\"><input type=\"text\" placeholder=\"Start typing to find words...\" class=\"form-control\" value.bind=\"query\"></div></div><hr><div class=\"row\"><div class=\"col-sm-12\"><div if.bind=\"isLoadingWords\" class=\"progress progress-striped active\"><div class=\"progress-bar\" css=\"width: ${wordsLoadedPct}%;\"></div></div><template if.bind=\"!isLoadingWords && queryResult.length\"><ul class=\"list-group\"><li repeat.for=\"wordResult of queryResult\" class=\"list-group-item\"><h4>${wordResult.word} <small>${wordResult.id}</small></h4><div if.bind=\"loadMap[wordResult.id].isAudioLoading\" class=\"progress progress-striped active\">${loadMap[wordResult.id].audioLoadedPct}%<div class=\"progress-bar\" css=\"width: ${loadMap[wordResult.id].audioLoadedPct}%;\"></div></div><button click.delegate=\"playPronunciation(wordResult.id)\" class=\"btn btn-default\"><i class=\"fa fa-music\"></i> Listen</button> <button class=\"btn btn-default\"><i class=\"fa fa-microphone\"></i> Record</button></li></ul></template></div></div></template>"; });
//# sourceMappingURL=app-bundle.js.map