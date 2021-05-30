const express = require('express');
const app = express();
const cors = require(`cors`);
const expressGraphQL = require('express-graphql');
const schema = require('./middleWares/grapqhlServer');
app.use(cors());
app.use('/api',(req, res, next) => {
        // remove before production;
        if (!req.headers.token) {
            req.headers.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2MyMWI3ZGRiMGRlMWE1ODM4Y2M4OSIsInN0YXR1cyI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsImlhdCI6MTYxOTcyNDE1MX0.OPqusgQ8uMsH2OCphpeVFTR1SCo4EvikQTo2dNGJxHg";
        }
        next();
    }
    ,
    expressGraphQL({
        schema: schema,
        graphiql: true
    })
)


const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
