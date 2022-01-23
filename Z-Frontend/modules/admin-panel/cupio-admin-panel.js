import {LitElement, html, css} from 'lit-element';
import './cupio-admin-item';
import '../../common/cupio-input';
import {graphqlPost, handleRequest} from "../../mixins/graphql";
import {redirectTo} from "../../mixins/redirectTo";

class CupioAdminPanel extends LitElement {
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
                align-items: end;
            }

            .accept {
                background-color: green;
                border-radius: 12px;
                padding: 6px 12px;
                cursor: pointer;
                color: white;
                text-align: center;
                font-weight: bold;
                margin-bottom: 24px;
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
                    <a class="link" href="/panel">
                        <img src="/Z-Frontend/images/icons/next-svgrepo-com.svg">
                        უკან დაბრუნება
                    </a>

                    <a class="link" href="/admin/log">
                        ჩანაწერები
                    </a>
                    <a class="link" href="/new">
                        შეკვეთის დამატება
                        <img src="/Z-Frontend/images/icons/add.svg">
                    </a>
                </div>
                <div class="title">
                    <span>კურიერების რაოდენობა (${this.couriers.length})</span>
                </div>
                ${this.couriers.map((item, index) => html`
                    <div class="delivery-item">
                        <cupio-admin-item
                                .value="0"
                                delivery
                                .item="${item}"
                                @status-changed="${this.loadAll}"></cupio-admin-item>
                    </div>
                `)}
                <div class="title">
                    <span>
                        <div>
                            
                    <cupio-input
                            class="input"
                            place-holder="სტანდ"
                            name="filter"
                            @value-changed="${(event) => this.standard = event.detail}"
                    ></cupio-input>
                    <cupio-input
                            class="input"
                            place-holder="ექსპრესი"
                            name="filter"
                            @value-changed="${(event) => this.express = event.detail}"
                    ></cupio-input>
                            <div class="accept" @click="${this.saveRatesForAll}">შეცვლა</div>
                        </div>
                        კლიენტების რაოდენობა (${this.clients.length})
                    </span>

                    <cupio-input
                            class="input"
                            place-holder="Filter"
                            name="filter"
                            @value-changed="${(event) => this.filter(event)}"
                    ></cupio-input>
                </div>
                ${this.clientsFiltered.map((item, index) => html`
                    <div class="delivery-item">
                        <cupio-admin-item
                                .value="0"
                                .item="${item}"
                                @status-changed="${this.loadAll}"></cupio-admin-item>

                    </div>
                `)}
            </div>

        `
    }

    static get properties() {
        return {
            couriers: {
                type: Array,
            },
            clients: {
                type: Array,
            },
            clientsFiltered: {
                type: Array,
            },
        };
    }

    constructor() {
        super();
        this.couriers = [];
        this.clients = [];
        this.express = null;
        this.standard = null;
        this.loadAll();
        if(window.localStorage.getItem('isEmployee')) redirectTo('/panel')
        handleRequest(false).then(r=> {
            if(r !== 'admin')redirectTo('/client')
        })
    }

    filter(event){
        this.clientsFiltered = this.clients.filter((item)=> {
            return item.email.includes(event.detail) || item.name.includes(event.detail)
        })
    }

    loadAll() {
        this.loadCouriers('delivery');
        this.loadCouriers('client');
    }

    loadCouriers(status) {
        const gql = `
            {
              usersDetails(status: "${status}"){
                rates{
                    ${status === 'delivery' ?
                    `delivery
                    takeRate` : `
                    normalRate
                    expressRate
                    `}
                }
                email
                name
                budget
                address
              }
            }
            `
        graphqlPost(gql).then(async ({data: {usersDetails}}) => {
            if (status === 'delivery') {
                this.couriers = await this.loadCouriersCounts(usersDetails || [])
            } else {
                this.clients = usersDetails || [];
                this.clientsFiltered = this.clients;
            }
        })
    }

    saveRatesForAll(){
        const gql = `
        mutation {
            setRatesForAll(
                express: ${this.express}
                standard: ${this.standard}
        )
        }
        `
            graphqlPost(gql).then(()=> {
                this.loadCouriers('client');
            })
    }
    // PayWithPayze(){
    //     axios.post('https://payze.io/api/v1', {
    //         method: 'justPay',
    //         apiKey: 'E2A930873E4E48B2B8319D7E8A75BB98',
    //         apiSecret: '32AE2A765A4341E7AEB726D6E0BA8A23',
    //         data: {
    //             amount: "0.1",
    //             currency: 'GEL',
    //             callback: 'https://siodelivery.ge/',
    //             callbackError: 'https://siodelivery.ge/fail',
    //             info: {
    //                 name: 'test',
    //                 description: 'test',
    //             },
    //         }
    //     },)
    //         .then(r=> console.log(r.response))
    //         .catch((error)=> {
    //             if (error.response) {
    //                 // The request was made and the server responded with a status code
    //                 // that falls out of the range of 2xx
    //                 console.log(error.response.data);
    //                 console.log(error.response.status);
    //                 console.log(error.response.headers);
    //             } else if (error.request) {
    //                 // The request was made but no response was received
    //                 // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    //                 // http.ClientRequest in node.js
    //                 console.log(error.request);
    //             } else {
    //                 // Something happened in setting up the request that triggered an Error
    //                 console.log('Error', error.message);
    //             }
    //             console.log(error.config);
    //         })
    // }

    async loadCouriersCounts(couriers){
        // this.PayWithPayze();
        // return;
        const mapFunction = async (item)=> {
            const getDataCounts = await graphqlPost(`
            {
                    getDataCounts(courier: "${item.email}"){
                        take
                        delivering
                    }
                    }
                `).then(({data: {getDataCounts}})=> getDataCounts)
            return {
                ...item,
                getDataCounts,
            }
        }
        const mappedCouriers =  await couriers.map(await mapFunction)
        return await Promise.all(mappedCouriers)
    }

}

customElements.define('cupio-admin-panel', CupioAdminPanel);
