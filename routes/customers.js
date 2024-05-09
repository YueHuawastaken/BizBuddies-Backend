const express = require('express');
const router = express.Router();

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const {customers} = require('../models');


const {getProductVersionsBySupplier, findProductById} = require('../service-layer/products-service');
const {retrieveOrderByCustomerId} = require('../service-layer/orders-service');
const {retrieveCustomerCartItems} = require('../service-layer/carts-service');

const { checkCustomerAuthenticationWithJWT } = require('../middleware');
const session = require('express-session');

const generateJWT = (customers, tokenSecret, expirationTime) => {
    return jwt.sign({
        'phoneNumber': customers.phoneNumber,
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
        let foundCustomer = await customers.where({
            phoneNumber: req.body.phoneNumber,
            password: getHashedPassword(req.body.password)
        }).fetch({
            require: false
        });

        try {
            if (foundCustomer){

                let customer_id = foundCustomer.get('id');
                let phoneNumber = foundCustomer.get('phoneNumber');
        
                console.log('customer_id route =>', customer_id)
                console.log('phoneNumber route =>', phoneNumber)
        
                const accessToken = generateJWT(foundSupplier.toJSON(), process.env.ACCESS_TOKEN_SECRET, "3hr");
                const refreshToken = generateJWT(foundSupplier.toJSON(), process.env.REFRESH_TOKEN_SECRET, "7d");
                
                req.session.customers = {
                    id: foundCustomer.get('id'),
                    phoneNumber: foundCustomer.get('phoneNumber'),
                    studioShopName: foundSupplier.get('studioShopName'),
                    ipAddress: req.ip,
                    date: new Date(),
                }

                console.log('route here accessToken', accessToken)
                console.log('route here refreshToken', refreshToken)
                console.log('full session here', req.session)
                console.log('session here', req.session.customers)

                res.json({
                    "accessToken": accessToken, "refreshToken": refreshToken, "supplier_id": req.session.customers.id, "phoneNumber": phoneNumber,
                    "userName" : req.session.customers.userName
                })
            } else {
                res.status(403).send("Customer not found")
            }
        } catch (error){
            console.error("Fail to sign JWT", error)
            res.status(500).send("authentication failed")
        }
    } catch (error){
        console.error("Unable to retrieve Customer", error)
        res.status(500).send("Internal server error")
    }
})

router.post('/register', async(req, res)=>{

    console.log('register route hit')
    let foundCustomer = await customers.where({
    'userName' : req.body.userName,
    'email' : req.body.email,
    'phoneNumber': req.body.phoneNumber,
    'warehouseAddress' : req.body.warehouseAddress,
    'password': getHashedPassword(req.body.password)
    }).fetch({
        require: false
    });

    console.log('is there foundCustomer', foundCustomer)

    if (foundCustomer){
        res.status(400).send("Phone Number already in use");    

    } else {
        const newCustomer = new customers();
        console.log('creating new customer, payload here=>', req.body)
        try {
            newCustomer.set('userName', req.body.userName)
            newCustomer.set('email', req.body.email)
            newCustomer.set('phoneNumber', req.body.phoneNumber)
            newCustomer.set('warehouseAddress', req.body.warehouseAddress)
            newCustomer.set('password', getHashedPassword(req.body.password))
            await newCustomer.save();
            console.log('new customer saved')
            res.status(202).send('registration success');
        } catch (error){
            res.status(500).send('server is down')
        }
    }
})

router.get('/dashboard/:customerId', [checkSupplierAuthenticationWithJWT], async(req, res)=>{

    console.log('dashboard get route hit')
    console.log('req customer id here', req.customers.id)

    if (req.customers.id == req.params.customerId){

        console.log('passed customer basic authorization')

        try{

            let customer = await findCustomerById(req.params.customerId)
            console.log(customer.get('userName'));
            let customerOrders = await retrieveOrderByCustomerId (customer.get('customer_id'))
            console.log(customerOrders);
            if (customerOrders.length > 0){

                res.json({"orders":customerOrders})

            } else {

                res.status(204).json({error: "No orders found"})
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Failed to fetch orders"})
        }
    } else {
        res.status(401).json({error: 'unauthorized user'})
    }
})

router.get('/check-login', [checkCustomerAuthenticationWithJWT], (req,res)=>{
    if (req.user){
        console.log('jwt has not expired')
        res.status(200).send('user is authenticated')
    } else {
        res.status(401).send('please login again')
    }
})

module.exports = router;