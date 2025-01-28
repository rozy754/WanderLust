const User = require("../models/user");

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
    };

module.exports.signup =  async(req,res)=>{
    try{
    //req se data lenge
    let {username, email, password}= req.body;
    //cretae kis model ke madad se neww user
    const newUser = new User({email, username});
    //yh iski madad se data base mai regiter karaya necche
    //uh user.register shyd passport ka koi method hae jo usernme aur pass wala feild user schema ke andr add krke aur yha se value leke data base ke andr add kra deta hai
    //<<<user.register>>> method helps to regiater a new user instance with a given password and automatically checks is th username is unique or not
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    //ab jese hi hmara user sign up ho gya hae vo automatically login bhi ho jana chahiye  
    // uske lie bhi hamare passport ke pass ek login vala function hota hae
    //voi neeche implemented hae
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to Wanderlust!");
        res.redirect("/listings");
    });
   
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }

};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
    };

module.exports.login = async (req,res)=>{
    req.flash("success","Welcome back to wanderlust!");
    //ham jha se koshish kr re thae login krne ki vhi se continue krne ke lie yh sb likh re thae lekin dikat yh hae ki passport bhaiya loggin hone ke baad session ko clr kr dete hae 
    //toh yh redirecturl vali chej bhi empty ho jaegi ... isi lie isko save krne ke lie hm isko locals ke andr save krenge
    // res.redirect(res.locals.redirectUrl);
    //ab dikat yh ai ki baki sb jgh se toh mamla set hae lekin agr user ne ab direct loign krne ka try kia toh 
    // vo nhi kr paega kuki loggedin middleware trigger nhi ho paya hae toh original url save bhi nhi hoga aur dikat aega 
    //uske lie yh neeche
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
    };
    
module.exports.logout = (req,res,next)=>{
    //yh apne app mai ek callback ko leta hai as a parameter.. callback means jese hi user logout ho jae uske baad immediately ky kam hona chahhiye 

    req.logout((err)=>{
        if(err){
          return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    })
};