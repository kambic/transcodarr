import GQL from "@core/gql/gql";
import Html from "@core/libs/html";
import VoyoAppOptions from "../app/options";
import UserWithLogin from "./user_login";
import VoyoVideo, { VideoPlaybackOptions } from "./voyo_video";
import Profiles from "./profiles";
import Bookmarks from "./bookmarks";
import LocalStorage from "./local_storage";
import Events from "@core/libs/events";
import BookmarkGroupsModel, { Bookmark } from "@core/model/bookmarks";

class Voyo {
    constructor(
        protected html: Html,
        protected events: Events,
        protected user: UserWithLogin,
        protected voyoVideo: VoyoVideo,
        protected gql: GQL,
        protected profiles: Profiles,
        protected bookmarks: Bookmarks,
        protected localStorage: LocalStorage,
        protected options: VoyoAppOptions
    ) {
    }

    playTrailer(dest: string | HTMLElement, playbackOptions: VideoPlaybackOptions = {}): void {
        const trailer = this.html.q('.trailer', this.html.q(dest));

        if (!trailer) {
            return;
        }

        if (typeof playbackOptions.muted === 'undefined') {
            const isTrailerMuted = this.html.hasClass('body', 'trailer_muted');
            playbackOptions.muted = isTrailerMuted;
        }

        this.voyoVideo.initForTrailer(trailer, playbackOptions);
    }

    toggleBookmark(voyokey: string): void {
        const isBookmarked = this.bookmarks.isBookmarked('GRP_DEFAULT', voyokey);

        if (isBookmarked) {
            this.bookmarks.voyoBookmarkRemove('GRP_DEFAULT', voyokey);
            this.html.removeClass('#content', 'myVoyo');
        } else {
            this.bookmarks.voyoBookmarkAdd('GRP_DEFAULT', new Bookmark({entityId: voyokey}));
            this.html.addClass('#content', 'myVoyo myVoyo-check');

            // myVoyo-check is just for some animation, needs to be removed after 2s
            setTimeout(() => {
                this.html.removeClass('#content', 'myVoyo-check');
            }, 2000);
        }
    }

    /**
     * This function is used for toggling bookmarks on slides in sliders.
     * One content can be present in multiple sliders on the same page, so we need to toggle bookmark class on all of them.
     */
    toggleSlideBookmark(el: HTMLElement, voyokey: string): void {
        const isBookmarked = this.bookmarks.isBookmarked('GRP_DEFAULT', voyokey);
        let bookmarkPromise: Promise<any>;

        if (isBookmarked) {
            bookmarkPromise = this.bookmarks.voyoBookmarkRemove('GRP_DEFAULT', voyokey).then(() => {
                this.html.addClass(el.closest('.splide__slide') as HTMLElement, 'myVoyo-removed-check');

                // myVoyo-removed-check is just for the "removed" toast, needs to be removed after 2s
                setTimeout(() => {
                    const slides = this.html.qAll('.splide__slide[data-uniq="' + voyokey + '"]');
                    this.html.removeClass(slides, 'myVoyo');
                    this.html.removeClass(slides, 'myVoyo-removed-check');
                }, 2000);
            });
        } else {
            bookmarkPromise = this.bookmarks.voyoBookmarkAdd('GRP_DEFAULT', new Bookmark({entityId: voyokey})).then(() => {
                const slides = this.html.qAll('.splide__slide[data-uniq="' + voyokey + '"]');
                this.html.addClass(slides, 'myVoyo myVoyo-check');

                // myVoyo-check is just for some animation, needs to be removed after 2s
                setTimeout(() => {
                    this.html.removeClass(slides, 'myVoyo-check');
                }, 2000);
            });
        }

        bookmarkPromise.then(() => this.reloadMyVoyoBookmarkSlides());
    }

    // Adds 'myVoyo' or 'stayedAt' css class to all movies and voyo categories that
    // are in user's bookmarks.
    tagBookmarks(): void {
        const bookmarks = this.bookmarks.get();

        bookmarks?.groupItems('GRP_DEFAULT')
            .forEach(b => {
                this.html.addClass('[data-uniq="' + b.voyokey + '"]', 'myVoyo');
            });

        bookmarks?.groupItems('stayedAt')
            .forEach(b => {
                this.html.addClass('[data-uniq="' + b.voyokey + '"]', 'stayedAt');
                this.html.setStyle('[data-uniq="' + b.voyokey + '"] .progressbar .line', 'width', b.percent+'%');
            });
    }

    // Returns true if this page has a bookmarks box
    hasBookmarksBox(): boolean {
        return !!this.html.q('.voyobox.bookmarks');
    }


    // Fetches the bookmarks box HTML, writes its slider fragments into the DOM, and
    // returns the bookmarks data embedded in it (if any).
    // This function is called from app.ts when the page is loaded and should not be called again
    // any cases where the bookmarks boxes are referenced should rely on the bookmarks-slides-fetched event.
    loadBookmarkSlides(): Promise<BookmarkGroupsModel | null> {
        if (!this.user.user?.token) {
            return Promise.resolve(null);
        }
        const urlPrefix = this.html.getData('body', 'urlPrefix');
        const url = urlPrefix + '/bookmark/voyobox_slides?' + this.user.cacheBuster;

        return this.html.fetchText(url, {timeout:4000,user:this.user.user})
            .then(html => {
                const stayedat = this.html.extractHTML(html, '#stayedat');
                const myvoyo = this.html.extractHTML(html, '#myvoyo');

                if (stayedat.trim().length > 100) {
                    this.html.writeHTML('.voyobox.continue_watching .slider', stayedat);
                } else {
                    this.html.q('.voyobox.continue_watching')?.remove();
                }

                if (myvoyo.trim().length > 100) {
                    this.html.writeHTML('.voyobox.bookmarks .slider', myvoyo);
                } else {
                    this.html.q('.voyobox.bookmarks')?.remove();
                }

                this.events.sendEvent('bookmarks-slides-fetched', {});
                return this.extractBookmarksFromSlidesHtml(html);
            })
            .catch(() => {
                this.html.q('.voyobox.continue_watching')?.remove();
                this.html.q('.voyobox.bookmarks')?.remove();

                return null;
            });
    }

    private extractBookmarksFromSlidesHtml(html: string): BookmarkGroupsModel | null {
        const data = this.html.extractData(html, '#bookmarks-data', 'bookmarks');
        if (!data) {
            return null;
        }

        try {
            return new BookmarkGroupsModel(JSON.parse(data));
        } catch (error) {
            console.error('Error parsing bookmarks data:', error, data);
            return null;
        }
    }

    reloadMyVoyoBookmarkSlides(): Promise<any> {
        if (!this.user.user?.token) {
            return Promise.reject(false);
        }

        const urlPrefix = this.html.getData('body', 'urlPrefix');
        const url = urlPrefix + '/bookmark/voyobox_slides?' + this.user.cacheBuster;

        return this.html.fetchText(url, {timeout:4000,user:this.user.user})
            .then(html => {
                const myvoyo = this.html.extractHTML(html, '#myvoyo');

                if (myvoyo.trim().length > 100) {
                    this.html.writeHTML('.voyobox.bookmarks .slider', myvoyo);
                    this.events.sendEvent('myVoyo-slide-reloaded', {});
                } else {
                    this.html.q('.voyobox.bookmarks')?.remove();
                }
            })
            .catch(() => {
                this.html.q('.voyobox.bookmarks')?.remove();
            });
    }

    loadRecommendedSlides(): Promise<any> {
        if (!this.user.user?.token) {
            return Promise.resolve(false);
        }

        const url = '/recommended/voyobox_slides?' + this.user.cacheBuster;

        return this.html.fetchText(url, {timeout:4000,user:this.user.user})
            .then(html => {
                if (html.trim().length < 100) {
                    return false;
                }

                const mainSlides = this.html.extractHTML(html, '#main_slides');
                const mainSlidesTracker = this.html.extractHTML(html, '#main_slides_view_tracker');
                const otherBoxes = this.html.extractHTML(html, '#other_boxes');

                this.html.appendHTML('.recommended_main .slider', mainSlides);
                this.html.writeHTML('.recommended_main .view_tracker', mainSlidesTracker);
                this.html.removeClass('.recommended_main', 'hidden');
                this.html.removeClass('.recommended_main .track', 'hidden');

                if (otherBoxes.length > 100) {
                    const el = this.html.q('.recommended_main');
                    el?.insertAdjacentHTML('afterend', otherBoxes);
                }
            })
            .catch(err => {
                console.log('Error loading recommended slides', err);
                return false;
            });
    }

    loadSeasonEpisodes(uniq: string, season: string, template: string, dest: HTMLElement|string): Promise<any> {
        const currentSeason = this.html.getData(dest, 'current');
        const urlPrefix = this.html.getData('body', 'urlPrefix');
        const url = urlPrefix + '/info/' + uniq + '/seasons/' + encodeURIComponent(season) + '/episodes/' + template;

        if (season === currentSeason) {
            return Promise.resolve(false);
        }

        return this.html.fetchText(url)
            .then(html => {
                const episodesHTML = this.html.extractHTML(html, '#season_episodes');
                this.html.writeHTML(dest, episodesHTML);
                this.html.setData(dest, 'current', season);
            });
    }

    // Fetches the live streams box. Returns [needsUpdate, html] so the caller can
    // destroy the old Splide, inject the html and re-mount in the correct order.
    refreshStreams(): Promise<[boolean, string]> {
        return this.html.fetchText('/streams')
            .then(text => {
                const existingHash = this.html.getData('#voyobox_streams .track', 'hash');
                const newHash = this.html.extractData(text, '#voyobox_streams .track', 'hash');

                if (existingHash === newHash) {
                    return [false, ''] as [boolean, string];
                }

                const html = this.html.extractHTML(text, '#voyobox_streams .track');
                return [!!html, html] as [boolean, string];
            })
            .catch(err => {
                console.error('Error refreshing streams:', err);
                return [false, ''] as [boolean, string];
            });
    }

    showContentDetails(url: string, placeholder = '.details_placeholder'): Promise<boolean> {
        return this.html.fetchText('/details' + url)
            .then(html => {
                if (!html) {
                    return false;
                }

                this.voyoVideo.stopVideoPlayers();

                this.html.writeHTML(placeholder, html);
                this.html.removeClass(placeholder, 'hidden');

                return true;
            })
            .catch(e => {
                console.log('Error loading data from server', e);
                return false;
            });
    }

    hideContentDetails(): void {
        this.html.writeHTML('.details_placeholder', '');
        this.html.addClass('.details_placeholder', 'hidden');
    }

    streamReminder(streamId: number): void {
        this.gql.liveStreamReminder(streamId)
            .then(() => {
                this.html.removeClass('#content .stream_reminder_toast', 'hidden');
                this.html.buttonDisable('#content .stream_reminder_button');

                setTimeout(() => {
                    this.html.addClass('#content .stream_reminder_toast', 'hidden');
                    this.html.buttonEnable('#content .stream_reminder_button');
                }, 2000);
            });
    }
}

export default Voyo;
