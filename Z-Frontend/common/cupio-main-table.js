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
                pointer-events: none;
            }
            
            .header[address] {
                color: black;
                cursor: pointer;
                pointer-events: auto;
            }
            
            .header[address]:hover {
                background: rgb(230,230,230);
                border-radius: 8px;
            }

            .drop-down {
                font-weight: bold;
                font-size: 24px;
                padding: 0 8px;
                display: flex;
                cursor: pointer;
                align-items: center;
            }

            .id {
                font-weight: bold;
            }

            img {
                margin-right: 4px;
                width: 20px;
                height: 20px;
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
                <span class="header" 
                    ?address="${item.includes('მისამართი')}"
                    @click="${()=> this.menuClick(item)}"
                >${item}</span>
            `)}
            ${this.items.map((item) => html`${Object.keys(item).map((key) =>
                    !key.includes('Courier') && key !== 'canceled' && key !== 'payed' && key !== 'cashPayed' && key !== 'cashTransfered' && key !== 'cash' && key !=='client' && key !== 'clientEmail' ? html`
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
                                `: key === 'price' && this.delivery && !this.panel ? "" :

                                        key.includes('Address')? item[key] + "("+ this.items.filter((r)=> r[key] === item[key]).length +')': item[key]
                                       
            }
                            ${key === 'price' && (!this.delivery || (this.delivery && this.panel)) ? html`
                                ₾ ` : ''}
                        </span>
                    ` : '')}
            ${this.delivery ? html`
                <span class="drop-down"
                      @click="${() => this.drawerToggle(item)}">
                    
                    ...
                
                        ${this.panel && item.payed ? html`
                            <img class="img" src="/Z-Frontend/images/icons/payed.svg" style="margin-left: 6px">
                        ` : ''}
                        ${this.delivery && item.cash ? (item.cashPayed ?( item.cashTransfered ? html`
                            <img class="img" src="/Z-Frontend/images/icons/cash_transfered.svg" style="margin-left: 6px">
                        `: html`
                                    <img class="img" src="/Z-Frontend/images/icons/cash_taken.svg" style="margin-left: 6px">
                                `):
                                html`
                            <img class="img" src="/Z-Frontend/images/icons/cash.svg" style="margin-left: 6px">
                        `) : ''}</span>
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
                    @updated="${this.drawerUpdated}"
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

    drawerUpdated(){
        this.drawerToggle();
        this.dispatchEvent(new CustomEvent('updated'));
    }

    drawerToggle(item, key) {
        if (!this.delivery || key === 'phone' || key === 'deliveryPhone') return;
        if (!this.drawerOpened) {
            this.shadowRoot.querySelector('#drawer').item = item;
            this.shadowRoot.querySelector('#drawer').cantSave = false;
        }
        if(this.shadowRoot.querySelector('#drawer').saved) {
            this.dispatchEvent(new CustomEvent('updated'));
        }
        this.drawerOpened = !this.drawerOpened;
    }

    menuClick(item){
        if(item === 'აღების მისამართი'){
            this.items = this.items.sort((item1,item2)=> item1.takeAddress > item2.takeAddress ? 1: -1)
        }
        if(item === 'ჩაბარების მისამართი'){
            this.items = this.items.sort((item1,item2)=> item1.deliveryAddress > item2.deliveryAddress ? 1: -1)
        }
        this.items= [...this.items]
    }

    isWarning(item) {
        if (item.status === 'ჩასაბარებელი' && !item.deliveryCourier) return true;
        if (item.status === 'ასაღები' && !item.takeCourier) return true;
        return false;
    }
}

customElements.define('cupio-main-table', CupioMainTable);
