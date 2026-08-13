import template from './voyo_play.html';
import overlayTemplate from './voyo_play_overlay.html';

class VoyoPlay extends HTMLElement {
    protected template = template;
    protected canRegisterEvents = true;
    private player: HTMLElement|null = null;

    connectedCallback(): void {
        this.innerHTML = this.template;

        if (!this.canRegisterEvents) {
            return;
        }

        this.player = this.closest('.player');
        if (this.player) {
            this.player.tabIndex = 0;
        }
        this.player?.addEventListener('keydown', this.onKeyDown);
    }

    disconnectedCallback(): void {
        this.player?.removeEventListener('keydown', this.onKeyDown);
        this.player = null;
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        if (event.code !== 'Space' || event.repeat) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        
        app.voyoVideo.showVideoControls();
        app.voyoVideo.playClick();
    };
}

class VoyoPlayOverlay extends VoyoPlay {
    protected template = overlayTemplate;
    protected canRegisterEvents = false;
}

export { VoyoPlay, VoyoPlayOverlay };
