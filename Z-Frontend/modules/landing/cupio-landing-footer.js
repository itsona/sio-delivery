import {LitElement, html, css} from 'lit-element';

class CupioLandingFooter extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                background: rgba(0, 0, 0, 0.9);
                padding: 24px 64px;
                color: white;
                display: flex;
                justify-content: space-between;
                width: 100%;
                box-sizing: border-box;
            }
            
            .container {
                width: 1160px;
                padding: 24px 64px;
                color: white;
                display: flex;
                justify-content: space-between;
            }
            .logo {
                display: flex;
                padding-top: 12px;
                align-items: center;
                gap: 16px;
            }

            .logo img {
                height: 64px;
                border-radius: 50%;
            }

            .footer-content {
                color: inherit;
                text-decoration: none;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            .social-networks {
                display: flex;
            }

            .image {
                width: 80px;
                height: 80px;
                padding-right: 12px;
            }

            #bottom-text {
                margin: 3px 0 0px 2px;
            }

            .reserved {
                color: rgba(255, 255, 255, 0.4);
                font-size: 12px;
            }

            .reserved-container {
                display: flex;
                flex-grow: 1;
                align-items: flex-end;
                padding-bottom: 12px;
            }

            .social-networks img {
                width: 20px;
                height: 20px;
            }

            .link-item {
                display: flex;
                gap: 8px;
                padding: 8px 0 0;
            }

            #phone {
                width: 24px;
                height: 24px;
                margin: -2px 0 0 -2px;
            }

            .link-item a {
                display: flex;
                color: white;
                text-decoration: none;
                align-items: center;
            }

            .link-item img {
                width: 19px;
                height: 19px;
                padding: 2px;
                margin: 1px 0 0 1px;
            }

            .border {
                display: flex;
                padding: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                margin-right: 8px;
                box-sizing: border-box;
                max-width: 36px;
                max-height: 36px;
            }

            .info {
                display: flex;
                flex-direction: column;
                max-width: 256px;
                row-gap: 12px;
                padding-top: 12px;
            }

            .description {
                font-size: 12px;
                white-space: normal;
                line-height: 15px;
                color: rgba(255, 255, 255, 0.3);
            }

            @media only screen and (max-width: 700px) {
                :host {
                    flex-direction: column;
                    padding: 8px 64px;
                    row-gap: 12px;
                }

                .logo {
                    padding: 0;
                }

                .footer-content {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
                }

                .links {
                    padding-bottom: 24px;
                }
            }

            @media only screen and (max-width: 768px) {
                :host {
                    padding: 8px 24px;
                }
            }

            @media only screen and (max-width: 1024px) {
                :host {
                    padding: 24px 32px;
                }
            }
        `;
    }

    render() {
        return html`
            <div class="container">
                <div class="footer-content">
                    <div class="logo">
                        <img src="/Z-Frontend/images/logo.png">
                        <span>სიო დელივერი</span>
                    </div>
                    <div class="reserved-container"><span class="reserved">All right reserved ©2021</span></div>
                </div>
                <div class="footer-content links">
                    <div class="link-item">
                        <a href="tel:551004010">
                            <div class="border"><img id="phone" src="/Z-Frontend/images/icons/call.svg"></div>
                            551 004 010
                        </a>
                    </div>
                    <div class="link-item">

                        <a href="mailto:info@siodelivery.ge">
                            <div class="border"><img src="/Z-Frontend/images/icons/gmail.svg"></div>
                            info@siodelivery.ge</a>
                    </div>
                    <div class="link-item">
                        <a>
                            <div class="border"><img src="/Z-Frontend/images/icons/location.svg"></div>
                            Tbilisi Georgia</a>
                    </div>
                </div>
                <div class="info">
                    <span class="title">ჩვენს შესახებ</span>
                    <span class="description">სიო დელივერი • Sio Delivery გახლავთ კომპანია, რომელიც სთავაზობს მსურველებს მიტანის სერვისს.</span>
                    <div class="social-networks">
                        <a class="border" href="https://www.facebook.com/siodelivery" target="_blank">
                            <img src="/Z-Frontend/images/icons/facebook.svg"></a>
                        <a class="border"
                            href="https://www.instagram.com/_sio_delivery/"
                           target="_blank"
                        ><img src="/Z-Frontend/images/icons/instagram-logo.svg"></a>
                    </div>
                </div>
            </div>
        `
    }

    constructor() {
        super();

    }
}

customElements.define('cupio-landing-footer', CupioLandingFooter);
