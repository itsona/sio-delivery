import {LitElement, html, css} from 'lit-element';
import './cupio-admin-item';
import '../../common/cupio-input';
import {graphqlPost, handleRequest} from "../../mixins/graphql";
import {redirectTo} from "../../mixins/redirectTo";

class CupioAdminLogs extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                min-height: 100vh;
                box-sizing: border-box;
                flex-direction: column;
            }

            .container {
                margin: 0 64px 48px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                min-height: 100%;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                padding: 4px 32px 0;
                gap: 12px;
                background: white;
            }

            .logo {
                display: flex;
                justify-content: center;
                width: 100%;
                padding-bottom: 48px;
            }

            .delivery-item {
                display: flex;
                width: 100%;
                gap: 24px;
                align-items: center;
            }

            .title {
                font-weight: bold;
                color: grey;
                font-size: 20px;
                padding-bottom: 12px;
                display: flex;
                justify-content: space-between;
            }

            .link {
                color: black;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                transition: color 0.5s;
                display: flex;
                padding-bottom: 16px;
                align-self: baseline;
            }

            .link:hover {
                color: gray;
            }

            .links {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .link img {
                width: 14px;
                display: flex;
                align-self: baseline;
                padding-left: 4px;
                transform: rotate(180deg);
            }

            @media only screen and (max-width: 800px) {
                :host {
                    align-items: center;
                }

                .container {
                    margin: 0 24px 48px;
                }
            }

        `;
    }

    render() {
        return html`
            <cupio-logo></cupio-logo>

            <div class="container">
                <div class="links">
                    <a class="link" href="/admin">
                        <img src="/Z-Frontend/images/icons/next-svgrepo-com.svg">
                        უკან დაბრუნება
                    </a>
                    <a class="link" href="/new">
                        შეკვეთის დამატება
                        <img src="/Z-Frontend/images/icons/add.svg">
                    </a>
                </div>
                <div class="links">
                    Email:
                    <cupio-input
                        name="name"
                        .placeholder="Email"
                        @value-changed="${(value)=> this.filter(value, 'courier')}"
                    ></cupio-input>
                    დან:
                    <cupio-input
                        name="date"

                        @value-changed="${(value)=> this.filter(value, 'from')}"
                    ></cupio-input>
                    მდე:
                    <cupio-input
                        name="date"

                        @value-changed="${(value)=> this.filter(value, 'to')}"
                    ></cupio-input>
                </div>
                ${this.logs.map((item)=> html`

                    <div class="delivery-item">
                        <cupio-admin-item
                                style="width: 100%"
                                hideAction
                                .item="${item}"></cupio-admin-item>

                    </div>
                        `
                    
                )}
                
            </div>

        `
    }

    static get properties() {
        return {
            logs: {
                type: Array,
            },
            unfiltered: {
                type: Array,
            }
        };
    }

    constructor() {
        super();
        this.loadAll();
        this.logs = [];
        this.filters = {courier: '', from: 0, to: new Date()};
        if (window.localStorage.getItem('isEmployee')) redirectTo('/panel')
        handleRequest(false).then(r => {
            if (r !== 'admin') redirectTo('/client')
        })
    }

    loadAll() {
        this.loadCouriers();
    }

    filter(value, type){
        this.filters[type] = value.detail;
        this.logs = this.unfiltered.filter((item)=> {
            let courierCheck = item.courier.includes(this.filters.courier);
            let fromCheck = item.date >= new Date(this.filters.from).getTime();
            let toCheck = item.date <= new Date(this.filters.to).getTime();
            return courierCheck && fromCheck && toCheck;
        })
    }

    loadCouriers() {
        const gql = `
        {
        getLog{
            courier
            date
            oldBudget
            change
            newBudget
          }
        }
            `
        graphqlPost(gql).then(({data:{getLog}}) => {
            this.logs = getLog;
            this.unfiltered = getLog;
        })
    }

}

customElements.define('cupio-admin-logs', CupioAdminLogs);
