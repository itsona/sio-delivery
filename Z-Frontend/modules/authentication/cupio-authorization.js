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
                padding: 64px;
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
                box-sizing: border-box;
            }

            .form {
                display: flex;
                flex-direction: column;
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

            .register[disabled] {
                opacity: 0.5;
                pointer-events: none;
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

            label {
                cursor: pointer;
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

            .right {
                display: flex;
                flex-direction: column;
                max-height: 460px;
                overflow-y: scroll;
                padding-left: 12px;
                border-left: 1px solid darkgrey;
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
                                        value="${item === 'email' && this.email ? this.email : ''}"
                                        @value-changed="${(event) => this.setValue(event, item)}"
                                ></cupio-input>
                            `
                    )}
                    <span>
                    <input
                            type="checkbox"
                            id="check"
                            name="check"
                            @change="${(event) => this.disabled = !event.currentTarget.checked}">
                        <label for="check">ვეთანხმები პირობებს</label></span>
                    <div class="authentication">
                        <div
                                class="register"
                                ?disabled="${this.disabled}"
                                @click="${this.authentication}">
                            ${this.isReg ? 'რეგისტრაცია' : 'ავტორიზაცია'}
                        </div>
                        <a
                                class="contact login"
                                href="/${this.isReg ? 'login' : 'register'}">
                            ${this.isReg ? 'უკვე მაქვს ანგარიში' : 'რეგისტრაცია'}</a>
                        <a
                                class="contact login"
                                href="/reset"
                                target="_blank"
                        >
                            პაროლის აღდგენა</a>
                    </div>
                    <div class="additionals">
                        <span id="facebook" @click="${this.statusChangeCallback}">
                            <img src="/Z-Frontend/images/icons/facebook.svg">
                            ავტორიზაცია Facebook-ის გამოყენებით
                        </span>

                        <span id="gmail" @click="${this.handleAuthClick}">
                            <img src="/Z-Frontend/images/icons/gmail.svg">
                            ავტორიზაცია Gmail-ის გამოყენებით
                        </span>
                    </div>
                </div>
                <div class="right">
                    <cupio-logo></cupio-logo>
                    <span>
                        <span style="font-weight: bold">შეკვეთის გაფორმების ინსტრუქცია და ვადები:</span> 

<br><br><br>
1.სტანდარტული (ეკონომ) ტარიფით სარგებლობის სურვილის შემთხვევაში,შეკვეთა უნდა გაფორმდეს ამანათის ჩაბარების თარიღის წინა დღის,არაუგვიანეს 00:00 საათისა.
<br><br>2.ექსპრეს ტარიფით სარგებლობის სურვილის შემთხვევაში შეკვეთა უნდა გაფორმდეს მაქსიმუმ იმავე დღის 13:00 საათამდე.
<br><br>3.სტანდარტული შეკვეთის შემთხვევაში კურიერი ამანათს აიღებს დღის პირველ ნახევარში (12-13საათამდე) და ჩაბარდება ადრესატს იმავე დღის ბოლომდე.
<br><br>4.სტანდარტული (ეკონომ) ტარიფი გაიზრდება ამანათის ჩაბარების საათების მკვეთრი შეზღუდვის შემთხვევაში და იმოქმედებს ექსპრეს ტარიფი.
<br><br>5.შეკვეთის გაფორმების შემდეგ ამანათზე დატანილი უნდა იყოს მიმღების მისამართი და საკონტაქტო ნომერი(დარწმუნდით რომ მონაცემები არის მყარად მიმაგრებული ამანათზე).
<br><br>6.დარწმუნდით, რომ ამანათი არის სათანადოდ დალუქუ
<br>(რათა ნივთი შემთხვევით არ დაზიანდეს, დაბინძურდეს ან ამოვარდეს).
<br><br>7.ამანათის ზომა და მოცულობა არ უნდა აღემატებოდეს მოპედისთვის განკუთვნილი გადასატანი ჩანთის მოცულობის ნახევარს(სხვა არასტანდარტული მოცულობის და ზომის ამანათის გადატანა დააზუსტეთ ოპერატორთან).

<br><br>8.თუ ადრესატი არ პასუხობს მითითებულ ნომერზე,ამანათის ჩაბარების თარიღი გადაიწევს მომდევნო სამუშაო დღისთვის.
<br><br>
9.კომპანია იხსნის ვალდებულებას მიღებული პროდუქციის ხარისხზე ან შეუსაბამო ზომებზე და ნივთის უკან დაბრუნებას არ ახორციელებს გამგზავნის თანხმობის გარეშე.
<br>
<br>
10.კურიერი არ არის ვალდებული დაელოდოს ადრესატს მიღებული ნივთის შეფასების ან მოზომვის მომენტში (რათა კურიერის საქმიანობა არ შეფერხდეს).
<br>
<br>
11.საკურიერო მომსახურების ანაზღაურება ხორციელდება საბანკო გადმორიცხვით, სასურველია შეკვეთის გაფორმებისთანავე.
<br>
<br>
12.დამატებითი დეტალები ან მნიშვნელოვანი ინფორმაცია,ადრესატის ან ამანათის(მაგ:მსხვრევადი,მარტივად დეფორმირებადი) შესახებ,გთხოვთ მიუთითოთ კომენტარის საშუალებით.                    </span>
                </div>
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
            disabled: {
                type: Boolean,
            },
            values: {
                type: Object,
            },
            email: {
                type: String,
            }
        };
    }

    constructor() {
        super();
        this.disabled = true;
        this.listener = (event) => {
            if (event.key === 'enter' || event.keyCode === 13) this.authentication();
        }
        document.addEventListener('keydown', this.listener)
        if (!!localStorage.getItem('rndString')) handleRequest(true)
        this.regInfo = ['name', 'email', 'password', 'repeat password'];
        setTimeout(() => {
            this.isReg = window.location.pathname !== '/login';
            if (!this.isReg) this.regInfo = ['email', 'password']
        }, 50);
        this.values = {};
        this.email = window.localStorage.getItem('email') || '';
        this.values.email = this.email;
        window.fbAsyncInit = () => {
            FB.init({
                appId: '340047111023873',
                cookie: true,                     // Enable cookies to allow the server to access the session.
                xfbml: true,                     // Parse social plugins on this webpage.
                version: 'v10.0'           // Use this Graph API version for this call.
            });


            FB.getLoginStatus((response) => {   // Called after the JS SDK has been initialized.
                this.statusChangeCallback(response);        // Returns the login status.
            });
        };
    }

    initGoogle() {
        this.GoogleAuth = null;
        this.SCOPE = 'https://www.googleapis.com/auth/userinfo.email';
        this.handleClientLoad()
    }
    handleClientLoad() {
        // Load the API's client and auth2 modules.
        // Call the initClient function after the modules load.
        gapi.load('client:auth2',this.initClient);
    }

    initClient() {
        const cl = new CupioAuthorization();
        var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
        const SCOPE = cl.SCOPE;
        gapi.client.init({
            'clientId': '73835995426-mobvi48b742q22ji731j6a4off70bodg.apps.googleusercontent.com',
            'discoveryDocs': [discoveryUrl],
            'scope': SCOPE
        }).then(()=> {
            cl.GoogleAuth = gapi.auth2.getAuthInstance();

            // Listen for sign-in state changes.
            cl.GoogleAuth.isSignedIn.listen(cl.updateSigninStatus);

            // Handle initial sign-in state. (Determine if user is already signed in.)
            cl.user = cl.GoogleAuth.currentUser.get();
            cl.setSigninStatus();
        });
    }

    handleAuthClick() {
        GoogleAuth.signOut();
        GoogleAuth.signIn();
        GoogleAuth.isSignedIn.listen(this.updateSigninStatus);

    }

    updateSigninStatus(){
        const user = GoogleAuth.currentUser.get();
        if(!user.mc) return;
        const item = {
            email: user.Os.zt,
            name: user.Os.ET,
            id: user.Ys.xS,
            token: user.Zb.access_token,
            channel: 'google'
        }
        const cl = new CupioAuthorization();
        cl.socialAuth(item);
        // GoogleAuth.signOut();
    }

    statusChangeCallback(response){
        FB.api('/me?fields=email, name', function(response) {
            FB.login((login)=> {
                response.token = login.authResponse.accessToken;
                response.channel = 'facebook'
                const cl = new CupioAuthorization();
                cl.socialAuth(response);
            })
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this.listener)
    }

    getName(item) {
        switch (item) {
            case 'name':
                return 'სახელი, გვარი';
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
        if (this.disabled) {
            alert('გაეცანით და დაეთანხმეთ პირობებს')
            return;
        }
        if (!this.validateEmail(this.values.email)) {
            alert('შეამოწმეთ ელფოსტის მისამართი')
            return;
        }

        if (this.isReg) {
            if (this.values.password.length < 6) {
                alert('პაროლში სიმბოლოების რაოდენობა არ უნდა იყოს ნაკლები 6ზე')
                return;
            }
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
            if (r.data.user) {
                window.localStorage.setItem('rndString', r.data.user);
                handleRequest(true);
                window.localStorage.setItem('email', this.values.email)
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
    socialAuth(response) {
        const regGql = `
            mutation {
                FbLogin(
                name: "${response.name}",
                email: "${response.email || response.id}",
                id: "${response.id}",
                token: "${response.token}",
                channel: "${response.channel}",
                )
            }
        `
        graphqlPost(regGql).then(({data: {FbLogin}}) => {
            window.localStorage.setItem('rndString', FbLogin);
            handleRequest(true);
        })
    }
}

customElements.define('cupio-authorization', CupioAuthorization);
