import AppOptions from "../app/options";
import WsMessage from "../model/ws_message";
import Cookies from "./cookies";
import Html from "./html";
import User from "./user";

declare var twttr: any;

class OnlWebsocket {

    websocket: WebSocket | null = null;

    constructor(
        protected html: Html,
        protected user: User,
        protected cookies: Cookies,
        protected options: AppOptions
    ) {}

    init(): void {
        if (!this.options.websocketUrl || typeof (WebSocket) === 'undefined') {
            return;
        }

        let url = this.options.websocketUrl +
            '/go-sites/' + this.options.siteId +
            '/devices/' + this.user.deviceId;

        if (this.user.user?.id) {
            url += '?v=' + this.user.user?.id;
        }

        this.websocket = new WebSocket(url);

        this.websocket.onmessage = (event: MessageEvent) => {
            const data = this.parse(event.data);

            if (!data) {
                return;
            }

            this.process(data);
        };

        this.websocket.onclose = (event: CloseEvent) => {
            if (event.wasClean) {
                console.log('[ws] Connection closed cleanly, code', event.code, 'reason', event.reason);
            } else {
                console.log('[ws] Connection died', event);
            }
        };

        this.websocket.onerror = (error: Event) => {
            console.log('[ws] error', error);
        };
    }

    private parse(payload: string): any {
        try {
            return JSON.parse(payload);
        } catch {
            console.log('[ws] cannot parse payload:', payload);
            return null;
        }
    }

    protected process(data: WsMessage): void {
        switch (data.type) {
            case 'welcome':
                this.processWelcome(data); break;
            case 'article':
                this.processArticle(data); break;
            case 'front':
                this.processBreakingNews(data); break;
            default:
                console.log('[ws] uknown type', data.type);
        }
    }

    private processWelcome(data: WsMessage): void {
        console.log('[ws] Got welcome msg!', data.time);
    }

    private processBreakingNews(data: WsMessage): void {
        console.log('[ws] Got breaking news msg!', data.time);

        const html = data.payload.html;
        const deleted = data.payload.deleted;
        const articleId = data.payload.articleId;
        const e = this.html.q('#breaking_news_placeholder');

        if (!e) {
            return;
        }

        if (deleted) {
            this.html.hide(e);
        } else {
            this.html.writeHTML(e, html);
            this.showBreakingNewsIfNotClosed(articleId.toString())
        }
    }

    private processArticle(data: WsMessage): void {
        console.log('[ws] Got article msg!', data.time, data.payload);

        const articleId = data.payload.articleId;
        const deleted = data.payload.deleted;
        const html = data.payload.html as string;
        const feedId = '#feed_' + data.payload.time;

        if (articleId !== this.options.articleId) {
            return;
        }

        if (deleted) {
            this.html.hide(feedId);
            return;
        }

        const e = this.html.q(feedId);

        e ?
            this.html.writeHTML(e, html) :
            this.html.prependHTML('.feed_list', html);

        // Video and embed messages have also javscript code inside html.
        this.html.execHtmlScript(feedId, true);

        // Twitter widget needs to be loaded or else we only have text version
        if (html.includes('twitter.com') || html.includes('.x.com')) {
            setTimeout(() => {
                this.cookies.updateCookieClasses()
                twttr?.widgets?.load();
            }, 200);
        }
    }

    closeBreakingNews(id: string): void {
        this.cookies.set('closeBreakingNews', id);
        this.html.hide('.breaking_news');
    }

    showBreakingNewsIfNotClosed(id: string): void {
        const closedId = this.cookies.get('closeBreakingNews');

        if (!closedId || closedId !== id) {
            this.html.show('.breaking_news');
            return;
        }
    }
}

export default OnlWebsocket;