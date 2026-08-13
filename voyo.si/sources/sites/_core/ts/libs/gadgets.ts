import Events from "./events";
import Html from "./html";
import Cookies from "./cookies";
import AppOptions from "../app/options";
import UserModel from "@core/model/user";

declare var Splide: any;
declare var L: any; // leaflet for openstreetmap integration

class Gadgets {

    // map for showing roads events on /novice/ceste page
    map: any;

    constructor(
        private html: Html,
        private events: Events,
        private cookies: Cookies,
        private options: AppOptions
    ) { }

    // Load splide js if we have any swipers on page.
    splideInit(): void {
        const splides = this.html.qAll('.splide');

        if (!splides.length) {
            return;
        }

        this.html
            .loadStyle('/assets/splidejs/splide.min.css?v=' + this.options.version)
            .then(() => this.html.loadScript('/assets/splidejs/splide.min.js?v=' + this.options.version))
            .then(() => this.events.sendEvent('splide-loaded', ''));
    }
    
    animalParts(animal: string, part: string, title: string, recipeId: number, articleId: number): void {
        const selector = '.onl-' + animal;

        const img = this.html.q(selector + ' .img-animal-parts') as HTMLImageElement;
        const src = img.src;
        img.src = src.substring(0, src.lastIndexOf('/')+1) + animal + '-' + part + '.png';

        this.html.removeClass(selector + ' BUTTON', 'tag--animal-active');
        this.html.addClass(selector + ' .btn-' + part, 'tag--animal-active');
        this.html.writeHTML(selector + ' .onl-recipe-title', title);

        this.html.fetchText(`/animal-part-recipe/${recipeId}/${articleId}`)
            .then(html => this.html.writeHTML(selector + ' .onl-recipe-placeholder', html));
    }

    bodyParts(gender: string, part: string, currentPart: string): void {
        let url = '/telo?gender=' + encodeURIComponent(gender);

        if (part && part !== currentPart) {
            url += '&body_part=' + encodeURIComponent(part)
        }

        location.href = url;
    }

    fillRefridgeratorSelect(e: HTMLSelectElement) {
        if (e.options.length > 1) {
            return;
        }

        this.html.fetchText('/recipes/main-ingredients')
            .then(mainIngredients => {
                const optionsHTML = JSON.parse(mainIngredients).map((ingredient:any) => {
                    return '<option value="' + ingredient.ItemId + '_' + ingredient.Name.replace('\"', '') + '">' + ingredient.Name + '</option>';
                }).join('');
                e.innerHTML += optionsHTML;
            });
    }

    itm(action: string): void {
        const cmVal = (this.html.q('#itm_height') as HTMLInputElement).value;
        const kgVal = (this.html.q('#itm_weight') as HTMLInputElement).value;

        const cm = parseInt(cmVal.replace(',', '.'), 10);
        const kg = parseInt(kgVal.replace(',', '.'), 10);

        if (isNaN(cm) || isNaN(kg) || !cm || !kg) {
            return;
        }

        if (action === 'calculate') {
            const bmi = Math.floor(kg * 10000 / (cm * cm));
            this.html.writeHTML('#itm_value', bmi.toString());
            this.html.show('#itm_result');
        }
        if (action === 'enableBtn') {
            this.html.removeClass('.itm > button', 'button-disabled');
        }
    }

    bmr(): void {
        const ageVal = (this.html.q('#bmr_age') as HTMLInputElement).value;
        const heightVal = (this.html.q('#bmr_height') as HTMLInputElement).value;
        const weightVal = (this.html.q('#bmr_weight') as HTMLInputElement).value;
        const gender = (this.html.q('#bmr_gender_m') as HTMLInputElement).checked ? 'M' : 'F';

        const age = parseInt(ageVal.replace(',', '.'), 10);
        const height = parseInt(heightVal.replace(',', '.'), 10);
        const weight = parseInt(weightVal.replace(',', '.'), 10);

        if (isNaN(age) || isNaN(height) || isNaN(weight) || !age || !height || !weight) {
            this.html.hide('#bmr_results');
            return;
        }

        let bmr = 0;

        if (gender === 'F') {
            bmr = Math.round(655 + (9.6 * weight) + (1.8 * height) - (4.7 * age));
        } else {
            bmr = Math.round(66 + (13.7 * weight) + (5 * height) - (6.8 * age));
        }

        this.html.writeHTML('#bmr_value', '' + bmr);
        this.html.show('#bmr_results');
    }

    instagram(): void {
        this.html.show("#instagram");

        // If we're too fast and splide hasn't been loaded yet..
        if (typeof Splide === 'undefined') {
            this.events.on('splide-loaded', () => this.instagram());
            return;
        }

        new Splide('#instagram', {
            perPage: 5,
            gap : 10,
            type : 'loop',
            lazyLoad : 'nearby',
            arrows: 'true',
            autoplay: 'true',

            breakpoints: {
                640: {
                    perPage: 2,
                },
            },

        }).mount();
    }

    roadMapInit(): void {
        this.map = L.map('map', {
            zoomControl: false
        }).setView([45.988551, 14.810986], 8);

        L.tileLayer('https://maps.api.24ur.si/osm_tiles/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 12,
            minZoom: 8
        }).addTo(this.map);
    }

    roadMapMarkers(events: any): void {
        this.map.eachLayer((layer: any) => {
             if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
             }
        });

        let markerEvents: Array<any> = [];

        const filters = [
            { check: '#road_accidents', data: events.Accidents },
            { check: '#road_traffic', data: events.Traffic },
            { check: '#road_works', data: events.Works },
            { check: '#road_events', data: events.Events }
        ];

        const checkedFilters = filters.filter(f => this.html.isChecked(f.check));

        markerEvents = (checkedFilters.length > 0 ? checkedFilters : filters)
            .reduce((acc, f) => acc.concat(f.data), [] as Array<any>);

        markerEvents.forEach(markerEvent => {
             const icon = L.icon({
                  iconUrl: '/assets/img/roads/map/' + (markerEvent.Priority > 3 ? '3' : markerEvent.Priority.toString()) + '/' + markerEvent.Sign + '.png',
                  iconSize: [20, 20]
             });

             L.marker([markerEvent.Lat, markerEvent.Lng], {icon: icon}).addTo(this.map).bindPopup('<b>' + markerEvent.RoadFull + '</b><br>' + markerEvent.Info);
        });
   };

    startMailingPopup(mailingData: any): void {
        if (!this.cookies.cookies.isImportantAllowed()) {
            return;
        }
        const popupTTL = 1000 * 60 * 60 * 24 * 30;
        const lastSeen = parseInt(this.cookies.get('popup') || '0', 10);
        const now      = (new Date()).getTime();
        
        if (!lastSeen || now - lastSeen > popupTTL) {
            setTimeout(() => {
                this.html.show('#mailing_popup', 'flex');
                this.cookies.set('popup', '' + now);
            }, mailingData.Delay);
        }
    }

    copyToClipboard(e: HTMLElement, text: string): void {
        navigator.clipboard.writeText(text);
        this.html.addClass(e, 'text-copied');

        setTimeout(() => {
            this.html.removeClass(e, 'text-copied');
        }, 2000)
    }

    runTicker(selector: string): void {
        requestAnimationFrame(() => {
            setTimeout(() => { this.moveTicker(selector); }, 4000);
        });
    }

    initChat(Didomi: any): void {
        const status = Didomi?.getCurrentUserStatus();

        if (['hr', 'rs', 'ba'].includes(this.options.country) && status?.vendors['synverso-rpHFAEwq']) {
            const vendor = status.vendors['synverso-rpHFAEwq'];
            if (vendor && vendor.enabled) {
                this.html.loadScript('/assets/chat/chat_' + this.options.country + '.js');
            }
        }

        if (['si'].includes(this.options.country) && status?.vendors['nexios-QazcaFyb']) {
            const vendor = status.vendors['nexios-QazcaFyb'];
            if (vendor && vendor.enabled) {
                this.html.loadScript('/assets/chat/chat_' + this.options.country + '.js');
            }
        }
    }

    initExponea(Didomi: any): void {
        const status = Didomi?.getCurrentUserStatus();

        if (['ba', 'hr', 'rs'].includes(this.options.country) && status?.vendors['bloomreach-9PPPkYrG']) {
            this.html.loadScript('/assets/exponea/exponea_' + this.options.country + '.js');
        }

        if (['si', 'bg'].includes(this.options.country) && status?.vendors['bloomreach-zR9Zmbfe']) {
            this.html.loadScript('/assets/exponea/exponea_' + this.options.country + '.js');
        }
    }

    exponeaIdentifyUser(user: UserModel|null): void {
        const exponea = (window as any).exponea;
        if (!exponea || !user) {
            return;
        }

        exponea.identify({'user_id': user.id});
    }

    private moveTicker(selector: string): void {
        const elements = this.html.qAll(selector + ' .ticker_item');
        const active = this.html.q(selector + ' .ticker_active');
        const first = this.html.q(selector + ' .ticker_item');

        if (!first || !elements || !active) {
            return;
        }

        this.html.removeClass(active, 'ticker_active');
        const i = elements.indexOf(active) + 1;

        if (i >= elements.length) {
            this.html.addClass(first, 'ticker_active');
        } else {
            this.html.addClass(elements[i], 'ticker_active');
        }

        this.runTicker(selector);
    }
}

export default Gadgets;