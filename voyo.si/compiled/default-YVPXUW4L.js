"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  let streamsSplide = null;
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
    const liveStreamsBox = app.html.q("#voyobox_streams");
    if (!liveStreamsBox) {
      return;
    }
    setTimeout(refreshLiveStreams, 3e4);
  }
  __name(startLiveStreamsUpdater, "startLiveStreamsUpdater");
  function refreshLiveStreams() {
    app.voyo.refreshStreams().then(([needsUpdate, html]) => {
      const dest = app.html.q("#voyobox_streams .track");
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
    app.html.qAll(".splide").filter((el) => !el.classList.contains("splide-no-auto-mount")).forEach((splideEl, i) => {
      i < 6 ? mountSplideEl(splideEl) : app.observer.observe(splideEl, { task: "mountVoyoSplide", params: {} });
    });
  }
  __name(mountOtherSliders, "mountOtherSliders");
  function mountSplideEl(el) {
    const splide = new Splide(el).mount();
    if (el.id === "voyobox_streams") {
      streamsSplide = splide;
    }
  }
  __name(mountSplideEl, "mountSplideEl");
  function mountSplashSlider() {
    const splashEl = app.html.q(".splash");
    const thumbnailsEl = app.html.q(".splash-thumbnails");
    if (!splashEl || !thumbnailsEl) {
      return;
    }
    const splash = new Splide(splashEl);
    const thumbnails = new Splide(thumbnailsEl);
    splash.on("active", playActiveTrailer);
    splash.sync(thumbnails);
    splash.mount();
    thumbnails.mount();
  }
  __name(mountSplashSlider, "mountSplashSlider");
  function mountSubmenuSlide() {
    app.html.qAll(".submenu.splide").forEach((splideEl) => {
      const splide = new Splide(splideEl);
      splide.on("mounted", () => {
        app.html.removeClass(splideEl, "hidden");
        const i = app.html.qAll(".splide__slide", splideEl).findIndex((slide) => app.html.hasClass(slide, "selected"));
        if (i > -1) {
          splide.go(i);
        }
      });
      splide.mount();
    });
  }
  __name(mountSubmenuSlide, "mountSubmenuSlide");
  function playActiveTrailer(slideComponent) {
    const slide = slideComponent == null ? void 0 : slideComponent.slide;
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
