const orderDataAccess = require('../data-access-layer/orders');



const retrieveAllOrders = async () => {
    await orderDataAccess.retrieveAllOrders();
}

const retrieveOrderByCustomerId = async (customer_id) => {
    await orderDataAccess.retrieveOrderByCustomerId(customer_id);
}

const  retrieveOrderByOrderId = async (order_id) => {
    await orderDataAccess.retrieveOrderByOrderId(order_id);
}

const deleteOrder = async (order_id) => {
    await orderDataAccess.deleteOrder(order_id);
}

const removeOrder = async (order_id, productVersion_id) => {
    await orderDataAccess.removeOrder(order_id, productVersion_id);
}

const createNewOrder = async (payload) => {
    await orderDataAccess.createNewOrder(payload);
}

const retrieveOrderByProductVersionIdAndSupplierId = async (supplier_id, productVersion_id) => {
    let retrievedOrders = await orderDataAccess.retrieveOrderByProductVersionIdAndSupplierId(supplier_id, productVersion_id)
    return retrievedOrders;
}

const retrieveOrderByOrderIdAndProductVersionId  = async (order_id, productVersion_id) => {
    let retrievedOrders = await orderDataAccess.retrieveOrderByOrderIdAndProductVersionId(order_id, productVersion_id)
    return retrievedOrders;
}


module.exports =    {
    retrieveAllOrders,
    retrieveOrderByCustomerId,
    retrieveOrderByOrderId,
    deleteOrder,
    retrieveOrderByProductVersionIdAndSupplierId,
    removeOrder,
    createNewOrder,
    retrieveOrderByOrderIdAndProductVersionId
}

