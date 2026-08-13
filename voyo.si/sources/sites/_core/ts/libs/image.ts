import AppOptions from '../app/options';
import Html from './html';

declare var Splide: any;

class Image {

    constructor(
        private html: Html,
        private options: AppOptions
    ) { }

    renderGallery(galleryId: number, isRecipe = false): void {
        const thumbnails = new Splide('#gallery_' + galleryId + '_thumbnails', {
            fixedWidth: 100,
            gap: 10,
            rewind: true,
            pagination: false,
            isNavigation: true,
            arrows: false,
            breakpoints: {
                800: {
                    fixedWidth:60
                }
            }
        });

        const main = new Splide('#gallery_' + galleryId, {
            type: 'fade',
            rewind: true,
            pagination: false,
            arrows: true,
        });

        main.sync(thumbnails);
        main.mount();
        thumbnails.mount();

        main.on('click', (s: any) => {
            this.showFullscreenGallery(galleryId, s.index, isRecipe);
        });

        main.on('active', (s: any) => {
            const title = this.html.getData(s.slide, 'title');
            this.html.writeHTML('#gallery_' + galleryId + '_caption', title);
            this.html.writeHTML('#gallery_' + galleryId + '_index', s.index + 1);
        });

        main.on('move', () => {
            if (this.options.siteId === 30012) {
                (window as any).dm?.AjaxEvent('pageview');
            }
        });
    }

    renderFullscreenGallery(galleryId: number, index: number): void {
        const elThumbnails = this.html.q('#fullscreen_gallery_' + galleryId + '_thumbnails');
        const elMain = this.html.q('#fullscreen_gallery_' + galleryId);

        if (!elThumbnails || !elMain) {
            return;
        }

        this.html.openFullscreen();

        const thumbnails = new Splide(elThumbnails, {
            fixedWidth: 100,
            gap: 10,
            rewind: true,
            pagination: false,
            isNavigation: true,
            arrows: false,
            breakpoints: {
                800: {
                    fixedWidth:60
                }
            },
            start: index,
        });

        const main = new Splide(elMain, {
            type: 'fade',
            rewind: true,
            pagination: false,
            arrows: true,
            start: index,
        });

        main.on('active', (s: any) => {
            const title = this.html.getData(s.slide, 'title');
            this.html.writeHTML('#fullscreen_gallery_caption', title);
            this.html.writeHTML('#fullscreen_gallery_index', s.index + 1);
        });

        main.sync(thumbnails);
        main.mount();
        thumbnails.mount();

        main.on('move', () => {
            if (this.options.siteId === 30012) {
                (window as any).dm?.AjaxEvent('pageview');
            }
        });
    }

    showFullscreenArticleImage(imageId: number, link: string, e: Event): void {
        link ?
            window.open(link):
            this.showFullscreenImage('/articles/' + this.options.articleId + '/images/' + imageId, e);
    }

    showFullscreenRecipeImage(imageId: number, link: string, e: Event): void {
        link ?
            window.open(link):
            this.showFullscreenImage('/recipes/' + this.options.recipeId + '/images/' + imageId, e);
    }

    showFullscreenImage(url: string, e: Event): void {
        this.html.writeHTML('#fullscreen_content', '');

        e?.stopPropagation();

        this.html.fetchText(url)
            .then(html => {
                if (!html) {
                    return;
                }

                this.html.openFullscreen();
                this.html.writeHTML('#fullscreen_content', html);
            });
    }

    private showFullscreenGallery(galleryId: number, index: number, isRecipe: boolean): void {
        const url = isRecipe ?
            '/recipes/' + this.options.recipeId + '/gallery/index/' + index :
            '/articles/' + this.options.articleId + '/galleries/' + galleryId + '/index/' + index;

        this.html.fetchText(url)
            .then(html => this.html.writeHTML('#fullscreen_content', html))
            .then(() => this.renderFullscreenGallery(galleryId, index));
    }
}

export default Image;
