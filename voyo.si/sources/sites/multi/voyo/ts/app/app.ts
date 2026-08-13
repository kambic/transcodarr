import VoyoAppOptions from './options';
import initCustomComponents from './components';
import GQL from '@core/gql/gql';
import Events from '@core/libs/events';
import Html from '@core/libs/html';
import Gadgets from '@core/libs/gadgets';
import UserWithLogin from '../libs/user_login';
import Voyo from '../libs/voyo';
import VoyoVideo from '../libs/voyo_video';
import Profiles from '../libs/profiles';
import Bookmarks from '../libs/bookmarks';
import LocalStorage from '../libs/local_storage';
import OnlVoyoWebsocket from '../libs/voyo_websocket';
import Search from '../libs/search';
import UserModel from '@core/model/user';
import MuxStatistics from '../libs/mux_statistics';
import ShakaPlayer from '../libs/shaka_player';
import Mailing from '../libs/mailing';
import CookiesDidomi from '@core/libs/cookies_didomi';
import Image from '@core/libs/image';
import Poll from '@core/libs/poll';
import Observer from '@core/libs/observer';
import Banners from '@core/libs/banners';
import Video from '@core/libs/video';
import VoyoForms from '../libs/voyo_forms';
import VerticalVideo from '@core/libs/vertical_videos';
import VerticalVideoPreview from '@core/libs/vertical_videos_preview';
import PlayRestriction from '../libs/play_restriction';
import RateLimiter from '@core/libs/rate_limiter';
import Scroll from '@core/libs/scroll';
import AppOptions from '@core/app/options';
import BookmarkGroupsModel from '@core/model/bookmarks';

class VoyoApp {
    public events: Events;
    public gql: GQL;
    public html: Html;
    public cookies: CookiesDidomi;
    public user: UserWithLogin;
    public profiles: Profiles;
    public bookmarks: Bookmarks;
    public voyo: Voyo;
    public voyoVideo: VoyoVideo;
    public localStorage: LocalStorage;
    public onlWebsocket: OnlVoyoWebsocket;
    public search: Search;
    public muxStatistics: MuxStatistics;
    public gadgets: Gadgets;
    public shaka: ShakaPlayer;
    public mailing: Mailing;
    public voyoForms: VoyoForms;
    
    public observer: Observer;
    public banners: Banners;
    public image: Image;
    public poll: Poll;
    public video: Video;
    public verticalVideo: VerticalVideo;
    public verticalVideoPreview: VerticalVideoPreview;
    public playRestriction: PlayRestriction;
    public rateLimiter: RateLimiter;
    public scroll: Scroll;

    constructor(
        private options: VoyoAppOptions
    ) {
        this.html = new Html();
        this.rateLimiter = new RateLimiter();
        this.scroll = new Scroll(this.html, this.rateLimiter);
        this.playRestriction = new PlayRestriction(this.html, this.options);
        this.shaka = new ShakaPlayer(this.options);
        this.events = new Events(this.html);
        this.localStorage = new LocalStorage(this.options as AppOptions);
        this.gql = new GQL(this.options as AppOptions);
        this.cookies = new CookiesDidomi(this.html, this.events, this.options as AppOptions);
        this.profiles = new Profiles(this.gql, this.html, this.localStorage, this.options);
        this.bookmarks = new Bookmarks(this.gql, this.localStorage, this.options);
        this.user = new UserWithLogin(this.events, this.cookies, this.gql, this.html, this.profiles, this.localStorage, this.options);
        this.muxStatistics = new MuxStatistics(this.user, this.options);
        this.voyoVideo = new VoyoVideo(this.html, this.user, this.bookmarks, this.gql, this.events, this.muxStatistics, this.shaka, this.rateLimiter, this.options);
        this.voyo = new Voyo(this.html, this.events, this.user, this.voyoVideo, this.gql, this.profiles, this.bookmarks, this.localStorage, this.options);
        this.onlWebsocket = new OnlVoyoWebsocket(this.html, this.user, this.cookies, this.options);
        this.search = new Search(this.html, this.options);
        this.gadgets = new Gadgets(this.html, this.events, this.cookies, this.options as AppOptions);
        this.mailing = new Mailing(this.html, this.user, this.options, this.gql, this.localStorage);
        this.voyoForms = new VoyoForms(this.options, this.html, this.rateLimiter);

        // Blog
        this.observer = new Observer(this.html, this.options as AppOptions);
        this.banners = new Banners(this.cookies, this.html, this.observer, this.options as AppOptions);       
        this.video = new Video(this.html, this.gql, this.cookies, this.banners, null, this.options as AppOptions);
        this.image = new Image(this.html, this.options as AppOptions);
        this.poll = new Poll(this.html, this.gql, this.cookies);
        this.verticalVideo = new VerticalVideo(this.html, this.video, this.options as AppOptions);
        this.verticalVideoPreview = new VerticalVideoPreview(this.html);

        document.addEventListener('started', () => this.onAppStarted());
        document.addEventListener('started-user', () => this.onStartedUser());
        document.addEventListener('started-guest', () => this.onStartedGuest());
        document.addEventListener('started-bookmarks', () => this.onStartedBookmarks());
    }

    async run() {
        console.debug('Starting app ...');

        initCustomComponents();
        
        // Setup our app
        this.user.handleDeviceId();

        this.options.device = this.discoverDevice();
        this.options = this.loadUserOptions(this.options);
        this.options.isMobile = this.getIsMobile();
        
        this.setBodyCssClasses();
        this.cookies.init();
        this.observer.init();
        if (this.options.isMobile) {
            this.scroll.init();
        }
        
        (window as any).Sentry?.setContext('options', this.options);
        (window as any).Sentry?.setTag('deviceId', this.user.deviceId);
        
        console.debug('Options', this.options);

        // At this time the app is up and running. User's data is not yet loaded;
        // wait for started-user, started-guest or started-bookmarks as appropriate.
        this.events.sendEvent('started', this.options);
    }

    // Executed after app starts to run
    private onAppStarted(): void {
        console.debug('App is running ...');

        const url = new URL(window.location.href);

        if (url.searchParams.get('loginWithCodeSuccess') === '1') {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
                event: 'login'
            });

            url.searchParams.delete('loginWithCodeSuccess');
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }

        if (this.mustLoadUserData()) {
            this.loadUserData()
                .then(() => this.initProfiles())
                .catch(() => this.user.user)
                .then(user => {
                    user ?
                        this.events.sendEvent('started-user', this.user.user) :
                        this.events.sendEvent('started-guest', null);
                });
        }

        this.registerServiceWorker();

        // Load noxios chat javascript
        window.didomiOnReady = window.didomiOnReady || [];
        window.didomiOnReady.push((Didomi: any) => {
            this.gadgets.initChat(Didomi);
            this.gadgets.initExponea(Didomi);
        });
    }

    // Executed after user data and his profiles are loaded
    private onStartedUser(): void {
        console.debug('User is loaded ...');

        app.html.removeClass('.if-user-loggedin', 'hidden');
        app.html.addClass('.if-user-loggedout', 'hidden');

        this.initBookmarks();

        // Connect to websocket - so that we know if user adds this device to
        // his own devices. Needs to be executed after we load user data.
        this.onlWebsocket.init();

        setTimeout(() => {
            this.gadgets.exponeaIdentifyUser(this.user.user);
        }, 1000);
    }

    // Executed if user is not logged in
    private onStartedGuest(): void {
        app.html.addClass('.if-user-loggedin', 'hidden');
        app.html.removeClass('.if-user-loggedout', 'hidden');

        // Connect to websocket even user is not logged
        this.onlWebsocket.init();    
    }

    // Executed after user and all his bookmarks are loaded
    private onStartedBookmarks(): void {
        console.debug('Bookmarks are loaded ...');
        this.bookmarks.voyoBookmarkConsumeCurrent()
    }

    // Adds special css classes to body tag. Css class for device, model (model_ios, ...).
    // Browser will play FIRST trailer if it is muted - so we have to start with muted trailers.
    private setBodyCssClasses(): void {
        const bodyCssClass = this.getDeviceCssClass() + ' trailer_muted';
        this.html.addClass('body', bodyCssClass);
    }

    /**
     * Don't load user data if user is on a page that doesn't require login
     */
    private mustLoadUserData(): boolean {
        // This one is set when we show 404 or 500 error page
        if (window.skipUserLoad) {
            return false;
        }

        // These urls don't require us to check if user is logged in or not.
        const publicUrls = [
            this.options.routes.login,
            this.options.routes.registration,
            this.options.routes.profiles
        ];

        const currUrl = document.location.pathname;
        const isPublicPage = publicUrls.find(url => currUrl.startsWith(url));

        return !isPublicPage;
    }

    reloadUserInfo(): Promise<UserModel|null> {
        return this.loadUserData()
    }

    private loadUserData(): Promise<UserModel|null> {
        return this.user.loadUserInfo()
            .catch(err => {
                if (err !== 'page_unloading') {
                    this.user.userLoaded(null);
                }

                return null;
            })
            .then(user => {
                console.log('User', user);

                if (!user) {
                    this.html.addClass('body', 'logged-out');
                    return null;
                }

                (window as any).Sentry?.setUser(user);

                // Add user's profileType to body HTML
                this.html.addClass('body', 'profile_' + user.profileType);
                this.html.addClass('body', 'subscribed_' + user.isSubscribed);

                return this.user.user;
            });
    }

    private initProfiles(): Promise<UserModel|null> {
        const user = this.user.user;
        if (!user) {
            return Promise.resolve(null);
        }

        const profileId = user.profileId || 0;
        const requiredProfileType = this.html.getData('body', 'requiredProfile');

        return this.profiles.init()
            .then(() => {
                // Check if we need to move user to another profile (eg: if he's in /oto with normal
                // profile, we change his current profile to kids)
                const profileOk = this.profiles.isInCorrectProfile(profileId, requiredProfileType);
                if (profileOk) {
                    return user;
                }

                const requiredProfile = this.profiles.profileOfType(requiredProfileType);
                if (!requiredProfile) {
                    return Promise.reject(null);
                }

                return this.user.loginToProfile(requiredProfile.profileId);
            });
    }

    // If current page has a bookmarks box, start loading it right away. We need
    // it asap as it also has bookmaks JSON in it.
    private initBookmarks(): void {
        let bookmarksBoxPromise: Promise<BookmarkGroupsModel | null> = Promise.resolve(null);

        if (this.voyo.hasBookmarksBox()) {
            bookmarksBoxPromise = this.voyo.loadBookmarkSlides();
        }

        this.bookmarks.loadBookmarks(bookmarksBoxPromise)
            .then(bookmarks => {
                this.bookmarks.set(bookmarks);
                this.events.sendEvent('started-bookmarks', bookmarks);
            });
    }

    private discoverDevice() {
        const device = {family: 'Browser', name: 'Unknown', model: 'Unknown', os: '', version: ''};
        const ua = navigator.userAgent.toLowerCase();

        // OS Detection
        if (ua.includes('android')) {
            device.os = 'android';
        } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
            device.os = 'ios';
        } else if (ua.includes('windows') || ua.includes('win32')) {
            device.os = 'windows';
        } else if (ua.includes('linux')) {
            device.os = 'linux';
        } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
            device.os = 'macos';
        } else if (ua.includes('cros')) {
            device.os = 'chromeos';
        }

        const models = [
            { model: 'edge', regex: /edg\/([0-9.]+)/ },
            { model: 'opera', regex: /opr\/([0-9.]+)/ },
            { model: 'chrome', regex: /chrome\/([0-9.]+)/ },
            { model: 'firefox', regex: /firefox\/([0-9.]+)/ },
            { model: 'safari', regex: /version\/([0-9.]+).*safari/ },
            { model: 'ie', regex: /trident\/([0-9.]+)/ },
        ];

        for (const candidate of models) {
            const match = ua.match(candidate.regex);

            if (match) {
                device.model = candidate.model;
                device.version = match[1] || '';

                break;
            }
        }

        return device;
    }

    private getDeviceCssClass(): string {
        let cssClass = 'model-' + this.options.device.model.toLowerCase();

        if (this.options.device.os) {
            cssClass += ' device-' + this.options.device.os.toLowerCase();
        }

        return cssClass;
    }

    log(text: string) {
        this.html.prependHTML('#debug', text + '<br>');
    }

    /**
     * Save options that suer can set in application settings.
     */
    saveUserOptions(): void {
        this.localStorage.set<boolean>('opt_playTrailers', this.options.playTrailers);
        this.localStorage.set<boolean>('opt_catchupDebug', this.options.catchupDebug);
        this.localStorage.set<boolean>('opt_showSubtitles', this.options.showSubtitles);
        this.localStorage.set<number>('opt_videoVolume', this.options.videoVolume);
    }

    exit(): void {
    }

    /**
     * Load options that user can set in settings.
     */
    private loadUserOptions(options: VoyoAppOptions): VoyoAppOptions {
        let playTrailers: boolean|null = null;
        let catchupDebug: boolean|null = null;
        let showSubtitles: boolean|null = null;
        let videoVolume: number|null = null;

        try {
            playTrailers = this.localStorage.get<boolean>('opt_playTrailers');
            catchupDebug = this.localStorage.get<boolean>('opt_catchupDebug');
            showSubtitles = this.localStorage.get<boolean>('opt_showSubtitles');
            videoVolume = this.localStorage.get<number>('opt_videoVolume');
        } catch (err) {
            console.log('Error in options', err);
        }

        // If any of options is NOT in localStorage yet, we'll save it there
        const saveOptions = [playTrailers, catchupDebug, showSubtitles, videoVolume].includes(null);

        if (playTrailers === null) {
            playTrailers = true;
        }
        if (catchupDebug === null) {
            catchupDebug = false;
        }
        if (showSubtitles === null) {
            showSubtitles = true;
        }
        if (videoVolume === null) {
            videoVolume = 0.75;
        }

        options.playTrailers = playTrailers;
        options.catchupDebug = catchupDebug;
        options.showSubtitles = showSubtitles;
        options.videoVolume = videoVolume;

        if (saveOptions) {
            this.saveUserOptions();
        }

        return options;
    }

    // Anything that has width less than 1200 is by our
    // definition 'mobile' -> shows mobile layout and mobile
    // banners. window.matchMedia does not trigger reflow.
    private getIsMobile(): boolean {
        return window.matchMedia("(max-width: 1199px)").matches;
    }

    private registerServiceWorker(): void {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
        }
    }
}

export default VoyoApp;
