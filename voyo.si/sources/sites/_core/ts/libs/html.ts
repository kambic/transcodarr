import UserModel from '../model/user';
import {fetchWithTimeout} from './fetch';
import retryOnce from './retry';

class Html {
    private scriptsLoaded:  Array<string> = [];
    private stylesLoaded: Array<string> = [];

    q(selector: string | HTMLElement, parent: HTMLElement | null = null): HTMLElement | null {
        if (typeof selector !== 'string') {
            return selector;
        }
        const elt = parent ? parent : document;
        return elt.querySelector(selector);
    }

    qAll(selector: string | HTMLElement | Array<HTMLElement>, parent: HTMLElement | null = null): Array<HTMLElement> {
        if (selector instanceof HTMLElement) {
            return [selector];
        }
        if (typeof selector !== 'string') {
            return selector;
        }
        const elt = parent ? parent : document;
        return Array.from(elt.querySelectorAll(selector));
    }

    inject(parents: string | HTMLElement | Array<HTMLElement>, data: any): void {
        if (!data) {
            return;
        }

        if (typeof parents === 'string') {
            const tmp = this.qAll(parents);
            if (!tmp || !tmp.length) {
                return;
            }
            parents = tmp;
        } else if (!Array.isArray(parents)) {
            parents = [parents];
        }

        parents.forEach (parent => {
            this.qAll('[data-field]', parent)
                .forEach(elt => this.injectFieldData(elt as HTMLElement | HTMLImageElement, data));
        });
    }

    writeHTML(selector: string | HTMLElement, html: string, parent: HTMLElement | null = null): void {
        const elts = this.qAll(selector, parent);
        elts.forEach(e => e.innerHTML = html);
    }

    appendHTML(selector: string | HTMLElement, html: string, parent: HTMLElement | null = null): void {
        const e = this.q(selector, parent);
        if (e) {
            e.insertAdjacentHTML("beforeend",html);
        }
    }

    prependHTML(selector: string | HTMLElement, html: string, parent: HTMLElement | null = null): void {
        const e = this.q(selector, parent);
        if (e) {
            e.insertAdjacentHTML("afterbegin",html);
        }
    }

    /**
     * Extracts inner part from given html.
     */
    extractHTML(html: string, selector: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        return doc.querySelector(selector)?.innerHTML || '';
    }

    extractData(html: string, selector: string, name: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html')
        const element = doc.querySelector(selector) as HTMLElement;
        if (!element) {
            return '';
        }
        const data = element.dataset[name];
        if (data === undefined || data === null) {
            return '';
        }
        return data;
    }



    show(selector: string | HTMLElement | Array<HTMLElement>, displayValue = 'block', parent: HTMLElement | null = null): void {
        this.qAll(selector, parent)
            .forEach(e => e.style.display = displayValue || 'block');
    }

    isShown(selector: string | HTMLElement): boolean {
        const e = this.q(selector) as HTMLInputElement | undefined;
        return e ? e.style.display !== 'none' && e.style.display !== '' : false;
    }

    hide(selector: string | HTMLElement | Array<HTMLElement>, parent: HTMLElement | null = null): void {
        this.qAll(selector, parent)
            .forEach(e => e.style.display = 'none');
    }

    toggle(selector: string | HTMLElement | Array<HTMLElement>, displayValue = '', parent: HTMLElement | null = null): void {
        this.qAll(selector, parent)
            .forEach(e => {
                if (e.style.display === 'none') {
                    this.show(e, displayValue, parent)
                } else {
                    this.hide(e, parent)
                }
            });
    }

    clear(selector: string | HTMLElement | Array<HTMLElement>, parent: HTMLElement | null = null): void {
        this.qAll(selector, parent)
            .forEach(e => e.innerHTML = '');
    }

    addClass(selector: string | HTMLElement | Array<HTMLElement>, className: string, parent: HTMLElement | null = null): void {
        const elts = this.qAll(selector, parent);
        if (!elts?.length || !className) {
            return;
        }

        elts.forEach(e => {
            const classNames = className.split(' ');
            classNames.filter(x => x).forEach(c => e.classList.add(c));
        });
    }

    removeClass(selector: string | HTMLElement | Array<HTMLElement>, className: string, parent: HTMLElement | null = null): void {
        const elts = this.qAll(selector, parent);
        if (!elts?.length || !className) {
            return;
        }

        elts.forEach(e => {
            const classNames = className.split(' ');
            classNames.filter(x => x).forEach(c => e.classList.remove(c));
        });
    }

    toggleClasses(selector: string | HTMLElement | Array<HTMLElement>, classNameA: string, classNameB: string, parent: HTMLElement | null = null): void {
        const elts = this.qAll(selector, parent);
        if (!elts.length || !classNameA) {
            return;
        }

        const classNamesA = classNameA.split(' ');
        const toCheck = classNamesA[0];

        elts.forEach(e => {
            if (this.hasClass(e, toCheck)) {
                this.removeClass(e, classNameA);
                this.addClass(e, classNameB);
            } else {
                this.removeClass(e, classNameB);
                this.addClass(e, classNameA);
            }
        });
    }

    toggleClass(selector: string | HTMLElement | Array<HTMLElement>, className: string): void {
        const elts = this.qAll(selector);
        if (elts.length && className) {
            elts.forEach(e => this.hasClass(e, className) ? this.removeClass(e, className) : this.addClass(e, className));
        }
    }

    toggleClassIf(selector: string | HTMLElement | Array<HTMLElement>, condition: boolean, className: string, ): void {
        const elts = this.qAll(selector);
        if (elts.length && className) {
            elts.forEach(e => condition ? this.addClass(e, className) : this.removeClass(e, className));
        }
    }

    hasClass(selector: string | HTMLElement, className: string, parent: HTMLElement | null = null): boolean {
        const e = this.q(selector, parent);
        return !!e?.classList.contains(className);
    }

    setStyle(selector: string | HTMLElement | Array<HTMLElement>, property: string, value: string, parent: HTMLElement | null = null): void {
        const elts = this.qAll(selector, parent);
        if (!elts.length) {
            return;
        }

        elts.forEach(e => e.style[property as any] = value);
    }

    setFocus(selector: string | HTMLElement): void {
        const e = this.q(selector);
        if (e) {
            e.focus();
        }
    }

    getData(selector: string | HTMLElement, name: string): string {
        const e = this.q(selector) as HTMLElement;
        return e?.dataset[name] || '';
    }

    setData(selector: string | HTMLElement, name: string, value: string | number): void {
        const e = this.q(selector) as HTMLElement;
        if (e) {
            e.dataset[name] = value.toString();
        }
    }

    /**
     * if you need to check if data tag exists (no matter what value) - use
     * strict = false.
     * If you want chech if data tag exists AND it has some non empty value, 
     * use strict = true.
     */
    hasData(selector: string | HTMLElement, name: string, strict = false): boolean {
        const e = this.q(selector) as HTMLElement;
        return strict ? !!e?.dataset[name] : e?.dataset[name] !== undefined;
    }

    setChecked(selector: string, value: boolean): void {
        const e = this.q(selector) as HTMLInputElement;
        if (e) {
            e.checked = value;
        }
    }

    isChecked(selector: string | HTMLElement): boolean {
        const e = this.q(selector) as HTMLInputElement | undefined;
        return e ? e.checked : false;
    }

    closest(selector: string, child: string | HTMLElement): HTMLElement|null {
        const e = this.q(child) as HTMLInputElement | undefined;
        return e ? e.closest(selector) : null;
    }

    buttonDisable(selector: string | HTMLElement): void {
        (this.q(selector) as HTMLButtonElement).disabled = true;
    }

    buttonEnable(selector: string | HTMLElement): void {
        (this.q(selector) as HTMLButtonElement).disabled = false;
    }

    closeFullscreen(): void {
        this.removeClass('body', 'showing-fullscreen');
    }

    openFullscreen(): void {
        this.addClass('body', 'showing-fullscreen');
    }

    fetchText(url: string, options: {headers?:any, timeout?: number, user?: UserModel}|undefined = undefined): Promise<string> {
        if (options?.user) {
            options.headers = Object.assign(options.headers || {}, {
                'Authorization': options.user.token,
                'Device-Id': options.user.deviceId,
                'Onl-Location': document.location.href,
            });
        }

        return retryOnce(() => 
                fetchWithTimeout(url, options)
            )
            .then(r => {
                return r?.text();
            })
    }

    // Executes script that is inside HTML's text. This function is
    // needed if we get HTML with javascript from Ajax request.
    execHtmlScript(selector: string, stripEventListener = false): void {
        const e = this.q(selector) as HTMLInputElement | undefined;

        if (!e || !e.innerHTML.includes('<script>') || !e.innerHTML.includes('</script>')) {
            return;
        }

        let html = e.innerHTML;

        let start = html.indexOf('<script>') + 8;
        let end = html.lastIndexOf('</script>');

        if (stripEventListener) {
            const listenerPos = html.indexOf('document.addEventListener', start);

            start = html.indexOf('{', listenerPos + 20) + 1;
            end = html.lastIndexOf('})', end);
        }

        html = html.substring(start, end);

        this.loadScript('', selector, html);
    }

    loadVideoElements(isDrmMedia: boolean): Promise<boolean> {
        return this.loadScript('/assets/videojs/video_8.9.0.min.js')
            .then(x => this.loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js')).catch(_ => {})
            .then(x => this.loadStyle('/assets/videojs/video-js_8.9.0.min.css'))
            .then(x => Promise.all([
                this.loadScript('https://cdn.jsdelivr.net/npm/videojs-vtt-thumbnails@0.0.13/dist/videojs-vtt-thumbnails.min.js'),
                this.loadScript('https://cdn.jsdelivr.net/npm/videojs-contrib-ads@7.3.2/dist/videojs-contrib-ads.min.js').catch(_ => {}),
                this.loadScript('https://cdn.jsdelivr.net/npm/videojs-ima@2.2.0/dist/videojs.ima.min.js').catch(_ => {}),
                isDrmMedia ? this.loadScript('/assets/videojs/videojs-contrib-eme_5.5.2.min.js').catch(_ => {}) : Promise.resolve(),
            ]))
            .then(x => true);
    }

    loadVideoBannerElements(): Promise<boolean> {
        return this.loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js')
            .then(x => true);
    }

    loadStyle(src: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.styleExists(src)) {
                resolve(true);
                return;
            }

            var style = document.createElement('link');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            style.media = 'screen';
            style.href = src;
            style.onload = () => { 
                this.stylesLoaded.push(src);
                resolve(true); 
            };
            document.getElementsByTagName('head')[0].appendChild(style);
        });
    }

    loadScript(src = '', id = '', scriptContent = ''): Promise<boolean> {
        if (!id && !src) {
            Promise.resolve(false);
        }
        
        id = id || src;
        return new Promise((resolve, reject) => {
            if (this.scriptExists(id)) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            if (src) {
                script.src = src;
            }
            if (scriptContent) {
                script.text = scriptContent;
            }
            script.onload = () => { 
                resolve(true); 
                this.scriptsLoaded.push(id);
            };
            script.onerror = (error) => { console.log('Load script error:', error);  reject(false); };
            document.getElementsByTagName('body')[0].appendChild(script);
        });
    }

    formatShortDate(dt: Date): string  {
        const days = ('0' + dt.getDate()).slice(-2);
        const months = ('0' + (dt.getMonth() + 1)).slice(-2);
        const years = dt.getFullYear();

        return days + '. ' + months + '. ' + years;
    }

    safeJsonParse(json: string, defaultValue = {}): any {
        if (!json) {
            return defaultValue;
        }

        try {
            const o = JSON.parse(json);
            return o;
        } catch (e) {
            console.log('Safe Parse Error', json, e);
            return defaultValue;
        }
    }

    private scriptExists(src: string): boolean {
        return this.scriptsLoaded.includes(src);
    }

    private styleExists(src: string): boolean {
        return this.stylesLoaded.includes(src);
    }

    private injectFieldData(element: HTMLElement | HTMLImageElement, data: any): void {
        const field = this.getData(element, 'field');

        if (!field) {
            return;
        }

        if (element instanceof HTMLImageElement) {
            if (field === 'avatar') {
                element.src = data[field];
            }
        } else if (element instanceof HTMLElement) {
            element.innerHTML = data[field];
        }
    }
}

export default Html;