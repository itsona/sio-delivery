import {LitElement, html, css} from 'lit-element';

class CupioLandingAction extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                flex-direction: column;
                width: 20%;
                padding: 0 48px;
            }
            
            .img {
                height: 80px;
            }
            
            .title {
                font-weight: bold;
                font-size: 20px;
                text-align: center;
                padding: 16px 0;
            }
            
            .description {
                display: flex;
                padding-top: 16px;
                text-align: center;
                font-size: 18px;
                font-weight: 500;
                max-height: 120px;
                color: rgb(88, 88, 88);
            }
        `;
    }

    render() {
        return html`
                <img class="img" src="/Z-Frontend/images/icons/${this.img}.svg">
                <span class="title">${this.title}</span>
                <span class="description">${this.description}</span>
        `
    }

    constructor() {
        super();
        this.description = []
    }

    static get properties() {
        return {
            img: {
                type: String,
            },
            title: {
                type: String,
            },
            descriptions: {
                type: Array,
            },
        };
    }

}

customElements.define('cupio-landing-actions', CupioLandingAction);
