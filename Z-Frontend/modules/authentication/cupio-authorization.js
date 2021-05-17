import {LitElement, html, css} from 'lit-element';
import '../../common/cupio-input';
import '../../common/cupio-logo';
import {graphqlPost, handleRequest} from "../../mixins/graphql";
import {redirectTo} from "../../mixins/redirectTo";

class CupioAuthorization extends LitElement {
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

            .contact:hover a {
                color: black;
            }

            .login {
                cursor: pointer;
                margin-top: 0;
                text-decoration: none;
            }

            .login:hover {
                color: rgba(0, 0, 0, 0.6)
            }

            cupio-logo {
                align-items: center;
            }

            img {
                width: 24px;
            }

            .additionals {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding-top: 24px;
                align-items: flex-start;
            }

            .additionals > span {
                display: flex;
                align-items: center;
                justify-content: left;
                gap: 8px;
                cursor: pointer;
                font-weight: 600;
                padding: 12px;
                border-radius: 12px;
            }

            #facebook {
                background: rgba(58, 90, 152, 0.5);
                color: white
            }

            #gmail {
                background-color: rgba(255, 75, 38, 0.5);
                color: white;
            }

            @media only screen and (max-width: 800px) {
                :host {
                    padding: 24px;
                }

                .container {
                    grid-template-columns: 1fr;
                    width: unset;
                }
            }
        `;
    }

    render() {
        return html`
            <div class="container">
                <div class="form">
                    ${this.regInfo.map((item) =>
                            html`
                                <cupio-input
                                        class="input"
                                        place-holder="${this.getName(item)}"
                                        name="${item}"
                                        @value-changed="${(event) => this.setValue(event, item)}"
                                ></cupio-input>
                            `
                    )}
                    <div class="authentication">
                        <div
                                class="register"
                                @click="${this.authentication}">
                            ${this.isReg ? 'რეგისტრაცია' : 'ავტორიზაცია'}
                        </div>
                        <a
                                class="contact login"
                                href="/${this.isReg ? 'login' : 'register'}">
                            ${this.isReg ? 'უკვე მაქვს ანგარიში' : 'რეგისტრაცია'}</a>
                    </div>

                    <div class="additionals">
                        <span id="facebook">
                            <img src="/Z-Frontend/images/icons/facebook.svg">
                            ავტორიზაცია Facebook-ის გამოყენებით
                        </span>

                        <span id="gmail">
                            <img src="/Z-Frontend/images/icons/gmail.svg">
                            ავტორიზაცია Gmail-ის გამოყენებით
                        </span>
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
            addresses: {
                type: Array,
            },
            play: {
                type: Number,
            },
            isReg: {
                type: Boolean,
            },
            values: {
                type: Object,
            }
        };
    }

    constructor() {
        super();
        if (!!localStorage.getItem('rndString')) handleRequest(true)
        this.regInfo = ['name', 'email', 'password', 'repeat password'];
        setTimeout(() => {
            this.isReg = window.location.pathname !== '/login';
            if (!this.isReg) this.regInfo = ['email', 'password']
        }, 50);
        this.values = {};
    }

    getName(item) {
        switch (item) {
            case 'name':
                return 'სახელი';
            case 'email':
                return 'Email';
            case 'password':
                return 'პაროლი';
            case 'repeat password':
                return 'გაიმეორეთ პაროლი';
        }
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    setValue(event, item) {
        this.values[item] = event.detail;
    }

    authentication() {
        if (!this.validateEmail(this.values.email)) {
            alert('შეამოწმეთ ელფოსტის მისამართი')
            return;
        }
        const regGql = `
            mutation {
                addUser(
                name: "${this.values.name}",
                email: "${this.values.email}",
                password: "${this.values.password}",
                passwordRepeat: "${this.values['repeat password']}",
                )
            }
        `
        const logGql = `
            {
                user(
                email: "${this.values.email}",
                password: "${this.values.password}",
                )
            }
        `
        graphqlPost(this.isReg ? regGql : logGql).then(r => {
            console.log(r.data.user)
            if (r.data.user) {
                window.localStorage.setItem('rndString', r.data.user);
                handleRequest(true);
            } else if (r.data.addUser && r.data.addUser === 'contains') {
                alert('ელქტრონული ფოსტა უკვე დარეგისტრირებულია')
            } else if (r.data.addUser) {
                alert('წარმატებით დარეგისტრირდით');
                redirectTo('/login')
            } else if (r.data.user === 'incorrect' || !r.data.user) {
                alert('არასწორი ელფოსტა ან პაროლი')
            } else alert('დაფიქსირდა არასწორი ინფორმაცია')
        })
    }
}

customElements.define('cupio-authorization', CupioAuthorization);
