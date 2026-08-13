import VoyoStbAppOptions from "../app/options";
import UserWithLogin from "./user_login";
import { VideoPlaybackOptions } from "./voyo_video";

class MuxStatistics {
    constructor(
        private user: UserWithLogin,
        private options: VoyoStbAppOptions
    ) {}

    monitor(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions) {
        if (playbackOptions.isTrailer || !(window as any).mux || !this.options.playbackStatsUrl) {
            return;
        }

        let payload = {};

        switch (playbackOptions.type) {
            case 'live_stream':
                payload = this.liveStreamPayload(video, playbackOptions);
                break;
            case 'epg':
                payload = this.epgPayload(video, playbackOptions);
                break;
            default:
                payload = this.videoPayload(video, playbackOptions);
                break;
        }

        const muxData = Object.assign(this.devicePayload(), payload);
        const debug = this.user.user?.id === 19;

        console.log('mux data', muxData);

        (window as any).mux.monitor('video', {
            debug: debug,
            beaconCollectionDomain: this.options.playbackStatsUrl?.replace('https://', ''), // 'https://' prepends mux by itself
            data: muxData,
            minimumRebufferDuration: 1000, // Only track rebuffers > 1000ms (less than this is not visible to user)
            sustainedRebufferThreshold: 2500, // Mark rebuffers > 2.5s as "sustained" ( = annoying for user)
        });
    }

    private devicePayload(): any {
        return {
            env_key: this.options.playbackStatsKey,
            viewer_user_id: this.user.user?.id,
            viewer_auth: this.user.user?.token || '',
            player_name: 'TV',
            app_version: this.options.version,
            device_family: this.options.device.family,
            device_model: this.options.device.model,
        }
    }

    private liveStreamPayload(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): any {
        return {
            video_id: playbackOptions.mediaId,
            video_title: playbackOptions.title,
            video_stream_type: 'LIVE_STREAM',
            video_timeline: 0,
            video_mime: 0
        }
    }

    private epgPayload(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): any {
        return {
            video_id: 0,
            video_title: playbackOptions.title,
            video_stream_type: 'EPG',
            video_channel: playbackOptions.channel || '',
            video_timeline: playbackOptions.chunkStart || 0,
            video_mime: 0
        }
    }

    private videoPayload(video: HTMLMediaElement, playbackOptions: VideoPlaybackOptions): any {
        return {
            video_id: playbackOptions.mediaId,
            video_title: playbackOptions.title,
            video_duration: playbackOptions.length ? playbackOptions.length * 1000 : 0,
            video_stream_type: 'VOD',
            video_channel: '',
            video_timeline: 0,
            video_mime: 0,
        }
    }
}

export default MuxStatistics;