import AppOptions from '@core/app/options';
import Cookies from '@core/libs/cookies';
import Html from '@core/libs/html';
import UserWithLogin from './user_login';
import OnlWebsocket from '@core/libs/websocket';
import WsMessage from '@core/model/ws_message';
import VoyoStbAppOptions from '../app/options';

class OnlVoyoWebsocket extends OnlWebsocket {

    constructor(
        protected html: Html,
        protected user: UserWithLogin,
        protected cookies: Cookies,
        protected options: VoyoStbAppOptions
    ) {
        super(html, user, cookies, options);
    }

    protected process(data: WsMessage): void {
        if (data.type === 'device') {
            this.processDevice(data);
        } else {
            super.process(data);
        }
    }

    private processDevice(data: WsMessage): void {
        console.log('[ws] Got device msg!', data);

        switch (data.payload['message']) {
            case 'connected':
                this.processConnected(data); break;
            case 'logout':
                this.processLogout(data); break;
            case 'subscription_updated':
                this.processSubscriptionUpdated(data); break;
        }
    }

    // Silently refresh user's JWT because his subscription changed
    private processSubscriptionUpdated(data: WsMessage): void {
        console.log('[ws] Got update subs msg!', data);

        this.user.loadUserInfo()
            .then(() => { console.log('User info refreshed'); })
            .catch(err => { console.log('User info refresh error', err); });
    }

    private processLogout(data: WsMessage): void {
        this.user.logoutUser()
            .then(() => {
                window.location.href = '/';
            });
    }

    private processConnected(data: WsMessage): void {
        console.log('[ws] Got connected msg!', data);

        const deviceName = this.options.device.name;
        const deviceFamily = this.options.device.family;

        this.user.loginWithDevice(deviceName, deviceFamily)
            .then(user => {
                if (!user) {
                    return;
                }

                setTimeout(() => {
                    window.location.href = this.options.routes.profiles;
                }, 250);
            });
    }
}

export default OnlVoyoWebsocket;
