require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
// const url = `mongodb+srv://sio:${process.env.MONGO_SECRET}@cluster0.4wwye.mongodb.net/delivery?retryWrites=true&w=majority`;
const url = `mongodb://127.0.0.1:27017:27017/`;

const userData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return dbo.collection("users");
}
const companyData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return dbo.collection("companies");

}
const emailData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return dbo.collection("emails");
}
const emailDataCompany = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return dbo.collection("emailsForCompany");
}
const pageData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return dbo.collection("data");
}
const categoriesData = async ()=> {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true});
    const dbo = await db.db('delivery');
    return dbo.collection("categories");
}

module.exports = ({userData, companyData, emailData, emailDataCompany, pageData, categoriesData});
// module.exports = ({pageData});