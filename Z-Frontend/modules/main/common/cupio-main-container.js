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
                grid-template-columns: auto 96px 2fr 2fr 1fr 1fr auto;
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
                    <span>შეკვეთების ისტორია (${this.items.length})</span>
                    <span>ხელმისაწვდომი თანხა (${this.budget})</span>
                    <a class="link" href="/new">
                        შეკვეთის დამატება
                        <img src="/Z-Frontend/images/icons/add.svg">
                    </a>
                </div>
                <div class="title delivery">
                    <span>${this.status || ''} ჩანაწერები ნაჩვენებია ${this.items.length}</span>
                </div>
                ${this.items.length ? html`
                    <cupio-main-table
                            class="table"
                            ?delivery="${this.delivery}"
                            .menu="${this.menu}"
                            .items="${this.items}"
                            .status="${this.status}"
                    ></cupio-main-table>

                ` : ''}
                <div class="list-items">
                    ${this.items.map((item) => html`
                        <cupio-delivery-item
                                .item="${item}"
                                @click="${() => this.drawerToggle(item)}""
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
                    'დამატებითი ინფორმაცია',
                    'ტელეფონის ნომერი',
                    'სტატუსი',
                    '',
                ];
            } else {
                this.menu = [
                    'ID',
                    'ჩაბარების თარიღი',
                    'ჩაბარების მისამართი',
                    'დამატებითი ინფორმაცია',
                    'ტელეფონის ნომერი',
                    'სტატუსი',
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

    drawerToggle(item) {
        if (!this.delivery) return;

        if (!this.drawerOpened) this.shadowRoot.querySelector('#drawer').item = item;
        this.drawerOpened = !this.drawerOpened;
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
                    id
                    takeDate
                    takeAddress
                    description
                    phone
                    status
                    takeCourier
                    canceled
                    payed
                    clientName
                    client
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
                    id
                    deliveryDate
                    deliveryAddress
                    description
                    deliveryPhone
                    status
                    deliveryCourier
                    canceled
                    payed
                    clientName
                    client
                }
            }
        `;
            }
        }
        graphqlPost(gql).then((res) => {
            let data = res.data.data;
            data.map((item) => {
                if (this.delivery) item.description = item.clientName + ' - ' + item.description;
                delete item.clientName;
                return item;
            })
            if(this.skip){
                this.items = [...this.items, ...data];
            } else {
                this.items = data;
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
