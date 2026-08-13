import template from './voyo_subtitles.html';

class VoyoSubtitles extends HTMLElement {

    connectedCallback(): void {
        this.innerHTML = template
            .replace('<slot></slot>', () => this.innerHTML);

        this.querySelectorAll('.subtitles__list').forEach(item =>
            item.addEventListener('click', () => this.toggleSubtitle(item.id)));
    }

    toggleSubtitle(subtitleId: string): void {
        config.showSubtitles = app.voyoVideo.toggleVideoSubtitle(subtitleId);
        app.saveUserOptions();
    }
}

export default VoyoSubtitles;
