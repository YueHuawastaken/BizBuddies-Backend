const express = require('express');
const router = express.Router();
const { checkUserAuthenticationWithJWT } = require('../middleware');

const cloudinary = require('cloudinary');
cloudinary.config({
    'api_key': process.env.CLOUDINARY_API_KEY,
    'api_secret': process.env.CLOUDINARY_API_SECRET
})

router.get('/signature', (req,res)=>{
    try{
        const params_to_sign = req.query.params_to_sign;
        const signature = cloudinary.utils.api_sign_request(params_to_sign, process.env.CLOUDINARY_API_SECRET);
        console.log('signature is here', signature)
        res.send(signature);
    } catch (error){
        console.error('Cloudinary Fail to sign', error)
    }
})

module.exports = router;
