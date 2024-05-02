const express = require('express');
const router = express.Router();
const cartService = require('../service-layer/carts-service');
const { checkUserAuthenticationWithJWT } = require('../middleware');

router.get('/', [checkUserAuthenticationWithJWT], async(req,res)=>{

    console.log('route hit for customer cart get')

    let customerId = parseInt(req.query.customerId);
    let cartId = parseInt(req.query.cartId);
    console.log('customerId here', customerId);
    console.log('cartId here', cartId);
    console.log('customerId here', req.customers.id);

    if (req.customers.id === customerId){
        console.log('customer passed cart jwt authorization');     

        try {
            const itemsInCart = await cartService.retrieveCustomerCartItems(cartId);
       
            if (itemsInCart.length>0){
                res.status(201).json({"itemsInCart": itemsInCart.toJSON()});
            } else {
                res.status(200).json({"itemsInCart": ''})
            }
        } catch (error) {
            res.status(204).send('No items found in cart');
        }
    } else {
        res.status(401).send("Unauthorized, log in to view page");
    }
})


router.post('/deleteItem', [checkUserAuthenticationWithJWT], async(req,res)=>{

    console.log('delete entry route hit')

    const customerId = parseInt(req.query.customerId);
    const cartId = parseInt(req.query.cartId);
    const productVersionId = parseInt(req.query.productVersionId)

    if (req.customers.id === customerId){
        try{
            await cartService.removeEntryFromCart(customerId, cartId, productVersionId);
            res.status(204).send("Delete successful")
        } catch (error){
            res.status(400).send('fail to delete entry')
        }
    } else {
        res.status(401).send("login to try again");
    }
})




module.exports = router;


