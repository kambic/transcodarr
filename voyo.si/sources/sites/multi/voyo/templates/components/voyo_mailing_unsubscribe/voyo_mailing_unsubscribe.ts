import template from './voyo_mailing_unsubscribe.html';

class VoyoMailingUnsubscribe extends HTMLElement {
    static observedAttributes = ['disabled'];

    connectedCallback(): void {
        app.html.writeHTML(this, template);
        const checkbox = app.html.q('input', this);
        checkbox?.addEventListener('change', event => this.onChange(event));
        this.syncDisabledAttribute();
    }

    attributeChangedCallback(): void {
        this.syncDisabledAttribute();
    }

    private syncDisabledAttribute(): void {
        const checkbox = app.html.q('input', this);
        if (!checkbox) {
            return;
        }
        if (this.hasAttribute('disabled')) {
            app.html.buttonDisable(checkbox);
        } else {
            app.html.buttonEnable(checkbox);
        }
    }

    private onChange(event: Event): void {
        const checked = app.html.isChecked(event.target as HTMLElement);
        const value = checked ? Math.floor(new Date().getTime() / 1000) : 0;
        app.gql.userMeta('noMailingSubscribe', value.toString());
    }
}

export default VoyoMailingUnsubscribe;
