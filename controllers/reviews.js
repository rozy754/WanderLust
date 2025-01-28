const { model } = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js")

module.exports.createReview = async(req,res)=>{
    //ab phle id ki madad se us listing ko dudenge
    let listing = await Listing.findById(req.params.id);
    //ab new review mai jo jo likha hoga usko database mai dalna hai.. req ki body mai jo review ka object aya hoga uski madad se
    let newReview = new Review(req.body.review);
    //this person is basically author of our new review
    newReview.author = req.user._id;
   // console.log(newReview); yh bas author ki details ko print krane ke lie tha 
    //ab jo listing hmne find kri jiska review likhre hai .. uske schema mai hmne review ka ek array banya hai 
    // jha us review ki id ko hm store kr re hai 
    listing.reviews.push(newReview);
    //ab dono ko database mai save kr denge 
     await newReview.save();
     await listing.save();
     req.flash("success","New Review Created!");
   res.redirect(`/listings/${listing.id}`);

}


module.exports.destroyReview =async(req,res)=>{
    let { id, reviewId } = req.params;
     //pull operator removes an id from an exsisting array alll instances of a value
    //or values that match a specified condition
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};