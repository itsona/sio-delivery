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

            :host([disabled]) .content{
                opacity: 0.3;
                pointer-events: none;
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
                <div class="close" @click="${()=>this.drawerClose()}">
                    <img src="/Z-Frontend/images/icons/close.svg">
                </div>

                <span class="header-title">
                    დეტალები
                </span>
                <div class="content">
                    ${this.saved ? html`
                        <span class="title" style="padding: 8px 0; color: red">წარმატებით შევინახეთ</span>
                    ` : ''}
                    ${this.opened && !this.cantSave ? html`
                    <div class="item">
                        <span class="title">სტატუსი: ${this.getStatus(this.item.status)}</span>
                        ${this.item.status === 'განხილვაშია'  || this.item.status === 'გაუქმებულია' ? html`
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
                    `:''}
                    ${this.panel && this.opened && !this.cantSave ? html`
                    <div class="item">
                        <span class="title">კურიერი</span>
                        <select
                                class="select"
                                ?disabled="${this.item.status === 'ჩაბარებული'}"
                                @change="${this.courierChanged}">
                            <option
                                    ?selected="${!this.item[this.getCourierType()]}"
                                    value="${this.deliveryChangeValue()}">${this.deliveryChangeTitle()}
                            </option>
                            ${this.couriers.map((courier) => html`
                                <option
                                        ?selected="${this.item[this.getCourierType()] === courier.email}"
                                        value="${courier.email}">${courier.name}
                                </option>
                            `)}
                        </select>
                    </div>
                    `:''}
                    <div class="buttons" >
                        ${this.item.status ==='ასაღები' || this.item.status === 'ჩასაბარებელი'
                                ? html`                        <div
                                class="save"
                                @click="${this.cancel}">
                            შეკვეთის გაუქმება
                        </div>` :''
                            }
                    </div>
                    <br>
                    ${this.opened && this.item.cash && !this.cantSave ? html`
                    <br>
                    ქეში აღებულია
                    <input
                            type="checkbox"
                            id="check"
                            name="cash"
                            ?checked="${!!this.item.cashPayed}"
                            @change="${this.cashPay}">
                    <br>
                    `:''}
                    ${this.panel && this.opened ? html`
                        ${this.item.cash ? html`
                        გადაგზავნილია
                        <input
                                type="checkbox"
                                id="check"
                                name="cash"
                                ?checked="${!!this.item.cashTransfered}"
                                @change="${this.cashTransfer}">
                        <br>
                        `:''}

                        <span class="title">შეკვეთის ფასი</span>
                        <cupio-input
                                name="key"
                                ?disabled="${!this.panel || this.disableds.indexOf('price') !== -1}"
                                value="${this.item['price'] || ''}"
                                @value-changed="${(event) => this.onValueChange(event, 'price')}"></cupio-input>
                    <span class="title">ფასი</span>
                    <cupio-input
                            style="width: 200px"
                            with-sign
                            name="budget"
                            .value="${this.priceDiff}"
                            @add-request="${this.changePrice}"></cupio-input>
                    გადახდილია
                    <input
                        type="checkbox"
                        id="check"
                        name="check"
                        ?checked="${!!this.item.payed}"
                        @change="${this.changePayed}">

                        <div style="width: 100%; border-bottom: 1px solid; margin: 48px 0"></div>
                ` : ''}
                    ${Object.keys(this.item).map((key) => html`
                        ${(key !== 'status' && key !== 'canceled' && key !== 'cashPayed' && key !== 'cashTransfered') && (this.panel || (key !== 'client' &&key !== 'price'&& key !== 'payed' && !key.includes('Courier'))) ? html`
                            <div class="item">
                                <span class="title">${localize(key)}</span>
                                <cupio-input
                                        name="key"
                                        ?disabled="${!this.panel || this.disableds.indexOf(key) !== -1}"
                                        value="${this.item[key] || ''}"
                                        @value-changed="${(event) => this.onValueChange(event, key)}"></cupio-input>` : html`
                        `}
                        </div>
                    `)}
                    <div
                            class="save"
                            @click="${this.save}"
                            ?disabled="${!this.changed}">
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
            priceDiff: {
                type: Number,
            },
            couriers: {
                type: Array,
            },
            disableds: {
                type: Array,
            },
            disabled: {
                type: Boolean,
                reflect: true,
            },
            panel: {
                type: Boolean,
            },
            saved: {
                type: Boolean,
            },
            cantSave: {
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
        this.priceDiff = 0;
        this.disableds = [
            'id',
            'service',
            'client',
            'clientEmail',
            'takeCourier',
            'deliveryCourier',
            'price',
            'payed'
        ];
        this._alreadySent = false;
        this.item = {};
        handleRequest().then(r => this.panel = r === 'admin');
        this.loadCouriers();
    }

    drawerClose(event = 'closed') {
        this.item = {};
        this.dispatchEvent(new CustomEvent(event));
    }

    updated(_changedProperties) {
        super.updated(_changedProperties);
        if (_changedProperties.has('opened')) {
            this.saved = false;
            this.changed = false;
            if (this.opened) document.documentElement.classList.add('no-scroll');
            else document.documentElement.classList.remove('no-scroll');
            if (this.panel) this.loadDetails();
            this.newItem = {...this.item};
        }
    }

    deliveryChangeTitle() {
        if (this.item.status === 'ჩაბარებული') return 'დასრულებულია';
        return 'კურიერის მინიჭება';
    }

    deliveryChangeValue() {
        return '';
    }

    getCourierType(){
        switch (this.item.status){
            case 'ასაღები':
            case 'განხილვაშია':
                return 'takeCourier';
            case 'აღებული':
            case 'ჩასაბარებელი':
            case 'ჩაბარებული':
                return 'deliveryCourier';
            }
    }

    changePayed(event) {
            const payed = event.currentTarget.checked
        const gql =` 
            mutation {
                changePayed(
                    id: "${this.newItem.id}"
                    payed: ${payed}
            )
            }
        `
        this.graphqlPost(gql).then(r=> {
            this.loadDetails();
            this.saved = true;
        });
    }

    cashPay(event) {
        const payed = event.currentTarget.checked
        const gql =` 
            mutation {
                cashPay(
                    id: "${this.newItem.id}"
                    cashPayed: ${payed}
            )
            }
        `
        this.graphqlPost(gql).then(r=> {
            if(this.panel) this.loadDetails();
            this.saved = true;
            this.item.cashPayed = payed;
            this.newItem.cashPayed = payed;
        });
    }

    cashTransfer(event) {
        const cashTransfered = event.currentTarget.checked
        const gql =` 
            mutation {
                cashTransfer(
                    id: "${this.newItem.id}"
                    cashTransfered: ${cashTransfered}
            )
            }
        `
        this.graphqlPost(gql).then(r=> {
            if(this.panel) this.loadDetails();
            this.saved = true;
        });
    }

    getStatus(status){
        if(status=== 'აღებული' && this.item.deliveryCourier)
            return 'ჩასაბარებელი';
        return status;
    }

    onValueChange(event, key) {
        if (!this.newItem) this.newItem = {...this.item};
        const value = event.detail;
        if(key === 'status'){
            this._onStatusChange(value);
        } else {
            this.changed = true;
        }
        this.newItem[key] = value;
    }

    changePrice(event){
        this.priceDiff = parseFloat(event.detail);

        const gql = `mutation{
              changePrice(
                id: "${this.newItem.id}",
                priceDiff: ${this.priceDiff},
               )
              }`
        this.graphqlPost(gql).then(r=> {
                this.loadDetails();
                this.saved = true;
                this.priceDiff = 0;
            }
        );
    }

    courierChanged(e) {
        const value = e.target.value;
        const gql = `mutation{
              changeCourier(
                id: "${this.newItem.id}",
                courier: "${value}",
               )
              }`
        this.graphqlPost(gql).then(r=> {
                this.loadDetails();
                this.saved = true;
            }
        );
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
        this.graphqlPost(gql).then(({data: {usersDetails}}) => {
            this.couriers = usersDetails;
        })
    }

    loadDetails() {
        this.cantSave = true;
        const gql = `
            {
              getDetails(id:"${this.item.id}"){
                takeAddress
                deliveryAddress
                description
                phone
                deliveryPhone
                registerDate
                takeDate
                deliveryDate
                id
                service
                client: clientName
                clientEmail: client
                status
                takeCourier
                deliveryCourier
                price
                payed
                cash
                cashPayed
                cashTransfered
              }
            }
        `;

        this.graphqlPost(gql).then(({data: {getDetails}}) => {
            this.item = {...getDetails};
            this.newItem = {...getDetails};
            this.cantSave = false;
        })
    }

    save() {
        if(this.cantSave) return;
        this.cantSave = true;
        const gql = `mutation{
              updateData(
                id: "${this.newItem.id || ''}",
                takeAddress: "${this.newItem.takeAddress || ''}",
                deliveryAddress: "${this.newItem.deliveryAddress || ''}",
                cash: ${this.newItem.cash || 0},
                deliveryPhone: "${this.newItem.deliveryPhone || ''}",
                takeDate: "${this.newItem.takeDate || ''}",
                deliveryDate: "${this.newItem.deliveryDate || ''}",
                description: "${this.newItem.description || ''}",
                phone: "${this.newItem.phone || ''}",
              )
            }`

        this.graphqlPost(gql).then(()=> {
            this.drawerClose('updated');
        })
            .catch(r=> console.warn(r) );
    }

    cancel(){
        const gql = `
        mutation {
            cancelOrder(id: "${this.item.id}")
        }`
        this.graphqlPost(gql).then(()=> {
            // window.location.reload();
            this.drawerClose('updated');
        })
            .catch(r=> console.warn(r));
    }

    _onStatusChange(value){
        if(value === 'ჩაბარებული' && this.newItem.cash && !this.newItem.cashPayed){
            this.cantSave = true;
            if(window.confirm('თანხა აღებულია?')){
                setTimeout(()=> this.cantSave = false, 60);
                this.item.cashPayed = true;
                this.newItem.cashPayed = true;
                this.item.status = value;
                this.newItem.status = value;
                this.cashPay({currentTarget: {checked:true}});
            }else {
                setTimeout(()=> this.cantSave = false, 60);
                return;
            }
        }
        const gql = `mutation{
              changeStatus(id: "${this.newItem.id}", status: "${value}")
              }`
        this.graphqlPost(gql).then(r=> {
                if(this.panel) this.loadDetails();
                this.saved = true;
            }
        );
    }

    async graphqlPost(gql){
        this.disabled = true;
        const resp = await graphqlPost(gql);
        this.disabled = false;
        return resp;
    }
}

customElements.define('cupio-drawer', CupioDrawer);
