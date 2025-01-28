const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//backen ko cloudinary se jorne ke lie yh yh info chahiye hogi vo hmari env file mae details stored hae
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});


//cloudnary ke andrd jake konse folder mae sb hoga vo informnation deni hae is se
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormats: ["png","jpg","jpeg"], // supports promises as well
    },
  });

  module.exports={
    cloudinary,
    storage,
  }