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

                    <a class="link" >
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

                <div
                        class="link load"
                        @click="${()=>this.loadCouriers('client', true)}">
                    დალაგება
                </div>
                ${(this.clientsFiltered || []).map((item, index) => html`
                    <div class="delivery-item">
                        <cupio-admin-item
                                .value="0"
                                .item="${item}"
                                @clients-deleted="${()=>this.deleteClient(item,index)}"
                                @status-changed="${this.loadAll}"></cupio-admin-item>

                    </div>
                `)}

                ${this.shouldLoadMore ? html`
                    <div
                            class="link load"
                            @click="${()=>this.loadCouriers('client')}">
                        მეტის ნახვა
                    </div>` : ''}
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
            skip: {
                type: Number,
            },
            limit: {
                type: Number
            },
            loadedLength: {
                type: Number
            },
            shouldLoadMore: {
                type: Boolean
            }
        };
    }

    constructor() {
        super();
        this.couriers = [];
        this.clients = [];
        this.express = null;
        this.standard = null;
        this.loadedLength = 20;
        this.skip = 0;
        this.limit = this.loadedLength;
        this.shouldLoadMore = true;
        if(window.localStorage.getItem('isEmployee')) redirectTo('/moder')
        handleRequest(false).then(r=> {
            if(r !== 'admin')redirectTo('/client')
            setTimeout(()=> this.loadAll(), 200)

        })
    }

    filter(event){
        this.skip = 0
        this.searchText = event.detail
        this.loadCouriers('client')
    }

    async loadAll() {
        console.log('loadAll')
        this.loadCouriers('delivery');
        this.loadCouriers('client');
    }

    loadCouriers(status, sort=false) {
        this.sort = this.sort || sort
        if(sort){
            this.skip= 0
        }
        const gql = `
            {
              usersDetails(
              status: "${status}",
              ${status === 'delivery' ? '' : `
                  skip: ${this.skip},
                  limit: ${this.limit}
                  searchText: "${this.searchText || ''}",
                  sort: ${this.sort}
              `}
              ){
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
        return graphqlPost(gql).then(async ({data: {usersDetails}}) => {
                if (status === 'delivery') {
                    this.couriers = await this.loadCouriersCounts(usersDetails || [])
                } else {
                    if(this.skip){
                        this.clients = [...this.clients, ...usersDetails]
                    }else {
                        this.clients = usersDetails || [];
                    }

                    if ((usersDetails|| []).length >= this.loadedLength) {
                        this.shouldLoadMore = true;
                        this.skip += this.loadedLength;
                    } else {
                        this.shouldLoadMore = false;
                    }
                    this.clientsFiltered = [...this.clients]
                }
        }).catch(async (e)=> {
            console.log(e)
        })
    }

    deleteClient(item, index){
        this.clientsFiltered.splice(index,1);
        this.clientsFiltered = [...this.clientsFiltered];
        const gql = `
        mutation {
            deleteClient(
                email: "${item.email}"
        )
        }
        `
        graphqlPost(gql).then(()=> {
            this.skip = 0
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
                this.skip = 0;
                this.loadCouriers('client');
            })
    }

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
