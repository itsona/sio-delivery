require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
// const url = `mongodb+srv://sio:${process.env.MONGO_SECRET}@cluster0.4wwye.mongodb.net/delivery?retryWrites=true&w=majority`;
const url = `mongodb://127.0.0.1:27017/`;

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
const pageData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return {res: dbo.collection("data"), db};
}

module.exports = ({userData, emailData, pageData});
// module.exports = ({pageData});
