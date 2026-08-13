import Html from './html';
import VideoUrlModel from '../model/video_url';
import VideoSourceModel from '../model/video_source';
import GQL from '../gql/gql';
import Cookies from './cookies';
import Banners from './banners';
import Reload from './reload';
import AppOptions from '../app/options';
import { base64EncodeUint8Array, isSafary } from './util';

declare var videojs: any;
declare var google: any;

interface PlayOptions {
    clickedButton?: HTMLElement | null;
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
    setUrl?: boolean;
    focus?: boolean;
    showPoster?: boolean,
    replaceUrl?: boolean;
    customUrl?: string;
    disableDblClick?: boolean;
    inBackground?: boolean;
    selector?: string;
}

class Video {

    private bgVideoTimer: any = null;

    protected imaOptions = {
        id: '',
        locale: '',
        debug: false,
        autoPlayAdBreaks: true,
        disableAdControls: false,
        requestMode: 'onPlay',
        showCountdown: false,
        adsManagerLoadedCallback: (e: Event) => { },
        /*
            use native browser playback for IMA. On iOS mobile it breaks DRM content because of custom player layer. 
            source for custum player layer: https://ads-developers.googleblog.com/2017/06/new-custom-playback-apis-for-ima-html5.html 
            
            * default: disableCustomPlaybackForIOS10Plus: false
                IMA SDK -> Custom playback layer -> Video element -> Safari media pipeline
            * disableCustomPlaybackForIOS10Plus: true
                IMA SDK -> Safari native video playback -> HLS / FairPlay pipeline
            
            caveat: skippable ads on iOS safari mobile will not work (cant rander skip button) 
                    because inline playing is not enabled with this option
        */
        disableCustomPlaybackForIOS10Plus: true
    };

    constructor(
        private html: Html,
        private gql: GQL,
        private cookies: Cookies,
        private banners: Banners,
        private reload: Reload | null,
        private options: AppOptions
    ) {
        this.imaOptions.debug = this.options.env == 'dev';
    }

    async play(videoElement: string, video: any,  options: PlayOptions): Promise<any> {
        if (!video || !video.Id) {
            return Promise.reject(new Error('No video data'));
        }

        if (options.showPoster === undefined) {
            options.showPoster = true;
        }

        if (options.disableDblClick === undefined) {
            options.disableDblClick = false;
        }

        if (!options.inBackground) {
            const isAdblockerActive = await this.hasAdblocker();

            if (isAdblockerActive) {
                video.Id = this.options.adblockerVideoId;
                video.Subtype = 'trailer';
            }
        }

        if (options.clickedButton) {
            this.html.removeClass('.video__list-active', 'video__list-active');
            this.html.addClass(options.clickedButton, 'video__list-active');
        }

        options.selector = videoElement;

        const isDrmMedia = (video.Mime & 16) === 16;
        return this.html.loadVideoElements(isDrmMedia)
            .then(() => this.gql.videoUrlV2(parseInt(video.Id, 10)))
            .then(videoUrl => {
                if (!videoUrl || !videoUrl.url) {
                    return Promise.reject('No video url');
                }

                this.initLanguage();
                this.setVideoData(videoElement, video);
                this.showVideoElement(videoElement);
               
                if (this.options.siteId == 1) {
                    this.setVideoData('#videoteca-video-info', video);
                }

                if (options.setUrl) {
                    this.setVideoUrl(video);
                }

                if (options.replaceUrl) {
                    this.replaceVideoUrl(video, options.customUrl);
                }

                // Do not show banners if video is error video.
                if (videoUrl?.infoCode) {
                    video.Subtype = 'trailer';
                }

                return this.playUrl(videoElement, videoUrl, video, options, isDrmMedia && videoUrl.license !== '');
            })
            .then(player => {
                return player;
            });
    }

    playBackground(videoElement: string, timeout: number, options: PlayOptions): void {
        if (this.bgVideoTimer) {
            clearTimeout(this.bgVideoTimer);
        }

        this.bgVideoTimer = setTimeout(() => {
            let video = this.html.getData(videoElement + ' video', 'video') as string | any;

            if (typeof video === "string" && video.length > 0) {
                video = JSON.parse(video);
            }

            if (video) {
                this.html.show(videoElement);
                this.play(videoElement, video, {inBackground: true, autoplay: options.autoplay, mute: true});
            }
        }, timeout);
    }

    videotecaLoadMore(selector: string, sectionId: number, btn: HTMLElement, url = '/video'): void {
        const page = this.html.getData(selector, 'pageNb');
        const nextPage = parseInt(page, 10) + 1;
        this.html.setData(selector, 'pageNb', nextPage);

        url += '?p=' + nextPage;

        if (sectionId) {
            url += '&s=' + sectionId;
        }

        this.html.fetchText(url)
            .then(html => {
                if (!html || html.length < 100) {
                    this.html.hide(btn);
                }
                this.html.appendHTML(selector, html)
            });
    }

    getPlayerInsideDiv(selector: string): any {
        var playerDiv = this.html.q(selector + ' video');
        if (!playerDiv || !(<any>window).videojs) {
            return;
        }

        return videojs.getPlayer(playerDiv);
    }

    toggleMute(selector: string, forcedValue: boolean | null = null): void {
        const player = this.getPlayerInsideDiv(selector);
        if (!player) {
            return;
        }

        if (forcedValue === null) {
            player.muted(!player.muted());
        } else {
            player.muted(forcedValue);
        }

        if (!player.muted() && player.volume() < 0.1) {
            player.volume(0.5);
        }

        if (player.muted()) {
            this.html.hide(selector + ' .icon.sound');
            this.html.show(selector + ' .icon.mute');
        } else {
            this.html.hide(selector + ' .icon.mute');
            this.html.show(selector + ' .icon.sound');
        }
    }

    closePip(): void {
        this.html.removeClass('.pip', 'pip');
    }

    destroyPlayers(): void {
        if (!(window as any).videojs || !videojs.players) {
            return;
        }

        const players = Object.keys(videojs.players).map(k => videojs.players[k]) as Array<any>;

        players
            .filter(p => p)
            .forEach(p => {
                this.destroyPlayer(p);
            });
    }

    private destroyPlayer(player: any): void {
        if (player.ima && player.ima.getAdsManager) {
            try {
                // Stop any playing ads
                const adsManager = player.ima.getAdsManager();
                if (adsManager) {
                    adsManager.destroy();
                }
            } catch (e) {
                console.warn('Error destroying ads manager:', e);
            }
        }

        player.pause();

        while (player.firstChild) {
            player.removeChild(player.firstChild);
        }

        player.removeAttribute('src');
        player.load();

        player.dispose();
    }

    private setVideoData(selector: string, video: any): void {
        this.html.writeHTML(selector + ' #video_title', video.Title);
        this.html.writeHTML(selector + ' #video_section', video.Section?.Title);
    }

    private showVideoElement(selector: string): void {
        this.html.hide(selector + ' .videoteca-thumb');
        this.html.show(selector + ' video');
    }

    private findButton(player: any, buttonType: string): any | null {
        const children = player.controlBar.children() as Array<any>;
        return children.find(c => c.options()?.type === buttonType);
    }

    private setSharingButton(player: any, video: any, selector: string): void {
        let shareButton = this.findButton(player, 'share-button');

        if (shareButton) {
            player.controlBar.removeChild(shareButton);
        }

        shareButton = player.controlBar.addChild('button', {
            type: 'share-button',
            className: 'vjs-icon-share',
        }, 12);

        shareButton?.on('click', () => {
            this.toggleShareHtml(player, video.Id, selector);
        });

        shareButton?.on('touchend', () => {
            this.toggleShareHtml(player, video.Id, selector);
        });

        player.on('userinactive', () => {
            this.hideShareHtml(selector);
        });
    }

    private hideShareHtml(selector: string): void {
        this.html.q(selector + ' .video-shares')?.remove();
    }

    private toggleShareHtml(player: any, videoId: number, selector: string): void {
        if (this.html.q(selector + ' .video-shares')) {
            this.hideShareHtml(selector);
            return;
        }

        this.html.fetchText('/video/' + videoId + '/share-html')
            .then(html => {
                this.html.appendHTML(selector, html);
            });
    }

    private setVideoUrl(video: any): void {
        let path = document.location.pathname;

        if (path.includes('.html')) {
            path = path.slice(0, path.lastIndexOf('/'));
        }

        path += video.Url + document.location.search;
        path = path.replace('//', '/');

        history.pushState(null, "video: " + video.Id, path);
    }

    private replaceVideoUrl(video: any, customUrl?: string): void {
        if (customUrl) {
            history.replaceState(null, "cu: " + video.Id, customUrl);
    
            return;
        }

        let path = document.location.pathname;

        if (path.includes('.html')) {
            path = path.slice(0, path.lastIndexOf('/'));
        }

        path += video.Url + document.location.search;
        path = path.replace('//', '/');

        history.replaceState(null, "video: " + video.Id, path);
    }

    private showBanners(video: any): boolean {
        if (!this.options.showAds) {
            return false;
        }

        return video.Subtype === 'trailer' || (!video.Postroll && !video.Preroll) ? false : true;
    }

    private playUrl(selector: string, videoUrl: VideoUrlModel | null, video: any, options: PlayOptions, isDrm: boolean): Promise<any> {
        if (!videoUrl || !(window as any).videojs) {
            return Promise.reject();
        }

        const el = this.html.q(selector);

        const player = videojs(selector + ' video', { language: this.options.country, restoreEl: true, userActions: {click: true}});

        if (!options.inBackground) {
            if (options.showPoster) {
                player.poster(video.Image.Src.replace('PLACEHOLDER', '1100x619'));
            }

            player.titleBar.update({ title: video.Title });
        }

        this.setSharingButton(player, video, selector + ' .video-js');

        let volume = this.getPlayerVolume();
        if (options.mute) {
            volume = 0;
            player.muted(true);
        }

        if (options.loop) {
            player.loop(true);
        }

        this.html.setData(selector, 'contentid', video.Id);
        player.hotkeysEnabled = true;
        // we load video.js eme extension only when video(media).mime & 16 === 16 (drm). So check before player.eme() init
        if (isDrm && typeof player.eme === 'function') {
            player.eme();
        }
        const videoSource = this.prepareVideoSource(videoUrl, isDrm);
        
        if (this.showBanners(video)) {
            this.initIMA(player, options, volume);
            this.initVideoBanners()
                .then(vmap => {
                    player.ima.initializeAdDisplayContainer();
                    player.ima.setContentWithAdsResponse(videoSource, vmap);
                });
        } else {
            player.src(videoSource);
        }

        return new Promise((resolve, reject) => {
            player.on('error', () => {
                reject({err: player.error(), player});
            });

            player.ready(() => {
                if (video.Vtt) {
                    this.setVttThumbnails(video.Vtt, player)
                }

                this.html.setData(player.el(), 'options', JSON.stringify(options));

                this.initPlayerEvents(player, video, options);
                this.setPlayerVolume(player, volume);

                player.on('keydown', (e:KeyboardEvent) => {
                    if (player.hotkeysEnabled) {
                        this.handleHotkey(player, e);
                    }
                    e.stopPropagation();
                    e.preventDefault();
                });

                if (options.focus) {
                    player.tech({ IWillNotUseThisInPlugins: true }).el().focus();
                }

                if (options.autoplay) {
                    player.play()
                        .then(() => { resolve(player); })
                        .catch((err: any) => { reject({err, player}); });
                } else {
                    resolve(player);
                }
            });
        });
    }

    private registerBigPauseButton() {
        if (!(<any>window).videojs) {
            return;
        }

        if (videojs.getComponent('bigPauseButton')) {
            return;
        }

        let button = videojs.getComponent('Button');
        let bigPauseButton = class extends button {
            constructor(player: any, options = {}) {
                super(player, options);
                this.addClass('vjs-big-pause-button');
                this.controlText('Pause');
                this.el().innerHTML = '<span class="vjs-icon-pause"></span>';
            }

            handleClick() {
                this.player().pause();
            }
        };

        videojs.registerComponent('bigPauseButton', bigPauseButton);
    }

    private addBigPauseButton(player: any): any {
        this.registerBigPauseButton();

        if (player.bigPauseButton) {
            return player.bigPauseButton;
        }

        player.bigPauseButton = player.addChild('bigPauseButton');
        player.bigPauseButton.hide();
        return player.bigPauseButton;
    }

    private handleHotkey(player: any, e: KeyboardEvent): void {
        switch (e.code) {
        case 'Space':
            player.paused() ? player.play() :player.pause();
            break;
        case 'ArrowRight':
            player.currentTime(player.currentTime() + 5);
            break
        case 'ArrowLeft':
            player.currentTime(player.currentTime() - 5);
            break
        case 'KeyM':
            player.muted(!player.muted());
        }
    }

    stopPlayerPlayback(player: any): void {
        // Stop playback of our m3u8 video
        player.pause();

        // Stop video ad playback
        if (player.ima && player.ima.getAdsManager) {
            const adsManager = player.ima.getAdsManager();

            if (adsManager) {
                adsManager.pause();
            }
        }
    }

    stopOtherPlaybacks(currentPlayer: any): void {
        if (!(window as any).videojs || !videojs.players) {
            return;
        }

        const players = Object.keys(videojs.players).map(k => videojs.players[k]) as Array<any>;

        // Stop player playbacks (all but current that has started playing)
        players
            .filter(p => p && p !== currentPlayer)
            .forEach(p => {
                this.stopPlayerPlayback(p);
            });

        // Close Picture-In-Picture div (rtl.hr)
        this.closePip();
    }

    private async initVideoBanners(): Promise<string> {
        const prerollBannerUrl = await this.banners.getPreOrPostRoll('preroll');
        const postrollBannerUrl = await this.banners.getPreOrPostRoll('postroll');

        let vmap = '<?xml version="1.0" encoding="UTF-8"?><vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">';

        if (prerollBannerUrl) {
            // tslint:disable-next-line:max-line-length
            vmap += '<vmap:AdBreak timeOffset="start" breakType="linear" breakId="preroll"><vmap:AdSource id="preroll-ad-1" allowMultipleAds="false" followRedirects="true"><vmap:AdTagURI templateType="vast3"><![CDATA[' + prerollBannerUrl + ']]></vmap:AdTagURI></vmap:AdSource></vmap:AdBreak>';
        }

        if (postrollBannerUrl) {
            // tslint:disable-next-line:max-line-length
            vmap += '<vmap:AdBreak timeOffset="end" breakType="linear" breakId="postroll"><vmap:AdSource id="postroll-ad-1" allowMultipleAds="false" followRedirects="true"><vmap:AdTagURI templateType="vast3"><![CDATA[' + postrollBannerUrl + ']]></vmap:AdTagURI></vmap:AdSource></vmap:AdBreak>';
        }

        vmap += '</vmap:VMAP>';

        return Promise.resolve(vmap);
    }

    private initIMA(player: any, playbackOptions: PlayOptions, volume: number): void {
        if (typeof player.ima !== 'function') {
            return;
        }

        let options = this.imaOptions;

        options.id = player.id();
        options.locale = this.options.country === 'si' ? 'sl' : this.options.country;

        options.adsManagerLoadedCallback = (e: Event) => {
            this.setAdPlayerVolume(player, player.ima.getAdsManager(), volume);
            player.ima.addEventListener('volumeChange', (e: Event) => this.onPlayerVolumeChange(player, playbackOptions, e));

            player.ima.addEventListener(google.ima.AdEvent.Type.STARTED, () => {
                player.hotkeysEnabled = false;
            });

            player.ima.addEventListener(google.ima.AdEvent.Type.COMPLETE, () => {
                player.hotkeysEnabled = true;
            });
        };

        player.ima(options);
    }

    private setVttThumbnails(vttUrl: string, player: any): void {
        if (typeof player.vttThumbnails === 'function') {
            player.vttThumbnails({ src: vttUrl });
        } else if (player.vttThumbnails) {
            player.vttThumbnails.src(vttUrl);
        }
    }

    private initLanguage(): void {
        videojs.addLanguage('si', {
            'Play Video': 'Predvajaj',
            'Play': 'Predvajaj',
            'Pause': 'Pavza',
            'LIVE': 'V ŽIVO',
            'Mute': 'Tiho',
            'Unmute': 'Glasno',
            'Fullscreen': 'Celozaslonski način',
            'Picture-in-Picture': 'Slika v sliki',
            'Exit Picture-in-Picture': 'Izhod slika v sliki',
            'Non-Fullscreen': 'Izhod celozaslonski način'
        });
        videojs.addLanguage('hr', {
            'Play Video': 'Gledaj',
            'Play': 'Gledaj',
            'Pause': 'Pauza',
            'LIVE': 'Uživo',
            'Mute': 'Ugasi zvuk',
            'Unmute': 'Upali zvuk',
            'Fullscreen': 'Cijeli zaslon',
            'Picture-in-Picture': 'Slika u slici',
            'Exit Picture-in-Picture': 'Izlaz iz prikaza slike u slici',
            'Non-Fullscreen': 'Izlaz iz cijelog zaslona'
        });
    }

    private initPlayerEvents(player: any, videoData: any, options: PlayOptions): void {
        const bigPauseButton = this.addBigPauseButton(player);
        
        player.bigPlayButton.on('touchend', (e: Event) => { this.onPlayerTouchEnd(player, e); });

        player.on('click',            (e: Event) => { this.onPlayerClick(player, e); });
        player.on('dblclick',         (e: Event) => { this.onPlayerDblClick(player, options, e); });
        player.on('start',            (e: Event) => { this.onPlayerStart(player, e); });
        player.on('ended',            (e: Event) => { this.onPlayerEnded(player, options, e); });
        player.on('timeupdate',       (e: Event) => { this.onPlayerTimeupdate(player, e); });
        player.on('pause',            (e: Event) => { this.onPlayerPause(player, bigPauseButton, e); });
        player.on('play',             (e: Event) => { this.onPlayerPlay(player, e); });
        player.on('loadedmetadata',   (e: Event) => { this.onPlayerLoadMetadata(player, videoData, e); });
        player.on('adstart',          (e: Event) => { this.onPlayerAdStart(player, e); });
        player.on('adend',            (e: Event) => { this.onPlayerAdEnd(player, e); });
        player.on('fullscreenchange', (e: Event) => { this.onPlayerFullscreenChange(player, e); });
        player.on('volumechange',     (e: Event) => { this.onPlayerVolumeChange(player, options, e); });
        player.on('playing',          (e: Event) => { this.onPlayerPlaying(player, e); });
        player.on('touchstart',       (e: Event) => { this.onPlayerTouchStart(player, e)});
        player.on('useractive',       (e: Event) => { this.onPlayerUserActive(player, bigPauseButton, e)});
        player.on('userinactive',     (e: Event) => { this.onPlayerUserInActive(player, bigPauseButton, e)});
    }

    private prepareVideoSource(videoUrl: VideoUrlModel, isDrm: boolean): VideoSourceModel {
        if (!isDrm) {
            return new VideoSourceModel({src: videoUrl.url});
        }

        if (isSafary()) {
            return this.prepareDrmSafariVideoSource(videoUrl);
        }
        
        return this.prepareDrmVideoSource(videoUrl);
    }

    private prepareDrmVideoSource(videoUrl: VideoUrlModel): VideoSourceModel {
        const keySystems = {
            'com.widevine.alpha': {
                url: this.options.wvLicenseServerUrl,
                licenseHeaders: {
                    'X-DRM-Message': videoUrl.url
                }
            },
        }
        return new VideoSourceModel({src: videoUrl.url, type: 'application/dash+xml', keySystems: keySystems});
    }

    private prepareDrmSafariVideoSource(videoUrl: VideoUrlModel): VideoSourceModel {
        const keySystems = {
            'com.apple.fps': {
                certificateUri: this.options.fpLicenseServerUrl + '/fps-pub.der',
                getContentId: (emeOptions: any, contentId: string | number | boolean) => {
                    try {
                        if (typeof contentId !== 'string') {
                            return '';
                        }
                        const parts = contentId.split('skd://');
                        return parts[1] || '';
                    } catch {
                        return '';
                    }
                },
                getLicense: (emeOptions: any, contentId: string | number | boolean, spc: any, callback: (arg0: any, arg1?: any) => void) => {
                    const reqBody = {
                        spc: base64EncodeUint8Array(spc), // converting binary to base64 text. Cant transport binary
                        assetId: encodeURIComponent(contentId)
                    };

                    videojs.xhr({
                        uri: this.options.fpLicenseServerUrl + '/fps/rest/getLicense',
                        method: 'POST',
                        responseType: 'text',
                        body: JSON.stringify(reqBody),
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: videoUrl.license
                        }
                    }, (err: any, response: any, responseBody: string) => {
                        if (err) {
                            callback(err);

                            return;
                        }

                        let keyText = responseBody.trim();
                        if (keyText.slice(0, 5) === '<ckc>' && keyText.slice(-6) === '</ckc>') {
                            keyText = keyText.slice(5,-6);
                        }

                        callback(null, Uint8Array.from(atob(keyText), c => c.charCodeAt(0)));
                    });
                }
            },
        }

        return new VideoSourceModel({src: videoUrl.url, keySystems: keySystems});
    }

    protected onPlayerPlaying(player: any, e: Event): void {
        player.el().classList.add('is-playing');
    }

    protected onPlayerDblClick(player: any, options: PlayOptions, e: Event): void {
        if (options.disableDblClick) {
            return;
        }

        if (player.isFullscreen()) {
            player.exitFullscreen();
        } else {
            player.requestFullscreen();
        }
    }

    protected onPlayerFullscreenChange(player: any, e: Event): void {
        player.nativeElement?.firstChild?.focus();
    }

    protected onPlayerVolumeChange(player: any, playbackOptions: PlayOptions, e: Event): void {
        const volume = player.muted() ? 0 : player.volume();

        // toggling mute on/off for video in splash background
        // must not be saved and applied to all normal videos.
        // only save volume value if user changed it
        // for real video.
        if (!playbackOptions.inBackground) {
            this.cookies.setIfImportantAllowed('playerVol', volume);
        }
    }

    protected onPlayerStart(player: any, e: Event): void {
        player.controlBar.el().style.visibility = 'visible';
    }

    protected onPlayerAdEnd(player: any, e: Event): void {
    }

    protected onPlayerAdStart(player: any, e: Event): void {
    }

    protected onPlayerTouchEnd(player: any, e: Event): void {
        if (!player) {
            return;
        }
    }

    protected onPlayerClick(player: any, e: Event): void {
    }

    protected onPlayerPlay(player: any, e: Event): void {
        this.reload?.stop();
        this.stopOtherPlaybacks(player);
    }

    protected onPlayerLoadMetadata(player: any, videoData: any, e: Event): void {
        if (!player) {
            return;
        }

        var seekableRange = player.seekable();

        if (seekableRange && seekableRange.length > 0 && videoData.ObjectType === 'stream') {
            var dvrWindow = seekableRange.end(0) - seekableRange.start(0);
            if (dvrWindow > 300) {
                player.options_.liveui = true;
                player.controlBar.addClass('vjs-liveui');
                player.currentTime(player.seekable().end(0));
            }
        }
    }

    protected onPlayerPause(player: any, bigPauseButton: any, e: Event): void {
        bigPauseButton?.hide();
    }

    protected onPlayerTimeupdate(player: any, e: any): void {
    }

    protected onPlayerEnded(player: any, playbackOptions: PlayOptions, e: Event): void {
        /**
         * If this player is playing in splsh background, we need to
         * hide it when it finishes - to show splash image.
         */
        if (playbackOptions.inBackground && playbackOptions.selector) {
            this.html.hide(playbackOptions.selector);
        }
    }

    protected onPlayerTouchStart(player: any, e: Event): void {
        if (!player) {
            return;
        }
        if (!player.hasStarted()) {
            return;
        }
        if (player.ads?.isInAdMode?.()) {
            return;
        }
        if (!player.userActive()) {
            return;
        };

        const target = e.target;
        if (!(target instanceof HTMLElement)) {
            return;
        };
        if (target.closest('.vjs-control-bar')) {
            return;
        };

        if (player.paused()) {
            player.play();
        } else {
            player.pause();
        }
    }

    protected onPlayerUserActive(player: any, bigPauseButton: any, e: Event): void {
        if (player.hasStarted() && !player.paused()) {
            bigPauseButton?.show();
        }
    }

    protected onPlayerUserInActive(player: any, bigPauseButton: any, e: Event): void {
        bigPauseButton?.hide();
    }

    protected getPlayerVolume(): number {
        let volume = this.cookies.getFloat('playerVol', 0.5);
        return (volume === null) ? 0.5 : volume;
    }

    protected setPlayerVolume(player: any, volume: number): void {
        player.volume(volume);

        const volumeBarSelector = '#' + player.id() + ' .vjs-volume-level';
        this.html.setStyle(volumeBarSelector, 'width', (volume * 100) + '%')
    }

    protected setAdPlayerVolume(player: any, adsManager: any, volume: number): void {
        if (!adsManager) {
            return;
        }

        adsManager.setVolume(volume);

        const volumeBarSelector = '#' + player.id() + ' .ima-slider-level-div';
        this.html.setStyle(volumeBarSelector, 'width', (volume * 100) + '%')
    }

    protected hasAdblocker(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const adblockEl = this.html.q('#adblock') as HTMLObjectElement;

            if (!adblockEl) {
                resolve(false);
            }

            adblockEl.onload = _ => { resolve(false); }
            adblockEl.onerror = _ => { resolve(true); }

            adblockEl.data = 'https://ads.api.24ur.si/adserver/adblock.xseki.dej.nehi';
        });
    }    
}

export default Video;
