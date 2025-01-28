//owner vakle model mai iski need hai
const Listing = require("./models/listing");
const Review = require("./models/review");

//neeche ke 2 validate listing vale middleware ke lie hae
//yh express se error class ko extend krke fir error handle krte hai vo class ko require kr ri hu 
const ExpressError = require("./utils/ExpressError.js");
// yh jese client side se kisine informations adhi adhri bhjne ka try kia toh yh error show kregaaa joi vali chej se related hai ..isko schema.js se export kia hia aur yha pe require kr re hai
const {listingSchema, reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req,res,next)=>{
    console.log(req.user);
   //this is to make sure that user must be looged in aur yh function bhi shyd passport ka hi hai i loveeee passport
   //abhi jo current seesion ke andar user ki information stored hai vo valid hia ya ni 
   //kuki hmara jo session hai vo  passport ki help se sseion user ki information bhi stored krke rkhta hai
    if(!req.isAuthenticated()){
        //ab yh neeche jo mae likhne jari hu yh voh hae ki jese user ne site mae jake listing open krke use edit krne ka try kia pr
        //use site ne kha phle login toh kr chomu 
        //firr user ne login kia .. ab login ke baad vese ky hora tha user seedhe home page pe hi bar bar direct kra re thae ham lekin iske madad se hm user ko 
        //login ke baad vhi se continue kra skte  hae jha vo phle tha!
        //ab yh session vali chej ka toh access sbke pass hae .. aur yh req body ke pass hazar informations padi rehti hia toh yh original url bhi unhi informations mai se ek hai 
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
       return res.redirect("/login");
    }
    next();
};

//toh redirecturl ko save krane ke lie locals mae hm ek aur middleware ko create krenge
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
     res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

//<!-- yh authorization vala part hai jha hm yh confirm kra re hai ki jo user edit krne ki koshish kr ra hai vo aur jo listing ko own krta hai vo agr yh dono same hai toh hi allow hoga edit ya delte krna nhi toh nhi hoga -->
module.exports.isOwner = async(req,res,next)=>{
    let{id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","you don't have permission to edit");
       return res.redirect(`/listings/${id}`);
    }

    next();
};

//vo jo joi vali chej thi usko as a middleware act krnane ke lie 
module.exports.validateListing = (req,res,next)=>{   
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errmsg);
    }else{
        next();
    }

};

// vo jo joi vali chej thi usko as a middleware act krnane ke lie 
module.exports.validateReview= (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errmsg);
    }else{
        next();
    }
};

//yh review kw authorization ke lie ki jo review ka hai usko kon particulary delete ya edit kr skta hai 
module.exports.isReviewAuthor = async(req,res,next)=>{
    let{id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","you are not the author of this review");
       return res.redirect(`/listings/${id}`);
    }

    next();
};
