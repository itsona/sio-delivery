const Config = require("../../constants");
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config();
const nodemailer = require('nodemailer');

const {
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean,
} = require('graphql');

const userData = require('../../authentication').userData;
const emailData = require('../../authentication').emailData;
const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'User from UsersList',
    fields: () => ({
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        password: {type: GraphQLNonNull(GraphQLString)},
        budget: {type: GraphQLInt},
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
        superExpressRate: {type: GraphQLFloat},
    })
})
const usersList = {
    type: GraphQLList(UserType),
    description: 'List of All users',
    resolve: async (parent, args, request) => {
        return userData().then((res) => {
            return res.find({}).toArray();
        })
    }
}

const usersDetails = {
    type: GraphQLList(UserDetails),
    description: 'List of All users',
    args: {
        status: {type: GraphQLString},
    },
    resolve: async (parent, args, request) => {
        const query = {
            status: args.status,
        }
        return userData().then((res) => {
            return res.find(query).toArray();
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
        return userData().then(async (res) => {
            await res.updateOne(query, {$set: {status: status}});
            return true;
        })
        return false
    }
}

const setBudget = {
    type: GraphQLBoolean,
    description: 'List of All users',
    args: {
        budget: {type: GraphQLInt},
        client: {type: GraphQLString},
    },
    resolve: async (parent, args, request) => {
        const token = request.headers.token;
        const query = {
            email: args.client,
        }
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
        return userData().then(async (res) => {
            const budget = await res.findOne(query, {projection: {_id: 0, budget: 1}})

            await res.updateOne(query, {$set: {budget: budget.budget + args.budget}});
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
        superExpressRate: {type: GraphQLString},
        client: {type: GraphQLString},
    },
    resolve: async (parent, args, request) => {
        const token = request.headers.token;
        const query = {
            email: args.client,
        }
        if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status !== 'admin') return;
        return userData().then(async (res) => {
            const user = await res.findOne(query, {projection: {_id: 0, rates: 1}})
            const rates = user.rates;
            delete args.client;
            await res.updateOne(query, {$set: {rates: {...rates, ...args}}});
            return true;
        })
        return false
    }
}


const singleUser = {
    type: GraphQLString,
    description: 'A Single user',
    args: {
        email: {type: GraphQLString},
        password: {type: GraphQLString}
    },
    resolve: (parent, args, request) => {
        return userData().then((res) => {
            async function getUser() {
                let user = await res.findOne({email: args.email, password: args.password});
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
        return emailData().then((res) => {
            return res.countDocuments({email: args.email}).then(contains => {
                if (contains) {
                    let transporter = nodemailer.createTransport({
                        service: 'zoho',
                        auth: {
                            user: 'support@arteria.ge',
                            pass: process.env.EMAIL_TOKEN_SECRET,
                        }
                    });

                    let mailOptions = {
                        from: 'support@arteria.ge',
                        to: args.email,
                        subject: 'Arteria Password Recover',
                        html: `<div style="padding: 64px;background: rgb(244,244,244);">
<h1>პაროლის აღდგენა
</h1>
<h2>პაროლის აღსადგენად დააჭირეთ ხელი ქვემოთ მოცემულ ღილაკს, თუ თქვენ არ გიცდიათ პაროლის აღდგენა არ მიაქციოთ ყურადღება.</h2>

<div style="
    display: flex;
    align-items: center;
    justify-content: center;
"><a href="https://arteria.ge/recovery#${jwt.sign({email: args.email}, process.env.ACCESS_TOKEN_SECRET)}"
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
    ">პაროლის აღდგენა</a></div>
<h3 style="
    font-size: 11px;
    padding-top: 24px;
">P.S. თუ განახლება თქვენ არ მოგითხოვიათ ჩვენი რჩევაა მოგვმართოთ support@arteria.ge მეილ მისამართზე</h3>`
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                } else {
                    return 'no-email';
                }
            })
        })

    }
}

const userInfo = {
    type: UserType,
    description: 'A Single user info',
    resolve: (parent, args, request) => {
        const token = request.headers.token;
        return userData().then((res) => {
            async function getUser() {
                let user = await res.findOne({_id: ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)});
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
        fromDate:{type: GraphQLString},
        toDate:{type: GraphQLString},
    },
    resolve: (parent, args, request) => {
        const token = request.headers.token;
        return userData().then((res) => {
            async function getUser() {
                let user = await res.findOne({_id: ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)});
                if (user != null) {
                    if(args.fromDate || args.toDate){
                        const budgetList = user.budgetList.filter((item)=> {
                            if(args.fromDate && args.toDate){
                                return item.date <= args.toDate && item.date >= args.fromDate;
                            }else if(args.fromDate){
                                return item.date >= args.fromDate;
                            }else {
                                return item.date <= args.toDate
                            }
                        })
                        let sum = 0;
                        budgetList.forEach((item)=> sum += item.budget)
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
const recoveryPassword = {
    type: GraphQLString,
    description: 'exchange password',
    args: {
        password: {type: GraphQLNonNull(GraphQLString)}
    },
    resolve: (parent, args, request) => {
        const token = request.headers.token;
        return userData().then((res) => {
            async function getUser() {
                let user = await res.updateOne({email: jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).email},
                    {$set: {password: args.password}});
                if (user != null) {
                    return user;
                }
                return {};
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
        let user = args;
        delete user.passwordRepeat;
        user.rates = Config.rates;
        user.budget = 0;
        return emailData().then((res) => {
            res.drop();
            return res.countDocuments({email: args.email}).then(contains => {
                if (!contains) {
                    res.insertOne({email: args.email});
                    return userData().then((res) => {
                        user.status = 'admin';
                        res.insertOne(user)
                        return 'success';
                    });
                } else return 'contains';
            })
        })
    }
}

const modifyUser = {
    type: GraphQLString,
    args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        password: {type: GraphQLString},
        newPassword: {type: GraphQLString},
        budget: {type: GraphQLFloat},
        takeRate: {type: GraphQLFloat},
        delivery: {type: GraphQLFloat},
        normalRate: {type: GraphQLFloat},
        expressRate: {type: GraphQLFloat},
        superExpressRate: {type: GraphQLFloat},
        address: {type: GraphQLString},
        phone: {type: GraphQLString},
        status: {type: GraphQLString},
    },
    resolve: (parent, args, request) => {
        if (!args.email || !args.name || !args.address || !args.phone) return 'nonNUll'
        const token = request.headers.token;
        return userData().then((res) => {
            async function updateUser() {
                if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).status === 'admin') {
                    args.rates = {
                        takeRate: args.takeRate,
                        delivery: args.delivery,
                        normalRate: args.normalRate,
                        expressRate: args.expressRate,
                        superExpressRate: args.superExpressRate,
                    }
                    delete args.takeRate;
                    delete args.delivery;
                    delete args.normalRate;
                    delete args.expressRate;
                    delete args.superExpressRate;
                    await res.updateOne({email: args.email}, {$set: args})
                    return 'success';
                }
                const user = await res.findOne({_id: ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)});
                if (args.password && args.newPassword) {
                    if (user.password !== args.password) {
                        return 'incorrect';
                    }
                    args.password = args.newPassword;
                    delete args.newPassword;
                }
                if (!args.password) args.password = user.password;
                if (!user.status) args.status = 'client';
                else args.status = user.status;
                args.rates = user.rates || Config.rates;
                args.budget = user.budget;
                await res.updateOne({_id: ObjectId(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id)}, {$set: args})
                return 'success'
            }

            return updateUser();
        });
    }
}


module.exports = ({
    usersList,
    usersDetails,
    singleUser,
    addUser,
    userInfo,
    modifyUser,
    resetPassword,
    recoveryPassword,
    loadBudget,
    setCourier,
    setBudget,
    setRates,
});