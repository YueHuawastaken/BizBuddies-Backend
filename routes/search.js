const express = require('express');
const router = express.Router();
const { searchProductsBySearchForm } = require("../service-layer/products-service");

router.post('/', async(req,res)=>{

    console.log('route hit for search')
    console.log('req.body here in routes =>', req.body)
    
    const products = await searchProductsBySearchForm(req.body);

    res.json({'products': products.toJSON()})
})

module.exports = router