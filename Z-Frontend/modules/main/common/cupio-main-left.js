import {LitElement, html, css} from 'lit-element'
import {redirectTo} from "../../../mixins/redirectTo";
import {graphqlPost, handleRequest} from "../../../mixins/graphql";

class CupioMainLeft extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                min-height: 100vh;
                max-height: 100vh;
                flex-direction: column;
                padding: 24px 24px 0;
                box-sizing: border-box;
                justify-content: space-between;
                max-width: 100vw;
                position: relative;
                background-color: white;
                transform: translateX(0);
                transition: transform 0.5s ease-in-out;
                overflow-y: auto;
            }


            :host::-webkit-scrollbar :hover {
                width: 10px;
                cursor: pointer;
            }

            :host::-webkit-scrollbar {
                width: 7px;
                cursor: pointer;
            }

            /* Track */
            :host::-webkit-scrollbar-thumb:hover {
                background: lightgray;
                min-height: 8px;
            }

            :host::-webkit-scrollbar-track {
                box-shadow: inset 0 0 5px grey;
                border-radius: 8px;
                margin-right: 40px;
                cursor: pointer;
            }

            /* Handle */
            :host::-webkit-scrollbar-thumb {
                background: rgb(144, 144, 144);
                border-radius: 5px;
                cursor: pointer;
            }

            input {
                border-radius: 12px;
                overflow: hidden;
                border: 0.5px solid #ccc
            }

            input:focus {
                outline: none;
            }

            .filter {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                padding-bottom: 16px;
            }

            .logo {
                display: flex;
                padding: 32px 0 64px 0;
                justify-content: center;
                flex-direction: column;
                align-items: center;
            }

            .logo img {
                max-width: 120px;
            }

            .find {
                padding: 8px;
                display: flex;
                width: 100%;
                color: grey;
            }

            .search {
                display: flex;
                position: relative;
            }

            .search-logo {
                position: absolute;
                width: 20px;
                height: 20px;
                padding-top: 6px;
                right: 12px;
            }

            .range {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: grey;
                font-size: 24px;
            }

            .column {
                flex-direction: column;
            }

            .column > input {
                width: 100%;
                box-sizing: border-box;
            }

            .from, .to {
                width: 36%;
                padding: 8px;
                color: grey;
            }

            #city {
                padding: 8px;
                border-radius: 12px;
                border: 0.5px solid #ccc;
                appearance: none;
                color: grey;
            }

            #city:focus {
                outline: none;
                border-radius: 12px 12px 0 0;
            }

            label {
                font-size: 18px;
                font-weight: 500;
                color: grey;
                padding: 16px 8px 8px;
            }

            .footer {
                display: flex;
                flex-direction: column;
                border-top: 1px solid rgb(240, 240, 240);
                padding: 24px 0;
                row-gap: 8px;
            }

            .footer > img {
                width: 20px;
                height: 20px;
                padding: 16px 0;
                margin: 4px;
                display: flex;
                flex-grow: 1;
            }

            #middle {
                padding-right: 5px;
                padding-left: 5px;
                margin: 0;
                border-right: 1px solid rgb(240, 240, 240);
                border-left: 1px solid rgb(240, 240, 240);
            }

            .close {
                display: none;
            }

            .btn-primary {
                height: 32px;
                background-color: grey;
                border-radius: 16px;
                color: white;
                font-weight: bold;
                display: flex;
                align-items: center;
                text-align: center;
                justify-content: center;
                padding: 0 12px;
                margin: 12px 0;
                cursor: pointer;
            }

            .link {
                color: black;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                transition: color 0.5s;
                display: flex;
            }

            .link:hover {
                color: gray;
            }

            .link img {
                width: 14px;
                display: flex;
                align-self: baseline;
                padding-left: 4px;
            }

            .bottom {
                padding-bottom: 24px;
            }

            .title {
                font-weight: bold;
                color: grey;
                font-size: 18px;
                padding-top: 12px;
                display: flex;
                justify-content: space-between;
            }

            @media only screen and (max-width: 800px) {

                :host {
                    overflow-y: scroll;
                }

                :host([closed]) {
                    transform: translateX(-100%);
                }

                .close {
                    display: flex;
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    border-radius: 50%;
                    background-color: rgb(250, 250, 250);
                }

                .close:hover {
                    background-color: rgb(240, 240, 240);
                }

                .close img {
                    width: 30px;
                    height: 30px;
                    padding: 12px;
                }
            }

        `;
    }

    render() {
        return html`
            <div class="close" @click="${this.drawerClose}"><img src="/Z-Frontend/images/icons/close.svg"></div>

            <div class="link leave"
                 @click="${this._onLeaveClick}">სისტემის დატოვება
            </div>
            <div class="logo">
                <img src="${'/Z-Frontend/images/logo.png'}">
                ${!this.isEmployee ? html`
                <div class="user-console">
                    <a class="link" href="${this.panel ? '/admin' : '/companyDetails'}">
                        პირადი კაბინეტი
                        <img src="/Z-Frontend/images/icons/next-svgrepo-com.svg">
                    </a>
                </div>
                `: ''}
            </div>

            <div class="filter">
                <div class="search">
                    <input
                            type="text"
                            class="find"
                            placeholder="საძიებო სიტყვა"
                            name="searchWord"
                            @input="${this.requestData}">
                    <img src="/Z-Frontend/images/icons/search.svg" class="search-logo">
                </div>
                <label for="cars">სტატუსი</label>
                <select id="city" name="city" @change="${this._onStatusChange}">
                    <option value="">ყველა</option>
                    ${this.delivery ? html`
                        <option value="ასაღები">ასაღები</option>` : html`
                        <option value="ასაღები">მიღებულია</option>
                    `}
                    <option value="აღებული">აღებული</option>
                    <option value="ჩაბარებული">ჩაბარებული</option>
                    ${this.delivery ? html`
                        <option value="ჩასაბარებელი">ჩასაბარებელი</option>` : ''}
                    ${this.panel || !this.delivery ? html`
                        <option value="განხილვაშია">განხილვაშია</option>` : ''}
                    ${this.panel || !this.delivery ? html`
                        <option value="გაუქმებულია">გაუქმებულია</option>` : ''}
                </select>
                ${!this.delivery || this.panel ? html`
                    <label class="price">ფასი</label>
                    <div class="range">
                        <input
                                type="text"
                                class="from"
                                placeholder="დან"
                                name="from"
                                @input="${this.requestData}">
                        <span> - </span>
                        <input
                                type="text"
                                class="to"
                                placeholder="მდე"
                                name="to"
                                @input="${this.requestData}">
                    </div>` : ''}
                <label class="price">თარიღი</label>
                <div class="range column">
                    <input
                            type="date"
                            class="from"
                            placeholder="dd-mm-yyyy"
                            name="fromDate"
                            @input="${this.requestData}">
                    <span> - </span>
                    <input
                            type="date"
                            class="to"
                            placeholder="dd-mm-yyyy"
                            name="toDate"
                            @input="${this.requestData}">
                </div>
                ${this.delivery && !this.panel ? html`
                    <div class="title">
                        <span>გამომუშავებული თანხა: ${this.budget}₾</span>
                    </div>
                ` : ''}
                ${this.panel ? html`
                    <div class="title">
                        <span>${this.report}</span>
                    </div>
                ` : html``}
            </div>
            ${!this.panel ? html`
                <a class="link bottom" href="tel:551004010">
                    დამატებითი ინფორმაციისთვის დაგვიკავშირდით T: 551 004 010
                </a>
            ` : ''}
        `
    }

    static get properties() {
        return {
            _alreadySent: {
                type: Boolean,
            },
            searchWord: {
                type: Object,
            },
            logo: {
                type: String,
            },
            delivery: {
                type: Boolean,
            },
            panel: {
                type: Boolean,
            },
            isEmployee: {
                type: Boolean,
            },
            closed: {
                type: Boolean,
            },
            budget: {
                type: Number,
            },
            report: {
                type: String,
            },
        };
    }

    constructor() {
        super();
        this._alreadySent = false;
        this.loadBudget();
        this.isEmployee = window.localStorage.getItem('isEmployee');
        handleRequest().then((r) => {
            this.panel = r === 'admin';

            this.loadDayReport();
        });
        this.searchWord = {};
    }

    drawerClose() {
        this.dispatchEvent(new CustomEvent('closed'));
    }

    _onLeaveClick() {
        localStorage.removeItem('rndString');
        redirectTo('/')
    }

    _onStatusChange(event) {
        const status = event.currentTarget.value;
        this.dispatchEvent(new CustomEvent('status-changed', {detail: status}));
    }

    requestData(e) {
        const target = e.currentTarget;
        const value = target.value;
        const name = target.name;
        this.searchWord[name] = value;
        if (!this._alreadySent) {
            this.sendData();
            this._alreadySent = true;
            setTimeout(() => this.checkSendInfo(name, value), 500)
        }
    }

    loadBudget() {
        const search = this.searchWord || {}
        const query = search.fromDate || search.toDate ?
            `(fromDate: "${search.fromDate || ''}",
                toDate: "${search.toDate || ''}"
            )` : '';
        const gql = `
            {
                loadBudget${query}
            }
        `
        graphqlPost(gql).then(({data: {loadBudget}}) => this.budget = loadBudget);
    }

    updated(_changedProperties) {
        super.updated(_changedProperties);
        if (_changedProperties.has('closed')) {
            if (this.closed) {
                document.documentElement.classList.remove('no-scroll');
            } else {
                document.documentElement.classList.add('no-scroll')
            }
        }
    }

    checkSendInfo(name, value) {
        this._alreadySent = false;
        if (value !== this.searchWord[name]) this.sendData();
    }

    sendData() {
        if (this.searchWord.fromDate || this.searchWord.toDate) this.loadBudget();
        this.dispatchEvent(new CustomEvent('searched', {detail: this.searchWord}));
    }


    getNewDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
        const day = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate();
        return year + '-' + month + '-' + day;
    }

    loadDayReport() {
        if (!this.panel) return
        const gql = `
            {
                dayReport
            }
        `;
        graphqlPost(gql).then(({data: {dayReport}}) => this.report = dayReport);
    }
}

customElements.define('cupio-main-left', CupioMainLeft);
