import {LitElement, html, css} from 'lit-element';
import './cupio-admin-item';
import {graphqlPost} from "../../mixins/graphql";
import {redirectTo} from "../../mixins/redirectTo";

class CupioAdminPanel extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                min-height: 100vh;
                box-sizing: border-box;
                flex-direction: column;
            }

            .container {
                margin: 0 64px 48px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                min-height: 100%;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                padding: 4px 32px 0;
                gap: 12px;
                background: white;
            }

            .logo {
                display: flex;
                justify-content: center;
                width: 100%;
                padding-bottom: 48px;
            }

            .delivery-item {
                display: flex;
                width: 100%;
                gap: 24px;
                align-items: center;
            }

            .title {
                font-weight: bold;
                color: grey;
                font-size: 20px;
                padding-bottom: 12px;
                display: flex;
                justify-content: space-between;
            }

            .link {
                color: black;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                transition: color 0.5s;
                display: flex;
                padding-bottom: 16px;
                align-self: baseline;
            }

            .link:hover {
                color: gray;
            }

            .link img {
                width: 14px;
                display: flex;
                align-self: baseline;
                padding-left: 4px;
                transform: rotate(180deg);
            }

            @media only screen and (max-width: 800px) {
                :host {
                    align-items: center;
                }

                .container {
                    margin: 0 24px 48px;
                }
            }

        `;
    }

    render() {
        return html`
            <cupio-logo></cupio-logo>
            
            <div class="container">

                <a class="link" href="/panel">
                    <img src="/Z-Frontend/images/icons/next-svgrepo-com.svg">
                    უკან დაბრუნება
                </a>
                <div class="title">
                    <span>კურიერების რაოდენობა (${this.couriers.length})</span>
                </div>
                ${this.couriers.map((item, index) => html`
                    <div class="delivery-item">
                        <cupio-admin-item
                                delivery
                                .item="${item}"
                                @status-changed="${this.loadAll}"></cupio-admin-item>
                    </div>
                `)}
                <div class="title">
                    <span>კლიენტების რაოდენობა (${this.clients.length})</span>
                </div>
                ${this.clients.map((item, index) => html`
                    <div class="delivery-item">
                        <cupio-admin-item
                                .item="${item}"
                                @status-changed="${this.loadAll}"></cupio-admin-item>

                    </div>
                `)}
            </div>

        `
    }

    static get properties() {
        return {
            couriers: {
                type: Array,
            },
            clients: {
                type: Array,
            },
        };
    }

    constructor() {
        super();
        this.couriers = [];
        this.clients = [];
        this.loadAll();
    }

    loadAll() {
        this.loadCouriers('delivery');
        this.loadCouriers('client');
    }

    loadCouriers(status) {
        const gql = `
            {
              usersDetails(status: "${status}"){
                rates{
                    ${status === 'delivery' ?
                    `delivery
                    takeRate` : `
                    normalRate
                    expressRate
                    superExpressRate
                    `}
                }
                email
                name
                budget
                address
              }
            }
            `
        graphqlPost(gql).then(({data: {usersDetails}}) => {
            if (status === 'delivery') {
                this.couriers = usersDetails;
            } else this.clients = usersDetails;
        })
    }

}

customElements.define('cupio-admin-panel', CupioAdminPanel);
