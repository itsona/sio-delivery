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
        getDataCounts: require('../middleWares/queryFields/data/dataList').getDataCounts,
        logExcel: require('../middleWares/queryFields/data/dataList').logExcelLoad,
        getDetails: require('../middleWares/queryFields/data/dataList').getDetails,
        dayReport: require('../middleWares/queryFields/data/dataList').dayReport,
        getLog: require('../middleWares/queryFields/data/dataList').getLog,
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addUser: require('../middleWares/queryFields/users/usersList').addUser,
        payWithPayze: require('../middleWares/queryFields/users/usersList').payWithPayze,
        modifyUser: require('../middleWares/queryFields/users/usersList').modifyUser,
        addData: require('../middleWares/queryFields/data/dataList').addData,
        changeStatus: require('../middleWares/queryFields/data/dataList').changeStatus,
        changeCourier: require('../middleWares/queryFields/data/dataList').changeCourier,
        updateData: require('../middleWares/queryFields/data/dataList').updateData,
        changePrice: require('../middleWares/queryFields/data/dataList').changePrice,
        changePayed: require('../middleWares/queryFields/data/dataList').changePayed,
        onDuplicate: require('../middleWares/queryFields/data/dataList').onDuplicate,
        cashPay: require('../middleWares/queryFields/data/dataList').cashPay,
        cashTransfer: require('../middleWares/queryFields/data/dataList').cashTransfer,
        handleAccept: require('../middleWares/queryFields/data/dataList').handleAccept,
        sendDocument: require('../middleWares/queryFields/data/dataList').sendDocument,
        cancelOrder: require('../middleWares/queryFields/data/dataList').cancelOrder,
        recoveryPassword: require('../middleWares/queryFields/users/usersList').recoveryPassword,
        resetPassword: require('../middleWares/queryFields/users/usersList').resetPassword,
        FbLogin: require('../middleWares/queryFields/users/usersList').FbLogin,
        setCourier: require('../middleWares/queryFields/users/usersList').setCourier,
        setBudget: require('../middleWares/queryFields/users/usersList').setBudget,
        setRatesForAll: require('../middleWares/queryFields/users/usersList').setRatesForAll,
        setRates: require('../middleWares/queryFields/users/usersList').setRates,
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
module.exports = schema;
