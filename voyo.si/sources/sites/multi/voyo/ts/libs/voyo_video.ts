import VoyoAppOptions from "../app/options";
import GQL from "@core/gql/gql";
import Html from "@core/libs/html";
import VideoBreakModel from "@core/model/video_break";
import Events from "@core/libs/events";
import { Bookmark } from "@core/model/bookmarks";
import RateLimiter from "@core/libs/rate_limiter";
import UserWithLogin from "./user_login";
import Bookmarks from "./bookmarks";
import MuxStatistics from "./mux_statistics";
import ShakaPlayer from "./shaka_player";
import VoyoTimeline from "../../templates/components/voyo_timeline/voyo_timeline";

export class VideoPlaybackOptions {
    // type: 'video', 'epg', 'live_stream'
    type?: string;
    title?: string;
    originalTitle?: string;

    // For videos
    mediaId?: number;
    voyokey?: string;
    isTrailer?: boolean;
    isErrorVideo?: boolean; // If instead of real video we're showing error video (Oprostite prišlo je do napake video)
    startAt?: number;
    length?: number;
    vtt?: string;
    vttImage?: string;
    nextEpisodeUrl?: string;
    nextEpisodeId?: number;
    muted?: boolean;
    volume?: number;
    paused?: boolean;
    drmProtected?: boolean;
    allowSaveToStayedAt?: boolean; // trailers and catchUp are not allowed in bookmarks
    startedPlayingAt?: number; // so that we know how long user has been watching movie

    subtitles?: Array<{
        id: number;
        language: string;
        name: string;
        url: string;
        isDefault: boolean;
    }>;

    // for EPG
    chunkStart?: number;
    chunkEnd?: number;
    channel?: string;
    breaks?: Array<VideoBreakModel>;

    // episode recap (mainly at the start of episode)
    epiRecapAt?: number;
    epiRecapTo?: number;

    // credits at the start of episode (mainly after episode recap)
    startCreditsAt?: number;
    startCreditsTo?: number;

    // nb of seconds when end credits start
    endCreditsAt?: number;

}

class VoyoVideo {
    // We start trailer with 2.5 seconds delay
    private trailerTimer: any;

    private video: HTMLMediaElement;
    private videoOptions: VideoPlaybackOptions;

    private thumbnails: Array<any>;
    private timelinePreview: HTMLElement|null = null;

    // Timeline origin is user to shift timeline for live EPG playback. For example if user is watching for 2 minutes,
    // the time at the furthermost left of the timeline is shown as 2:00 instead of 0:00 and
    // 27:00 instead of 25:00 at the furthermost right. 25 minutes is the seekable range of our live EPG playback.
    private timelineOrigin: number|null = null;
    private timelineEl: VoyoTimeline|null = null;
    private controlsEl: HTMLElement | null;

    private btnEndCredits: HTMLElement|null = null;
    private btnEpisodeRecap: HTMLElement|null = null;
    private btnStartCredits: HTMLElement|null = null;

    private volumeSlider: HTMLInputElement|null = null;

    private freezeControls: boolean = false;

    // Use to prevent playing of wrong trailer. Trailer uses Promises
    // and if user clicks on another movie while Promises of current trailer
    // are executing, we need a way to stop it from starting.
    // We put id of currently playing video to this variable and we check if
    // it is still the same just before we start playing.
    private currentVideoId = 0;

    // Used in ontimeupdate event to limit execution to once per second
    private lastTimeUpdateAt = 0;

    // Timer that tries to close playback controls after 4 seconds of inactivity.
    private hideVideoControlsTimer: any;

    // Tells which was the last EPG url loaded. If user clicks fast between
    // EPG channels we might show wrong channel.
    private lastEpgUrl = '';

    // We save the last non-zero volume for instances where user mutes and unmutes the video,
    // so we can restore his previous volume.
    private lastNonZeroVolume = 0.75;

    // Use this function if showVideoControls is going to be called multiple times. For example in onmouseover.
    throttledShowVideoControls: () => void;

    constructor(
        protected html: Html,
        protected user: UserWithLogin,
        protected bookmarks: Bookmarks,
        protected gql: GQL,
        protected events: Events,
        protected muxStats: MuxStatistics,
        protected shaka: ShakaPlayer,
        protected rateLimiter: RateLimiter,
        protected options: VoyoAppOptions
    ) {
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());

        this.throttledShowVideoControls = this.rateLimiter.throttle(this.showVideoControls.bind(this), 400);
    }

    // Lookup elements that we'll be referring to often.
    private lookupElements(): void {
        this.controlsEl = this.html.q('#controls');

        this.timelinePreview = this.html.q('#timeline_preview', this.controlsEl);
        this.timelineEl = this.html.q('voyo-timeline', this.controlsEl) as VoyoTimeline;

        this.btnEpisodeRecap = this.html.q('#episode_recap');
        this.btnStartCredits = this.html.q('#start_credits');
        this.btnEndCredits = this.html.q('#next_episode');

        this.volumeSlider = this.html.q('.volume__slider') as HTMLInputElement;
    }

    initForPlay(selector: string, mediaId: number, playbackOptions: VideoPlaybackOptions): Promise<any> {
        this.video = this.html.q(selector) as HTMLMediaElement;
        if (!this.video) {
            throw new Error('What video element: ' + selector + '?');
        }
        if (!mediaId) {
            throw new Error('What video id: ' + mediaId + '?');
        }

        // Save this media as media that we allow to play
        this.currentVideoId = mediaId;
        clearTimeout(this.trailerTimer);

        const optionsInVideoTag = this.html.getData(this.video, 'playbackOptions');
        this.videoOptions = Object.assign({}, this.html.safeJsonParse(optionsInVideoTag), playbackOptions);

        // Live stream and trailers must not be saved to bookmarks
        if (this.videoOptions.type !== 'live_stream' && !this.videoOptions.isTrailer) {
            this.videoOptions.allowSaveToStayedAt = true;
        }

        this.videoOptions.drmProtected = !this.videoOptions.isTrailer;
        this.videoOptions.type = this.videoOptions.type || 'video';
        this.videoOptions.volume = this.options.videoVolume;
        this.thumbnails = [];

        this.lookupElements();
        this.setEvents(this.video, this.videoOptions);
        
        return this.loadUrl(this.video, mediaId, this.videoOptions)
            .then(() => this.parseVtt(this.video, this.videoOptions))
            .catch(err => {
                const message = err?.message || '';

                if (message === 'no_access') {
                    document.location.href = '/';
                } else if (message === 'too_many_devices') {
                    document.location.href = this.options.routes.too_many_devices;
                } else {
                    console.log('Video playback error', err);
                }
            });
    }

    initForCatchUp(selector: string, playbackOptions: VideoPlaybackOptions): Promise<any> {
        this.video = this.html.q(selector) as HTMLMediaElement;
        if (!this.video) {
            throw new Error('What epg element: ' + selector + '?');
        }

        const optionsInVideoTag = this.html.getData(this.video, 'playbackOptions');
        this.videoOptions = Object.assign({}, this.html.safeJsonParse(optionsInVideoTag), playbackOptions);

        this.videoOptions.drmProtected = true;
        this.videoOptions.type = 'epg';
        this.thumbnails = [];
        this.videoOptions.volume = this.options.videoVolume;

        this.lookupElements();
        this.setEvents(this.video, this.videoOptions);

        return this.loadEpgUrl(this.video, this.videoOptions)
            .catch(err => {
                const message = err?.message || '';

                if (message === 'no_access') {
                    document.location.href = '/';
                } else if (message === 'too_many_devices') {
                    document.location.href = this.options.routes.too_many_devices;
                } else {
                    console.log('Epg playback error', err);
                }
            });
    }

    initForTrailer(selector: string | HTMLElement, playbackOptions: VideoPlaybackOptions = {}): void {
        this.video = this.html.q(selector) as HTMLMediaElement;
        if (!this.video) {
            throw new Error('What video element: ' + selector + '?');
        }

        clearTimeout(this.trailerTimer);

        const mediaId = +this.html.getData(selector, 'trailer');
        if (!mediaId) {
            return;
        }

        // Save this media as media that we allow to play
        this.currentVideoId = mediaId;

        if (!playbackOptions.length) {
            playbackOptions.length = +this.html.getData(this.video, 'trailer_length');
        }

        this.lookupElements();

        playbackOptions.drmProtected = false;
        playbackOptions.isTrailer = true;
        playbackOptions.muted = playbackOptions.muted || false;
        playbackOptions.volume = this.options.videoVolume;
        playbackOptions.type = 'video';
        playbackOptions.paused = !this.options.playTrailers;

        this.video.onended = (e) => this.onTrailerEnded(playbackOptions, e);

        const splideElement = (this.video.closest('.splide') || this.html.q('body')) as HTMLElement;
        this.html.removeClass(splideElement, 'trailer_playing trailer_replay');
        this.html.addClass(splideElement, 'trailer_init');

        this.trailerTimer = setTimeout(() => {
            this.loadUrl(this.video, mediaId, playbackOptions)
                .then(() => {
                    this.html.removeClass(splideElement, 'trailer_init');

                    // If trailer is paused at start, we don't want to show first
                    // video frame, we wand user to still see the splash image.
                    if (playbackOptions.paused) {
                        this.html.hide(this.video);
                    } else {
                        // If trailer is not paused, make it visible!
                        this.html.show(this.video);

                        // Adds css class to splide div (or body) so that we can transition
                        // movie logo to smaller image and to show correct playback icons (replay, pause)
                        this.html.addClass(splideElement, 'trailer_playing');
                    }

                })
                .catch(err => console.log('Trailer playback error', err));
        }, 2500);
    }

    playPauseTrailer(): void {
        if (!this.video) {
            return;
        }

        this.html.show(this.video);

        const splideElement = (this.video.closest('.splide') || this.html.q('body')) as HTMLElement;

        if (this.video.paused) {
            this.video.play();
            this.html.addClass(splideElement, 'trailer_playing');
        } else {
            this.video.pause();
            this.html.removeClass(splideElement, 'trailer_playing');
        }
    }

    replayTrailer(): void {
        if (!this.video) {
            return;
        }

        const splideElement = (this.video.closest('.splide') || this.html.q('body')) as HTMLElement;
        this.html.addClass(splideElement, 'trailer_playing');
        this.html.removeClass(splideElement, 'trailer_replay');

        this.html.show(this.video);

        this.video.currentTime = 0;
        this.video.play();
    }

    // When trailer ends, hide it to show movie image. Also add 'trailer_replay'
    // css class, so that user gets "replay" button.
    private onTrailerEnded(playbackOptions: VideoPlaybackOptions, e: Event) {
        this.html.hide(e.target as HTMLElement);

        const el = this.html.q('.trailer_playing');

        if (el) {
            this.html.removeClass(el, 'trailer_playing');
            this.html.addClass(el, 'trailer_replay');
        }
    }

    stopVideoPlayers(removeVideoElements = false): void {
        // Set this to 0 so that if current video's Promises are still executing,
        // they will get rejected.
        this.currentVideoId = 0;

        this.shaka.destroy();

        this.html.qAll('video')
            .forEach(v => {
                const video = (v as HTMLMediaElement);

                video.pause();

                while (video.firstChild) {
                    video.removeChild(video.firstChild);
                }

                video.removeAttribute('src');
                video.load();

                this.html.hide(v);

                if (removeVideoElements) {
                    video.parentNode?.removeChild(video);
                }
            });

        clearTimeout(this.trailerTimer);

        this.html.removeClass('.trailer_playing', 'trailer_playing');
        this.html.removeClass('.trailer_replay', 'trailer_replay');
        this.setControlsFrozen(false);
    }

    stopEndCredits(): void {
        if (this.btnEndCredits) {
            this.html.addClass(this.btnEndCredits, 'hidden');
        }
        this.html.setData(this.video, 'endcredits', 'stop');
    }

    stopEpisodeRecap(): void {
        if (this.btnEpisodeRecap) {
            this.html.addClass(this.btnEpisodeRecap, 'hidden');
        }
        this.html.setData(this.video, 'episoderecap', 'stop');
    }

    stopStartCredits(): void {
        if (this.btnStartCredits) {
            this.html.addClass(this.btnStartCredits, 'hidden');
        }
        this.html.setData(this.video, 'startcredits', 'stop');
    }

    private parseVtt(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): Promise<any> {
        if (!playbackOptions.vtt) {
            return Promise.resolve(null);
        }

        return this.html.fetchText(playbackOptions.vtt)
            .then(vtt => {
                const lines = vtt.split("\n\n").filter(line => line.includes("thumbs.jpg#xywh="));

                const thumbnails = lines.map((line, index) => {
                    const timeMatch = line.match(/(\d+):(\d+):(\d+\.\d+)/); // Extract timestamp
                    const imageMatch = line.match(/thumbs\.jpg#xywh=(\d+),(\d+),(\d+),(\d+)/);

                    if (timeMatch && imageMatch) {
                        const timeInSeconds =
                            parseInt(timeMatch[1]) * 3600 +
                            parseInt(timeMatch[2]) * 60 +
                            parseFloat(timeMatch[3]);

                        const [_, x, y, width, height] = imageMatch.map(Number);
                    
                        return { time: timeInSeconds, x, y, width, height, index };
                    }
                    return null;
                }).filter(Boolean);

                this.thumbnails = thumbnails;
                this.timelineEl?.registerThumbnailPreview();
            });
    }

    private setEvents(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): void {
        video.onended = (e) => this.onended(playbackOptions, e);
        video.ontimeupdate = (e) => this.ontimeupdate(playbackOptions, e);
        video.onplay = (e) => this.onplay(playbackOptions, e);
        video.onpause = (e) => this.onpause(playbackOptions, e);
        video.onvolumechange = () => this.onvolumechange();
    }

    private isControlsDivVisible(): boolean {
        return (this.controlsEl as HTMLElement).style.opacity === '1';
    }

    stopVideoPlay(selector:string|HTMLElement): void {
        const video = this.html.q(selector) as HTMLMediaElement;

        video.pause();
    }

    startVideoPlay(selector:string|HTMLElement): void {
        const video = this.html.q(selector) as HTMLMediaElement;

        setTimeout(() => {
            this.hideVideoControls();
        }, 400);

        video.play();
    }

    // Sets video playback to specific time. If time is 'start' then video is set to 0, 
    // if time is 'end' then video is set to end of video or seekable range for live streams.
    setVideoPlayback(time: number | 'start' | 'end'): void {
        if (this.freezeControls) {
            return;
        }
        if (time === 'start') {
            time = 0;
        } else if (time === 'end') {
            time = Infinity;
        }

        this.updateVideoCurrentTime(time);
        this.updateTimeline(this.video);
    }

    // Moves video playback by given number of seconds. If seconds is negative, video is rewound.
    moveVideoPlayback(seconds: number): void {
        if (this.freezeControls) {
            return;
        }
        let time = this.video.currentTime + seconds;

        this.updateVideoCurrentTime(time);
        this.updateTimeline(this.video);
    }

    private updateVideoCurrentTime(time: number): void {
        if (this.timelineOrigin !== null && this.video.seekable.length > 0) {
            time += this.timelineOrigin;
            
            const start = this.video.seekable.start(0);
            const end = this.shaka.liveSeekEnd() ?? this.video.seekable.end(this.video.seekable.length - 1);

            time = Math.max(start, Math.min(time, end));
        } else {
            const duration = Number.isFinite(this.video.duration)
            ? this.video.duration
            : this.videoOptions.length || 0;

            time = Math.max(0, Math.min(time, duration));
        }

        this.video.currentTime = time;
    }


    playClick(): void {
        if (this.video.paused) {
            this.startVideoPlay(this.video);
        } else {
            this.stopVideoPlay(this.video);
        }
    }

    ffClick(amount = 10): void {
        this.throttledShowVideoControls();
        this.moveVideoPlayback(amount);
    }

    revClick(amount = 10): void {
        this.throttledShowVideoControls();
        this.moveVideoPlayback(-amount);
    }

    private isLiveEpgPlayback(video: HTMLMediaElement): boolean {
        return this.videoOptions.type === 'epg' &&
            !Number.isFinite(video.duration);
    }

    /**
     * Ensures that the timeline origin is set for live EPG playback, because seekable is not always available immediately (e.g. right after metadataloaded)
     * we initialize timelineOrigin on first timeupdate. It must only be set once per content play and nulled after switching content.
     */
    private ensureTimelineOrigin(video: HTMLMediaElement): number | null {
        if (this.timelineOrigin === null && this.isLiveEpgPlayback(video) && video.seekable.length > 0) {
            this.timelineOrigin = video.seekable.start(0);
        }

        return this.timelineOrigin;
    }

    private updateTimeline(video: HTMLMediaElement): void {
        if (!this.timelineEl) {
            return;
        }

        const origin = this.ensureTimelineOrigin(video);

        if (origin !== null) {
            if (video.seekable.length === 0) {
                return;
            }

            const start = video.seekable.start(0);
            const end = this.shaka.liveSeekEnd() ?? video.seekable.end(video.seekable.length - 1);

            this.timelineEl.setRange(
                start - origin,
                video.currentTime - origin,
                end - origin
            );

            return;
        }

        const duration = Number.isFinite(video.duration) ? video.duration : this.videoOptions.length || 0;
        this.timelineEl.setRange(0, video.currentTime, duration);
    }

    loadEpisode(url: string, dest: string): Promise<any> {
        this.video?.pause();

        return this.html.fetchText(url)
            .then(html => {
                const episodeHTML = this.html.extractHTML(html, dest);

                this.stopVideoPlayers(true);

                this.html.writeHTML(dest, episodeHTML);
            });
    }

    loadCatchUp(url: string, dest: string): Promise<any> {
        this.lastEpgUrl = url;

        return this.html.fetchText(url)
            .then(html => {
                if (url !== this.lastEpgUrl) {
                    throw new Error('This url: ' + url + ' is not last epg url: ' + this.lastEpgUrl);
                }

                this.stopVideoPlayers(true);

                const catchUpHTML = this.html.extractHTML(html, dest);

                this.html.writeHTML(dest, catchUpHTML);
            });
    }

    getCurrentTime(): number {
        if (this.timelineOrigin !== null) {
            return this.video ? this.video.currentTime - this.timelineOrigin : -1;
        }
        return this.video ? this.video.currentTime : -1;
    }

    getPlaybackOptions(): VideoPlaybackOptions {
        return this.videoOptions || {};
    }

    setControlsFrozen(frozen: boolean): void {
        this.freezeControls = frozen;
        this.timelineEl?.setDisabled(frozen);

        if (frozen) {
            this.html.addClass('body', 'frozen_controls');
        } else {
            this.html.removeClass('body', 'frozen_controls');
        }
    }

    private timeHHMMSS(duration: number): string {
        duration = Math.max(0, Math.floor(duration));

        const h = Math.floor(duration / 3600);
        const m = Math.floor((duration % 3600) / 60);
        const s = duration % 60;

        if (h>0) {
            return h + ':' + this.pad2(m) + ':' + this.pad2(s);
        }
        return this.pad2(m) + ':' + this.pad2(s);
    }

    private pad2(n: number) {
        return ('0' + n).slice(-2);
    }

    // Start or restart timer that will close video controls overlay afte
    // 3 seconds.
    private startVideoControlsTimer(): void {
        clearTimeout(this.hideVideoControlsTimer);

        this.hideVideoControlsTimer = setTimeout(() => {
            this.hideVideoControls();
        }, 3000);
    }

    showVideoControls(): void {
        if (!this.controlsEl || !this.video) {
            return;
        }

        // Close playback controls after 4 seconds.
        this.startVideoControlsTimer();

        // If controls div is already open, there's nothing to do
        if (this.isControlsDivVisible()) {
            return
        }

        this.html.show('#buttons', 'block', this.controlsEl);
        this.html.removeClass('#buttons', 'hidden', this.controlsEl);

        this.html.setStyle(this.controlsEl, 'opacity', '1');
    }

    hideVideoControls(): void {
        clearTimeout(this.hideVideoControlsTimer);

        if (this.controlsEl) {
            this.html.setStyle(this.controlsEl, 'opacity', '0');
        }
    }

    private loadUrl(video: HTMLMediaElement, mediaId: number, playbackOptions: VideoPlaybackOptions): Promise<any> {
        return this.user.linkDeviceToUser(playbackOptions.drmProtected)
            .then(() => this.gql.videoUrlV2(mediaId))
            .then(videoUrl => {
                if (!videoUrl || !videoUrl.url) {
                    throw new Error('no_video_data');
                }
                if (videoUrl.infoCode === 507 || videoUrl.infoCode === 503) {
                    // 507 is bad jwt, 503 is no access - redirect user to login
                    throw new Error('no_access');
                }

                playbackOptions.isErrorVideo = videoUrl.infoCode !== 0;

                console.log('Will play video', playbackOptions, videoUrl);

                return new Promise((resolve, reject) => {
                    video.onloadedmetadata = () => {
                        // Disable duration (end time) display for live streams (shows "--|--" instead)
                        this.timelineEl?.setDurationDisplay(isFinite(video.duration));

                        this.html.setData(video, 'options', JSON.stringify(playbackOptions));

                        this.html.show(video);

                        this.removeVideoSubtitles(video);
                        this.addVideoSubtitles(video, playbackOptions);

                        this.muxStats.monitor(video, playbackOptions);

                        // Here we check if this is really the media that is supposed to start.
                        // If user has quickly moved from one movie to another then Promise that
                        // starts first movie has to be rejected.
                        if (this.currentVideoId !== mediaId) {
                            reject('canceled_play');
                            return;
                        }

                        if (playbackOptions?.muted) {
                            video.muted = playbackOptions.muted;
                        }

                        if (typeof playbackOptions?.volume !== 'undefined') {
                            video.volume = playbackOptions.volume;
                        }

                        if (!playbackOptions.paused) {
                            video.play();
                        }

                        resolve(true);
                    }
                    video.onerror = () => { reject(new Error('video_load_error')) }

                    this.shaka.initPlayer(video, videoUrl, playbackOptions.startAt || undefined)
                        .catch(err => {
                            reject(new Error('video_load_error'));
                        });
                });

            });
    }

    private removeVideoSubtitles(video: HTMLMediaElement): void {
        const tracks = this.html.qAll('track', video);
        tracks.forEach(t => t.remove());
    }

    private addVideoSubtitles(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): void {
        if (!video || !playbackOptions?.subtitles || !Array.isArray(playbackOptions.subtitles)) {
            return;
        }

        let activeSubtitleId = playbackOptions.subtitles[0]?.id || 0;

        playbackOptions.subtitles.forEach(s => {
            const htmlTrack = document.createElement('track');

            htmlTrack.id = 'subtitle_' + s.id;
            htmlTrack.label = s.name;
            htmlTrack.kind = 'subtitles';
            htmlTrack.srclang = s.name;
            htmlTrack.src = s.url;

            video.appendChild(htmlTrack);

            if (s.isDefault) {
                activeSubtitleId = s.id;
            }
        });

        if (this.options.showSubtitles && activeSubtitleId !== 0) {
            this.toggleVideoSubtitle('subtitle_' + activeSubtitleId);
        }
    }

    toggleVideoSubtitle(subtitleId: string): boolean {
        const tracks = this.html.qAll('track', this.video) as Array<HTMLTrackElement>;
        const buttons = this.html.qAll('.button.subtitles') as Array<HTMLButtonElement>;

        let showSubtitles = false;

        tracks.forEach((t, i) => {
            if (t.id == subtitleId && t.track.mode !== 'showing') {
                this.html.addClass(buttons[i], 'active');
                t.track.mode = 'showing';
                showSubtitles = true;
            } else {
                this.html.removeClass(buttons[i], 'active');
                t.track.mode = 'hidden';
            }
        });

        return showSubtitles;
    }

    private loadEpgUrl(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions|null = null): Promise<any> {
        if (!playbackOptions || !playbackOptions.channel) {
            console.log('No channel for epg playback');
            return Promise.resolve(false);
        }

        return this.user.linkDeviceToUser(playbackOptions.drmProtected)
            .catch(err => {
                if (err.message === 'too_many_devices') {
                    window.location.href = this.options.routes.too_many_devices;
                    return;
                }
            })
            .then(() => {
                return this.gql.epgHlsUrlV2(playbackOptions.channel || '', playbackOptions?.chunkStart || 0, playbackOptions?.chunkEnd || 0);
            })
            .then(epgUrl => {
                if (!epgUrl || !epgUrl.url) {
                    console.log('No url for epg playback', epgUrl);
                    return;
                }
                playbackOptions.breaks = epgUrl.breaks || [];

                console.log('Will play epg', playbackOptions, epgUrl.url);

                return new Promise((resolve, reject) => {
                    video.onloadedmetadata = () => {
                        this.timelineOrigin = null;
                        // Disables duration (end time) display for live streams (shows "--|--" instead)
                        this.timelineEl?.setDurationDisplay(isFinite(video.duration));
                        
                        this.html.setData(video, 'options', JSON.stringify(playbackOptions));
                        this.html.show(video);

                        this.muxStats.monitor(video, playbackOptions);

                        if (playbackOptions?.muted) {
                            video.muted = playbackOptions?.muted;
                        }
                        if (typeof playbackOptions?.volume !== 'undefined') {
                            video.volume = playbackOptions.volume;
                        }

                        if (playbackOptions.paused) {
                            video.pause();
                        } else {
                            video.play();
                        }

                        resolve(true);
                    };

                    video.onerror = () => { reject(new Error('video_load_error')); };

                    this.shaka.initPlayer(video, epgUrl, playbackOptions.startAt || undefined)
                        .catch(err => {
                            reject(new Error('video_load_error'));
                        });
                });
            });
    }

    private onended(playbackOptions: VideoPlaybackOptions, e: Event) {
        console.log('ON ENDED', e);

        if (playbackOptions.isTrailer || playbackOptions.isErrorVideo) {
            return;
        }

        this.hideVideoControls();
        this.html.addClass(this.video, 'hidden');

        // Sent current video to bookmarks so that it will be marked as 'watched'.
        this.bookmarks.voyoBookmarkConsumeCurrent();

        const similar = this.html.q('#play_similar');
        const countdownToNextEpisode = this.btnEndCredits ? !this.html.hasClass(this.btnEndCredits, 'hidden') : false; // tells if endCredits button is currently displayed

        // if there is similar content, show it after original movie ends but
        // only if countdown to next episode is not active. If it is active it
        // will show next episode and we must not show similar items.
        if (similar && !countdownToNextEpisode) {
            this.html.removeClass(similar, 'hidden');
        }
    }

    private ontimeupdate(playbackOptions: VideoPlaybackOptions, e: Event) {
        const video = e.target as HTMLMediaElement;

        // This next part makes sure that we only execute the rest of the functions once per second
        const currentTime = Math.ceil(video.currentTime);
        if (this.lastTimeUpdateAt === currentTime) {
            return;
        }
        this.lastTimeUpdateAt = currentTime;

        this.saveStayedAtData(video, playbackOptions);
        this.showEndCreditsButton(video, playbackOptions);
        this.showEpisodeRecapButton(video, playbackOptions);
        this.showStartCreditsButton(video, playbackOptions);
        this.updateTimeline(video);
    }

    private showEndCreditsButton(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): void {
        if (playbackOptions.isErrorVideo || !playbackOptions.endCreditsAt || !playbackOptions.nextEpisodeUrl || !this.btnEndCredits) {
            return;
        }

        const currentTime = Math.floor(video.currentTime || 0);
        if (currentTime < playbackOptions.endCreditsAt) {
            return;
        }

        const isStopped = this.html.getData(this.video, 'endcredits') ===  'stop';
        if (isStopped) {
            return;
        }

        let remainSec = 10 - (currentTime - playbackOptions.endCreditsAt);
        if (remainSec < 0) {
            remainSec = 0;
        }

        if (remainSec === 0) {
            // Mark as stopped so the next timeupdate tick doesn't re-click #go_next.
            // could fire twice and start two players on the same episode.
            this.html.setData(this.video, 'endcredits', 'stop');
            this.html.q('#go_next')?.click();
            return;
        }

        this.html.writeHTML('#countdown', remainSec.toString(), this.btnEndCredits);

        if (this.html.hasClass(this.btnEndCredits, 'hidden')) {
            this.html.removeClass(this.btnEndCredits, 'hidden');
        }
    }

    private showEpisodeRecapButton(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): void {
        if (playbackOptions.isErrorVideo || !playbackOptions.epiRecapTo || !this.btnEpisodeRecap) {
            return;
        }

        const currentTime = Math.floor(video.currentTime || 0);

        if (currentTime < (playbackOptions.epiRecapAt||0)+2 || currentTime >= playbackOptions.epiRecapTo) {
            if (!this.html.hasClass(this.btnEpisodeRecap, 'hidden')) {
                this.html.addClass(this.btnEpisodeRecap, 'hidden');
            }
            return;
        }

        const isStopped = this.html.getData(this.video, 'episoderecap') ===  'stop';
        if (isStopped) {
            return;
        }

        const controlsVisible = this.isControlsDivVisible();
        if (controlsVisible) {
            return;
        }

        if (this.html.hasClass(this.btnEpisodeRecap, 'hidden')) {
            this.html.removeClass(this.btnEpisodeRecap, 'hidden');
        }
    }

    private showStartCreditsButton(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): void {
        if (playbackOptions.isErrorVideo || !playbackOptions.startCreditsAt || !playbackOptions.startCreditsTo || !this.btnStartCredits) {
            return;
        }

        const currentTime = Math.floor(video.currentTime || 0);

        if (currentTime < playbackOptions.startCreditsAt+2 || currentTime >= playbackOptions.startCreditsTo) {
            if (!this.html.hasClass(this.btnStartCredits, 'hidden')) {
                this.html.addClass(this.btnStartCredits, 'hidden');
            }

            return;
        }

        const isStopped = this.html.getData(this.video, 'startcredits') ===  'stop';
        if (isStopped) {
            return;
        }

        const controlsVisible = this.isControlsDivVisible();
        if (controlsVisible) {
            return;
        }

        if (this.html.hasClass(this.btnStartCredits, 'hidden')) {
            this.html.removeClass(this.btnStartCredits, 'hidden');
        }
    }

    private onplay(playbackOptions: VideoPlaybackOptions, e: Event) {
        this.html.removeClass('body', 'paused');
        this.html.addClass('body', 'playing');

        playbackOptions.startedPlayingAt = (new Date).getTime();
    }

    private onpause(playbackOptions: VideoPlaybackOptions, e: Event) {
        this.html.removeClass('body', 'playing');
        this.html.addClass('body', 'paused');

        // If page is unloading there will be not enough time to save
        // to localStorage and to send bookmarks to GQL.
        if (!window.isPageUnloading) {
            this.bookmarks.voyoBookmarkConsumeCurrent();
        }
    }

    private saveStayedAtData(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): void {
        if (!playbackOptions.allowSaveToStayedAt || !playbackOptions.startedPlayingAt || !playbackOptions.mediaId || !playbackOptions.length) {
            return;
        }

        const duration = Math.ceil(video.currentTime);
        const percent = Math.ceil((duration / playbackOptions.length) * 100);
        const playingForMs = (new Date).getTime() - playbackOptions.startedPlayingAt;
        const playingForSec = Math.ceil(playingForMs / 1000);

        // do not log bookmarks if user did not really watch this movie.
        if (percent < 5 || playingForSec < 5) {
            return;
        }

        const bookmark = new Bookmark({voyokey: playbackOptions.voyokey, percent, duration, entityId: playbackOptions.mediaId, nextEntityId: playbackOptions.nextEpisodeId});
        this.bookmarks.voyoBookmarkSaveCurrent(bookmark);
    }

    showThumbnailPreview(time: number, percentage: number): void {
        if (!this.timelineEl || !this.timelinePreview || !this.thumbnails.length) {
            return;
        }

        const progressBar = this.timelineEl.getProgressBarElement();
        if (!progressBar) {
            return;
        }

        const thumb = this.getThumbnailForTime(time);
        if (!thumb) {
            return;
        }

        const previewWidth = 200;
        const left = Math.max(previewWidth / 2, Math.min(progressBar.clientWidth - previewWidth / 2, progressBar.clientWidth * percentage));
        const thumbTime = String(thumb.time);

        this.timelinePreview.style.left = left + 'px';
        if (this.timelinePreview.dataset['time'] !== thumbTime) {
            this.timelinePreview.innerHTML = '';
            const previewThumb = document.createElement('div');
            this.renderThumbnail(previewThumb, thumb, true);
            this.timelinePreview.appendChild(previewThumb);
            this.timelinePreview.dataset['time'] = thumbTime;
        }
        this.html.removeClass(this.timelinePreview, 'hidden');
    }

    hideThumbnailPreview(): void {
        if (!this.timelinePreview) {
            return;
        }

        this.timelinePreview.innerHTML = '';
        this.timelinePreview.dataset['time'] = '';
        this.html.addClass(this.timelinePreview, 'hidden');
    }

    private getThumbnailForTime(time: number): any|null {
        if (!this.thumbnails.length) {
            return null;
        }

        let index = this.thumbnails.findIndex((thumb:any) => thumb.time >= time);
        if (index === -1) {
            return null;
        }

        return this.thumbnails[index];
    }

    private renderThumbnail(target: HTMLElement, thumb: any, current: boolean): void {
        target.dataset['time'] = thumb.time;
        target.dataset['time_badge'] = this.timeHHMMSS(thumb.time);

        if (thumb.timebased) {
            target.innerHTML = this.timeHHMMSS(thumb.time);
            target.className = 'thumbnail time_thumbnail';
        } else {
            target.className = 'thumbnail image_thumbnail';

            let img = this.html.q('img', target) as HTMLImageElement;
            if (!img) {
                img = document.createElement('img');
                img.src = this.videoOptions.vttImage || '';
                target.appendChild(img);
            }

            img.style.top = `-${thumb.y}px`;
            img.style.left = `-${thumb.x}px`;

            let time = this.html.q('div', target) as HTMLElement;
            if (!time) {
                time = document.createElement('div');
                this.html.addClass(time, 'time');
                time.innerHTML = this.timeHHMMSS(thumb.time);
                target.appendChild(time);
            }
        }

        if (current) {
            target.classList.add('current');
        } else {
            target.classList.remove('current');
        }
    }

    private openFullscreen(selector?: HTMLElement | string): void {
        const player = (typeof selector === 'string' ? app.html.q(selector) : selector) || document.documentElement;

        if (player.requestFullscreen) {
            player.requestFullscreen();
        } else if ((player as any).webkitRequestFullscreen) { /* Safari */
            (player as any).webkitRequestFullscreen();
        } else if ((player as any).msRequestFullscreen) { /* IE11 */
            (player as any).msRequestFullscreen();
        }
    }

    private closeFullscreen(): void {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) { /* Safari */
            (document as any).webkitExitFullscreen();
        }
    }

    public toggleFullscreen(event: Event, selector?: HTMLElement | string): void {
        event.preventDefault();

        const isFullscreen = !!document.fullscreenElement;

        if (isFullscreen) {
            this.closeFullscreen();
        } else {
            this.openFullscreen(selector);
        }
    }

    // Keeps body.fullscreen + isFullscreen in sync with the actual fullscreen
    // state — including Esc and other browser-driven exits that never go through
    // closeFullscreen().
    private onFullscreenChange(): void {
        const isFullscreen = !!document.fullscreenElement;

        if (isFullscreen) {
            app.html.addClass('body', 'fullscreen');
        } else {
            app.html.removeClass('body', 'fullscreen');
        }

        this.events.sendEvent('fullscreen', {isFullscreen})
    }

    private onvolumechange(): void {
        if (!this.video || !this.volumeSlider) {
            return;
        }

        const newVolume = this.video?.volume || 0;

        this.volumeSlider.value = newVolume.toFixed(2);
        this.volumeSlider.style.setProperty('--volume-percent', `${newVolume * 100}%`);

        if (newVolume > 0) {
            this.lastNonZeroVolume = newVolume;
            this.html.show('.volume__icon');
            this.html.hide('.volume__icon-muted');
        } else {
            this.html.hide('.volume__icon');
            this.html.show('.volume__icon-muted');
        }
    }

    public setVolume(volume: number): number|null {
        if (!this.video) {
            return null;
        }

        const volumeNorm = Math.max(0, Math.min(1, volume));
        this.video.volume = volumeNorm;
        this.video.muted = volumeNorm === 0;

        return volumeNorm;
    }

    public muteUnmuteVolume(event: Event): number {
        event.preventDefault();

        const newVolume = this.video?.volume === 0 ? (this.lastNonZeroVolume || 0.75) : 0;
        this.setVolume(newVolume);

        return newVolume;
    }

    public muteUnmuteTrailerVolume(event: Event): boolean|null {
        event.preventDefault();

        if (!this.video) {
            return null;
        }

        if (this.video.muted) {
            this.video.muted = false;

            // Mute/unmute will show no difference if user's video volume setting is set to 0.
            if (this.video.volume < 0.1) {
                this.video.volume = 0.75;
            }

            this.html.removeClass('body', 'trailer_muted');
        } else {
            this.video.muted = true;
            this.html.addClass('body', 'trailer_muted');
        }

        return this.video.muted;
    }
}

export default VoyoVideo;
