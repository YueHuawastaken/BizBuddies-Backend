const {carts} = require('../models');
const { knex } = require('../bookshelf');

const retrieveAllCarts = async () => {
    try{
        const allCarts = await carts.collection().fetch({
            'require': false
        })
        return allCarts;
    } catch (error) {
        console.error('failed to retrieve all carts', error);
    }
}

const retrieveSingleCartItem = async (cart_id) => {

    try{
        let cartItem = await carts.collection().where({'id': cart_id}).fetch({
            'require':false
        })  
        return cartItem;
    } catch (error){
        console.error('error retrieving cart items', error)
    }
}

const deleteCart = async (cart_id) => {
    try{
        const customerCart = await retrieveSingleCartItem(cart_id);
        await customerCart.destroy();
    } catch (error) {
        console.error('fail to delete customer cart', error)
    }
}

const fetchCartItemByCustomerAndProductVersion = async (customer_id, cart_id, productVersion_id) => {
    try{
        const foundCartItem = await carts.where({
            'customer_id': customer_id,
            'id': cart_id,
            'productVersion_id': productVersion_id
        }).fetch({
            require: false
        })
        return foundCartItem;
    } catch (error){
        console.error('error fetching cart item by id and product', error)
    }
}

const createNewCartItem = async (payload) => {

    console.log('create new cart item dal here. Payload=>', payload)

    const currentDate = new Date();
    
    try{
        const newCartItem = new carts()
        newCartItem.set('cart_id', payload.cart_id);
        newCartItem.set('customer_id', payload.customer_id);
        newCartItem.set('productVersion_id', payload.productVersion_id);
        newCartItem.set('productName', payload.productName);
        newCartItem.set('description', payload.description);
        newCartItem.set('versionName', payload.versionName);
        newCartItem.set('image_url', payload.image_url);
        newCartItem.set('price', payload.price);
        newCartItem.set('date_time', currentDate);
        

        await newCartItem.save();

    } catch (error) {
        console.error('error creating cart item', error)
    }
}

const removeEntryFromCart = async (customer_id, cart_id, productVersion_id) => {
    try{
        const cartItemForDeletion = await fetchCartItemByCustomerAndProductVersion(customer_id, cart_id, productVersion_id);
        console.log(cartItemForDeletion)
        if (cartItemForDeletion) {
            await cartItemForDeletion.destroy();
            console.log("Cart item deleted successfully.");
        } else {
            console.log("No cart item found for deletion.");
        }
    } catch (error) {
        console.error('Failed to delete cart item', error);
    }
}
    //     await cartItemForDeletion.destroy();
    // } catch (error) {
    //     console.error('failed to delete cart item', error)
    // }


const removeEntireCart = async (cart_id) => {
    try{
        const cartForDeletion = await retrieveSingleCartItem(cart_id);
        await cartForDeletion.destroy();
    } catch (error) {
        console.error('failed to delete cart item', error)
    }
}

module.exports = {
                    retrieveAllCarts,
                    deleteCart,
                    retrieveSingleCartItem,
                    fetchCartItemByCustomerAndProductVersion,
                    createNewCartItem,  
                    removeEntryFromCart,
                    removeEntireCart
}
