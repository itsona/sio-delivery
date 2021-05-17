import {LitElement, html, css} from 'lit-element'
import './cupio-input';
import {localize} from "../mixins/localize";
import {graphqlPost, handleRequest} from "../mixins/graphql";

class CupioDrawer extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                visibility: hidden;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                transition: visibility 0.5s ease-in-out;
                overflow-y: auto;
            }

            :host([opened]) {
                visibility: visible;
            }

            .container {
                position: absolute;
                border: unset;
                z-index: 1;
                background-color: white;
                display: flex;
                flex-direction: column;
                transform: translateX(200%);
                transition: transform 0.5s ease-in-out;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px 0.5px;
                width: 50%;
                top: 0;
                min-height: 100%;
            }

            :host([opened]) .container {
                transform: translateX(100%);
            }

            .header-title {
                padding: 24px 40px 28px;
                font-weight: bold;
                font-size: 20px;
                border-bottom: 0.5px solid lightgrey;
            }

            .title {
                font-weight: bold;
            }

            .close {
                display: flex;
                position: absolute;
                top: 12px;
                right: 24px;
                border-radius: 50%;
                background-color: rgb(250, 250, 250);
                cursor: pointer;
            }

            .close:hover {
                background-color: rgb(240, 240, 240);
            }

            .close img {
                width: 30px;
                height: 30px;
                padding: 12px;
            }

            .content {
                display: flex;
                flex-direction: column;
                padding: 12px 40px 40px 40px;
                flex-grow: 1;
            }

            .item {
                display: flex;
                flex-direction: column;
            }

            .select {
                padding: 8px;
                border-radius: 12px;
                border: 0.5px solid rgb(204, 204, 204);
                appearance: none;
                color: grey;
                margin: 12px 0;
            }

            .select:focus {
                outline: none;
                border-radius: 12px 12px 0 0;
            }

            .save {
                display: flex;
                align-self: baseline;
                padding: 12px;
                background: dodgerblue;
                margin-top: 12px;
                border-radius: 12px;
                color: white;
                cursor: pointer;
            }

            @media only screen and (max-width: 800px) {
                .container {
                    width: 100%;
                }

                :host([opened]) .container {
                    transform: translateX(0);
                }
            }
        `;
    }

    render() {
        return html`
            <div class="container" @click="${(e) => e.stopPropagation()}">
                <div class="close" @click="${this.drawerClose}">
                    <img src="/Z-Frontend/images/icons/close.svg">
                </div>

                <span class="header-title">
                    დეტალები
                </span>
                <div class="content">
                    ${Object.keys(this.item).map((key) => html`

                        ${key !== 'status' ? html`
                            <div class="item">
                                <span class="title">${localize(key)}</span>
                                <cupio-input
                                        name="key"
                                        ?disabled="${!this.panel}"
                                        value="${this.item[key] || ''}"
                                        @value-changed="${(event) => this.onValueChange(event, key)}"></cupio-input>` : html`
                        `}
                        </div>
                    `)}

                    <div class="item">
                        <span class="title">სტატუსი: ${this.item.status}</span>
                        <select
                                class="select"
                                @input="${(event) => this.onValueChange({detail: event.target.value}, 'status')}">
                            <option
                                    ?selected="${this.item.status === 'ჩასაბარებელი'}"
                                    value="აღებული">აღებული
                            </option>
                            <option
                                    ?selected="${this.item.status === 'ასაღები'}"
                                    value="ასაღები">ასაღები
                            </option>
                            <option

                                    ?selected="${this.item.status === 'ჩაბარებული'}"
                                    value="ჩაბარებული">ჩაბარებული
                            </option>
                        </select>
                    </div>
                    <div class="item">
                        <span class="title">კურიერი</span>
                        <select
                                class="select"
                                @change="${this.courierChanged}">
                            <option
                                    value="${this.deliveryChangeValue()}">${this.deliveryChangeTitle()}
                            </option>
                            ${this.couriers.map((courier) => html`
                                <option
                                        value="${courier.email}">${courier.name}
                                </option>

                            `)}
                        </select>
                    </div>
                    <div
                            class="save"
                            @click="${this.save}">
                        შენახვა
                    </div>
                </div>
            </div>
        `
    }

    static get properties() {
        return {
            item: {
                type: Object,
            },
            opened: {
                type: Boolean,
            },
            couriers: {
                type: Array,
            },
            panel: {
                type: Boolean,
            }
        };
    }

    constructor() {
        super();
        this.couriers = [];
        this._alreadySent = false;
        this.item = {};
        handleRequest().then(r => this.panel = r === 'admin');
        this.loadCouriers();
    }

    drawerClose() {
        this.dispatchEvent(new CustomEvent('closed'));
    }

    updated(_changedProperties) {
        super.updated(_changedProperties);
        if (_changedProperties.has('opened')) {
            if (this.opened) document.documentElement.classList.add('no-scroll');
            else document.documentElement.classList.remove('no-scroll');
            if (this.panel) this.loadDetails();
            this.newItem = this.item;
        }
    }

    deliveryChangeTitle() {
        if (!this.panel) return 'ამანათის გადაწერა';
        if (this.item.status === 'ჩაბარებული') return 'დასრულებულია';
        return 'კურიერის მინიჭება';
    }

    deliveryChangeValue() {
        return '';
    }

    onValueChange(event, key) {
        if (!this.newItem) this.newItem = this.item;
        const value = event.detail;
        this.newItem[key] = value;
    }

    courierChanged(e) {
        const value = e.target.value;
        if (this.newItem.status === 'ასაღები') {
            this.newItem.takeCourier = value;
            this.accepted = false;
            this.newCourierSet = 'takeCourier';
            return;
        }
        this.newCourierSet = 'deliveryCourier';
        this.newItem.deliveryCourier = value;
    }

    loadCouriers() {
        const gql = `
            {
              usersDetails(status: "delivery"){
                status
                email
                name
              }
            }
            `
        graphqlPost(gql).then(({data: {usersDetails}}) => {
            this.couriers = usersDetails;
        })
    }

    loadDetails() {
        const gql = `
            {
              getDetails(id:"${this.item.id}"){
                id
                takeAddress
                service
                deliveryAddress
                client: clientName
                clientEmail: client
                status
                takeCourier
                deliveryCourier
                registerDate
                takeDate
                deliveryDate
                description
                phone
                price
              }
            }
        `;

        graphqlPost(gql).then(({data: {getDetails}}) => {
            this.item = getDetails;
            this.newItem = getDetails;
        })
    }

    save() {
        const gql = `mutation{
              addData(
                    id: "${this.newItem.id || ''}",
                    takeAddress: "${this.newItem.takeAddress || ''}",
                    service: "${this.newItem.service || ''}",
                    deliveryAddress: "${this.newItem.deliveryAddress || ''}",
                    client: "${this.newItem.client || ''}",
                    status: "${this.newItem.status || ''}",
                    takeCourier: "${this.newItem.takeCourier || ''}",
                    deliveryCourier: "${this.newItem.deliveryCourier || ''}",
                    takeDate: "${this.newItem.takeDate || ''}",
                    deliveryDate: "${this.newItem.deliveryDate || ''}",
                    description: "${this.newItem.description || ''}",
                    phone: "${this.newItem.phone || ''}",
                    price: ${this.newItem.price || 0},
                    courierChanged: "${this.newCourierSet || ''}",
              )
            }`

        graphqlPost(gql).then(()=> window.location.reload());
    }
}

customElements.define('cupio-drawer', CupioDrawer);
