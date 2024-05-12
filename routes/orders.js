const express = require('express');
const router = express.Router();
const orderService = require('../service-layer/orders-service');
const { checkCustomerAuthenticationWithJWT } = require('../middleware');

router.get('/:customerId', [checkCustomerAuthenticationWithJWT], async(req,res)=>{

    let customer_id = parseInt(req.params.customerId)

    if (req.customers.id === customer_id){

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

router.post('/:customerId/checkout', [checkCustomerAuthenticationWithJWT], async(req,res)=>{

    if (req.customers.id === parseInt(req.params.customerId)){

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