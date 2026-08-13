export {};

document.addEventListener('started-user', () => {
    app.voyo.loadRecommendedSlides().then(() => {
        renderRecommendedSlides();
    });
});

function renderRecommendedSlides() {
    app.html.qAll('.splide.recommended').forEach(function (sliderEl) {
        var splide = new Splide(sliderEl);

        splide.on('mounted', () => {
            app.html.show(sliderEl);
        });

        app.observer.observe(sliderEl, { task: 'mountSplide', params: { splide } });
    });
}

function recommendedClick(clicktrackurl: string, destUrl: string): void {    
    app.html.fetchText(clicktrackurl)
        .then(() => {
            window.location.href = destUrl;
        })
        .catch(err => {
            console.log('ERR', err);
            window.location.href = destUrl;
        });
}

window.recommendedClick = recommendedClick;
