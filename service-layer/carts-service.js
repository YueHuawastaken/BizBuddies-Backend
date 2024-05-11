const cartDataAccess = require('../data-access-layer/carts');

const retrieveAllCarts = async () => {
    await cartDataAccess.retrieveAllCarts();
}

const retrieveCustomerCartItems = async (cart_id) => {
    const cartItems = await cartDataAccess.retrieveSingleCartItem(cart_id);
    return cartItems;
}


const deleteCart = async (cart_id) => {
    await cartDataAccess.deleteCart(cart_id);
}



const removeEntryFromCart = async (customer_id, cart_id, productVersion_id) => {
    const cartItems = await cartDataAccess.removeEntryFromCart(customer_id, cart_id, productVersion_id);
    return cartItems;
}

module.exports =    {
                        retrieveAllCarts,
                        deleteCart,
                        retrieveCustomerCartItems,
                        removeEntryFromCart,
                    }