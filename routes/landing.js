const express = require('express');
const router = express.Router();
const { products } = require('../models');
const {checkSessionAuthentication,checkAuthenticationWithJWT} = require('../middleware');

router.get('/', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{
    console.log('landing get route hit, this is headers', req.headers);

    let products = await products.collection().fetch({
        withRelated:[ {
                'productVersion': (queryBuild) => {
                queryBuild.select('id', 'versionName', 'image_url', 'price', )
                }
            },
            {
                'suppliers' : (queryBuild) => {
                    queryBuild.select('studioShopName')
                }
            }]
    });
    res.json({'products': products.toJSON()})
})

module.exports = router;
