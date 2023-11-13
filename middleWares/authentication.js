require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
// const url = `mongodb+srv://sio:${process.env.MONGO_SECRET}@cluster0.4wwye.mongodb.net/delivery?retryWrites=true&w=majority`;
const url = `mongodb://127.0.0.1:27017/`;
const newUrl = `mongodb+srv://SioRoot:aFacitFJKjYX9RW2@siodelivery.gw9lbkf.mongodb.net/`;


const userData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("users"), db};
}
const emailData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("emails"), db};
}
const paymentsData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("payments"), db};
}
const pageData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("data"), db};
}
const logData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("log"), db};
}

const newUserData = async ()=> {
    try {
        const db = await MongoClient.connect(newUrl, {useUnifiedTopology: true});
        const dbo = await db.db('delivery');
        return {res: dbo.collection("users"), db};
    }catch (e) {
        console.log('shida',e)
    }
}

const newEmailData = async ()=> {
    const db = await MongoClient.connect(newUrl, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("emails"), db};
}
const newPaymentsData = async ()=> {
    const db = await MongoClient.connect(newUrl, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("payments"), db};
}
const newPageData = async ()=> {
    const db = await MongoClient.connect(newUrl, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("data"), db};
}
const newLogData = async ()=> {
    const db = await MongoClient.connect(newUrl, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("log"), db};
}

module.exports = ({userData, emailData, pageData, logData, paymentsData, newLogData, newUserData, newEmailData, newPaymentsData, newPageData});
// module.exports = ({pageData});
