import {LitElement, html, css} from 'lit-element'
import '../../../common/cupio-main-table';
import '../../../common/cupio-loading';
import '../../delivery/cupio-delivery-item';

import '../../../common/cupio-drawer';
import {graphqlPost} from "../../../mixins/graphql";


class CupioMainContainer extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                gap: 24px;
                padding: 24px 32px;
                flex-grow: 1;
                justify-content: space-between;
            }


            .save {
                display: flex;
                margin-left: 24px;
                margin-top: 24px;
                align-self: center;
                padding: 12px;
                background: dodgerblue;
                border-radius: 12px;
                color: white;
                cursor: pointer;
                margin-bottom: 24px;
            }

            .column {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex-grow: 1;
            }

            .table-head {
                display: grid;
            }

            .title {
                font-weight: bold;
                color: grey;
                font-size: 20px;
                padding-bottom: 12px;
                display: flex;
                justify-content: space-between;
            }

            .table {
                grid-template-columns: auto 96px 96px 2fr 2fr 2fr auto 1fr  auto;
            }

            .link {
                color: black;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                transition: color 0.5s;
                display: flex;
            }

            .link:hover {
                color: gray;
            }

            .link img {
                width: 14px;
                display: flex;
                align-self: baseline;
                padding-left: 4px;
            }

            .load {
                align-self: center;
            }

            .list-items {
                display: none;
            }

            :host([delivery]) .main {
                display: none;
            }

            :host([delivery]) .table {
                grid-template-columns: auto 96px 2fr 2fr 2fr 1fr 1fr auto auto;
            }

            :host(:not([delivery])) .delivery {
                display: none;
            }

            :host([loading]) #loading {
                display: flex;
                flex-grow: 1;
            }

            :host([loading]) .column, #loading {
                display: none;
            }

            @media only screen and (max-width: 800px) {
                :host {
                    padding-top: 64px;
                }

                .link {
                    order: 1;
                }

                .link > img {
                    display: none;
                }

                .title {
                    flex-direction: column-reverse;
                }

                .table {
                    display: none;
                }

                .list-items {
                    display: grid;
                    width: 100%;
                }

                .column {
                    width: 100%;
                }
            }
        `;
    }

    render() {
        return html`
            <cupio-loading id="loading"></cupio-loading>
            <div class="column">
                <div class="title main">
                    <span>შეკვეთების ისტორია (${this.count || 0})</span>
                    <span>ხელმისაწვდომი თანხა (${this.budget})</span>
                    <a class="link" href="/new">
                        შეკვეთის დამატება
                        <img src="/Z-Frontend/images/icons/add.svg">
                    </a>
                </div>
                
                <div style="display: flex; align-items: center">
                    <span style="font-weight: bold; display: flex; flex-grow: 1">გადახდა შესაძლებელია პირდაპირ ჩვენი სისტემიდან: </span>
                <cupio-input
                        class="input"
                        place-holder="შეიყვანეთ თანხა"
                        name="payment"
                        value="${this.budget}"
                        @value-changed="${(event) => this.payAmount = event.detail}"
                ></cupio-input>
                    <div class="save"
                    @click="${this.onPaymentClick}">გადახდა ${this.payAmount || this.budget}</div>
                </div>
                <div class="title delivery">
                    <span>${this.status || ''} ჩანაწერების რაოდენობა ${this.count || 0}</span>
                </div>
                ${this.items.length ? html`
                    <cupio-main-table
                            class="table"
                            ?delivery="${this.delivery}"
                            .menu="${this.menu}"
                            .items="${this.items}"
                            .status="${this.status}"
                            @updated="${this.drawerUpdated}""
                    ></cupio-main-table>

                ` : ''}
                <div class="list-items">
                    ${this.items.map((item) => html`
                        <cupio-delivery-item
                                .item="${item}"
                                @click="${() => this.drawerToggle(item)}"
                        ></cupio-delivery-item>
                    `)}
                </div>

                ${this.shouldLoadMore ? html`
                    <div
                            class="link load"
                            @click="${this.loadData}">
                        მეტის ნახვა
                    </div>` : ''}
            </div>

            <cupio-drawer
                    id="drawer"
                    ?opened="${this.drawerOpened}"
                    @closed="${this.drawerToggle}"
                    @click="${this.drawerToggle}"
            ></cupio-drawer>


        `
    }

    static get properties() {
        return {
            items: {
                type: Array,
            },
            searchWord: {
                type: String,
            },
            status: {
                type: String,
            },
            payAmount: {
                type: Number,
            },
            loading: {
                type: Boolean,
                reflect: true,
            },
            menu: {
                type: Array,
            },
            delivery: {
                type: Boolean,
            },
            count: {
                type: Number,
            },
            drawerOpened: {
                type: Boolean,
            },
            shouldLoadMore: {
                type: Boolean,
            },
            searchValues: {
                type: Object,
            },
            budget: {
                type: Object,
            }
        };
    }

    constructor() {
        super();
        const version = '1.0.1';
        if(window.localStorage.getItem('version') !== version){
            window.localStorage.setItem('version', version);
            setTimeout(()=> window.location.reload(true), 50);
        }
        this.loading = true;
        this.loadedLength = 10;
        this.searchValues = {}
        this.skip = 0;
        this.limit = this.loadedLength;
        this.items = [];
        window.scrollTo(0, 0);
        this.menu = [
            'ID',
            'აღების თარიღი',
            'ჩაბარების თარიღი',
            'აღების მისამართი',
            'ჩაბარების მისამართი',
            'დამატებითი ინფორმაცია',
            'ფასი',
            'სტატუსი',
            ''
        ];
        this.loadBudget();
    }

    onPaymentClick() {
        const amount = parseFloat(this.payAmount) || this.budget;
        const gql = `
            mutation {
                payWithPayze(amount: ${amount})
            }
        `
        graphqlPost(gql).then(({data:{payWithPayze}})=> {
            if(payWithPayze)
                window.open(payWithPayze, "_blank");
            else {
                window.alert('ტექნიკური ხარვეზი')
            }

        })
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadData();
    }

    update(changedProperties) {
        super.update(changedProperties);
        if (changedProperties.has('delivery') || changedProperties.has('items') && this.delivery) {
            if (this.status === 'ასაღები') {
                this.menu = [
                    'ID',
                    'აღების თარიღი',
                    'აღების მისამართი',
                    'ჩაბარების მისამართი',
                    'დამატებითი ინფორმაცია',
                    'ტელეფონის ნომერი',
                    'სტატუსი',
                    '',
                    '',
                ];
            } else {
                this.menu = [
                    'ID',
                    'ჩაბარების თარიღი',
                    'აღების მისამართი',
                    'ჩაბარების მისამართი',
                    'დამატებითი ინფორმაცია',
                    'ტელეფონის ნომერი',
                    'სტატუსი',
                    '',
                    '',
                ];
            }
        }
        if (changedProperties.has('searchValues')) {
            this.items = [];
            this.skip = 0;
            if (Object.keys(this.searchValues).length) this.loadData();
        }
    }

    drawerUpdated(){
        this.dispatchEvent(new CustomEvent('need-to-change',{bubbles: true, composed: true}));
    }

    loadAfterChange() {
        const additional = this.loadedLength - (this.items.length % this.loadedLength || this.loadedLength);
        this.limit = this.items.length + additional;
        this.skip = 0;
        this.needReload = true;
        this.loadData();
    }


    loadBudget() {
        const gql = `
            {
                loadBudget
            }
        `
        graphqlPost(gql).then(({data: {loadBudget}}) => this.budget = loadBudget);
    }

    loadWithStatus(status) {
        this.status = status;
        this.skip = 0;
        this.items = [];
        this.loadData();
    }

    loadData() {
        let gql = `
            {
                data(
                    ${this.status ? `status: "${this.status}"` : ''}
                    ${this.searchValues.from ? `from: ${this.searchValues.from}` : ''}
                    ${this.searchValues.to ? `to: ${this.searchValues.to}` : ''}
                    ${this.searchValues.fromDate ? `fromDate: "${this.searchValues.fromDate}"` : ''}
                    ${this.searchValues.toDate ? `toDate: "${this.searchValues.toDate}"` : ''}
                    ${this.searchValues.searchWord ? `searchWord: "${this.searchValues.searchWord}"` : ''}
                    skip: ${this.skip}
                    limit: ${this.limit}
                )
                {
                    count
                    id
                    takeDate
                    deliveryDate
                    takeAddress
                    deliveryAddress
                    description
                    price
                    status
                    payed
                }
            }
        `;
        if (this.delivery) {
            if (this.status === 'ასაღები') {
                gql = `{
                data(
                    status: "${this.status}"
                    ${this.searchValues.from ? `from: ${this.searchValues.from}` : ''}
                    ${this.searchValues.to ? `to: ${this.searchValues.to}` : ''}
                    ${this.searchValues.fromDate ? `fromDate: "${this.searchValues.fromDate}"` : ''}
                    ${this.searchValues.toDate ? `toDate: "${this.searchValues.toDate}"` : ''}
                    ${this.searchValues.searchWord ? `searchWord: "${this.searchValues.searchWord}"` : ''}
                    skip: ${this.skip}
                    limit: ${this.limit}
                ){
                    count
                    id
                    takeDate
                    takeAddress
                    deliveryAddress
                    cash
                    description
                    phone
                    status
                    cashPayed
                    cashTransfered
                    takeCourier
                    canceled
                    clientName
                    client
                    price
                    payed
                }
            }`
            } else {
                gql = `
            {
                data(
                    status: "${this.status}"
                    ${this.searchValues.from ? `from: ${this.searchValues.from}` : ''}
                    ${this.searchValues.to ? `to: ${this.searchValues.to}` : ''}
                    ${this.searchValues.fromDate ? `fromDate: "${this.searchValues.fromDate}"` : ''}
                    ${this.searchValues.toDate ? `toDate: "${this.searchValues.toDate}"` : ''}
                    ${this.searchValues.searchWord ? `searchWord: "${this.searchValues.searchWord}"` : ''}
                    skip: ${this.skip}
                    limit: ${this.limit}
                ){
                    count
                    id
                    deliveryDate
                    takeAddress
                    deliveryAddress
                    cash
                    description
                    deliveryPhone
                    status
                    cashPayed
                    cashTransfered
                    deliveryCourier
                    canceled
                    clientName
                    client
                    price
                    payed
                }
            }
        `;
            }
        }
        graphqlPost(gql).then((res) => {
            let data = res.data.data;
            if(data[0]) {
                this.count = data[0] && data[0].count
            }
            data.map((item) => {
                if (this.delivery) item.description = item.clientName + ' - ' + item.description;
                delete item.clientName;
                delete item.count
                return item;
            })
            if(this.skip){
                this.items = [...this.items, ...data];
            } else {
                this.items = data;
                if(this.needReload) {
                    this.skip = this.items.length;
                    this.limit = this.loadedLength;
                    this.needReload = false;
                    this.loading = false;
                    if(!data.length || (data.length % this.loadedLength)) {
                        this.shouldLoadMore = false;
                    }
                    else this.shouldLoadMore = true;
                    return;
                }
            }
            this.loading = false;
            if (data.length >= this.loadedLength) {
                this.shouldLoadMore = true;
                this.skip += this.loadedLength;
            } else {
                this.shouldLoadMore = false;
            }
        })
    }
}

customElements.define('cupio-main-container', CupioMainContainer);
