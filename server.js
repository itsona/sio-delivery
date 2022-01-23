const express = require('express');
const app = express();
const cors = require(`cors`);
const expressGraphQL = require('express-graphql');
const schema = require('./middleWares/grapqhlServer');
app.use(cors());
app.use('/api',
    expressGraphQL({
        schema: schema,
        graphiql: false
    })
)

// app.get('/paymentError/:raime', (req,res)=> {
//     console.log(req.params.raime)
// })

const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
