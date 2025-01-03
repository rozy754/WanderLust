const express = require("express");
const app= express();
//setting up ejs
const path = require("path");
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
//yh na aur better templationg ke lie install kia hmne 
const ejsMate = require("ejs-mate");
//static files ko use krne ke lie 
app.use(express.static(path.join(__dirname,"/public")));


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
//yh ejs mate ko use krne ke lie 
app.engine('ejs',ejsMate);
main()
.then(()=>{
    console.log("connected to DB");
})

.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}


app.get("/",(req, res)=>{
    res.send("hi, i am root");
});

//Index Route
app.get("/listings",async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});

});

//new Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});


//show route
app.get("/listings/:id",async(req,res)=>{
    let{id}= req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});

});
 

//create route
app.post("/listings",async(req,res)=>{
const newListing = new Listing(req.body);
await newListing.save();
res.redirect("/listings");

});


//EDIT route

app.get("/listings/:id/edit",async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
     res.render("listings/edit.ejs",{listing});
});


//update route
app.put("/listings/:id",async(req,res)=>{
    let{id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
});


//delte route 
app.delete("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});























// yh toh bese hi bas daal re thae database ke ander 
// app.get("/testListing", async(req, res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });


app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});