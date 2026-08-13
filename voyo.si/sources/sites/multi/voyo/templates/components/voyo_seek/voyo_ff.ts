import template from './voyo_ff.html';
import VoyoSeekButton from './voyo_seek_button';

class VoyoFF extends VoyoSeekButton {
    protected key = 'ArrowRight' as const;
    protected template = template;

    // Default seek handler, can be overridden by registerSeekHandler.
    private seekHandler = (seconds: number) => app.voyoVideo.ffClick(seconds);

    registerSeekHandler(handler: (seconds: number) => void): void {
        this.seekHandler = handler;
    }

    protected seek(seconds: number): void {
        this.seekHandler(seconds);
    }
}

export default VoyoFF;
