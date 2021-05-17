import {LitElement, html, css} from 'lit-element'
import '../../common/cupio-logo';
class CupioLanding extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                flex-grow: 1;
                padding: 0 128px;
                box-sizing: border-box;height: 100vh;
                align-items: baseline;
                flex-direction: column;
            }

            .main {
                display: flex;
                gap: 8%
            }

            .container {
                display: flex;
                flex-direction: column;
                width: 33%;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
                color: unset;
                text-decoration: none;
                background: white;
                transition: transform 0.2s ease-in-out;
            }

            .image {
                background-repeat: round;
                width: 100%;
                height: 100%;
                /*padding-bottom: 100%;*/
                /*border-radius: 50%;*/
            }

            .text {
                display: flex;
                flex-direction: column;
                padding: 0 12px 12px;
                bottom: 0;
                left: 0;
                position: relative;
            }

            .title {
                font-weight: 600;
                font-size: 14px;
                padding: 4px;
                text-align: center;
                white-space: nowrap;
                color: unset;
            }

            .description {
                font-weight: 600;
                font-size: 16px;
                color: rgb(160, 160, 160);
            }

            .image-container {
                /*padding: 48px 48px 56px;*/
                overflow: hidden;
            }

            .image-container[index="0"] .image{
                transform: scale(1.5);
            }

            .triangle-container {
                display: flex;
                height: 8px;
                flex-grow: 1;
                position: absolute;
                width: 100%;
                left: 0;
                top: -8px;
            }

            .triangle {
                border-width: 8px;
                border-style: solid;
                left: 50%;
                border-bottom-color: white;
                border-right-color: white;
                border-left-color: white;
                width: 0;
                border-top-color: transparent;

            }

            .helper {
                display: flex;
                flex-grow: 1;
                background: white;
            }

            .circle {
                display: flex;
                width: 4px;
                height: 4px;
                background: transparent;
                position: absolute;
                top: 1px;
                left: calc(50% - 4px);
                border: 2px solid transparent;
                border-bottom-color: white;
                border-radius: 50%;
            }

            @media only screen and (max-width: 800px) {

            }

        `;
    }

    render() {
        return html`
        <cupio-logo></cupio-logo>
        <div class="main">
        ${this.mainPages.map((item, index) => html`
            <a class="container" href="${item.href}">
                <div class="image-container" index="${index}">
                </div>
                <div class="text">
                    <div class="triangle-container">
                        <div class="helper"></div>
                        <div class="triangle" index="${index}">
                        <div class="circle"></div>
</div>
                        <div class="helper"></div>

                    </div>
                    <span class="title">${item.title}</span>
                    <span class="description">${item.description}</span>
                </div>
            </a>
            </div>
        `)}
        `
    }

    static get properties() {
        return {
            mainPages: {
                type: Array,
            },
        };
    }

    constructor() {
        super();
        this.mainPages = [
            {
                href: '/client',
                title: 'კლიენტის გვერდი',
                description: 'ახლა კლიკის დროს გადადის შემდეგში შესვლის დროს თავად გადაამისამართებს კლიენტის გვერდზე.',
            },
            {
                href: '/delivery',
                title: 'კურიერების გვერდი',
                description: 'ახლა კლიკის დროს გადადის შემდეგში შესვლის დროს თავად გადაამისამართებს კურიერების გვერდზე.',
            },
            {
                href: '/login',
                title: 'ავტორიზაციის გვერდი',
                description: 'ახლა კლიკის დროს გადადის შემდეგში შესვლის დროს თუ რეგისტრირებული არაა თავად გადაამისამართებს რეგისტრაცია ავტორიზაციის გვერდზე.',
            },
        ]
    }

}

customElements.define('cupio-landing', CupioLanding);
