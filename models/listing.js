const { default: mongoose, SchemaTypes } = require("mongoose");

const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
              

    },
    description: String,
    image:{
           url: String,
           filename: String,
    },
    price: Number,
    location: String,
    country: String,
reviews:[
    {
    type: Schema.Types.ObjectId,
    ref:"Review",
},
],
//yh owner user vale schema ko refer kr ra hoga kuki owner ko ek registered user hona bhi jaruri hae
owner:{
type: Schema.Types.ObjectId,
ref:"User",
},
// sirf isi format ko islea use kia kuki it is a kind of standrd format for all the apis to use data in this format for their diff features so hmne bhi yh hi use kr lia 
geometry:{
    type:{
        type: String,//do not do `{location:{type:String}}`
        enum: ['Point'],//'location.type' must be 'Point'
        required: true
    },
    coordinates:{
        type: [Number],
        required: true
    }
},
category:{
type:String,
enum:["Trending","Mountains","Arctic","Farms","Forest","Lakeside","Beach","Iconic Cities","Rooms","Castles","Amazing Pools","Camping"]
}
});

listingSchema.post("findOneAndDelete",async(listing)=>{
if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
    
}
});



const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;