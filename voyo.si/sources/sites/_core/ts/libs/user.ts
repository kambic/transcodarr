import AppOptions from '../app/options';
import GQL from '../gql/gql';
import UserModel from '../model/user';
import Cookies from './cookies';
import Events from './events';
import Html from './html';
import { uuidv4 } from './uuid';

class User {

    public user: UserModel | null = null;
    public deviceId: string | null = null;

    constructor(
        protected events: Events,
        protected cookies: Cookies,
        protected gql: GQL,
        protected html: Html,
        protected options: AppOptions
    ) { }

    handleDeviceId(): void {
        this.deviceId = this.cookies.get('device-id');

        if (!this.deviceId) {
            this.deviceId = uuidv4();
            this.cookies.set('device-id', this.deviceId || '');
        }

        this.gql.deviceId = this.deviceId || '';
    }

    get hasDeviceId(): boolean {
        return !!this.cookies.get('device-id');
    }

    get cacheBuster(): string {
        if (!this.user?.token) {
            return 'v=' + Math.random().toString() + '&t=' + (new Date).getTime();
        }
        return 'v=' + this.user.token.substring(this.user.token.length - 8) + '_' + Math.random().toString() + '&t=' + (new Date).getTime();
    }

    loadUserInfo(useGqlc = true): Promise<UserModel | null> {
        const jwt = this.cookies.get('sso_jwt');

        if (!jwt) {
            this.userLoaded(null);
            return Promise.resolve(null);
        }

        // Jwt is almost always correct - let's assume it
        // is and let's work with it like it's user's real
        // jwt. Maybe it has expired but that's really rare.
        // Maybe visitor has injected somebody else's jwt
        // but that's even more rare.
        // If loginInfo returns that jwt is bad, we'll
        // delete it then. But in the mean time it is user's
        // jwt for us.
        this.gql.authToken = jwt;

        return this.gql.loginInfo(jwt, this.options.siteId, useGqlc)
            .then(user => {
                // If request to loginInfo() failed because browser is moving to
                // another page (loginInfo xhr was canceled) we must NOT logout
                // user -  which we would because user object is null. It is
                // null because xhr was canceled, not because his login expired.
                if (!user && window.isPageUnloading) {
                    return Promise.reject('page_unloading');
                }

                return user;
            })
            .then(user => this.userLoaded(user))
            .catch(err => {
                if (err === 'page_unloading') {
                    return Promise.reject(err);
                }

                this.userLoaded(null);
                return Promise.reject(null);
            });
    }

    /**
     * Try to login user with cross-site check.
     * (check on prijava.24ur.com if user is logged-in there).
     */
    tryCrossLogin(): void {
        const src = this.html.getData('#sso_iframe', 'src');
        const iframe = this.html.q('#sso_iframe');

        if (!iframe || !src) {
            return;
        }

        this.events.onWindow('message', (e: MessageEvent) => {
            if (e.origin !== this.options.loginUrl) {
                return;
            }

            this.processCrossLoginMessage(e.data);

            if (e.data && e.data['jwt']) {
                this.loadUserInfo();
            }
        });

        (iframe as HTMLIFrameElement).src = src;
    }

    processCrossLoginMessage(data: any): void {
        if (data['deviceId'] && this.deviceId !== data['deviceId']) {
            this.deviceId = (data['deviceId'] || '') as string;
            this.cookies.set('device-id', this.deviceId);
            this.gql.deviceId = this.deviceId;
        }
        if (data['jwt']) {
            this.cookies.set('sso_jwt', data['jwt']);
        }
    }

    userLoaded(user: UserModel | null): UserModel | null {
        this.user = user;

        this.html.removeClass('body', 'user-unknown user-loggedin');

        if (user) {
            this.cookies.set('sso_jwt', user.token);
            this.gql.authToken = user.token;
            this.html.addClass('body', 'user-loggedin');

            this.events.sendEvent('user', this.user);
        } else {
            this.cookies.delete('sso_jwt');
            this.gql.authToken = '';
        }

        return user;
    }

    logout(path = '/odjava'): void {
        const jwt = this.cookies.get('sso_jwt') || '';

        this.userLoaded(null);
        this.goLogin(path, jwt);
    }

    goLogin(path = '/prijava', attachJWT = ''): void {
        const deviceId = this.cookies.get('device-id') || '';

        let url = this.options.loginUrl + path;
        url += '?c=' + (new Date().getTime()) + '_' + Math.random();
        url += '&from=' + encodeURIComponent(location.toString());
        url += '&device_id=' + encodeURIComponent(deviceId);

        if (attachJWT) {
            url += '&jwt=' + encodeURIComponent(attachJWT);
        }

        window.location.href = url;
    }

    submitMailing(form: HTMLFormElement, mailingId: number, sendUnsubscribeEmail: boolean): void {
        const email = this.html.q('input[type="email"]', form) as HTMLInputElement;
        if (!email) {
            return;
        }
        this.gql.registerEmailOnly(email.value, this.options.siteId, mailingId, sendUnsubscribeEmail)
            .then(r => this.afterRegisterEmailOnly(r, form))
            .catch(() => {
                this.html.show('#mailing_error', 'block', form);
            });
    }

    colorScheme(value: string): void {
        this.html.q('html')?.classList.remove('dark', 'light');
        this.html.q('html')?.classList.add(value);
        /*
        * Multiple colorScheme input switches cheboxes (mobile/desktop). 
        * Input switches need to have the same state if user swithing between desktop/mobile view
        */
        this.events.sendEvent('colorSchemeChange', value);

        if (value === this.options.colorScheme) {
            localStorage.removeItem('color_scheme');
            return;
        }

        localStorage.setItem('color_scheme', value);
    }

    private afterRegisterEmailOnly(r: any, form: HTMLFormElement): void {
        this.html.show('#mailing_success', 'flex', form.parentElement);
        this.html.hide(form);

        form.reset();
    }
}

export default User;
