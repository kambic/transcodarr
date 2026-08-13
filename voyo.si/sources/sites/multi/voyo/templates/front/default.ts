import { ObserverItem } from "@core/libs/observer";

export {};

// Live-streams Splide instance. Tracked so refreshLiveStreams can destroy the
// previous instance before re-mounting, instead of stacking instances every 30s.
let streamsSplide: any = null;

document.addEventListener('started', () => {
    mountSplashSlider();
    mountSubmenuSlide();
    mountOtherSliders();

    startLiveStreamsUpdater();
});

document.addEventListener('started-bookmarks', () => {
    app.voyo.tagBookmarks();
});

// Starts periodic check for new live stream data
function startLiveStreamsUpdater(): void {
    const liveStreamsBox = app.html.q('#voyobox_streams');
    if (!liveStreamsBox) {
        return;
    }

    setTimeout(refreshLiveStreams, 30000);
}

// Fetches and updates live stream data every 30 sec
function refreshLiveStreams(): void {
    app.voyo.refreshStreams()
        .then(([needsUpdate, html]) => {
            const dest = app.html.q('#voyobox_streams .track');

            if (needsUpdate && dest) {
                streamsSplide?.destroy(true);
                app.html.writeHTML(dest, html);
                streamsSplide = new Splide('#voyobox_streams').mount();
            }

            setTimeout(refreshLiveStreams, 30000);
        });
}

function mountOtherSliders(): void {
    // Loop through all splides and mount() them. Top 6 are mounted immediatelly.
    // If splide has 'splide-no-auto-mount' css class then don't mount it here.
    // (eg: bookmarks splide is mounted later when we get bookmark data)
    app.html.qAll('.splide')
        .filter(el => !el.classList.contains('splide-no-auto-mount'))
        .forEach((splideEl: HTMLElement, i: number) => {
            i < 6 ?
                mountSplideEl(splideEl) :
                app.observer.observe(splideEl, { task: 'mountVoyoSplide', params: {} });
        });
}

// Mounts a splide and keeps a handle to the streams slider so refreshLiveStreams
// can destroy it before re-mounting. Other sliders don't need tracking.
function mountSplideEl(el: HTMLElement): void {
    const splide = new Splide(el).mount();

    if (el.id === 'voyobox_streams') {
        streamsSplide = splide;
    }
}

function mountSplashSlider(): void {
    const splashEl = app.html.q('.splash');
    const thumbnailsEl = app.html.q('.splash-thumbnails');

    if (!splashEl || !thumbnailsEl) {
        return;
    }

    const splash = new Splide(splashEl);
    const thumbnails = new Splide(thumbnailsEl);

    splash.on('active', playActiveTrailer);

    splash.sync(thumbnails);
    splash.mount();
    thumbnails.mount();
}

function mountSubmenuSlide(): void {
    app.html.qAll('.submenu.splide')
        .forEach(splideEl => {
            const splide = new Splide(splideEl);

            // Scroll splide to the selected item
            splide.on('mounted', () => {
                app.html.removeClass(splideEl, 'hidden');

                const i = app.html.qAll('.splide__slide', splideEl)
                    .findIndex(slide => app.html.hasClass(slide,'selected'));

                if (i > -1) {
                    splide.go(i);
                }
            });

            splide.mount();
        });
}

function playActiveTrailer(slideComponent: any): void {
    const slide = slideComponent?.slide as HTMLElement | undefined;
    if (!slide) {
        return;
    }

    app.voyoVideo.stopVideoPlayers();
    app.voyo.playTrailer(slide);
}

function mountVoyoSplide(item: ObserverItem): void {
    mountSplideEl(item.element as HTMLElement);
}

function muteUnmuteTrailerVolume(event: Event) {
    app.voyoVideo.muteUnmuteTrailerVolume(event);
}

function trailerInView(task: any): void {
    if (task.isVisible) {
        app.voyoVideo.stopVideoPlayers();
        app.voyo.playTrailer(task.element);
    }
}

window.muteUnmuteTrailerVolume = muteUnmuteTrailerVolume;
window.mountVoyoSplide = mountVoyoSplide;
window.trailerInView = trailerInView;
