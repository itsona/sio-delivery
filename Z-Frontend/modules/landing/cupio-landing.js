import {LitElement, html, css} from 'lit-element';
import '../../common/cupio-logo';
import './cupio-landing-item';
import './cupio-landing-action';
import './cupio-landing-footer'

class CupioLanding extends LitElement {
    //Language=css
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: flex;
                flex-direction: column;background: rgb(168,238,223);
                background: linear-gradient(90deg, rgba(148,218,255,1) 0%, rgba(218,245,237,1) 30%, rgba(255,255,255,1) 48%);
                min-height: 100vh;
            }

            .container {
                width: 1160px;
                margin: 32px auto;
                display: flex;
                flex-direction: column;
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                z-index: 3;
                padding: 8px 0;
                background-color: rgba(0,0,0,0.1);
                transition: padding 0.3s ease-in-out;
                cursor: pointer;
            }
            
            .header:hover {
                padding: 12px 0;
            }

            .logo {
                height: 64px;
                border-radius: 50%;
            }

            .authorization {
                text-decoration: none;
                display: flex;
                align-self: baseline;
                padding: 8px;
                background: dodgerblue;
                border-radius: 12px;
                color: white;
                cursor: pointer;
                font-weight: bold;
            }

            video {
                height: 500px;
                top: 0;
                transition: transform 0.7s ease;
                left: 0;
                transform: translateX(50%);
            }

            :host([moved]) video, :host([moved]) .left {
                transform: translateX(0);
            }

            .slider {
                display: flex;
                overflow: hidden;
            }

            .left {
                display: flex;
                transform: translateX(-50%);
                transition: transform 0.7s;
                flex-direction: column;
                justify-content: center;
                padding-bottom: 16px;
            }
            
            .header-container {
                flex-direction: row;
                justify-content: space-between;
                margin: 0 auto;
                align-items: center;
                z-index: 1;
            }

            .right {
                display: flex;
                position: relative;
                width: 600px;
                height: 448px;
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
                width: 24px;
                display: flex;
                align-self: baseline;
                padding-right: 4px;
                padding-top: 2px;
            }

            .system {
                display: flex;
                align-items: center;
                padding-top: 2px;
                gap: 48px;
            }

            h3 {
                margin: 12px 0;
                color: rgb(88, 88, 88);
            }

            .items {
                padding-top: 24px;
                display: flex;
                gap: 64px;
                width: 100%;
                justify-content: center
            }
            
            .actions {
                gap: 0px
            }
            
            .long-story {
                display: flex;
                flex-direction: column;
                padding: 64px 0;
            }
            
            .long-story h4{
                padding: 0 32px;
                color: rgb(88, 88, 88);
            }

        `;
    }

    render() {
        return html`
            <div class="container">
                <div class="header">
                    <div class="container header-container">
                        <img class="logo" src="/Z-Frontend/images/logo.png">
                        <div class="system">
                            <a class="link" href="tel:593123123">
                                <img class="call-img" src="/Z-Frontend/images/icons/call.svg">
                                დაგვიკავშირდით: 593 123 123
                            </a>
                            <a class="authorization" href="/login">სისტემაში შესვლა</a>
                        </div>
                    </div>
                </div>
                <div class="slider">
                    <div class="left">
                        <h1>მიტანის სერვისი თბილისის მასშტაბით</h1>
                        <h3>სიო დელივერი • Sio Delivery
                            გახლავთ კომპანია, რომელიც
                            სთავაზობს მსურველებს მიტანის სერვისს.</h3>
                        <h3>დაელოდე, ჩვენ მოგიტანთ.</h3>
                        <a class="authorization" href="/login">შეუკვეთე ახლავე</a>

                    </div>
                    <div class="right">
                        <video autoplay muted loop id="background-element">
                            <source src="https://scontent.ftbs4-1.fna.fbcdn.net/v/t42.1790-4/139361958_217422696741472_3215423416468801845_n.mp4?_nc_cat=111&ccb=1-3&_nc_sid=985c63&efg=eyJ2ZW5jb2RlX3RhZyI6InN2ZV9zZCJ9&_nc_eui2=AeFojn428zZzxnPum9EAmy1bbLbChzYKfuhstsKHNgp-6HYS5XnaBkPPD2_MzgOTsiqWN_jdknXxzXJ8fIgI3M-E&_nc_ohc=PVuVpMvOYSoAX_1c8T4&_nc_ht=scontent.ftbs4-1.fna&oh=29bf513a543f9eaea071663ef24dfdec&oe=60B2B703"
                                    type="video/mp4">
                        </video>
                    </div>
                </div>
                <div class="items">
                    ${this.items.map((item) => html`
                        <cupio-landing-item
                                .img="${item.img}"
                                .descriptions="${item.descriptions}">
                        </cupio-landing-item>
                    `)}
                </div>
                <div class="long-story">
                    <h2>არწერის სათაური</h2>
                    <h4>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                        consequat. Duis aute irure dolor Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        Duis aute irure dolor</h4>
                </div>


                <div class="items actions">
                    ${this.actions.map((item) => html`
                        <cupio-landing-actions
                                .img="${item.img}"
                                .title="${item.title}"
                                .description="${item.description}">
                        </cupio-landing-actions>
                    `)}
                </div>
            </div>
            <cupio-landing-footer></cupio-landing-footer>

        `
    }

    constructor() {
        super();
        setTimeout(() => this.moved = true, 100);
        this.items = [
            {
                img: 'https://scontent.ftbs4-1.fna.fbcdn.net/v/t1.6435-9/186454816_202008548427509_9140186898719793968_n.jpg?_nc_cat=106&ccb=1-3&_nc_sid=a26aad&_nc_eui2=AeFXQXKDnwGDctdmfbr1D_UUUsGmzDpNUl1SwabMOk1SXcwJWyW3YjJ6X_NR7DA-2Qo5YjMCUBNrg8fkO8o1xC9Z&_nc_ohc=3rgibQRF0ZQAX-zKSm_&_nc_ht=scontent.ftbs4-1.fna&oh=890aa57c7364fe2f1a98243b560a4c5a&oe=60D7987E',
                descriptions: [
                    '💬 ტერიტორიები, რომლებსაც ვემსახურებით თბილისის მასშტაბს გარეთ',
                    '📍 წყნეთი',
                    '📍 წავკისი',
                    '📍 კოჯორი',
                    '📍 ტაბახმელა',
                    '📦 ფასი 6 ლარი და რა თქმა უნდა, ჩაბარება როგორც თბილისში, ისე ამ ლოკაციებზედაც ხდება ნივთის აღების დღესვე',
                ]
            },
            {
                img: 'https://scontent.ftbs4-1.fna.fbcdn.net/v/t1.6435-0/p180x540/186549868_201381371823560_201148610162476361_n.jpg?_nc_cat=100&ccb=1-3&_nc_sid=a26aad&_nc_eui2=AeFrzRpDaOyCJwDZlPUKPQlDzRoMPPrg6EHNGgw8-uDoQYvRi-jMV7JMQmCYOtsSPCNW8y4x6fj8GCwPyKJ1QGoP&_nc_ohc=YDlrXrzRHYwAX_LczjP&_nc_ht=scontent.ftbs4-1.fna&tp=6&oh=7883bb9512f7e7f14cf3f65884736c7f&oe=60D88F63',
                descriptions: [
                    'ექსპრეს ტარიფი',
                    '💬 რას ნიშნავს 6ლარიანი ექსპრესს ტარიფი ჩვენთან?',
                    '📍 შეკვეთას ვაფორმებთ დღის 1-ლ საათამდე',
                    '📍 კურიერი მოვა იმდღესვე',
                    '📍 ნივთი ადრესატს ჩაბარდება ამანათის აღების დღეს',
                    '📌 ანუ შეკვეთის გაფორმება და ამანათის ჩაბარება ხდება ერთ დღეში',
                ]
            },
            {
                img: 'https://scontent.ftbs4-1.fna.fbcdn.net/v/t1.6435-9/185945744_197206752241022_7402988348124777860_n.jpg?_nc_cat=111&ccb=1-3&_nc_sid=9267fe&_nc_eui2=AeG7zLURKqy1UwG7x75x0pgDH_aH220olNcf9ofbbSiU12Cuy6HyLZeh1IJ3T4vcdEG8KptmQ_B4gCyO-6DbTO1g&_nc_ohc=4fCX5t6jFr4AX-x1zmz&_nc_ht=scontent.ftbs4-1.fna&oh=43722efb679f9c0a196bfe36a2c3c425&oe=60D693F1',
                descriptions: [
                    '📦 ამანათები, რომლებიც შეგიძლიათ გაგზავნოთ ჩვენი დახმარებით:',
                    '📍 ტანსაცმელი, ფეხსაცმელი, თავის მოვლის საშუალებები, ჩანთა თუ სხვა აქსესუარები',
                    '📍 მსხვრევადი ნივთები',
                    '📍 საბუთები და ხელშეკრულებები',
                    '📍 სათამაშოები',
                    '📍 მცირე ზომის საყოფაცხოვრებლო ნივთები',
                    '📍 შესაბამისი ზომის ნებისმიერი ტიპის ამანათები'
                ]
            },


        ];

        this.actions = [
            {
                img: 'action-thunder',
                title: 'უსწრაფესი მიწოდება',
                description: 'სიო გთავაზობთ უსწრაფეს მომსახურებას, რომელიც ბაზარზე ერთერთი უკონკურენტოა.'
            },
            {
                img: 'action-safety',
                title: 'უსაფრთხოება',
                description: 'ამანათებისა თუ გზავნილების უსაფრთხო მიწოდება არის ჩვენი მთავარი სავიზიტო ბარათი.'
            },
            {
                img: 'action-support',
                title: '24/7 Support',
                description: 'ჩვენს სისტემაში შეგიძლიათ მარტივად მართოთ გზავნილები, მიუხედავად ამისა,' +
                    'ჩვენი ჯგუფი უწყვეტად მოგემსახურებათ.'
            },
        ]
    }

    static get properties() {
        return {
            moved: {
                type: Boolean,
                reflect: true,
            },
            items: {
                type: Array
            },
        };
    }

}

customElements.define('cupio-landing', CupioLanding);
