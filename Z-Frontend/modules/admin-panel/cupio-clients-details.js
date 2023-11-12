import {LitElement, html, css} from 'lit-element';
import '../../common/cupio-input';
import {graphqlPost} from "../../mixins/graphql";

class CupioClientsDetails extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            .container {
                position: relative;
            }

            .list {
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                display: flex;
                border-radius: 12px;
                padding: 12px;
                flex-direction: column;
                position: absolute;
                top: 48px;
                z-index: 2;
                background: white;
                width: 100%;
            }
            .user {
                border-bottom: solid 1px  grey;
                padding: 4px 0;
                cursor: pointer;
            }
            .user:hover{
                border-radius: 8px;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
            }
        `;
    }

    render() {
        return html`
            <div class="container">
                <cupio-input
                        name="key"
                        value="${this.client}"
                        @value-changed="${(event) => this.onValueChange(event)}"></cupio-input>
                ${this.listShow ? html`
                <div class="list">
                    ${this.users.map((user) => html`
                        <span class="user" @click="${()=> this.setClient(user)}">${user.name} - ${user.email}</span>
                    `)}
                </div>
                `:''}
            </div>
        `
    }

    static get properties() {
        return {
            clients: {
                type: Array,
            },
            users: {
                type: Array,
            },
            client: {
                type: String,
            },
            listShow: {
                type: Boolean,
                reflect: true,
            },
        };
    }

    constructor() {
        super();
        this.clients = [];
        this.users = [];
        this.client = '';
    }

    onValueChange(event, key) {
        const value = event.detail;
        this.dispatchEvent(new CustomEvent('filter-changed', {detail: value}))
    }

    setClient(user){
        this.client = user.name;
        this.dispatchEvent(new CustomEvent('client-changed', {detail: user}))
    }

}

customElements.define('cupio-clients-details', CupioClientsDetails);
