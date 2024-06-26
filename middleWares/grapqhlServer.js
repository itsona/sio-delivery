const {
    GraphQLSchema,
    GraphQLObjectType,
} = require('graphql')


const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        user: require('../middleWares/queryFields/users/usersList').singleUser,
        userInfo: require('../middleWares/queryFields/users/usersList').userInfo,
        loadBudget: require('../middleWares/queryFields/users/usersList').loadBudget,
        users: require('../middleWares/queryFields/users/usersList').usersList,
        usersDetails: require('../middleWares/queryFields/users/usersList').usersDetails,
        data: require('../middleWares/queryFields/data/dataList').dataList,
        getForAccept: require('../middleWares/queryFields/data/dataList').getForAccept,
        loadExcel: require('../middleWares/queryFields/data/dataList').loadExcel,
        getDetails: require('../middleWares/queryFields/data/dataList').getDetails,
        dayReport: require('../middleWares/queryFields/data/dataList').dayReport,
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addUser: require('../middleWares/queryFields/users/usersList').addUser,
        modifyUser: require('../middleWares/queryFields/users/usersList').modifyUser,
        addData: require('../middleWares/queryFields/data/dataList').addData,
        handleAccept: require('../middleWares/queryFields/data/dataList').handleAccept,
        cancelOrder: require('../middleWares/queryFields/data/dataList').cancelOrder,
        recoveryPassword: require('../middleWares/queryFields/users/usersList').recoveryPassword,
        FbLogin: require('../middleWares/queryFields/users/usersList').FbLogin,
        setCourier: require('../middleWares/queryFields/users/usersList').setCourier,
        setBudget: require('../middleWares/queryFields/users/usersList').setBudget,
        setRates: require('../middleWares/queryFields/users/usersList').setRates,
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
module.exports = schema;
