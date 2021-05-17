import {LitElement, html, css} from 'lit-element';
import './cupio-drawer';

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

            :host([delivery]) .item[warning]+.drop-down {
                color: orange;
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
        `;
    }

    render() {
        return html`
            ${this.menu.map((item) => html`
                <span class="header">${item}</span>
            `)}
            ${this.items.map((item) => html`${Object.keys(item).map((key) =>
                    !key.includes('Courier') ? html`
                        <span class="${key} item"
                              ?warning="${this.isWarning(item)}"
                              @click="${() => this.drawerToggle(item)}"
                              style="color: ${key === 'status' ? this.getStatusColor(item.status) : 'black'}"
                        >
                            ${item[key]}${key === 'price' ? '₾' : ''}
                </span>
                    ` : '')}
            ${this.delivery ? html`
                <span class="drop-down"
                      @click="${() => this.drawerToggle(item)}">...</span>
            ` : ''}
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
            }
        };
    }

    constructor() {
        super();
    }

    getStatusColor(status) {
        if (status === 'ჩაბარებული' || (status === 'აღებული' && this.delivery)) return 'green';
        if (status === 'ჩასაბარებელი' || (status === 'აღებული' && !this.delivery)) return 'sandybrown';
        return 'grey'
    }

    drawerToggle(item) {
        if (!this.delivery) return;

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
