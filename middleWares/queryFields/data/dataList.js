const pageData = require('../../authentication').pageData;
const ObjectId = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken');
require('dotenv').config();
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
        price: {type: GraphQLFloat},
        id: {type: GraphQLString},
        accepted: {type: GraphQLBoolean},
    }),
})

const getForAccept = {
    type: GraphQLList(DataType),
    description: 'List of All data',

    resolve: (parent, args, response) => {
        return pageData().then((res) => {
            const token = response.headers.token;
            const courier = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
            return res.find({accepted: false, $or: [
                    {status : 'ასაღები', takeCourier: courier},
                    {status: 'აღებული', deliveryCourier: courier}]})
                .toArray()
                .then((data) => {
                    return data;
                })
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
        openSearch();
        return pageData().then(async (res) => {
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
                    query['$text'] = {
                        $search: args.searchWord
                    }
                }
                if (args.fromDate) {
                    query.registerDate = {
                        $gte: args.fromDate,
                    }
                }
                if (args.toDate) {
                    query.registerDate = {
                        $lte: args.toDate,
                    }
                }
                if (args.from) {
                    query.price = {
                        $gte: args.from,
                    }
                }
                if (args.to) {
                    query.price = {
                        $lte: args.to,
                    }
                }

                if (args.status) {
                    query.status = args.status;
                    if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'delivery') {
                        if (args.status === 'ასაღები' || args.status === 'აღებული') {
                            query.takeCourier = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                        } else {
                            query.deliveryCourier = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                        }
                    }
                }
                if (args.status === 'ჩასაბარებელი') {
                    return res.aggregate([
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
                                phone: 1,
                            }
                        }
                    ]).toArray().then(r => {
                        return r;
                    })
                }
                return res.find(query).sort({_id: -1}).skip(args.skip || 0).limit(args.limit || 20).toArray().then((e) => {
                    return e
                })
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
    resolve: (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'delivery') {
            const updated = {accepted: args.accepted};
            if (!args.accepted) {
                if (args.status === 'ასაღები') {
                    updated.takeCourier = '';
                } else {
                    updated.deliveryCourier = '';
                }
                console.log('აქ', updated.takeCourier, updated.deliveryCourier)
                // sendNotificationToAdmin();
            }

            return pageData().then((res) => res.updateOne({id: args.id}, {$set: updated}).then(() => {
                return true
            }));
        }
        return false
    }
}

const removeData = {
    type: GraphQLBoolean,
    description: 'removes Data Item',
    args: {
        id: {type: GraphQLString},
    },
    resolve: (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'admin') {
            return pageData().then((res) => res.removeOne({id: args.id}).then(() => {
                return true
            }));
        }
    }
}

const addData = {
    type: GraphQLBoolean,
    args: {
        client: {type: GraphQLString},
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
        id: {type: GraphQLString},
        price: {type: GraphQLFloat},
        courierChanged: {type: GraphQLString},
    },
    resolve: (parent, args, response) => {
        const token = response.headers.token;
        let data = args;
        return pageData().then((res) => {
            let id = '';
            return res.find().toArray().then(async (arr) => {
                if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'admin' && args.id) {
                    if (args.courierChanged) {
                        data.accepted = false;
                        sendNotificationToCourier(args[args.courierChanged]);
                    }
                    if (args.status === 'აღებული' || args.status === 'ჩაბარებული') {
                        handleBudget(args, token);
                    }
                    res.findOne({email: jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email}).then((r) => console.log(r))
                    return res.updateOne({id: args.id}, {$set: data}).then(() => {
                        return true;
                    });
                }
                if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'delivery' && args.id) {
                    data = {status: args.status};
                    if (args.deliveryCourier || args.takeCourier) {
                        if (args.courierChanged) {
                            data.accepted = false;
                            sendNotificationToCourier(args[args.courierChanged]);
                            data[args.courierChanged] = args[args.courierChanged];
                        }
                    }

                    if (args.status === 'აღებული' || args.status === 'ჩაბარებული') {
                        handleBudget(args, token);
                    }
                    return res.updateOne({id: args.id}, {$set: data}).then(() => {
                        return true;
                    });
                }
                if (args.id) return false;
                data.registerDate = getNewDate();
                id = Math.random().toString(36).substring(8) + arr.length;
                data.id = id;
                data.status = 'ასაღები';
                const user = await userData().then(async (res) => {
                    const user = await res.findOne({
                            _id: ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)
                        },
                        {
                            projection: {_id: 0, rates: 1}
                        });
                    return user;
                })
                data.price = getRate(args.service, user.rates);
                data.client = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                data.clientName = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).name;
                return res.insertOne(data).then(() => {
                    sendNotificationToAdmin(data);
                    return true;
                }).catch(() => false);
            });
        })
    }
}

const handleBudget = async (args, token) => {
    const rate = args.status === 'აღებული' ? 'takeRate' : 'delivery';
    const query = {email: jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email}
    await userData().then(async (res) => {
        const user = await res.findOne(query)
        const budgetList = user.budgetList || [];
        const oldList = budgetList.filter((item)=> {
            return item.id === args.id && item.status === args.status;
        })
        if(oldList.length) return;
        await pageData().then(async (data) => {
            const item = await data.findOne({id: args.id});
            const newRate = (item.price - 1) * user.rates[rate] / 2;
            const obj = {date: getNewDate(), budget: newRate, id: args.id, status: args.status};
            budgetList.push(obj);
            await res.updateOne(query, {$set: {budgetList: budgetList, budget: (user.budget + newRate).toFixed(2)}})
        })
    })
}

const getRate = (service, rates) => {
    switch (service) {
        case 'სტანდარტი':
            return rates.normalRate;
        case 'ექსპრესი':
            return rates.expressRate;
        case 'სუპერ ექსპრესი':
            return rates.superExpressRate;
    }
}

const getNewDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const day = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate();
    return year + '-' + month + '-' + day;
}

//
const openSearch = () => {
    return pageData().then((res) => {
        return res.createIndex({
            takeAddress: "text",
            deliveryAddress: "text",
            status: "text",
            takeCourier: "text",
            deliveryCourier: "text",
            takeDate: "text",
            deliveryDate: "text",
            description: "text",
            phone: "text",
            price: "text",
            id: "text",
        })
    })
}

const getDetails = {
    type: DataType,
    args: {
        id: {type: GraphQLNonNull(GraphQLString)}
    },
    resolve: (parent, args) => {
        return pageData().then(async (res) => {
            return res.findOne({id: args.id});
        })
    }
}

const sendNotificationToAdmin = () => {
    console.log('admin')
}

const sendNotificationToCourier = (courier) => {
    console.log(courier)
}

module.exports = ({dataList, getForAccept, addData, removeData, getDetails, handleAccept});