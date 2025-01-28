//jo variables hai .env vali fiel mai usko hme use krna hia par ese direct use nhi kr skte uske lie alg se ek package ko require krna padega 
if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app= express();
//setting up ejs
const path = require("path");
const mongoose = require("mongoose");
//database ke lie
const dbUrl = process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connected to DB");
})

.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}

//html se sirf get post jati hai na toh islea method overriding ke mdad se put aur delete bhi ho jata hai 
const methodOverride = require("method-override");
//yh na aur better templationg ke lie install kia hmne 
const ejsMate = require("ejs-mate");
//static files ko use krne ke lie 
app.use(express.static(path.join(__dirname,"/public")));
//yh express se error class ko extend krke fir handle krte hai vo class ko require kr ri hu 
const ExpressError = require("./utils/ExpressError.js");
//express-session ko require kr re hai yh vo hai cookies respond mai bhjna client ko aur tmeporary data store krna 
//aur vapis dena usjke basis pe resoponse fir hmne iske madad se connect-flash bhi pda toh voi implemnent jr re hai
const session = require("express-session");
const MongoStore = require('connect-mongo');// yh deploy krte time session store krne ke lie use krte hai
//express sessison ka use krke hm flash vali chej ko ab implement krne vale hia 
//usi ke lie hai yh requiring
const flash = require("connect-flash");
//passport local ko use krn ke lie yani authentication ko setup krne ke lie basic settings kese baidhae
//toh sbse phle passport ko require kr lete hai
const passport = require("passport");// isko implement krne ke lie session ki jaruart hoti hai toh uske neeche dekho iska usaage
const LocalStrategy = require("passport-local");
//ab yh neeche user model ko require kr re hai 
const User = require("./models/user.js");


//jo sare listings vale routes thae.. code ko clean rkhne ke lie unko dusre file mai daal dia ab 
//lekin unko require bhi toh krna padega na toh voi kr re hai neeche 
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const cookieParser = require("cookie-parser");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
//yh ejs mate ko use krne ke lie 
app.engine('ejs',ejsMate);

// //online session store krne ke li eiusko add kis hmne yha
const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
console.log("ERROR in MONGO SESSION STORE",err);
});



//fir session option ko bhi define krna hota hai
const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Corrected Date object usage
        maxAge: 7 * 24 * 60 * 60 * 1000, // Corrected syntax
        httpOnly: true,
    },
};



//fir isko use krne ke lie 
app.use(session(sessionOptions));
//routes jha pe require hote hai us se phle hi hmara flash require hona chahiye 
app.use(flash());
//passport ko implement krne ke lie phle session ki jarurat hoti hai islea iske neeche likhre hai 
//ab passport ko initialixe krne ke lie iski need hoti
app.use(passport.initialize());
//ab isko implement krne ka exact usage ky hota hai ki taki har ek request ko pta ho ki vo konse session ka part hai
// yani ek user with one s eeion fir vo us session ke ander khi bhi jae
app.use(passport.session());
//ab passport ke andr hmne apni jo bhi new local strategy create kri.. yani jitne bhi users ae jitni bhi requests ae vo sb localstratgy ke through authenticate hone 
//chahiye.. aur un logo ko authenticate krnw ke lie konsa method use hoga <<<< .authenticate() >>> yh use hoga neeche dekho
passport.use(new LocalStrategy(User.authenticate())); 
//ab session ke andar passport user ki sari information store jb karata hai toh usko serialization bolte hai 
//aur jb session se remove krata hai toh usko deserialize kra di esa bolte hai jo mai neche kr ri hu dkeho 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




    
//ab yh ek middle ware create krenge flash ke lie 
//aur fir yh locals.success ko index.ejs mai use krenge na kuki vhi pe flas karenge islea 
app.use((req,res,next)=>{
res.locals.success = req.flash("success");
res.locals.error = req.flash("error");
//user login hae toh taki sirf logout wala option show kre krke aur agr user logout hae toh srf singup or login vala option show kre krke tb yh 
//vali line likhi taki req mae se user ki information html tk phuch pae ..
//aur direct toh phuch ni skti thi islea local vatiables ki madad se phucha re hae
res.locals.currUser = req.user;
next();// yh krna jaruri hai nhi toh yhi pe stuck hoke reh jaega
});



//is request ke through ham apne data base mai ek user ko add krnge
//this was just an example
// app.get("/demouser",async(req,res)=>{
// let fakeUser = new User({
// email: "student@gmail.com",
// username: "delta-student"
// });
// //yh <<<user.register>>> method helps to regiater a new user instance with a given password and automatically checks is th username is unique or not
// let registeredUser = await User.register(fakeUser,"helloworld");
// res.send(registeredUser);
// });









//require kie hue sare listings vale routes ko upr require kia aur yha pe ab use krenge 
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


//let say user ne koi invalid page pe request bheji 
//toh vo neeche vale route mai jake vha se error ko throw kregi 
//fir yh error catch hoga ham,are middle ware mai aur vha se response then send hoga 
app.all("*",(req,res,next)=>{
next(new ExpressError(404,"page not found!"));
});

//error handle krne ke lie middleware
app.use((err,req,res,next)=>{
    let {statusCode=500, message="something went wrong"} = err;
  //  res.status(statusCode).send(message);
res.status(statusCode).render("error.ejs",{message});
});

//server chalu hae bhailog 
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});