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
                width: 100%;
                padding: 80px 64px;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
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
                padding: 0 64px;
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
                            <a class="link" href="tel:551004010">
                                <img class="call-img" src="/Z-Frontend/images/icons/call.svg">
                                დაგვიკავშირდით: 551 004 010
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
                            <source src="/Z-Frontend/images/video.mp4"
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
                    <h2>სიო დელივერი</h2>
                    <h4>სიო დელივერი გთავაზობთ სწრაფ,ხარისხიან და სანდო საკურიერო მომსახურებას,კორპორატიულ და ინდივიდუალურ გზავნილებზე.
<br><br>
                        კომპანია სიო თანამშრომლობს როგორც მსხვილ,ასევე მცირე (ონლაინ) მაღაზიებთან.
<br><br>
                        ჩვენი უპირატესობა მდგომარეობს შემდეგში:
                        <br>
                        ხელმისაწვდომი ტარიფები,
                        <br>
                        შეკვეთის გაფორმების გახანგძლივებული საათები (00:00-მდე),
                        <br>
                        ამანათის აღების და ჩაბარების სწრაფი,მოქნილი სისტემა (აღება და ჩაბარება ერთ დღეში),
                        <br>მუდმივი კომუნიკაცია მომხმარებელთან,
                        <br>გზავნილის უსაფრთხოება და დაცულობა,
                        <br>ამანათების რაოდენობაზე მინიმალური ზღვარის არქონა.</h4>
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
                img: '/Z-Frontend/images/item1.jpg',
                descriptions: [
                    '💬 ტერიტორიები, რომლებსაც ვემსახურებით თბილისის მასშტაბს გარეთ',
                    '📍 წყნეთი',
                    '📍 წავკისი',
                    '📍 კოჯორი',
                    '📦 ფასი 8 ლარი და რა თქმა უნდა, ჩაბარება როგორც თბილისში, ისე ამ ლოკაციებზედაც ხდება ნივთის აღების დღესვე',
                ]
            },
            {
                img: '/Z-Frontend/images/item2.jpg',
                descriptions: [
                    'ექსპრეს ტარიფი',
                    '💬 რას ნიშნავს 7-ლარიანი ექსპრესს ტარიფი ჩვენთან?',
                    '📍 შეკვეთას ვაფორმებთ დღის 1-ლ საათამდე',
                    '📍 კურიერი მოვა იმდღესვე',
                    '📍 ნივთი ადრესატს ჩაბარდება ამანათის აღების დღეს',
                    '📌 ანუ შეკვეთის გაფორმება და ამანათის ჩაბარება ხდება ერთ დღეში',
                ]
            },
            {
                img: '/Z-Frontend/images/item3.jpg',
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
