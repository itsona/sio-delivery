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

app.get('/payments/paymentError/:client/:price/', (req,res)=> {
    const params = req.params;
    params.price = parseFloat(params.price);
    console.log(params, 'get')
    // handlePay(params, true, `გადაიხადა ${params.price}`)
    res.status(200);
    res.send();
})
app.post('/payments/paymentError/:client/:price/', (req,res)=> {
    const params = req.params;
    params.price = parseFloat(params.price);
    // handlePay(params, true, `გადაიხადა ${params.price}`)
    console.log(params,'post')
    res.status(200);
    res.send();
})



const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
