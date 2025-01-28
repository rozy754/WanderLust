const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    });

    async function main(){
        await mongoose.connect(MONGO_URL);
    }

    const initDB = async() =>{
        await Listing.deleteMany({});
        //database mae data insert krne se just phle hamara jo init data hai uske andr ham apni data array ko access krenge aur uske upe hm map function applly krenge
        //aur map kya krega .. map har ek individual object ke lie ek new property ko add kr dega.. aur hn yh koi bhi owner lw rkha hai 
        // yh map function array ke andr chnges nhi krta .. new array create krta hai .. aur usi ke andr prop ko insert krta hai 
        initData.data = initData.data.map((obj)=>({
           ...obj, owner:"677fa84d04f8469e3c8dd8af",
        }));
        await Listing.insertMany(initData.data);
        console.log("data was initialized");

    };

    initDB();
