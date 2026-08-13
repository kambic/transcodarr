"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  let continue_watching_splide = null;
  let bookmarks_splide = null;
  document.addEventListener("bookmarks-slides-fetched", () => {
    loadContinueWatchingSplide();
    loadMyVoyoBookmarkSlides();
  });
  document.addEventListener("myVoyo-slide-reloaded", () => {
    loadMyVoyoBookmarkSlides();
  });
  function loadContinueWatchingSplide() {
    continue_watching_splide == null ? void 0 : continue_watching_splide.destroy(true);
    app.html.qAll(".splide.continue_watching").forEach(function(sliderEl) {
      const splide = new Splide(sliderEl);
      splide.on("mounted", () => {
        app.html.show(sliderEl);
      });
      splide.mount();
      continue_watching_splide = splide;
    });
  }
  __name(loadContinueWatchingSplide, "loadContinueWatchingSplide");
  function loadMyVoyoBookmarkSlides() {
    bookmarks_splide == null ? void 0 : bookmarks_splide.destroy(true);
    app.html.qAll(".splide.bookmarks").forEach(function(sliderEl) {
      const splide = new Splide(sliderEl);
      splide.on("mounted", () => {
        app.html.show(sliderEl);
      });
      splide.mount();
      bookmarks_splide = splide;
    });
  }
  __name(loadMyVoyoBookmarkSlides, "loadMyVoyoBookmarkSlides");
  function stopWatching(voyokey) {
    app.bookmarks.voyoBookmarkRemove("stayedAt", voyokey).then(() => {
      if (continue_watching_splide) {
        const slideIndex = continue_watching_splide.Components.Slides.get().findIndex((slide) => {
          return slide.slide.dataset.uniq === voyokey;
        });
        if (slideIndex !== -1) {
          continue_watching_splide.remove(slideIndex);
        }
      }
    });
  }
  __name(stopWatching, "stopWatching");
  function removeBookmark(voyokey) {
    app.bookmarks.voyoBookmarkRemove("GRP_DEFAULT", voyokey).then(() => {
      if (bookmarks_splide) {
        const slideIndex = bookmarks_splide.Components.Slides.get().findIndex((slide) => {
          return slide.slide.dataset.uniq === voyokey;
        });
        if (slideIndex !== -1) {
          bookmarks_splide.remove(slideIndex);
        }
      }
      const slides = app.html.qAll('.splide__slide[data-uniq="' + voyokey + '"]');
      slides.forEach((slide) => app.html.removeClass(slide, "myVoyo"));
    });
  }
  __name(removeBookmark, "removeBookmark");
  window.stopWatching = stopWatching;
  window.removeBookmark = removeBookmark;
})();
//# sourceMappingURL=bookmarks-YXUAEL4K.js.map
