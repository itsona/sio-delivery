import {LitElement, html, css} from 'lit-element';
import '../../common/cupio-loading';
import '../../common/cupio-logo';
import '../../common/cupio-input';
import '../admin-panel/cupio-clients-details';
import {graphqlPost, handleRequest} from "../../mixins/graphql";

class CupioDetails extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: grid;
                grid-template-columns: 1fr 1fr;
                border-radius: 12px;
                padding: 32px;
                overflow: hidden;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                gap: 64px;
                margin: 128px;
                box-sizing: border-box;
                flex-direction: column;
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

            .form {
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin-bottom: 48px;
            }

            .input {
                width: 100%;
            }

            .input[name=date] {
                width: 40%;
            }


            [disabled] {
                pointer-events: none;
                opacity: 0.6;
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

            .contact a {
                font-weight: bold;
                text-decoration: none;
                margin-left: 8px;
                color: rgba(0, 0, 0, 0.4);
                transition: color 0.5s;
            }

            .contact:hover a {
                color: black;
            }

            .login {
                cursor: pointer;
                margin-top: 0;
                text-decoration: none;
            }

            cupio-logo {
                align-items: center;
            }

            .authentication {
                gap: 32px;
                display: flex;
                margin-top: 16px;
                align-items: center;
                justify-content: center;
            }

            label {
                padding-top: 24px;
            }

            #service {
                cursor: pointer;
                padding: 8px;
                border-radius: 12px;
                border: 0.5px solid #ccc;
                appearance: none;
                color: grey;
            }

            #service:focus {
                outline: none;
                border-radius: 12px 12px 0 0;
            }

            .check-box {
                display: flex;
                align-items: center;
            }

            .check-label {
                padding: 0;
            }

            @media only screen and (max-width: 800px) {
                :host {
                    margin: 128px 24px;
                }

                .container {
                    width: unset;
                }
            }

            @media only screen and (max-width: 600px) {
                :host {
                    margin: 24px;
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
            <div class="form">
                <a class="link" href="/client">
                    <img src="/Z-Frontend/images/icons/next-svgrepo-com.svg">
                    უკან დაბრუნება
                </a>
                ${this.panel ? html`
                    <cupio-clients-details
                            .users="${this.users}"
                            .clients="${this.users}"
                            .listShow="${this.listShow}"
                            @click="${this._onClick}"
                            @client-changed="${this.setClient}"></cupio-clients-details>
                ` : ''}
                <select id="service" name="service" @change="${this._handleStatusChange}">
                    <option value="სტანდარტი">სტანდარტი</option>
                    <option value="ექსპრესი">ექსპრესი</option>
                </select>
                ${this.regInfo.map((item) =>
                        html`
                            <cupio-input
                                    class="input"
                                    place-holder="${this.getName(item)}"
                                    value="${this.values[item] || ''}"
                                    name="${item}"
                                    ?disabled="${item === 'city'}"
                                    @value-changed="${(event) => this.setValue(event, item)}"></cupio-input>
                        `
                )}
                <label>აღების სავარაუდო თარიღი</label>
                <cupio-input
                        class="input"
                        name="date"
                        min="2023-04-24"
                        value="${this.values.takeDate}"
                        @keydown="${(event)=> event.preventDefault()}"
                        @value-changed="${(event) => this.setValue(event, 'takeDate')}"></cupio-input>
                <label>ჩაბარების სავარაუდო თარიღი</label>
                <cupio-input
                        class="input"
                        name="date"
                        min="2023-04-24"
                        value="${this.values.deliveryDate}"
                        @keydown="${(event)=> event.preventDefault()}"
                        @value-changed="${(event) => this.setValue(event, 'deliveryDate')}"></cupio-input>
                ${this.panel ? html`
                <cupio-input
                        class="input"
                        value="${this.values.cash}"
                        place-holder="ქეშად ასაღები"
                        name="cash"
                        @value-changed="${(event) => this.setValue(event, 'cash')}"
                ></cupio-input>`:''}
                <cupio-input
                        class="input"
                        disabled
                        value="შეკვეთის საფასური ${this.rate}₾"
                        name="amount"></cupio-input>
                <div class="authentication">
                    <div
                            class="register"
                            @click="${this.authentication}"
                            ?disabled="${!this.canSend}">
                        შენახვა
                    </div>
                </div>
            </div>
            <div>
            <cupio-logo></cupio-logo>
            <div>
                მოგესალმებით ჩვენო ძვირფასო მომხმარებლებო 🥰 <br>
                📣გაცნობებთ 16 აპრილიდან 23 აპრილის ჩათვლით არ ვიმუშავებთ 🙏❤️ <br>
                მუშაობას განვაახლებთ <b> 24 აპრილიდან </b>, რა თქმა უნდა შეკვეთების გაფორმება შეგეძლებათ წინა დღეებში 24 რიცხვისთვის 🙌❤️
            </div>
            </div>
        `
    }

    static get properties() {
        return {
            item: {
                type: Object,
            },
            regInfo: {
                type: Array,
            },
            users: {
                type: Array,
            },
            values: {
                type: Object,
            },
            canSend: {
                type: Boolean,
            },
            showPay: {
                type: Boolean,
            },
            rate: {
                type: Number,
            },
            minDate: {
                type: String,
            },
            panel: {
                type: Boolean,
            },
            listShow: {
                type: Boolean,
            },
        };
    }

    constructor() {
        super();
        this.rate = 5;
        window.scrollTo(0, 0);
        this.regInfo = [
            'city',
            'takeAddress',
            'deliveryAddress',
            'phone',
            'deliveryPhone',
            'additional',
        ];
        this.init();
        handleRequest(false).then(r => {
            this.panel = r === 'admin';
            this.loadUsers();
        });
        document.addEventListener('click', () => {
            this.listShow = false
        })
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadData();
    }

    init() {
        this.values = {city: 'თბილისი'};
        this.values.takeDate = '2023-04-24';
        this.values.deliveryDate = '2023-04-24';
        this.minDate = this.values.takeDate;
        this.values.service = 'სტანდარტი';
        this.values.cash = '';
    }

    getDate(additional) {
        const date = new Date();
        date.setDate(date.getDate() + additional);
        const year = date.getFullYear();
        const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
        const day = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate();
        return year + '-' + month + '-' + day;
    }

    _onClick(event) {
        this.listShow = !this.listShow
        event.stopPropagation();
    }

    _handleStatusChange(event) {
        const status = event.target.value;
        this._setRate(status)
        this.values.service = status;
        if (status === 'ექსპრესი') {
            this.values.takeDate = this.getDate(0);
            this.values.deliveryDate = this.getDate(0);
            this.minDate = this.values.takeDate;
        } else {
            this.values.takeDate = this.getDate(1);
            this.values.deliveryDate = this.getDate(1);
            this.minDate = this.values.takeDate;
        }
        this.values = {...this.values}
    }

    _setRate(status) {
        switch (status) {
            case 'ექსპრესი':
                this.rate = this.values.rates.expressRate;
                break;
            case 'სტანდარტი':
                this.rate = this.values.rates.normalRate;
                break;
        }
    }

    getName(item) {
        switch (item) {
            case 'phone':
                return 'საკონტაქტო ნომერი *';
            case 'takeAddress':
                return 'შეკვეთის აღების სრული მისამართი * (უბანი, ქუჩა, ნომერი)';
            case 'deliveryAddress':
                return 'შეკვეთის ჩაბარების სრული მისამართი * (უბანი, ქუჩა, ნომერი)';
            case 'deliveryPhone':
                return 'შეკვეთის ჩაბარების ტელეფონის ნომერი *';
            case 'additional':
                return 'დამატებითი ინფორმაცია';
        }
    }

    setValue(event, item) {
        this.values[item] = event.detail;
        this.canSend = this.values.takeAddress && this.values.deliveryAddress
            && this.values.phone && this.values.takeDate && this.values.deliveryDate && this.values.deliveryPhone
    }

    loadData() {
        const gql = `
        {
            userInfo${this.panel? `(email: "${this.values.client}")`: ''}{
                address
                phone
                rates{
                    normalRate
                    expressRate
                }
            }
        }
        `
        graphqlPost(gql).then(({data: {userInfo}}) => {
            this.rate = userInfo.rates.normalRate;
            this.values = {
                ...this.values,
                takeAddress: userInfo.address,
                phone: userInfo.phone,
                rates: userInfo.rates
            }
        })
    }

    setClient(e) {
        this.values.client = e.detail.email;
        this.values.clientName = e.detail.name;
        this.loadData();
    }
    validDates(){
        const takeDate = new Date(this.values.takeDate).getDay();
        const deliveryDate = new Date(this.values.deliveryDate).getDay();
        return takeDate && deliveryDate;
    }

    authentication() {
        if(!this.validDates()){
            alert('კვირა დღეს არასამუშაო დღეა, გთხოვთ შეცვალოთ თარიღი.')
            return;
        }
        if(this.values.service === 'ექსპრესი'){
            const dt = new Date();
            if(dt.getHours() >=13){
                alert('ექსპრეს შეკვეთის დამატება შესაძლებელია მხოლოდ დღის 1 საათამდე');
                return;
            }
        }
        this.canSend = false;
        const gql = `
            mutation {
                addData(
                ${this.panel ? `
                    client: "${this.values.client}"
                    clientName: "${this.values.clientName}"
                    cash: ${this.values.cash || 0}
                    ` : ''}
                    takeAddress: "${this.values.takeAddress}"
                    deliveryAddress: "${this.values.deliveryAddress}"
                    deliveryPhone: "${this.values.deliveryPhone}"
                    service: "${this.values.service}"
                    description: "${this.values.additional || ''}"
                    phone: "${this.values.phone || ''}"
                    takeDate: "${this.values.takeDate}"
                    deliveryDate: "${this.values.deliveryDate}"
                )
            }
        `
        graphqlPost(gql).then((r) => {
            alert('წარმატებით დაემატა')
            this.canSend = true;
            window.location.reload();
        }).catch(() => alert('!!! ხარვეზი იყო თავიდან სცადეთ !!!'))
    }

    loadUsers() {
        if (!this.panel) return;
        const gql = `
                {
                  usersDetails(status: "client"){
                    name
                    email
                  }
                }
        `
        graphqlPost(gql).then(({data: {usersDetails}}) => this.users = usersDetails);
    }
}

customElements.define('cupio-details', CupioDetails);
