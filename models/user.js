const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//yha yh passport ko use krte time .. authentication ko aplly krte time agr database mongo db hai toh uske lie isko require krne ki need pdti hai
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type: String,
        required: true

    }
})
//passport local mongoose username aur password aur hashing aur salting yh do filds apne app hi add kr deta hai
// aur voi chej implement krne ke lie we will write
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',userSchema);
