import Cookies from "./cookies";
import CookieModel from "../model/cookie";

declare var window: any;

class CookiesDidomi extends Cookies {
    init(): void {
        window.didomiOnReady?.push((Didomi: any) => {
            this.parseDidomiUserStatus(Didomi.getUserStatus());
        });

        window.didomiEventListeners?.push({
            event: 'consent.changed',
            listener: () => this.parseDidomiUserStatus(window.Didomi.getUserStatus())
        });
    }

    private parseDidomiUserStatus(didomiUserStatus: any): void {
        var essentialPurposes = didomiUserStatus.purposes.essential as Array<string>;
        var enabledPurposes = didomiUserStatus.purposes.consent.enabled as Array<string>;
        var globalVendors = didomiUserStatus.vendors.global.enabled.map(String) as Array<string>;

        var allowedPurposes = (essentialPurposes.concat(enabledPurposes)).filter(ap =>
            ap === 'local' || ap === 'cookies' || ap === 'third').map(ap =>
            ap.replace('cookies', 'important')
        )

        this.cookies = new CookieModel(allowedPurposes.join(','), globalVendors)

        this.events.sendEvent('cookies', this.cookies);

        this.updateCookieClasses();
    }
}

export default CookiesDidomi;