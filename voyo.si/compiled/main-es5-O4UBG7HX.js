"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
(() => {
  var $e = `<div id="play" class="button !opacity-100" onclick="app.voyoVideo.playClick()">
    <svg class="icon icon_play" width="44" height="44" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/></svg><svg class="icon icon_pause" width="44" height="44" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"/></svg>
</div>
`;
  var Be = `<div id="play" class="button button-transparent player__overlay-pp" onclick="app.voyoVideo.playClick()">
    <svg class="icon icon_pause" width="44" height="44" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/></svg><svg class="icon icon_play" width="44" height="44" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"/></svg>
</div>
`;
  var b = class extends HTMLElement {
      constructor() {
        super(...arguments);
        this.template = $e;
        this.canRegisterEvents = !0;
        this.player = null;
        this.onKeyDown = t => {
          t.code !== "Space" || t.repeat || (t.preventDefault(), t.stopPropagation(), app.voyoVideo.showVideoControls(), app.voyoVideo.playClick());
        };
      }
      connectedCallback() {
        var _this$player;
        this.innerHTML = this.template, this.canRegisterEvents && (this.player = this.closest(".player"), this.player && (this.player.tabIndex = 0), (_this$player = this.player) === null || _this$player === void 0 ? void 0 : _this$player.addEventListener("keydown", this.onKeyDown));
      }
      disconnectedCallback() {
        var _this$player2;
        (_this$player2 = this.player) !== null && _this$player2 !== void 0 && _this$player2.removeEventListener("keydown", this.onKeyDown), this.player = null;
      }
    },
    w = class extends b {
      constructor() {
        super(...arguments);
        this.template = Be;
        this.canRegisterEvents = !1;
      }
    };
  var Ge = `<div id="rev" class="button"><svg class="icon" width="44" height="44" id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24"> <path d="M22.1,12.3c0,2.4-.9,4.6-2.6,6.3-1.7,1.7-3.9,2.6-6.3,2.7h-.1c-2.3,0-4.5-.9-6.2-2.5,0,0-.1-.1-.2-.2,0,0,0-.2,0-.3,0,0,0-.2,0-.3,0,0,0-.2.2-.2,0,0,.1-.1.2-.2,0,0,.2,0,.3,0,0,0,.2,0,.3,0,0,0,.2,0,.2.2,1.1,1,2.4,1.7,3.9,1.9,1.5.3,2.9,0,4.3-.5,1.3-.6,2.5-1.6,3.3-2.8.8-1.2,1.2-2.7,1.2-4.2,0-1.5-.5-2.9-1.3-4.1-.8-1.2-2-2.2-3.4-2.7-1.4-.6-2.9-.7-4.3-.4-1.4.3-2.8,1-3.8,2,0,0,0,0,0,0l-2.5,2.3h2.6c.2,0,.4,0,.5.2.1.1.2.3.2.5s0,.4-.2.5c-.1.1-.3.2-.5.2H3.3c-.2,0-.4,0-.5-.2-.1-.1-.2-.3-.2-.5v-4.5c0-.2,0-.4.2-.5.1-.1.3-.2.5-.2s.4,0,.5.2c.1.1.2.3.2.5v2.8l2.6-2.4c1.3-1.3,2.9-2.1,4.6-2.5,1.7-.3,3.6-.2,5.2.5,1.6.7,3,1.8,4,3.3,1,1.5,1.5,3.2,1.5,5Z"/> <path d="M16.2,12.1v.8c0,.4,0,.7-.1,1,0,.3-.2.5-.3.7-.1.2-.3.3-.5.4-.2,0-.4.1-.7.1s-.4,0-.6,0c-.2,0-.3-.1-.5-.2-.1-.1-.3-.2-.3-.4,0-.2-.2-.4-.2-.6,0-.2,0-.5,0-.8v-.8c0-.4,0-.7.1-1,0-.3.2-.5.3-.7.1-.2.3-.3.5-.4.2,0,.4-.1.7-.1s.4,0,.6,0c.2,0,.3.1.5.2.1.1.3.2.3.4,0,.2.2.4.2.6,0,.2,0,.5,0,.8ZM15.3,13.1v-1.1c0-.2,0-.4,0-.5,0-.1,0-.3,0-.4,0-.1,0-.2-.2-.2,0,0-.1-.1-.2-.1,0,0-.2,0-.3,0s-.2,0-.3,0c0,0-.2.1-.2.2,0,.1-.1.2-.1.4,0,.2,0,.4,0,.6v1.1c0,.2,0,.4,0,.5,0,.1,0,.3,0,.4,0,.1,0,.2.2.3,0,0,.1.1.2.1,0,0,.2,0,.3,0s.2,0,.3,0c0,0,.2-.1.2-.2,0-.1.1-.2.1-.4,0-.2,0-.4,0-.6Z"/> <path d="M12.1,10.1v5h-.9v-3.9l-1.2.4v-.7l2-.7h.1Z"/> </svg></div>
`;
  var q = class extends HTMLElement {
      constructor() {
        super(...arguments);
        this.player = null;
        this.repeatCount = 0;
        this.onKeyDown = t => {
          var _this$throttledSeek;
          t.key === this.key && (t.stopPropagation(), t.preventDefault(), t.repeat ? (_this$throttledSeek = this.throttledSeek) === null || _this$throttledSeek === void 0 ? void 0 : _this$throttledSeek.call(this) : (this.repeatCount = 0, this.seekFromKeyboard()));
        };
        this.onKeyUp = t => {
          t.key === this.key && (this.repeatCount = 0);
        };
        this.seekFromKeyboard = () => {
          var t = Math.min(60, 10 + Math.floor(this.repeatCount / 5) * 10);
          this.repeatCount++, this.seek(t);
        };
      }
      connectedCallback() {
        var _this$querySelector;
        this.innerHTML = this.template, (_this$querySelector = this.querySelector(".button")) !== null && _this$querySelector !== void 0 && _this$querySelector.addEventListener("click", () => this.seek(10)), this.player = this.closest(".player"), this.player && (this.player.tabIndex = 0, this.throttledSeek || (this.throttledSeek = app.rateLimiter.throttle(this.seekFromKeyboard, 100)), this.player.addEventListener("keydown", this.onKeyDown), this.player.addEventListener("keyup", this.onKeyUp));
      }
      disconnectedCallback() {
        var _this$player3, _this$player4;
        (_this$player3 = this.player) !== null && _this$player3 !== void 0 && _this$player3.removeEventListener("keydown", this.onKeyDown), (_this$player4 = this.player) !== null && _this$player4 !== void 0 && _this$player4.removeEventListener("keyup", this.onKeyUp), this.player = null;
      }
    },
    T = q;
  var D = class extends T {
      constructor() {
        super(...arguments);
        this.key = "ArrowLeft";
        this.template = Ge;
        this.seekHandler = t => app.voyoVideo.revClick(t);
      }
      registerSeekHandler(t) {
        this.seekHandler = t;
      }
      seek(t) {
        this.seekHandler(t);
      }
    },
    Oe = D;
  var Fe = `<div id="ff" class="button"><svg class="icon" width="44" height="44" id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24"> <path d="M2.6,12.3c0,2.4.9,4.6,2.6,6.3,1.7,1.7,3.9,2.6,6.3,2.7h.1c2.3,0,4.5-.9,6.2-2.5,0,0,.1-.1.2-.2,0,0,0-.2,0-.3,0,0,0-.2,0-.3,0,0,0-.2-.2-.2,0,0-.1-.1-.2-.2,0,0-.2,0-.3,0,0,0-.2,0-.3,0,0,0-.2,0-.2.2-1.1,1-2.4,1.7-3.9,1.9-1.5.3-2.9,0-4.3-.5-1.3-.6-2.5-1.6-3.3-2.8-.8-1.2-1.2-2.7-1.2-4.2,0-1.5.5-2.9,1.3-4.1.8-1.2,2-2.2,3.4-2.7,1.4-.6,2.9-.7,4.3-.4,1.4.3,2.8,1,3.8,2,0,0,0,0,0,0l2.5,2.3h-2.6c-.2,0-.4,0-.5.2-.1.1-.2.3-.2.5s0,.4.2.5c.1.1.3.2.5.2h4.5c.2,0,.4,0,.5-.2.1-.1.2-.3.2-.5v-4.5c0-.2,0-.4-.2-.5-.1-.1-.3-.2-.5-.2s-.4,0-.5.2c-.1.1-.2.3-.2.5v2.8l-2.6-2.4c-1.3-1.3-2.9-2.1-4.6-2.5-1.7-.3-3.6-.2-5.2.5-1.6.7-3,1.8-4,3.3-1,1.5-1.5,3.2-1.5,5Z"/> <path d="M14.2,12.1v.8c0,.4,0,.7-.1,1,0,.3-.2.5-.3.7-.1.2-.3.3-.5.4-.2,0-.4.1-.7.1s-.4,0-.6,0c-.2,0-.3-.1-.5-.2-.1-.1-.3-.2-.3-.4,0-.2-.2-.4-.2-.6,0-.2,0-.5,0-.8v-.8c0-.4,0-.7.1-1,0-.3.2-.5.3-.7.1-.2.3-.3.5-.4.2,0,.4-.1.7-.1s.4,0,.6,0c.2,0,.3.1.5.2.1.1.3.2.3.4,0,.2.2.4.2.6,0,.2,0,.5,0,.8ZM13.3,13.1v-1.1c0-.2,0-.4,0-.5,0-.1,0-.3,0-.4,0-.1,0-.2-.2-.2,0,0-.1-.1-.2-.1,0,0-.2,0-.3,0s-.2,0-.3,0c0,0-.2.1-.2.2,0,.1-.1.2-.1.4,0,.2,0,.4,0,.6v1.1c0,.2,0,.4,0,.5,0,.1,0,.3,0,.4,0,.1,0,.2.2.3,0,0,.1.1.2.1,0,0,.2,0,.3,0s.2,0,.3,0c0,0,.2-.1.2-.2,0-.1.1-.2.1-.4,0-.2,0-.4,0-.6Z"/> <path d="M10.1,10.1v5h-.9v-3.9l-1.2.4v-.7l2-.7h.1Z"/> </svg></div>
`;
  var H = class extends T {
      constructor() {
        super(...arguments);
        this.key = "ArrowRight";
        this.template = Fe;
        this.seekHandler = t => app.voyoVideo.ffClick(t);
      }
      registerSeekHandler(t) {
        this.seekHandler = t;
      }
      seek(t) {
        this.seekHandler(t);
      }
    },
    Re = H;
  var je = `<div class="volume__control button">
    <button class="volume__button">
        <svg class="volume__icon" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M163.51,24.81a8,8,0,0,0-8.42.88L85.25,80H40A16,16,0,0,0,24,96v64a16,16,0,0,0,16,16H85.25l69.84,54.31A8,8,0,0,0,168,224V32A8,8,0,0,0,163.51,24.81ZM152,207.64,92.91,161.69A7.94,7.94,0,0,0,88,160H40V96H88a7.94,7.94,0,0,0,4.91-1.69L152,48.36ZM208,104v48a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v80a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"/></svg>
        <svg class="volume__icon-muted hidden" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M192,152V104a8,8,0,0,1,16,0v48a8,8,0,0,1-16,0Zm40-72a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,232,80ZM221.92,210.62a8,8,0,1,1-11.84,10.76L168,175.09V224a8,8,0,0,1-12.91,6.31L85.25,176H40a16,16,0,0,1-16-16V96A16,16,0,0,1,40,80H81.55L50.08,45.38A8,8,0,0,1,61.92,34.62ZM152,157.49,96.1,96H40v64H88a7.94,7.94,0,0,1,4.91,1.69L152,207.64ZM125.06,69.31l26.94-21v58.47a8,8,0,0,0,16,0V32a8,8,0,0,0-12.91-6.31l-39.85,31a8,8,0,0,0,9.82,12.63Z"/></svg>
    </button>

    <div class="volume__bar">
        <input class="volume__slider" type="range" min="0" max="1" step="0.01" value="0.75" />
    </div>
</div>
`;
  var x = class extends HTMLElement {
      connectedCallback() {
        var _this$querySelector2, _this$querySelector3;
        this.innerHTML = je, (_this$querySelector2 = this.querySelector(".volume__button")) !== null && _this$querySelector2 !== void 0 && _this$querySelector2.addEventListener("click", e => this.muteUnmute(e)), (_this$querySelector3 = this.querySelector(".volume__slider")) === null || _this$querySelector3 === void 0 ? void 0 : _this$querySelector3.addEventListener("input", e => this.setVolume(e));
      }
      muteUnmute(e) {
        config.videoVolume = app.voyoVideo.muteUnmuteVolume(e), app.saveUserOptions();
      }
      setVolume(e) {
        var t = +e.target.value;
        app.voyoVideo.setVolume(t), config.videoVolume = t, app.saveUserOptions();
      }
    },
    Qe = x;
  var Ne = `<div class="flex items-center mb-32">
    <div class="progressbar">
        <input
            class="timeline_progress"
            type="range"
            min="0"
            max="1"
            step="1"
            value="0"
        />
        <span class="catchup-ad-debug hidden" aria-hidden="true"></span>
        <div id="timeline_preview" class="timeline_preview hidden"></div>
    </div>
    <div class="progressbar__time">
        <span class="time_now">00:00</span> / <span class="duration">00:00</span>
    </div>
</div>
`;
  var _ = class extends HTMLElement {
      constructor() {
        super(...arguments);
        this.disabled = !1;
        this._startTime = 0;
        this._endTime = 0;
        this._currentTime = 0;
        this.progressBarElement = null;
        this.currentTimeElement = null;
        this.durationElement = null;
        this.showDuration = !0;
        this.thumbnailListenersRegistered = !1;
        this.seekHandler = t => app.voyoVideo.setVideoPlayback(t);
        this.seekFromInput = () => {
          if (this.disabled || !this.progressBarElement) return;
          var t = Number(this.progressBarElement.value);
          this.seekHandler(t);
        };
        this.updateProgressFromInput = () => {
          if (this.disabled || !this.progressBarElement || !this.currentTimeElement) return;
          var t = Number(this.progressBarElement.value),
            i = this._endTime - this._startTime,
            s = i > 0 ? (t - this._startTime) / i : 0;
          this.progressBarElement.style.setProperty("--timeline-percent", s * 100 + "%"), this.currentTimeElement.textContent = this.formatTime(t);
        };
        this.showThumbnailFromPointer = t => {
          if (!this.progressBarElement) return;
          var i = this.progressBarElement.getBoundingClientRect(),
            s = getComputedStyle(this.progressBarElement),
            r = Number.parseFloat(s.getPropertyValue("--timeline-thumb-width")) || 16,
            n = i.left + r / 2,
            a = i.width - r,
            l = Math.max(0, Math.min((t.clientX - n) / a, 1)),
            d = this._startTime + (this._endTime - this._startTime) * l,
            m = Math.min(Math.max(t.clientX - i.left, 0), i.width) / i.width;
          app.voyoVideo.showThumbnailPreview(Math.round(d), m);
        };
        this.hideThumbnail = () => {
          app.voyoVideo.hideThumbnailPreview();
        };
      }
      connectedCallback() {
        var _this$progressBarElem, _this$progressBarElem2;
        this.innerHTML = Ne, this.progressBarElement = this.querySelector(".timeline_progress"), this.progressBarElement && (this.progressBarElement.disabled = this.disabled), this.currentTimeElement = this.querySelector(".time_now"), this.durationElement = this.querySelector(".duration"), this.debouncedSeek || (this.debouncedSeek = app.rateLimiter.debounce(this.seekFromInput, 100)), (_this$progressBarElem = this.progressBarElement) !== null && _this$progressBarElem !== void 0 && _this$progressBarElem.addEventListener("input", this.debouncedSeek), (_this$progressBarElem2 = this.progressBarElement) === null || _this$progressBarElem2 === void 0 ? void 0 : _this$progressBarElem2.addEventListener("input", this.updateProgressFromInput);
      }
      disconnectedCallback() {
        var _this$progressBarElem3, _this$progressBarElem4, _this$progressBarElem5, _this$progressBarElem6;
        this.debouncedSeek && (_this$progressBarElem3 = this.progressBarElement) !== null && _this$progressBarElem3 !== void 0 && _this$progressBarElem3.removeEventListener("input", this.debouncedSeek), (_this$progressBarElem4 = this.progressBarElement) !== null && _this$progressBarElem4 !== void 0 && _this$progressBarElem4.removeEventListener("input", this.updateProgressFromInput), this.thumbnailListenersRegistered && ((_this$progressBarElem5 = this.progressBarElement) !== null && _this$progressBarElem5 !== void 0 && _this$progressBarElem5.removeEventListener("mousemove", this.showThumbnailFromPointer), (_this$progressBarElem6 = this.progressBarElement) === null || _this$progressBarElem6 === void 0 ? void 0 : _this$progressBarElem6.removeEventListener("mouseleave", this.hideThumbnail));
      }
      getProgressBarElement() {
        return this.progressBarElement;
      }
      setDisabled(t) {
        this.progressBarElement && (this.progressBarElement.disabled = t), this.disabled = t;
      }
      setDurationDisplay(t) {
        this.durationElement && (this.showDuration = t, this.durationElement.textContent = t ? this.formatTime(this._endTime) : "--:--");
      }
      registerThumbnailPreview() {
        var _this$progressBarElem7, _this$progressBarElem8;
        (_this$progressBarElem7 = this.progressBarElement) !== null && _this$progressBarElem7 !== void 0 && _this$progressBarElem7.addEventListener("mousemove", this.showThumbnailFromPointer), (_this$progressBarElem8 = this.progressBarElement) !== null && _this$progressBarElem8 !== void 0 && _this$progressBarElem8.addEventListener("mouseleave", this.hideThumbnail), this.thumbnailListenersRegistered = !0;
      }
      registerSeekHandler(t) {
        this.seekHandler = t;
      }
      setRange(t, i, s) {
        this._startTime = this.normaliseTime(t), this._endTime = Math.max(this._startTime, this.normaliseTime(s)), this._currentTime = Math.max(this._startTime, Math.min(this.normaliseTime(i), this._endTime)), this.render();
      }
      render() {
        if (!this.progressBarElement || !this.currentTimeElement || !this.durationElement) return;
        var t = this._endTime - this._startTime,
          i = t > 0 ? (this._currentTime - this._startTime) / t : 0;
        this.progressBarElement.min = String(this._startTime), this.progressBarElement.max = String(this._endTime), this.progressBarElement.value = String(this._currentTime), this.progressBarElement.style.setProperty("--timeline-percent", `${i * 100}%`), this.currentTimeElement.textContent = this.formatTime(this._currentTime), this.showDuration && (this.durationElement.textContent = this.formatTime(this._endTime));
      }
      normaliseTime(t) {
        return Math.max(0, t) || 0;
      }
      formatTime(t) {
        var i = Math.floor(t),
          s = Math.floor(i / 3600),
          r = Math.floor(i % 3600 / 60),
          n = i % 60;
        return s > 0 ? s + ":" + this.pad2(r) + ":" + this.pad2(n) : this.pad2(r) + ":" + this.pad2(n);
      }
      pad2(t) {
        return ("0" + t).slice(-2);
      }
    },
    We = _;
  var ze = `<div class="relative group">
    <!-- ikona podnapisov -->
    <button class="button">
        <svg class="icon" width="44" height="44" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192ZM48,136a8,8,0,0,1,8-8H72a8,8,0,0,1,0,16H56A8,8,0,0,1,48,136Zm160,0a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16h96A8,8,0,0,1,208,136Zm-48,32a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16h96A8,8,0,0,1,160,168Zm48,0a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h16A8,8,0,0,1,208,168Z"/></svg>
    </button>

    <!-- dropdown seznam podnapisov; the list is injected from the element's children -->
    <div class="popup_wrapper bottom-0 right-[4rem] xl:right-[7rem] top-[unset]">
        <div class="popup">
            <slot></slot>
        </div>
    </div>
</div>
`;
  var V = class extends HTMLElement {
      connectedCallback() {
        this.innerHTML = ze.replace("<slot></slot>", () => this.innerHTML), this.querySelectorAll(".subtitles__list").forEach(e => e.addEventListener("click", () => this.toggleSubtitle(e.id)));
      }
      toggleSubtitle(e) {
        config.showSubtitles = app.voyoVideo.toggleVideoSubtitle(e), app.saveUserOptions();
      }
    },
    Je = V;
  var Ke = `<button class="button">
    <svg class="icon" width="44" height="44" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><polyline points="168 48 208 48 208 88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="88 208 48 208 48 168" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="208 168 208 208 168 208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="48 88 48 48 88 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
</button>
`;
  var U = class extends HTMLElement {
      connectedCallback() {
        var _this$querySelector4;
        this.innerHTML = Ke;
        var e = this.getAttribute("target") || void 0;
        (_this$querySelector4 = this.querySelector("button")) === null || _this$querySelector4 === void 0 || _this$querySelector4.addEventListener("click", t => app.voyoVideo.toggleFullscreen(t, e));
      }
    },
    Ze = U;
  var Xe = `<span class="player__close">
    <a class="button button-transparent p-0 w-42 h-42" href="#"><svg class="icon" width="44" height="44" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg></a>
</span>
`;
  var $ = class extends HTMLElement {
      connectedCallback() {
        var _this$querySelector5, _this$querySelector6;
        this.innerHTML = Xe, (_this$querySelector5 = this.querySelector("a")) !== null && _this$querySelector5 !== void 0 && _this$querySelector5.setAttribute("href", this.getAttribute("href") || "#"), this.className && ((_this$querySelector6 = this.querySelector("span")) === null || _this$querySelector6 === void 0 ? void 0 : _this$querySelector6.classList.add(...Array.from(this.classList)));
      }
    },
    Ye = $;
  var B = class extends HTMLElement {
      constructor() {
        super(...arguments);
        this.form = null;
        this.length = 4;
        this.inputs = [];
        this.required = null;
        this.allowedCharacters = /^[0-9A-Za-z]+$/;
      }
      connectedCallback() {
        this.form = this.closest("form"), this.length = +(this.getAttribute("length") || 4), this.required = this.getAttribute("data-required"), this.render();
      }
      get value() {
        return this.inputs.map(t => t.value).join("");
      }
      set value(t) {
        var i = t.slice(0, this.length).toUpperCase();
        this.inputs.forEach((s, r) => {
          s.value = i[r] || "";
        });
      }
      focus() {
        var _this$inputs$;
        (_this$inputs$ = this.inputs[0]) === null || _this$inputs$ === void 0 || _this$inputs$.focus();
      }
      render() {
        this.innerHTML = "", this.hiddenInput = document.createElement("input"), this.hiddenInput.type = "hidden", this.hiddenInput.name = this.getAttribute("name") || "code", this.appendChild(this.hiddenInput), this.inputs = Array.from({
          length: this.length
        }, (t, i) => {
          var s = document.createElement("input");
          return s.type = "text", s.maxLength = 1, this.required !== null && s.setAttribute("data-required", this.required), s.addEventListener("keydown", r => this.onKeydown(r, i)), s.addEventListener("input", () => this.onInput(s, i)), s.addEventListener("paste", r => this.onPaste(r)), this.appendChild(s), s;
        });
      }
      onKeydown(t, i) {
        var s = t.target;
        if (t.key === "Backspace" || t.key === "Delete") {
          if (t.preventDefault(), s.value === "") {
            var r = this.inputs[i - 1];
            r && (r.value = "", r.focus());
          } else s.value = "";
          this.updateHiddenInput(), this.dispatchInput();
          return;
        }
        if (t.key === "ArrowLeft") {
          var _this$inputs;
          t.preventDefault(), (_this$inputs = this.inputs[i - 1]) === null || _this$inputs === void 0 ? void 0 : _this$inputs.focus();
          return;
        }
        if (t.key === "ArrowRight") {
          var _this$inputs2;
          t.preventDefault(), (_this$inputs2 = this.inputs[i + 1]) === null || _this$inputs2 === void 0 ? void 0 : _this$inputs2.focus();
          return;
        }
        if (t.key === "Enter") {
          t.preventDefault(), this.checkAndSubmit();
          return;
        }
        if (t.key.length === 1 && this.allowedCharacters.test(t.key) && !t.ctrlKey && !t.metaKey && !t.altKey) {
          var _this$inputs3;
          t.preventDefault(), s.value = t.key.toUpperCase(), (_this$inputs3 = this.inputs[i + 1]) !== null && _this$inputs3 !== void 0 && _this$inputs3.focus(), this.updateHiddenInput(), this.dispatchInput(), this.checkAndSubmit();
          return;
        }
      }
      onInput(t, i) {
        var _this$inputs4;
        if (!this.allowedCharacters.test(t.value)) {
          t.value = "";
          return;
        }
        t.value = t.value.toUpperCase(), (_this$inputs4 = this.inputs[i + 1]) !== null && _this$inputs4 !== void 0 && _this$inputs4.focus(), this.updateHiddenInput(), this.dispatchInput(), this.checkAndSubmit();
      }
      onPaste(t) {
        var _t$clipboardData, _this$inputs5;
        t.preventDefault();
        var i = ((_t$clipboardData = t.clipboardData) === null || _t$clipboardData === void 0 ? void 0 : _t$clipboardData.getData("text").trim()) || "";
        !this.allowedCharacters.test(i) || i.length !== this.length || (this.value = i, (_this$inputs5 = this.inputs[this.length - 1]) !== null && _this$inputs5 !== void 0 && _this$inputs5.focus(), this.updateHiddenInput(), this.dispatchInput(), this.checkAndSubmit());
      }
      updateHiddenInput() {
        this.hiddenInput.value = this.value;
      }
      dispatchInput() {
        this.dispatchEvent(new Event("input", {
          bubbles: !0
        }));
      }
      checkAndSubmit() {
        var _this$form;
        this.value.length === this.length && ((_this$form = this.form) === null || _this$form === void 0 ? void 0 : _this$form.requestSubmit());
      }
    },
    et = B;
  var tt = `<label class="flex gap-16 items-center mt-16 cursor-pointer">
    <input type="checkbox" class="mailing-unsubscribe__checkbox">
    <span class="text-14 !font-normal leading-[1.4]">Želim se odjaviti od prejemanja VOYO e-novic.</span>
</label>
`;
  var E = class extends HTMLElement {
    connectedCallback() {
      var _app$html$q;
      app.html.writeHTML(this, tt), (_app$html$q = app.html.q("input", this)) !== null && _app$html$q !== void 0 && _app$html$q.addEventListener("change", t => this.onChange(t)), this.syncDisabledAttribute();
    }
    attributeChangedCallback() {
      this.syncDisabledAttribute();
    }
    syncDisabledAttribute() {
      var e = app.html.q("input", this);
      e && (this.hasAttribute("disabled") ? app.html.buttonDisable(e) : app.html.buttonEnable(e));
    }
    onChange(e) {
      var i = app.html.isChecked(e.target) ? Math.floor(new Date().getTime() / 1e3) : 0;
      app.gql.userMeta("noMailingSubscribe", i.toString());
    }
  };
  E.observedAttributes = ["disabled"];
  var it = E;
  var st = `<button type="submit"><span></span></button>
`;
  var S = class extends HTMLElement {
    constructor() {
      super(...arguments);
      this.content = "";
    }
    connectedCallback() {
      this.content = this.innerHTML.trim(), app.html.writeHTML(this, st), this.button = app.html.q("button", this), this.button.className = this.className, this.className = "", this.id && (this.button.id = this.id, this.removeAttribute("id")), this.syncText(), this.syncDisabled();
    }
    attributeChangedCallback() {
      this.button && (this.syncText(), this.syncDisabled());
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(t) {
      t ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
    }
    syncText() {
      var t = app.html.q("span", this.button);
      if (t) {
        if (this.content) {
          t.innerHTML = this.content;
          return;
        }
        t.textContent = this.getAttribute("text") || "";
      }
    }
    syncDisabled() {
      this.button.disabled = this.hasAttribute("disabled") || this.hasAttribute("loading");
    }
  };
  S.observedAttributes = ["text", "disabled", "loading"];
  var rt = S;
  var ot = `<div class="button button-text button-text__right [.epg__player:not(.live)_&]:hidden"><?xml version="1.0" encoding="UTF-8"?> <svg class="icon mr-12" width="44" height="44" id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 256 256"> <!-- Generator: Adobe Illustrator 30.2.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 1) --> <defs> <style> .st0 { fill: none; } </style> </defs> <rect class="st0" y="0" width="256" height="256"/> <path d="M39.9,200c-4.2,0-8.1-1.6-11.1-4.6-3-3-4.7-7-4.8-11.2v-112.4s0,0,0,0c0-3,.9-5.9,2.5-8.5,4.7-7.4,14.6-9.5,22-4.8l88.2,56.1c1.9,1.2,3.6,2.9,4.9,4.9,4.7,7.4,2.5,17.1-4.9,21.8l-88.2,56.1c-2.5,1.6-5.4,2.5-8.4,2.5h-.1ZM40,72.1v111.8l87.8-55.9-87.8-55.9Z"/> <path d="M143.9,200c-4.2,0-8.1-1.6-11.1-4.6-3-3-4.7-7-4.8-11.2v-112.4s0,0,0,0c0-3,.9-5.9,2.5-8.5,2.3-3.6,5.8-6,10-7,4.2-.9,8.4-.1,12,2.2l88.2,56.1c1.9,1.2,3.6,2.9,4.9,4.9,4.7,7.4,2.5,17.1-4.9,21.8l-88.2,56.1c-2.5,1.6-5.4,2.5-8.4,2.5h-.1ZM144,72.1v111.8l87.8-55.9-87.8-55.9Z"/> <path d="M240,113.7v81.4c0,3.4,3.6,6.1,8,6.1s8-2.7,8-6.1V60.9c0-3.4-3.6-6.1-8-6.1s-8,2.7-8,6.1v52.8"/> </svg><span><div class="label label-live">V živo</div></span></div>
`;
  var G = class extends HTMLElement {
      connectedCallback() {
        var _this$querySelector7;
        this.innerHTML = ot, (_this$querySelector7 = this.querySelector(".button")) === null || _this$querySelector7 === void 0 ? void 0 : _this$querySelector7.addEventListener("click", () => app.voyoVideo.setVideoPlayback("end"));
      }
    },
    nt = G;
  function bs() {
    var o = document.location.pathname;
    customElements.define("submit-button", rt), (o.includes(config.routes.content) || o.startsWith(config.routes.catch_up) || o.startsWith(config.routes.profile_5ka)) && (customElements.define("voyo-play", b), customElements.define("voyo-play-overlay", w), customElements.define("voyo-rev", Oe), customElements.define("voyo-ff", Re), customElements.define("voyo-live", nt), customElements.define("voyo-volume", Qe), customElements.define("voyo-timeline", We), customElements.define("voyo-subtitles", Je), customElements.define("voyo-fullscreen", Ze), customElements.define("voyo-close", Ye)), (o.startsWith(config.routes.login) || o.startsWith(config.routes.registration)) && customElements.define("code-input", et), (o.startsWith(config.routes.activation_credit_card) || o.startsWith(config.routes.activation_step3) || o.startsWith(config.routes.activation_provider) || o.startsWith(config.routes.activation_code) || o.startsWith(config.routes.settings)) && customElements.define("voyo-mailing-unsubscribe", it);
  }
  var at = bs;
  var O = class {
      constructor(e) {
        this.id = e.id || 0, this.email = e.email || "", this.avatar = e.avatar || "", this.nickname = e.nickname || "", this.deviceId = e.deviceId || 0, this.profileId = e.profileId || 0, this.profileType = e.profileType || "", this.isSubscribed = e.isSubscribed || !1, this.token = e.token || "", this.status = e.status || 0;
      }
      get hash() {
        return this.id ? "#" + this.id + "#" + this.profileId + "#" + this.profileType + "#" : "";
      }
    },
    u = O;
  var F = class {
      constructor(e) {
        this.ip = (e === null || e === void 0 ? void 0 : e.ip) || "", this.countryCode = (e === null || e === void 0 ? void 0 : e.countryCode) || "", this.countryName = (e === null || e === void 0 ? void 0 : e.countryName) || "";
      }
    },
    lt = F;
  var R = class {
      constructor(e) {
        this.url = e.url || "", this.info = e.info || "", this.infoCode = +(e.infoCode || 0), this.license = e.license || "";
      }
    },
    dt = R;
  var y = class {
      constructor(e) {
        var _e$groups;
        this.groups = e === null || e === void 0 || (_e$groups = e.groups) === null || _e$groups === void 0 ? void 0 : _e$groups.map(t => new j(t));
      }
      groupItems(e) {
        var _this$groups;
        var t = (_this$groups = this.groups) === null || _this$groups === void 0 ? void 0 : _this$groups.find(i => i.id === e);
        return t ? t.items : [];
      }
      remove(e, t) {
        var _this$groups2;
        var i = (_this$groups2 = this.groups) === null || _this$groups2 === void 0 ? void 0 : _this$groups2.find(s => s.id === e);
        i && (i.items = i.items.filter(s => s.entityId.toString() !== t.toString()));
      }
      add(e, t) {
        var _this$groups3;
        var i = (_this$groups3 = this.groups) === null || _this$groups3 === void 0 ? void 0 : _this$groups3.find(s => s.id === e);
        i && i.append(t);
      }
    },
    j = class {
      constructor(e) {
        this.id = e.id, this.items = e.items.map(t => new p(t));
      }
      append(e) {
        var t = this.items.findIndex(i => i.entityId === e.entityId);
        if (t === -1 && e.voyokey && (t = this.items.findIndex(i => i.voyokey === e.voyokey)), t !== -1) {
          this.items[t] = e;
          return;
        }
        this.items.push(e);
      }
    },
    p = class {
      constructor(e) {
        var _e$data, _e$data2;
        this.voyokey = (e === null || e === void 0 ? void 0 : e.categoryId) || (e === null || e === void 0 ? void 0 : e.voyokey) || "", this.entityId = (e === null || e === void 0 ? void 0 : e.entityId) || null, this.percent = (e === null || e === void 0 || (_e$data = e.data) === null || _e$data === void 0 ? void 0 : _e$data.percent) || (e === null || e === void 0 ? void 0 : e.percent) || 0, this.duration = (e === null || e === void 0 || (_e$data2 = e.data) === null || _e$data2 === void 0 ? void 0 : _e$data2.duration) || (e === null || e === void 0 ? void 0 : e.duration) || 0, (e === null || e === void 0 ? void 0 : e.nextEntityId) !== void 0 && (this.nextEntityId = e.nextEntityId), !this.voyokey && this.entityId && (this.voyokey = this.entityId.toString()), !this.entityId && this.voyokey && (this.entityId = +this.voyokey.replace("CAT_", ""));
      }
      get percent10() {
        return Math.ceil(this.percent / 10) * 10;
      }
    },
    P = y;
  var Q = class {
      constructor(e) {
        this.profileId = (e === null || e === void 0 ? void 0 : e.profileId) || 0, this.visitorId = (e === null || e === void 0 ? void 0 : e.visitorId) || 0, this.name = (e === null || e === void 0 ? void 0 : e.name) || "", this.type = (e === null || e === void 0 ? void 0 : e.type) || "", this.avatar = (e === null || e === void 0 ? void 0 : e.avatar) || "", this.url = (e === null || e === void 0 ? void 0 : e.url) || "";
      }
    },
    g = Q;
  var N = class o extends Error {
      constructor(t) {
        var _t$;
        var i = ((_t$ = t[0]) === null || _t$ === void 0 || (_t$ = _t$.extensions) === null || _t$ === void 0 ? void 0 : _t$.message) || t[0] || {};
        super(i.tMessage || i.message || "GraphQL Error");
        this.tMessage = "";
        this.code = "";
        this.status = 0;
        this.name = "GqlError", this.errors = t, this.code = i.code || "", this.status = i.status || 0, Object.setPrototypeOf(this, o.prototype);
      }
    },
    W = N;
  var z = class {
      constructor(e) {
        this.code = (e === null || e === void 0 ? void 0 : e.code) || "", this.canSkipDummyVisitorScreen = (e === null || e === void 0 ? void 0 : e.canSkipDummyVisitorScreen) || 0;
      }
    },
    mt = z;
  var ht = (o, e) => "?query=onl_all_full_loginInfo(siteId:" + e + ")&rnd=" + o.substring(o.length - 12),
    ct = (o, e) => ({
      query: `query loginInfo($token: String! $siteId: Int!)
            {
                loginInfo(token: $token, siteId: $siteId)
                {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
      variables: {
        token: o,
        siteId: e
      }
    }),
    ut = (o, e, t) => ({
      query: `query loginUser($email: String! $siteId: Int! $password: String!)
            {
                login(email: $email, siteId: $siteId, password: $password)
                {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
      variables: {
        email: o,
        siteId: t,
        password: e
      }
    }),
    pt = (o, e, t) => ({
      query: `query LoginDevice($deviceName: String!, $deviceFamily: String!, $siteId: Int)
            {
                loginDevice(deviceName: $deviceName, deviceFamily: $deviceFamily, siteId: $siteId)
                {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
      variables: {
        deviceName: o,
        deviceFamily: e,
        siteId: t
      }
    }),
    gt = () => ({
      query: `query logoutJwt
            {
                logoutJwt
                {
                    status
                }
            }`,
      variables: {}
    }),
    vt = o => ({
      query: `query loginProfile($profileId: Int!)
            {
                loginProfile(profileId: $profileId)
                {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
      variables: {
        profileId: o
      }
    }),
    ft = (o, e, t, i, s, r, n, a, l, d, m) => ({
      query: `mutation register($email: String! $password: String! $nickname: String! $gender: String! $siteId: Int! $withLogin: Boolean $company_name: String $company_vat: String $tel: String $telTermsAgreed: Boolean! $profilingTermsAgreed: Boolean!)
            {
                register(
                    email: $email
                    password: $password
                    nickname: $nickname
                    gender: $gender
                    withLogin: $withLogin
                    siteId: $siteId
                    company_name: $company_name
                    company_vat: $company_vat
                    tel: $tel
                    telTermsAgreed: $telTermsAgreed
                    profilingTermsAgreed: $profilingTermsAgreed
                ) {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
      variables: {
        email: o,
        password: e,
        nickname: t,
        gender: i,
        siteId: s,
        withLogin: r,
        company_name: n,
        company_vat: a,
        tel: l,
        telTermsAgreed: d,
        profilingTermsAgreed: m
      }
    }),
    yt = (o, e, t, i) => ({
      query: `mutation registerEmailOnly($email: String! $siteId: Int! $mailingId: Int! $sendUnsubscribeEmail: Boolean!)
            {
                registerEmailOnly(email: $email, siteId: $siteId, mailingId: $mailingId, sendUnsubscribeEmail: $sendUnsubscribeEmail)
                {
                    email
                }
            }`,
      variables: {
        email: o,
        siteId: e,
        mailingId: t,
        sendUnsubscribeEmail: i
      }
    }),
    bt = (o, e, t) => ({
      query: `query LinkDeviceToUser($deviceFamily: String! $deviceName: String! $deviceModel: String!)
            {
                linkDeviceToUser(
                        deviceFamily: $deviceFamily
                        deviceName: $deviceName
                        deviceModel: $deviceModel
                ) {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
      variables: {
        deviceFamily: o,
        deviceName: e,
        deviceModel: t
      }
    }),
    kt = (o, e) => ({
      query: `mutation newPassword($password: String!, $token: String!)
            {
                newPassword(password: $password, token: $token) {
                    token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
      variables: {
        password: o,
        token: e
      }
    }),
    wt = (o, e) => ({
      query: `mutation sendVoyoLoginToken($email: String! $emailDesign: String!)
            {
                sendVoyoLoginToken(email: $email, emailDesign: $emailDesign)
                {
                    status
                }
            }`,
      variables: {
        email: o,
        emailDesign: e
      }
    }),
    Tt = (o, e) => ({
      query: `mutation userMeta($key: String! $value: String!)
            {
                userMeta(key: $key value: $value) {
                    id
                }
            }`,
      variables: {
        key: o,
        value: e
      }
    });
  var Et = (o, e, t) => ({
      query: `query VideoUrlV2($id: Int!, $siteId: Int ${t ? ", $isSafari: Boolean" : ""})
            {
                videoUrlV2 (
                    id: $id
                    siteId: $siteId
                    ${t ? "isSafari: $isSafari" : ""}
                ) {
                    url info infoCode license
                }
            }`,
      variables: _objectSpread({
        id: o,
        siteId: e
      }, t && {
        isSafari: t
      })
    }),
    Lt = (o, e, t) => ({
      query: `query EpgHlsUrl($channel: String! $chunkStart: Int! $chunkEnd: Int!)
            {
                epgHlsUrl (
                    channel: $channel
                    chunkStart: $chunkStart
                    chunkEnd: $chunkEnd
                ) {
                    url breaks { from to }
                }
            }`,
      variables: {
        channel: o,
        chunkStart: e,
        chunkEnd: t
      }
    }),
    St = (o, e, t, i) => ({
      query: `query EpgHlsUrlV2($channel: String! $chunkStart: Int! $chunkEnd: Int! ${i ? ", $isSafari: Boolean" : ""})
            {
                epgHlsUrlV2 (
                    channel: $channel
                    chunkStart: $chunkStart
                    chunkEnd: $chunkEnd
                    ${i ? "isSafari: $isSafari" : ""}
                ) {
                    url breaks { from to } license
                }
            }`,
      variables: _objectSpread({
        channel: o,
        chunkStart: e,
        chunkEnd: t
      }, i && {
        isSafari: i
      })
    });
  var Pt = (o, e) => ({
      query: `mutation commentVote($articleId: Int! $commentId: String!)
            {
                commentVote(itemType: ARTICLE itemId: $articleId commentId: $commentId direction: UP) {
                    id
                }
            }`,
      variables: {
        articleId: o,
        commentId: e
      }
    }),
    Mt = (o, e) => ({
      query: `mutation commentVote($articleId: Int! $commentId: String!)
            {
                commentVote(itemType: ARTICLE itemId: $articleId commentId: $commentId direction: DOWN) {
                    id
                }
            }`,
      variables: {
        articleId: o,
        commentId: e
      }
    }),
    Ct = (o, e, t) => ({
      query: `mutation commentAdd($articleId: Int! $replyTo: String $body: String!)
            {
                commentAdd(itemType: ARTICLE itemId: $articleId replyTo: $replyTo body: $body) {
                    id
                }
            }`,
      variables: {
        articleId: o,
        replyTo: t,
        body: e
      }
    });
  var It = o => ({
      query: `mutation jokeVote($id: Int!)
            {
                jokeVote(id: $id direction: UP) {
                    id count:upCount
                }
            }`,
      variables: {
        id: o
      }
    }),
    At = o => ({
      query: `mutation jokeVote($id: Int!)
            {
                jokeVote(id: $id direction: DOWN) {
                    id count:downCount
                }
            }`,
      variables: {
        id: o
      }
    });
  var qt = (o, e, t) => ({
    query: `mutation pollVote($pollId: Int! $answerId: Int! $gender: String)
            {
                pollVote(pollId: $pollId answerId: $answerId gender: $gender) {
                    id
                }
            }`,
    variables: {
      pollId: o,
      answerId: e,
      gender: t
    }
  });
  var Dt = (o, e) => ({
      query: `mutation recipeBookmarkDelete($groupId: String! $itemId: String!)
          {
            recipeBookmarkDelete(groupId: $groupId, itemId: $itemId) {
              __typename
            }
          }`,
      variables: {
        groupId: o,
        itemId: e
      }
    }),
    Ht = o => ({
      query: `mutation recipeBookmarkGroupDelete($groupId: String!)
        {
          recipeBookmarkGroupDelete(groupId: $groupId) {
            __typename
          }
        }`,
      variables: {
        groupId: o
      }
    }),
    xt = (o, e) => ({
      query: `mutation recipeBookmarkGroupAdd($groupId: String! $name: String!)
        {
          recipeBookmarkGroupAdd(groupId: $groupId, name: $name) {
            __typename
          }
        }`,
      variables: {
        groupId: o,
        name: e
      }
    }),
    _t = (o, e) => ({
      query: `mutation recipeBookmarkGroupAdd($groupId: String! $itemId: String!)
        {
          recipeBookmarkGroupAdd(groupId: $groupId, itemId: $itemId) {
            __typename
          }
        }`,
      variables: {
        groupId: o,
        itemId: e
      }
    }),
    Vt = () => ({
      query: `query voyoBookmarks 
      {
        voyoBookmark {
          groups {
            id name
            items {
              entityId categoryId
              data { percent duration }
            }
          }
        }
      }`,
      variables: {}
    }),
    Ut = (o, e) => ({
      query: `mutation voyoBookmarkDelete($groupId: String! $itemId: String!)
        {
          voyoBookmarkDelete(groupId: $groupId, itemId: $itemId) {
            __typename
          }
        }`,
      variables: {
        groupId: o,
        itemId: e
      }
    }),
    $t = function $t(o, e) {
      var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var i = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      return {
        query: `mutation voyoBookmarkAdd($groupId: String! $itemId: String! $percent: Int, $duration: Int)
        {
          voyoBookmarkAdd(groupId: $groupId, itemId: $itemId, returnAllBookmarks: false, percent: $percent, duration: $duration) {
            __typename
          }
        }`,
        variables: {
          groupId: o,
          itemId: e,
          percent: t,
          duration: i
        }
      };
    };
  var Bt = o => ({
    query: `query voyoCategory($id: Int!)
            {
                voyoCategory (id: $id) {
                    id title url
                    meta {rootCategoryId}
                }
            }`,
    variables: {
      id: o
    }
  });
  var Gt = o => ({
    query: `query video($id: Int!)
            {
                video (id: $id) {
                    id title url
                    meta {rootCategoryId categoryId}
                }
            }`,
    variables: {
      id: o
    }
  });
  var Ot = o => ({
      query: `query liveStream($id: Int!)
            {
                liveStream (id: $id) {
                    id title url
                }
            }`,
      variables: {
        id: o
      }
    }),
    Ft = o => ({
      query: `mutation streamReminder($id: Int!)
            {
                streamReminder (id: $id) {
                    message
                }
            }`,
      variables: {
        id: o
      }
    });
  var Rt = () => ({
      query: `query userProfiles 
      {
        userProfiles {
          profiles {
            profileId visitorId type name avatar url
          }
        }
      }`,
      variables: {}
    }),
    jt = (o, e, t) => ({
      query: `mutation userProfileAdd($name: String! $type: String! $avatar: String!)
      {
        userProfileAdd(name: $name, type: $type, avatar: $avatar) {
          profiles {
            profileId visitorId type name avatar url
          }
        }
      }`,
      variables: {
        name: o,
        type: e,
        avatar: t
      }
    }),
    Qt = (o, e, t) => ({
      query: `mutation userProfileUpdate($profileId: Int! $name: String! $avatar: String!)
      {
        userProfileUpdate(profileId: $profileId, name: $name, avatar: $avatar) {
          profiles {
            profileId visitorId type name avatar url
          }
      }
    }`,
      variables: {
        profileId: o,
        name: e,
        avatar: t
      }
    }),
    Nt = o => ({
      query: `mutation userProfileDelete($profileId: Int!)
      {
        userProfileDelete(profileId: $profileId) {
          profiles {
            profileId visitorId type name avatar url
          }
      }
    }`,
      variables: {
        profileId: o
      }
    });
  var Wt = (o, e) => ({
    query: `mutation tvGetCode($deviceName: String!, $deviceFamily: String!)
            {
                tvGetCode(deviceName: $deviceName, deviceFamily: $deviceFamily, codeLength: 5) {
                    code canSkipDummyVisitorScreen
                }
            }`,
    variables: {
      deviceName: o,
      deviceFamily: e
    }
  });
  function M(o) {
    var e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : void 0;
    return new Promise((t, i) => {
      var s = setTimeout(() => {
        var _window$Sentry;
        (_window$Sentry = window.Sentry) !== null && _window$Sentry !== void 0 && _window$Sentry.setContext("fetchData", {
          url: o,
          options: e
        }), i(new Error("Fetch request timed out: " + o));
      }, (e === null || e === void 0 ? void 0 : e.timeout) || 4e3);
      fetch(o, e).then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        clearTimeout(s), t(r);
      }).catch(r => {
        clearTimeout(s), console.error("Fetch error:", r), i(r);
      });
    });
  }
  var J = class {
      constructor(e) {
        this.timer = null;
        this.from = e.from || 0, this.to = e.to || 0, this.seen = e.seen || !1;
      }
      setSeen() {
        this.timer || (this.timer = setTimeout(() => {
          this.seen = !0;
        }, 1e3));
      }
    },
    zt = J;
  var K = class {
      constructor(e) {
        this.url = (e === null || e === void 0 ? void 0 : e.url) || "", this.breaks = ((e === null || e === void 0 ? void 0 : e.breaks) || []).map(t => new zt(t)), this.license = (e === null || e === void 0 ? void 0 : e.license) || "";
      }
    },
    Z = K;
  var X = class {
      constructor(e) {
        Object.assign(this, e);
      }
    },
    Jt = X;
  var Y = class {
      constructor(e) {
        Object.assign(this, e);
      }
    },
    Kt = Y;
  var ee = class {
      constructor(e) {
        Object.assign(this, e);
      }
    },
    Zt = ee;
  var te = class {
      constructor(e) {
        Object.assign(this, e), this.payload = e !== null && e !== void 0 && e.payload ? new u(e.payload) : null;
      }
    },
    Xt = te;
  var Yt = o => ({
      query: `query IspLoginCheck ($jobHash: String!) {
            ispLoginCheck(jobHash: $jobHash) {
                status
                payload {
                    token
                    nickname
                    email
                    avatar
                    isSubscribed
                    subscriptionUntil
                    status
                }
            }
        }`,
      variables: {
        jobHash: o
      }
    }),
    ei = (o, e) => ({
      query: `query IspLogin ($provider: String! $a1Token: String) {
            ispLogin(provider: $provider a1Token: $a1Token) {
                jobHash maxRetries retryDelay
            }
        }`,
      variables: {
        provider: o,
        a1Token: e
      }
    }),
    ti = (o, e, t) => ({
      query: `query IspLogin ($username: String! $password: String! $provider: String!) {
            ispLogin(username: $username password: $password provider: $provider) {
                jobHash maxRetries retryDelay
            }
        }`,
      variables: {
        username: o,
        password: e,
        provider: t
      }
    });
  function k(_x) {
    return _k.apply(this, arguments);
  }
  function _k() {
    _k = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee75(o) {
      var _t12;
      return _regenerator().w(function (_context75) {
        while (1) switch (_context75.p = _context75.n) {
          case 0:
            _context75.p = 0;
            _context75.n = 1;
            return o();
          case 1:
            return _context75.a(2, _context75.v);
          case 2:
            _context75.p = 2;
            _t12 = _context75.v;
            console.log("First attempt failed, retrying once in 1 second...", _t12);
            _context75.n = 3;
            return new Promise(t => setTimeout(t, 1e3));
          case 3:
            _context75.n = 4;
            return o();
          case 4:
            return _context75.a(2, _context75.v);
        }
      }, _callee75, null, [[0, 2]]);
    }));
    return _k.apply(this, arguments);
  }
  var ie = class {
      constructor(e) {
        Object.assign(this, e);
      }
    },
    se = ie;
  var ii = function ii(o) {
      var e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "mail";
      return {
        query: `query mailingSubscriptions($siteId: Int! $subscriptionsType: String!)
            {
                mailingSubscriptions(siteId: $siteId, subscriptionsType: $subscriptionsType)
                {
                    subscriptions {
                        id
                        subscribed
                        checkAgainAfter
                        allowMailingPopup
                    }
                }
            }`,
        variables: {
          siteId: o,
          subscriptionsType: e
        }
      };
    },
    si = function si(o, e, t) {
      var i = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !0;
      return {
        query: `mutation settingsSubscription($siteId: Int! $mailingId: Int! $subscribed: Boolean! $sendUnsubscribeEmail: Boolean!)
            {
                settingsSubscription(siteId: $siteId, mailingId: $mailingId, subscribed: $subscribed, sendUnsubscribeEmail: $sendUnsubscribeEmail)
                {
                    subscriptions {
                        id
                        subscribed
                    }
                }
            }`,
        variables: {
          siteId: o,
          mailingId: e,
          subscribed: t,
          sendUnsubscribeEmail: i
        }
      };
    },
    ri = (o, e) => ({
      query: `mutation settingsAccount($email: String!, $password: String!)
            {
                settingsAccount(email: $email, password: $password) {
                    token
                    account {
                        email
                    }
                }
            }`,
      variables: {
        email: o,
        password: e
      }
    }),
    oi = (o, e) => ({
      query: `mutation settingsAccount($password: String!, $newPassword: String!)
            {
                settingsAccount(password: $password, newPassword: $newPassword) {
                    token
                }
            }`,
      variables: {
        password: o,
        newPassword: e
      }
    }),
    ni = (o, e, t) => ({
      query: `mutation settingsAccount($email: String!, $newPassword: String!, $password: String!)
            {
                settingsAccount(email: $email, newPassword: $newPassword, password: $password) {
                    token
                    account {
                        email
                        emailConfirmed
                    }
                }
            }`,
      variables: {
        email: o,
        newPassword: e,
        password: t
      }
    }),
    ai = (o, e) => ({
      query: `mutation settingsCompany($name: String!, $vat: String!)
            {
                settingsCompany(name: $name, vat: $vat) {
                    token
                    company {
                        name
                        vat
                    }
                }
            }`,
      variables: {
        name: o,
        vat: e
      }
    }),
    li = (o, e) => ({
      query: `mutation settingsAccountTerms($telTermsAgreed: Boolean!, $profilingTermsAgreed: Boolean!)
            {
                settingsAccountTerms(telTermsAgreed: $telTermsAgreed, profilingTermsAgreed: $profilingTermsAgreed) {
                    token
                }
            }`,
      variables: {
        telTermsAgreed: o,
        profilingTermsAgreed: e
      }
    }),
    di = o => ({
      query: `query unlinkDevice($id: Int!)
            {
                unlinkDevice(id: $id) {
                    token
                }
            }`,
      variables: {
        id: o
      }
    }),
    mi = o => ({
      query: `mutation tv($code: String!)
            {
                tv(code: $code) {
                    message
                }
            }`,
      variables: {
        code: o
      }
    }),
    hi = () => ({
      query: `mutation settingsSupervisionSendPin {
            settingsSupervisionSendPin {
                status
            }
        }`,
      variables: {}
    }),
    ci = (o, e) => ({
      query: `mutation settingsSupervision($restriction: String!, $pin: String!) {
            settingsSupervision(restriction: $restriction, pin: $pin) {
                token
                supervision {
                    restriction
                    userHasPin
                    parentalCtr {
                        age
                        description
                        image
                        enable
                    }
                }
            }
        }`,
      variables: {
        restriction: o,
        pin: e
      }
    }),
    ui = (o, e) => ({
      query: `mutation voyoPaymentPeriod($subscriptionId: Int!, $period: String!) {
            voyoPaymentPeriod(subscriptionId: $subscriptionId, period: $period) {
                processed
            }
        }`,
      variables: {
        subscriptionId: o,
        period: e
      }
    }),
    pi = o => ({
      query: `mutation settingsStopVoyoSubscription($subscriptionId: Int!) {
            settingsStopVoyoSubscription(id: $subscriptionId) {
                voyoSubscriptions {
                    id
                    type
                    timeStart
                    timeEnd
                    productId
                    canResume
                    paymentPeriod
                    payments {
                        next
                        prev
                    }
                    creditCardInfo {
                        cardType
                        expiryDate
                        summary
                        holderName
                    }
                }
                voyoPendingSubscriptions {
                    id
                    type
                    timeStart
                    timeEnd
                    productId
                    canResume
                    paymentPeriod
                    payments {
                        next
                        prev
                        canUserTriggerPayment
                        attempts
                        lastPaymentError
                    }
                    creditCardInfo {
                        cardType
                        expiryDate
                        summary
                        holderName
                    }
                }
                token
            }
        }`,
      variables: {
        subscriptionId: o
      }
    }),
    gi = o => ({
      query: `mutation settingsResumeVoyoSubscription($subscriptionId: Int!) {
            settingsResumeVoyoSubscription(id: $subscriptionId) {
                voyoSubscriptions {
                    id
                    timeEnd
                    canResume
                    paymentPeriod
                    payments {
                        next
                        prev
                    }
                }
                token
            }
        }`,
      variables: {
        subscriptionId: o
      }
    }),
    vi = o => ({
      query: `mutation sendConfirmationEmail($siteId: Int!) {
            sendConfirmationEmail(siteId: $siteId) {
                status
            }
        }`,
      variables: {
        siteId: o
      }
    }),
    fi = (o, e) => ({
      query: `query forgottenPassword($email: String!, $siteId: Int!)
            {
                forgottenPassword(email: $email, siteId: $siteId) {
                    status
                }
            }`,
      variables: {
        email: o,
        siteId: e
      }
    });
  function v() {
    return /apple/i.test(navigator.vendor);
  }
  function yi(o) {
    var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      t = "",
      i,
      s,
      r,
      n,
      a,
      l,
      d,
      m = 0;
    for (; m < o.length;) i = o[m++], s = m < o.length ? o[m++] : Number.NaN, r = m < o.length ? o[m++] : Number.NaN, n = i >> 2, a = (i & 3) << 4 | s >> 4, l = (s & 15) << 2 | r >> 6, d = r & 63, isNaN(s) ? l = d = 64 : isNaN(r) && (d = 64), t += e.charAt(n) + e.charAt(a) + e.charAt(l) + e.charAt(d);
    return t;
  }
  var bi = () => ({
    query: `
            {
                geo {
                    ip
                    countryCode
                    countryName
                }
            }`,
    variables: {}
  });
  var ki = o => ({
      query: `query billingCode${o ? "($giftCode: String)" : ""} {
            billingCode${o ? "(giftCode: $giftCode)" : ""} {
                code activatedBy
            }
        }`,
      variables: o ? {
        giftCode: o
      } : {}
    }),
    wi = o => ({
      query: `mutation code($code: String!)
            {
                code(code: $code) {
                    message code activatedBy
                    paymentInfo {
                        itemId itemName category price
                        discount quantity coupon
                    }
                }
            }`,
      variables: {
        code: o
      }
    }),
    Ti = o => ({
      query: `query billingCodeInfo($code: String!) {
            billingCodeInfo(code: $code) {
                exists isRecurring description reason
                code activatedBy status terms imageSrc
            }
        }`,
      variables: {
        code: o
      }
    }),
    Ei = (o, e, t, i) => ({
      query: `query adyenStart($accessCode: String!, $paymentType: String!, $promotionId: Int, $flags: String) {
            adyenStart(accessCode: $accessCode, paymentType: $paymentType, promotionId: $promotionId, flags: $flags) {
                id sessionData clientKey checkoutId amount 
                paymentInfo {
                    itemName category price discount quantity coupon
                }
            }
        }`,
      variables: {
        accessCode: o,
        paymentType: e,
        promotionId: t,
        flags: i
      }
    }),
    Li = (o, e) => ({
      query: `query adyenCheck(${o ? "$id: Int," : ""} ${e ? "$subscriptionId: Int" : ""}) {
            adyenCheck(${o ? "id: $id," : ""} ${e ? "subscriptionId: $subscriptionId" : ""}) {
                status
                accessCode
                error {
                    code original description
                }  
            }
        }`,
      variables: {
        id: o,
        subscriptionId: e
      }
    }),
    Si = (o, e) => ({
      query: `query adyenDirectPayment(${o ? "$id: Int," : ""} ${e ? "$subscriptionId: Int" : ""}) {
            adyenDirectPayment(${o ? "id: $id," : ""} ${e ? "subscriptionId: $subscriptionId" : ""}) {
                status
                error {
                    code
                    original
                    description
                }
            }         
        }`,
      variables: {
        id: o,
        subscriptionId: e
      }
    }),
    Pi = o => ({
      query: `query paypal($id: String!) {
            paypal(id: $id) {
                status
            }
        }`,
      variables: {
        id: o
      }
    });
  var re = class {
      constructor(e) {
        Object.assign(this, e);
      }
    },
    Mi = re;
  var oe = class {
      constructor(e) {
        var _this = this;
        this.options = e;
        this.authToken = "";
        this.deviceId = "";
        this.loginInfo = /*#__PURE__*/function () {
          var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e, t) {
            var i,
              r,
              s,
              _args = arguments;
            return _regenerator().w(function (_context) {
              while (1) switch (_context.n) {
                case 0:
                  i = _args.length > 2 && _args[2] !== undefined ? _args[2] : !0;
                  if (!i) {
                    _context.n = 1;
                    break;
                  }
                  r = ht(e, t);
                  return _context.a(2, k(() => _this.fetchGQL(null, {
                    method: "GET",
                    url: r,
                    headers: {
                      Authorization: e
                    }
                  })).then(n => new u(n)));
                case 1:
                  s = ct(e, t);
                  return _context.a(2, _this.fetchGQL(s).then(r => new u(r)));
              }
            }, _callee);
          }));
          return function (_x2, _x3) {
            return _ref.apply(this, arguments);
          };
        }();
        this.loginUser = /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(e, t, i) {
            var s;
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.n) {
                case 0:
                  s = ut(e, t, i);
                  return _context2.a(2, _this.fetchGQL(s).then(r => new u(r)));
              }
            }, _callee2);
          }));
          return function (_x4, _x5, _x6) {
            return _ref2.apply(this, arguments);
          };
        }();
        this.loginWithDevice = /*#__PURE__*/function () {
          var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(e, t, i) {
            var s;
            return _regenerator().w(function (_context3) {
              while (1) switch (_context3.n) {
                case 0:
                  s = pt(e, t, i);
                  return _context3.a(2, _this.fetchGQL(s).then(r => new u(r)));
              }
            }, _callee3);
          }));
          return function (_x7, _x8, _x9) {
            return _ref3.apply(this, arguments);
          };
        }();
        this.logoutUser = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
          var e;
          return _regenerator().w(function (_context4) {
            while (1) switch (_context4.n) {
              case 0:
                e = gt();
                return _context4.a(2, _this.fetchGQL(e).then(t => !!t));
            }
          }, _callee4);
        }));
        this.loginProfile = /*#__PURE__*/function () {
          var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(e) {
            var t;
            return _regenerator().w(function (_context5) {
              while (1) switch (_context5.n) {
                case 0:
                  t = vt(e);
                  return _context5.a(2, _this.fetchGQL(t).then(i => new u(i)));
              }
            }, _callee5);
          }));
          return function (_x0) {
            return _ref5.apply(this, arguments);
          };
        }();
        this.geo = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
          var e;
          return _regenerator().w(function (_context6) {
            while (1) switch (_context6.n) {
              case 0:
                e = bi();
                return _context6.a(2, _this.fetchGQL(e).then(t => new lt(t)));
            }
          }, _callee6);
        }));
        this.newProfile = /*#__PURE__*/function () {
          var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(e, t, i) {
            var s;
            return _regenerator().w(function (_context7) {
              while (1) switch (_context7.n) {
                case 0:
                  s = jt(e, t, i);
                  return _context7.a(2, _this.fetchGQL(s).then(r => r ? r.profiles.map(n => new g(n)) : []));
              }
            }, _callee7);
          }));
          return function (_x1, _x10, _x11) {
            return _ref7.apply(this, arguments);
          };
        }();
        this.updateProfile = /*#__PURE__*/function () {
          var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(e, t, i) {
            var s;
            return _regenerator().w(function (_context8) {
              while (1) switch (_context8.n) {
                case 0:
                  s = Qt(e, t, i);
                  return _context8.a(2, _this.fetchGQL(s).then(r => r ? r.profiles.map(n => new g(n)) : []));
              }
            }, _callee8);
          }));
          return function (_x12, _x13, _x14) {
            return _ref8.apply(this, arguments);
          };
        }();
        this.deleteProfile = /*#__PURE__*/function () {
          var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(e) {
            var t;
            return _regenerator().w(function (_context9) {
              while (1) switch (_context9.n) {
                case 0:
                  t = Nt(e);
                  return _context9.a(2, _this.fetchGQL(t).then(i => i ? i.profiles.map(s => new g(s)) : []));
              }
            }, _callee9);
          }));
          return function (_x15) {
            return _ref9.apply(this, arguments);
          };
        }();
        this.registerUser = /*#__PURE__*/function () {
          var _ref0 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(e, t, i, s, r, n, a, l, d, m, h) {
            var c;
            return _regenerator().w(function (_context0) {
              while (1) switch (_context0.n) {
                case 0:
                  c = ft(e, t, i, s, r, n, a, l, d, m, h);
                  return _context0.a(2, _this.fetchGQL(c).then(f => new u(f)));
              }
            }, _callee0);
          }));
          return function (_x16, _x17, _x18, _x19, _x20, _x21, _x22, _x23, _x24, _x25, _x26) {
            return _ref0.apply(this, arguments);
          };
        }();
        this.newPassword = /*#__PURE__*/function () {
          var _ref1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(e, t) {
            var i;
            return _regenerator().w(function (_context1) {
              while (1) switch (_context1.n) {
                case 0:
                  i = kt(e, t);
                  return _context1.a(2, _this.fetchGQL(i).then(s => new u(s)));
              }
            }, _callee1);
          }));
          return function (_x27, _x28) {
            return _ref1.apply(this, arguments);
          };
        }();
        this.registerEmailOnly = /*#__PURE__*/function () {
          var _ref10 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(e, t, i, s) {
            var r;
            return _regenerator().w(function (_context10) {
              while (1) switch (_context10.n) {
                case 0:
                  r = yt(e, t, i, s);
                  return _context10.a(2, _this.fetchGQL(r));
              }
            }, _callee10);
          }));
          return function (_x29, _x30, _x31, _x32) {
            return _ref10.apply(this, arguments);
          };
        }();
        this.mailingSubscriptions = /*#__PURE__*/function () {
          var _ref11 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(e) {
            var t,
              i,
              _args11 = arguments;
            return _regenerator().w(function (_context11) {
              while (1) switch (_context11.n) {
                case 0:
                  t = _args11.length > 1 && _args11[1] !== undefined ? _args11[1] : "mail";
                  i = ii(e, t);
                  return _context11.a(2, _this.fetchGQL(i));
              }
            }, _callee11);
          }));
          return function (_x33) {
            return _ref11.apply(this, arguments);
          };
        }();
        this.sendVoyoLoginToken = /*#__PURE__*/function () {
          var _ref12 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(e, t) {
            var i;
            return _regenerator().w(function (_context12) {
              while (1) switch (_context12.n) {
                case 0:
                  i = wt(e, t);
                  return _context12.a(2, _this.fetchGQL(i));
              }
            }, _callee12);
          }));
          return function (_x34, _x35) {
            return _ref12.apply(this, arguments);
          };
        }();
        this.settingsUpdateSubscription = /*#__PURE__*/function () {
          var _ref13 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(e, t, i) {
            var s,
              r,
              _args13 = arguments;
            return _regenerator().w(function (_context13) {
              while (1) switch (_context13.n) {
                case 0:
                  s = _args13.length > 3 && _args13[3] !== undefined ? _args13[3] : !0;
                  r = si(e, t, i, s);
                  return _context13.a(2, _this.fetchGQL(r));
              }
            }, _callee13);
          }));
          return function (_x36, _x37, _x38) {
            return _ref13.apply(this, arguments);
          };
        }();
        this.saveAccountEmail = /*#__PURE__*/function () {
          var _ref14 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14(e, t) {
            var i;
            return _regenerator().w(function (_context14) {
              while (1) switch (_context14.n) {
                case 0:
                  i = ri(e, t);
                  return _context14.a(2, _this.fetchGQL(i));
              }
            }, _callee14);
          }));
          return function (_x39, _x40) {
            return _ref14.apply(this, arguments);
          };
        }();
        this.saveAccountPassword = /*#__PURE__*/function () {
          var _ref15 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15(e, t) {
            var i;
            return _regenerator().w(function (_context15) {
              while (1) switch (_context15.n) {
                case 0:
                  i = oi(e, t);
                  return _context15.a(2, _this.fetchGQL(i));
              }
            }, _callee15);
          }));
          return function (_x41, _x42) {
            return _ref15.apply(this, arguments);
          };
        }();
        this.saveAccountCredentials = /*#__PURE__*/function () {
          var _ref16 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16(e, t) {
            var i,
              s,
              _args16 = arguments;
            return _regenerator().w(function (_context16) {
              while (1) switch (_context16.n) {
                case 0:
                  i = _args16.length > 2 && _args16[2] !== undefined ? _args16[2] : "";
                  s = ni(e, t, i);
                  return _context16.a(2, _this.fetchGQL(s));
              }
            }, _callee16);
          }));
          return function (_x43, _x44) {
            return _ref16.apply(this, arguments);
          };
        }();
        this.saveCompany = /*#__PURE__*/function () {
          var _ref17 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17(e, t) {
            var i;
            return _regenerator().w(function (_context17) {
              while (1) switch (_context17.n) {
                case 0:
                  i = ai(e, t);
                  return _context17.a(2, _this.fetchGQL(i));
              }
            }, _callee17);
          }));
          return function (_x45, _x46) {
            return _ref17.apply(this, arguments);
          };
        }();
        this.saveAccountTerms = /*#__PURE__*/function () {
          var _ref18 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18(e, t) {
            var i;
            return _regenerator().w(function (_context18) {
              while (1) switch (_context18.n) {
                case 0:
                  i = li(e, t);
                  return _context18.a(2, _this.fetchGQL(i));
              }
            }, _callee18);
          }));
          return function (_x47, _x48) {
            return _ref18.apply(this, arguments);
          };
        }();
        this.unlinkDevice = /*#__PURE__*/function () {
          var _ref19 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19(e) {
            var t;
            return _regenerator().w(function (_context19) {
              while (1) switch (_context19.n) {
                case 0:
                  t = di(e);
                  return _context19.a(2, _this.fetchGQL(t));
              }
            }, _callee19);
          }));
          return function (_x49) {
            return _ref19.apply(this, arguments);
          };
        }();
        this.connectTV = /*#__PURE__*/function () {
          var _ref20 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20(e) {
            var t;
            return _regenerator().w(function (_context20) {
              while (1) switch (_context20.n) {
                case 0:
                  t = mi(e);
                  return _context20.a(2, _this.fetchGQL(t));
              }
            }, _callee20);
          }));
          return function (_x50) {
            return _ref20.apply(this, arguments);
          };
        }();
        this.requestSupervisionPinCode = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21() {
          var e;
          return _regenerator().w(function (_context21) {
            while (1) switch (_context21.n) {
              case 0:
                e = hi();
                return _context21.a(2, _this.fetchGQL(e));
            }
          }, _callee21);
        }));
        this.saveSupervisionSettings = /*#__PURE__*/function () {
          var _ref22 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee22(e, t) {
            var i;
            return _regenerator().w(function (_context22) {
              while (1) switch (_context22.n) {
                case 0:
                  i = ci(e, t);
                  return _context22.a(2, _this.fetchGQL(i));
              }
            }, _callee22);
          }));
          return function (_x51, _x52) {
            return _ref22.apply(this, arguments);
          };
        }();
        this.voyoPaymentPeriod = /*#__PURE__*/function () {
          var _ref23 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee23(e, t) {
            var i;
            return _regenerator().w(function (_context23) {
              while (1) switch (_context23.n) {
                case 0:
                  i = ui(e, t);
                  return _context23.a(2, _this.fetchGQL(i));
              }
            }, _callee23);
          }));
          return function (_x53, _x54) {
            return _ref23.apply(this, arguments);
          };
        }();
        this.stopVoyoSubscription = /*#__PURE__*/function () {
          var _ref24 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee24(e) {
            var t;
            return _regenerator().w(function (_context24) {
              while (1) switch (_context24.n) {
                case 0:
                  t = pi(e);
                  return _context24.a(2, _this.fetchGQL(t));
              }
            }, _callee24);
          }));
          return function (_x55) {
            return _ref24.apply(this, arguments);
          };
        }();
        this.resumeVoyoSubscription = /*#__PURE__*/function () {
          var _ref25 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee25(e) {
            var t;
            return _regenerator().w(function (_context25) {
              while (1) switch (_context25.n) {
                case 0:
                  t = gi(e);
                  return _context25.a(2, _this.fetchGQL(t));
              }
            }, _callee25);
          }));
          return function (_x56) {
            return _ref25.apply(this, arguments);
          };
        }();
        this.sendConfirmationEmail = /*#__PURE__*/function () {
          var _ref26 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee26(e) {
            var t;
            return _regenerator().w(function (_context26) {
              while (1) switch (_context26.n) {
                case 0:
                  t = vi(e);
                  return _context26.a(2, _this.fetchGQL(t));
              }
            }, _callee26);
          }));
          return function (_x57) {
            return _ref26.apply(this, arguments);
          };
        }();
        this.forgottenPassword = /*#__PURE__*/function () {
          var _ref27 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee27(e, t) {
            var i;
            return _regenerator().w(function (_context27) {
              while (1) switch (_context27.n) {
                case 0:
                  i = fi(e, t);
                  return _context27.a(2, _this.fetchGQL(i));
              }
            }, _callee27);
          }));
          return function (_x58, _x59) {
            return _ref27.apply(this, arguments);
          };
        }();
        this.billingCode = /*#__PURE__*/function () {
          var _ref28 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee28(e) {
            var t;
            return _regenerator().w(function (_context28) {
              while (1) switch (_context28.n) {
                case 0:
                  t = ki(e);
                  return _context28.a(2, _this.fetchGQL(t));
              }
            }, _callee28);
          }));
          return function (_x60) {
            return _ref28.apply(this, arguments);
          };
        }();
        this.accessCode = /*#__PURE__*/function () {
          var _ref29 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee29(e) {
            var t;
            return _regenerator().w(function (_context29) {
              while (1) switch (_context29.n) {
                case 0:
                  t = wi(e);
                  return _context29.a(2, _this.fetchGQL(t));
              }
            }, _callee29);
          }));
          return function (_x61) {
            return _ref29.apply(this, arguments);
          };
        }();
        this.billingCodeExists = /*#__PURE__*/function () {
          var _ref30 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee30(e) {
            var t;
            return _regenerator().w(function (_context30) {
              while (1) switch (_context30.n) {
                case 0:
                  t = Ti(e);
                  return _context30.a(2, _this.fetchGQL(t));
              }
            }, _callee30);
          }));
          return function (_x62) {
            return _ref30.apply(this, arguments);
          };
        }();
        this.adyenStart = /*#__PURE__*/function () {
          var _ref31 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee31(e, t, i, s) {
            var r;
            return _regenerator().w(function (_context31) {
              while (1) switch (_context31.n) {
                case 0:
                  r = Ei(e, t, i, s);
                  return _context31.a(2, _this.fetchGQL(r).then(n => new Mi(n)));
              }
            }, _callee31);
          }));
          return function (_x63, _x64, _x65, _x66) {
            return _ref31.apply(this, arguments);
          };
        }();
        this.adyenCheck = /*#__PURE__*/function () {
          var _ref32 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee32(e, t) {
            var i;
            return _regenerator().w(function (_context32) {
              while (1) switch (_context32.n) {
                case 0:
                  i = Li(e, t);
                  return _context32.a(2, _this.fetchGQL(i));
              }
            }, _callee32);
          }));
          return function (_x67, _x68) {
            return _ref32.apply(this, arguments);
          };
        }();
        this.adyenDirectPayment = /*#__PURE__*/function () {
          var _ref33 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee33(e, t) {
            var i;
            return _regenerator().w(function (_context33) {
              while (1) switch (_context33.n) {
                case 0:
                  i = Si(e, t);
                  return _context33.a(2, _this.fetchGQL(i));
              }
            }, _callee33);
          }));
          return function (_x69, _x70) {
            return _ref33.apply(this, arguments);
          };
        }();
        this.paypal = /*#__PURE__*/function () {
          var _ref34 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee34(e) {
            var t;
            return _regenerator().w(function (_context34) {
              while (1) switch (_context34.n) {
                case 0:
                  t = Pi(e);
                  return _context34.a(2, _this.fetchGQL(t));
              }
            }, _callee34);
          }));
          return function (_x71) {
            return _ref34.apply(this, arguments);
          };
        }();
        this.voyoBookmarks = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee35() {
          var e;
          return _regenerator().w(function (_context35) {
            while (1) switch (_context35.n) {
              case 0:
                e = Vt();
                return _context35.a(2, _this.fetchGQL(e).then(t => new P(t)));
            }
          }, _callee35);
        }));
        this.voyoBookmarkRemove = /*#__PURE__*/function () {
          var _ref36 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee36(e, t) {
            var i;
            return _regenerator().w(function (_context36) {
              while (1) switch (_context36.n) {
                case 0:
                  i = Ut(e, t);
                  return _context36.a(2, _this.fetchGQL(i).then(s => !!s).catch(() => !1));
              }
            }, _callee36);
          }));
          return function (_x72, _x73) {
            return _ref36.apply(this, arguments);
          };
        }();
        this.voyoBookmarkAdd = /*#__PURE__*/function () {
          var _ref37 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee37(e, t) {
            var i;
            return _regenerator().w(function (_context37) {
              while (1) switch (_context37.n) {
                case 0:
                  i = $t(e, t.entityId.toString(), t.percent, t.duration);
                  return _context37.a(2, _this.fetchGQL(i, {
                    timeout: 4e3
                  }).then(s => !!s).catch(() => !1));
              }
            }, _callee37);
          }));
          return function (_x74, _x75) {
            return _ref37.apply(this, arguments);
          };
        }();
        this.voyoProfiles = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee38() {
          var e;
          return _regenerator().w(function (_context38) {
            while (1) switch (_context38.n) {
              case 0:
                e = Rt();
                return _context38.a(2, _this.fetchGQL(e).then(t => t ? t.profiles.map(i => new g(i)) : []));
            }
          }, _callee38);
        }));
        this.tvGetCode = /*#__PURE__*/function () {
          var _ref39 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee39(e, t) {
            var i;
            return _regenerator().w(function (_context39) {
              while (1) switch (_context39.n) {
                case 0:
                  i = Wt(e, t);
                  return _context39.a(2, _this.fetchGQL(i).then(s => new mt(s)));
              }
            }, _callee39);
          }));
          return function (_x76, _x77) {
            return _ref39.apply(this, arguments);
          };
        }();
        this.ispLoginCheck = /*#__PURE__*/function () {
          var _ref40 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee40(e) {
            var t;
            return _regenerator().w(function (_context40) {
              while (1) switch (_context40.n) {
                case 0:
                  t = Yt(e);
                  return _context40.a(2, _this.fetchGQL(t).then(i => new Xt(i)));
              }
            }, _callee40);
          }));
          return function (_x78) {
            return _ref40.apply(this, arguments);
          };
        }();
        this.ispLoginJob = /*#__PURE__*/function () {
          var _ref41 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee41(e, t) {
            var i;
            return _regenerator().w(function (_context41) {
              while (1) switch (_context41.n) {
                case 0:
                  i = ei(e, t);
                  return _context41.a(2, _this.fetchGQL(i).then(s => new se(s)));
              }
            }, _callee41);
          }));
          return function (_x79, _x80) {
            return _ref41.apply(this, arguments);
          };
        }();
        this.ispLogin = /*#__PURE__*/function () {
          var _ref42 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee42(e, t, i) {
            var s;
            return _regenerator().w(function (_context42) {
              while (1) switch (_context42.n) {
                case 0:
                  s = ti(e, t, i);
                  return _context42.a(2, _this.fetchGQL(s).then(r => new se(r)));
              }
            }, _callee42);
          }));
          return function (_x81, _x82, _x83) {
            return _ref42.apply(this, arguments);
          };
        }();
        this.videoUrlV2 = /*#__PURE__*/function () {
          var _ref43 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee43(e) {
            var t;
            return _regenerator().w(function (_context43) {
              while (1) switch (_context43.n) {
                case 0:
                  t = Et(e, _this.options.siteId, v());
                  return _context43.a(2, _this.fetchGQL(t).then(i => new dt(i)));
              }
            }, _callee43);
          }));
          return function (_x84) {
            return _ref43.apply(this, arguments);
          };
        }();
        this.linkDeviceToUser = /*#__PURE__*/function () {
          var _ref44 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee44(e, t, i) {
            var s;
            return _regenerator().w(function (_context44) {
              while (1) switch (_context44.n) {
                case 0:
                  s = bt(e, t, i);
                  return _context44.a(2, _this.fetchGQL(s).catch(r => {
                    if (r instanceof W && r.code === "404.300") throw new Error("too_many_devices");
                  }).then(r => new u(r)));
              }
            }, _callee44);
          }));
          return function (_x85, _x86, _x87) {
            return _ref44.apply(this, arguments);
          };
        }();
        this.epgHlsUrl = /*#__PURE__*/function () {
          var _ref45 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee45(e, t, i) {
            var s;
            return _regenerator().w(function (_context45) {
              while (1) switch (_context45.n) {
                case 0:
                  s = Lt(e, t, i);
                  return _context45.a(2, _this.fetchGQL(s).then(r => new Z(r)));
              }
            }, _callee45);
          }));
          return function (_x88, _x89, _x90) {
            return _ref45.apply(this, arguments);
          };
        }();
        this.epgHlsUrlV2 = /*#__PURE__*/function () {
          var _ref46 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee46(e, t, i) {
            var s;
            return _regenerator().w(function (_context46) {
              while (1) switch (_context46.n) {
                case 0:
                  s = St(e, t, i, v());
                  return _context46.a(2, _this.fetchGQL(s).then(r => new Z(r)));
              }
            }, _callee46);
          }));
          return function (_x91, _x92, _x93) {
            return _ref46.apply(this, arguments);
          };
        }();
        this.commentVoteUp = /*#__PURE__*/function () {
          var _ref47 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee47(e, t) {
            var i;
            return _regenerator().w(function (_context47) {
              while (1) switch (_context47.n) {
                case 0:
                  i = Pt(e, t);
                  return _context47.a(2, _this.fetchGQL(i));
              }
            }, _callee47);
          }));
          return function (_x94, _x95) {
            return _ref47.apply(this, arguments);
          };
        }();
        this.commentVoteDown = /*#__PURE__*/function () {
          var _ref48 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee48(e, t) {
            var i;
            return _regenerator().w(function (_context48) {
              while (1) switch (_context48.n) {
                case 0:
                  i = Mt(e, t);
                  return _context48.a(2, _this.fetchGQL(i));
              }
            }, _callee48);
          }));
          return function (_x96, _x97) {
            return _ref48.apply(this, arguments);
          };
        }();
        this.commentAdd = /*#__PURE__*/function () {
          var _ref49 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee49(e, t, i) {
            var s;
            return _regenerator().w(function (_context49) {
              while (1) switch (_context49.n) {
                case 0:
                  s = Ct(e, t, i);
                  return _context49.a(2, _this.fetchGQL(s));
              }
            }, _callee49);
          }));
          return function (_x98, _x99, _x100) {
            return _ref49.apply(this, arguments);
          };
        }();
        this.jokeVoteUp = /*#__PURE__*/function () {
          var _ref50 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee50(e) {
            var t;
            return _regenerator().w(function (_context50) {
              while (1) switch (_context50.n) {
                case 0:
                  t = It(e);
                  return _context50.a(2, _this.fetchGQL(t));
              }
            }, _callee50);
          }));
          return function (_x101) {
            return _ref50.apply(this, arguments);
          };
        }();
        this.jokeVoteDown = /*#__PURE__*/function () {
          var _ref51 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee51(e) {
            var t;
            return _regenerator().w(function (_context51) {
              while (1) switch (_context51.n) {
                case 0:
                  t = At(e);
                  return _context51.a(2, _this.fetchGQL(t));
              }
            }, _callee51);
          }));
          return function (_x102) {
            return _ref51.apply(this, arguments);
          };
        }();
        this.pollVote = /*#__PURE__*/function () {
          var _ref52 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee52(e, t, i) {
            var s;
            return _regenerator().w(function (_context52) {
              while (1) switch (_context52.n) {
                case 0:
                  s = qt(e, t, i);
                  return _context52.a(2, _this.fetchGQL(s));
              }
            }, _callee52);
          }));
          return function (_x103, _x104, _x105) {
            return _ref52.apply(this, arguments);
          };
        }();
        this.recipeBookmarkDelete = /*#__PURE__*/function () {
          var _ref53 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee53(e, t) {
            var i;
            return _regenerator().w(function (_context53) {
              while (1) switch (_context53.n) {
                case 0:
                  i = Dt(e, t);
                  return _context53.a(2, _this.fetchGQL(i));
              }
            }, _callee53);
          }));
          return function (_x106, _x107) {
            return _ref53.apply(this, arguments);
          };
        }();
        this.recipeBookmarkGroupDelete = /*#__PURE__*/function () {
          var _ref54 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee54(e) {
            var t;
            return _regenerator().w(function (_context54) {
              while (1) switch (_context54.n) {
                case 0:
                  t = Ht(e);
                  return _context54.a(2, _this.fetchGQL(t));
              }
            }, _callee54);
          }));
          return function (_x108) {
            return _ref54.apply(this, arguments);
          };
        }();
        this.recipeBookmarkGroupAddRename = /*#__PURE__*/function () {
          var _ref55 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee55(e, t) {
            var i;
            return _regenerator().w(function (_context55) {
              while (1) switch (_context55.n) {
                case 0:
                  i = xt(e, t);
                  return _context55.a(2, _this.fetchGQL(i));
              }
            }, _callee55);
          }));
          return function (_x109, _x110) {
            return _ref55.apply(this, arguments);
          };
        }();
        this.recipeBookmarkAddToGroup = /*#__PURE__*/function () {
          var _ref56 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee56(e, t) {
            var i;
            return _regenerator().w(function (_context56) {
              while (1) switch (_context56.n) {
                case 0:
                  i = _t(e, t);
                  return _context56.a(2, _this.fetchGQL(i));
              }
            }, _callee56);
          }));
          return function (_x111, _x112) {
            return _ref56.apply(this, arguments);
          };
        }();
        this.voyoCategory = /*#__PURE__*/function () {
          var _ref57 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee57(e) {
            var t;
            return _regenerator().w(function (_context57) {
              while (1) switch (_context57.n) {
                case 0:
                  t = Bt(e);
                  return _context57.a(2, _this.fetchGQL(t).then(i => new Jt(i)));
              }
            }, _callee57);
          }));
          return function (_x113) {
            return _ref57.apply(this, arguments);
          };
        }();
        this.video = /*#__PURE__*/function () {
          var _ref58 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee58(e) {
            var t;
            return _regenerator().w(function (_context58) {
              while (1) switch (_context58.n) {
                case 0:
                  t = Gt(e);
                  return _context58.a(2, _this.fetchGQL(t).then(i => new Kt(i)));
              }
            }, _callee58);
          }));
          return function (_x114) {
            return _ref58.apply(this, arguments);
          };
        }();
        this.liveStream = /*#__PURE__*/function () {
          var _ref59 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee59(e) {
            var t;
            return _regenerator().w(function (_context59) {
              while (1) switch (_context59.n) {
                case 0:
                  t = Ot(e);
                  return _context59.a(2, _this.fetchGQL(t).then(i => new Zt(i)));
              }
            }, _callee59);
          }));
          return function (_x115) {
            return _ref59.apply(this, arguments);
          };
        }();
        this.liveStreamReminder = /*#__PURE__*/function () {
          var _ref60 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee60(e) {
            var t;
            return _regenerator().w(function (_context60) {
              while (1) switch (_context60.n) {
                case 0:
                  t = Ft(e);
                  return _context60.a(2, _this.fetchGQL(t).catch(() => {}));
              }
            }, _callee60);
          }));
          return function (_x116) {
            return _ref60.apply(this, arguments);
          };
        }();
        this.userMeta = /*#__PURE__*/function () {
          var _ref61 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee61(e, t) {
            var i;
            return _regenerator().w(function (_context61) {
              while (1) switch (_context61.n) {
                case 0:
                  i = Tt(e, t);
                  return _context61.a(2, _this.fetchGQL(i));
              }
            }, _callee61);
          }));
          return function (_x117, _x118) {
            return _ref61.apply(this, arguments);
          };
        }();
        this.pageHit = /*#__PURE__*/function () {
          var _ref62 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee62(e) {
            var t;
            return _regenerator().w(function (_context62) {
              while (1) switch (_context62.n) {
                case 0:
                  t = _this.options.eventsUrl + "/pagehitandevent";
                  return _context62.a(2, _this.fetchGQL(e, {
                    url: t,
                    skipCleanup: !0
                  }));
              }
            }, _callee62);
          }));
          return function (_x119) {
            return _ref62.apply(this, arguments);
          };
        }();
      }
      fetchGQL(e) {
        var _t$headers;
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var i = t.method || "POST",
          s = {
            "Content-Type": "application/json",
            Authorization: this.authToken || ((_t$headers = t.headers) === null || _t$headers === void 0 ? void 0 : _t$headers.Authorization) || "",
            "Device-Id": this.deviceId,
            "Onl-Location": document.location.href
          },
          r = Object.assign(s),
          n = i === "POST" ? JSON.stringify(e) : null,
          a = t.keepalive || !1,
          l = i === "POST" ? this.options.graphQL : this.options.graphQLCDN,
          d = t.url || l;
        d.startsWith("http") || (d = l + d);
        var m = t.timeout || 2e3;
        return M(d, {
          method: i,
          headers: r,
          body: n,
          timeout: m,
          keepalive: a
        }).then(/*#__PURE__*/function () {
          var _ref63 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee63(h) {
            var c;
            return _regenerator().w(function (_context63) {
              while (1) switch (_context63.n) {
                case 0:
                  if (h.ok) {
                    _context63.n = 2;
                    break;
                  }
                  _context63.n = 1;
                  return h.text();
                case 1:
                  c = _context63.v;
                  throw new Error("GQL:" + c);
                case 2:
                  return _context63.a(2, h.json());
              }
            }, _callee63);
          }));
          return function (_x120) {
            return _ref63.apply(this, arguments);
          };
        }()).then(h => {
          var _window$Sentry2;
          if (t.skipCleanup) return h;
          var c = Object.keys(h.data || {}).map(A => h.data[A]),
            f = c.length ? c[0] : null;
          if (!f && h.errors) throw (_window$Sentry2 = window.Sentry) !== null && _window$Sentry2 !== void 0 && _window$Sentry2.setContext("gqlError", {
            url: d,
            method: i,
            headers: r,
            body: n,
            timeout: m,
            keepalive: a
          }), new W(h.errors);
          return f;
        }).catch(h => {
          throw console.warn("Fetch error:", h), h;
        });
      }
    },
    Ci = oe;
  var ne = class {
      constructor(e) {
        this.html = e;
      }
      sendEvent(e, t) {
        var i = new CustomEvent(e, {
          detail: t,
          bubbles: !0,
          cancelable: !0,
          composed: !1
        });
        document.dispatchEvent(i);
      }
      on(e, t) {
        document.addEventListener(e, i => t(i));
      }
      onWindow(e, t) {
        window.addEventListener(e, i => t(i));
      }
      startEvents() {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;
        var t = ["onclick", "onsubmit", "onmouseleave", "onmouseenter", "onmouseup", "onmousedown"];
        t.forEach(i => {
          this.startEvent(i, this.html.q(e));
        });
      }
      startEvent(e, t) {
        this.html.qAll(`[data-${e}]`, t).forEach(i => {
          var s = this.html.getData(i, e),
            r = e.substring(2);
          i.addEventListener(r, n => {
            if (!window[s]) {
              console.log("Missing handler", s);
              return;
            }
            this.sendEvent("user_activity", {
              eventName: e,
              handler: s
            }), window[s](n);
          });
        });
      }
    },
    Ii = ne;
  var ae = class {
      constructor() {
        this.scriptsLoaded = [];
        this.stylesLoaded = [];
      }
      q(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        return typeof e != "string" ? e : (t || document).querySelector(e);
      }
      qAll(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        if (e instanceof HTMLElement) return [e];
        if (typeof e != "string") return e;
        var i = t || document;
        return Array.from(i.querySelectorAll(e));
      }
      inject(e, t) {
        if (t) {
          if (typeof e == "string") {
            var i = this.qAll(e);
            if (!i || !i.length) return;
            e = i;
          } else Array.isArray(e) || (e = [e]);
          e.forEach(i => {
            this.qAll("[data-field]", i).forEach(s => this.injectFieldData(s, t));
          });
        }
      }
      writeHTML(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        this.qAll(e, i).forEach(r => r.innerHTML = t);
      }
      appendHTML(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var s = this.q(e, i);
        s && s.insertAdjacentHTML("beforeend", t);
      }
      prependHTML(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var s = this.q(e, i);
        s && s.insertAdjacentHTML("afterbegin", t);
      }
      extractHTML(e, t) {
        var _DOMParser$parseFromS;
        return ((_DOMParser$parseFromS = new DOMParser().parseFromString(e, "text/html").querySelector(t)) === null || _DOMParser$parseFromS === void 0 ? void 0 : _DOMParser$parseFromS.innerHTML) || "";
      }
      extractData(e, t, i) {
        var n = new DOMParser().parseFromString(e, "text/html").querySelector(t);
        if (!n) return "";
        var a = n.dataset[i];
        return a !== null && a !== void 0 ? a : "";
      }
      show(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "block";
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        this.qAll(e, i).forEach(s => s.style.display = t || "block");
      }
      isShown(e) {
        var t = this.q(e);
        return t ? t.style.display !== "none" && t.style.display !== "" : !1;
      }
      hide(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        this.qAll(e, t).forEach(i => i.style.display = "none");
      }
      toggle(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        this.qAll(e, i).forEach(s => {
          s.style.display === "none" ? this.show(s, t, i) : this.hide(s, i);
        });
      }
      clear(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        this.qAll(e, t).forEach(i => i.innerHTML = "");
      }
      addClass(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var s = this.qAll(e, i);
        !(s !== null && s !== void 0 && s.length) || !t || s.forEach(r => {
          t.split(" ").filter(a => a).forEach(a => r.classList.add(a));
        });
      }
      removeClass(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var s = this.qAll(e, i);
        !(s !== null && s !== void 0 && s.length) || !t || s.forEach(r => {
          t.split(" ").filter(a => a).forEach(a => r.classList.remove(a));
        });
      }
      toggleClasses(e, t, i) {
        var s = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var r = this.qAll(e, s);
        if (!r.length || !t) return;
        var a = t.split(" ")[0];
        r.forEach(l => {
          this.hasClass(l, a) ? (this.removeClass(l, t), this.addClass(l, i)) : (this.removeClass(l, i), this.addClass(l, t));
        });
      }
      toggleClass(e, t) {
        var i = this.qAll(e);
        i.length && t && i.forEach(s => this.hasClass(s, t) ? this.removeClass(s, t) : this.addClass(s, t));
      }
      toggleClassIf(e, t, i) {
        var s = this.qAll(e);
        s.length && i && s.forEach(r => t ? this.addClass(r, i) : this.removeClass(r, i));
      }
      hasClass(e, t) {
        var _this$q;
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        return !!((_this$q = this.q(e, i)) !== null && _this$q !== void 0 && _this$q.classList.contains(t));
      }
      setStyle(e, t, i) {
        var s = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var r = this.qAll(e, s);
        r.length && r.forEach(n => n.style[t] = i);
      }
      setFocus(e) {
        var t = this.q(e);
        t && t.focus();
      }
      getData(e, t) {
        var _this$q2;
        return ((_this$q2 = this.q(e)) === null || _this$q2 === void 0 ? void 0 : _this$q2.dataset[t]) || "";
      }
      setData(e, t, i) {
        var s = this.q(e);
        s && (s.dataset[t] = i.toString());
      }
      hasData(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !1;
        var s = this.q(e);
        return i ? !!(s !== null && s !== void 0 && s.dataset[t]) : (s === null || s === void 0 ? void 0 : s.dataset[t]) !== void 0;
      }
      setChecked(e, t) {
        var i = this.q(e);
        i && (i.checked = t);
      }
      isChecked(e) {
        var t = this.q(e);
        return t ? t.checked : !1;
      }
      closest(e, t) {
        var i = this.q(t);
        return i ? i.closest(e) : null;
      }
      buttonDisable(e) {
        this.q(e).disabled = !0;
      }
      buttonEnable(e) {
        this.q(e).disabled = !1;
      }
      closeFullscreen() {
        this.removeClass("body", "showing-fullscreen");
      }
      openFullscreen() {
        this.addClass("body", "showing-fullscreen");
      }
      fetchText(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : void 0;
        return t !== null && t !== void 0 && t.user && (t.headers = Object.assign(t.headers || {}, {
          Authorization: t.user.token,
          "Device-Id": t.user.deviceId,
          "Onl-Location": document.location.href
        })), k(() => M(e, t)).then(i => i === null || i === void 0 ? void 0 : i.text());
      }
      execHtmlScript(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
        var i = this.q(e);
        if (!i || !i.innerHTML.includes("<script>") || !i.innerHTML.includes("<\/script>")) return;
        var s = i.innerHTML,
          r = s.indexOf("<script>") + 8,
          n = s.lastIndexOf("<\/script>");
        if (t) {
          var a = s.indexOf("document.addEventListener", r);
          r = s.indexOf("{", a + 20) + 1, n = s.lastIndexOf("})", n);
        }
        s = s.substring(r, n), this.loadScript("", e, s);
      }
      loadVideoElements(e) {
        return this.loadScript("/assets/videojs/video_8.9.0.min.js").then(t => this.loadScript("https://imasdk.googleapis.com/js/sdkloader/ima3.js")).catch(t => {}).then(t => this.loadStyle("/assets/videojs/video-js_8.9.0.min.css")).then(t => Promise.all([this.loadScript("https://cdn.jsdelivr.net/npm/videojs-vtt-thumbnails@0.0.13/dist/videojs-vtt-thumbnails.min.js"), this.loadScript("https://cdn.jsdelivr.net/npm/videojs-contrib-ads@7.3.2/dist/videojs-contrib-ads.min.js").catch(i => {}), this.loadScript("https://cdn.jsdelivr.net/npm/videojs-ima@2.2.0/dist/videojs.ima.min.js").catch(i => {}), e ? this.loadScript("/assets/videojs/videojs-contrib-eme_5.5.2.min.js").catch(i => {}) : Promise.resolve()])).then(t => !0);
      }
      loadVideoBannerElements() {
        return this.loadScript("https://imasdk.googleapis.com/js/sdkloader/ima3.js").then(e => !0);
      }
      loadStyle(e) {
        return new Promise((t, i) => {
          if (this.styleExists(e)) {
            t(!0);
            return;
          }
          var s = document.createElement("link");
          s.rel = "stylesheet", s.type = "text/css", s.media = "screen", s.href = e, s.onload = () => {
            this.stylesLoaded.push(e), t(!0);
          }, document.getElementsByTagName("head")[0].appendChild(s);
        });
      }
      loadScript() {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
        return !t && !e && Promise.resolve(!1), t = t || e, new Promise((s, r) => {
          if (this.scriptExists(t)) {
            s(!0);
            return;
          }
          var n = document.createElement("script");
          n.type = "text/javascript", n.async = !0, e && (n.src = e), i && (n.text = i), n.onload = () => {
            s(!0), this.scriptsLoaded.push(t);
          }, n.onerror = a => {
            console.log("Load script error:", a), r(!1);
          }, document.getElementsByTagName("body")[0].appendChild(n);
        });
      }
      formatShortDate(e) {
        var t = ("0" + e.getDate()).slice(-2),
          i = ("0" + (e.getMonth() + 1)).slice(-2),
          s = e.getFullYear();
        return t + ". " + i + ". " + s;
      }
      safeJsonParse(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (!e) return t;
        try {
          return JSON.parse(e);
        } catch (i) {
          return console.log("Safe Parse Error", e, i), t;
        }
      }
      scriptExists(e) {
        return this.scriptsLoaded.includes(e);
      }
      styleExists(e) {
        return this.stylesLoaded.includes(e);
      }
      injectFieldData(e, t) {
        var i = this.getData(e, "field");
        i && (e instanceof HTMLImageElement ? i === "avatar" && (e.src = t[i]) : e instanceof HTMLElement && (e.innerHTML = t[i]));
      }
    },
    Ai = ae;
  var le = class {
      constructor(e, t, i, s) {
        this.html = e;
        this.events = t;
        this.cookies = i;
        this.options = s;
      }
      splideInit() {
        this.html.qAll(".splide").length && this.html.loadStyle("/assets/splidejs/splide.min.css?v=" + this.options.version).then(() => this.html.loadScript("/assets/splidejs/splide.min.js?v=" + this.options.version)).then(() => this.events.sendEvent("splide-loaded", ""));
      }
      animalParts(e, t, i, s, r) {
        var n = ".onl-" + e,
          a = this.html.q(n + " .img-animal-parts"),
          l = a.src;
        a.src = l.substring(0, l.lastIndexOf("/") + 1) + e + "-" + t + ".png", this.html.removeClass(n + " BUTTON", "tag--animal-active"), this.html.addClass(n + " .btn-" + t, "tag--animal-active"), this.html.writeHTML(n + " .onl-recipe-title", i), this.html.fetchText(`/animal-part-recipe/${s}/${r}`).then(d => this.html.writeHTML(n + " .onl-recipe-placeholder", d));
      }
      bodyParts(e, t, i) {
        var s = "/telo?gender=" + encodeURIComponent(e);
        t && t !== i && (s += "&body_part=" + encodeURIComponent(t)), location.href = s;
      }
      fillRefridgeratorSelect(e) {
        e.options.length > 1 || this.html.fetchText("/recipes/main-ingredients").then(t => {
          var i = JSON.parse(t).map(s => '<option value="' + s.ItemId + "_" + s.Name.replace('"', "") + '">' + s.Name + "</option>").join("");
          e.innerHTML += i;
        });
      }
      itm(e) {
        var t = this.html.q("#itm_height").value,
          i = this.html.q("#itm_weight").value,
          s = parseInt(t.replace(",", "."), 10),
          r = parseInt(i.replace(",", "."), 10);
        if (!(isNaN(s) || isNaN(r) || !s || !r)) {
          if (e === "calculate") {
            var n = Math.floor(r * 1e4 / (s * s));
            this.html.writeHTML("#itm_value", n.toString()), this.html.show("#itm_result");
          }
          e === "enableBtn" && this.html.removeClass(".itm > button", "button-disabled");
        }
      }
      bmr() {
        var e = this.html.q("#bmr_age").value,
          t = this.html.q("#bmr_height").value,
          i = this.html.q("#bmr_weight").value,
          s = this.html.q("#bmr_gender_m").checked ? "M" : "F",
          r = parseInt(e.replace(",", "."), 10),
          n = parseInt(t.replace(",", "."), 10),
          a = parseInt(i.replace(",", "."), 10);
        if (isNaN(r) || isNaN(n) || isNaN(a) || !r || !n || !a) {
          this.html.hide("#bmr_results");
          return;
        }
        var l = 0;
        s === "F" ? l = Math.round(655 + 9.6 * a + 1.8 * n - 4.7 * r) : l = Math.round(66 + 13.7 * a + 5 * n - 6.8 * r), this.html.writeHTML("#bmr_value", "" + l), this.html.show("#bmr_results");
      }
      instagram() {
        if (this.html.show("#instagram"), (typeof Splide === "undefined" ? "undefined" : _typeof(Splide)) > "u") {
          this.events.on("splide-loaded", () => this.instagram());
          return;
        }
        new Splide("#instagram", {
          perPage: 5,
          gap: 10,
          type: "loop",
          lazyLoad: "nearby",
          arrows: "true",
          autoplay: "true",
          breakpoints: {
            640: {
              perPage: 2
            }
          }
        }).mount();
      }
      roadMapInit() {
        this.map = L.map("map", {
          zoomControl: !1
        }).setView([45.988551, 14.810986], 8), L.tileLayer("https://maps.api.24ur.si/osm_tiles/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 12,
          minZoom: 8
        }).addTo(this.map);
      }
      roadMapMarkers(e) {
        this.map.eachLayer(r => {
          r instanceof L.Marker && this.map.removeLayer(r);
        });
        var t = [],
          i = [{
            check: "#road_accidents",
            data: e.Accidents
          }, {
            check: "#road_traffic",
            data: e.Traffic
          }, {
            check: "#road_works",
            data: e.Works
          }, {
            check: "#road_events",
            data: e.Events
          }],
          s = i.filter(r => this.html.isChecked(r.check));
        t = (s.length > 0 ? s : i).reduce((r, n) => r.concat(n.data), []), t.forEach(r => {
          var n = L.icon({
            iconUrl: "/assets/img/roads/map/" + (r.Priority > 3 ? "3" : r.Priority.toString()) + "/" + r.Sign + ".png",
            iconSize: [20, 20]
          });
          L.marker([r.Lat, r.Lng], {
            icon: n
          }).addTo(this.map).bindPopup("<b>" + r.RoadFull + "</b><br>" + r.Info);
        });
      }
      startMailingPopup(e) {
        if (!this.cookies.cookies.isImportantAllowed()) return;
        var t = 1e3 * 60 * 60 * 24 * 30,
          i = parseInt(this.cookies.get("popup") || "0", 10),
          s = new Date().getTime();
        (!i || s - i > t) && setTimeout(() => {
          this.html.show("#mailing_popup", "flex"), this.cookies.set("popup", "" + s);
        }, e.Delay);
      }
      copyToClipboard(e, t) {
        navigator.clipboard.writeText(t), this.html.addClass(e, "text-copied"), setTimeout(() => {
          this.html.removeClass(e, "text-copied");
        }, 2e3);
      }
      runTicker(e) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            this.moveTicker(e);
          }, 4e3);
        });
      }
      initChat(e) {
        var t = e === null || e === void 0 ? void 0 : e.getCurrentUserStatus();
        if (["hr", "rs", "ba"].includes(this.options.country) && t !== null && t !== void 0 && t.vendors["synverso-rpHFAEwq"]) {
          var i = t.vendors["synverso-rpHFAEwq"];
          i && i.enabled && this.html.loadScript("/assets/chat/chat_" + this.options.country + ".js");
        }
        if (["si"].includes(this.options.country) && t !== null && t !== void 0 && t.vendors["nexios-QazcaFyb"]) {
          var _i2 = t.vendors["nexios-QazcaFyb"];
          _i2 && _i2.enabled && this.html.loadScript("/assets/chat/chat_" + this.options.country + ".js");
        }
      }
      initExponea(e) {
        var t = e === null || e === void 0 ? void 0 : e.getCurrentUserStatus();
        ["ba", "hr", "rs"].includes(this.options.country) && t !== null && t !== void 0 && t.vendors["bloomreach-9PPPkYrG"] && this.html.loadScript("/assets/exponea/exponea_" + this.options.country + ".js"), ["si", "bg"].includes(this.options.country) && (t === null || t === void 0 ? void 0 : t.vendors["bloomreach-zR9Zmbfe"]) && this.html.loadScript("/assets/exponea/exponea_" + this.options.country + ".js");
      }
      exponeaIdentifyUser(e) {
        var t = window.exponea;
        !t || !e || t.identify({
          user_id: e.id
        });
      }
      moveTicker(e) {
        var t = this.html.qAll(e + " .ticker_item"),
          i = this.html.q(e + " .ticker_active"),
          s = this.html.q(e + " .ticker_item");
        if (!s || !t || !i) return;
        this.html.removeClass(i, "ticker_active");
        var r = t.indexOf(i) + 1;
        r >= t.length ? this.html.addClass(s, "ticker_active") : this.html.addClass(t[r], "ticker_active"), this.runTicker(e);
      }
    },
    qi = le;
  function Di() {
    return ("10000000-1000-4000-8000" + -1e11).replace(/[018]/g, o => (o ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> o / 4).toString(16));
  }
  var de = class {
      constructor(e, t, i, s, r) {
        this.events = e;
        this.cookies = t;
        this.gql = i;
        this.html = s;
        this.options = r;
        this.user = null;
        this.deviceId = null;
      }
      handleDeviceId() {
        this.deviceId = this.cookies.get("device-id"), this.deviceId || (this.deviceId = Di(), this.cookies.set("device-id", this.deviceId || "")), this.gql.deviceId = this.deviceId || "";
      }
      get hasDeviceId() {
        return !!this.cookies.get("device-id");
      }
      get cacheBuster() {
        var _this$user;
        return (_this$user = this.user) !== null && _this$user !== void 0 && _this$user.token ? "v=" + this.user.token.substring(this.user.token.length - 8) + "_" + Math.random().toString() + "&t=" + new Date().getTime() : "v=" + Math.random().toString() + "&t=" + new Date().getTime();
      }
      loadUserInfo() {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !0;
        var t = this.cookies.get("sso_jwt");
        return t ? (this.gql.authToken = t, this.gql.loginInfo(t, this.options.siteId, e).then(i => !i && window.isPageUnloading ? Promise.reject("page_unloading") : i).then(i => this.userLoaded(i)).catch(i => i === "page_unloading" ? Promise.reject(i) : (this.userLoaded(null), Promise.reject(null)))) : (this.userLoaded(null), Promise.resolve(null));
      }
      tryCrossLogin() {
        var e = this.html.getData("#sso_iframe", "src"),
          t = this.html.q("#sso_iframe");
        !t || !e || (this.events.onWindow("message", i => {
          i.origin === this.options.loginUrl && (this.processCrossLoginMessage(i.data), i.data && i.data.jwt && this.loadUserInfo());
        }), t.src = e);
      }
      processCrossLoginMessage(e) {
        e.deviceId && this.deviceId !== e.deviceId && (this.deviceId = e.deviceId || "", this.cookies.set("device-id", this.deviceId), this.gql.deviceId = this.deviceId), e.jwt && this.cookies.set("sso_jwt", e.jwt);
      }
      userLoaded(e) {
        return this.user = e, this.html.removeClass("body", "user-unknown user-loggedin"), e ? (this.cookies.set("sso_jwt", e.token), this.gql.authToken = e.token, this.html.addClass("body", "user-loggedin"), this.events.sendEvent("user", this.user)) : (this.cookies.delete("sso_jwt"), this.gql.authToken = ""), e;
      }
      logout() {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "/odjava";
        var t = this.cookies.get("sso_jwt") || "";
        this.userLoaded(null), this.goLogin(e, t);
      }
      goLogin() {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "/prijava";
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var i = this.cookies.get("device-id") || "",
          s = this.options.loginUrl + e;
        s += "?c=" + new Date().getTime() + "_" + Math.random(), s += "&from=" + encodeURIComponent(location.toString()), s += "&device_id=" + encodeURIComponent(i), t && (s += "&jwt=" + encodeURIComponent(t)), window.location.href = s;
      }
      submitMailing(e, t, i) {
        var s = this.html.q('input[type="email"]', e);
        s && this.gql.registerEmailOnly(s.value, this.options.siteId, t, i).then(r => this.afterRegisterEmailOnly(r, e)).catch(() => {
          this.html.show("#mailing_error", "block", e);
        });
      }
      colorScheme(e) {
        var _this$html$q, _this$html$q2;
        if ((_this$html$q = this.html.q("html")) !== null && _this$html$q !== void 0 && _this$html$q.classList.remove("dark", "light"), (_this$html$q2 = this.html.q("html")) !== null && _this$html$q2 !== void 0 && _this$html$q2.classList.add(e), this.events.sendEvent("colorSchemeChange", e), e === this.options.colorScheme) {
          localStorage.removeItem("color_scheme");
          return;
        }
        localStorage.setItem("color_scheme", e);
      }
      afterRegisterEmailOnly(e, t) {
        this.html.show("#mailing_success", "flex", t.parentElement), this.html.hide(t), t.reset();
      }
    },
    Hi = de;
  var me = class extends Hi {
      constructor(t, i, s, r, n, a, l) {
        super(t, i, s, r, l);
        this.events = t;
        this.cookies = i;
        this.gql = s;
        this.html = r;
        this.profiles = n;
        this.localStorage = a;
        this.options = l;
      }
      loginUser(t, i) {
        return !t || !i ? Promise.reject(null) : this.gql.loginUser(t, i, this.options.siteId).then(s => this.userLoaded(s));
      }
      loginWithDevice(t, i) {
        return t ? this.gql.loginWithDevice(t, i, this.options.siteId).then(s => this.userLoaded(s)) : Promise.resolve(null);
      }
      registerUser(t, i, s, r, n, a, l) {
        return this.gql.registerUser(t, i, "", "U", this.options.siteId, !0, s, r, n, a, l).then(d => this.userLoaded(d));
      }
      newPassword(t, i) {
        return !t || !i ? Promise.reject() : this.gql.newPassword(t, i).then(s => this.userLoaded(s));
      }
      userLoaded(t) {
        return super.userLoaded(t), t || this.deleteCookiesAndStorage(), t;
      }
      logoutUser() {
        var t = this.gql.logoutUser();
        return this.deleteCookiesAndStorage(), t;
      }
      deleteCookiesAndStorage() {
        this.cookies.delete("sso_jwt"), this.localStorage.remove("voyoBookmarks"), this.localStorage.remove("voyoProfiles");
      }
      loginToProfile(t) {
        return t ? this.gql.loginProfile(t).then(i => this.userLoaded(i)).then(i => {
          if (!i) throw new Error("no user");
          return this.profiles.voyoProfiles(!1).then(() => i);
        }).catch(i => {
          throw this.profiles.profilesToCache([]), i;
        }) : Promise.reject(null);
      }
      saveProfile(t, i, s, r) {
        return !i || !r ? Promise.resolve(null) : t ? this.gql.updateProfile(t, i, r) : this.gql.newProfile(i, s, r);
      }
      deleteProfile(t, i) {
        return t ? this.gql.deleteProfile(t).then(s => {
          this.profiles.profilesToCache(s);
          var r = this.profiles.profileOfType(i);
          return this.loginToProfile((r === null || r === void 0 ? void 0 : r.profileId) || 0);
        }) : Promise.reject(null);
      }
      linkDeviceToUser(t) {
        var _this$user2;
        return t ? (_this$user2 = this.user) !== null && _this$user2 !== void 0 && _this$user2.deviceId ? Promise.resolve(this.user) : this.gql.linkDeviceToUser(this.options.device.family, this.options.device.name, this.options.device.model).then(i => this.userLoaded(i)) : Promise.resolve(this.user);
      }
      loginGuard(t) {
        return this.user ? !0 : (t && (t.preventDefault(), t.stopPropagation()), document.location.href = this.options.routes.login, !1);
      }
    },
    xi = me;
  var he = class {
      constructor(e, t, i, s, r, n, a, l, d) {
        this.html = e;
        this.events = t;
        this.user = i;
        this.voyoVideo = s;
        this.gql = r;
        this.profiles = n;
        this.bookmarks = a;
        this.localStorage = l;
        this.options = d;
      }
      playTrailer(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var i = this.html.q(".trailer", this.html.q(e));
        if (i) {
          if (_typeof(t.muted) > "u") {
            var s = this.html.hasClass("body", "trailer_muted");
            t.muted = s;
          }
          this.voyoVideo.initForTrailer(i, t);
        }
      }
      toggleBookmark(e) {
        this.bookmarks.isBookmarked("GRP_DEFAULT", e) ? (this.bookmarks.voyoBookmarkRemove("GRP_DEFAULT", e), this.html.removeClass("#content", "myVoyo")) : (this.bookmarks.voyoBookmarkAdd("GRP_DEFAULT", new p({
          entityId: e
        })), this.html.addClass("#content", "myVoyo myVoyo-check"), setTimeout(() => {
          this.html.removeClass("#content", "myVoyo-check");
        }, 2e3));
      }
      toggleSlideBookmark(e, t) {
        var i = this.bookmarks.isBookmarked("GRP_DEFAULT", t),
          s;
        i ? s = this.bookmarks.voyoBookmarkRemove("GRP_DEFAULT", t).then(() => {
          this.html.addClass(e.closest(".splide__slide"), "myVoyo-removed-check"), setTimeout(() => {
            var r = this.html.qAll('.splide__slide[data-uniq="' + t + '"]');
            this.html.removeClass(r, "myVoyo"), this.html.removeClass(r, "myVoyo-removed-check");
          }, 2e3);
        }) : s = this.bookmarks.voyoBookmarkAdd("GRP_DEFAULT", new p({
          entityId: t
        })).then(() => {
          var r = this.html.qAll('.splide__slide[data-uniq="' + t + '"]');
          this.html.addClass(r, "myVoyo myVoyo-check"), setTimeout(() => {
            this.html.removeClass(r, "myVoyo-check");
          }, 2e3);
        }), s.then(() => this.reloadMyVoyoBookmarkSlides());
      }
      tagBookmarks() {
        var e = this.bookmarks.get();
        e !== null && e !== void 0 && e.groupItems("GRP_DEFAULT").forEach(t => {
          this.html.addClass('[data-uniq="' + t.voyokey + '"]', "myVoyo");
        }), e === null || e === void 0 ? void 0 : e.groupItems("stayedAt").forEach(t => {
          this.html.addClass('[data-uniq="' + t.voyokey + '"]', "stayedAt"), this.html.setStyle('[data-uniq="' + t.voyokey + '"] .progressbar .line', "width", t.percent + "%");
        });
      }
      hasBookmarksBox() {
        return !!this.html.q(".voyobox.bookmarks");
      }
      loadBookmarkSlides() {
        var _this$user$user;
        if (!((_this$user$user = this.user.user) !== null && _this$user$user !== void 0 && _this$user$user.token)) return Promise.resolve(null);
        var t = this.html.getData("body", "urlPrefix") + "/bookmark/voyobox_slides?" + this.user.cacheBuster;
        return this.html.fetchText(t, {
          timeout: 4e3,
          user: this.user.user
        }).then(i => {
          var _this$html$q3, _this$html$q4;
          var s = this.html.extractHTML(i, "#stayedat"),
            r = this.html.extractHTML(i, "#myvoyo");
          return s.trim().length > 100 ? this.html.writeHTML(".voyobox.continue_watching .slider", s) : (_this$html$q3 = this.html.q(".voyobox.continue_watching")) === null || _this$html$q3 === void 0 ? void 0 : _this$html$q3.remove(), r.trim().length > 100 ? this.html.writeHTML(".voyobox.bookmarks .slider", r) : (_this$html$q4 = this.html.q(".voyobox.bookmarks")) === null || _this$html$q4 === void 0 ? void 0 : _this$html$q4.remove(), this.events.sendEvent("bookmarks-slides-fetched", {}), this.extractBookmarksFromSlidesHtml(i);
        }).catch(() => {
          var _this$html$q5, _this$html$q6;
          return (_this$html$q5 = this.html.q(".voyobox.continue_watching")) !== null && _this$html$q5 !== void 0 && _this$html$q5.remove(), (_this$html$q6 = this.html.q(".voyobox.bookmarks")) !== null && _this$html$q6 !== void 0 && _this$html$q6.remove(), null;
        });
      }
      extractBookmarksFromSlidesHtml(e) {
        var t = this.html.extractData(e, "#bookmarks-data", "bookmarks");
        if (!t) return null;
        try {
          return new P(JSON.parse(t));
        } catch (i) {
          return console.error("Error parsing bookmarks data:", i, t), null;
        }
      }
      reloadMyVoyoBookmarkSlides() {
        var _this$user$user2;
        if (!((_this$user$user2 = this.user.user) !== null && _this$user$user2 !== void 0 && _this$user$user2.token)) return Promise.reject(!1);
        var t = this.html.getData("body", "urlPrefix") + "/bookmark/voyobox_slides?" + this.user.cacheBuster;
        return this.html.fetchText(t, {
          timeout: 4e3,
          user: this.user.user
        }).then(i => {
          var _this$html$q7;
          var s = this.html.extractHTML(i, "#myvoyo");
          s.trim().length > 100 ? (this.html.writeHTML(".voyobox.bookmarks .slider", s), this.events.sendEvent("myVoyo-slide-reloaded", {})) : (_this$html$q7 = this.html.q(".voyobox.bookmarks")) === null || _this$html$q7 === void 0 ? void 0 : _this$html$q7.remove();
        }).catch(() => {
          var _this$html$q8;
          (_this$html$q8 = this.html.q(".voyobox.bookmarks")) === null || _this$html$q8 === void 0 || _this$html$q8.remove();
        });
      }
      loadRecommendedSlides() {
        var _this$user$user3;
        if (!((_this$user$user3 = this.user.user) !== null && _this$user$user3 !== void 0 && _this$user$user3.token)) return Promise.resolve(!1);
        var e = "/recommended/voyobox_slides?" + this.user.cacheBuster;
        return this.html.fetchText(e, {
          timeout: 4e3,
          user: this.user.user
        }).then(t => {
          var _this$html$q9;
          if (t.trim().length < 100) return !1;
          var i = this.html.extractHTML(t, "#main_slides"),
            s = this.html.extractHTML(t, "#main_slides_view_tracker"),
            r = this.html.extractHTML(t, "#other_boxes");
          this.html.appendHTML(".recommended_main .slider", i), this.html.writeHTML(".recommended_main .view_tracker", s), this.html.removeClass(".recommended_main", "hidden"), this.html.removeClass(".recommended_main .track", "hidden"), r.length > 100 && ((_this$html$q9 = this.html.q(".recommended_main")) === null || _this$html$q9 === void 0 ? void 0 : _this$html$q9.insertAdjacentHTML("afterend", r));
        }).catch(t => (console.log("Error loading recommended slides", t), !1));
      }
      loadSeasonEpisodes(e, t, i, s) {
        var r = this.html.getData(s, "current"),
          a = this.html.getData("body", "urlPrefix") + "/info/" + e + "/seasons/" + encodeURIComponent(t) + "/episodes/" + i;
        return t === r ? Promise.resolve(!1) : this.html.fetchText(a).then(l => {
          var d = this.html.extractHTML(l, "#season_episodes");
          this.html.writeHTML(s, d), this.html.setData(s, "current", t);
        });
      }
      refreshStreams() {
        return this.html.fetchText("/streams").then(e => {
          var t = this.html.getData("#voyobox_streams .track", "hash"),
            i = this.html.extractData(e, "#voyobox_streams .track", "hash");
          if (t === i) return [!1, ""];
          var s = this.html.extractHTML(e, "#voyobox_streams .track");
          return [!!s, s];
        }).catch(e => (console.error("Error refreshing streams:", e), [!1, ""]));
      }
      showContentDetails(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".details_placeholder";
        return this.html.fetchText("/details" + e).then(i => i ? (this.voyoVideo.stopVideoPlayers(), this.html.writeHTML(t, i), this.html.removeClass(t, "hidden"), !0) : !1).catch(i => (console.log("Error loading data from server", i), !1));
      }
      hideContentDetails() {
        this.html.writeHTML(".details_placeholder", ""), this.html.addClass(".details_placeholder", "hidden");
      }
      streamReminder(e) {
        this.gql.liveStreamReminder(e).then(() => {
          this.html.removeClass("#content .stream_reminder_toast", "hidden"), this.html.buttonDisable("#content .stream_reminder_button"), setTimeout(() => {
            this.html.addClass("#content .stream_reminder_toast", "hidden"), this.html.buttonEnable("#content .stream_reminder_button");
          }, 2e3);
        });
      }
    },
    _i = he;
  var ce = class {
      constructor(e, t, i, s, r, n, a, l, d) {
        this.html = e;
        this.user = t;
        this.bookmarks = i;
        this.gql = s;
        this.events = r;
        this.muxStats = n;
        this.shaka = a;
        this.rateLimiter = l;
        this.options = d;
        this.timelinePreview = null;
        this.timelineOrigin = null;
        this.timelineEl = null;
        this.btnEndCredits = null;
        this.btnEpisodeRecap = null;
        this.btnStartCredits = null;
        this.volumeSlider = null;
        this.freezeControls = !1;
        this.currentVideoId = 0;
        this.lastTimeUpdateAt = 0;
        this.lastEpgUrl = "";
        this.lastNonZeroVolume = .75;
        document.addEventListener("fullscreenchange", () => this.onFullscreenChange()), this.throttledShowVideoControls = this.rateLimiter.throttle(this.showVideoControls.bind(this), 400);
      }
      lookupElements() {
        this.controlsEl = this.html.q("#controls"), this.timelinePreview = this.html.q("#timeline_preview", this.controlsEl), this.timelineEl = this.html.q("voyo-timeline", this.controlsEl), this.btnEpisodeRecap = this.html.q("#episode_recap"), this.btnStartCredits = this.html.q("#start_credits"), this.btnEndCredits = this.html.q("#next_episode"), this.volumeSlider = this.html.q(".volume__slider");
      }
      initForPlay(e, t, i) {
        if (this.video = this.html.q(e), !this.video) throw new Error("What video element: " + e + "?");
        if (!t) throw new Error("What video id: " + t + "?");
        this.currentVideoId = t, clearTimeout(this.trailerTimer);
        var s = this.html.getData(this.video, "playbackOptions");
        return this.videoOptions = Object.assign({}, this.html.safeJsonParse(s), i), this.videoOptions.type !== "live_stream" && !this.videoOptions.isTrailer && (this.videoOptions.allowSaveToStayedAt = !0), this.videoOptions.drmProtected = !this.videoOptions.isTrailer, this.videoOptions.type = this.videoOptions.type || "video", this.videoOptions.volume = this.options.videoVolume, this.thumbnails = [], this.lookupElements(), this.setEvents(this.video, this.videoOptions), this.loadUrl(this.video, t, this.videoOptions).then(() => this.parseVtt(this.video, this.videoOptions)).catch(r => {
          var n = (r === null || r === void 0 ? void 0 : r.message) || "";
          n === "no_access" ? document.location.href = "/" : n === "too_many_devices" ? document.location.href = this.options.routes.too_many_devices : console.log("Video playback error", r);
        });
      }
      initForCatchUp(e, t) {
        if (this.video = this.html.q(e), !this.video) throw new Error("What epg element: " + e + "?");
        var i = this.html.getData(this.video, "playbackOptions");
        return this.videoOptions = Object.assign({}, this.html.safeJsonParse(i), t), this.videoOptions.drmProtected = !0, this.videoOptions.type = "epg", this.thumbnails = [], this.videoOptions.volume = this.options.videoVolume, this.lookupElements(), this.setEvents(this.video, this.videoOptions), this.loadEpgUrl(this.video, this.videoOptions).catch(s => {
          var r = (s === null || s === void 0 ? void 0 : s.message) || "";
          r === "no_access" ? document.location.href = "/" : r === "too_many_devices" ? document.location.href = this.options.routes.too_many_devices : console.log("Epg playback error", s);
        });
      }
      initForTrailer(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (this.video = this.html.q(e), !this.video) throw new Error("What video element: " + e + "?");
        clearTimeout(this.trailerTimer);
        var i = +this.html.getData(e, "trailer");
        if (!i) return;
        this.currentVideoId = i, t.length || (t.length = +this.html.getData(this.video, "trailer_length")), this.lookupElements(), t.drmProtected = !1, t.isTrailer = !0, t.muted = t.muted || !1, t.volume = this.options.videoVolume, t.type = "video", t.paused = !this.options.playTrailers, this.video.onended = r => this.onTrailerEnded(t, r);
        var s = this.video.closest(".splide") || this.html.q("body");
        this.html.removeClass(s, "trailer_playing trailer_replay"), this.html.addClass(s, "trailer_init"), this.trailerTimer = setTimeout(() => {
          this.loadUrl(this.video, i, t).then(() => {
            this.html.removeClass(s, "trailer_init"), t.paused ? this.html.hide(this.video) : (this.html.show(this.video), this.html.addClass(s, "trailer_playing"));
          }).catch(r => console.log("Trailer playback error", r));
        }, 2500);
      }
      playPauseTrailer() {
        if (!this.video) return;
        this.html.show(this.video);
        var e = this.video.closest(".splide") || this.html.q("body");
        this.video.paused ? (this.video.play(), this.html.addClass(e, "trailer_playing")) : (this.video.pause(), this.html.removeClass(e, "trailer_playing"));
      }
      replayTrailer() {
        if (!this.video) return;
        var e = this.video.closest(".splide") || this.html.q("body");
        this.html.addClass(e, "trailer_playing"), this.html.removeClass(e, "trailer_replay"), this.html.show(this.video), this.video.currentTime = 0, this.video.play();
      }
      onTrailerEnded(e, t) {
        this.html.hide(t.target);
        var i = this.html.q(".trailer_playing");
        i && (this.html.removeClass(i, "trailer_playing"), this.html.addClass(i, "trailer_replay"));
      }
      stopVideoPlayers() {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !1;
        this.currentVideoId = 0, this.shaka.destroy(), this.html.qAll("video").forEach(t => {
          var _i$parentNode;
          var i = t;
          for (i.pause(); i.firstChild;) i.removeChild(i.firstChild);
          i.removeAttribute("src"), i.load(), this.html.hide(t), e && ((_i$parentNode = i.parentNode) === null || _i$parentNode === void 0 ? void 0 : _i$parentNode.removeChild(i));
        }), clearTimeout(this.trailerTimer), this.html.removeClass(".trailer_playing", "trailer_playing"), this.html.removeClass(".trailer_replay", "trailer_replay"), this.setControlsFrozen(!1);
      }
      stopEndCredits() {
        this.btnEndCredits && this.html.addClass(this.btnEndCredits, "hidden"), this.html.setData(this.video, "endcredits", "stop");
      }
      stopEpisodeRecap() {
        this.btnEpisodeRecap && this.html.addClass(this.btnEpisodeRecap, "hidden"), this.html.setData(this.video, "episoderecap", "stop");
      }
      stopStartCredits() {
        this.btnStartCredits && this.html.addClass(this.btnStartCredits, "hidden"), this.html.setData(this.video, "startcredits", "stop");
      }
      parseVtt(e, t) {
        return t.vtt ? this.html.fetchText(t.vtt).then(i => {
          var _this$timelineEl;
          var r = i.split(`

`).filter(n => n.includes("thumbs.jpg#xywh=")).map((n, a) => {
            var l = n.match(/(\d+):(\d+):(\d+\.\d+)/),
              d = n.match(/thumbs\.jpg#xywh=(\d+),(\d+),(\d+),(\d+)/);
            if (l && d) {
              var m = parseInt(l[1]) * 3600 + parseInt(l[2]) * 60 + parseFloat(l[3]),
                _d$map = d.map(Number),
                _d$map2 = _slicedToArray(_d$map, 5),
                h = _d$map2[0],
                c = _d$map2[1],
                f = _d$map2[2],
                A = _d$map2[3],
                ns = _d$map2[4];
              return {
                time: m,
                x: c,
                y: f,
                width: A,
                height: ns,
                index: a
              };
            }
            return null;
          }).filter(Boolean);
          this.thumbnails = r, (_this$timelineEl = this.timelineEl) === null || _this$timelineEl === void 0 ? void 0 : _this$timelineEl.registerThumbnailPreview();
        }) : Promise.resolve(null);
      }
      setEvents(e, t) {
        e.onended = i => this.onended(t, i), e.ontimeupdate = i => this.ontimeupdate(t, i), e.onplay = i => this.onplay(t, i), e.onpause = i => this.onpause(t, i), e.onvolumechange = () => this.onvolumechange();
      }
      isControlsDivVisible() {
        return this.controlsEl.style.opacity === "1";
      }
      stopVideoPlay(e) {
        this.html.q(e).pause();
      }
      startVideoPlay(e) {
        var t = this.html.q(e);
        setTimeout(() => {
          this.hideVideoControls();
        }, 400), t.play();
      }
      setVideoPlayback(e) {
        this.freezeControls || (e === "start" ? e = 0 : e === "end" && (e = 1 / 0), this.updateVideoCurrentTime(e), this.updateTimeline(this.video));
      }
      moveVideoPlayback(e) {
        if (this.freezeControls) return;
        var t = this.video.currentTime + e;
        this.updateVideoCurrentTime(t), this.updateTimeline(this.video);
      }
      updateVideoCurrentTime(e) {
        if (this.timelineOrigin !== null && this.video.seekable.length > 0) {
          var _this$shaka$liveSeekE;
          e += this.timelineOrigin;
          var t = this.video.seekable.start(0),
            i = (_this$shaka$liveSeekE = this.shaka.liveSeekEnd()) !== null && _this$shaka$liveSeekE !== void 0 ? _this$shaka$liveSeekE : this.video.seekable.end(this.video.seekable.length - 1);
          e = Math.max(t, Math.min(e, i));
        } else {
          var _t2 = Number.isFinite(this.video.duration) ? this.video.duration : this.videoOptions.length || 0;
          e = Math.max(0, Math.min(e, _t2));
        }
        this.video.currentTime = e;
      }
      playClick() {
        this.video.paused ? this.startVideoPlay(this.video) : this.stopVideoPlay(this.video);
      }
      ffClick() {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
        this.throttledShowVideoControls(), this.moveVideoPlayback(e);
      }
      revClick() {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
        this.throttledShowVideoControls(), this.moveVideoPlayback(-e);
      }
      isLiveEpgPlayback(e) {
        return this.videoOptions.type === "epg" && !Number.isFinite(e.duration);
      }
      ensureTimelineOrigin(e) {
        return this.timelineOrigin === null && this.isLiveEpgPlayback(e) && e.seekable.length > 0 && (this.timelineOrigin = e.seekable.start(0)), this.timelineOrigin;
      }
      updateTimeline(e) {
        if (!this.timelineEl) return;
        var t = this.ensureTimelineOrigin(e);
        if (t !== null) {
          var _this$shaka$liveSeekE2;
          if (e.seekable.length === 0) return;
          var s = e.seekable.start(0),
            r = (_this$shaka$liveSeekE2 = this.shaka.liveSeekEnd()) !== null && _this$shaka$liveSeekE2 !== void 0 ? _this$shaka$liveSeekE2 : e.seekable.end(e.seekable.length - 1);
          this.timelineEl.setRange(s - t, e.currentTime - t, r - t);
          return;
        }
        var i = Number.isFinite(e.duration) ? e.duration : this.videoOptions.length || 0;
        this.timelineEl.setRange(0, e.currentTime, i);
      }
      loadEpisode(e, t) {
        var _this$video;
        return (_this$video = this.video) !== null && _this$video !== void 0 && _this$video.pause(), this.html.fetchText(e).then(i => {
          var s = this.html.extractHTML(i, t);
          this.stopVideoPlayers(!0), this.html.writeHTML(t, s);
        });
      }
      loadCatchUp(e, t) {
        return this.lastEpgUrl = e, this.html.fetchText(e).then(i => {
          if (e !== this.lastEpgUrl) throw new Error("This url: " + e + " is not last epg url: " + this.lastEpgUrl);
          this.stopVideoPlayers(!0);
          var s = this.html.extractHTML(i, t);
          this.html.writeHTML(t, s);
        });
      }
      getCurrentTime() {
        return this.timelineOrigin !== null ? this.video ? this.video.currentTime - this.timelineOrigin : -1 : this.video ? this.video.currentTime : -1;
      }
      getPlaybackOptions() {
        return this.videoOptions || {};
      }
      setControlsFrozen(e) {
        var _this$timelineEl2;
        this.freezeControls = e, (_this$timelineEl2 = this.timelineEl) !== null && _this$timelineEl2 !== void 0 && _this$timelineEl2.setDisabled(e), e ? this.html.addClass("body", "frozen_controls") : this.html.removeClass("body", "frozen_controls");
      }
      timeHHMMSS(e) {
        e = Math.max(0, Math.floor(e));
        var t = Math.floor(e / 3600),
          i = Math.floor(e % 3600 / 60),
          s = e % 60;
        return t > 0 ? t + ":" + this.pad2(i) + ":" + this.pad2(s) : this.pad2(i) + ":" + this.pad2(s);
      }
      pad2(e) {
        return ("0" + e).slice(-2);
      }
      startVideoControlsTimer() {
        clearTimeout(this.hideVideoControlsTimer), this.hideVideoControlsTimer = setTimeout(() => {
          this.hideVideoControls();
        }, 3e3);
      }
      showVideoControls() {
        !this.controlsEl || !this.video || (this.startVideoControlsTimer(), !this.isControlsDivVisible() && (this.html.show("#buttons", "block", this.controlsEl), this.html.removeClass("#buttons", "hidden", this.controlsEl), this.html.setStyle(this.controlsEl, "opacity", "1")));
      }
      hideVideoControls() {
        clearTimeout(this.hideVideoControlsTimer), this.controlsEl && this.html.setStyle(this.controlsEl, "opacity", "0");
      }
      loadUrl(e, t, i) {
        return this.user.linkDeviceToUser(i.drmProtected).then(() => this.gql.videoUrlV2(t)).then(s => {
          if (!s || !s.url) throw new Error("no_video_data");
          if (s.infoCode === 507 || s.infoCode === 503) throw new Error("no_access");
          return i.isErrorVideo = s.infoCode !== 0, console.log("Will play video", i, s), new Promise((r, n) => {
            e.onloadedmetadata = () => {
              var _this$timelineEl3;
              if ((_this$timelineEl3 = this.timelineEl) !== null && _this$timelineEl3 !== void 0 && _this$timelineEl3.setDurationDisplay(isFinite(e.duration)), this.html.setData(e, "options", JSON.stringify(i)), this.html.show(e), this.removeVideoSubtitles(e), this.addVideoSubtitles(e, i), this.muxStats.monitor(e, i), this.currentVideoId !== t) {
                n("canceled_play");
                return;
              }
              i !== null && i !== void 0 && i.muted && (e.muted = i.muted), _typeof(i === null || i === void 0 ? void 0 : i.volume) < "u" && (e.volume = i.volume), i.paused || e.play(), r(!0);
            }, e.onerror = () => {
              n(new Error("video_load_error"));
            }, this.shaka.initPlayer(e, s, i.startAt || void 0).catch(a => {
              n(new Error("video_load_error"));
            });
          });
        });
      }
      removeVideoSubtitles(e) {
        this.html.qAll("track", e).forEach(i => i.remove());
      }
      addVideoSubtitles(e, t) {
        var _t$subtitles$;
        if (!e || !(t !== null && t !== void 0 && t.subtitles) || !Array.isArray(t.subtitles)) return;
        var i = ((_t$subtitles$ = t.subtitles[0]) === null || _t$subtitles$ === void 0 ? void 0 : _t$subtitles$.id) || 0;
        t.subtitles.forEach(s => {
          var r = document.createElement("track");
          r.id = "subtitle_" + s.id, r.label = s.name, r.kind = "subtitles", r.srclang = s.name, r.src = s.url, e.appendChild(r), s.isDefault && (i = s.id);
        }), this.options.showSubtitles && i !== 0 && this.toggleVideoSubtitle("subtitle_" + i);
      }
      toggleVideoSubtitle(e) {
        var t = this.html.qAll("track", this.video),
          i = this.html.qAll(".button.subtitles"),
          s = !1;
        return t.forEach((r, n) => {
          r.id == e && r.track.mode !== "showing" ? (this.html.addClass(i[n], "active"), r.track.mode = "showing", s = !0) : (this.html.removeClass(i[n], "active"), r.track.mode = "hidden");
        }), s;
      }
      loadEpgUrl(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        return !t || !t.channel ? (console.log("No channel for epg playback"), Promise.resolve(!1)) : this.user.linkDeviceToUser(t.drmProtected).catch(i => {
          if (i.message === "too_many_devices") {
            window.location.href = this.options.routes.too_many_devices;
            return;
          }
        }).then(() => this.gql.epgHlsUrlV2(t.channel || "", (t === null || t === void 0 ? void 0 : t.chunkStart) || 0, (t === null || t === void 0 ? void 0 : t.chunkEnd) || 0)).then(i => {
          if (!i || !i.url) {
            console.log("No url for epg playback", i);
            return;
          }
          return t.breaks = i.breaks || [], console.log("Will play epg", t, i.url), new Promise((s, r) => {
            e.onloadedmetadata = () => {
              var _this$timelineEl4;
              this.timelineOrigin = null, (_this$timelineEl4 = this.timelineEl) !== null && _this$timelineEl4 !== void 0 && _this$timelineEl4.setDurationDisplay(isFinite(e.duration)), this.html.setData(e, "options", JSON.stringify(t)), this.html.show(e), this.muxStats.monitor(e, t), t !== null && t !== void 0 && t.muted && (e.muted = t === null || t === void 0 ? void 0 : t.muted), _typeof(t === null || t === void 0 ? void 0 : t.volume) < "u" && (e.volume = t.volume), t.paused ? e.pause() : e.play(), s(!0);
            }, e.onerror = () => {
              r(new Error("video_load_error"));
            }, this.shaka.initPlayer(e, i, t.startAt || void 0).catch(n => {
              r(new Error("video_load_error"));
            });
          });
        });
      }
      onended(e, t) {
        if (console.log("ON ENDED", t), e.isTrailer || e.isErrorVideo) return;
        this.hideVideoControls(), this.html.addClass(this.video, "hidden"), this.bookmarks.voyoBookmarkConsumeCurrent();
        var i = this.html.q("#play_similar"),
          s = this.btnEndCredits ? !this.html.hasClass(this.btnEndCredits, "hidden") : !1;
        i && !s && this.html.removeClass(i, "hidden");
      }
      ontimeupdate(e, t) {
        var i = t.target,
          s = Math.ceil(i.currentTime);
        this.lastTimeUpdateAt !== s && (this.lastTimeUpdateAt = s, this.saveStayedAtData(i, e), this.showEndCreditsButton(i, e), this.showEpisodeRecapButton(i, e), this.showStartCreditsButton(i, e), this.updateTimeline(i));
      }
      showEndCreditsButton(e, t) {
        if (t.isErrorVideo || !t.endCreditsAt || !t.nextEpisodeUrl || !this.btnEndCredits) return;
        var i = Math.floor(e.currentTime || 0);
        if (i < t.endCreditsAt || this.html.getData(this.video, "endcredits") === "stop") return;
        var r = 10 - (i - t.endCreditsAt);
        if (r < 0 && (r = 0), r === 0) {
          var _this$html$q0;
          this.html.setData(this.video, "endcredits", "stop"), (_this$html$q0 = this.html.q("#go_next")) === null || _this$html$q0 === void 0 ? void 0 : _this$html$q0.click();
          return;
        }
        this.html.writeHTML("#countdown", r.toString(), this.btnEndCredits), this.html.hasClass(this.btnEndCredits, "hidden") && this.html.removeClass(this.btnEndCredits, "hidden");
      }
      showEpisodeRecapButton(e, t) {
        if (t.isErrorVideo || !t.epiRecapTo || !this.btnEpisodeRecap) return;
        var i = Math.floor(e.currentTime || 0);
        if (i < (t.epiRecapAt || 0) + 2 || i >= t.epiRecapTo) {
          this.html.hasClass(this.btnEpisodeRecap, "hidden") || this.html.addClass(this.btnEpisodeRecap, "hidden");
          return;
        }
        this.html.getData(this.video, "episoderecap") === "stop" || this.isControlsDivVisible() || this.html.hasClass(this.btnEpisodeRecap, "hidden") && this.html.removeClass(this.btnEpisodeRecap, "hidden");
      }
      showStartCreditsButton(e, t) {
        if (t.isErrorVideo || !t.startCreditsAt || !t.startCreditsTo || !this.btnStartCredits) return;
        var i = Math.floor(e.currentTime || 0);
        if (i < t.startCreditsAt + 2 || i >= t.startCreditsTo) {
          this.html.hasClass(this.btnStartCredits, "hidden") || this.html.addClass(this.btnStartCredits, "hidden");
          return;
        }
        this.html.getData(this.video, "startcredits") === "stop" || this.isControlsDivVisible() || this.html.hasClass(this.btnStartCredits, "hidden") && this.html.removeClass(this.btnStartCredits, "hidden");
      }
      onplay(e, t) {
        this.html.removeClass("body", "paused"), this.html.addClass("body", "playing"), e.startedPlayingAt = new Date().getTime();
      }
      onpause(e, t) {
        this.html.removeClass("body", "playing"), this.html.addClass("body", "paused"), window.isPageUnloading || this.bookmarks.voyoBookmarkConsumeCurrent();
      }
      saveStayedAtData(e, t) {
        if (!t.allowSaveToStayedAt || !t.startedPlayingAt || !t.mediaId || !t.length) return;
        var i = Math.ceil(e.currentTime),
          s = Math.ceil(i / t.length * 100),
          r = new Date().getTime() - t.startedPlayingAt,
          n = Math.ceil(r / 1e3);
        if (s < 5 || n < 5) return;
        var a = new p({
          voyokey: t.voyokey,
          percent: s,
          duration: i,
          entityId: t.mediaId,
          nextEntityId: t.nextEpisodeId
        });
        this.bookmarks.voyoBookmarkSaveCurrent(a);
      }
      showThumbnailPreview(e, t) {
        if (!this.timelineEl || !this.timelinePreview || !this.thumbnails.length) return;
        var i = this.timelineEl.getProgressBarElement();
        if (!i) return;
        var s = this.getThumbnailForTime(e);
        if (!s) return;
        var r = 200,
          n = Math.max(r / 2, Math.min(i.clientWidth - r / 2, i.clientWidth * t)),
          a = String(s.time);
        if (this.timelinePreview.style.left = n + "px", this.timelinePreview.dataset.time !== a) {
          this.timelinePreview.innerHTML = "";
          var l = document.createElement("div");
          this.renderThumbnail(l, s, !0), this.timelinePreview.appendChild(l), this.timelinePreview.dataset.time = a;
        }
        this.html.removeClass(this.timelinePreview, "hidden");
      }
      hideThumbnailPreview() {
        this.timelinePreview && (this.timelinePreview.innerHTML = "", this.timelinePreview.dataset.time = "", this.html.addClass(this.timelinePreview, "hidden"));
      }
      getThumbnailForTime(e) {
        if (!this.thumbnails.length) return null;
        var t = this.thumbnails.findIndex(i => i.time >= e);
        return t === -1 ? null : this.thumbnails[t];
      }
      renderThumbnail(e, t, i) {
        if (e.dataset.time = t.time, e.dataset.time_badge = this.timeHHMMSS(t.time), t.timebased) e.innerHTML = this.timeHHMMSS(t.time), e.className = "thumbnail time_thumbnail";else {
          e.className = "thumbnail image_thumbnail";
          var s = this.html.q("img", e);
          s || (s = document.createElement("img"), s.src = this.videoOptions.vttImage || "", e.appendChild(s)), s.style.top = `-${t.y}px`, s.style.left = `-${t.x}px`;
          var r = this.html.q("div", e);
          r || (r = document.createElement("div"), this.html.addClass(r, "time"), r.innerHTML = this.timeHHMMSS(t.time), e.appendChild(r));
        }
        i ? e.classList.add("current") : e.classList.remove("current");
      }
      openFullscreen(e) {
        var t = (typeof e == "string" ? app.html.q(e) : e) || document.documentElement;
        t.requestFullscreen ? t.requestFullscreen() : t.webkitRequestFullscreen ? t.webkitRequestFullscreen() : t.msRequestFullscreen && t.msRequestFullscreen();
      }
      closeFullscreen() {
        document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
      }
      toggleFullscreen(e, t) {
        e.preventDefault(), !!document.fullscreenElement ? this.closeFullscreen() : this.openFullscreen(t);
      }
      onFullscreenChange() {
        var e = !!document.fullscreenElement;
        e ? app.html.addClass("body", "fullscreen") : app.html.removeClass("body", "fullscreen"), this.events.sendEvent("fullscreen", {
          isFullscreen: e
        });
      }
      onvolumechange() {
        var _this$video2;
        if (!this.video || !this.volumeSlider) return;
        var e = ((_this$video2 = this.video) === null || _this$video2 === void 0 ? void 0 : _this$video2.volume) || 0;
        this.volumeSlider.value = e.toFixed(2), this.volumeSlider.style.setProperty("--volume-percent", `${e * 100}%`), e > 0 ? (this.lastNonZeroVolume = e, this.html.show(".volume__icon"), this.html.hide(".volume__icon-muted")) : (this.html.hide(".volume__icon"), this.html.show(".volume__icon-muted"));
      }
      setVolume(e) {
        if (!this.video) return null;
        var t = Math.max(0, Math.min(1, e));
        return this.video.volume = t, this.video.muted = t === 0, t;
      }
      muteUnmuteVolume(e) {
        var _this$video3;
        e.preventDefault();
        var t = ((_this$video3 = this.video) === null || _this$video3 === void 0 ? void 0 : _this$video3.volume) === 0 ? this.lastNonZeroVolume || .75 : 0;
        return this.setVolume(t), t;
      }
      muteUnmuteTrailerVolume(e) {
        return e.preventDefault(), this.video ? (this.video.muted ? (this.video.muted = !1, this.video.volume < .1 && (this.video.volume = .75), this.html.removeClass("body", "trailer_muted")) : (this.video.muted = !0, this.html.addClass("body", "trailer_muted")), this.video.muted) : null;
      }
    },
    Vi = ce;
  var ue = class {
      constructor(e, t, i, s) {
        this.gql = e;
        this.html = t;
        this.localStorage = i;
        this.options = s;
        this.profiles = [];
      }
      init() {
        return this.voyoProfiles();
      }
      voyoProfiles() {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !0;
        if (e) {
          var _this$profiles;
          if ((_this$profiles = this.profiles) !== null && _this$profiles !== void 0 && _this$profiles.length) return Promise.resolve(this.profiles);
          var t = this.loadFromLocalStorage();
          if (t !== null && t !== void 0 && t.length) return this.profiles = t, Promise.resolve(t);
        }
        return this.gql.voyoProfiles().then(t => this.profilesToCache(t));
      }
      profilesToCache(e) {
        return this.profiles = e, this.saveToLocalStorage(), e;
      }
      redirectToProfileUrl(e) {
        var t = this.profiles.find(i => i.profileId === e);
        t && (document.location.href = t.url);
      }
      profileOfType(e) {
        return this.profiles.find(t => t.type === e);
      }
      rootCategoryToProfileType(e) {
        switch (e) {
          case 1091:
            return "5ka";
          case 5:
            return "kids";
          default:
            return "normal";
        }
      }
      profileTypeUrl(e) {
        switch (e) {
          case "5ka":
            return this.options.routes.profile_5ka;
          case "kids":
            return this.options.routes.profile_kids;
          default:
            return "";
        }
      }
      isInCorrectProfile(e, t) {
        if (!t) return !0;
        var i = this.profiles.find(s => s.profileId === e);
        return i ? t === i.type : !1;
      }
      saveToLocalStorage() {
        this.localStorage.set("voyoProfiles", this.profiles, 60);
      }
      loadFromLocalStorage() {
        var e = this.localStorage.get("voyoProfiles");
        return e ? e.map(t => new g(t)) : null;
      }
    },
    Ui = ue;
  var pe = class {
      constructor(e, t, i) {
        this.gql = e;
        this.localStorage = t;
        this.options = i;
        this.bookmarks = null;
      }
      loadBookmarks(e) {
        var _this2 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee64() {
          var t, _t3, _t4, _t5;
          return _regenerator().w(function (_context64) {
            while (1) switch (_context64.n) {
              case 0:
                t = _this2.loadFromLocalStorage();
                _t4 = t;
                if (_t4) {
                  _context64.n = 2;
                  break;
                }
                _context64.n = 1;
                return e;
              case 1:
                t = _context64.v;
                _t4 = t;
              case 2:
                _t3 = _t4;
                if (_t3) {
                  _context64.n = 4;
                  break;
                }
                _context64.n = 3;
                return _this2.fetch().catch(() => null);
              case 3:
                t = _context64.v;
                _t3 = t;
              case 4:
                if (!_t3) {
                  _context64.n = 5;
                  break;
                }
                _t5 = t;
                _context64.n = 6;
                break;
              case 5:
                _t5 = new y({
                  groups: [{
                    id: "GRP_DEFAULT",
                    items: []
                  }, {
                    id: "stayedAt",
                    items: []
                  }]
                });
              case 6:
                return _context64.a(2, _t5);
            }
          }, _callee64);
        }))();
      }
      set(e) {
        this.bookmarks = e, this.saveToLocalStorage();
      }
      get() {
        return this.bookmarks;
      }
      fetch() {
        return this.gql.voyoBookmarks();
      }
      clear() {
        this.bookmarks = null, this.saveToLocalStorage();
      }
      isBookmarked(e, t) {
        return this.bookmarks && this.bookmarks.groupItems(e).find(i => i.entityId.toString() === t.toString()) || !1;
      }
      voyoBookmarkRemove(e, t) {
        var _this$bookmarks;
        return (_this$bookmarks = this.bookmarks) !== null && _this$bookmarks !== void 0 && _this$bookmarks.remove(e, t.toString()), this.saveToLocalStorage(), this.gql.voyoBookmarkRemove(e, t.toString());
      }
      voyoBookmarkAdd(e, t) {
        var _this$bookmarks2;
        return (_this$bookmarks2 = this.bookmarks) !== null && _this$bookmarks2 !== void 0 && _this$bookmarks2.add(e, t), this.saveToLocalStorage(), this.gql.voyoBookmarkAdd(e, t);
      }
      voyoCategoryStartWith(e) {
        var t = this.get();
        if (!t) return Promise.resolve({
          startingEpisodeId: 0,
          percent: 0
        });
        var i = t.groupItems("stayedAt").find(s => s.voyokey === e);
        return i ? i.percent >= 90 && i.nextEntityId !== void 0 ? Promise.resolve({
          startingEpisodeId: +i.nextEntityId,
          percent: 0
        }) : Promise.resolve({
          startingEpisodeId: +i.entityId,
          percent: i.percent
        }) : Promise.resolve({
          startingEpisodeId: 0,
          percent: 0
        });
      }
      voyoBookmarkSaveCurrent(e) {
        this.saveCurrentToSessionStorage(e);
      }
      voyoBookmarkConsumeCurrent() {
        var e = this.consumeCurrentFromSessionStorage();
        return e ? this.voyoBookmarkAdd("stayedAt", e) : Promise.resolve(null);
      }
      saveToLocalStorage() {
        this.localStorage.set("voyoBookmarks", this.bookmarks, 60);
      }
      loadFromLocalStorage() {
        var e = this.localStorage.get("voyoBookmarks");
        return e ? new y(e) : null;
      }
      saveCurrentToSessionStorage(e) {
        sessionStorage.setItem("voyoBookmark", JSON.stringify(e));
      }
      consumeCurrentFromSessionStorage() {
        var e = sessionStorage.getItem("voyoBookmark");
        if (sessionStorage.removeItem("voyoBookmark"), !e) return null;
        try {
          return JSON.parse(e);
        } catch (_unused) {
          return console.log("Bad data in session storage", "voyoBookmark", e), null;
        }
      }
      get hasStayedAt() {
        return !!this.bookmarks && this.bookmarks.groupItems("stayedAt").length > 0;
      }
      get hasMyVoyo() {
        return !!this.bookmarks && this.bookmarks.groupItems("GRP_DEFAULT").length > 0;
      }
    },
    $i = pe;
  var ge = class {
      constructor(e) {
        this.options = e;
      }
      get(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var i = localStorage.getItem(e);
        if (!i) return t;
        var s;
        try {
          s = JSON.parse(i);
        } catch (_unused2) {
          return console.log("Bad data in local storage", e, i), t;
        }
        return s.expiresAt < 0 || s.expiresAt > Date.now() ? s.payload : (localStorage.removeItem(e), t);
      }
      set(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
        var s = i > 0 ? Date.now() + i * 60 * 1e3 : -1,
          r = {
            payload: t,
            expiresAt: s
          };
        localStorage.setItem(e, JSON.stringify(r));
      }
      remove(e) {
        localStorage.removeItem(e);
      }
    },
    Bi = ge;
  var ve = class {
      constructor(e, t, i, s) {
        this.html = e;
        this.user = t;
        this.cookies = i;
        this.options = s;
        this.websocket = null;
      }
      init() {
        var _this$user$user4, _this$user$user5;
        if (!this.options.websocketUrl || (typeof WebSocket === "undefined" ? "undefined" : _typeof(WebSocket)) > "u") return;
        var e = this.options.websocketUrl + "/go-sites/" + this.options.siteId + "/devices/" + this.user.deviceId;
        (_this$user$user4 = this.user.user) !== null && _this$user$user4 !== void 0 && _this$user$user4.id && (e += "?v=" + ((_this$user$user5 = this.user.user) === null || _this$user$user5 === void 0 ? void 0 : _this$user$user5.id)), this.websocket = new WebSocket(e), this.websocket.onmessage = t => {
          var i = this.parse(t.data);
          i && this.process(i);
        }, this.websocket.onclose = t => {
          t.wasClean ? console.log("[ws] Connection closed cleanly, code", t.code, "reason", t.reason) : console.log("[ws] Connection died", t);
        }, this.websocket.onerror = t => {
          console.log("[ws] error", t);
        };
      }
      parse(e) {
        try {
          return JSON.parse(e);
        } catch (_unused3) {
          return console.log("[ws] cannot parse payload:", e), null;
        }
      }
      process(e) {
        switch (e.type) {
          case "welcome":
            this.processWelcome(e);
            break;
          case "article":
            this.processArticle(e);
            break;
          case "front":
            this.processBreakingNews(e);
            break;
          default:
            console.log("[ws] uknown type", e.type);
        }
      }
      processWelcome(e) {
        console.log("[ws] Got welcome msg!", e.time);
      }
      processBreakingNews(e) {
        console.log("[ws] Got breaking news msg!", e.time);
        var t = e.payload.html,
          i = e.payload.deleted,
          s = e.payload.articleId,
          r = this.html.q("#breaking_news_placeholder");
        r && (i ? this.html.hide(r) : (this.html.writeHTML(r, t), this.showBreakingNewsIfNotClosed(s.toString())));
      }
      processArticle(e) {
        console.log("[ws] Got article msg!", e.time, e.payload);
        var t = e.payload.articleId,
          i = e.payload.deleted,
          s = e.payload.html,
          r = "#feed_" + e.payload.time;
        if (t !== this.options.articleId) return;
        if (i) {
          this.html.hide(r);
          return;
        }
        var n = this.html.q(r);
        n ? this.html.writeHTML(n, s) : this.html.prependHTML(".feed_list", s), this.html.execHtmlScript(r, !0), (s.includes("twitter.com") || s.includes(".x.com")) && setTimeout(() => {
          var _twttr;
          this.cookies.updateCookieClasses(), (_twttr = twttr) === null || _twttr === void 0 || (_twttr = _twttr.widgets) === null || _twttr === void 0 ? void 0 : _twttr.load();
        }, 200);
      }
      closeBreakingNews(e) {
        this.cookies.set("closeBreakingNews", e), this.html.hide(".breaking_news");
      }
      showBreakingNewsIfNotClosed(e) {
        var t = this.cookies.get("closeBreakingNews");
        if (!t || t !== e) {
          this.html.show(".breaking_news");
          return;
        }
      }
    },
    Gi = ve;
  var fe = class extends Gi {
      constructor(t, i, s, r) {
        super(t, i, s, r);
        this.html = t;
        this.user = i;
        this.cookies = s;
        this.options = r;
      }
      process(t) {
        t.type === "device" ? this.processDevice(t) : super.process(t);
      }
      processDevice(t) {
        switch (console.log("[ws] Got device msg!", t), t.payload.message) {
          case "connected":
            this.processConnected(t);
            break;
          case "logout":
            this.processLogout(t);
            break;
          case "subscription_updated":
            this.processSubscriptionUpdated(t);
            break;
        }
      }
      processSubscriptionUpdated(t) {
        console.log("[ws] Got update subs msg!", t), this.user.loadUserInfo().then(() => {
          console.log("User info refreshed");
        }).catch(i => {
          console.log("User info refresh error", i);
        });
      }
      processLogout(t) {
        this.user.logoutUser().then(() => {
          window.location.href = "/";
        });
      }
      processConnected(t) {
        console.log("[ws] Got connected msg!", t);
        var i = this.options.device.name,
          s = this.options.device.family;
        this.user.loginWithDevice(i, s).then(r => {
          r && setTimeout(() => {
            window.location.href = this.options.routes.profiles;
          }, 250);
        });
      }
    },
    Oi = fe;
  var ye = class {
      constructor(e, t) {
        this.html = e;
        this.options = t;
      }
      performSearch(e, t) {
        var i = window.location.href.split("?")[0];
        return this.html.fetchText(i + "?q=" + encodeURIComponent(e) + "&tag=" + encodeURIComponent(t)).then(s => {
          var r = new URL(window.location.href);
          e && r.searchParams.set("q", e), t && r.searchParams.set("tag", t), history.replaceState({}, "", r.toString());
          var n = this.html.extractHTML(s, "#searchResultsLibrary");
          this.html.writeHTML("#searchResultsLibrary", n), n = this.html.extractHTML(s, "#searchResultsTimeshift"), this.html.writeHTML("#searchResultsTimeshift", n), n = this.html.extractHTML(s, "#searchTypes");
          var a = this.html.extractData(n, "#searchTypesLibrary .results-count", "total");
          this.html.setData("#searchTypesLibrary .results-count", "total", a);
          var l = this.html.q("#searchTypesTimeshift .results-count");
          if (l) {
            var d = this.html.extractData(n, "#searchTypesTimeshift .results-count", "total");
            this.html.setData(l, "total", d);
          }
        }).catch(s => {
          throw console.error("Search failed:", s), s;
        });
      }
    },
    Fi = ye;
  var be = class {
      constructor(e, t) {
        this.user = e;
        this.options = t;
      }
      monitor(e, t) {
        var _this$user$user6, _this$options$playbac;
        if (t.isTrailer || !window.mux || !this.options.playbackStatsUrl) return;
        var i = {};
        switch (t.type) {
          case "live_stream":
            i = this.liveStreamPayload(e, t);
            break;
          case "epg":
            i = this.epgPayload(e, t);
            break;
          default:
            i = this.videoPayload(e, t);
            break;
        }
        var s = Object.assign(this.devicePayload(), i),
          r = ((_this$user$user6 = this.user.user) === null || _this$user$user6 === void 0 ? void 0 : _this$user$user6.id) === 19;
        console.log("mux data", s), window.mux.monitor("video", {
          debug: r,
          beaconCollectionDomain: (_this$options$playbac = this.options.playbackStatsUrl) === null || _this$options$playbac === void 0 ? void 0 : _this$options$playbac.replace("https://", ""),
          data: s,
          minimumRebufferDuration: 1e3,
          sustainedRebufferThreshold: 2500
        });
      }
      devicePayload() {
        var _this$user$user7, _this$user$user8;
        return {
          env_key: this.options.playbackStatsKey,
          viewer_user_id: (_this$user$user7 = this.user.user) === null || _this$user$user7 === void 0 ? void 0 : _this$user$user7.id,
          viewer_auth: ((_this$user$user8 = this.user.user) === null || _this$user$user8 === void 0 ? void 0 : _this$user$user8.token) || "",
          player_name: "TV",
          app_version: this.options.version,
          device_family: this.options.device.family,
          device_model: this.options.device.model
        };
      }
      liveStreamPayload(e, t) {
        return {
          video_id: t.mediaId,
          video_title: t.title,
          video_stream_type: "LIVE_STREAM",
          video_timeline: 0,
          video_mime: 0
        };
      }
      epgPayload(e, t) {
        return {
          video_id: 0,
          video_title: t.title,
          video_stream_type: "EPG",
          video_channel: t.channel || "",
          video_timeline: t.chunkStart || 0,
          video_mime: 0
        };
      }
      videoPayload(e, t) {
        return {
          video_id: t.mediaId,
          video_title: t.title,
          video_duration: t.length ? t.length * 1e3 : 0,
          video_stream_type: "VOD",
          video_channel: "",
          video_timeline: 0,
          video_mime: 0
        };
      }
    },
    Ri = be;
  var ke = class {
      constructor(e) {
        this.options = e;
        this.fpLicenseServerUrl = "";
        this.fpCertificateUrl = "";
        this.wvLicenseServerUrl = "";
        this.fairplayAssetId = "";
        this.fpCertificate = null;
        this.player = null;
        var t = this.options.fpLicenseServerUrl;
        if (this.fpLicenseServerUrl = t ? t + "/fps/rest/getLicense" : "", this.fpCertificateUrl = t ? t + "/fps-pub.der" : "", this.wvLicenseServerUrl = this.options.wvLicenseServerUrl || "", (typeof shaka === "undefined" ? "undefined" : _typeof(shaka)) > "u") {
          console.error("Shaka player not loaded");
          return;
        }
        shaka.polyfill.installAll(), shaka.Player.isBrowserSupported() || console.error("Shaka player is not supported by this browser");
      }
      liveSeekEnd() {
        if (!this.player) return null;
        var e = this.player.seekRange();
        return !e || !isFinite(e.end) || e.end <= e.start ? null : e.end;
      }
      initPlayer(e, t, i) {
        var _this3 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee65() {
          var _t6, _t7;
          return _regenerator().w(function (_context65) {
            while (1) switch (_context65.p = _context65.n) {
              case 0:
                _context65.n = 1;
                return _this3.destroy();
              case 1:
                _this3.player = new shaka.Player();
                _context65.n = 2;
                return _this3.player.attach(e);
              case 2:
                _this3.player.addEventListener("error", s => _this3.onError(s.detail));
                _t6 = _this3.isDrm(t);
                if (!_t6) {
                  _context65.n = 5;
                  break;
                }
                if (!v()) {
                  _context65.n = 4;
                  break;
                }
                _context65.n = 3;
                return _this3.configureFairplay(t);
              case 3:
                _context65.n = 5;
                break;
              case 4:
                _this3.configureWidevine(t);
              case 5:
                _context65.p = 5;
                _context65.n = 6;
                return _this3.player.load(t.url, i);
              case 6:
                _context65.n = 9;
                break;
              case 7:
                _context65.p = 7;
                _t7 = _context65.v;
                _context65.n = 8;
                return _this3.destroy();
              case 8:
                throw _t7;
              case 9:
                return _context65.a(2, _this3.player);
            }
          }, _callee65, null, [[5, 7]]);
        }))();
      }
      destroy() {
        var _this4 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee66() {
          var e;
          return _regenerator().w(function (_context66) {
            while (1) switch (_context66.n) {
              case 0:
                if (!_this4.player) {
                  _context66.n = 1;
                  break;
                }
                e = _this4.player;
                _this4.player = null;
                _context66.n = 1;
                return e.destroy();
              case 1:
                return _context66.a(2);
            }
          }, _callee66);
        }))();
      }
      isDrm(e) {
        return !!e.license;
      }
      isLicense(e) {
        return e === shaka.net.NetworkingEngine.RequestType.LICENSE;
      }
      configureWidevine(e) {
        this.player.configure({
          drm: {
            servers: {
              "com.widevine.alpha": this.wvLicenseServerUrl
            },
            advanced: {
              "com.widevine.alpha": {
                headers: {
                  "X-Drm-Message": e.url
                }
              }
            }
          }
        });
      }
      loadFpCertificate() {
        var _this5 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee67() {
          var e, _t8, _t9, _t0;
          return _regenerator().w(function (_context67) {
            while (1) switch (_context67.p = _context67.n) {
              case 0:
                if (!_this5.fpCertificate) {
                  _context67.n = 1;
                  break;
                }
                return _context67.a(2, _this5.fpCertificate);
              case 1:
                _context67.p = 1;
                _context67.n = 2;
                return fetch(_this5.fpCertificateUrl);
              case 2:
                e = _context67.v;
                if (e.ok) {
                  _context67.n = 3;
                  break;
                }
                throw new Error("HTTP " + e.status);
              case 3:
                _t8 = Uint8Array;
                _context67.n = 4;
                return e.arrayBuffer();
              case 4:
                _t9 = _context67.v;
                _this5.fpCertificate = new _t8(_t9);
                return _context67.a(2, _this5.fpCertificate);
              case 5:
                _context67.p = 5;
                _t0 = _context67.v;
                return _context67.a(2, (console.warn("FairPlay certificate load failed", _t0), null));
            }
          }, _callee67, null, [[1, 5]]);
        }))();
      }
      configureFairplay(e) {
        var _this6 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee68() {
          var t, i;
          return _regenerator().w(function (_context68) {
            while (1) switch (_context68.n) {
              case 0:
                _context68.n = 1;
                return _this6.loadFpCertificate();
              case 1:
                t = _context68.v;
                _this6.player.configure({
                  drm: {
                    servers: {
                      "com.apple.fps": _this6.fpLicenseServerUrl,
                      "com.apple.fps.1_0": _this6.fpLicenseServerUrl
                    },
                    advanced: {
                      "com.apple.fps": {
                        serverCertificate: t || void 0,
                        serverCertificateUri: _this6.fpCertificateUrl
                      },
                      "com.apple.fps.1_0": {
                        serverCertificate: t || void 0,
                        serverCertificateUri: _this6.fpCertificateUrl
                      }
                    },
                    initDataTransform: _this6.fairplayInitDataTransform.bind(_this6)
                  }
                });
                i = _this6.player.getNetworkingEngine();
                i.registerRequestFilter((s, r) => _this6.fairplayRequestFilter(s, r, e)), i.registerResponseFilter((s, r) => _this6.fairplayResponseFilter(s, r));
              case 2:
                return _context68.a(2);
            }
          }, _callee68);
        }))();
      }
      fairplayRequestFilter(e, t, i) {
        if (!this.isLicense(e)) return;
        var s = shaka.util.Uint8ArrayUtils.toStandardBase64(new Uint8Array(t.body)),
          r = encodeURIComponent(this.resolveFairplayAssetId(t));
        t.headers["Content-Type"] = "application/json", t.headers.Authorization = i.license, t.body = shaka.util.StringUtils.toUTF8(JSON.stringify({
          spc: s,
          assetId: r
        }));
      }
      fairplayResponseFilter(e, t) {
        if (!this.isLicense(e)) return;
        var i = shaka.util.StringUtils.fromUTF8(t.data).trim();
        if (i.slice(0, 5) === "<ckc>" && i.slice(-6) === "</ckc>") i = i.slice(5, -6);else if (i.startsWith("{")) try {
          var s = JSON.parse(i);
          i = s.ckc || s.Ckc || s.license || i;
        } catch (_unused4) {}
        t.data = shaka.util.Uint8ArrayUtils.fromBase64(i).buffer;
      }
      fairplayInitDataTransform(e, t, i) {
        if (t !== "skd") return e;
        try {
          this.fairplayAssetId = shaka.drm.FairPlay.defaultGetContentId(e) || this.fairplayAssetId;
        } catch (_unused5) {}
        if (!(window.shakaMediaKeysPolyfill === "apple")) return e;
        var r = i && i.serverCertificate;
        if (!r || !r.byteLength) throw new Error("FairPlay server certificate required before initDataTransform");
        return shaka.drm.FairPlay.initDataTransform(e, this.fairplayAssetId, r);
      }
      resolveFairplayAssetId(e) {
        try {
          if (e.initData && e.initData.byteLength) {
            var t = shaka.drm.FairPlay.defaultGetContentId(e.initData);
            if (t) return t;
          }
        } catch (_unused6) {}
        return this.fairplayAssetId;
      }
      onError(e) {
        e instanceof Error || e.severity === shaka.util.Error.Severity.CRITICAL && console.error(`Player error - ${e.category} - ${e.code}`);
      }
    },
    ji = ke;
  var we = class {
      constructor(e, t, i, s, r) {
        this.html = e;
        this.user = t;
        this.options = i;
        this.gql = s;
        this.localStorage = r;
        this.nextPopupAttemptAfter = 0;
        this.nextPopupAttemptAfter = this.getNextMailingPopupAttemptAfter();
      }
      getMailingSubscription() {
        return this.gql.mailingSubscriptions(this.options.siteId, "mail").then(e => {
          var _e$subscriptions;
          var t = (_e$subscriptions = e.subscriptions) === null || _e$subscriptions === void 0 ? void 0 : _e$subscriptions[0];
          return t || Promise.reject("Subscription not found");
        });
      }
      updateMailingSubscription(e, t) {
        return this.gql.settingsUpdateSubscription(this.options.siteId, e, t);
      }
      getNextMailingPopupAttemptAfter() {
        var e = this.localStorage.get("mailingNextPopupAttemptAfter") || 0;
        if (!e) {
          var t = this.localStorage.get("mailingLastPopupAttemptAt") || 0;
          t && (e = t + 14 * 86400 * 1e3, this.localStorage.remove("mailingLastPopupAttemptAt"), this.localStorage.set("mailingNextPopupAttemptAfter", e));
        }
        return e;
      }
      setNextMailingPopupAttemptAfter(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        t === null && (t = Date.now());
        var i = t + e * 1e3;
        this.localStorage.set("mailingNextPopupAttemptAfter", i);
      }
      canShowPopup() {
        return !(this.nextPopupAttemptAfter && Date.now() < this.nextPopupAttemptAfter);
      }
    },
    Qi = we;
  var Te = class {
      constructor(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        this.cookiesAccept = e, this.vendors = t;
      }
      isVendorAllowed(e) {
        return this.vendors.includes(e);
      }
      isImportantAllowed() {
        return this.cookiesAccept.includes("important");
      }
      isThirdAllowed() {
        return this.cookiesAccept.includes("third");
      }
    },
    C = Te;
  var Ee = class {
      constructor(e, t, i) {
        this.html = e;
        this.events = t;
        this.options = i;
      }
      init() {
        var e = this.get("cookies_accept") || "";
        e === "all" && (e = "local,important,third"), this.cookies = new C(e), this.events.sendEvent("cookies", this.cookies), this.updateCookieClasses();
      }
      set(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 31536e3;
        var s = new Date(),
          r = t,
          n = this.getDomain(),
          a = this.canUseSecure(n) ? "SameSite=None; Secure;" : "SameSite=Lax;";
        s.setTime(s.getTime() + i * 1e3), document.cookie = e + "=" + r + "; expires=" + s.toUTCString() + "; path=/; " + a + " domain=" + n;
      }
      canUseSecure(e) {
        var _this$options$site;
        return !((_this$options$site = this.options.site) !== null && _this$options$site !== void 0 && _this$options$site.includes("voyotvapp") || this.isLocalDev(e));
      }
      isLocalDev(e) {
        return e.startsWith("192.") || e.startsWith("172.") || e === "localhost";
      }
      getDomain() {
        var e = document.location.hostname;
        return this.isLocalDev(e) || e.split(".").length > 2 && (e = "." + e.split(".").slice(-2).join(".")), e;
      }
      setIfImportantAllowed(e, t) {
        var _this$cookies;
        ((_this$cookies = this.cookies) === null || _this$cookies === void 0 ? void 0 : _this$cookies.isImportantAllowed()) && this.set(e, t);
      }
      get(e) {
        var _s$pop;
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var s = ("; " + document.cookie).split("; " + e + "=");
        return s.length >= 2 && ((_s$pop = s.pop()) === null || _s$pop === void 0 ? void 0 : _s$pop.split(";").shift()) || t;
      }
      getFloat(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var i = this.get(e);
        return i ? parseFloat(i) : t;
      }
      delete(e) {
        var t = new Date();
        t.setTime(t.getTime() + -1440 * 60 * 1e3), document.cookie = e + "=; expires=" + t.toUTCString() + "; path=/";
        var i = document.location.hostname;
        document.cookie = e + "=; expires=" + t.toUTCString() + "; path=/; domain=" + i, i = this.getDomain(), document.cookie = e + "=; expires=" + t.toUTCString() + "; path=/; domain=" + i;
      }
      updateCookieClasses() {
        this.cookies.isThirdAllowed() ? (this.html.show(".if-cookies-third"), this.html.hide(".if-cookies-no-third")) : (this.html.hide(".if-cookies-third"), this.html.show(".if-cookies-no-third")), this.cookies.isImportantAllowed() ? (this.html.show(".if-cookies-important"), this.html.hide(".if-cookies-no-important")) : (this.html.hide(".if-cookies-important"), this.html.show(".if-cookies-no-important"));
      }
    },
    Ni = Ee;
  var Le = class extends Ni {
      init() {
        var _window$didomiOnReady, _window$didomiEventLi;
        (_window$didomiOnReady = window.didomiOnReady) !== null && _window$didomiOnReady !== void 0 && _window$didomiOnReady.push(e => {
          this.parseDidomiUserStatus(e.getUserStatus());
        }), (_window$didomiEventLi = window.didomiEventListeners) === null || _window$didomiEventLi === void 0 ? void 0 : _window$didomiEventLi.push({
          event: "consent.changed",
          listener: () => this.parseDidomiUserStatus(window.Didomi.getUserStatus())
        });
      }
      parseDidomiUserStatus(e) {
        var t = e.purposes.essential,
          i = e.purposes.consent.enabled,
          s = e.vendors.global.enabled.map(String),
          r = t.concat(i).filter(n => n === "local" || n === "cookies" || n === "third").map(n => n.replace("cookies", "important"));
        this.cookies = new C(r.join(","), s), this.events.sendEvent("cookies", this.cookies), this.updateCookieClasses();
      }
    },
    Wi = Le;
  var Se = class {
      constructor(e, t) {
        this.html = e;
        this.options = t;
      }
      renderGallery(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
        var i = new Splide("#gallery_" + e + "_thumbnails", {
            fixedWidth: 100,
            gap: 10,
            rewind: !0,
            pagination: !1,
            isNavigation: !0,
            arrows: !1,
            breakpoints: {
              800: {
                fixedWidth: 60
              }
            }
          }),
          s = new Splide("#gallery_" + e, {
            type: "fade",
            rewind: !0,
            pagination: !1,
            arrows: !0
          });
        s.sync(i), s.mount(), i.mount(), s.on("click", r => {
          this.showFullscreenGallery(e, r.index, t);
        }), s.on("active", r => {
          var n = this.html.getData(r.slide, "title");
          this.html.writeHTML("#gallery_" + e + "_caption", n), this.html.writeHTML("#gallery_" + e + "_index", r.index + 1);
        }), s.on("move", () => {
          var _window$dm;
          this.options.siteId === 30012 && ((_window$dm = window.dm) === null || _window$dm === void 0 ? void 0 : _window$dm.AjaxEvent("pageview"));
        });
      }
      renderFullscreenGallery(e, t) {
        var i = this.html.q("#fullscreen_gallery_" + e + "_thumbnails"),
          s = this.html.q("#fullscreen_gallery_" + e);
        if (!i || !s) return;
        this.html.openFullscreen();
        var r = new Splide(i, {
            fixedWidth: 100,
            gap: 10,
            rewind: !0,
            pagination: !1,
            isNavigation: !0,
            arrows: !1,
            breakpoints: {
              800: {
                fixedWidth: 60
              }
            },
            start: t
          }),
          n = new Splide(s, {
            type: "fade",
            rewind: !0,
            pagination: !1,
            arrows: !0,
            start: t
          });
        n.on("active", a => {
          var l = this.html.getData(a.slide, "title");
          this.html.writeHTML("#fullscreen_gallery_caption", l), this.html.writeHTML("#fullscreen_gallery_index", a.index + 1);
        }), n.sync(r), n.mount(), r.mount(), n.on("move", () => {
          var _window$dm2;
          this.options.siteId === 30012 && ((_window$dm2 = window.dm) === null || _window$dm2 === void 0 ? void 0 : _window$dm2.AjaxEvent("pageview"));
        });
      }
      showFullscreenArticleImage(e, t, i) {
        t ? window.open(t) : this.showFullscreenImage("/articles/" + this.options.articleId + "/images/" + e, i);
      }
      showFullscreenRecipeImage(e, t, i) {
        t ? window.open(t) : this.showFullscreenImage("/recipes/" + this.options.recipeId + "/images/" + e, i);
      }
      showFullscreenImage(e, t) {
        this.html.writeHTML("#fullscreen_content", ""), t !== null && t !== void 0 && t.stopPropagation(), this.html.fetchText(e).then(i => {
          i && (this.html.openFullscreen(), this.html.writeHTML("#fullscreen_content", i));
        });
      }
      showFullscreenGallery(e, t, i) {
        var s = i ? "/recipes/" + this.options.recipeId + "/gallery/index/" + t : "/articles/" + this.options.articleId + "/galleries/" + e + "/index/" + t;
        this.html.fetchText(s).then(r => this.html.writeHTML("#fullscreen_content", r)).then(() => this.renderFullscreenGallery(e, t));
      }
    },
    zi = Se;
  var Pe = class {
      constructor(e, t, i) {
        this.html = e;
        this.gql = t;
        this.cookies = i;
      }
      vote(e, t) {
        var i = this.html.q("#poll_" + e + " input:checked");
        i && this.gql.pollVote(e, +i.id, t).then(s => this.afterVote(e)).catch(s => this.onVoteError(s, e));
      }
      checkIfVoted(e) {
        (this.cookies.get("votedPolls") || "").split(",").includes(e.toString()) && this.afterVote(e);
      }
      showResults(e, t) {
        this.html.hide("#poll_" + e + " .poll-answers"), this.html.removeClass("#poll_" + e + " .poll-answers-btn-all", "active"), this.html.removeClass("#poll_" + e + " .poll-answers-btn-male", "active"), this.html.removeClass("#poll_" + e + " .poll-answers-btn-female", "active"), this.html.show("#poll_" + e + " .poll-answers-" + t), this.html.addClass("#poll_" + e + " .poll-answers-btn-" + t, "active");
      }
      afterVote(e) {
        var i = (this.cookies.get("votedPolls") || "").split(",");
        i.includes(e.toString()) || (i.push(e.toString()), this.cookies.setIfImportantAllowed("votedPolls", i.join(","))), this.html.hide("#poll_" + e + " .poll-questions"), this.html.show("#poll_" + e + " .poll-answers-container");
      }
      onVoteError(e, t) {
        var i = "#poll_" + t + " .poll-error",
          s = i + " .error-message";
        this.html.writeHTML(s, e.message), this.html.show(i, "flex"), setTimeout(() => {
          this.html.writeHTML(s, ""), this.html.hide(i);
        }, 4e3);
      }
    },
    Ji = Pe;
  var Me = class {
      constructor(e, t) {
        this.html = e;
        this.options = t;
        this.items = [];
        this.observer = new IntersectionObserver(this.callback.bind(this), {
          threshold: 0
        });
      }
      init(e) {
        var _this$observer;
        e && ((_this$observer = this.observer) !== null && _this$observer !== void 0 && _this$observer.disconnect(), this.observer = new IntersectionObserver(this.callback.bind(this), e));
        var t = this.html.qAll("[inview]");
        t.length && t.forEach(i => this.observe(i));
      }
      observe(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var i = this.html.q(e);
        if (!(!i || !this.observer)) {
          if (!t) {
            var _i$attributes$getName;
            var s = ((_i$attributes$getName = i.attributes.getNamedItem("inview")) === null || _i$attributes$getName === void 0 ? void 0 : _i$attributes$getName.value) || "?",
              r = s.includes("|") ? s.substring(s.indexOf("|") + 1) : "{}";
            t = {
              task: s.includes("|") ? s.substring(0, s.indexOf("|")) : s,
              params: JSON.parse(r)
            };
          }
          this.items.push({
            element: i,
            task: t.task,
            params: t.params,
            isVisible: null
          }), this.observer.observe(i);
        }
      }
      callback(e, t) {
        e.forEach(i => {
          var _s$params, _s$params2, _s$params3, _s$params4;
          var s = this.items.find(n => n.element === i.target);
          if (!s || !s.task) {
            this.stopObserving({
              element: i.target
            });
            return;
          }
          if (((_s$params = s.params) === null || _s$params === void 0 ? void 0 : _s$params.tracking) !== "both" && !i.isIntersecting || ((_s$params2 = s.params) === null || _s$params2 === void 0 ? void 0 : _s$params2.tracking) === "both" && s.isVisible === null && !i.isIntersecting) return;
          switch (s.isVisible = i.isIntersecting, s.task) {
            case "playVideo":
              var n = s.params.video || null,
                a = s.params.options || {},
                l = s.element.id || "video_" + n.Id;
              window.app.video.play("#" + l, n, a);
              break;
            case "instagram":
              window.app.gadgets.instagram();
              break;
            case "loadComments":
              window.app.comments.loadMore();
              break;
            case "mountSplide":
              s.params.splide.mount();
              break;
            case "randomPrArticles":
              var d = ((_s$params3 = s.params) === null || _s$params3 === void 0 ? void 0 : _s$params3.nb) || 6;
              window.app.banners.showRandomPrArticles(s.element, d);
              break;
            case "pip":
              i.isIntersecting ? (window.app.html.addClass(s.params.selector || "", s.params.ifVisible || ""), window.app.html.removeClass(s.params.selector || "", s.params.ifHidden || "")) : (window.app.html.addClass(s.params.selector || "", s.params.ifHidden || ""), window.app.html.removeClass(s.params.selector || "", s.params.ifVisible || ""));
              break;
            case "animalBodyParts":
              window.app.html.q(".onl-svinjina AREA").click(), window.app.html.q(".onl-govedina AREA").click();
              break;
            default:
              var c = window[s.task];
              typeof c == "function" ? c(s) : console.log("Observer: unknown task: ", s.task);
          }
          ((_s$params4 = s.params) === null || _s$params4 === void 0 ? void 0 : _s$params4.tracking) === "both" || this.stopObserving(s);
        });
      }
      isVisible(e) {
        var t = this.html.q(e);
        if (!t) return !1;
        var i = this.items.find(s => s.element === t);
        return i && i.isVisible || !1;
      }
      stopObserving(e) {
        this.observer.unobserve(e.element), this.items = this.items.filter(t => e);
      }
    },
    Ki = Me;
  var Ce = class {
      constructor(e, t, i, s) {
        this.cookies = e;
        this.html = t;
        this.observer = i;
        this.options = s;
        this.commentsActiveSlots = {
          "/23086084073/D_in_comments": null,
          "/23086084073/D_in_comments_1": null,
          "/23086084073/M_in_comments": null,
          "/23086084073/M_in_comments_1": null
        };
        this.commentsSlotPrefixMap = [{
          prefix: "div-gpt-ad-1750238051488-",
          slotName: "/23086084073/D_in_comments",
          dims: [[1, 1], [728, 90]],
          isMobile: !1
        }, {
          prefix: "div-gpt-ad-1750928140596-",
          slotName: "/23086084073/D_in_comments_1",
          dims: [[1, 1], [728, 90]],
          isMobile: !1
        }, {
          prefix: "div-gpt-ad-1750238123145-",
          slotName: "/23086084073/M_in_comments",
          dims: [[1, 1], [300, 250]],
          isMobile: !0
        }, {
          prefix: "div-gpt-ad-1750928212141-",
          slotName: "/23086084073/M_in_comments_1",
          dims: [[1, 1], [300, 250]],
          isMobile: !0
        }];
      }
      init() {}
      comments() {
        this.commentsObserver && this.commentsObserver.disconnect(), this.commentsObserver = new IntersectionObserver(t => {
          t.forEach(i => {
            if (!i.isIntersecting) return;
            var s = i.target.querySelector('[id^="div-gpt-ad-"]');
            if (!s) return;
            var r = s.id,
              n = this.commentsSlotPrefixMap.find(d => r.startsWith(d.prefix) && d.isMobile === this.options.isMobile);
            if (!n) return;
            var a = n.slotName,
              l = this.commentsActiveSlots[a];
            l && l.slotId === r || window.googletag.cmd.push(() => {
              l && l.slot && window.googletag.destroySlots([l.slot]);
              var d = window.googletag.pubads().getSlots().find(h => h.getSlotElementId() === r);
              if (d) {
                this.commentsActiveSlots[a] = {
                  slot: d,
                  slotId: r
                }, window.googletag.pubads().refresh([d]);
                return;
              }
              var m = window.googletag.defineSlot(a, n.dims, r).addService(window.googletag.pubads());
              this.commentsActiveSlots[a] = {
                slot: m,
                slotId: r
              }, window.pbjs.que.push(() => {
                window.pbjs.rp.requestBids({
                  callback: () => {
                    window.googletag.cmd.push(() => {
                      window.googletag.display(r), window.googletag.pubads().refresh([m]);
                    });
                  },
                  gptSlotObjects: [m]
                });
              });
            });
          });
        }, {
          root: null,
          threshold: .1,
          rootMargin: "300px 0px"
        }), this.html.qAll(".banner.comment-ad").forEach(t => this.commentsObserver.observe(t));
      }
      showRandomPrArticles(e, t) {
        var _this$html$q1;
        var i = ((_this$html$q1 = this.html.q(e)) === null || _this$html$q1 === void 0 ? void 0 : _this$html$q1.childNodes) || [],
          s = i.length,
          r = [];
        for (; r.length < t && r.length < s;) {
          var n = Math.floor(Math.random() * s);
          r.includes(n) || r.push(n);
        }
        i.forEach((n, a) => {
          r.includes(a) && this.html.removeClass(n, "hidden");
        });
      }
      getPreOrPostRoll(e) {
        var _this7 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee69() {
          var _this7$options$ads, _this7$options$ads2, _this7$options$ads3, _this7$options$ads4, _window, _s$purposes$select_pe;
          var t, i, s;
          return _regenerator().w(function (_context69) {
            while (1) switch (_context69.n) {
              case 0:
                t = "";
                e === "postroll" ? t = (_this7.options.isMobile ? (_this7$options$ads = _this7.options.ads) === null || _this7$options$ads === void 0 ? void 0 : _this7$options$ads.mobilePostrollUrl : (_this7$options$ads2 = _this7.options.ads) === null || _this7$options$ads2 === void 0 ? void 0 : _this7$options$ads2.postrollUrl) || "" : e === "preroll" && (t = (_this7.options.isMobile ? (_this7$options$ads3 = _this7.options.ads) === null || _this7$options$ads3 === void 0 ? void 0 : _this7$options$ads3.mobilePrerollUrl : (_this7$options$ads4 = _this7.options.ads) === null || _this7$options$ads4 === void 0 ? void 0 : _this7$options$ads4.prerollUrl) || "");
                i = !0, s = (_window = window) === null || _window === void 0 || (_window = _window.Didomi) === null || _window === void 0 ? void 0 : _window.getCurrentUserStatus();
                return _context69.a(2, (s && s.purposes && (i = !((_s$purposes$select_pe = s.purposes.select_personalized_ads) !== null && _s$purposes$select_pe !== void 0 && _s$purposes$select_pe.enabled)), t + (i ? "&npa=1" : "&npa=0")));
            }
          }, _callee69);
        }))();
      }
    },
    Zi = Ce;
  var Ie = class {
      constructor(e) {
        this.src = e.src || "", this.type = e.type || "application/x-mpegURL", this.keySystems = e.keySystems || {};
      }
    },
    I = Ie;
  var Ae = class {
      constructor(e, t, i, s, r, n) {
        this.html = e;
        this.gql = t;
        this.cookies = i;
        this.banners = s;
        this.reload = r;
        this.options = n;
        this.bgVideoTimer = null;
        this.imaOptions = {
          id: "",
          locale: "",
          debug: !1,
          autoPlayAdBreaks: !0,
          disableAdControls: !1,
          requestMode: "onPlay",
          showCountdown: !1,
          adsManagerLoadedCallback: e => {},
          disableCustomPlaybackForIOS10Plus: !0
        };
        this.imaOptions.debug = this.options.env == "dev";
      }
      play(e, t, i) {
        var _this8 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee70() {
          var s, _t1, _t10;
          return _regenerator().w(function (_context70) {
            while (1) switch (_context70.n) {
              case 0:
                if (!(!t || !t.Id)) {
                  _context70.n = 1;
                  break;
                }
                return _context70.a(2, Promise.reject(new Error("No video data")));
              case 1:
                i.showPoster === void 0 && (i.showPoster = !0);
                i.disableDblClick === void 0 && (i.disableDblClick = !1);
                _t1 = i.inBackground;
                if (_t1) {
                  _context70.n = 3;
                  break;
                }
                _context70.n = 2;
                return _this8.hasAdblocker();
              case 2:
                _t10 = _context70.v;
                if (!_t10) {
                  _context70.n = 3;
                  break;
                }
                t.Id = _this8.options.adblockerVideoId, t.Subtype = "trailer";
              case 3:
                i.clickedButton && (_this8.html.removeClass(".video__list-active", "video__list-active"), _this8.html.addClass(i.clickedButton, "video__list-active"));
                i.selector = e;
                s = (t.Mime & 16) === 16;
                return _context70.a(2, _this8.html.loadVideoElements(s).then(() => _this8.gql.videoUrlV2(parseInt(t.Id, 10))).then(r => !r || !r.url ? Promise.reject("No video url") : (_this8.initLanguage(), _this8.setVideoData(e, t), _this8.showVideoElement(e), _this8.options.siteId == 1 && _this8.setVideoData("#videoteca-video-info", t), i.setUrl && _this8.setVideoUrl(t), i.replaceUrl && _this8.replaceVideoUrl(t, i.customUrl), r !== null && r !== void 0 && r.infoCode && (t.Subtype = "trailer"), _this8.playUrl(e, r, t, i, s && r.license !== ""))).then(r => r));
            }
          }, _callee70);
        }))();
      }
      playBackground(e, t, i) {
        this.bgVideoTimer && clearTimeout(this.bgVideoTimer), this.bgVideoTimer = setTimeout(() => {
          var s = this.html.getData(e + " video", "video");
          typeof s == "string" && s.length > 0 && (s = JSON.parse(s)), s && (this.html.show(e), this.play(e, s, {
            inBackground: !0,
            autoplay: i.autoplay,
            mute: !0
          }));
        }, t);
      }
      videotecaLoadMore(e, t, i) {
        var s = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "/video";
        var r = this.html.getData(e, "pageNb"),
          n = parseInt(r, 10) + 1;
        this.html.setData(e, "pageNb", n), s += "?p=" + n, t && (s += "&s=" + t), this.html.fetchText(s).then(a => {
          (!a || a.length < 100) && this.html.hide(i), this.html.appendHTML(e, a);
        });
      }
      getPlayerInsideDiv(e) {
        var t = this.html.q(e + " video");
        if (!(!t || !window.videojs)) return videojs.getPlayer(t);
      }
      toggleMute(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var i = this.getPlayerInsideDiv(e);
        i && (t === null ? i.muted(!i.muted()) : i.muted(t), !i.muted() && i.volume() < .1 && i.volume(.5), i.muted() ? (this.html.hide(e + " .icon.sound"), this.html.show(e + " .icon.mute")) : (this.html.hide(e + " .icon.mute"), this.html.show(e + " .icon.sound")));
      }
      closePip() {
        this.html.removeClass(".pip", "pip");
      }
      destroyPlayers() {
        if (!window.videojs || !videojs.players) return;
        Object.keys(videojs.players).map(t => videojs.players[t]).filter(t => t).forEach(t => {
          this.destroyPlayer(t);
        });
      }
      destroyPlayer(e) {
        if (e.ima && e.ima.getAdsManager) try {
          var t = e.ima.getAdsManager();
          t && t.destroy();
        } catch (t) {
          console.warn("Error destroying ads manager:", t);
        }
        for (e.pause(); e.firstChild;) e.removeChild(e.firstChild);
        e.removeAttribute("src"), e.load(), e.dispose();
      }
      setVideoData(e, t) {
        var _t$Section;
        this.html.writeHTML(e + " #video_title", t.Title), this.html.writeHTML(e + " #video_section", (_t$Section = t.Section) === null || _t$Section === void 0 ? void 0 : _t$Section.Title);
      }
      showVideoElement(e) {
        this.html.hide(e + " .videoteca-thumb"), this.html.show(e + " video");
      }
      findButton(e, t) {
        return e.controlBar.children().find(s => {
          var _s$options;
          return ((_s$options = s.options()) === null || _s$options === void 0 ? void 0 : _s$options.type) === t;
        });
      }
      setSharingButton(e, t, i) {
        var _s, _s2;
        var s = this.findButton(e, "share-button");
        s && e.controlBar.removeChild(s), s = e.controlBar.addChild("button", {
          type: "share-button",
          className: "vjs-icon-share"
        }, 12), (_s = s) !== null && _s !== void 0 && _s.on("click", () => {
          this.toggleShareHtml(e, t.Id, i);
        }), (_s2 = s) !== null && _s2 !== void 0 && _s2.on("touchend", () => {
          this.toggleShareHtml(e, t.Id, i);
        }), e.on("userinactive", () => {
          this.hideShareHtml(i);
        });
      }
      hideShareHtml(e) {
        var _this$html$q10;
        (_this$html$q10 = this.html.q(e + " .video-shares")) === null || _this$html$q10 === void 0 || _this$html$q10.remove();
      }
      toggleShareHtml(e, t, i) {
        if (this.html.q(i + " .video-shares")) {
          this.hideShareHtml(i);
          return;
        }
        this.html.fetchText("/video/" + t + "/share-html").then(s => {
          this.html.appendHTML(i, s);
        });
      }
      setVideoUrl(e) {
        var t = document.location.pathname;
        t.includes(".html") && (t = t.slice(0, t.lastIndexOf("/"))), t += e.Url + document.location.search, t = t.replace("//", "/"), history.pushState(null, "video: " + e.Id, t);
      }
      replaceVideoUrl(e, t) {
        if (t) {
          history.replaceState(null, "cu: " + e.Id, t);
          return;
        }
        var i = document.location.pathname;
        i.includes(".html") && (i = i.slice(0, i.lastIndexOf("/"))), i += e.Url + document.location.search, i = i.replace("//", "/"), history.replaceState(null, "video: " + e.Id, i);
      }
      showBanners(e) {
        return this.options.showAds ? !(e.Subtype === "trailer" || !e.Postroll && !e.Preroll) : !1;
      }
      playUrl(e, t, i, s, r) {
        if (!t || !window.videojs) return Promise.reject();
        var n = this.html.q(e),
          a = videojs(e + " video", {
            language: this.options.country,
            restoreEl: !0,
            userActions: {
              click: !0
            }
          });
        s.inBackground || (s.showPoster && a.poster(i.Image.Src.replace("PLACEHOLDER", "1100x619")), a.titleBar.update({
          title: i.Title
        })), this.setSharingButton(a, i, e + " .video-js");
        var l = this.getPlayerVolume();
        s.mute && (l = 0, a.muted(!0)), s.loop && a.loop(!0), this.html.setData(e, "contentid", i.Id), a.hotkeysEnabled = !0, r && typeof a.eme == "function" && a.eme();
        var d = this.prepareVideoSource(t, r);
        return this.showBanners(i) ? (this.initIMA(a, s, l), this.initVideoBanners().then(m => {
          a.ima.initializeAdDisplayContainer(), a.ima.setContentWithAdsResponse(d, m);
        })) : a.src(d), new Promise((m, h) => {
          a.on("error", () => {
            h({
              err: a.error(),
              player: a
            });
          }), a.ready(() => {
            i.Vtt && this.setVttThumbnails(i.Vtt, a), this.html.setData(a.el(), "options", JSON.stringify(s)), this.initPlayerEvents(a, i, s), this.setPlayerVolume(a, l), a.on("keydown", c => {
              a.hotkeysEnabled && this.handleHotkey(a, c), c.stopPropagation(), c.preventDefault();
            }), s.focus && a.tech({
              IWillNotUseThisInPlugins: !0
            }).el().focus(), s.autoplay ? a.play().then(() => {
              m(a);
            }).catch(c => {
              h({
                err: c,
                player: a
              });
            }) : m(a);
          });
        });
      }
      registerBigPauseButton() {
        if (!window.videojs || videojs.getComponent("bigPauseButton")) return;
        var e = videojs.getComponent("Button"),
          t = class extends e {
            constructor(i) {
              var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
              super(i, s), this.addClass("vjs-big-pause-button"), this.controlText("Pause"), this.el().innerHTML = '<span class="vjs-icon-pause"></span>';
            }
            handleClick() {
              this.player().pause();
            }
          };
        videojs.registerComponent("bigPauseButton", t);
      }
      addBigPauseButton(e) {
        return this.registerBigPauseButton(), e.bigPauseButton || (e.bigPauseButton = e.addChild("bigPauseButton"), e.bigPauseButton.hide()), e.bigPauseButton;
      }
      handleHotkey(e, t) {
        switch (t.code) {
          case "Space":
            e.paused() ? e.play() : e.pause();
            break;
          case "ArrowRight":
            e.currentTime(e.currentTime() + 5);
            break;
          case "ArrowLeft":
            e.currentTime(e.currentTime() - 5);
            break;
          case "KeyM":
            e.muted(!e.muted());
        }
      }
      stopPlayerPlayback(e) {
        if (e.pause(), e.ima && e.ima.getAdsManager) {
          var t = e.ima.getAdsManager();
          t && t.pause();
        }
      }
      stopOtherPlaybacks(e) {
        if (!window.videojs || !videojs.players) return;
        Object.keys(videojs.players).map(i => videojs.players[i]).filter(i => i && i !== e).forEach(i => {
          this.stopPlayerPlayback(i);
        }), this.closePip();
      }
      initVideoBanners() {
        var _this9 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee71() {
          var e, t, i;
          return _regenerator().w(function (_context71) {
            while (1) switch (_context71.n) {
              case 0:
                _context71.n = 1;
                return _this9.banners.getPreOrPostRoll("preroll");
              case 1:
                e = _context71.v;
                _context71.n = 2;
                return _this9.banners.getPreOrPostRoll("postroll");
              case 2:
                t = _context71.v;
                i = '<?xml version="1.0" encoding="UTF-8"?><vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">';
                return _context71.a(2, (e && (i += '<vmap:AdBreak timeOffset="start" breakType="linear" breakId="preroll"><vmap:AdSource id="preroll-ad-1" allowMultipleAds="false" followRedirects="true"><vmap:AdTagURI templateType="vast3"><![CDATA[' + e + "]]></vmap:AdTagURI></vmap:AdSource></vmap:AdBreak>"), t && (i += '<vmap:AdBreak timeOffset="end" breakType="linear" breakId="postroll"><vmap:AdSource id="postroll-ad-1" allowMultipleAds="false" followRedirects="true"><vmap:AdTagURI templateType="vast3"><![CDATA[' + t + "]]></vmap:AdTagURI></vmap:AdSource></vmap:AdBreak>"), i += "</vmap:VMAP>", Promise.resolve(i)));
            }
          }, _callee71);
        }))();
      }
      initIMA(e, t, i) {
        if (typeof e.ima != "function") return;
        var s = this.imaOptions;
        s.id = e.id(), s.locale = this.options.country === "si" ? "sl" : this.options.country, s.adsManagerLoadedCallback = r => {
          this.setAdPlayerVolume(e, e.ima.getAdsManager(), i), e.ima.addEventListener("volumeChange", n => this.onPlayerVolumeChange(e, t, n)), e.ima.addEventListener(google.ima.AdEvent.Type.STARTED, () => {
            e.hotkeysEnabled = !1;
          }), e.ima.addEventListener(google.ima.AdEvent.Type.COMPLETE, () => {
            e.hotkeysEnabled = !0;
          });
        }, e.ima(s);
      }
      setVttThumbnails(e, t) {
        typeof t.vttThumbnails == "function" ? t.vttThumbnails({
          src: e
        }) : t.vttThumbnails && t.vttThumbnails.src(e);
      }
      initLanguage() {
        videojs.addLanguage("si", {
          "Play Video": "Predvajaj",
          Play: "Predvajaj",
          Pause: "Pavza",
          LIVE: "V \u017DIVO",
          Mute: "Tiho",
          Unmute: "Glasno",
          Fullscreen: "Celozaslonski na\u010Din",
          "Picture-in-Picture": "Slika v sliki",
          "Exit Picture-in-Picture": "Izhod slika v sliki",
          "Non-Fullscreen": "Izhod celozaslonski na\u010Din"
        }), videojs.addLanguage("hr", {
          "Play Video": "Gledaj",
          Play: "Gledaj",
          Pause: "Pauza",
          LIVE: "U\u017Eivo",
          Mute: "Ugasi zvuk",
          Unmute: "Upali zvuk",
          Fullscreen: "Cijeli zaslon",
          "Picture-in-Picture": "Slika u slici",
          "Exit Picture-in-Picture": "Izlaz iz prikaza slike u slici",
          "Non-Fullscreen": "Izlaz iz cijelog zaslona"
        });
      }
      initPlayerEvents(e, t, i) {
        var s = this.addBigPauseButton(e);
        e.bigPlayButton.on("touchend", r => {
          this.onPlayerTouchEnd(e, r);
        }), e.on("click", r => {
          this.onPlayerClick(e, r);
        }), e.on("dblclick", r => {
          this.onPlayerDblClick(e, i, r);
        }), e.on("start", r => {
          this.onPlayerStart(e, r);
        }), e.on("ended", r => {
          this.onPlayerEnded(e, i, r);
        }), e.on("timeupdate", r => {
          this.onPlayerTimeupdate(e, r);
        }), e.on("pause", r => {
          this.onPlayerPause(e, s, r);
        }), e.on("play", r => {
          this.onPlayerPlay(e, r);
        }), e.on("loadedmetadata", r => {
          this.onPlayerLoadMetadata(e, t, r);
        }), e.on("adstart", r => {
          this.onPlayerAdStart(e, r);
        }), e.on("adend", r => {
          this.onPlayerAdEnd(e, r);
        }), e.on("fullscreenchange", r => {
          this.onPlayerFullscreenChange(e, r);
        }), e.on("volumechange", r => {
          this.onPlayerVolumeChange(e, i, r);
        }), e.on("playing", r => {
          this.onPlayerPlaying(e, r);
        }), e.on("touchstart", r => {
          this.onPlayerTouchStart(e, r);
        }), e.on("useractive", r => {
          this.onPlayerUserActive(e, s, r);
        }), e.on("userinactive", r => {
          this.onPlayerUserInActive(e, s, r);
        });
      }
      prepareVideoSource(e, t) {
        return t ? v() ? this.prepareDrmSafariVideoSource(e) : this.prepareDrmVideoSource(e) : new I({
          src: e.url
        });
      }
      prepareDrmVideoSource(e) {
        var t = {
          "com.widevine.alpha": {
            url: this.options.wvLicenseServerUrl,
            licenseHeaders: {
              "X-DRM-Message": e.url
            }
          }
        };
        return new I({
          src: e.url,
          type: "application/dash+xml",
          keySystems: t
        });
      }
      prepareDrmSafariVideoSource(e) {
        var t = {
          "com.apple.fps": {
            certificateUri: this.options.fpLicenseServerUrl + "/fps-pub.der",
            getContentId: (i, s) => {
              try {
                return typeof s != "string" ? "" : s.split("skd://")[1] || "";
              } catch (_unused7) {
                return "";
              }
            },
            getLicense: (i, s, r, n) => {
              var a = {
                spc: yi(r),
                assetId: encodeURIComponent(s)
              };
              videojs.xhr({
                uri: this.options.fpLicenseServerUrl + "/fps/rest/getLicense",
                method: "POST",
                responseType: "text",
                body: JSON.stringify(a),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: e.license
                }
              }, (l, d, m) => {
                if (l) {
                  n(l);
                  return;
                }
                var h = m.trim();
                h.slice(0, 5) === "<ckc>" && h.slice(-6) === "</ckc>" && (h = h.slice(5, -6)), n(null, Uint8Array.from(atob(h), c => c.charCodeAt(0)));
              });
            }
          }
        };
        return new I({
          src: e.url,
          keySystems: t
        });
      }
      onPlayerPlaying(e, t) {
        e.el().classList.add("is-playing");
      }
      onPlayerDblClick(e, t, i) {
        t.disableDblClick || (e.isFullscreen() ? e.exitFullscreen() : e.requestFullscreen());
      }
      onPlayerFullscreenChange(e, t) {
        var _e$nativeElement;
        (_e$nativeElement = e.nativeElement) === null || _e$nativeElement === void 0 || (_e$nativeElement = _e$nativeElement.firstChild) === null || _e$nativeElement === void 0 || _e$nativeElement.focus();
      }
      onPlayerVolumeChange(e, t, i) {
        var s = e.muted() ? 0 : e.volume();
        t.inBackground || this.cookies.setIfImportantAllowed("playerVol", s);
      }
      onPlayerStart(e, t) {
        e.controlBar.el().style.visibility = "visible";
      }
      onPlayerAdEnd(e, t) {}
      onPlayerAdStart(e, t) {}
      onPlayerTouchEnd(e, t) {}
      onPlayerClick(e, t) {}
      onPlayerPlay(e, t) {
        var _this$reload;
        (_this$reload = this.reload) !== null && _this$reload !== void 0 && _this$reload.stop(), this.stopOtherPlaybacks(e);
      }
      onPlayerLoadMetadata(e, t, i) {
        if (e) {
          var s = e.seekable();
          if (s && s.length > 0 && t.ObjectType === "stream") {
            var r = s.end(0) - s.start(0);
            r > 300 && (e.options_.liveui = !0, e.controlBar.addClass("vjs-liveui"), e.currentTime(e.seekable().end(0)));
          }
        }
      }
      onPlayerPause(e, t, i) {
        t === null || t === void 0 || t.hide();
      }
      onPlayerTimeupdate(e, t) {}
      onPlayerEnded(e, t, i) {
        t.inBackground && t.selector && this.html.hide(t.selector);
      }
      onPlayerTouchStart(e, t) {
        var _e$ads, _e$ads$isInAdMode;
        if (!e || !e.hasStarted() || (_e$ads = e.ads) !== null && _e$ads !== void 0 && (_e$ads$isInAdMode = _e$ads.isInAdMode) !== null && _e$ads$isInAdMode !== void 0 && _e$ads$isInAdMode.call(_e$ads) || !e.userActive()) return;
        var i = t.target;
        i instanceof HTMLElement && (i.closest(".vjs-control-bar") || (e.paused() ? e.play() : e.pause()));
      }
      onPlayerUserActive(e, t, i) {
        e.hasStarted() && !e.paused() && (t === null || t === void 0 ? void 0 : t.show());
      }
      onPlayerUserInActive(e, t, i) {
        t === null || t === void 0 || t.hide();
      }
      getPlayerVolume() {
        var e = this.cookies.getFloat("playerVol", .5);
        return e === null ? .5 : e;
      }
      setPlayerVolume(e, t) {
        e.volume(t);
        var i = "#" + e.id() + " .vjs-volume-level";
        this.html.setStyle(i, "width", t * 100 + "%");
      }
      setAdPlayerVolume(e, t, i) {
        if (!t) return;
        t.setVolume(i);
        var s = "#" + e.id() + " .ima-slider-level-div";
        this.html.setStyle(s, "width", i * 100 + "%");
      }
      hasAdblocker() {
        return new Promise((e, t) => {
          var i = this.html.q("#adblock");
          i || e(!1), i.onload = s => {
            e(!1);
          }, i.onerror = s => {
            e(!0);
          }, i.data = "https://ads.api.24ur.si/adserver/adblock.xseki.dej.nehi";
        });
      }
    },
    Xi = Ae;
  var qe = class {
      constructor(e, t, i) {
        this.options = e;
        this.html = t;
        this.rateLimiter = i;
        this.debounceTime = 100;
        this.debouncedOnInput = this.rateLimiter.debounce(s => {
          var r = s.target.form;
          if (!r) return;
          var n = this.validateRequiredFields(r),
            a = this.html.q("button:not([type]), submit-button", r);
          a && (a.disabled = !n), this.resetErrors(r);
        }, this.debounceTime);
      }
      oninput(e) {
        this.debouncedOnInput(e);
      }
      submit(e, t, i) {
        var _this0 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee72() {
          var _this0$html$q;
          var s;
          return _regenerator().w(function (_context72) {
            while (1) switch (_context72.n) {
              case 0:
                _this0.resetErrors(e), _this0.html.addClass(e, "loading"), (_this0$html$q = _this0.html.q("submit-button", e)) === null || _this0$html$q === void 0 ? void 0 : _this0$html$q.setAttribute("loading", "");
                s = _this0.extractFormData(e);
                return _context72.a(2, t(s).then(() => {
                  var _this0$html$q2;
                  var r = _this0.html.getData(e, "successMsg");
                  r && _this0.showFormCallout(e, r, "success"), _this0.html.removeClass(e, "loading"), (_this0$html$q2 = _this0.html.q("submit-button", e)) === null || _this0$html$q2 === void 0 ? void 0 : _this0$html$q2.removeAttribute("loading");
                }).catch(r => {
                  var _this0$html$q3;
                  i ? i(r) : _this0.defaultErrorHandler(e, r), _this0.html.removeClass(e, "loading"), (_this0$html$q3 = _this0.html.q("submit-button", e)) === null || _this0$html$q3 === void 0 ? void 0 : _this0$html$q3.removeAttribute("loading");
                }));
            }
          }, _callee72);
        }))();
      }
      submitWithUpdate(e, t, i) {
        var _this1 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee73() {
          return _regenerator().w(function (_context73) {
            while (1) switch (_context73.n) {
              case 0:
                return _context73.a(2, _this1.submit(e, t, i).then(() => {
                  _this1.updateDefaultValues(e);
                }));
            }
          }, _callee73);
        }))();
      }
      onreset(e) {
        var t = e.target;
        t && this.resetErrors(t);
      }
      reset(e) {
        e.reset(), this.resetErrors(e);
      }
      updateDefaultValues(e) {
        this.html.qAll("input", e).forEach(i => {
          var s = i;
          s.type === "password" || s.type === "hidden" || (s.type === "checkbox" ? s.defaultChecked = s.checked : s.defaultValue = s.value);
        });
      }
      extractFormData(e) {
        var t = new FormData(e),
          i = {};
        return t.forEach((s, r) => {
          var _e$elements$namedItem;
          ((_e$elements$namedItem = e.elements.namedItem(r)) === null || _e$elements$namedItem === void 0 ? void 0 : _e$elements$namedItem.type) === "checkbox" ? i[r] = s.toString() : i[r] = s.toString().trim();
        }), i;
      }
      defaultErrorHandler(e, t) {
        var i = (t === null || t === void 0 ? void 0 : t.code) || "",
          s = (t === null || t === void 0 ? void 0 : t.message) || 'Prišlo je do napake',
          r = !1;
        i && (r = this.showFieldErrorByCode(e, i, s)), r || ((s.includes("Fetch request timed out") || s.includes("HTTP error!")) && (s = 'Napaka pri dostopu do strežnika'), this.showFormCallout(e, s, "error"));
      }
      resetErrors(e) {
        this.html.hide(".login-error", e), this.html.writeHTML(".login-error", "", e), this.html.hide(".callout", e), this.html.writeHTML(".callout span", "", e), this.html.removeClass(".callout", "callout--success callout--error callout--warning", e);
      }
      showFieldErrorByCode(e, t, i) {
        var s = this.html.qAll(`.login-error[data-errors*="${t}"]`, e);
        return s.forEach(r => {
          this.showFieldError(r, i);
        }), s.length > 0;
      }
      showFieldError(e, t) {
        this.html.writeHTML(e, t), this.html.show(e);
      }
      showFormCallout(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "error";
        var s = this.html.q(".callout", e);
        s && this.showCallout(s, t, i);
      }
      showCallout(e, t) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "error";
        this.html.addClass(e, `callout--${i}`), e instanceof HTMLElement ? this.html.writeHTML("span", t, e) : this.html.writeHTML(`${e} span`, t), this.html.show(e, "flex");
      }
      clearCallout(e) {
        this.html.hide(e), this.html.writeHTML(`${e} span`, ""), this.html.removeClass(e, "callout--success callout--error callout--warning");
      }
      toggleShowPassword(e) {
        var t = this.html.q(e);
        if (!t) return;
        var i = t.getAttribute("type") === "password" ? "text" : "password";
        t.setAttribute("type", i);
      }
      validateRequiredFields(e) {
        var t = this.html.qAll("input[data-required]", e),
          i = !0;
        return t.forEach(s => {
          var r = this.html.getData(s, "required"),
            n = this.validateRequiredField(s, r);
          i = i && n;
        }), i;
      }
      validateRequiredField(e, t) {
        if (e.type === "checkbox") return e.checked;
        if (e.type === "radio") {
          var s = e.name;
          return this.html.q(`input[type="radio"][name="${s}"]:checked`, e.form) !== null;
        }
        if (t === "") return e.value.trim() !== "";
        var i;
        try {
          i = JSON.parse(t);
        } catch (s) {
          return console.error("Invalid JSON in data-required attribute for field", e.name, s), !1;
        }
        return i.length ? e.value.trim().length === i.length : i.notDefault ? e.value.trim() !== e.defaultValue.trim() : !1;
      }
    },
    Yi = qe;
  var De = class {
      constructor(e, t, i) {
        var _i$routes;
        this.html = e;
        this.video = t;
        this.p = 0;
        this.isEnd = !1;
        this.isFetching = !1;
        this.route = ((_i$routes = i.routes) === null || _i$routes === void 0 ? void 0 : _i$routes.vertical_videos) || "/kratek-video";
      }
      playSlide(e) {
        var t = this.html.q("[data-video]", e);
        if (!t) return;
        var i = JSON.parse(this.html.getData(t, "video")),
          s = `#video-vertical-player-${i.Id}`,
          r = {
            mute: !1,
            autoplay: !0,
            focus: !1,
            loop: !0,
            replaceUrl: !0,
            showPoster: !1
          };
        this.video.destroyPlayers(), this.video.play(s, i, r).catch(n => (console.log("Vertical videos", n === null || n === void 0 ? void 0 : n.err), r.mute = !0, this.video.play(s, i, r))).catch(n => {
          this.showPlayerPoster(n === null || n === void 0 ? void 0 : n.player, i);
        });
      }
      showPlayerPoster(e, t) {
        if (!e || !e.poster || !t || !t.Image) return;
        e.poster(t.Image.Src.replace("PLACEHOLDER", "1100xX"));
        var i = this.html.q(".video-js");
        i && i.style.setProperty("opacity", "1", "important"), e.load();
      }
      handleArrows(e, t) {
        e > 0 ? this.html.removeClass(".scroll-up-arrow", "button-disabled") : this.html.addClass(".scroll-up-arrow", "button-disabled"), e < t - 1 ? this.html.removeClass(".scroll-down-arrow", "button-disabled") : this.html.addClass(".scroll-down-arrow", "button-disabled");
      }
      loadMoreSlides(e) {
        if (this.isEnd || this.isFetching) return Promise.resolve(null);
        this.p += 1, this.isFetching = !0;
        var t = this.route + "/?p=" + this.p + "&excludeIds=" + e.join(",");
        return this.html.fetchText(t).then(i => {
          var n = new DOMParser().parseFromString(i, "text/html").querySelectorAll(".splide__slide");
          return n.length < 10 && (this.isEnd = !0), this.isFetching = !1, Array.from(n);
        }).catch(i => (console.log("Error loading data from server", i), this.isFetching = !1, null));
      }
    },
    es = De;
  var He = class {
      constructor(e) {
        this.html = e;
        this.timer = 0;
      }
      handleMouseEnter(e) {
        var t = this.html.q("video", e);
        t && (this.timer = window.setTimeout(() => {
          var i = JSON.parse(this.html.getData(e, "video"));
          i && i.TeaserFileUrl && (t.src = i.TeaserFileUrl, this.playVideo(t));
        }, 500));
      }
      handleMouseLeave(e) {
        window.clearTimeout(this.timer);
        var t = this.html.q("video", e);
        t && (t.pause(), t.removeAttribute("src"), t.load(), t.classList.remove("!opacity-100"));
      }
      playVideo(e) {
        e.play().catch(t => {}), this.html.addClass(e, "!opacity-100");
      }
    },
    ts = He;
  var xe = class {
      constructor(e, t) {
        this.html = e;
        this.options = t;
      }
      restrictAppPlayback() {
        return this.options.device.os === "android" || this.options.device.os === "ios" ? (window.location.replace(this.options.routes.play_mobile_restriction), !0) : !1;
      }
    },
    is = xe;
  var _e = class {
      throttle(e, t) {
        var i = Date.now();
        return function () {
          i + t - Date.now() < 0 && (e(...arguments), i = Date.now());
        };
      }
      debounce(e, t) {
        var i;
        return function () {
          for (var _len = arguments.length, s = new Array(_len), _key = 0; _key < _len; _key++) {
            s[_key] = arguments[_key];
          }
          clearTimeout(i), i = setTimeout(() => e.apply(this, s), t);
        };
      }
    },
    ss = _e;
  var Ve = class {
      constructor(e, t) {
        this.html = e;
        this.rateLimiter = t;
      }
      init() {
        var e = 0,
          t = this.rateLimiter.throttle(() => {
            var i = window.pageYOffset || document.documentElement.scrollTop;
            e && (i > 80 ? this.setBodyClass(i - e) : this.setBodyClass(-1)), this.setArrowUpClass(i), e = i;
          }, 100);
        document.addEventListener("scroll", t);
      }
      setBodyClass(e) {
        e > 0 ? this.html.hasClass("body", "scroll-down") || (this.html.removeClass("body", "scroll-up"), this.html.addClass("body", "scroll-down")) : this.html.hasClass("body", "scroll-up") || (this.html.removeClass("body", "scroll-down"), this.html.addClass("body", "scroll-up"));
      }
      setArrowUpClass(e) {
        if (e > 100) {
          var t = this.html.q(".arrow-up");
          t && !this.html.hasClass(t, "arrow-up--active") && this.html.addClass(t, "arrow-up--active");
        } else {
          var _t11 = this.html.q(".arrow-up--active");
          _t11 && this.html.removeClass(_t11, "arrow-up--active");
        }
      }
    },
    rs = Ve;
  var Ue = class {
      constructor(e) {
        this.options = e;
        this.html = new Ai(), this.rateLimiter = new ss(), this.scroll = new rs(this.html, this.rateLimiter), this.playRestriction = new is(this.html, this.options), this.shaka = new ji(this.options), this.events = new Ii(this.html), this.localStorage = new Bi(this.options), this.gql = new Ci(this.options), this.cookies = new Wi(this.html, this.events, this.options), this.profiles = new Ui(this.gql, this.html, this.localStorage, this.options), this.bookmarks = new $i(this.gql, this.localStorage, this.options), this.user = new xi(this.events, this.cookies, this.gql, this.html, this.profiles, this.localStorage, this.options), this.muxStatistics = new Ri(this.user, this.options), this.voyoVideo = new Vi(this.html, this.user, this.bookmarks, this.gql, this.events, this.muxStatistics, this.shaka, this.rateLimiter, this.options), this.voyo = new _i(this.html, this.events, this.user, this.voyoVideo, this.gql, this.profiles, this.bookmarks, this.localStorage, this.options), this.onlWebsocket = new Oi(this.html, this.user, this.cookies, this.options), this.search = new Fi(this.html, this.options), this.gadgets = new qi(this.html, this.events, this.cookies, this.options), this.mailing = new Qi(this.html, this.user, this.options, this.gql, this.localStorage), this.voyoForms = new Yi(this.options, this.html, this.rateLimiter), this.observer = new Ki(this.html, this.options), this.banners = new Zi(this.cookies, this.html, this.observer, this.options), this.video = new Xi(this.html, this.gql, this.cookies, this.banners, null, this.options), this.image = new zi(this.html, this.options), this.poll = new Ji(this.html, this.gql, this.cookies), this.verticalVideo = new es(this.html, this.video, this.options), this.verticalVideoPreview = new ts(this.html), document.addEventListener("started", () => this.onAppStarted()), document.addEventListener("started-user", () => this.onStartedUser()), document.addEventListener("started-guest", () => this.onStartedGuest()), document.addEventListener("started-bookmarks", () => this.onStartedBookmarks());
      }
      run() {
        var _this10 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee74() {
          var _window$Sentry3, _window$Sentry4;
          return _regenerator().w(function (_context74) {
            while (1) switch (_context74.n) {
              case 0:
                console.debug("Starting app ..."), at(), _this10.user.handleDeviceId(), _this10.options.device = _this10.discoverDevice(), _this10.options = _this10.loadUserOptions(_this10.options), _this10.options.isMobile = _this10.getIsMobile(), _this10.setBodyCssClasses(), _this10.cookies.init(), _this10.observer.init(), _this10.options.isMobile && _this10.scroll.init(), (_window$Sentry3 = window.Sentry) !== null && _window$Sentry3 !== void 0 && _window$Sentry3.setContext("options", _this10.options), (_window$Sentry4 = window.Sentry) !== null && _window$Sentry4 !== void 0 && _window$Sentry4.setTag("deviceId", _this10.user.deviceId), console.debug("Options", _this10.options), _this10.events.sendEvent("started", _this10.options);
              case 1:
                return _context74.a(2);
            }
          }, _callee74);
        }))();
      }
      onAppStarted() {
        console.debug("App is running ...");
        var e = new URL(window.location.href);
        e.searchParams.get("loginWithCodeSuccess") === "1" && (window.dataLayer = window.dataLayer || [], window.dataLayer.push({
          event: "login"
        }), e.searchParams.delete("loginWithCodeSuccess"), window.history.replaceState({}, "", e.pathname + e.search + e.hash)), this.mustLoadUserData() && this.loadUserData().then(() => this.initProfiles()).catch(() => this.user.user).then(t => {
          t ? this.events.sendEvent("started-user", this.user.user) : this.events.sendEvent("started-guest", null);
        }), this.registerServiceWorker(), window.didomiOnReady = window.didomiOnReady || [], window.didomiOnReady.push(t => {
          this.gadgets.initChat(t), this.gadgets.initExponea(t);
        });
      }
      onStartedUser() {
        console.debug("User is loaded ..."), app.html.removeClass(".if-user-loggedin", "hidden"), app.html.addClass(".if-user-loggedout", "hidden"), this.initBookmarks(), this.onlWebsocket.init(), setTimeout(() => {
          this.gadgets.exponeaIdentifyUser(this.user.user);
        }, 1e3);
      }
      onStartedGuest() {
        app.html.addClass(".if-user-loggedin", "hidden"), app.html.removeClass(".if-user-loggedout", "hidden"), this.onlWebsocket.init();
      }
      onStartedBookmarks() {
        console.debug("Bookmarks are loaded ..."), this.bookmarks.voyoBookmarkConsumeCurrent();
      }
      setBodyCssClasses() {
        var e = this.getDeviceCssClass() + " trailer_muted";
        this.html.addClass("body", e);
      }
      mustLoadUserData() {
        if (window.skipUserLoad) return !1;
        var e = [this.options.routes.login, this.options.routes.registration, this.options.routes.profiles],
          t = document.location.pathname;
        return !e.find(s => t.startsWith(s));
      }
      reloadUserInfo() {
        return this.loadUserData();
      }
      loadUserData() {
        return this.user.loadUserInfo().catch(e => (e !== "page_unloading" && this.user.userLoaded(null), null)).then(e => {
          var _window$Sentry5;
          return console.log("User", e), e ? ((_window$Sentry5 = window.Sentry) !== null && _window$Sentry5 !== void 0 && _window$Sentry5.setUser(e), this.html.addClass("body", "profile_" + e.profileType), this.html.addClass("body", "subscribed_" + e.isSubscribed), this.user.user) : (this.html.addClass("body", "logged-out"), null);
        });
      }
      initProfiles() {
        var e = this.user.user;
        if (!e) return Promise.resolve(null);
        var t = e.profileId || 0,
          i = this.html.getData("body", "requiredProfile");
        return this.profiles.init().then(() => {
          if (this.profiles.isInCorrectProfile(t, i)) return e;
          var r = this.profiles.profileOfType(i);
          return r ? this.user.loginToProfile(r.profileId) : Promise.reject(null);
        });
      }
      initBookmarks() {
        var e = Promise.resolve(null);
        this.voyo.hasBookmarksBox() && (e = this.voyo.loadBookmarkSlides()), this.bookmarks.loadBookmarks(e).then(t => {
          this.bookmarks.set(t), this.events.sendEvent("started-bookmarks", t);
        });
      }
      discoverDevice() {
        var e = {
            family: "Browser",
            name: "Unknown",
            model: "Unknown",
            os: "",
            version: ""
          },
          t = navigator.userAgent.toLowerCase();
        t.includes("android") ? e.os = "android" : t.includes("iphone") || t.includes("ipad") || t.includes("ipod") ? e.os = "ios" : t.includes("windows") || t.includes("win32") ? e.os = "windows" : t.includes("linux") ? e.os = "linux" : t.includes("mac os x") || t.includes("macintosh") ? e.os = "macos" : t.includes("cros") && (e.os = "chromeos");
        var i = [{
          model: "edge",
          regex: /edg\/([0-9.]+)/
        }, {
          model: "opera",
          regex: /opr\/([0-9.]+)/
        }, {
          model: "chrome",
          regex: /chrome\/([0-9.]+)/
        }, {
          model: "firefox",
          regex: /firefox\/([0-9.]+)/
        }, {
          model: "safari",
          regex: /version\/([0-9.]+).*safari/
        }, {
          model: "ie",
          regex: /trident\/([0-9.]+)/
        }];
        for (var _i4 = 0, _i3 = i; _i4 < _i3.length; _i4++) {
          var s = _i3[_i4];
          var r = t.match(s.regex);
          if (r) {
            e.model = s.model, e.version = r[1] || "";
            break;
          }
        }
        return e;
      }
      getDeviceCssClass() {
        var e = "model-" + this.options.device.model.toLowerCase();
        return this.options.device.os && (e += " device-" + this.options.device.os.toLowerCase()), e;
      }
      log(e) {
        this.html.prependHTML("#debug", e + "<br>");
      }
      saveUserOptions() {
        this.localStorage.set("opt_playTrailers", this.options.playTrailers), this.localStorage.set("opt_catchupDebug", this.options.catchupDebug), this.localStorage.set("opt_showSubtitles", this.options.showSubtitles), this.localStorage.set("opt_videoVolume", this.options.videoVolume);
      }
      exit() {}
      loadUserOptions(e) {
        var t = null,
          i = null,
          s = null,
          r = null;
        try {
          t = this.localStorage.get("opt_playTrailers"), i = this.localStorage.get("opt_catchupDebug"), s = this.localStorage.get("opt_showSubtitles"), r = this.localStorage.get("opt_videoVolume");
        } catch (a) {
          console.log("Error in options", a);
        }
        var n = [t, i, s, r].includes(null);
        return t === null && (t = !0), i === null && (i = !1), s === null && (s = !0), r === null && (r = .75), e.playTrailers = t, e.catchupDebug = i, e.showSubtitles = s, e.videoVolume = r, n && this.saveUserOptions(), e;
      }
      getIsMobile() {
        return window.matchMedia("(max-width: 1199px)").matches;
      }
      registerServiceWorker() {
        "serviceWorker" in navigator && navigator.serviceWorker.register("/sw.js");
      }
    },
    os = Ue;
  document.addEventListener("DOMContentLoaded", () => {
    var o = new os(window.config);
    window.app = o, o.run();
  });
})();
//# sourceMappingURL=main-O4UBG7HX.js.map