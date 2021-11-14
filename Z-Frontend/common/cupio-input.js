import {LitElement, html, css} from 'lit-element'

class CupioInput extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                padding: 12px 0;
                display: flex;
                --border-color: lightGray;
                --input-padding: 0 24px 0 8px;
            }
            
            :host([error]){
                --border-color: red;
            }
            
            :host([disabled]) {
                pointer-events: none;
                opacity: 0.6;
            }

            .container {
                display: flex;
                position: relative;
                width: 100%;
            }

            #img {
                height: 16px;
                position: absolute;
                right: 8px;
                top: calc(50% - 8px);
                display: none;
            }

            #input {
                border: none;
                border-bottom: 0.5px solid var(--border-color);
                padding: var(--input-padding);
                min-height: 32px;
                width: 100%;
                font-weight: 600;
                transition: border-bottom-color 0.5s;
            }

            #input::placeholder {
                font-weight: 500;
            }

            #input:focus {
                outline: none;
            }

            :host([with-sign]) #img {
                display: flex;
            }

        `;
    }

    render() {
        return html`
            <div class="container">
                <input 
                    id="input" 
                    type="${this.getType()}" 
                    min="${this.min}"
                    placeholder="${this.placeholder || 'მისანიჭებელი'}"
                    .value="${this.value}"
                    @input="${this.saveValue}">
                    <img src="/Z-Frontend/images/icons/add.svg" id="img" 
                    @click="${() => this.dispatchEvent(new CustomEvent('add-request', {detail: this.value}))}">
            </div>
        `;
    }

    static get properties() {
        return {
            placeholder: {
                type: String,
                attribute: 'place-holder',
            },
            value: {
                type: String,
            },
            withSign: {
                type: Boolean,
                attribute: 'with-sign',
            },
            name: {
                type: String,
            },
            min: {
                type: String,
            },
            checkLatin: {
                type: Boolean,
            },
            error: {
                type: Boolean,
                reflect: true,
            },
            errorCount: {
                type: Number,
            }
        }
    }

    constructor() {
        super();
        this.checkLatin = false;
        this.errorCount = 0;
        this.value= '';
        this.min= '';
    }

    saveValue(e) {
        this.value = e.currentTarget.value;
        this.dispatchEvent(new CustomEvent('value-changed', {detail: this.value}))
    }

    checkIfLatin(lastLetter) {
        return ((lastLetter.codePointAt(0) >= 65 && lastLetter.codePointAt(0) <= 90) ||
            lastLetter.codePointAt(0) >= 97 && lastLetter.codePointAt(0) <= 122)
    }

    getType(){
        if(this.name.includes('password')) return 'password';
        if(this.name === 'date') return 'date';
        return 'text';
    }
}

customElements.define('cupio-input', CupioInput);
