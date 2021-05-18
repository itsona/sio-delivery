const express = require('express');
const app = express();
const cors = require(`cors`);
const expressGraphQL = require('express-graphql');
const schema = require('./middleWares/grapqhlServer');
app.use(cors());
app.use('/api',
    expressGraphQL({
        schema: schema,
        graphiql: true
    })
)


const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
