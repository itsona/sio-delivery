import {LitElement, html, css} from 'lit-element';
import './cupio-drawer';
import {handleRequest} from "../mixins/graphql";

class CupioMainTable extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: grid;
                border-bottom: 1px solid rgb(223, 223, 223);
                align-items: center;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                border-radius: 12px;
                padding: 12px 12px 0 12px;
            }

            :host([delivery]) .item {
                cursor: pointer;
            }

            :host([delivery]) .item[warning] + .drop-down {
                color: orange;
            }

            :host([delivery]) .item[error] + .drop-down {
                color: red;
            }

            :host > span {
                display: flex;
                flex-grow: 1;
                height: 100%;
                align-items: center;
                padding: 8px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.2);
                box-sizing: border-box;
            }

            .header, .status {
                font-weight: bold;
                color: grey;
            }

            .drop-down {
                font-weight: bold;
                font-size: 24px;
                padding: 0 8px;
                display: flex;
                cursor: pointer;
            }

            .id {
                font-weight: bold;
            }

            img {
                margin-right: 4px;
            }
            .phone {
                color: unset;
                text-decoration: none;
                display: flex;
                flex-grow: 1;
                height: 100%;
                align-items: center;
            }
        `;
    }

    render() {
        return html`
            ${this.menu.map((item) => html`
                <span class="header">${item}</span>
            `)}
            ${this.items.map((item) => html`${Object.keys(item).map((key) =>
                    !key.includes('Courier') && key !== 'canceled' && key !== 'payed' ? html`
                        <span class="${key} item"
                              ?warning="${this.isWarning(item)}"
                              ?error="${this.panel && item.canceled}"
                              @click="${() => this.drawerToggle(item, key)}"
                              style="color: ${key === 'status' ? this.getStatusColor(item.status) : 'black'}"
                        >
                            ${this.delivery && key === 'status' ? this.status : 
                                    key === 'status' ?
                                item[key] === 'ასაღები' ? 'მიღებულია' : item[key]: 
                                key === 'phone' || key ==='deliveryPhone' ? html`
                                    <a class="phone" href="tel:${item[key]}">${item[key]}</a>
                                `: item[key]
            }
                            ${key === 'price' ? html`
                                ₾ ` : ''}
                        </span>
                    ` : '')}
            ${this.delivery ? html`
                <span class="drop-down"
                      @click="${() => this.drawerToggle(item)}">
                    
                        ${this.panel && item.payed ? html`
                            <img class="img" src="/Z-Frontend/images/icons/payed.svg">
                        ` : ''}
                    ...</span>
            ` : item.payed ? html`
                <span>
                    <img class="img item" src="/Z-Frontend/images/icons/payed.svg">
                    </span>
            ` : html`<span></span>`}
            `)}
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
            menu: {
                type: Array,
            },
            delivery: {
                type: Boolean,
            },
            drawerOpened: {
                type: Boolean,
            },
            status: {
                type: String,
            },
            panel: {
                type: Boolean,
            }
        };
    }

    constructor() {
        super();
        handleRequest().then(r => this.panel = r === 'admin')
    }

    getStatusColor(status) {
        if(status === 'გაუქმებულია') return 'red';
        if (status === 'ჩაბარებული' || (status === 'აღებული' && this.delivery)) return 'green';
        if (status === 'ჩასაბარებელი' || (status === 'აღებული' && !this.delivery)) return 'sandybrown';
        return 'grey'
    }

    drawerToggle(item, key) {
        console.log(item)
        if (!this.delivery || key === 'phone' || key === 'deliveryPhone') return;
        if (!this.drawerOpened) this.shadowRoot.querySelector('#drawer').item = item;
        this.drawerOpened = !this.drawerOpened;
    }

    isWarning(item) {
        if (item.status === 'ჩასაბარებელი' && !item.deliveryCourier) return true;
        if (item.status === 'ასაღები' && !item.takeCourier) return true;
        return false;
    }
}

customElements.define('cupio-main-table', CupioMainTable);
