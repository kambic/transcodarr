import AppOptions from "../app/options";
import Html from "./html";

export class ObserverItem {
    element: HTMLElement;
    task?: string;
    params?: any;
    isVisible?: boolean|null;
}

class Observer {
    private observer: IntersectionObserver;
    private items: Array<ObserverItem> = [];

    constructor(
        private html: Html,
        private options: AppOptions
    ) { 
        this.observer = new IntersectionObserver(this.callback.bind(this), {threshold: 0});
    }

    init(observerParams?: IntersectionObserverInit): void {
        if (observerParams) {
            this.observer?.disconnect();
            this.observer = new IntersectionObserver(this.callback.bind(this), observerParams);
        }

        const elements = this.html.qAll('[inview]');

        if (!elements.length) {
            return;
        }

        elements.forEach(e => this.observe(e));
    }

    observe(selector: string | HTMLElement, options: { task: string, params: any } | null = null): void {
        const e = this.html.q(selector);

        if (!e || !this.observer) {
            return;
        }

        if (!options) {
            // 'task' is what html element has in inview attribute:
            // <div inview="task|jsonparam"></div>
            const attr   = e.attributes.getNamedItem('inview')?.value || '?';
            const params = attr.includes('|') ? attr.substring(attr.indexOf('|') + 1) : '{}';
            const task   = attr.includes('|') ? attr.substring(0, attr.indexOf('|'))  : attr;

            options = { task, params: JSON.parse(params) };
        }

        this.items.push({ element: e, task: options.task, params: options.params, isVisible: null });
        this.observer.observe(e);
    }

    private callback(entries: Array<IntersectionObserverEntry>, observer: IntersectionObserver): void {
        entries.forEach(entry => {

            const item = this.items.find(i => i.element === entry.target);

            if (!item || !item.task) {
                this.stopObserving({element: entry.target as HTMLElement});
                return;
            }

            // if we're tracking this item only when it's visible and
            // not when it's hiding, we can return here.
            if (item.params?.tracking !== 'both' && !entry.isIntersecting) {
                return;
            }
            // if we're tracking visible and hidden states, we'll
            // start calling event after element is visible the first time.
            if (item.params?.tracking === 'both' && item.isVisible === null && !entry.isIntersecting) {
                return;
            }

            item.isVisible = entry.isIntersecting;

            switch (item.task) {
                case 'playVideo':
                    const video = item.params.video || null;
                    const options = item.params.options || {};
                    const divId = item.element.id || ('video_' + video.Id);
                    (<any>window).app.video.play('#' + divId, video, options);
                    break;
                case 'instagram':
                    (<any>window).app.gadgets.instagram();
                    break;
                case 'loadComments':
                    (<any>window).app.comments.loadMore();
                    break;
                case 'mountSplide':
                    item.params.splide.mount();
                    break;
                case 'randomPrArticles':
                    const nb = item.params?.nb || 6;
                    (<any>window).app.banners.showRandomPrArticles(item.element, nb);
                    break;
                case 'pip':
                    if (entry.isIntersecting) {
                        (<any>window).app.html.addClass(item.params.selector || '', item.params.ifVisible || '');
                        (<any>window).app.html.removeClass(item.params.selector || '', item.params.ifHidden || '');
                    } else {
                        (<any>window).app.html.addClass(item.params.selector || '', item.params.ifHidden || '');
                        (<any>window).app.html.removeClass(item.params.selector || '', item.params.ifVisible || '');
                    }
                    break;
                case 'animalBodyParts':
                    const area1 = (<any>window).app.html.q('.onl-svinjina AREA') as HTMLElement;
                    area1.click();
                    const area2 = (<any>window).app.html.q('.onl-govedina AREA') as HTMLElement;
                    area2.click();
                    break;
                default:
                    const fn = (<any>window)[item.task];

                    if (typeof fn === 'function') {
                        fn(item);
                    } else {
                        console.log('Observer: unknown task: ', item.task);
                    }
            }

            /**
             * If event is not permanent, we can fire it only once. After
             * it has been run, remove it from list of observables.
             * Permanent events are those that are tracked when they
             * are visible or hidden
             */
            const isPermanentEvent = item.params?.tracking === 'both';
            if (!isPermanentEvent) {
                this.stopObserving(item);
            }
        })
    }

    isVisible(selector: string): boolean {
        const e = this.html.q(selector);
        if (!e) {
            return false;
        }

        const item = this.items.find(i => i.element === e);
        if (!item) {
            return false;
        }

        return item.isVisible || false;
    }

    private stopObserving(item: ObserverItem): void {
        this.observer.unobserve(item.element);
        this.items = this.items.filter(i => item);
    }
}

export default Observer;