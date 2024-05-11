const express = require('express');
const router = express.Router();
const cartService = require('../service-layer/carts-service');
const { checkCustomerAuthenticationWithJWT } = require('../middleware');

router.get('/:cartId/:customerId', [checkCustomerAuthenticationWithJWT], async(req,res)=>{

    console.log('route hit for customer cart get')

    let customerId = parseInt(req.params.customerId);
    let cart_id = parseInt(req.params.cartId);
    console.log('customerId here', customerId);
    console.log('cartId here', cart_id);
    console.log('customerId here', req.customers.id);

    if (req.customers.id === customerId){
        console.log('customer passed cart jwt authorization');     

        try {
            const itemsInCart = await cartService.retrieveCustomerCartItems(cart_id);
       
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


router.post('/:cartId/:productVersionId/:customerId/deleteItem', [checkCustomerAuthenticationWithJWT], async(req,res)=>{

    console.log('delete entry route hit')

    let customer_id = parseInt(req.params.customerId);
    console.log(customer_id)
    let cart_id = parseInt(req.params.cartId);
    console.log(cart_id)
    const productVersion_id = parseInt(req.params.productVersionId)
    console.log(productVersion_id)

    if (req.customers.id === customer_id){
        try{
            await cartService.removeEntryFromCart(customer_id, cart_id, productVersion_id);
            res.status(204).send("Delete successful")
        } catch (error){
            res.status(400).send('fail to delete entry')
        }
    } else {
        res.status(401).send("login to try again");
    }
})




module.exports = router;


