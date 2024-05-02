const express = require('express');
const router = express.Router();
const orderService = require('../service-layer/order-service');
const { checkUserAuthenticationWithJWT } = require('../middleware');

router.get('/', [checkUserAuthenticationWithJWT], async(req,res)=>{

    let userId = parseInt(req.query.userId)

    if (req.user.id === userId){

        try{
            let allUserOrders = await orderService.retrieveOrdersByUserIdAndPaidStatus(req.user.id)
            res.status(200).json({'userOrders': allUserOrders.toJSON()})
        } catch (error) {
            res.status(204).send('No orders fetched')
        }
    } else {
        res.status(401).send('User not authorized')
    }
})

router.post('/checkout', [checkUserAuthenticationWithJWT], async(req,res)=>{

    if (req.user.id === parseInt(req.query.userId)){

        try{
            let orderId = await orderService.assignOrderNumber();
            let payload = req.body;

            payload = payload.map((item) => ({...item, "order_id": parseInt(orderId)}))

            console.log('cart payload to order route here', payload);

            await orderService.createNewOrder(payload);
            res.status(200).json({"order_id": orderId})
            
        } catch (error) {
            res.status(400).send('Fail to update orders')
        }
    } else {
        res.status(401).send('User not authorized')
    }
})




module.exports = router;