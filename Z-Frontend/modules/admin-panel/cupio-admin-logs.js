import {LitElement, html, css} from 'lit-element';
import './cupio-admin-item';
import '../../common/cupio-input';
import {graphqlPost, handleRequest} from "../../mixins/graphql";
import {redirectTo} from "../../mixins/redirectTo";
import './cupio-clients-details';

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
                <div class="link" @click="${this.loadExcel}">ექსელის დაგენერირება</div>
                <a class="link"
                   href="https://138.201.104.132:443/middleWares/log-excel.xlsx"
                   target="_blank"
                >ექსელის ჩამოწერა</a>
                <div class="links">
                    <cupio-clients-details
                            style="flex-grow: 1"
                            .users="${this.users}"
                            .clients="${this.users}"
                            .listShow="${this.listShow}"
                            @click="${this._onClick}"
                            @client-changed="${this.setClient}"></cupio-clients-details>
                    </cupio-input>
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

                ${this.client ? html`
                    <cupio-admin-item 
                        .item="${this.users.filter((item)=> this.client === item.email)[0]}"
                        hideAction
                        show-times
                        @status-changed="${(event)=> this.setClient(event, true)}"
                    >
                    </cupio-admin-item>
                    <br>
                    <br>
                    <br>
                `: ''}
                
                ${this.logs.map((item)=> html`

                    <div class="delivery-item">
                        <cupio-admin-item
                                style="width: 100%; grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
                                hideAction
                                .item="${{...item, payDate: this.setDate(item.payDate)}}"></cupio-admin-item>

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
            users: {
                type: Array,
            },
            unfiltered: {
                type: Array,
            },
            listShow: {
                type: Boolean,
            },
            client: {
                type: String,
            },
        };
    }

    constructor() {
        super();
        this.loadAll();
        this.logs = [];
        this.filters = {};
        if (window.localStorage.getItem('isEmployee')) redirectTo('/panel')
        handleRequest(false).then(r => {
            if (r !== 'admin') redirectTo('/client')
        })
        this.users = [];
        this.loadUsers();
        document.addEventListener('click', () => {
            this.listShow = false
        })

    }

    setDate(d){
        const date = new Date(d);
        return date.toLocaleString()
    }

    loadAll() {
        this.loadCouriers();
    }

    filter(value, type){
        if(value && type) this.filters[type] = value.detail;
        this.logs = this.unfiltered.filter((item)=> {
            let fromCheck = item.date >= new Date(this.filters.from||0).setHours(0);
            let toCheck = item.date <= new Date(this.filters.to || 0).setHours(0)
            if(!this.filter.to) toCheck = true;
            return fromCheck && toCheck;
        })
    }



    loadCouriers() {
        const gql = `
        {
        getLog{
            name
            courier
            date
            oldBudget
            change
            newBudget
            changer
            payDate
          }
        }
            `
        graphqlPost(gql).then(({data:{getLog}}) => {
            this.logs = getLog;
            this.unfiltered = getLog;
        })
    }

    _onClick(event) {
        this.listShow = !this.listShow
        event.stopPropagation();
    }

    loadExcel(){
        const gql = `
        { 
        logExcel(
            client: "${this.client || ''}", 
            fromDate: "${this.filters.from || ''}" 
            toDate: "${this.filters.to || ''}"
        )
        }
        `
        graphqlPost(gql);
    }

    setClient(event, outside= false){
        if(!outside) {
            this.client = event.detail.email;
        }
        const gql = `
        { getLog(client: "${this.client}"){
            name
            courier
            date
            oldBudget
            change
            newBudget
            changer
            payDate
          }
        }
        `

        const client = this.client;
        this.client = '';
        graphqlPost(gql).then(({data:{getLog}}) => {
            this.logs = getLog;
            this.unfiltered = getLog;
            this.loadUsers();
            this.filter();
            console.log('aaaaaaaaa', client)
            this.client = client + '';
        })
    }

    loadUsers() {
        const gql = `
                {
                  usersDetails{
                    name
                    email
                    budget
                  }
                }
        `
        graphqlPost(gql).then(({data: {usersDetails}}) => this.users = usersDetails);
    }

}

customElements.define('cupio-admin-logs', CupioAdminLogs);
