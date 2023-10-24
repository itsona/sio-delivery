import {LitElement, html, css} from 'lit-element'
import '../main/common/cupio-main-left';
import '../main/common/cupio-main-container';
import {redirectTo} from "../../mixins/redirectTo";
import {graphqlPost, handleRequest} from "../../mixins/graphql";

class CupioDeliveryView extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: grid;
                width: 100%;
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
            
            .excel {
                color: unset;
                font-weight: bold;
                padding-left: 4px;
                cursor: pointer;
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
                    background-color: rgba(0, 0, 0, 0.2);
                    display: flex;
                    box-shadow: rgba(0, 0, 0, 0.2) 0px 100px 12px 0.5px;
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
                        id="left"
                        ?closed="${this.closed}"
                        delivery
                        @closed="${() => this.closed = true}"
                        @status-changed="${this._onStatusChange}"
                        @searched="${this.searchWithWord}"></cupio-main-left>
            </div>
            <div class="right">
                <div class="drawer" @click="${() => this.closed = false}" ?closed="${this.closed}">
                    <img src="/Z-Frontend/images/icons/search.svg">
                </div>
                ${this.panel ? html`
                    <a class="link" href="/new">
                        შეკვეთის დამატება
                        <img src="/Z-Frontend/images/icons/add.svg">
                    </a>
                `:''}
                ${this.statuses.map((status) => html`
                    <cupio-main-container
                            class="category"
                            delivery
                            .searchValues="${this.searchValues}"
                            status="${status}"
                            @need-to-change="${this.updateAllContainer}"
                    ></cupio-main-container>
                `)}
            </div>

        `
    }

    static get properties() {
        return {
            closed: {
                type: Boolean,
            },
            searchValues: {
                type: Object,
            },
            statuses: {
                type: Array,
            },
            panel: {
                type: Boolean,
            },
        };
    }

    constructor() {
        super();
        this.closed = true;
        this.searchValues = {};
        if (!localStorage.getItem('rndString')) redirectTo('/login');
        handleRequest(false).then(r => {
            this.panel = r === 'admin';
            this.setStatuses();
            this.loadUsers();
        });
        this.loadForAccept();
    }

    setStatuses(){
        this.statuses = [
            'ჩასაბარებელი',
            'ასაღები',
            'აღებული',
            'ჩაბარებული',
        ];
        if(this.panel){
            this.statuses = ['განხილვაშია', ...this.statuses,  ]
        }
    }

    updateAllContainer(){
        const categories = this.shadowRoot.querySelectorAll('.category')
        categories.forEach((category)=> category.loadAfterChange())
        this.shadowRoot.querySelector('#left').loadBudget();
    }

    loadExcel(){
        const gql =
            `        
            {
                loadExcel(
                fromDate: "${this.searchValues.fromDate|| ''}"
                toDate: "${this.searchValues.toDate|| ''}"
                
                )
                }
            `
        graphqlPost(gql).then()
    }

    searchWithWord(e) {
        this.searchValues = {}
        setTimeout(() => this.searchValues = e.detail, 100)
    }

    _onStatusChange(event) {
        this.statuses = [];
        const status = event.detail;
        setTimeout(() => {
            if (status) {
                this.statuses = [status];
            } else {
                this.setStatuses();
            }
        }, 100);
    }

    loadForAccept() {
        const gql =
            `
                
            {
                getForAccept{
                    id
                }
                }
            `
        graphqlPost(gql).then(({data: {getForAccept}}) => {
            if (getForAccept.length) redirectTo('/deliveryDetails');
            else handleRequest(true);
        })
    }
}

customElements.define('cupio-delivery-view', CupioDeliveryView);
