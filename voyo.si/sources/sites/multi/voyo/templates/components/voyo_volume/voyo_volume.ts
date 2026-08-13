import template from './voyo_volume.html';

// Volume control for the video player: mute button + slider.
// Selected volume is stored in user options.
class VoyoVolume extends HTMLElement {

    connectedCallback(): void {
        this.innerHTML = template;

        this.querySelector('.volume__button')?.addEventListener('click', event => this.muteUnmute(event));
        this.querySelector('.volume__slider')?.addEventListener('input', event => this.setVolume(event));
    }

    muteUnmute(event: Event): void {
        config.videoVolume = app.voyoVideo.muteUnmuteVolume(event);
        app.saveUserOptions();
    }

    setVolume(event: Event): void {
        const volume = +(event.target as HTMLInputElement).value;

        app.voyoVideo.setVolume(volume);

        config.videoVolume = volume;
        app.saveUserOptions();
    }
}

export default VoyoVolume;
