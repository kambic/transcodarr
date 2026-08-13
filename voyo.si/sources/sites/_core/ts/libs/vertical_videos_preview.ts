import Html from './html';

class VerticalVideoPreview {
    private timer: number = 0;

    constructor(
        private html: Html,
    ) {}

    handleMouseEnter(wrapper: HTMLElement): void {
        const video = this.html.q('video', wrapper) as HTMLVideoElement;
        if (!video) {
            return;
        }

        this.timer = window.setTimeout(() => {
            const videoData = JSON.parse(this.html.getData(wrapper, 'video'));
            if (videoData && videoData.TeaserFileUrl) {
                video.src = videoData.TeaserFileUrl;
                this.playVideo(video);
            }
        }, 500);
    }

    handleMouseLeave(wrapper: HTMLElement): void {
        window.clearTimeout(this.timer);
        
        const video = this.html.q('video', wrapper) as HTMLVideoElement;
        if (!video) {
            return;
        }
        
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.classList.remove('!opacity-100');
    }

    private playVideo(video: HTMLVideoElement): void {
        video.play().catch(e => {});
        this.html.addClass(video, '!opacity-100');
    }

}

export default VerticalVideoPreview;