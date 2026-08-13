class CodeInput extends HTMLElement {
    public form: HTMLFormElement | null = null;

    // The number of input fields for the code
    private length = 4;
    // this.length number of input fields for the code
    private inputs: HTMLInputElement[] = [];
    // Hidden input field to store the combined value of all code inputs, also gets picked up by the form submission
    private hiddenInput!: HTMLInputElement;
    // Whether the code input is required for form submission
    private required: string | null = null;

    // Allow digits 0-9 and letters A-Z, a-z to be entered in the code input fields
    // Inputs are automatically converted to uppercase, so only uppercase letters are stored in the hidden input field
    private allowedCharacters = /^[0-9A-Za-z]+$/;

    connectedCallback(): void {
        this.form = this.closest("form") as HTMLFormElement | null;
        this.length = +(this.getAttribute("length") || 4);
        this.required = this.getAttribute("data-required");

        this.render();
    }
    
    get value(): string {
        return this.inputs.map((input) => input.value).join("");
    }

    set value(v: string) {
        const value = v.slice(0, this.length).toUpperCase();

        this.inputs.forEach((input, index) => {
            input.value = value[index] || "";
        });
    }

    focus(): void {
        this.inputs[0]?.focus();
    }

    private render(): void {
        this.innerHTML = "";

        this.hiddenInput = document.createElement("input");
        this.hiddenInput.type = "hidden";
        this.hiddenInput.name = this.getAttribute("name") || "code";

        this.appendChild(this.hiddenInput);

        this.inputs = Array.from({ length: this.length }, (_, index) => {
            const input = document.createElement("input");

            input.type = "text";
            input.maxLength = 1;
            if (this.required !== null) {
                input.setAttribute("data-required", this.required);
            }

            input.addEventListener("keydown", (event) => this.onKeydown(event, index));
            input.addEventListener("input", () => this.onInput(input, index));
            input.addEventListener("paste", (event) => this.onPaste(event));

            this.appendChild(input);
            return input;
        });
    }

    private onKeydown(event: KeyboardEvent, index: number): void {
        const input = event.target as HTMLInputElement;

        if (event.key === "Backspace" || event.key === "Delete") {
            event.preventDefault();

            if (input.value === "") {
                const prevInput = this.inputs[index - 1];
                if (prevInput) {
                    prevInput.value = "";
                    prevInput.focus();
                }
            } else {
                input.value = "";
            }

            this.updateHiddenInput();
            this.dispatchInput();
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            this.inputs[index - 1]?.focus();
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            this.inputs[index + 1]?.focus();
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();

            this.checkAndSubmit();
            return;
        }

        // Allow only allowed characters to be entered, but leave the option to use Ctrl, Meta, and Alt keys for shortcuts (e.g., Ctrl+V)
        if (event.key.length === 1 && this.allowedCharacters.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();

            input.value = event.key.toUpperCase();
            this.inputs[index + 1]?.focus();

            this.updateHiddenInput();
            this.dispatchInput();
            this.checkAndSubmit();
            return;
        }
    }

    private onInput(input: HTMLInputElement, index: number): void {
        if (!this.allowedCharacters.test(input.value)) {
            input.value = "";
            return;
        }

        input.value = input.value.toUpperCase();
        this.inputs[index + 1]?.focus();

        this.updateHiddenInput();
        this.dispatchInput();
        this.checkAndSubmit();
    }

    private onPaste(event: ClipboardEvent): void {
        event.preventDefault();

        const pastedValue = event.clipboardData?.getData("text").trim() || "";
        if (!this.allowedCharacters.test(pastedValue) || pastedValue.length !== this.length) {
            return;
        }

        this.value = pastedValue;
        this.inputs[this.length - 1]?.focus();

        this.updateHiddenInput();
        this.dispatchInput();
        this.checkAndSubmit();
    }

    private updateHiddenInput(): void {
        this.hiddenInput.value = this.value;
    }

    // Dispatch an "input" event on the custom element so the form can listen for changes to the code input value
    private dispatchInput(): void {
        this.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Automatically submit if the code input is complete
    private checkAndSubmit(): void {
        if (this.value.length === this.length) {
            this.form?.requestSubmit();
        }
    }
}

export default CodeInput;