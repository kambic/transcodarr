import template from './voyo_live.html';

class VoyoLive extends HTMLElement {
    connectedCallback(): void {
        this.innerHTML = template;

        this.querySelector('.button')?.addEventListener('click', () => app.voyoVideo.setVideoPlayback('end'));
    }
}

export default VoyoLive;
