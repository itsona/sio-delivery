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
        return pageData().then((res) => {
            const token = response.headers.token;
            const courier = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
            return res.find({
                accepted: false, $or: [
                    {status: 'ასაღები', takeCourier: courier},
                    {status: 'აღებული', deliveryCourier: courier}]
            })
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
                    if (args.status === 'ასაღები') {
                        if(!query.takeDate)query.takeDate = {}
                        query.takeDate['$gte'] = args.fromDate;
                    } else {
                        if(!query.deliveryDate)query.deliveryDate = {}
                        query.deliveryDate['$gte'] = args.fromDate;
                    }
                }
                if (args.toDate) {
                    if (args.status === 'ასაღები') {
                        if(!query.takeDate)query.takeDate = {}
                        query.takeDate['$lte'] = args.toDate;
                    } else {
                        if(!query.deliveryDate)query.deliveryDate = {}
                        query.deliveryDate['$lte'] = args.toDate;
                    }
                }
                if (args.from) {
                    if(!query.price)query.price = {}
                    query.price['$gte'] = args.from;
                }
                if (args.to) {
                    if(!query.price)query.price = {}
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
                                deliveryPhone: 1,
                                canceled: 1,
                                clientName: 1,
                                payed: 1,
                            }
                        }
                    ]).toArray().then(r => {
                        return r;
                    })
                }
                if (args.status === 'ასაღები') {
                    return res.find(query).skip(args.skip || 0).limit(args.limit || 20).toArray().then((e) => {
                        return e
                    })
                } else {
                    return res.find(query).sort({_id: -1}).skip(args.skip || 0).limit(args.limit || 20).toArray().then((e) => {
                        return e
                    })
                }
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
                // sendNotificationToAdmin();
            }

            return pageData().then((res) => res.updateOne({id: args.id}, {$set: updated}).then(() => {
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
        status: {type: GraphQLString},
    },
    resolve: (parent, args, response) => {
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
            return pageData().then((res) => res.updateOne(query, {$set: data}).then(() => {
                sendNotificationToAdmin();
                return true
            }));
        }
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'admin') {
            return pageData().then(async (res) => {
                await res.deleteOne(query).then(() => {
                    sendNotificationToClient(args.client, 'removed');
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
        return pageData().then((res) => {
            let id = '';
            return res.find().toArray().then(async (arr) => {
                if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'admin' && args.id) {
                    if (args.courierChanged) {
                        data.accepted = false;
                        sendNotificationToCourier(args[args.courierChanged]);
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
                        sendNotificationToClient(args.client, 'ჩაბარებული')
                        handleBudget(args);
                    }
                    return res.updateOne({id: args.id}, {$set: data}).then(() => {
                        return true;
                    });
                }
                if (args.id) return false;
                data.registerDate = getNewDate();
                id = Math.random().toString(10).substring(12);
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
                if (!args.client) {
                    data.client = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email;
                    data.clientName = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).name;
                }
                return res.insertOne(data).then(() => {
                    sendNotificationToAdmin(data);
                    handlePay(data, 'minus')
                    return true;
                }).catch(() => false);
            });
        })
    }
}

const handleBudget = async (args) => {
    const rate = args.status === 'აღებული' ? 'takeRate' : 'delivery';
    const courierType = args.status === 'აღებული' ? 'takeCourier' : 'deliveryCourier';
    let item = {};
    await pageData().then(async (data) => {
        item = await data.findOne({id: args.id});
        data.updateOne({id: args.id}, {
            $set: {
                counted: true,
            }
        })
    })
    if (item.counted) return;
    await userData().then(async (res) => {
        const user = await res.findOne({email: item[courierType]})
        const budgetList = user.budgetList || [];
        const newRate = user.rates[rate];
        const obj = {date: getNewDate(), budget: newRate, id: args.id, status: args.status};
        budgetList.push(obj);
        await res.updateOne({email: item[courierType]},
            {
                $set:
                    {
                        budgetList: budgetList,
                        budget: (parseFloat(user.budget) + parseFloat(newRate)).toFixed(2)
                        // budget: 0,
                    }
            }
        )
    })
    if (args.status === 'აღებული') {
        await userData().then(async (res) => {
            const user = await res.findOne({email: item.client})
            await res.updateOne({email: item.client}, {
                $set: {
                    budget: (parseFloat(user.budget) - parseFloat(item.price)).toFixed(2)
                }
            })
        })
    }

}

const handlePay = async (args, type) => {
    await userData().then(async (res) => {
        const user = await res.findOne({email: args.client})
        let newVal = 0;
        if (type === 'minus') {
            newVal = parseFloat(user.budget) - parseFloat(args.price)
        } else {
            newVal = parseFloat(user.budget) + parseFloat(args.price)
        }
        await res.updateOne({email: args.client}, {
            $set: {
                budget: (newVal).toFixed(2)
            }
        })
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
                deliveryPhone: "text",
                price: "text",
                id: "text",
            },
            {
                name: "sioIndex",
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

const dayReport = {
    type: GraphQLString,
    resolve: async (parent, args, response) => {
        const token = response.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return '';

        const res = await pageData();
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
        return str;
    }
}

const sendNotificationToAdmin = () => {
}

const sendNotificationToCourier = (courier) => {
}
const sendNotificationToClient = (client, reason) => {
}

module.exports = ({dataList, getForAccept, addData, cancelOrder, getDetails, handleAccept, dayReport});
