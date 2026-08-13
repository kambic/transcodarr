import Html from "./html";

class Events {
    constructor(protected html: Html) {}

    sendEvent(eventName: string, data: any): void {
        const myEvent = new CustomEvent(eventName, {
            detail: data,
            bubbles: true,
            cancelable: true,
            composed: false,
        });

        document.dispatchEvent(myEvent);
    }

    on(eventName: string, callback: Function): void {
        document.addEventListener(eventName, (event) => callback(event));
    }

    onWindow(eventName: string, callback: Function): void {
        window.addEventListener(eventName, (event) => callback(event));
    }

    /**
     * Because of SAMSUNG (!!) and their strict CSP policy, we cannot have inline
     * javscript and style. Anything like this:
     *    <div onclick="run()"></div> or <div style="color:red;"></div>
     * is forbidden.
     *
     * Instead of doing massive:
     *    document.getElementById('#button').addEventListener('click', function(e) { window.run(e); });
     * we decided to keep onclick handlers (as data attributes) in elements.
     *
     * Here we scan for all of them and transform them to real click handlers.
     */
    startEvents(parent: HTMLElement | string = document.body): void {
        var events = ['onclick', 'onsubmit', 'onmouseleave', 'onmouseenter', 'onmouseup', 'onmousedown'];

        events.forEach(eventName => {
            this.startEvent(eventName, this.html.q(parent));
        });
    }

    private startEvent(eventName: string, parent: HTMLElement|null): void {
        this.html.qAll(`[data-${eventName}]`, parent).forEach(element => {
            const handler = this.html.getData(element, eventName);
            const type = eventName.substring(2); // removes 'on' prefix ('onclick' -> 'click')

            element.addEventListener(type, event => {
                if (!(window as any)[handler]) {
                    console.log('Missing handler', handler);
                    return;
                }

                this.sendEvent('user_activity', {eventName, handler});

                (window as any)[handler](event);
            });
        })
    }
}

export default Events;