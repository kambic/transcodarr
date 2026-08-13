import template from './voyo_timeline.html';

class VoyoTimeline extends HTMLElement {
    // If true, the timeline is disabled and cannot be interacted with. This can be set via setDisabled method
    // Used for ad skipping prevention in catchup.
    private disabled = false;

    private _startTime = 0;
    private _endTime = 0;
    private _currentTime = 0;

    private progressBarElement: HTMLInputElement|null = null;
    private currentTimeElement: HTMLElement|null = null;
    private durationElement: HTMLElement|null = null;

    // If false, the duration display will be hidden and replaced with '--:--'
    // Can be set via setDurationDisplay method
    private showDuration = true;
    private thumbnailListenersRegistered = false;

    // Default seek handler, can be overridden by registerSeekHandler.
    // We use a debounced version of this handler to avoid excessive seeking when dragging the timeline.
    private seekHandler = (time: number) => app.voyoVideo.setVideoPlayback(time);
    private debouncedSeek?: () => void;

    connectedCallback(): void {
        this.innerHTML = template;

        this.progressBarElement = this.querySelector('.timeline_progress');
        if (this.progressBarElement) {
            this.progressBarElement.disabled = this.disabled;
        }
        this.currentTimeElement = this.querySelector('.time_now');
        this.durationElement = this.querySelector('.duration');

        if (!this.debouncedSeek) {
            this.debouncedSeek = app.rateLimiter.debounce(this.seekFromInput, 100);
        }
        this.progressBarElement?.addEventListener('input', this.debouncedSeek);
        this.progressBarElement?.addEventListener('input', this.updateProgressFromInput);
    }

    disconnectedCallback(): void {
        if (this.debouncedSeek) {
            this.progressBarElement?.removeEventListener('input', this.debouncedSeek);
        }
        this.progressBarElement?.removeEventListener('input', this.updateProgressFromInput);
        if (this.thumbnailListenersRegistered) {
            this.progressBarElement?.removeEventListener('mousemove', this.showThumbnailFromPointer);
            this.progressBarElement?.removeEventListener('mouseleave', this.hideThumbnail);
        }
    }

    getProgressBarElement(): HTMLInputElement|null {
        return this.progressBarElement;
    }

    setDisabled(disabled: boolean): void {
        if (this.progressBarElement) {
            this.progressBarElement.disabled = disabled;
        }
        this.disabled = disabled;
    }

    setDurationDisplay(show: boolean): void {
        if (!this.durationElement) {
            return;
        }

        this.showDuration = show;
        this.durationElement.textContent = show ? this.formatTime(this._endTime) : '--:--';
    }

    registerThumbnailPreview(): void {
        this.progressBarElement?.addEventListener('mousemove', this.showThumbnailFromPointer);
        this.progressBarElement?.addEventListener('mouseleave', this.hideThumbnail);
        this.thumbnailListenersRegistered = true;
    }

    registerSeekHandler(handler: (time: number) => void): void {
        this.seekHandler = handler;
    }

    setRange(startTime: number, currentTime: number, endTime: number): void {
        this._startTime = this.normaliseTime(startTime);
        this._endTime = Math.max(this._startTime, this.normaliseTime(endTime));
        this._currentTime = Math.max(
            this._startTime,
            Math.min(this.normaliseTime(currentTime), this._endTime)
        );

        this.render();
    }

    private render(): void {
        if (!this.progressBarElement || !this.currentTimeElement || !this.durationElement) {
            return;
        }

        const range = this._endTime - this._startTime;
        const progress = range > 0
            ? (this._currentTime - this._startTime) / range
            : 0;

        this.progressBarElement.min = String(this._startTime);
        this.progressBarElement.max = String(this._endTime);
        this.progressBarElement.value = String(this._currentTime);

        this.progressBarElement.style.setProperty(
            '--timeline-percent',
            `${progress * 100}%`
        );

        this.currentTimeElement.textContent = this.formatTime(this._currentTime);

        if (this.showDuration) {
            this.durationElement.textContent = this.formatTime(this._endTime);
        }
    }

    private normaliseTime(value: number): number {
        return Math.max(0, value) || 0;
    }

    private formatTime(value: number): string {
        const time = Math.floor(value);
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        if (hours > 0) {
            return hours + ':' + this.pad2(minutes) + ':' + this.pad2(seconds);
        }

        return this.pad2(minutes) + ':' + this.pad2(seconds);
    }

    private pad2(n: number): string {
        return ('0' + n).slice(-2);
    } 

    // This handles click and dragging of the timeline progress bar.
    private seekFromInput = (): void => {
        if (this.disabled || !this.progressBarElement) {
            return;
        }

        const timelineTime = Number(this.progressBarElement.value);
        this.seekHandler(timelineTime);
    };

    // This handles updating the progress bar and current time display when the user is dragging the timeline progress bar.
    // So we give immediate feedback to the user, even if the actual seek is throttled.
    private updateProgressFromInput = (): void => {
        if (this.disabled || !this.progressBarElement || !this.currentTimeElement) {
            return;
        }

        const time = Number(this.progressBarElement.value);
        const range = this._endTime - this._startTime;

        const progress = range > 0
            ? (time - this._startTime) / range
            : 0;

        this.progressBarElement.style.setProperty('--timeline-percent', progress * 100 + '%');

        this.currentTimeElement.textContent = this.formatTime(time);
    };

    private showThumbnailFromPointer = (event: MouseEvent): void => {
        if (!this.progressBarElement) {
            return;
        }
    
        const bounds = this.progressBarElement.getBoundingClientRect();
        const styles = getComputedStyle(this.progressBarElement);
        const thumbWidth =
            Number.parseFloat(styles.getPropertyValue('--timeline-thumb-width')) || 16;
    
        const trackStart = bounds.left + thumbWidth / 2;
        const trackWidth = bounds.width - thumbWidth;
    
        const progress = Math.max(
            0,
            Math.min((event.clientX - trackStart) / trackWidth, 1)
        );
    
        const time =
            this._startTime +
            (this._endTime - this._startTime) * progress;

        const percentage = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width) / bounds.width;
    
        app.voyoVideo.showThumbnailPreview(Math.round(time), percentage);
    };

    private hideThumbnail = (): void => {
        app.voyoVideo.hideThumbnailPreview();
    };
}

export default VoyoTimeline;
