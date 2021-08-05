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
            
            .select[disabled]{
                pointer-events: none;
                opacity: 0.6;
            }

            .save {
                display: flex;
                align-self: center;
                padding: 12px;
                background: dodgerblue;
                margin-top: 12px;
                border-radius: 12px;
                color: white;
                cursor: pointer;
                margin-bottom: 24px;
            }
            
            .buttons {
                display: flex;
                justify-content: space-around;
            }
            
            .save[disabled] {
                pointer-events: none;
                opacity: 0.5;
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
                    <div class="item">
                        <span class="title">სტატუსი: ${this.item.status}</span>
                        ${this.item.status === 'განხილვაშია' ? html`
                            <select
                                    class="select"
                                    @input="${(event) => this.onValueChange({detail: event.target.value}, 'status')}">
                                <option
                                        value="განხილვაშია">
                                    განხილვაშია
                                </option>
                                <option
                                        value="გაუქმებულია">
                                    გაუქმებულია
                                </option>
                                <option
                                        value="ასაღები">
                                    ასაღები
                                </option>
                            </select>
                        `: html`
                        <select
                                class="select"
                                ?disabled="${(this.item.status === 'ჩაბარებული' || this.item.status === 'აღებული')
                                && !this.panel}"
                                @input="${(event) => this.onValueChange({detail: event.target.value}, 'status')}">
                            <option
                                    ?selected="${this.item.status === 'ჩასაბარებელი'}"
                                    value="აღებული">
                                ${this.item.status === 'ჩასაბარებელი' ? 'ჩასაბარებელი': 'აღებული'}
                            </option>
                            ${this.item.status === 'ასაღები' ? html`
                                <option
                                        selected
                                        value="ასაღები">ასაღები
                                </option>
                             `: (this.item.status === 'აღებული' || this.item.status === 'ჩასაბარებელი')  && this.panel ? html`
                                <option

                                        ?selected="${this.item.status === 'ჩაბარებული'}"
                                        value="ასაღები">ასაღები
                                </option>

                                <option
                                        ?selected="${this.item.status === 'ჩაბარებული'}"
                                        value="ჩაბარებული">ჩაბარებული
                                </option>`: html`
                                <option
                                        ?selected="${this.item.status === 'ჩაბარებული'}"
                                        value="ჩაბარებული">ჩაბარებული
                                </option>`}
                        </select>
                        `}
                    </div>
                    ${this.panel? html`
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
                    <input 
                            type="checkbox" 
                            id="payed" 
                            name="payed" 
                            ?checked="${this.item.payed}"
                            @change="${(event) => this.onValueChange({detail:!this.item.payed}, 'payed')}">
                    <label for="payed"> გადახდილია</label><br>
                    `:''}
                    <div class="buttons" >
                        <div
                                class="save"
                                @click="${this.save}"
                                ?disabled="${!this.changed}">
                            შენახვა
                        </div>
                        ${this.item.status ==='ასაღები' || this.item.status === 'ჩასაბარებელი'
                                ? html`                        <div
                                class="save"
                                @click="${this.cancel}">
                            შეკვეთის გაუქმება
                        </div>` :''
                            }
                    </div>
                    ${Object.keys(this.item).map((key) => html`
                        ${(key !== 'status' && key !== 'canceled' && key !== 'payed') && (this.panel || key !== 'client') ? html`
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
            },
            changed: {
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
        this.changed = true;
        if (!this.newItem) this.newItem = this.item;
        const value = event.detail;
        this.newItem[key] = value;
    }

    courierChanged(e) {
        this.changed = true;
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
                service
                takeAddress
                deliveryAddress
                phone
                deliveryPhone
                client: clientName
                clientEmail: client
                status
                takeCourier
                deliveryCourier
                registerDate
                takeDate
                deliveryDate
                description
                price
                payed
              }
            }
        `;

        graphqlPost(gql).then(({data: {getDetails}}) => {
            this.item = {...getDetails, status: this.item.status};
            this.newItem = getDetails;
            this.newItem.oldPayed = this.item.payed;
        })
    }

    save() {
        let clientEmail;
        if(this.panel) clientEmail = this.newItem.clientEmail;
        else clientEmail = this.newItem.client;
        if(this.cantSave) return;
        this.cantSave = true;
        const gql = `mutation{
              addData(
                id: "${this.newItem.id || ''}",
                takeAddress: "${this.newItem.takeAddress || ''}",
                service: "${this.newItem.service || ''}",
                deliveryAddress: "${this.newItem.deliveryAddress || ''}",
                deliveryPhone: "${this.newItem.deliveryPhone || ''}",
                client: "${clientEmail ||  ''}",
                status: "${this.newItem.status || ''}",
                oldStatus: "${this.item.status || ''}",
                oldPrice: ${this.item.price || 0},
                takeCourier: "${this.newItem.takeCourier || ''}",
                deliveryCourier: "${this.newItem.deliveryCourier || ''}",
                takeDate: "${this.newItem.takeDate || ''}",
                deliveryDate: "${this.newItem.deliveryDate || ''}",
                description: "${this.newItem.description || ''}",
                phone: "${this.newItem.phone || ''}",
                price: ${this.newItem.price || 0},
                courierChanged: "${this.newCourierSet || ''}",
                payed: ${this.newItem.payed || false},
                oldPayed: ${this.newItem.oldPayed || false},
              )
            }`

        graphqlPost(gql).then(()=> {
            window.location.reload();
        })
            .catch(r=> console.warn(r) );
    }

    cancel(){
        const gql = `
        mutation {
            cancelOrder(id: "${this.item.id}",
             status: "${this.item.status}",
              client:"${this.item.clientEmail || ''}",
              price: ${this.item.price || 0}
              )
        }`
        graphqlPost(gql).then(()=> {
            window.location.reload();
        })
            .catch(r=> console.warn(r));
    }
}

customElements.define('cupio-drawer', CupioDrawer);
