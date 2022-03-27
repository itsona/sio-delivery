import {LitElement, html, css} from 'lit-element';
import '../../common/cupio-input';
import '../../common/cupio-logo';
import {graphqlPost, handleRequest} from "../../mixins/graphql";

class CupioModerator extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                padding: 128px;
                display: flex;
                min-height: 100vh;
                box-sizing: border-box;
                flex-direction: column;
            }

            .container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                width: 100%;
                min-height: 100%;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                padding: 32px;
                gap: 64px;
            }

            .form {
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin-bottom: 48px;
            }

            .input {
                width: 100%;
            }

            .register {
                display: flex;
                align-self: baseline;
                padding: 12px;
                background: dodgerblue;
                border-radius: 12px;
                color: white;
                cursor: pointer;
            }

            .authentication {
                gap: 32px;
                display: flex;
                margin-top: 16px;
                align-items: center;
                justify-content: center;
            }

            .contact {
                margin-top: 24px;
                color: rgba(0, 0, 0, 0.4);
                font-weight: 600;
                display: flex;
                align-items: center;
                transition: color 0.5s;
            }

            .contact a {
                font-weight: bold;
                text-decoration: none;
                margin-left: 8px;
                color: rgba(0, 0, 0, 0.4);
                transition: color 0.5s;
            }

            .password:hover {
                opacity: 0.8;
            }
            
            .password{
                font-weight: bold;
                cursor: pointer;
            }

            .login {
                cursor: pointer;
                margin-top: 0;
                text-decoration: none;
            }

            .login:hover {
                color: rgba(0, 0, 0, 0.6)
            }

            #status {
                font-weight: 600;
            }

            cupio-logo {
                align-items: center;
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

            .link img {
                width: 14px;
                display: flex;
                align-self: baseline;
                padding-left: 4px;
                transform: rotate(180deg);
            }

            @media only screen and (max-width: 800px) {
                :host {
                    padding: 128px 24px;
                }

                .container {
                    width: unset;
                }
            }

            @media only screen and (max-width: 600px) {
                :host {
                    padding: 24px;
                }

                .container {
                    grid-template-columns: 1fr;
                }

                cupio-logo {
                    grid-row: 1;
                }
            }
        `;
    }

    render() {
        return html`
            <div class="container">

                <div class="form">

                    <a class="link" href="/client">
                        <img src="/Z-Frontend/images/icons/next-svgrepo-com.svg">
                        უკან დაბრუნება
                    </a>
                    ${ this.values.map((item)=> html`
                        <cupio-admin-item
                                .item="${item}"
                                hideAction
                                show-times
                        ></cupio-admin-item>
                    `) } 
                </div>
            </div>


        `
    }

    static get properties() {
        return {
            regInfo: {
                type: Array,
            },
            address: {
                type: Array,
            },
            play: {
                type: Number,
            },
            isReg: {
                type: Boolean,
            },
            passwordVisible: {
                type: Boolean,
            },
            info: {
                type: Object,
            },
            values: {
                type: Array,
            }

        };
    }

    constructor() {
        super();
        this.loadCouriers('delivery')
        this.values = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadUserInfo();
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
                this.values = await this.loadCouriersCounts(usersDetails || [])
            } else {
                this.clients = usersDetails || [];
                this.clientsFiltered = this.clients;
            }
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
                email: item.email,
                name: item.name,
                getDataCounts,
            }
        }
        const mappedCouriers =  await couriers.map(await mapFunction)
        return await Promise.all(mappedCouriers)
    }
}

customElements.define('cupio-moderator', CupioModerator);
