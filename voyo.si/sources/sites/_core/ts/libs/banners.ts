import AppOptions from "../app/options";
import Cookies from "./cookies";
import Observer from "./observer";
import Html from "./html";

declare var window: any;

class Banners {

    commentsObserver: any;

    commentsActiveSlots: { [key: string]: { slot: any; slotId: string } | null } = {
        '/23086084073/D_in_comments': null,
        '/23086084073/D_in_comments_1': null,
        '/23086084073/M_in_comments': null,
        '/23086084073/M_in_comments_1': null
    };
      
    commentsSlotPrefixMap = [
         { 
              prefix: 'div-gpt-ad-1750238051488-', 
              slotName: '/23086084073/D_in_comments', 
              dims: [[1,1],[728,90]], 
              isMobile: false 
         },
         { 
              prefix: 'div-gpt-ad-1750928140596-', 
              slotName: '/23086084073/D_in_comments_1', 
              dims: [[1,1],[728,90]], 
              isMobile: false 
         },
         { 
              prefix: 'div-gpt-ad-1750238123145-', 
              slotName: '/23086084073/M_in_comments', 
              dims: [[1,1],[300,250]], 
              isMobile: true 
         },
         { 
              prefix: 'div-gpt-ad-1750928212141-', 
              slotName: '/23086084073/M_in_comments_1', 
              dims: [[1,1],[300,250]], 
              isMobile: true 
         }
    ];

    constructor(
        protected cookies: Cookies,
        protected html: Html,
        protected observer: Observer,
        protected options: AppOptions
    ) {}

    init(): void {

    }

    comments(): void {
        if (this.commentsObserver) {
            this.commentsObserver.disconnect();
        }

        this.commentsObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }

                const adEl = entry.target.querySelector('[id^="div-gpt-ad-"]');

                if (!adEl) {
                    return;
                }

                const elId = adEl.id;

                const found = this.commentsSlotPrefixMap.find(item => elId.startsWith(item.prefix) && item.isMobile === this.options.isMobile);

                if (!found) {
                    return;
                }

                const slotName = found.slotName;
                const activeSlotData = this.commentsActiveSlots[slotName];

                if (activeSlotData && activeSlotData.slotId === elId) {
                    return;
                }
                
                window.googletag.cmd.push(() => {
                    if (activeSlotData && activeSlotData.slot) {
                        window.googletag.destroySlots([activeSlotData.slot]);
                    }

                    const existing = window.googletag.pubads().getSlots().find((slot: any) => slot.getSlotElementId() === elId);

                    if (existing) {
                        this.commentsActiveSlots[slotName] = { slot: existing, slotId: elId };
                        window.googletag.pubads().refresh([existing]);

                        return;
                    }

                    const slot = window.googletag.defineSlot(slotName, found.dims, elId).addService(window.googletag.pubads());

                    this.commentsActiveSlots[slotName] = { slot, slotId: elId };

                    window.pbjs.que.push(() => {
                        window.pbjs.rp.requestBids({
                            callback: () => {
                                window.googletag.cmd.push(() => {
                                    window.googletag.display(elId);
                                    window.googletag.pubads().refresh([slot]);
                                });
                            },
                            gptSlotObjects: [slot]
                        });
                    });
                });
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '300px 0px'
        });

        const inCommentBannerEls = this.html.qAll('.banner.comment-ad');
        inCommentBannerEls.forEach(el => this.commentsObserver.observe(el));
    }

    // Removes 'hidden' class to n random divs inside given element.
    // Needed for displaying random PR articles.
    showRandomPrArticles(selector: string, nb: number): void {
        const children = this.html.q(selector)?.childNodes || [];
        const nbChildren = children.length;

        let selected: Array<number> = [];

        while (selected.length < nb && selected.length < nbChildren) {
            const rnd = Math.floor(Math.random() * nbChildren);
            if (!selected.includes(rnd)) {
                selected.push(rnd);
            }
        }

        (children as HTMLElement[]).forEach((prArticle: HTMLElement, i: number) => {
            if (selected.includes(i)) {
                this.html.removeClass(prArticle, 'hidden');
            };
        });
    }

    async getPreOrPostRoll(type: string): Promise<string> {
        let url = '';

        if (type === 'postroll') {
            url = (this.options.isMobile ? this.options.ads?.mobilePostrollUrl : this.options.ads?.postrollUrl) || '';
        } else if (type === 'preroll') {
            url = (this.options.isMobile ? this.options.ads?.mobilePrerollUrl : this.options.ads?.prerollUrl) || '';
        }

        let npa = true;

        const status = window?.Didomi?.getCurrentUserStatus();

        if (status && status.purposes) {
            npa = !status.purposes.select_personalized_ads?.enabled;
        }

        return url + (npa ? '&npa=1' : '&npa=0');
    }
}

export default Banners;