import {VoyoPlay, VoyoPlayOverlay} from '../../templates/components/voyo_play/voyo_play';
import VoyoRev from '../../templates/components/voyo_seek/voyo_rev';
import VoyoFF from '../../templates/components/voyo_seek/voyo_ff';
import VoyoVolume from '../../templates/components/voyo_volume/voyo_volume';
import VoyoTimeline from '../../templates/components/voyo_timeline/voyo_timeline';
import VoyoSubtitles from '../../templates/components/voyo_subtitles/voyo_subtitles';
import VoyoFullscreen from '../../templates/components/voyo_fullscreen/voyo_fullscreen';
import VoyoClose from '../../templates/components/voyo_close/voyo_close';
import CodeInput from '../../templates/components/code_input/code_input';
import VoyoMailingUnsubscribe from '../../templates/components/voyo_mailing_unsubscribe/voyo_mailing_unsubscribe';
import SubmitButton from '../../templates/components/submit_button/submit_button';
import VoyoLive from '../../templates/components/voyo_seek/voyo_live';

// Registers custom elements only on routes whose pages render them,
// so e.g. the front page doesn't initialize any.
function initCustomComponents(): void {
    const path = document.location.pathname;

    // Generic submit button, usable in any form - registered on all routes for now.
    customElements.define('submit-button', SubmitButton);

    // Player components: movie, category and stream pages all live under
    // /vsebina/ and the catch-up page lives under config.routes.catch_up
    if (path.includes(config.routes.content) || 
        path.startsWith(config.routes.catch_up) || 
        path.startsWith(config.routes.profile_5ka)) {
            
        customElements.define('voyo-play', VoyoPlay);
        customElements.define('voyo-play-overlay', VoyoPlayOverlay);
        customElements.define('voyo-rev', VoyoRev);
        customElements.define('voyo-ff', VoyoFF);
        customElements.define('voyo-live', VoyoLive);
        customElements.define('voyo-volume', VoyoVolume);
        customElements.define('voyo-timeline', VoyoTimeline);
        customElements.define('voyo-subtitles', VoyoSubtitles);
        customElements.define('voyo-fullscreen', VoyoFullscreen);
        customElements.define('voyo-close', VoyoClose);
    }

    // Login and registration pages: the code-input component is only used there
    if (path.startsWith(config.routes.login) || path.startsWith(config.routes.registration)) {
        customElements.define("code-input", CodeInput);
    }

    // Credit card activation (and its monthly/yearly/check sub-pages)
    if (
        path.startsWith(config.routes.activation_credit_card) ||
        path.startsWith(config.routes.activation_step3) ||
        path.startsWith(config.routes.activation_provider) ||
        path.startsWith(config.routes.activation_code) ||
        path.startsWith(config.routes.settings)
    ) {
        customElements.define('voyo-mailing-unsubscribe', VoyoMailingUnsubscribe);
    }
}

export default initCustomComponents;
