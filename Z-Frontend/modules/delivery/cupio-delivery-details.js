import {LitElement, html, css} from 'lit-element';
import './cupio-delivery-item';
import {graphqlPost} from "../../mixins/graphql";
import {redirectTo} from "../../mixins/redirectTo";

class CupioDeliveryDetails extends LitElement {
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

                <div class="title">
                    <span>ჩანაწერების რაოდენობა (${this.items.length})</span>
                </div>
                ${this.items.map((item, index) => html`
                    <div class="delivery-item" ?filtered="${!!this.searchWord}">
                        <cupio-delivery-item
                                delivery
                                class="item"
                                .item="${item}"
                                @accepted="${this.setItems}"></cupio-delivery-item>
                    </div>
                `)}
            </div>

        `
    }

    static get properties() {
        return {
            items: {
                type: Array,
            }
        };
    }

    constructor() {
        super();
        this.items = [];
        this.setItems()
    }

    setItems() {
        const gql = `
            {
                getForAccept{
                    id
                    takeDate
                    deliveryDate
                    takeAddress
                    deliveryAddress
                    description
                    phone
                    status
                }
            }
        `
        graphqlPost(gql).then(({data: {getForAccept}})=> {
            getForAccept.map((item)=> {
                if(item.status === 'ასაღები'){
                    delete item.deliveryDate;
                    delete item.deliveryAddress;
                }
                else {
                    delete item.takeDate;
                    delete item.takeAddress;
                }
                return item;
            })
            this.items = getForAccept;
            if(!this.items.length) {
                redirectTo('/delivery')
            }
        })
    }

}

customElements.define('cupio-delivery-details', CupioDeliveryDetails);
