import {LitElement, html, css} from 'lit-element'

class CupioLoading extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                flex-direction: column;
                align-items: center;
                --bluebell: #979fd0;
            }
            .loading {
                display: flex;
                justify-content: center;
            }
            .dot {
                width: 1rem;
                height: 1rem;
                margin: 2rem 0.3rem;
                background: var(--bluebell);
                border-radius: 50%;
                animation: 0.9s bounce infinite alternate;
            }
            .dot:nth-child(2) {
                animation-delay: 0.3s;
            }
            .dot:nth-child(3) {
                animation-delay: 0.6s;
            }

            @keyframes bounce {
                to {
                    opacity: 0.3;
                    transform: translate3d(0, -1rem, 0);
                }
            }
            
        `;
    }

    render() {
        return html`
            <div class="loading">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
        `
    }

    static get properties() {
        return {

        };
    }

    constructor() {
        super();
    }

}

customElements.define('cupio-loading', CupioLoading);
