const express = require('express');
const router = express.Router();

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const {suppliers} = require('../models');

const {findSupplierById} = require('../data-access-layer/suppliers');
const {findProductsByStudioShopName, findProductById} = require('../service-layer/products-service');
const {retrieveOrderByCustomerId} = require('../service-layer/orders-service');
const {retrieveCustomerCartItems} = require('../service-layer/carts-service');
const {postNewSupplierProduct, updateSupplierProduct} = require('../service-layer/suppliers-service');

const { checkSupplierAuthenticationWithJWT } = require('../middleware');
const session = require('express-session');

const generateJWT = (suppliers, tokenSecret, expirationTime) => {
    return jwt.sign({
        'phoneNumber': suppliers.phoneNumber,
        'id': suppliers.id
    }, tokenSecret, {expiresIn: expirationTime}
    )
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hashedPassword = sha256.update(password).digest('base64')
    return hashedPassword;
}

router.post('/login', async(req, res)=>{

    try {
        let foundSupplier = await suppliers.where({
            phoneNumber: req.body.phoneNumber,
            password: getHashedPassword(req.body.password)
        }).fetch({
            require: false
        });

        try {
            if (foundSupplier){

                let supplier_id = foundSupplier.get('id');
                let phoneNumber = foundSupplier.get('phoneNumber');
        
                console.log('supplier_id route =>', supplier_id)
                console.log('phoneNumber route =>', phoneNumber)
        
                const accessToken = generateJWT(foundSupplier.toJSON(), process.env.ACCESS_TOKEN_SECRET, "3hr");
                const refreshToken = generateJWT(foundSupplier.toJSON(), process.env.REFRESH_TOKEN_SECRET, "7d");
                
                req.session.suppliers = {
                    id: foundSupplier.get('id'),
                    phoneNumber: foundSupplier.get('phoneNumber'),
                    studioShopName: foundSupplier.get('studioShopName'),
                    ipAddress: req.ip,
                    date: new Date(),
                }

                console.log('route here accessToken', accessToken)
                console.log('route here refreshToken', refreshToken)
                console.log('full session here', req.session)
                console.log('session here', req.session.suppliers)

                res.json({
                    "accessToken": accessToken, "refreshToken": refreshToken, "supplier_id": req.session.suppliers.id, "phoneNumber": phoneNumber,
                    "studioShopName" : req.session.suppliers.studioShopName
                })
            } else {
                res.status(403).send("Supplier not found")
            }
        } catch (error){
            console.error("Fail to sign JWT", error)
            res.status(500).send("authentication failed")
        }
    } catch (error){
        console.error("Unable to retrieve Supplier", error)
        res.status(500).send("Internal server error")
    }
})

router.post('/register', async(req, res)=>{

    console.log('register route hit')
    let foundSupplier = await suppliers.where({
    'studioShopName' : req.body.studioShopName,
    'zhiFuVerification' : req.body.zhiFuVerification,
    'wxId' : req.body.wxId,
    'phoneNumber': req.body.phoneNumber,
    'password': getHashedPassword(req.body.password)
    }).fetch({
        require: false
    });

    console.log('is there foundSupplier', foundSupplier)

    if (foundSupplier){
        res.status(400).send("Phone Number already in use");    

    } else {
        const newSupplier = new suppliers();
        console.log('creating new Supplier, payload here=>', req.body)
        try {
            newSupplier.set('studioShopName', req.body.studioShopName)
            newSupplier.set('zhiFuVerification', req.body.zhiFuVerification)
            newSupplier.set('wxId', req.body.wxId)
            newSupplier.set('phoneNumber', req.body.phoneNumber)
            newSupplier.set('password', getHashedPassword(req.body.password))
            await newSupplier.save();
            console.log('new supplier saved')
            res.status(202).send('registration success');
        } catch (error){
            res.status(500).send('server is down')
        }
    }
})

router.get('/dashboard/:supplierId', [checkSupplierAuthenticationWithJWT], async(req, res)=>{

    console.log('dashboard get route hit')
    console.log('req supplier id here', req.suppliers.id)

    if (req.suppliers.id == req.params.supplierId){

        console.log('passed supplier basic authorization')

        try{

            let supplier = await findSupplierById(req.params.supplierId)
            console.log(supplier.get('studioShopName'));
            let supplierProducts = await findProductsByStudioShopName (supplier.get('studioShopName'))
            console.log(supplierProducts);
            if (supplierProducts.length > 0){

                res.json({"products":supplierProducts})

            } else {

                res.status(204).json({error: "No products found"})
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Failed to fetch products"})
        }
    } else {
        res.status(401).json({error: 'unauthorized user'})
    }
})

router.post('/add-product/:supplierId', [checkSupplierAuthenticationWithJWT], async(req,res)=>{

    if (req.suppliers.id == req.params.supplierId){

        try{
            console.log('Req.body is here', req.body)
            await postNewSupplierProduct(req.body);
            res.status(200).send('successfully added product')
        } catch (error) {
            res.status(400).send('Failed to post new product')            
        }
    } else {
        res.status(403).send('supplier not authorized for this action')
    }
})

router.get('/:productId/products', [checkSupplierAuthenticationWithJWT], async(req,res)=>{
   
    console.log("supplier single product route hit, req.query here =>", req.query.supplierId)
    console.log("req.suppliers.id", req.suppliers.id)

    let supplierId = parseInt(req.query.supplierId)

    if (req.suppliers.id === supplierId){

        console.log('passed authorization check');

        const productId = req.params.productId
        console.log('product Id here =>', productId)

        try{
            let product = await findProductById(productId)

            res.json({'product': product.toJSON()});
        } catch (error){
            res.status(204).send("Error verifying supplier, please try again")
        }
    } else {
        res.status(401).send("Supplier not authorized to view page")
    }
})

router.get('/update/:productId', [checkSupplierAuthenticationWithJWT], async(req,res)=>{

    console.log('update get route hit', req.query.supplierId, "req.suppliers.id =>", req.suppliers.id)

    let supplierId = parseInt(req.query.supplierId);

    if (req.suppliers.id === supplierId){

        const productId = req.params.productId;

        try{
            const product = await findProductById(productId);
            res.json({"product": product.toJSON()})

        } catch (error){
            res.status(400).send('product not found')
        }
    } else {
        res.status(401).send('supplier not authorized to view')
    }
}
)

router.post('/:productId/update', [checkSupplierAuthenticationWithJWT], async(req,res)=>{

    console.log("user single update route hit, req.query here =>", req.query.supplierId)
    console.log("req.suppliers.id at update", req.suppliers.id)

    let supplierId = parseInt(req.query.supplierId)

    if (req.suppliers.id === supplierId){
        let payload = req.body

        console.log('update route authorization achieved')
        try {
            await updateSupplierProduct(payload)
            console.log('successful update here')
        } catch (error){
            res.status(400).send('Bad request from user')
        }
        res.status(200).send("Product update success");
    } else {
        res.status(401).send('supplier not authorized to view page')
    }
})

router.post('/:productId/delete', [checkSupplierAuthenticationWithJWT], async(req,res)=>{

    console.log('delete route hit for user')

    let supplierId = parseInt(req.query.supplierId)

    if (req.suppliers.id === supplierId){

        let productId = req.params.productId;

        try{
            console.log('supplier finding product for deletion')

            const product= await findProductById(productId);
            console.log('item to be deleted', product.toJSON());

            await product.destroy();
            console.log('item deleted');

            res.status(204).send("Item deleted, no regrets right?")
        } catch (error){
            res.status(400).send('fail to delete item')
        }
    } else {
        res.status(401).send('action not authorized')
    }
})

router.get('/check-login', [checkSupplierAuthenticationWithJWT], (req,res)=>{
    if (req.suppliers){
        console.log('jwt has not expired')
        res.status(200).send('user is authenticated')
    } else {
        res.status(401).send('please login again')
    }
})



module.exports = router;