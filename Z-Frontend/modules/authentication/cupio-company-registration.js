import {LitElement, html, css} from 'lit-element';
import '../../common/cupio-input';
import '../../common/cupio-logo';
import {graphqlPost, handleRequest} from "../../mixins/graphql";

class CupioCompanyRegistration extends LitElement {
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
                    ${!this.info.status ? html`
                        <span id="status">გასაგრძელებლად გთხოვთ შეავსოთ სავალდებულო (*) ველები</span>
                    ` : ''}
                    ${this.regInfo.map((item) =>
                            html`
                                <cupio-input
                                        class="input"
                                        place-holder="${this.getName(item)}"
                                        name="${item}"
                                        value="${this.info[item] || ''}"
                                        @value-changed="${(event) => this.setValue(event, item)}"></cupio-input>
                            `
                    )}
                    ${!this.passwordVisible ? html`
                        <span
                                class="password"
                                @click="${this.onChangePasswordClick}">პაროლის შეცვლა</span>
                    ` : ''}
                    <div class="authentication">
                        <div
                                class="register"
                                @click="${this.authentication}">
                            შენახვა
                        </div>
                    </div>
                </div>
                <cupio-logo></cupio-logo>
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

        };
    }

    constructor() {
        super();
        this.regInfo = ['name', 'email', 'address', 'phone',];
        this.values = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadUserInfo();
    }

    getName(item) {
        switch (item) {
            case 'name':
                return 'სახელი *';
            case 'email':
                return 'Email * ';
            case 'password':
                return 'ახალი პაროლი';
            case 'old password':
                return 'ძველი პაროლი';
            case 'address':
                return 'მისამართი *';
            case 'phone':
                return 'ტელეფონის ნომერი *';
        }
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    onChangePasswordClick() {
        this.passwordVisible = true;
        this.regInfo = [...this.regInfo, 'old password', 'password']
    }

    setValue(event, item) {
        this.info[item] = event.detail;
    }

    loadUserInfo() {
        const gql = `
            {
              userInfo{
              name
              email
              address
              phone
              status
              _id
              }
            }
        `
        graphqlPost(gql).then(r => {
            this.info = r.data.userInfo;
            if(!this.info) window.localStorage.removeItem('rndString');
        }).catch(()=> window.localStorage.removeItem('rndString'))
    }

    authentication() {
        const gql = `
            mutation {
                modifyUser(
                name: "${this.info.name}",
                email: "${this.info.email}",
                newPassword: "${this.info.password || ''}",
                password: "${this.info['old password'] || ''}",
                address: "${this.info.address}",
                phone: "${this.info.phone}",
                status: "${this.info.status || 'client'}",
                )
            }
        `
        graphqlPost(gql).then(r => {
            if (r.data.modifyUser === 'success') {
                alert('წარმატებით შეიცვალა');
                handleRequest();
            } else if (r.data.modifyUser === 'incorrect') {
                alert('პაროლი არასწორია')
            } else if (r.data.modifyUser === 'nonNUll') {
                alert('შეავსეთ აუცილებელი ველები')
            }
        })
    }
}

customElements.define('cupio-company-registration', CupioCompanyRegistration);
