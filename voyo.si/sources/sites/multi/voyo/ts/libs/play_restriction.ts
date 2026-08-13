import Html from "@core/libs/html";
import VoyoAppOptions from "../app/options";

class PlayRestriction {
    constructor(
        protected html: Html,
        protected options: VoyoAppOptions
    ) {
    }

    restrictAppPlayback(): boolean {
        const isApp = this.options.device.os === 'android' || this.options.device.os === 'ios';

        if (isApp) {
            window.location.replace(this.options.routes.play_mobile_restriction);
            return true;
        }

        return false;
    }
}

export default PlayRestriction;
