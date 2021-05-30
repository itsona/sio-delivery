import {LitElement, html, css} from 'lit-element';
import {localize} from "../../mixins/localize";
import '../../common/cupio-input';
import {graphqlPost} from "../../mixins/graphql";

class CupioAdminItem extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr 2fr auto;
                border-bottom: 1px solid rgb(223, 223, 223);
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

            .rates {
                display: flex;
                padding: 0;
                align-items: center;
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

                    ${key === 'rates' ? Object.keys(this.item[key]).map((rate) => html`
                        <div class="rates">
                            <span>${localize(rate)}</span>
                            <cupio-input
                                    class="rates"
                                    name="${rate}"
                                    .value="${this.item[key][rate]}"
                                    @value-changed="${this.onRateChange}"
                            ></cupio-input>
                        </div>
                    `) : html`
                        <span claass="value ${key}"
                              style="color: ${key === 'status' ? this.getStatusColor(this.item.status) : 'black'}">
                        ${this.item[key]}
                        
                    ${key === 'budget' ? html`
                        <cupio-input
                                with-sign
                                name="budget"
                                .value="0"
                                @add-request="${this.setBudget}"></cupio-input>
                    ` : ''}
        </span>
                        </div>
                    `}
            ` : '')}
            <div class="take">

                ${!this.delivery ? html`
                    <div class="accept" @click="${() => this.setCourier(true)}">დანიშვნა</div>
                ` : html`
                    <div class="decline" @click="${() => this.setCourier(false)}">მოხსნა</div>
                    </div>
                `}
                ${this.needToSave ? html`
                    <div class="accept" @click="${this.saveRates}">შენახვა</div>
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
            needToSave: {
                type: Boolean,
            }
        };
    }

    constructor() {
        super();
        this.values = {};
    }


    getStatusColor(status) {
        if (status === 'ჩაბარებული' || (status === 'აღებული' && this.delivery)) return 'green';
        if (status === 'ჩასაბარებელი' || (status === 'აღებული' && !this.delivery)) return 'sandybrown';
        return 'grey'
    }

    setCourier(isCourier) {
        const gql = `
            mutation {
            setCourier(
                courier: ${isCourier}
                    client: "${this.item.email}"
        
        )
        }

`
        graphqlPost(gql).then(() => {
            this.dispatchEvent(new CustomEvent('status-changed'));
        });
    }

    setBudget(event) {
        const gql = `
            mutation{
                setBudget(client: "${this.item.email}", budget: ${parseFloat(event.detail)})
            }
        `
        graphqlPost(gql).then(({data: {setBudget}}) => {
            this.dispatchEvent(new CustomEvent('status-changed'));
        });
    }

    onRateChange(e) {
        const rate = e.currentTarget.name;
        const value = e.detail;
        this.needToSave = true;
        this.values[rate] = parseFloat(value);
    }

    saveRates() {
        let valuesString = '';
        Object.keys(this.values).forEach((key) => {
            const oneItem = `${key}: "${this.values[key]}",`
            valuesString += oneItem;
        })

        const gql = `
            mutation{
                setRates(client: "${this.item.email}", ${valuesString})
            }
        `
        graphqlPost(gql).then(() => {
            // this.dispatchEvent(new CustomEvent('status-changed'));
            this.needToSave = false;
        })
    }
}

customElements.define('cupio-admin-item', CupioAdminItem);
