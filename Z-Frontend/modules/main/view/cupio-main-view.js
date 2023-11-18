import {LitElement, html, css} from 'lit-element'
import '../common/cupio-main-left';
import '../common/cupio-main-container';
import {graphqlPost, handleRequest} from "../../../mixins/graphql";
import {redirectTo} from "../../../mixins/redirectTo";

class CupioMainView extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: grid;
                width: 100%;
            }

            .left {
                height: 100vh;
                border-right: 1px solid rgb(230, 230, 230);
                width: 20vw;
                position: fixed;
            }

            .right {
                margin-left: 20vw;
                display: flex;
                flex-direction: column;
            }

            .drawer {
                display: none;
            }

            .menu-container {
                display: flex;
                position: absolute;
                top: 0;
                column-gap: 32px;
                right: 40px;
            }

            .register {
                color: black;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                transition: color 0.5s;
                display: flex;
            }

            .register:hover {
                color: gray;
            }

            @media only screen and (max-width: 800px) {
                .left {
                    position: fixed;
                    height: unset;
                    width: 100vw;
                    border: unset;
                    z-index: 1;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px 0.5px;
                }


                .right {
                    margin-left: 0;
                }

                .left[closed] {
                    /*display: none;*/
                    box-shadow: none;
                    transform: translateX(-100%);
                }

                .drawer[closed] {
                    display: flex;
                    position: absolute;
                    top: 24px;
                    left: 24px;
                }

                .drawer img {
                    width: 20px;
                    height: 20px;
                }
            }
        `;
    }

    render() {
        return html`
            <div class="left" ?closed="${this.closed}">
                <cupio-main-left
                        ?closed="${this.closed}"
                        @closed="${() => this.closed = true}"
                        @status-changed="${this._onStatusChange}"
                        @searched="${this.searchWithWord}"
                        ?panel="${this.panel}"></cupio-main-left>
            </div>
            <div class="right">
                <div class="drawer" @click="${() => this.closed = false}" ?closed="${this.closed}">
                    <img src="/Z-Frontend/images/icons/search.svg">
                </div>

                <cupio-main-container
                        id="container"
                        .searchValues="${this.searchValues}"
                        class="category"></cupio-main-container>
            </div>

        `
    }

    static get properties() {
        return {
            closed: {
                type: Boolean,
            },
            searchWord: {
                type: String,
            },
            searchValues: {
                type: Object,
            },
        };
    }

    constructor() {
        super();
        this.searchValues = {};
        this.closed = true;
        this.loadClientInfo()
        if (!window.localStorage.getItem('rndString')) redirectTo('/login')
        handleRequest(true);
    }

    logout() {
        window.localStorage.removeItem('rndString');
        this.panel = false;
        location.reload();
    }

    searchWithWord(e) {
        this.searchValues = {};
        setTimeout(()=> this.searchValues = e.detail, 100)
    }

    _onStatusChange(event) {
        const container = this.shadowRoot.querySelector('#container');
        container.loadWithStatus(event.detail);
    }

    loadClientInfo() {
        const gql = `
        {
            userInfo{
                address
                phone
                status
            }
        }`

        graphqlPost(gql).then(({data: {userInfo}}) => {
            if (!userInfo.status) redirectTo('/companyDetails')
        }).catch();
    }
}

customElements.define('cupio-main-view', CupioMainView);
