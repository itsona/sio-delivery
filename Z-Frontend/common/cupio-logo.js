import {LitElement, html, css} from 'lit-element';
class CupioLogo extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                justify-content: center;
                width: 100%;
                padding-bottom: 48px;
            }
            img {
                height: 200px;
                border-radius: 32px;
            }
        `;
    }

    render() {
        return html`<a href="/"><img src="${this.image}"></a>`;
    }

    static get properties(){
        return {
            image: {
                type: String,
            }
        }
    }
    constructor() {
        super();
        this.image = '/Z-Frontend/images/logo.png';
    }
}

customElements.define('cupio-logo', CupioLogo);