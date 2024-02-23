require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
// const url = `mongodb+srv://sio:${process.env.MONGO_SECRET}@cluster0.4wwye.mongodb.net/delivery?retryWrites=true&w=majority`;
const newUrl = `mongodb://127.0.0.1:27017/`;
// const newUrl = `mongodb+srv://SioRoot:aFacitFJKjYX9RW2@siodelivery.gw9lbkf.mongodb.net/`;
let db = null
     MongoClient.connect(newUrl, {useUnifiedTopology: false}).then(database=> {db = database})


const userData = async ()=> {
    const dbo = await db.db('delivery');
    setTimeout(()=> db.close(), 2000)
    return {res: dbo.collection("users"), db: {close: ()=> {}}};
}
const emailData = async ()=> {
    const dbo = await db.db('delivery');
    setTimeout(()=> db.close(), 2000)

    return {res: dbo.collection("emails"), db: {close: ()=> {}}};
}
const paymentsData = async ()=> {
    const dbo = await db.db('delivery');
    setTimeout(()=> db.close(), 2000)

    return {res: dbo.collection("payments"), db: {close: ()=> {}}};
}
const pageData = async ()=> {
    const dbo = await db.db('delivery');
    setTimeout(()=> db.close(), 2000)
    return {res: dbo.collection("data"), db: {close: ()=> {}}};
}
const logData = async ()=> {
    const dbo = await db.db('delivery');
    setTimeout(()=> db.close(), 2000)
    return {res: dbo.collection("log"), db: {close: ()=> {}}};
}


module.exports = ({userData, emailData, pageData, logData, paymentsData});
// module.exports = ({pageData});
