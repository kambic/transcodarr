import template from './voyo_rev.html';
import VoyoSeekButton from './voyo_seek_button';

class VoyoRev extends VoyoSeekButton {
    protected key = 'ArrowLeft' as const;
    protected template = template;

    // Default seek handler, can be overridden by registerSeekHandler.
    private seekHandler = (seconds: number) => app.voyoVideo.revClick(seconds);

    registerSeekHandler(handler: (seconds: number) => void): void {
        this.seekHandler = handler;
    }
    protected seek(seconds: number): void {
        this.seekHandler(seconds);
    }
}

export default VoyoRev;
