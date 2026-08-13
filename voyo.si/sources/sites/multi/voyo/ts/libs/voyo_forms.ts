import VoyoAppOptions from "../app/options";
import Html from "@core/libs/html";
import RateLimiter from "@core/libs/rate_limiter";

class VoyoForms {
    private debouncedOnInput: (event: Event) => void;
    private debounceTime: number = 100;

    constructor(
        protected options: VoyoAppOptions,
        protected html: Html,
        protected rateLimiter: RateLimiter,
    ) {
        this.debouncedOnInput = this.rateLimiter.debounce((event: Event) => {
            const form = (event.target as HTMLFormElement).form;
            if (!form) {
                return;
            }

            const isValid = this.validateRequiredFields(form);
            const submitButton = this.html.q('button:not([type]), submit-button', form) as HTMLButtonElement | null;
            if (submitButton) {
                submitButton.disabled = !isValid;
            }

            this.resetErrors(form);
        }, this.debounceTime);
    }

    oninput(event: Event): void {
        this.debouncedOnInput(event);
    }

    async submit(form: HTMLFormElement, callback: (data: Record<string, string>) => Promise<void>, errorCallback?: (error: any) => void): Promise<void> {
        this.resetErrors(form);

        this.html.addClass(form, 'loading');
        this.html.q('submit-button', form)?.setAttribute('loading', '');

        const data = this.extractFormData(form);

        return callback(data)
            .then(() => {
                const successMsg = this.html.getData(form, 'successMsg');
                if (successMsg) {
                    this.showFormCallout(form, successMsg, 'success');
                }
                this.html.removeClass(form, 'loading');
                this.html.q('submit-button', form)?.removeAttribute('loading');
            })
            .catch(error => {
                if (errorCallback) {
                    errorCallback(error);
                } else {
                    this.defaultErrorHandler(form, error);
                }
                this.html.removeClass(form, 'loading');
                this.html.q('submit-button', form)?.removeAttribute('loading');
            });
    }

    /**
     * This method is used when we want to update the default values of inputs after a successful form submission.
     * Useful when we stay on the same page and want to have a functional form reset button. Since we do not want to 
     * reload every page after submission and want the reset button to reset to the last submitted value.
     * This is mostly used on settings page.
     */
    async submitWithUpdate(form: HTMLFormElement, callback: (data: Record<string, string>) => Promise<void>, errorCallback?: (error: any) => void): Promise<void> {
        return this.submit(form, callback, errorCallback)
            .then(() => {
                this.updateDefaultValues(form);
            });
    }

    onreset(event: Event): void {
        const form = event.target as HTMLFormElement;
        if (!form) {
            return;
        }

        this.resetErrors(form);
    }

    reset(form: HTMLFormElement): void {
        form.reset();
        this.resetErrors(form);
    }

    private updateDefaultValues(form: HTMLFormElement): void {
        const inputs = this.html.qAll('input', form);
        inputs.forEach((element: HTMLElement) => {
            const inputEl = element as HTMLInputElement;
            if (inputEl.type === 'password' || inputEl.type === 'hidden') {
                return;
            }
            if (inputEl.type === 'checkbox') {
                inputEl.defaultChecked = inputEl.checked;
            } else {
                inputEl.defaultValue = inputEl.value;
            }
        });
    }

    private extractFormData(form: HTMLFormElement): Record<string, string> {
        const formData = new FormData(form);

        // Unpack all form data into a plain object
        const data: Record<string, string> = {};

        formData.forEach((value, key) => {
            const input = form.elements.namedItem(key) as HTMLInputElement | null;
            if (input?.type === 'checkbox') {
                data[key] = value.toString();
            } else {
                data[key] = value.toString().trim();
            }
        });

        return data;
    }

    /**
     * Tries to show error message on a specific input based on error code, if that fails it shows the error message in a form callout.
     * @param error The error object {code: string, message: string}
     */
    private defaultErrorHandler(form: HTMLFormElement, error: any): void {
        const code = error?.code || '';
        let message: string = error?.message || '{{ T "base.errors.general" }}';

        let handled = false;
        if (code) {
            handled = this.showFieldErrorByCode(form, code, message);
        }

        if (!handled) {
            // Do not show "Fetch request timed out" errors
            if (message.includes('Fetch request timed out')) {
                message = '{{ T "base.errors.fetchError" }}';
            } else if (message.includes('HTTP error!')) {
                message = '{{ T "base.errors.fetchError" }}';
            }
            this.showFormCallout(form, message, 'error');
        }
    }

    private resetErrors(form: HTMLFormElement): void {
        this.html.hide(".login-error", form);
        this.html.writeHTML(".login-error", "", form);
        this.html.hide(".callout", form);
        this.html.writeHTML(".callout span", "", form);
        this.html.removeClass(".callout", "callout--success callout--error callout--warning", form);
    }

    showFieldErrorByCode(form: HTMLFormElement, code: string, message: string): boolean {
        const errorFields = this.html.qAll(`.login-error[data-errors*="${code}"]`, form);
        errorFields.forEach((field) => {
            this.showFieldError(field, message);
        });
        return errorFields.length > 0;
    }

    showFieldError(selector: string | HTMLElement, message: string): void {
        this.html.writeHTML(selector, message);
        this.html.show(selector);
    }

    showFormCallout(form: HTMLFormElement, message: string, type: 'success' | 'error' | 'warning' = 'error'): void {
        const callout = this.html.q('.callout', form);
        if (callout) {
            this.showCallout(callout, message, type);
        }
    }

    showCallout(selector: string | HTMLElement, message: string, type: 'success' | 'error' | 'warning' = 'error'): void {
        this.html.addClass(selector, `callout--${type}`);
        if (selector instanceof HTMLElement) {
            this.html.writeHTML('span', message, selector);
        } else {
            this.html.writeHTML(`${selector} span`, message);
        }
        this.html.show(selector, "flex");
    }

    clearCallout(selector: string | HTMLElement): void {
        this.html.hide(selector);
        this.html.writeHTML(`${selector} span`, "");
        this.html.removeClass(selector, "callout--success callout--error callout--warning");
    }

    toggleShowPassword(selector: string): void {
        const passwordInput = this.html.q(selector) as HTMLInputElement | null;
        if (!passwordInput) {
            return;
        }
        
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    }
 
    private validateRequiredFields(form: HTMLFormElement): boolean {
        const requiredFields = this.html.qAll('input[data-required]', form);
        let allValid = true;

        requiredFields.forEach((field) => {
            const requiredValue = this.html.getData(field, 'required');
            const isValid = this.validateRequiredField(field as HTMLInputElement, requiredValue);
            allValid = allValid && isValid;
        });

        return allValid;
    }

    /**
     * Validates a single required field based on its type and the rules specified in the data-required attribute.
     * @param requirements can be an empty string or a JSON string with validation rules, e.g. {"length":4} or {"notDefault":true}
     */
    private validateRequiredField(field: HTMLInputElement, requirements: string): boolean {
        if (field.type === 'checkbox') {
            return field.checked;
        }

        if (field.type === 'radio') {
            // Atleast one of the same radio group must be checked
            const radioGroup = field.name;
            const checkedRadio = this.html.q(`input[type="radio"][name="${radioGroup}"]:checked`, field.form);
            return checkedRadio !== null;
        }

        if (requirements === "") {
            return field.value.trim() !== '';
        }

        let requirementsObj: any;
        try {
            requirementsObj = JSON.parse(requirements);
        } catch (e) {
            console.error('Invalid JSON in data-required attribute for field', field.name, e);
            return false;
        }

        if (requirementsObj.length) {
           return field.value.trim().length === requirementsObj.length;
        }

        if (requirementsObj.notDefault) {
            return field.value.trim() !== field.defaultValue.trim();
        }

        return false;
    }
}

export default VoyoForms;