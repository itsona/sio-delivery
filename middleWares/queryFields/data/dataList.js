const pageData = require('../../authentication').pageData;
const ObjectId = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken');
const fs = require('fs')
const path = require('path')
require('dotenv').config();
const nodemailer = require('nodemailer');
const loadFile = require('./createXcel')
const {
    GraphQLList,
    GraphQLFloat,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLNonNull,
    GraphQLInt,
} = require('graphql');

const userData = require('../../authentication').userData;

const DataType = new GraphQLObjectType({
    name: 'data',
    description: 'returns all data',
    fields: () => ({
        client: {type: GraphQLString},
        clientName: {type: GraphQLString},
        takeAddress: {type: GraphQLNonNull(GraphQLString)},
        deliveryAddress: {type: GraphQLNonNull(GraphQLString)},
        status: {type: GraphQLNonNull(GraphQLString)},
        service: {type: GraphQLNonNull(GraphQLString)},
        takeCourier: {type: GraphQLString},
        deliveryCourier: {type: GraphQLString},
        takeDate: {type: GraphQLString},
        registerDate: {type: GraphQLString},
        deliveryDate: {type: GraphQLString},
        description: {type: GraphQLNonNull(GraphQLString)},
        phone: {type: GraphQLString},
        deliveryPhone: {type: GraphQLString},
        price: {type: GraphQLFloat},
        id: {type: GraphQLString},
        accepted: {type: GraphQLBoolean},
        canceled: {type: GraphQLBoolean},
        payed: {type: GraphQLBoolean},
    }),
})

const getForAccept = {
    type: GraphQLList(DataType),
    description: 'List of All data',

    resolve: (parent, args, response) => {
        return pageData().then(async ({res,db}) => {
            const token = response.headers.token;
            const courier = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
            const data = await res.find({
                accepted: false, $or: [
                    {status: 'ასაღები', takeCourier: courier},
                    {status: 'აღებული', deliveryCourier: courier}]
            }).toArray()
            db.close();
            return data;
        })
    }
}

const loadExcel = {
    type: GraphQLBoolean,
    args: {
        fromDate: {type: GraphQLString},
        toDate: {type: GraphQLString},
    },
    description: 'List of All data',

    resolve: async (parent, args, response) => {
        return pageData().then(async ({res,db}) => {
            const token = response.headers.token;
            if(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
            const query = {}
            if(args.fromDate){
                if(!query.registerDate) query.registerDate = {};
                query.registerDate['$gte'] = args.fromDate;
            }
            if(args.toDate) {
                if(!query.registerDate) query.registerDate = {};
                query.registerDate['$lte'] = args.toDate;
            }
            // const data = await res.find(query,
            //     {accepted: 1,courierChanged: 1, oldPayed: 1, payed: 1, counted: 1}
            //     ).toArray()
            const data = await res.aggregate([
                {$match: query},
                {
                    $project: {_id: 0, accepted: 0,courierChanged: 0, oldPayed: 0, counted: 0}
                    }]).toArray()

            const filePath = './middleWares/excel-from-js.xlsx';
            try {
                fs.unlinkSync(path.resolve(filePath))
            }catch (e) {
                console.log(e)
            }
             loadFile(data)
            db.close();
            return true;
        })
    }
}
const dataList = {
    type: GraphQLList(DataType),
    description: 'List of All data',
    args: {
        client: {type: GraphQLString},
        status: {type: GraphQLString},
        skip: {type: GraphQLInt},
        limit: {type: GraphQLInt},
        searchWord: {type: GraphQLString},
        from: {type: GraphQLInt},
        to: {type: GraphQLInt},
        fromDate: {type: GraphQLString},
        toDate: {type: GraphQLString},
    },
    resolve: (parent, args, response) => {
        return pageData().then(async ({res,db}) => {
                const token = response.headers.token;
                let query = {};
                if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin'

                    && jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'delivery') {
                    query = {
                        client: jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email,
                    }
                }

                if (args.searchWord) {
                    // return res.find(query, {$text: {$search: args.searchWord}}).toArray().then((e) => {
                    //     return e;
                    // })
                    query["$or"] = [
                        {takeAddress: {'$regex': args.searchWord}},
                        {deliveryAddress: {'$regex': args.searchWord}},
                        {status: {'$regex': args.searchWord}},
                        {takeCourier: {'$regex': args.searchWord}},
                        {deliveryCourier: {'$regex': args.searchWord}},
                        {takeDate: {'$regex': args.searchWord}},
                        {deliveryDate: {'$regex': args.searchWord}},
                        {description: {'$regex': args.searchWord}},
                        {phone: {'$regex': args.searchWord}},
                        {deliveryPhone: {'$regex': args.searchWord}},
                        {id: {'$regex': args.searchWord}},
                    ]
                }
                if (args.fromDate) {
                    if (args.status === 'ასაღები') {
                        if (!query.takeDate) query.takeDate = {}
                        query.takeDate['$gte'] = args.fromDate;
                    } else {
                        if (!query.deliveryDate) query.deliveryDate = {}
                        query.deliveryDate['$gte'] = args.fromDate;
                    }
                }
                if (args.toDate) {
                    if (args.status === 'ასაღები') {
                        if (!query.takeDate) query.takeDate = {}
                        query.takeDate['$lte'] = args.toDate;
                    } else {
                        if (!query.deliveryDate) query.deliveryDate = {}
                        query.deliveryDate['$lte'] = args.toDate;
                    }
                }
                if (args.from) {
                    if (!query.price) query.price = {}
                    query.price['$gte'] = args.from;
                }
                if (args.to) {
                    if (!query.price) query.price = {}
                    query.price['$lte'] = args.to;
                }

                if (args.status) {
                    if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'delivery') {
                        if (args.status === 'ასაღები' || args.status === 'აღებული') {
                            if (args.status === 'აღებული') {
                                query['$or'] = [
                                    {status: 'აღებული'},
                                    {status: 'ჩაბარებული'}]
                            } else query.status = args.status;
                            query.takeCourier = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                        } else {
                            query.status = args.status;
                            query.deliveryCourier = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                        }
                    } else query.status = args.status;
                }
                if (args.status === 'ჩასაბარებელი') {
                    let data = await res.aggregate([
                        {$match: {...query, status: 'აღებული'}},
                        {
                            $project: {
                                status: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: [
                                                        "$deliveryCourier",
                                                        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email,
                                                    ],
                                                    $eq: [
                                                        'admin',
                                                        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status,
                                                    ]
                                                },
                                                then: "ჩასაბარებელი"
                                            }
                                        ],
                                        "default": "ჩასაბარებელი"
                                    }
                                },
                                id: 1,
                                deliveryDate: 1,
                                deliveryAddress: 1,
                                deliveryCourier: 1,
                                description: 1,
                                deliveryPhone: 1,
                                canceled: 1,
                                clientName: 1,
                                payed: 1,
                            }
                        },
                        {$sort: {deliveryDate: 1,deliveryAddress: 1}}
                    ]).toArray()
                    db.close();
                    return data;
                }
                const sortQuery = {}
                if (args.status === 'ასაღები') {
                    sortQuery.takeAddress = 1;
                } else {
                    sortQuery['_id'] = -1;
                    sortQuery.deliveryAddress = 1;
                }
                const data = await res.find(query).sort(sortQuery).skip(args.skip || 0).limit(args.limit || 20)
                    .toArray()
                    db.close();
                    return data;

            }
        )
    }
}


const handleAccept = {
    type: GraphQLBoolean,
    description: 'accept Data Item',
    args: {
        id: {type: GraphQLString},
        accepted: {type: GraphQLBoolean},
        status: {type: GraphQLString},
    },
    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'delivery') {
            const updated = {accepted: args.accepted};
            if (!args.accepted) {
                if (args.status === 'ასაღები') {
                    updated.takeCourier = '';
                } else {
                    updated.deliveryCourier = '';
                }
                sendNotificationToAdmin('!!! კურიერმა გააუქმა შეკვეთა',
                    `კურიერმა - ${jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).name} გააუქმა შეკვეთა N:${args.id}`);
            }

            return  pageData().then(({res, db}) => res.updateOne({id: args.id}, {$set: updated},{safe: true}).then(() => {
                db.close();
                return true
            }));
        }
        return false
    }
}

const cancelOrder = {
    type: GraphQLBoolean,
    description: 'removes Data Item',
    args: {
        id: {type: GraphQLString},
        client: {type: GraphQLString},
        price: {type: GraphQLFloat},
        status: {type: GraphQLString},
    },
    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        const query = {id: args.id}
        const data = {}
        data.canceled = true

        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'delivery') {

            if (args.status === 'ასაღები') {
                query.takeCourier = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                data.takeCourier = '';
            } else {
                query.deliveryCourier = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                data.deliveryCourier = '';
            }
            data.accepted = false;

            sendNotificationToAdmin('!!! კურიერმა გააუქმა შეკვეთა',
                `კურიერმა - ${jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).name} გააუქმა შეკვეთა N:${args.id}`);
            return pageData().then(({res,db}) => res.updateOne(query, {$set: data},{safe:true}).then(() => {
                db.close();
                return true
            }));
        }
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'admin') {
            return pageData().then(async ({res,db}) => {
                await res.deleteOne(query,{safe: true}).then(() => {
                    sendNotificationToClient(args.client,
                        `შეკვეთა გაუქმდა!`,
                            `თქვენი შეკვეთა N: ${args.id} გაუქმებულია დამატებითი ინფორმაციისთვის მოგვმართეთ.`
                        );
                    db.close();
                    handlePay(args, 'plus')
                    return true
                }).catch(() => {
                    return false
                })
            });
        }


        return false;
    }
}

const addData = {
    type: GraphQLBoolean,
    args: {
        client: {type: GraphQLString},
        clientName: {type: GraphQLString},
        takeAddress: {type: GraphQLNonNull(GraphQLString)},
        deliveryAddress: {type: GraphQLNonNull(GraphQLString)},
        service: {type: GraphQLNonNull(GraphQLString)},
        status: {type: GraphQLString},
        takeDate: {type: GraphQLNonNull(GraphQLString)},
        deliveryDate: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLString},
        takeCourier: {type: GraphQLString},
        deliveryCourier: {type: GraphQLString},
        phone: {type: GraphQLString},
        deliveryPhone: {type: GraphQLString},
        id: {type: GraphQLString},
        price: {type: GraphQLFloat},
        courierChanged: {type: GraphQLString},
        payed: {type: GraphQLBoolean},
        oldPayed: {type: GraphQLBoolean},
    },
    resolve: (parent, args, response) => {
        const token = response.headers.token;
        let data = args;
        return pageData().then(({res,db}) => {
            let id = '';
            return res.find().toArray().then(async (arr) => {
                if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'admin' && args.id) {
                    if (args.courierChanged) {
                        data.accepted = false;
                        sendNotificationToCourier(args[args.courierChanged],
                                `ახალი შეკვეთა`,
                            `თქვენს სახელზე დაემატა ახალი შეკვეთა.`
                            );
                    }
                    if (args.status === 'აღებული' || args.status === 'ჩაბარებული') {
                        handleBudget(args);
                    }
                    if (args.payed && !args.oldPayed) {
                        await handlePay(args, 'plus');
                        data.payDate = getNewDate();
                    } else if (!args.payed && args.oldPayed) {
                        await handlePay(args, 'minus');
                    }
                    // res.findOne({email: jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email}).then((r) => console.log(r))
                    return res.updateOne({id: args.id}, {$set: data}, {safe: true}).then(() => {
                        db.close();
                        return true;
                    });
                }
                if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'delivery' && args.id) {
                    data = {status: args.status};
                    if (args.deliveryCourier || args.takeCourier) {
                        if (args.courierChanged) {
                            data.accepted = false;
                            data[args.courierChanged] = args[args.courierChanged];
                        }
                    }

                    if (args.status === 'აღებული' || args.status === 'ჩაბარებული') {
                        sendNotificationToClient(args.client,
                            `შეკვეთა ჩაბარებულია!`,
                            `თქვენი შეკვეთა N: ${args.id} ჩაბარებულია, მადლობა ნდობისთვის .`
                        );
                        handleBudget(args);
                    }
                    return res.updateOne({id: args.id}, {$set: data},{safe: true}).then(() => {
                        db.close();
                        return true;
                    });
                }
                if (args.id) {
                    db.close();
                    return false;
                }
                if(args.service ==='ექსპრესი') {
                    db.close();
                    const dt = new Date();
                    if(dt.getHours() < 13) return false;
                }
                data.registerDate = getNewDate();
                id = Math.random().toString(10).substring(12);
                data.id = id;
                data.status = 'განხილვაშია';
                const user = await userData().then(async ({res,db}) => {
                    const user = await res.findOne({
                            _id: ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)
                        },
                        {
                            projection: {_id: 0, rates: 1}
                        });
                    db.close();
                    return user;
                })
                data.price = getRate(args.service, user.rates);
                if (!args.client) {
                    data.client = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                    data.clientName = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).name;
                }
                return res.insertOne(data, {safe: true}).then(() => {
                    sendNotificationToAdmin(`ახალი ${args.service} შეკვეთა`,
                        `კლიენტმა - ${data.clientName} დაამატა ${args.service} შეკვეთა`);
                    handlePay(data, 'minus')
                    db.close();
                    return true;
                }).catch(() => {
                    db.close();
                    return false;
                });
            });
        })
    }
}

const handleBudget = async (args) => {
    const rate = args.status === 'აღებული' ? 'takeRate' : 'delivery';
    const courierType = args.status === 'აღებული' ? 'takeCourier' : 'deliveryCourier';
    let item = {};
    await pageData().then(async ({res: data,db}) => {
        item = await data.findOne({id: args.id});
        // data.updateOne({id: args.id}, {
        //     $set: {
        //         counted: true,
        //     },
        // },{safe:true}).then(()=> db.close())
    })
    // if (item.counted) return;
    await userData().then(async ({res,db}) => {
        console.log(item[courierType], courierType);
        const user = await res.findOne({email: item[courierType]})
        const budgetList = user.budgetList || [];
        const newRate = user.rates[rate];
        const obj = {date: getNewDate(), budget: newRate, id: args.id, status: args.status};
        budgetList.push(obj);
        res.updateOne({email: item[courierType]},
            {
                $set:
                    {
                        budgetList: budgetList,
                        budget: (parseFloat(user.budget) + parseFloat(newRate)).toFixed(2)
                        // budget: 0,
                    }
            },{safe:true}
        ).then(()=> db.close())
    })
    if (args.status === 'აღებული') {
        await userData().then(async ({res,db}) => {
            const user = await res.findOne({email: item.client})
            res.updateOne({email: item.client}, {
                $set: {
                    budget: (parseFloat(user.budget) - parseFloat(item.price)).toFixed(2)
                }
            },{safe: true}).then(()=> db.close())
        })
    }

}

const handlePay = async (args, type) => {
    await userData().then(async ({res,db}) => {
        const user = await res.findOne({email: args.client})
        let newVal = 0;
        if (type === 'minus') {
            newVal = parseFloat(user.budget) - parseFloat(args.price)
        } else {
            newVal = parseFloat(user.budget) + parseFloat(args.price)
        }
        res.updateOne({email: args.client}, {
            $set: {
                budget: (newVal).toFixed(2)
            }
        },{safe: true}).then(()=> db.close())
    })
}

const getRate = (service, rates) => {
    switch (service) {
        case 'სტანდარტი':
            return rates.normalRate;
        case 'ექსპრესი':
            return rates.expressRate;
    }
}

const getNewDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const day = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate();
    return year + '-' + month + '-' + day;
}



// //
// const openSearch = () => {
//     return pageData().then((res) => {
//         return res.createIndex({
//                 takeAddress: "text",
//                 deliveryAddress: "text",
//                 status: "text",
//                 takeCourier: "text",
//                 deliveryCourier: "text",
//                 takeDate: "text",
//                 deliveryDate: "text",
//                 description: "text",
//                 phone: "text",
//                 deliveryPhone: "text",
//                 price: "text",
//                 id: "text",
//             },
//             {
//                 name: "sioIndex",
//             })
//     })
// }

const getDetails = {
    type: DataType,
    args: {
        id: {type: GraphQLNonNull(GraphQLString)}
    },
    resolve: (parent, args) => {
        return pageData().then(async ({res,db}) => {
            const data = await res.findOne({id: args.id});
            db.close();
            return data;
        })
    }
}

const dayReport = {
    type: GraphQLString,
    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return '';

        const {res,db} = await pageData();
        const query = {registerDate: getNewDate()}
        let length = 0;
        let income = 0;
        await res.find(query).toArray()
            .then((data) => {
                length = data.length;
            })
        const payedQuery = {payDate: getNewDate()}

        await res.find(payedQuery).toArray()
            .then((data) => {
                data.forEach((item) => {
                    income += item.price;
                })
            })
        const str = `დღის განმავლობაში შემოსულია ${length} შეკვეთა, გადახდილია ${income}₾`
        db.close();
        return str;
    }
}

const sendNotificationToAdmin = (title, text) => {
    sendEmail('info@siodelivery.ge', title, title, text);
}

const sendNotificationToCourier = (courier, title, text) => {
    sendEmail(courier, title, title, text);
}
const sendNotificationToClient = (client, title, text) => {
    sendEmail(client, title, title, text);

}


const sendEmail = (receiver, subject, title, text)=> {
    return;
    let transporter = nodemailer.createTransport({
        service: 'zoho',
        auth: {
            user: 'info@siodelivery.ge',
            pass: process.env.EMAIL_TOKEN_SECRET,
        }
    });

    let mailOptions = {
        from: 'info@siodelivery.ge',
        to: receiver,
        subject: subject,
        html: `<div style="padding: 64px;background: rgb(244,244,244);">

<img 
style="height: 64px;
    border-radius: 50%;"
src="https://siodelivery.ge/Z-Frontend/images/logo.png">
<h1>${title}
</h1>
<h2>${text}</h2>
<div style="
    display: flex;
    align-items: center;
    justify-content: center;
"><a href="https://siodelivery.ge/login"
 target="_blank" style="
text-decoration: none;
    background: blue;
    padding: 12px 24px;
    border-radius: 8px;
    margin-top: 36px;
    /* display: flex; */
    color: white;
    font-weight: 600;
     font-size: 20px; 
    ">სისტემაში შესვლა</a></div>
<h3 style="
    font-size: 11px;
    padding-top: 24px;
">P.S. დამატებითი ინფორმაციისათვის დაგვირეკეთ <a href="tel:551004010"> 551 004 010</a>
 <br>
    ან მოგვწერეთ <a href="mailto:info@siodelivery.ge">
                            info@siodelivery.ge</a>
 </h3>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = ({dataList, getForAccept, addData, cancelOrder, getDetails, handleAccept, dayReport,loadExcel});
