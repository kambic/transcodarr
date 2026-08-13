import VoyoAppOptions from "../app/options";
import VideoUrlModel from "@core/model/video_url";
import EpgHlsUrlModel from "@core/model/epg_hls_url";
import { isSafary } from "@core/libs/util";

class ShakaPlayer {
    private fpLicenseServerUrl: string = '';
    private fpCertificateUrl: string = ''
    private wvLicenseServerUrl: string = '';

    private fairplayAssetId = '';
    private fpCertificate: Uint8Array | null = null;
    
    private player: any = null;

    constructor(protected options: VoyoAppOptions) {
        const fpLicenseUrl = this.options.fpLicenseServerUrl;
        this.fpLicenseServerUrl = fpLicenseUrl ? fpLicenseUrl + '/fps/rest/getLicense' : '';
        this.fpCertificateUrl = fpLicenseUrl ? fpLicenseUrl + '/fps-pub.der' : '';
        this.wvLicenseServerUrl = this.options.wvLicenseServerUrl || '';

        if (typeof shaka === 'undefined') {
            console.error('Shaka player not loaded');
            return;
        }

        shaka.polyfill.installAll();

        if (!shaka.Player.isBrowserSupported()) {
            console.error('Shaka player is not supported by this browser');
        }
    }

    liveSeekEnd(): number | null {
        if (!this.player) {
            return null;
        }

        const range = this.player.seekRange();
        if (!range || !isFinite(range.end) || range.end <= range.start) {
            return null;
        }

        return range.end;
    }

    async initPlayer(video: HTMLMediaElement, videoUrl: VideoUrlModel | EpgHlsUrlModel, startAt?: number): Promise<any> {
        await this.destroy();

        this.player = new shaka.Player();
        await this.player.attach(video);

        this.player.addEventListener('error', (event: any) => this.onError(event.detail));

        if (this.isDrm(videoUrl)) {
            if (isSafary()) {
                await this.configureFairplay(videoUrl);
            } else {
                this.configureWidevine(videoUrl);
            }
        }

        try {
            await this.player.load(videoUrl.url, startAt);
        } catch (err) {
            await this.destroy();
            throw err;
        }
        
        return this.player;
    }

    async destroy(): Promise<void> {
        if (this.player) {
            const player = this.player;
            this.player = null;
            await player.destroy();
        }
    }

    private isDrm(videoUrl: VideoUrlModel | EpgHlsUrlModel): boolean {
        return !!videoUrl.license;
    }

    private isLicense(type: any) {
        return type === shaka.net.NetworkingEngine.RequestType.LICENSE;
    }

    private configureWidevine(videoUrl: VideoUrlModel | EpgHlsUrlModel): void {
        this.player.configure({
            drm: {
                servers: {
                    'com.widevine.alpha': this.wvLicenseServerUrl
                },
                advanced: {
                    'com.widevine.alpha': {
                        'headers': {
                            'X-Drm-Message': videoUrl.url
                        }
                    }
                }
            }
        });
    }

    private async loadFpCertificate(): Promise<Uint8Array | null> {
        if (this.fpCertificate) {
            return this.fpCertificate;
        }

        try {
            const res = await fetch(this.fpCertificateUrl);
            if (!res.ok) {
                throw new Error('HTTP ' + res.status);
            }
            this.fpCertificate = new Uint8Array(await res.arrayBuffer());
            return this.fpCertificate;
        } catch (err) {
            console.warn('FairPlay certificate load failed', err);
            return null;
        }
    }

    private async configureFairplay(videoUrl: VideoUrlModel | EpgHlsUrlModel): Promise<void> {
        const certificate = await this.loadFpCertificate();

        this.player.configure({
            drm: {
                servers: {
                    'com.apple.fps': this.fpLicenseServerUrl,
                    'com.apple.fps.1_0': this.fpLicenseServerUrl
                },
                advanced: {
                    'com.apple.fps': {
                        serverCertificate: certificate || undefined,
                        serverCertificateUri: this.fpCertificateUrl
                    },
                    'com.apple.fps.1_0': {
                        serverCertificate: certificate || undefined,
                        serverCertificateUri: this.fpCertificateUrl
                    }
                },
                initDataTransform: this.fairplayInitDataTransform.bind(this),
            }
        });

        const netEngine = this.player.getNetworkingEngine();
        netEngine.registerRequestFilter((type: any, request: any) => this.fairplayRequestFilter(type, request, videoUrl));
        netEngine.registerResponseFilter((type: any, response: any) => this.fairplayResponseFilter(type, response));
    }


    private fairplayRequestFilter(type: any, request: any, videoUrl: VideoUrlModel | EpgHlsUrlModel): void {
        if (!this.isLicense(type)) {
            return;
        }

        const spc = shaka.util.Uint8ArrayUtils.toStandardBase64(new Uint8Array(request.body));
        const assetId = encodeURIComponent(this.resolveFairplayAssetId(request));

        request.headers['Content-Type'] = 'application/json';
        request.headers['Authorization'] = videoUrl.license;
        request.body = shaka.util.StringUtils.toUTF8(JSON.stringify({ spc, assetId }));
    }

    private fairplayResponseFilter(type: any, response: any): void {
        if (!this.isLicense(type)) {
            return;
        }

        let text = shaka.util.StringUtils.fromUTF8(response.data).trim();

        if (text.slice(0, 5) === '<ckc>' && text.slice(-6) === '</ckc>') {
            text = text.slice(5, -6);
        } else if (text.startsWith('{')) {
            try {
                const parsed = JSON.parse(text);
                text = parsed.ckc || parsed.Ckc || parsed.license || text;
            } catch { /* keep text as-is */ }
        }

        response.data = shaka.util.Uint8ArrayUtils.fromBase64(text).buffer;
    }

    private fairplayInitDataTransform(initData: Uint8Array, initDataType: string, drmInfo: any): Uint8Array {
        if (initDataType !== 'skd') {
            return initData;
        }

        try {
            this.fairplayAssetId = shaka.drm.FairPlay.defaultGetContentId(initData) || this.fairplayAssetId;
        } catch { /* keep previous asset id */ }

        // Same check Shaka's own default initDataTransform uses internally.
        const usingApplePolyfill = (window as any).shakaMediaKeysPolyfill === 'apple';
        if (!usingApplePolyfill) {
            return initData;
        }

        const cert = drmInfo && drmInfo.serverCertificate;
        if (!cert || !cert.byteLength) {
            throw new Error('FairPlay server certificate required before initDataTransform');
        }

        return shaka.drm.FairPlay.initDataTransform(initData, this.fairplayAssetId, cert);
    }

    private resolveFairplayAssetId(request: any): string {
        try {
            if (request.initData && request.initData.byteLength) {
                const fromSkd = shaka.drm.FairPlay.defaultGetContentId(request.initData);
                if (fromSkd) {
                    return fromSkd;
                }
            }
        } catch { /* fall through */ }

        return this.fairplayAssetId;
    }

    
    private onError(error: any) {
        // Native error is caught by video onerror, do nothing here
        if (error instanceof Error) {
            return;
        }

        if (error.severity === shaka.util.Error.Severity.CRITICAL) {
            console.error(`Player error - ${error.category} - ${error.code}`)
        }
    }
}

export default ShakaPlayer;
