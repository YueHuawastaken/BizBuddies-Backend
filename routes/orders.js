const express = require('express');
const router = express.Router();
const orderService = require('../service-layer/orders-service');
const { checkUserAuthenticationWithJWT } = require('../middleware');

router.get('/', [checkUserAuthenticationWithJWT], async(req,res)=>{

    let customerId = parseInt(req.query.customerId)

    if (req.customers.id === customerId){

        try{
            let allCustomerOrders = await orderService.retrieveOrderByCustomerId(req.customers.id)
            res.status(200).json({'customerOrders': allCustomerOrders.toJSON()})
        } catch (error) {
            res.status(204).send('No orders fetched')
        }
    } else {
        res.status(401).send('User not authorized')
    }
})

router.post('/checkout', [checkUserAuthenticationWithJWT], async(req,res)=>{

    if (req.customers.id === parseInt(req.query.customerId)){

        try{
            let payload = req.body;

            payload = payload.map((item) => ({...item, "order_id": parseInt(orderId)}))

            console.log('cart payload to order route here', payload);

            await orderService.createNewOrder(payload);
            res.status(200).json({"order_id": orderId})
            
        } catch (error) {
            res.status(400).send('Fail to update orders')
        }
    } else {
        res.status(401).send('Customer not authorized')
    }
})




module.exports = router;