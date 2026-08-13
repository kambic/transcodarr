abstract class VoyoSeekButton extends HTMLElement {
    private player: HTMLElement | null = null;
    private repeatCount = 0;
    private throttledSeek?: () => void;

    protected abstract key: 'ArrowLeft' | 'ArrowRight';
    protected abstract template: string;
    protected abstract seek(seconds: number): void;

    connectedCallback(): void {
        this.innerHTML = this.template;

        this.querySelector('.button')?.addEventListener('click', () => this.seek(10));

        this.player = this.closest('.player');
        if (!this.player) {
            return;
        }

        this.player.tabIndex = 0;
        if (!this.throttledSeek) {
            this.throttledSeek = app.rateLimiter.throttle(this.seekFromKeyboard, 100);
        }
        this.player.addEventListener('keydown', this.onKeyDown);
        this.player.addEventListener('keyup', this.onKeyUp);
    }

    disconnectedCallback(): void {
        this.player?.removeEventListener('keydown', this.onKeyDown);
        this.player?.removeEventListener('keyup', this.onKeyUp);
        this.player = null;
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== this.key) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        if (event.repeat) {
            this.throttledSeek?.();
        } else {
            this.repeatCount = 0;
            this.seekFromKeyboard();
        }
    };

    private onKeyUp = (event: KeyboardEvent): void => {
        if (event.key === this.key) {
            this.repeatCount = 0;
        }
    };

    private seekFromKeyboard = (): void => {
        const seconds = Math.min(60, 10 + Math.floor(this.repeatCount / 5) * 10);
        this.repeatCount++;
        this.seek(seconds);
    };
}

export default VoyoSeekButton;
