const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO ,{
    useNewUrlParser:true

}).then(() =>{
    console.log("Database Connected ");
}).catch((e) => {
    console.log("Error in connection ");
})