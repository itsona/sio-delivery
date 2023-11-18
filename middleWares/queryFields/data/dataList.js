const pageData = require('../../authentication').pageData;
const ObjectId = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken');
const fs = require('fs')
const path = require('path')
require('dotenv').config();
const nodemailer = require('nodemailer');
const loadFile = require('./createXcel');
const logExcel = require('./logExcel');
const {
    GraphQLList,
    GraphQLFloat,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLNonNull,
    GraphQLInt,
} = require('graphql');
const html_to_pdf = require("html-pdf-node");

const userData = require('../../authentication').userData;
const logData = require('../../authentication').logData;
const paymentsData = require('../../authentication').paymentsData;

const DataType = new GraphQLObjectType({
    name: 'data',
    description: 'returns all data',
    fields: () => ({
        count: {type: GraphQLInt},
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
        cash: {type: GraphQLFloat},
        deliveryPhone: {type: GraphQLString},
        price: {type: GraphQLFloat},
        id: {type: GraphQLString},
        accepted: {type: GraphQLBoolean},
        canceled: {type: GraphQLBoolean},
        cashPayed: {type: GraphQLBoolean},
        cashTransfered: {type: GraphQLBoolean},
        payed: {type: GraphQLBoolean},
    }),
})

const getForAccept = {
    type: GraphQLList(DataType),
    description: 'List of All data',

    resolve: (parent, args, response) => {
        return pageData().then(async ({res, db}) => {
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
        return pageData().then(async ({res, db}) => {
            const token = response.headers.token;
            if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
            const query = {}
            if (args.fromDate) {
                if (!query.registerDate) query.registerDate = {};
                query.registerDate['$gte'] = args.fromDate;
            }
            if (args.toDate) {
                if (!query.registerDate) query.registerDate = {};
                query.registerDate['$lte'] = args.toDate;
            }
            // const data = await res.find(query,
            //     {accepted: 1,courierChanged: 1, oldPayed: 1, payed: 1, counted: 1}
            //     ).toArray()
            const data = await res.aggregate([
                {$match: query},
                {
                    $project: {_id: 0, accepted: 0, courierChanged: 0, oldPayed: 0, counted: 0}
                }]).toArray()

            const filePath = './middleWares/excel-from-js.xlsx';
            try {
                fs.unlinkSync(path.resolve(filePath))
            } catch (e) {
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
        return pageData().then(async ({res, db}) => {
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
                        {clientName: {'$regex': args.searchWord}},
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
                                if (query['$or']) {
                                    // query['$or'].push([{status: 'აღებული'},{status: 'ჩაბარებული'}])
                                    const or = query.$or;
                                    delete query.$or;
                                    query.$and = [
                                        {$or: or},
                                        {$or: [{status: 'აღებული'}, {status: 'ჩაბარებული'}]}
                                    ]
                                } else {
                                    query['$or'] = [
                                        {status: 'აღებული'},
                                        {status: 'ჩაბარებული'}]
                                }
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
                        {$skip: args.skip || 0},
                        {$limit: args.limit || 20},
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
                                takeAddress: 1,
                                deliveryCourier: 1,
                                description: 1,
                                deliveryPhone: 1,
                                canceled: 1,
                                clientName: 1,
                                client: 1,
                                price: 1,
                                payed: 1,
                                cash:1,
                                cashPayed:1,
                                cashTransfer:1,
                            }
                        },
                        {$sort: {deliveryDate: 1, deliveryAddress: 1}}
                    ]).toArray();
                    if (data.length) data[0].count = await res.count({...query, status: 'აღებული'});
                    await db.close();
                    return data;
                }
                const sortQuery = {}
                if (args.status === 'ასაღები') {
                    sortQuery.takeDate = 1;
                    sortQuery.takeAddress = 1;
                } else {
                    sortQuery.deliveryDate = -1;
                    sortQuery.deliveryAddress = 1;
                }

                const data = await res.find(query).sort(sortQuery).skip(args.skip || 0).limit(args.limit || 20)
                    .toArray()
                if (data.length) data[0].count = await res.count(query);
                await db.close();
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
            }

            return pageData().then(({
                                        res,
                                        db
                                    }) => res.updateOne({id: args.id}, {$set: updated}, {safe: true}).then(() => {
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
            return pageData().then(({res, db}) => res.updateOne(query, {$set: data}, {safe: true}).then(() => {
                db.close();
                return true
            }));
        }
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'admin') {
            return pageData().then(async ({res, db}) => {
                const item = await res.findOne({id: args.id});
                await res.updateOne(query, {$set: {status: 'გაუქმებულია'}}, {safe: true}).then(async () => {
                    await handlePay(item, false)
                    sendNotificationToClient(args.client,
                        `შეკვეთა გაუქმდა!`,
                        `თქვენი შეკვეთა N: ${args.id} გაუქმებულია დამატებითი ინფორმაციისთვის მოგვმართეთ.`
                    );
                    await db.close();
                    return true
                }).catch(() => {
                    return false
                })
            });
        }
        return false;
    }
}

const updateData = {
    type: GraphQLBoolean,
    args: {
        takeAddress: {type: GraphQLNonNull(GraphQLString)},
        deliveryAddress: {type: GraphQLNonNull(GraphQLString)},
        takeDate: {type: GraphQLNonNull(GraphQLString)},
        deliveryDate: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLString},
        phone: {type: GraphQLString},
        cash: {type: GraphQLFloat},
        deliveryPhone: {type: GraphQLString},
        id: {type: GraphQLString},
    },
    resolve: (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') {
            return false;
        }
        return pageData().then(async ({res, db}) => {
            await res.updateOne({id: args.id}, {$set: args}, {safe: true});
            await db.close();
            return true;
        })
    }
}

function handlePayWithPayze(params) {
    const paramsForCall = {
        client: params.client,
        price: parseFloat(params.price)
    }

    paymentsData().then(async ({res, db})=> {
        if(jwt.verify(params.token, process.env.ACCESS_TOKEN_SECRET).payed){
            const data = await res.findOne({token: params.token})
                if(data === null){
                    await handlePay(paramsForCall, false, `გადაიხადა ${params.price}₾`)
                    await res.insertOne({token: params.token})
                }else {
                    await res.insertOne({failed: true, params, notNUll: true})
                }
        }
        else {
            await res.insertOne({failed: true, params})
        }
        await db.close()
    })

}

const changePrice = {
    type: GraphQLBoolean,
    args: {
        priceDiff: {type: GraphQLNonNull(GraphQLFloat)},
        id: {type: GraphQLString},
    },
    resolve: (parent, args, response) => {
        const token = response.headers.token;
        return pageData().then(async ({res, db}) => {
            if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') {
                return false;
            }
            const item = await res.findOne({id: args.id});
            const newPrice = parseFloat(item.price) + parseFloat(args.priceDiff);
            if (!item.payed) {
                await handlePay({id: args.id, client: item.client, price: parseFloat(args.priceDiff)})
            }
            await res.updateOne({id: args.id}, {$set: {price: newPrice}}, {safe: true});
            await db.close();
            return true;
        })
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
        takeDate: {type: GraphQLNonNull(GraphQLString)},
        deliveryDate: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLString},
        phone: {type: GraphQLString},
        cash: {type: GraphQLFloat},
        deliveryPhone: {type: GraphQLString},
    },
    resolve: (parent, args, response) => {
        const token = response.headers.token;
        return pageData().then(async ({res, db}) => {
            if (!args.deliveryAddress || !args.takeAddress || !args.service
            ) {
                await db.close();
                return false;
            }
            if (args.service === 'ექსპრესი') {
                const dt = new Date();
                if (dt.getHours() > 9) {
                    await db.close();
                    return false;
                }
            }
            const takeDate = new Date(args.takeDate).getDay();
            const deliveryDate = new Date(args.deliveryDate).getDay();
            const validates = takeDate && deliveryDate;
            if(!validates) {
                await db.close();
                return false;
            }
            const date = new Date();
            date.setMonth(date.getMonth() + 6);
            args.expireAt = date
            args.registerDate = getNewDate();
            const last = (await res.aggregate([{$sort: {_id: -1}}, {$match: {}}]).toArray())[0];
            args.id = parseInt(last.id)+1 + ' '
            args.status = 'განხილვაშია';
            const query = {};
            if (!args.client) {
                query._id = ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)
            } else query.email = args.client;
            const user = await userData().then(async ({res, db}) => {
                const user = await res.findOne(query,
                    {
                        projection: {_id: 0, rates: 1}
                    });
                await db.close();
                return user;
            })
            args.price = getRate(args.service, user.rates);
            if (!args.client) {
                args.client = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                args.clientName = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).name;
            }
            return res.insertOne(args, {safe: true}).then(async () => {
                await handlePay(args)
                await db.close();
                return true;
            }).catch(() => {
                db.close();
                return false;
            });
        })

            .catch((r) => console.log(r))
    }
}


const changePayed = {
    type: GraphQLBoolean,
    args: {
        payed: {type: GraphQLNonNull(GraphQLBoolean)},
        id: {type: GraphQLNonNull(GraphQLString)},
    },

    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;

        const {res, db} = await pageData();
        try {
            const item = await res.findOne({id: args.id})
            await handlePay(item, !args.payed)
            await res.updateOne({id: args.id}, {$set: {payed: args.payed}}, {safe: true});
            await db.close();
            return true;
        } catch (e) {

        }
    }
}
const onDuplicate = {
    type: GraphQLBoolean,
    args: {
        id: {type: GraphQLString},
    },

    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
        const query = {id: args.id}

        return pageData().then(async ({res, db}) => {
            const items = (await res.find({id: args.id}).sort({_id: 1}).toArray()).slice(1)
            if(!items || !items.length) return false
            items.forEach(async (item)=> {
            await res.updateOne(item, {$set: {status: 'გაუქმებულია'}}, {safe: true}).then(async () => {
                await handlePay(item, false)
                await db.close();
                return true
            })
                return true
            }).catch(() => {
                return false
            })
        });
    }
}
const cashPay = {
    type: GraphQLBoolean,
    args: {
        cashPayed: {type: GraphQLNonNull(GraphQLBoolean)},
        id: {type: GraphQLNonNull(GraphQLString)},
    },

    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin' &&
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'delivery') return;

        const {res, db} = await pageData();
        try {
            await res.updateOne({id: args.id}, {$set: {cashPayed: args.cashPayed}}, {safe: true});
            await db.close();
            return true;
        } catch (e) {

        }
    }
}
const cashTransfer = {
    type: GraphQLBoolean,
    args: {
        cashTransfered: {type: GraphQLNonNull(GraphQLBoolean)},
        id: {type: GraphQLNonNull(GraphQLString)},
    },

    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin' &&
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'delivery') return;

        const {res, db} = await pageData();
        try {
            await res.updateOne({id: args.id}, {$set: {cashTransfered: args.cashTransfered}}, {safe: true});
            await db.close();
            return true;
        } catch (e) {

        }
    }
}

const changeStatus = {
    type: GraphQLBoolean,
    args: {
        status: {type: GraphQLNonNull(GraphQLString)},
        id: {type: GraphQLNonNull(GraphQLString)},
    },

    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'client') return;
        const {res, db} = await pageData();
        try {
            const item = await res.findOne({id: args.id})
            if (args.status === 'გაუქმებულია') {
                await handlePay(item, false)
            } else if (args.status === 'ასაღები' && item.status === 'გაუქმებულია') {
                await handlePay(item)
            } else {
                await handleBudget(args.status, item)
            }
            await res.updateOne({id: args.id}, {$set: {status: args.status}}, {safe: true});
            await db.close();
            return true;
        } catch (e) {
            return false;
        }
    }
}
const changeCourier = {
    type: GraphQLBoolean,
    args: {
        courier: {type: GraphQLNonNull(GraphQLString)},
        id: {type: GraphQLNonNull(GraphQLString)},
    },
    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
        const {res, db} = await pageData();
        try {
            const item = await res.findOne({id: args.id})
            let courierType;
            switch (item.status) {
                case 'ასაღები':
                case 'განხილვაშია':
                    courierType = 'takeCourier';
                    break;
                case 'აღებული':
                case 'ჩასაბარებელი':
                case 'ჩაბარებული':
                    courierType = 'deliveryCourier';
                    break;
            }
            const updateObject = {};
            updateObject[courierType] = args.courier;
            updateObject.accepted = false;
            await res.updateOne({id: args.id}, {$set: updateObject}, {safe: true});
            await db.close();
            return true;
        } catch (e) {
            return false;
        }
    }
}

const handleBudget = async (status, item,) => {
    let minus = false;
    if (status === 'ასაღები') {
        if (item.status !== 'აღებული' && item.status !== 'ჩასაბარებელი') return;
        minus = true;
    }
    if (status === 'აღებული' && item.status === 'ჩაბარებული') minus = true;
    let rate = status === 'აღებული' ? 'takeRate' : 'delivery';
    if (minus) rate = status === 'აღებული' ? 'delivery' : 'takeRate';
    let courierType = status === 'აღებული' ? 'takeCourier' : 'deliveryCourier';
    if (minus) courierType = status === 'აღებული' ? 'deliveryCourier' : 'takeCourier';
    let newRate = 0;
    await userData().then(async ({res, db}) => {
        const user = await res.findOne({email: item[courierType]})
        if (!user) {
            await db.close();
            return;
        }
        const budgetList = user.budgetList || [];
        newRate = user.rates[rate];
        if (minus) newRate = newRate * -1;
        const obj = {date: getNewDate(), budget: newRate, id: item.id, status: status};
        budgetList.push(obj);
        let newBudget = (parseFloat(user.budget) + parseFloat(newRate));
        await res.updateOne({email: item[courierType]},
            {
                $set:
                    {
                        budgetList: budgetList,
                        budget: newBudget,
                    }
            }, {safe: true}
        )
        await db.close();
    })
}

const handlePay = async (args, minus = true,changer = "") => {
    let newVal = 0;
    let user = {}
    await userData().then(async ({res, db}) => {
        user = await res.findOne({email: args.client})
        if (minus) {
            newVal = parseFloat(user.budget || 0) - parseFloat(args.price)
        } else {
            newVal = parseFloat(user.budget || 0) + parseFloat(args.price)
        }
        await res.updateOne({email: args.client}, {
            $set: {
                budget: (newVal),
            }
        }, {safe: true})
        await db.close()
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

const getOldDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() -5);
    const year = date.getFullYear();
    const month = date.getMonth() < 10 ? '0' + (date.getMonth()) : (date.getMonth());
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
        return pageData().then(async ({res, db}) => {
            const data = await res.findOne({id: args.id});
            await db.close();
            return data;
        })
    }
}

const CountsType = new GraphQLObjectType({
    name: 'counts',
    description: 'countsWithCouriers',
    fields: () => ({
        take: {type: GraphQLInt},
        delivering: {type: GraphQLInt},
    }),
})

const getDataCounts = {
    type: CountsType,
    args: {
        courier: {type: GraphQLNonNull(GraphQLString)}
    },
    resolve: (parent, args) => {
        return pageData().then(async ({res, db}) => {
            const take = await res.find({takeCourier: args.courier, status: 'ასაღები'}).toArray();
            const delivering = await res.find({deliveryCourier: args.courier, status: 'აღებული'}).toArray()
            await db.close();
            return {take: take.length, delivering: delivering.length};
        })
    }
}

const dayReport = {
    type: GraphQLString,
    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return '';
        const {res, db} = await pageData();
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
        const str = `დღის განმავლობაში შემოსულია ${length} შეკვეთა`
        await db.close();
        return str;
    }
}


const sendNotificationToClient = (client, title, text) => {
    sendEmail(client, title, title, text);
}

let documentGenerating = false;
const sendDocument = {
    type: GraphQLString,
    args: {
        email: {type: GraphQLNonNull(GraphQLString)},
        receiver: {type: GraphQLNonNull(GraphQLString)},
        name: {type: GraphQLNonNull(GraphQLString)},
        endDate: {type: GraphQLNonNull(GraphQLString)},
        startDate: {type: GraphQLNonNull(GraphQLString)},
        sendEmail: {type: GraphQLBoolean}
    },
    resolve: (parent, args) => {
        try {
            if (documentGenerating) return '';
            documentGenerating = true
            return pageData().then(async ({res, db}) => {
                const data = await res.find({
                    client: args.email,
                    registerDate: {$gte: args.startDate, $lte: args.endDate}
                }).toArray();
                db.close();
                let express = 0;
                let normal = 0;
                data.forEach((item) => {
                    if (item.service === 'სტანდარტი') normal += item.price
                    if (item.service === 'ექსპრესი') express += item.price
                })
                var html_to_pdf = require('html-pdf-node');

                let options = {format: 'A4'};

                const content = `
                    <div style="padding: 64px">

<span style="display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid">
    თბილისი
    <span>${args.endDate} </span>
</span>
<h2 style="text-align: center; font-weight: normal">მიღება ჩაბარება </h2>
<h4 style="font-weight: normal; font-size: 18px">
    ერთის მხრივ, ${args.name}, შემდეგში: „დამკვეთი“,
</h4>
    <h4 style="font-weight: normal">და</h4>
    <h4  style="font-weight: normal; font-size: 18px; text-align: right">
        მეორეს მხრივ, შპს სიო დელივერი ს/კ 402174927 
        ტელ. 577058610, ელ. ფოსტა info@siodelivery.ge,
        წარმოდგენილი მისი დირექტორის ნუგზარი სხულუხიას მიერ,
        შემდეგში: „შემსრულებელი“.
    </h4>
    <h4  style="font-weight: normal; font-size: 18px;">
        ვადგენთ მიღება ჩაბარების აქტს მასზედ,
        რომ ${args.startDate} - დან ${args.endDate} - ჩათვლით
         მომსახურების ღირებულება განისაზღვრა ${express + normal}  ლარით
        (ექსპრეს შეკვეთების საერთო ღირებულება: ${express} ლარი,
         სტანდარტული შეკვეთების საერთო ღირებულება: ${normal} ლარი).
    </h4>


<h4  style="font-weight: normal; font-size: 18px">
    აქტი სწორია და ვადასტურებთ ხელმოწერით.
</h4>

<div style="display: flex; padding: 24px 84px; justify-content: space-between; text-align: center">
    <div style="display: flex; flex-direction: column; grid-gap: 12px; border-bottom: 0.5px solid #bf7b73; padding-bottom: 48px">
        <span>(1) დამკვეთი</span>
        <span>${args.name}</span>
    </div>
    <div style="display: grid;grid-gap: 20px;">
        <span>(2) შემსრულებელი</span>
        <span>შპს სიო დელივერი</span>
        <span>ს/კ 402174927</span>
        <span style="font-weight: bold">ანგარიშები:</span>
        <span>GE22TB7967436070100001</span>
        <span>GE94BG0000000498414897</span>
        <span>ნუგზარი სხულუხია</span>
        <img src="https://siodelivery.ge/Z-Frontend/images/signature.PNG" width="150" height="50" style="margin-bottom: -4px">
    </div>
</div>


</div>`;
                let file = {content, name: 'deliveryAccept.pdf'};
                const pdf = await html_to_pdf.generatePdf(file, options)
                await fs.appendFileSync('./middleWares/document.pdf', Buffer.from(pdf));

                if (args.sendEmail) {
                    sendEmail(
                        args.receiver,
                        'შემაჯამებელი დოკუმენტი',
                        'მიღება ჩაბარების დოკუმენტი',
                        'შემაჯამებელი დოკუმენტი  ' + args.startDate + ' : ' + args.endDate,
                        'https://siodelivery.ge/login',
                        [
                            {
                                filename: 'deliveryAccept.pdf',
                                content: pdf,
                            }
                        ]);
                }
                documentGenerating = false;
                return JSON.stringify(pdf)
            })
        } catch (e) {
            console.log(e)
        }
    }
}

const sendEmail = async (receiver, subject, title, text, href = 'https://siodelivery.ge/login', attachments= []) => {
    if(!receiver || !subject || !title|| !text) return;
    try {
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
            attachments,
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
"><a href="${href}"
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
    }catch(e){
        console.log(e)
    }
}

const logType = new GraphQLObjectType({
    name: 'log',
    description: 'User from UsersList',
    fields: () => ({
        oldBudget: {type: GraphQLString},
        courier: {type: GraphQLString},
        name: {type: GraphQLString},
        change: {type: GraphQLString},
        newBudget: {type: GraphQLString},
        date: {type: GraphQLString},
        changer: {type: GraphQLString},
        payDate: {type: GraphQLString},
    })
})
const getLog = {
    type: GraphQLList(logType),
    args: {
        client: {type: GraphQLString},
    },
    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        const query = {};
        if (args.client) {
            query.courier = args.client;
        }
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return false;
        return logData().then(async ({res, db}) => {
            const data = await res.find(query).sort({date: -1}).toArray();
            await db.close();
            return data;
        })
    }
}

const logExcelLoad = {
    type: GraphQLList(GraphQLBoolean),
    args: {
        client: {type: GraphQLString},
        fromDate: {type: GraphQLString},
        toDate: {type: GraphQLString},
    },
    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        const query = {};
        if (args.fromDate) {
            query.date['$gte'] = args.fromDate;
        }
        if (args.toDate) {
            query.date['$lte'] = args.toDate;
        }
        if (args.client) {
            query.courier = args.client;
        }
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return [false];
        return logData().then(async ({res, db}) => {
            const data = await res.find(query).sort({date: -1}).toArray();
            await db.close();
            const filePath = './middleWares/log-excel.xlsx';
            try {
                fs.unlinkSync(path.resolve(filePath))
            } catch (e) {
                console.log(e)
            }
            await logExcel(data)
            return [true];
        })
    }
}
module.exports = ({
    dataList,
    getForAccept,
    addData,
    cancelOrder,
    getDetails,
    handleAccept,
    sendDocument,
    dayReport,
    loadExcel,
    logExcelLoad,
    getLog,
    changeStatus,
    updateData,
    changePrice,
    changePayed,
    onDuplicate,
    cashPay,
    cashTransfer,
    changeCourier,
    getDataCounts,
    handlePayWithPayze,
    sendEmail
});
