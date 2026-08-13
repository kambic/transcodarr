import Events from "./events";
import Html from "./html";
import CookieModel from "../model/cookie";
import AppOptions from "../app/options";

class Cookies {
    cookies: CookieModel;

    constructor(
        protected html: Html,
        protected events: Events,
        protected options: AppOptions,
    ) {
    }

    init() {
        let cookieAccept = this.get('cookies_accept') || '';

        if (cookieAccept === 'all') {
            cookieAccept = 'local,important,third';
        }

        this.cookies = new CookieModel(cookieAccept)

        this.events.sendEvent('cookies', this.cookies);

        this.updateCookieClasses();
    }

    set(name: string, val: string, TTL: number = 31536000): void {
        const date = new Date();
        const value = val;
        const domain = this.getDomain();
        const secure = this.canUseSecure(domain) ? 'SameSite=None; Secure;' : 'SameSite=Lax;';

        date.setTime(date.getTime() + (TTL * 1000));

        document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/; " + secure + " domain=" + domain;
    }

    private canUseSecure(domain: string): boolean {
        // Setup boxes use very old chrome and it has problems with secure settings
        if (this.options.site?.includes('voyotvapp')) {
            return false;
        }

        // local development does not need secure cookies
        if (this.isLocalDev(domain)) {
            return false;
        }

        return true;
    }

    private isLocalDev(domain: string): boolean {
        return domain.startsWith('192.') || domain.startsWith('172.') || domain === 'localhost';
    }

    private getDomain(): string {
        let domain = document.location.hostname;

        if (this.isLocalDev(domain)) {
            return domain;
        }

        if (domain.split('.').length > 2) {
            domain = '.' + domain.split('.').slice(-2).join('.');
        }

        return domain;
    }

    setIfImportantAllowed(name: string, val: string): void {
        if (this.cookies?.isImportantAllowed()) {
            this.set(name, val);
        }
    }

    get(name: string, def: string | null = null): string | null {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");

        if (parts.length >= 2) {
            return parts.pop()?.split(";").shift() || def;
        }

        return def;
    }

    getFloat(name: string, def: number | null = null): number | null {
        const val = this.get(name);
        return val ? parseFloat(val) : def;
    }

    delete(name: string): void {
        const date = new Date();
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

        // delete without domain set
        document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/";

        // delete with domain set to current domain
        let domain = document.location.hostname;
        document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/; domain=" + domain;

        // delete with domain set to tld
        domain = this.getDomain();
        document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/; domain=" + domain;
    }

    updateCookieClasses(): void {
        if (this.cookies.isThirdAllowed()) {
            this.html.show('.if-cookies-third');
            this.html.hide('.if-cookies-no-third');
        } else {
            this.html.hide('.if-cookies-third');
            this.html.show('.if-cookies-no-third');
        }

        if (this.cookies.isImportantAllowed()) {
            this.html.show('.if-cookies-important');
            this.html.hide('.if-cookies-no-important');
        } else {
            this.html.hide('.if-cookies-important');
            this.html.show('.if-cookies-no-important');
        }
    }
}

export default Cookies;