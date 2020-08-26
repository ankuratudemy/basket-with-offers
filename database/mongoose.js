//MongoDb connection code
const mongoose = require("mongoose");
const Product = require("../models/Product.model");
const connection = "mongodb://localhost:27017/rackspace-basket";
const connectDb = () => {
 return mongoose.connect(connection,{ 
    useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true
});
};
module.exports = connectDb;