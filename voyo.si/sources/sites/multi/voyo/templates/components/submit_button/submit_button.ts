import template from './submit_button.html';

// Generic submit button used inside form. It has loading spinner
// and can be disabled.
class SubmitButton extends HTMLElement {
    static observedAttributes = ['text', 'disabled', 'loading'];

    private button!: HTMLButtonElement;

    // Markup nested inside the tag (eg. an svg icon). Used as the button label
    // instead of the "text" attribute, so the loading spinner hides it the same
    // way it hides text.
    private content = '';

    connectedCallback(): void {
        this.content = this.innerHTML.trim();

        app.html.writeHTML(this, template);
        this.button = app.html.q('button', this) as HTMLButtonElement;

        // Transfer css classes and element's id from the host tag to the <button>
        // inside this custom element.
        this.button.className = this.className;
        this.className = '';

        if (this.id) {
            this.button.id = this.id;
            this.removeAttribute('id');
        }

        this.syncText();
        this.syncDisabled();
    }

    attributeChangedCallback(): void {
        if (!this.button) {
            return;
        }

        this.syncText();
        this.syncDisabled();
    }

    get disabled(): boolean {
        return this.hasAttribute('disabled');
    }

    set disabled(value: boolean) {
        if (value) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    private syncText(): void {
        const label = app.html.q('span', this.button);
        if (!label) {
            return;
        }

        if (this.content) {
            label.innerHTML = this.content;
            return;
        }

        label.textContent = this.getAttribute('text') || '';
    }

    private syncDisabled(): void {
        this.button.disabled = this.hasAttribute('disabled') || this.hasAttribute('loading');
    }
}

export default SubmitButton;
