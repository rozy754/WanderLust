const Listing = require("../models/listing");
// mapbox mai ab ham geocoding krne vale haiiiii
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
// yh geoclient h,mara ek esa object hai jo hmko help krega age cordinates ko access krne mai 
const geocodingClient = mbxGeocoding({accessToken:mapToken});

module.exports.index = async(req,res)=>{
    const { category } = req.query; // Extract the category from the query parameters

    let allListings; // Declare a variable to hold the listings

    if (category) {
        // console.log(category);
        // If category is provided, fetch listings with that category
        allListings = await Listing.find({ category:category });
    } else {
        // If no category is provided, fetch all listings
        allListings = await Listing.find({});
    }
    res.render("listings/index.ejs",{allListings});
    return; 
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing =  async(req,res)=>{
    let{id}= req.params;

    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate:{path:"author"},}).populate("owner");// yh isi vali line mai nested populating hui hai .. kuki hmko review vala jo array tha listing model ke andr( use likha tha na id use krke fir uski information nikalne ke lie usko populate kia tha) .. ab hmko us review vale model ke andr lie hui id .. user model se author ke roop mai .. vo hme yha listing mai chhahiye toh usi ke lie ... nested populate use krke hmne listing model ke and review model ka author ko populate kia jo ki usne user model se lia hai  
 if(!listing){
    req.flash("error","Requested Listing does not exist!");
    res.redirect("/listings");
 }
 console.log(listing);
    res.render("listings/show.ejs",{listing});

}

module.exports.createListing = async(req,res,next)=>{
 
 //map ke coordinates ko pane ke lie hme yh sb krna pda
 let response = await geocodingClient
 .forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
 })
 .send();
 
 let url = req.file.path;
 let filename = req.file.filename;
// console.log(url,"..",filename);
    const newListing = new Listing(req.body.listing);
    // user model ko add krne ke baad ab jb bhi new listting ko create krenge toh uske username ko bhi toh add krna pdega na 
    // iske andr current user ki info store krni hai 
    // jo req object hoti hai na uske andr hmara passport by default user related information req.user ke andr store krwata hai
    newListing.owner = req.user._id;
    // jo update schema hua listing ka jismae image upload hone lgi thi
    newListing.image = {url,filename};
    newListing.geometry= response.body.features[0].geometry;  
    newListing.category = req.body.listing.category;
    let savedListing = await newListing.save();
    console.log(savedListing); 
    //ab yh jo line likhne vale hai voo tab aegi jese hi ek new route create hoga na 
       // tab ek flash aega screen pe one timer only 
       //aur fir isko ham apne response ke local variables ke andr access kr skte hai 
       //then indexj.ejs ko bhj denge kuki /listings pe redirect hora hai na create vala route islea 
       req.flash("success","New Listing Created!");
       res.redirect("/listings");
};


module.exports.search = async(req, res)=>{
const query = req.query.query;

//console.log(req.query);

    if (!query) {
        return res.json({ suggestions: [] }); // Return empty suggestions if no query
    }

    try {
        const locations = await Listing.distinct('location', {
            location: { $regex: `^${query}`, $options: 'i' } // Regex for case-insensitive match
        });

        res.json({ suggestions: locations }); // Send the matching locations
    } catch (error) {
        console.error(error);
        res.status(500).json({ suggestions: [] });
    }

  

   
}

module.exports.location = async(req, res)=>{
    const location = req.query.location;
    if (location) {
        // Handle the case where the user is searching for listings in a specific location
        try {
            const allListings = await Listing.find({location: location }); // Fetch listings for the location
            return res.render('listings/index.ejs', { allListings }); // Render the listings page
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error fetching listings');
        }
    }
}



module.exports.renderEditForm =  async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Requested Listing does not exist!");
        res.redirect("/listings");
     }

     let originalImageUrl = listing.image.url;
     originalImageUrl=originalImageUrl.replace("/upload","/upload/w_100");
     res.render("listings/edit.ejs",{listing,originalImageUrl});

};

module.exports.updateListing = async(req,res)=>{
  let {id} = req.params;
   let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});


    // Step 2: Update location and regenerate coordinates if location is updated
    if (req.body.listing.country || req.body.listing.location !== listing.location) {
        let response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
            })
            .send();
               // Update geometry with new coordinates
        listing.geometry = response.body.features[0].geometry;
        console.log("yh haiii")
        console.log(listing.geometry);

        // Update the location name
        listing.location = req.body.listing.location;
        await listing.save();
    }
    //uuuuuuuuuuuuuppppppppppppppppppppprrrrrrrrrrrrrrrrr

 Object.assign(listing, req.body.listing);

   if(typeof req.file !== "undefined"){ 
   let url = req.file.path;
   let filename = req.file.filename;
 listing.image = {url,filename};
 await listing.save();
   }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};





module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!" );
    res.redirect("/listings");
};