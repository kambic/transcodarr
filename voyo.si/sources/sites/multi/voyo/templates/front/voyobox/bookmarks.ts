export {};

let continue_watching_splide: any = null;
let bookmarks_splide: any = null;

document.addEventListener('bookmarks-slides-fetched', () => {
    loadContinueWatchingSplide();
    loadMyVoyoBookmarkSlides();
});

document.addEventListener('myVoyo-slide-reloaded', () => {
    loadMyVoyoBookmarkSlides();
});

function loadContinueWatchingSplide() {
    // Destroy the previous instance before re-mounting
    continue_watching_splide?.destroy(true);

    app.html.qAll('.splide.continue_watching').forEach(function (sliderEl) {
        const splide = new Splide(sliderEl);

        splide.on('mounted', () => {
            app.html.show(sliderEl);
        });

        splide.mount();
        continue_watching_splide = splide;
    });
}

function loadMyVoyoBookmarkSlides() {
    // Destroy the previous instance before re-mounting
    bookmarks_splide?.destroy(true);

    app.html.qAll('.splide.bookmarks').forEach(function (sliderEl) {
        const splide = new Splide(sliderEl);

        splide.on('mounted', () => {
            app.html.show(sliderEl);
        });

        splide.mount();
        bookmarks_splide = splide;
    });
}

function stopWatching(voyokey: string) {
    app.bookmarks.voyoBookmarkRemove('stayedAt', voyokey)
        .then(() => {
            // Remove from splide slider
            if (continue_watching_splide) {
                const slideIndex = continue_watching_splide.Components.Slides.get().findIndex((slide: any) => {
                    return slide.slide.dataset.uniq === voyokey;
                });

                if (slideIndex !== -1) {
                    continue_watching_splide.remove(slideIndex);
                }
            }
        })
}

function removeBookmark(voyokey: string) {
    app.bookmarks.voyoBookmarkRemove('GRP_DEFAULT', voyokey)
        .then(() => {
            // Remove from splide slider
            if (bookmarks_splide) {
                const slideIndex = bookmarks_splide.Components.Slides.get().findIndex((slide: any) => {
                    return slide.slide.dataset.uniq === voyokey;
                });

                if (slideIndex !== -1) {
                    bookmarks_splide.remove(slideIndex);
                }
            }

            // Remove myVoyo class from any slides with this voyokey
            const slides = app.html.qAll('.splide__slide[data-uniq="' + voyokey + '"]');
                slides.forEach(slide => app.html.removeClass(slide, 'myVoyo'));
        });
}

window.stopWatching = stopWatching;
window.removeBookmark = removeBookmark;