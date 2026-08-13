import template from './voyo_close.html';

class VoyoClose extends HTMLElement {

    connectedCallback(): void {
        this.innerHTML = template;

        this.querySelector('a')?.setAttribute('href', this.getAttribute('href') || '#');

        // Extra host classes (e.g. z-100 on the stream player) belong to the
        // positioned .player__close span.
        if (this.className) {
            this.querySelector('span')?.classList.add(...Array.from(this.classList));
        }
    }
}

export default VoyoClose;
