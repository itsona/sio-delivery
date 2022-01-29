const Config = require("../../constants");
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config();
const https = require('https')
const {
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean,
} = require('graphql');
const {stringify} = require("nodemon/lib/utils");
const axios = require("axios");
// const axios = require("axios");

const userData = require('../../authentication').userData;
const logData = require('../../authentication').logData;
const pageData = require('../../authentication').pageData;
const emailData = require('../../authentication').emailData;
const sendEmail = require('../data/dataList').sendEmail;
const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'User from UsersList',
    fields: () => ({
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        password: {type: GraphQLString},
        budget: {type: GraphQLFloat},
        address: {type: GraphQLString},
        phone: {type: GraphQLString},
        rates: {type: SystemRate},
        status: {type: GraphQLString},
        takeRate: {type: SystemRate},
        _id: {type: GraphQLNonNull(GraphQLString)},
    })
})
const UserDetails = new GraphQLObjectType({
    name: 'UserDetails',
    description: 'User from UsersList',
    fields: () => ({
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        budget: {type: GraphQLFloat},
        rates: {type: SystemRate},
        status: {type: GraphQLString},
        address: {type: GraphQLString},
    })
})
const SystemRate = new GraphQLObjectType({
    name: 'rate',
    description: 'rate for delivery',
    fields: () => ({
        takeRate: {type: GraphQLFloat},
        delivery: {type: GraphQLFloat},
        normalRate: {type: GraphQLFloat},
        expressRate: {type: GraphQLFloat},
    })
})
const usersList = {
    type: GraphQLList(UserType),
    description: 'List of All users',
    resolve: async (parent, args, request) => {
        return userData().then(async ({res, db}) => {
            const data = await res.find({}).toArray();
            db.close();
            return data;
        })
        // return [];
    }
}

const usersDetails = {
    type: GraphQLList(UserDetails),
    description: 'List of All users',
    args: {
        status: {type: GraphQLString},
    },
    resolve: async (parent, args, request) => {
        const query = {};
        if (args.status) query.status = args.status;
        return userData().then(async ({res, db}) => {
            const data = await res.find(query).toArray();
            await db.close();
            return data;
        })
    }
}
const setCourier = {
    type: GraphQLBoolean,
    description: 'List of All users',
    args: {
        courier: {type: GraphQLBoolean},
        client: {type: GraphQLString},
    },
    resolve: async (parent, args, request) => {
        const token = request.headers.token;
        const query = {
            email: args.client,
        }
        const status = args.courier ? 'delivery' : 'client';
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
        return userData().then(async ({res, db}) => {
            await res.updateOne(query, {$set: {status: status}}, {safe: true});
            await db.close()
            return true;
        })
        return false
    }
}

const setBudget = {
    type: GraphQLBoolean,
    description: 'List of All users',
    args: {
        budget: {type: GraphQLFloat},
        client: {type: GraphQLString},
        date: {type: GraphQLString},
        time: {type: GraphQLString},
    },
    resolve: async (parent, args, request) => {
        const token = request.headers.token;
        const query = {
            email: args.client,
        }
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
        return userData().then(async ({res, db}) => {
            const budget = await res.findOne(query, {projection: {_id: 0, budget: 1, status: 1, name: 1}}) || {}
            if (!budget || !budget.budget) budget.budget = 0;
            if (!args.budget) args.budget = 0;
            const newBudget = parseFloat(budget.budget) + parseFloat(args.budget)
            await res.updateOne(query,
                {$set: {budget: newBudget}},
                {safe: true});
            await db.close()
            let dateString = new Date().toLocaleString('en-US',{ timeZone: 'Asia/Tbilisi' });
            if(args.date || args.time) dateString = new Date(args.date + ' '+ args.time).toLocaleString();
            logData().then(async ({res, db}) => {
                const b = await res.insertOne({
                    name: budget.name,
                    courier: args.client,
                    oldBudget: budget.budget,
                    change: args.budget,
                    newBudget,
                    date: new Date(),
                    payDate: dateString,
                    changer: jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).name,
                }, {safe: true})
                await db.close();
            })
            return true;
        })
        return false
    }
}

const setRates = {
    type: GraphQLBoolean,
    description: 'List of All users',
    args: {
        delivery: {type: GraphQLString},
        takeRate: {type: GraphQLString},
        normalRate: {type: GraphQLString},
        expressRate: {type: GraphQLString},
        client: {type: GraphQLString},
    },
    resolve: async (parent, args, request) => {
        const token = request.headers.token;
        const query = {
            email: args.client,
        }
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
        return userData().then(async ({res, db}) => {
            const user = await res.findOne(query, {projection: {_id: 0, rates: 1}})
            const rates = user.rates;
            delete args.client;
            await res.updateOne(query, {$set: {rates: {...rates, ...args}}}, {safe: true});
            db.close();
            return true;
        })
        return false
    }
}
const setRatesForAll = {
    type: GraphQLBoolean,
    description: 'set rates for All',
    args: {
        express: {type: GraphQLFloat},
        standard: {type: GraphQLFloat},
    },
    resolve: async (parent, args, request) => {
        const token = request.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
        const rates = Config.rates;
        if(args.express) rates.expressRate = args.express;
        if(args.standard) rates.normalRate = args.standard;
        return userData().then(async ({res, db}) => {
            await res.updateMany({status: 'client'}, {$set: {rates}}, {safe: true});
            await db.close();
            return true;
        })
        return false

    }
}
const payWithPayze = {
    type: GraphQLString,
    description: 'set rates for All',
    args: {
        amount: {type: GraphQLFloat},
    },
    resolve: async (parent, args, request) => {
        const token = request.headers.token;
        const response = await callPayWithPayze(token, args.amount)
        return response

    }
}
function callPayWithPayze(token,price){
    const client = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email
    return axios.post('https://payze.io/api/v1', {
            method: 'justPay',
            apiKey: 'E2A930873E4E48B2B8319D7E8A75BB98',
            apiSecret: '32AE2A765A4341E7AEB726D6E0BA8A23',
            data: {
                amount: stringify(price),
                currency: 'GEL',
                callback: `https://siodelivery.ge/payments/paymentSuccess/${client}/${price}`,
                callbackError: `https://siodelivery.ge/payments/paymentError/`,
                info: {
                        name: 'test',
                        description: 'test',
                    },
            }
        },)
        .then(r=> r.data.response.transactionUrl)
        .catch((error)=> {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            console.log(error.config);
        })
}



//KEY:
// E2A930873E4E48B2B8319D7E8A75BB98
// SECRET:
// 32AE2A765A4341E7AEB726D6E0BA8A23
// Requests:
// 38
// Demo
// KEY:
// CD315531936E4FDAA0551E48EB047944
// SECRET:
// E16389030297450799A14D434EDA2AD1
// Requests:
// 61


const singleUser = {
    type: GraphQLString,
    description: 'A Single user',
    args: {
        email: {type: GraphQLString},
        password: {type: GraphQLString}
    },
    resolve: (parent, args, request) => {
        return userData().then(async ({res, db}) => {
            args.email = args.email.toLowerCase();

            async function getUser() {
                let user = await res.findOne({email: args.email, password: args.password});
                db.close();
                if (user != null) {
                    return jwt.sign({
                        id: user._id,
                        status: user.status || 'client',
                        email: user.email,
                        name: user.name,
                    }, process.env.ACCESS_TOKEN_SECRET);
                }
                return '';
            }

            return getUser();
        })
    }
}

const userInfo = {
    type: UserType,
    description: 'A Single user info',
    args: {
        email: {type: GraphQLString}
    },
    resolve: (parent, args, request) => {
        const query = {};
        const token = request.headers.token;
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin' || !args.email) {
            query['_id'] = ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)
        } else if (args.email) {
            query.email = args.email;
        }
        return userData().then(({res, db}) => {
            async function getUser() {
                let user = await res.findOne(query);
                db.close();
                if (user != null) {
                    return user;
                }
                return {};
            }

            return getUser();
        })
    }
}

const loadBudget = {
    type: GraphQLFloat,
    description: 'A budget of user',
    args: {
        fromDate: {type: GraphQLString},
        toDate: {type: GraphQLString},
    },
    resolve: (parent, args, request) => {
        const token = request.headers.token;
        return userData().then(({res, db}) => {
            async function getUser() {
                let user = await res.findOne({_id: ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)});
                db.close();
                if (user != null) {
                    if (args.fromDate || args.toDate) {
                        const budgetList = user.budgetList.filter((item) => {
                            if (args.fromDate && args.toDate) {
                                return item.date <= args.toDate && item.date >= args.fromDate;
                            } else if (args.fromDate) {
                                return item.date >= args.fromDate;
                            } else {
                                return item.date <= args.toDate
                            }
                        })
                        let sum = 0;
                        budgetList.forEach((item) => sum += item.budget)
                        return sum.toFixed(2)
                    }
                    const budget = user.budget || 0;
                    return budget;
                }
                return 0;
            }

            return getUser();
        })
    }
}


const resetPassword = {
    type: GraphQLString,
    args: {
        email: {type: GraphQLNonNull(GraphQLString)}
    },
    resolve: (parent, args) => {
        return emailData().then(({res, db}) => {
            return res.countDocuments({email: args.email}).then(contains => {

                db.close();
                if (contains) {
                    const tok = jwt.sign({email: args.email}, process.env.ACCESS_TOKEN_SECRET);
                    const href = 'https://siodelivery.ge/reset?' + tok
                    sendEmail(
                        args.email,
                        'პაროლის აღდგენა',
                        'პაროლის აღდგენა',
                        'პაროლის აღსადგენად დააჭირეთ სისტემაში შესვლას',
                        href);
                    return 'success'
                } else {
                    return 'no-email';
                }
            })
        })

    }
}

const recoveryPassword = {
    type: GraphQLString,
    description: 'exchange password',
    args: {
        password: {type: GraphQLNonNull(GraphQLString)},
        token: {type: GraphQLNonNull(GraphQLString)}
    },
    resolve: (parent, args, request) => {
        return userData().then(({res, db}) => {
            async function getUser() {
                let user = await res.updateOne({email: jwt.verify(args.token, process.env.ACCESS_TOKEN_SECRET).email},
                    {$set: {password: args.password}},
                    {safe: true});
                db.close();
                if (user != null) {
                    return 'success';
                }
                return 'failed';
            }

            return getUser();
        })
    }
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const addUser = {
    type: GraphQLString,
    args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        password: {type: GraphQLNonNull(GraphQLString)},
        passwordRepeat: {type: GraphQLNonNull(GraphQLString)},
    },
    resolve: (parent, args) => {
        if (args.password !== args.passwordRepeat) return 'notMatch'
        if (!validateEmail(args.email)) return 'noValidation';
        args.email = args.email.toLowerCase();
        let user = args;
        delete user.passwordRepeat;
        user.rates = Config.rates;
        user.budget = 0;
        return emailData().then(({res, db}) => {
            return res.countDocuments({email: args.email}).then(async contains => {
                if (!contains) {
                    await res.insertOne({email: args.email}, {safe: true}).then(() => db.close());
                    return userData().then(async ({res, db}) => {
                        await res.insertOne(user, {safe: true})
                        await db.close();
                        return 'success';
                    });
                } else return 'contains';
            })
        })
    }
}

const FbLogin = {
    type: GraphQLString,
    args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        id: {type: GraphQLNonNull(GraphQLString)},
        token: {type: GraphQLNonNull(GraphQLString)},
        channel: {type: GraphQLNonNull(GraphQLString)},
    },
    resolve: async (parent, args) => {
        args.email = args.email.toLowerCase();
        let url;
        if (args.channel === 'google') {
            url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${args.token}`
        } else if (args.channel === 'facebook') {
            url = `https://graph.facebook.com/${args.id}/accounts?access_token=${args.token}`
        }
        const callback = (req) => {

            if (req.statusCode !== 200) {
                return '';
            }
            let user = args;
            user.rates = Config.rates;
            user.budget = 0;

            async function getUser(res, db) {
                let user = await res.findOne({email: args.email});
                db.close();
                if (user != null) {
                    return jwt.sign({
                        id: user._id,
                        status: user.status,
                        email: user.email,
                        name: user.name,
                    }, process.env.ACCESS_TOKEN_SECRET);
                }
                return '';
            }

            return emailData().then(({res, db}) => {
                return res.countDocuments({email: args.email}).then(contains => {
                    if (!contains) {
                        res.insertOne({email: args.email}, {safe: true}).then(() => db.close());
                        return userData().then(({res, db}) => {
                            res.insertOne(user, {safe: true})
                            return getUser(res, db);
                        });
                    }
                    return userData().then(({res, db}) => {
                        return getUser(res, db);
                    });
                })
            })
        }
        const pr = new Promise(async (resolve) => {
            const req = await https.get(url,
                async (req) => {
                    const back = await callback(req);
                    resolve(back)
                })
        })
        const raime = await pr;
        return raime;
    }
}

const checkToken = async (channel, token) => {
    let ret = false;
    if (channel === 'google') {
        const req = await https.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`, (req) => {
        })
        // req.then(r=> console.log(r))
    }
    return ret;
}

const modifyUser = {
    type: GraphQLString,
    args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        oldEmail: {type: GraphQLString},
        password: {type: GraphQLString},
        newPassword: {type: GraphQLString},
        budget: {type: GraphQLFloat},
        takeRate: {type: GraphQLFloat},
        delivery: {type: GraphQLFloat},
        normalRate: {type: GraphQLFloat},
        expressRate: {type: GraphQLFloat},
        address: {type: GraphQLString},
        phone: {type: GraphQLString},
        status: {type: GraphQLString},
    },
    resolve: (parent, args, request) => {
        if (!args.email || !args.name || !args.address || !args.phone) return 'nonNUll'
        const token = request.headers.token;
        return userData().then(({res, db}) => {
            async function updateUser() {
                if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'admin') {
                    args.rates = {
                        takeRate: args.takeRate,
                        delivery: args.delivery,
                        normalRate: args.normalRate,
                        expressRate: args.expressRate,
                    }
                    delete args.takeRate;
                    delete args.delivery;
                    delete args.normalRate;
                    delete args.expressRate;
                    await res.updateOne({email: args.email}, {$set: args}, {safe: true})
                    db.close();
                    return 'success';
                }
                const user = await res.findOne({_id: ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)});
                if (args.password && args.newPassword) {
                    if (user.password !== args.password) {
                        db.close();
                        return 'incorrect';
                    }
                    args.password = args.newPassword;
                    delete args.newPassword;
                }
                let emailExists = false;
                if (args.email !== args.oldEmail) {
                    await emailData().then(async ({res, db}) => {
                        await res.countDocuments({email: args.email}).then(async contains => {
                            if (!contains) {
                                handleEmailChange(args.email, args.oldEmail)
                                await res.insertOne({email: args.email}, {safe: true})
                                await res.deleteOne({email: args.oldEmail}, {safe: true}).then(r => {
                                })
                            } else emailExists = true;
                        })
                    })
                }
                if (emailExists) return 'emailExists';
                if (!args.password) args.password = user.password;
                if (!user.status) args.status = 'client';
                else args.status = user.status;
                args.rates = user.rates || Config.rates;
                args.budget = user.budget;
                await res.updateOne({_id: ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)},
                    {$set: args},
                    {safe: true})
                db.close();
                return 'success'
            }

            return updateUser();
        });
    }
}

const handleEmailChange = async (email, oldEmail) => {
    pageData().then(async ({res, db}) => {
        await res.updateMany({client: oldEmail}, {$set: {client: email}}, {safe: true});
        db.close();
    })
}


module.exports = ({
    usersList,
    usersDetails,
    singleUser,
    addUser,
    userInfo,
    modifyUser,
    payWithPayze,
    recoveryPassword,
    loadBudget,
    setCourier,
    setBudget,
    setRatesForAll,
    setRates,
    FbLogin,
    resetPassword
});
