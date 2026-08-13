import Html from './html';
import Video from './video';
import AppOptions from '../app/options';

class VerticalVideo {

    private p: number = 0;
    private isEnd: boolean = false;
    private isFetching: boolean = false;
    private route: string;

    constructor(
        private html: Html,
        private video: Video,
        options: AppOptions,
    ) {
        this.route = options.routes?.vertical_videos || '/kratek-video';
    }

    playSlide(slide: HTMLElement): void {
        const wrapper = this.html.q('[data-video]', slide);
        if (!wrapper) {
            return;
        }

        const videoData = JSON.parse(this.html.getData(wrapper, 'video'));
        const videoDiv = `#video-vertical-player-${videoData.Id}`;

        const options = {
            mute: false,
            autoplay: true,
            focus: false,
            loop: true,
            replaceUrl: true,
            showPoster: false
        };

        this.video.destroyPlayers();

        this.video
            .play(videoDiv, videoData, options)
            .catch(result => {
                console.log('Vertical videos', result?.err);

                // If user opened this video from shared url, than he has probably has
                // not interacted with webpage before and player.play() will not succeed.
                // It will throw error and we'll end up here in catch(). We'll try to
                // play video again, but this time with MUTED volume. Browsers normally
                // allow playing muted videos without user interaction.
                options.mute = true;
                return this.video.play(videoDiv, videoData, options);
            })
            .catch(result => {
                // If even mute did not help, let show poster image.
                this.showPlayerPoster(result?.player, videoData);
            });
    }

    private showPlayerPoster(player: any, videoData: any): void {
        if (!player || !player.poster || !videoData || !videoData.Image) {
            return;
        }

        player.poster(videoData.Image.Src.replace('PLACEHOLDER', '1100xX'));

        const div = this.html.q('.video-js');
        if (div) {
            div.style.setProperty('opacity', '1', 'important');
        }

        player.load();
    }

    handleArrows(index: number, allSlides: number): void {
        if (index > 0) {
            this.html.removeClass('.scroll-up-arrow', 'button-disabled');
        } else {
            this.html.addClass('.scroll-up-arrow', 'button-disabled');
        }

        if (index < allSlides - 1) {
            this.html.removeClass('.scroll-down-arrow', 'button-disabled');
        } else {
            this.html.addClass('.scroll-down-arrow', 'button-disabled');
        }
    }

     loadMoreSlides(excludeIds: number[]): Promise<Array<Element> | null> {
        if (this.isEnd || this.isFetching) {
            return Promise.resolve(null);
        }

        this.p += 1;
        this.isFetching = true;

        const url = this.route + '/?p=' + this.p + '&excludeIds=' + excludeIds.join(',');

        return this.html.fetchText(url)
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const newSlides = doc.querySelectorAll('.splide__slide');

                if (newSlides.length < 10) {
                    this.isEnd = true;
                }

                this.isFetching = false;

                return Array.from(newSlides);
            })
            .catch(e => {
                console.log('Error loading data from server', e);
                this.isFetching = false;
                return null;
            });
    }

}

export default VerticalVideo;
