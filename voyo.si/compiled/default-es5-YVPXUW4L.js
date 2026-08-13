"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", {
    value,
    configurable: true
  });
  var streamsSplide = null;
  document.addEventListener("started", () => {
    mountSplashSlider();
    mountSubmenuSlide();
    mountOtherSliders();
    startLiveStreamsUpdater();
  });
  document.addEventListener("started-bookmarks", () => {
    app.voyo.tagBookmarks();
  });
  function startLiveStreamsUpdater() {
    var liveStreamsBox = app.html.q("#voyobox_streams");
    if (!liveStreamsBox) {
      return;
    }
    setTimeout(refreshLiveStreams, 3e4);
  }
  __name(startLiveStreamsUpdater, "startLiveStreamsUpdater");
  function refreshLiveStreams() {
    app.voyo.refreshStreams().then(_ref => {
      var _ref2 = _slicedToArray(_ref, 2),
        needsUpdate = _ref2[0],
        html = _ref2[1];
      var dest = app.html.q("#voyobox_streams .track");
      if (needsUpdate && dest) {
        streamsSplide == null ? void 0 : streamsSplide.destroy(true);
        app.html.writeHTML(dest, html);
        streamsSplide = new Splide("#voyobox_streams").mount();
      }
      setTimeout(refreshLiveStreams, 3e4);
    });
  }
  __name(refreshLiveStreams, "refreshLiveStreams");
  function mountOtherSliders() {
    app.html.qAll(".splide").filter(el => !el.classList.contains("splide-no-auto-mount")).forEach((splideEl, i) => {
      i < 6 ? mountSplideEl(splideEl) : app.observer.observe(splideEl, {
        task: "mountVoyoSplide",
        params: {}
      });
    });
  }
  __name(mountOtherSliders, "mountOtherSliders");
  function mountSplideEl(el) {
    var splide = new Splide(el).mount();
    if (el.id === "voyobox_streams") {
      streamsSplide = splide;
    }
  }
  __name(mountSplideEl, "mountSplideEl");
  function mountSplashSlider() {
    var splashEl = app.html.q(".splash");
    var thumbnailsEl = app.html.q(".splash-thumbnails");
    if (!splashEl || !thumbnailsEl) {
      return;
    }
    var splash = new Splide(splashEl);
    var thumbnails = new Splide(thumbnailsEl);
    splash.on("active", playActiveTrailer);
    splash.sync(thumbnails);
    splash.mount();
    thumbnails.mount();
  }
  __name(mountSplashSlider, "mountSplashSlider");
  function mountSubmenuSlide() {
    app.html.qAll(".submenu.splide").forEach(splideEl => {
      var splide = new Splide(splideEl);
      splide.on("mounted", () => {
        app.html.removeClass(splideEl, "hidden");
        var i = app.html.qAll(".splide__slide", splideEl).findIndex(slide => app.html.hasClass(slide, "selected"));
        if (i > -1) {
          splide.go(i);
        }
      });
      splide.mount();
    });
  }
  __name(mountSubmenuSlide, "mountSubmenuSlide");
  function playActiveTrailer(slideComponent) {
    var slide = slideComponent == null ? void 0 : slideComponent.slide;
    if (!slide) {
      return;
    }
    app.voyoVideo.stopVideoPlayers();
    app.voyo.playTrailer(slide);
  }
  __name(playActiveTrailer, "playActiveTrailer");
  function mountVoyoSplide(item) {
    mountSplideEl(item.element);
  }
  __name(mountVoyoSplide, "mountVoyoSplide");
  function muteUnmuteTrailerVolume(event) {
    app.voyoVideo.muteUnmuteTrailerVolume(event);
  }
  __name(muteUnmuteTrailerVolume, "muteUnmuteTrailerVolume");
  function trailerInView(task) {
    if (task.isVisible) {
      app.voyoVideo.stopVideoPlayers();
      app.voyo.playTrailer(task.element);
    }
  }
  __name(trailerInView, "trailerInView");
  window.muteUnmuteTrailerVolume = muteUnmuteTrailerVolume;
  window.mountVoyoSplide = mountVoyoSplide;
  window.trailerInView = trailerInView;
})();
//# sourceMappingURL=default-YVPXUW4L.js.map