const express = require("express");
//yh merge params vali chj islea likhi hai taki is model ke lie parent route(listings/:id/reviews) bhi child routes ke sath merge ho jae 
// kuki parent route mai jo id hai vo use mai ari thi reviews ko add aur deletye krte time aur ek error ara tha uska hi solution hai yh 
//merge params
const router = express.Router({mergeParams: true});

//1. error handle vali class ko require kr re hai 
const wrapAsync = require("../utils/wrapAsync.js");
//2a. yh hmne apne listing model ko require kis hai
const Listing = require("../models/listing.js");
//2b. vese hi ahm ab apne review model ko bhi require krenge 
const Review = require("../models/review.js")
const {validateReview, isLoggedIn,isReviewAuthor}  = require("../middleware.js");
const ReviewController = require("../controllers/reviews.js");



//Reviews
//post review route
//database mai koi review ko store krane vale hai islea yh async hoga 
//yh jo line likhi hai is line mai id mai value stored ahi jis listing mai review dalre hia suki id hia 
//validatereview ko as a middleware pass kr re hai jo server side se koi invalidinformation na jae schema ke hi acc sb jae usko chk krne mai help krega
router.post("/",isLoggedIn,validateReview,wrapAsync(ReviewController.createReview));


//Delete review route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(ReviewController.destroyReview));



module.exports= router;