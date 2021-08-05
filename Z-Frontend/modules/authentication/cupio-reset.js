import {LitElement, html, css} from 'lit-element';
import '../../common/cupio-input';
import '../../common/cupio-logo';
import {graphqlPost} from "../../mixins/graphql";
import {redirectTo} from "../../mixins/redirectTo";

class CupioReset extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                margin: auto;
                display: flex;
            }

            .container {
                display: grid;
                grid-template-columns: 1fr;
                border-radius: 12px;
                margin: auto;
                overflow: hidden;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                padding: 32px;
                gap: 64px;
                box-sizing: border-box;
            }

            .input {
                display: flex;
            }

            .authentication {
                gap: 32px;
                display: flex;
                margin-top: 16px;
                align-items: center;
                justify-content: center;
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
        `;
    }

    render() {
        return html`
            <div class="container">
                <div class="form">
                    <span>პაროლის აღსადგენად მიუთითეთ მომხარებლის ელექტრონული ფოსტა. </span>
                    <cupio-input
                            class="input"
                            place-holder="${this.recovery ? 'შეიყვანეთ ახალი პაროლი' : 'შეიყვანეთ ელექტრონული ფოსტა'}"
                            name=""
                            value="${this.email}"
                            @value-changed="${(event) => this.setValue(event, 'email')}"
                    ></cupio-input>
                    <div class="authentication">
                        <div
                                class="register"
                                ?disabled="${this.disabled}"
                                @click="${this.authentication}">
                            გაგზავნა
                        </div>
                    </div>
                    ${this.recovery}
                </div>


        `
    }

    static get properties() {
        return {
            email: {
                type: String,
            }
        };
    }

    constructor() {
        super();
        this.values = {}
        this.email = window.localStorage.getItem('email') || '';
        this.listener = (event) => {
            if (event.key === 'enter' || event.keyCode === 13) this.authentication();
        }
        this.recovery = !!window.location.search;
        document.addEventListener('keydown', this.listener)
        console.log(window.location.search)
        this.token = window.location.search.substr(1);
        if(this.recovery) this.email ='';
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this.listener)
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    setValue(event, item) {
        this.values[item] = event.detail;
    }

    authentication() {
        const email = this.values.email || this.email;

        if (this.recovery) {
            if (email.length < 6) {
                alert('პაროლში სიმბოლოების რაოდენობა არ უნდა იყოს ნაკლები 6ზე')
                return;
            }
        }

        else if (!this.validateEmail(email)) {
            alert('შეამოწმეთ ელფოსტის მისამართი')
            return;
        }

        const regGql = `
            mutation {
                resetPassword(
                email: "${email}",
                )
            }
        `;
        const resetGql = `
               mutation {
                recoveryPassword(
                password: "${email}",
                token: "${this.token}",
                )
            } 
            `
        graphqlPost(this.recovery ? resetGql : regGql).then(({data}) => {
            if(this.recovery){
                if(data.recoveryPassword === 'success') {
                    alert('წარმატებით შევინახეთ, შეგიძლიათ სისტემაში შეხვიდეთ');
                    redirectTo('/login');
                }
                else alert('ტექნიკური ხარვეზი, სცადეთ მოგვიანებით');
            }
            else {
                if(data.resetPassword === 'success') alert('მეილი გამოგზავნილია')
                else alert('ამ ფოსტით არ არსებობს მომხმარებელი');
            }
        })
    }
}

customElements.define('cupio-reset', CupioReset);
