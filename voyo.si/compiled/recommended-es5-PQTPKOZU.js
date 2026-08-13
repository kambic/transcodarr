"use strict";

(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", {
    value,
    configurable: true
  });
  document.addEventListener("started-user", () => {
    app.voyo.loadRecommendedSlides().then(() => {
      renderRecommendedSlides();
    });
  });
  function renderRecommendedSlides() {
    app.html.qAll(".splide.recommended").forEach(function (sliderEl) {
      var splide = new Splide(sliderEl);
      splide.on("mounted", () => {
        app.html.show(sliderEl);
      });
      app.observer.observe(sliderEl, {
        task: "mountSplide",
        params: {
          splide
        }
      });
    });
  }
  __name(renderRecommendedSlides, "renderRecommendedSlides");
  function recommendedClick(clicktrackurl, destUrl) {
    app.html.fetchText(clicktrackurl).then(() => {
      window.location.href = destUrl;
    }).catch(err => {
      console.log("ERR", err);
      window.location.href = destUrl;
    });
  }
  __name(recommendedClick, "recommendedClick");
  window.recommendedClick = recommendedClick;
})();
//# sourceMappingURL=recommended-PQTPKOZU.js.map