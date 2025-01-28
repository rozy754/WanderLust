const express = require("express");
const router = express.Router();
//1. wrapasync database se related errors ya shyd dusrse bhi unko handel krne ke lie yh middleware hai 
//error handle vali class ko require kr re hai 
const wrapAsync = require("../utils/wrapAsync.js");
// 2 aur 3rd validatinglisting vale ke lie phle yhi thae fir unko middleware vale folder mai daal dia tha
//4. yh hmne apne listing model ko require kis hai
const Listing = require("../models/listing.js");
//logiin hai ya ni uska ek middleware create kia hai usi method ko middleware ki file se require kr ri hu 
const {isLoggedIn} = require("../middleware.js");
// <!-- yh authorization vala part hai jha hm yh confirm kra re hai ki jo user edit krne ki koshish kr ra hai vo aur jo listing ko own krta hai vo agr yh dono same hai toh hi allow hoga edit ya delte krna nhi toh nhi hoga -->
const {isOwner}  = require("../middleware.js");
//vo jo joi vali chej thi usko as a middleware act krnane ke lie 
const {validateListing} = require("../middleware.js");

//yh code ko systematically likhne ke lie kr re hae MVC backend ko tamij se likhne ke lie hota hia toh vo ham controller vale folder ke andr files bnakr kr re hia toh yha voi folder ko require kr re hai 
const listingController = require("../controllers/listings.js");

//yh jo neeche require kia hai vo enctype="multipart/form-data" isko work krane ke lie hai taki datrabase mera is type ke data ko smjhe aur accept kr skte file upload vala feature add kr ri hu na ismsae mai tab 
const multer = require("multer");// form ke data ko parse krwane ke lie 
//yh vo cloud vali chej ko require kia
 const {storage} = require("../cloudConfig.js");
const upload = multer({storage});// forms ke data se files ko niklaega aur unko is destination pe mere code ke andr save kr dega 




//index aur create route ka jo path hai jo sme hai .. itna jada short krne ke baad bhi i.e. controllers ko use krne ke baad bhi we have Routers.route jiski help se we can further more shortern out code for writing routes
//jese yha index route and create route ka tha 
// router.get("/",wrapAsync(listingController.index));
// validate listing ek middlware hai islea likha hai kuki voi upr jo joi ko require kia uska use hm yha pe kr re hia 
// router.post("/",isLoggedIn, validateListing, wrapAsync(listingController.createListing) );
router
.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('listing[image]'),validateListing, wrapAsync(listingController.createListing) );

//search bar
router.get("/search",listingController.search);
router.get("/location",listingController.location);

//new Route
router.get("/new",isLoggedIn,listingController.renderNewForm);


//msg for update route
// joi vali chej ko middlewqare mae jb convert kia na tab aya yh validatinglisting vala chej
   // <!-- yh authorization vala part hai jha hm yh confirm kra re hai ki jo user edit krne ki koshish kr ra hai vo aur jo listing ko own krta hai vo agr yh dono same hai toh hi allow hoga edit ya delte krna nhi toh nhi hoga -->
router 
.route("/:id")
.get(wrapAsync(listingController.showListing))
//upload.single('listing[image]') is se m,ulter hamri image ko parse krega then vo clooudinary ke andar save hongi 
.put(isLoggedIn,
    isOwner
     ,upload.single("listing[image]"),
     validateListing, 
      wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));



//EDIT route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports=router;