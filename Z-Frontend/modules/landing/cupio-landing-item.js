import {LitElement, html, css} from 'lit-element';

class CupioLandingItem extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                flex-direction: column;
                transform: translateY(100%);
                transition: transform 1s;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px 0.5px;
                border-radius: 12px;
                overflow: hidden;
                width: 25%;
                background-color: white;
            }
            :host([moved]) {
                transform: translateY(0);
            }
            
            .img {
                height: 200px;
            }
            .descriptions {
                padding: 24px;
                display: flex;
                flex-direction: column;
            }
        `;
    }

    render() {
        return html`
                <img class="img" src="${this.img}">
                <div class="descriptions">
                    ${this.descriptions.map((desc)=> html`
                        <span class="description">${desc}</span>
    
                    `)}
                </div>
        `
    }

    constructor() {
        super();
        setTimeout(() => this.moved = true, 100);
        this.description = []
    }

    static get properties() {
        return {
            moved: {
                type: Boolean,
                reflect: true,
            },
            img: {
                type: String,
            },
            descriptions: {
                type: Array,
            },
        };
    }

}

customElements.define('cupio-landing-item', CupioLandingItem);
