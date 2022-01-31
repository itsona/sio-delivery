const express = require('express');
const app = express();
const cors = require(`cors`);
const expressGraphQL = require('express-graphql');
const schema = require('./middleWares/grapqhlServer');
const {handlePay} = require("./middleWares/queryFields/data/dataList");
app.use(cors());
app.use('/api',
    expressGraphQL({
        schema: schema,
        graphiql: false
    })
)

app.get('/payments/paymentError/', (req,res)=> {
    res.redirect("https://siodelivery.ge/login");
})

app.get('/payments/paymentSuccess/:client/:price/', (req,res)=> {
    const params = req.params;
    params.price = parseFloat(params.price);
    handlePay(params, false, `გადაიხადა ${params.price}`)
    res.redirect("https://siodelivery.ge/client");
})



const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
