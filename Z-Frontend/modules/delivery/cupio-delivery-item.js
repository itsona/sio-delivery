import {LitElement, html, css} from 'lit-element';
import {localize} from "../../mixins/localize";
import {graphqlPost} from "../../mixins/graphql";

class CupioDeliveryItem extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: grid;
                grid-template-columns: 1fr 2fr 2fr 1fr 1fr auto;
                border-bottom: 1px solid rgb(223, 223, 223);
                min-height: 92px;
                max-width: 100%;
                transition: all 0.2s;
                gap: 24px;
                padding: 12px;
            }

            :host(:hover) {
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                border-radius: 12px;
                overflow: hidden;
            }

            .item {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                gap: 12px;
            }

            .title {
                font-weight: bold;
            }

            .take {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .take > div {
                border-radius: 12px;
                padding: 6px 12px;
                cursor: pointer;
                color: white;
                text-align: center;
                font-weight: bold;
            }

            .accept {
                background-color: green;
            }

            .decline {
                background-color: red;
            }

            @media only screen and (max-width: 800px) {
                :host {
                    grid-template-columns: 1fr;
                    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 24px;
                }

                .take {
                    flex-direction: row;
                }

                .status {
                    font-weight: 600
                }

            }
        `;
    }

    render() {
        return html`
            ${Object.keys(this.item).map((key) => key !== 'id' ? html`
                <div class="item">
                    <span class="title">
                        ${localize(key)}
                    </span>
                    <span claass="value ${key}"
                          style="color: ${key === 'status' ? this.getStatusColor(this.item.status) : 'black'}">
                        ${this.item[key]}
                    </span>
                </div>
            ` : '')}
            ${this.delivery ? html`
                <div class="take">
                    <div class="accept" @click="${() => this.handleAccept(true)}">აღება</div>
                    <div class="decline" @click="${() => this.handleAccept(false)}">უარყოფა</div>
                </div>
            ` : ''}
        `
    }

    static get properties() {
        return {
            item: {
                type: Object,
            },
            delivery: {
                type: Boolean,
            },
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

    handleAccept(accept) {
        const gql = `
            mutation {
                handleAccept(id: "${this.item.id}", accepted:${accept}, status: "${this.item.status}")
            }
        `
        graphqlPost(gql).then(({r}) => {
            this.dispatchEvent(new CustomEvent('accepted'));
        })
    }

}

customElements.define('cupio-delivery-item', CupioDeliveryItem);
