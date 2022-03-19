const express = require('express');
const app = express();
const cors = require(`cors`);
const expressGraphQL = require('express-graphql');
const schema = require('./middleWares/grapqhlServer');
const {handlePayWithPayze} = require("./middleWares/queryFields/data/dataList");
app.use(cors());
app.use('/api',
    expressGraphQL({
        schema: schema,
        graphiql: true
    })
)

app.get('/payments/paymentError/', (req,res)=> {
    res.redirect("https://siodelivery.ge/login");
})

app.get('/payments/paymentSuccess/:client/:price/:token', (req,res)=> {
    handlePayWithPayze(req.params)
    res.redirect("https://siodelivery.ge/client");
})



const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
