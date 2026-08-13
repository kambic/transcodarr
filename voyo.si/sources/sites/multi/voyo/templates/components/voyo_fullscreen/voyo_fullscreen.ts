import template from './voyo_fullscreen.html';

class VoyoFullscreen extends HTMLElement {

    connectedCallback(): void {
        this.innerHTML = template;

        const target = this.getAttribute('target') || undefined;
        this.querySelector('button')?.addEventListener('click', event => app.voyoVideo.toggleFullscreen(event, target));
    }
}

export default VoyoFullscreen;
