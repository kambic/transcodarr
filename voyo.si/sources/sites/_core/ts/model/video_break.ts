class VideoBreakModel {
    from: number;
    to: number;
    seen: boolean;

    private timer: any = null;

    constructor(data: any) {
        this.from = data['from'] || 0;
        this.to = data['to'] || 0;
        this.seen = data['seen'] || false;
    }

    setSeen(): void {
        if (this.timer) {
            return;
        }
        this.timer = setTimeout(() => { this.seen = true; }, 1000);
    }
}

export default VideoBreakModel;
