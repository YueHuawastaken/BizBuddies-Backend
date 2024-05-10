const { knex } = require('../bookshelf');
const { orders }= require('../models');


const retrieveAllOrders = async () => {
    try{
        const allOrders = await orders.collection().fetch({
            'require': false        
        })
        return allOrders;
    } catch (error) {
        console.error('failed to retrieve all orders', error);
    }
}

const createNewOrder = async (payload) => {

    const currentDate = new Date();

    console.log('DAL payload from route', payload)

    try{
        for (let item of payload){
            let orderItem = new orders();
            orderItem.set('order_id', item.order_id);
            orderItem.set('productVersion_id', item.productVersion_id);
            orderItem.set('supplier_id', item.supplier_id);
            orderItem.set('customer_id', item.customer_id);
            orderItem.set('orderType', item.orderType);
            orderItem.set('totalPayable', item.totalPayable);
            orderItem.set('date_time', currentDate);
            await orderItem.save()
        }
    } catch (error){
        console.log('Fail create new order entry at DAL', error)
    }
}

const retrieveOrderByCustomerId = async (customer_id) => {
    try{
        const customerOrder = await orders
                        .where({'customer_id': customer_id})
                        .fetchAll({})
        return customerOrder;
    } catch (error){
        console.error('error retrieving customer order', error)
    }
}


const retrieveOrderByOrderId = async (order_id) => {
    try{
        const Order = await orders.collection().where({'order_id': order_id})
                        .fetch({
                            'require': false,
                        })
        return Order;
    } catch (error){
        console.error('error retrieving order by Id', error)
    }
}

const deleteOrder = async (order_id) => {
    try{
        const retrieveOrder = await retrieveOrderByOrderId(order_id);
        await retrieveOrder.destroy();
    } catch (error){
        console.error('failed to delete order', error);
    }
}

const retrieveOrderByProductVersionIdAndSupplierId = async (supplier_id, productVersion_id) => {
    try{
        const foundOrder = await orders.collection().where({
            'supplier_id': supplier_id,
            'productVersion_id': productVersion_id
        }).fetch({
            require: false
        })
        return foundOrder;
    } catch (error){
        console.error('error fetching order item by customer id, supplier id, and product version id', error)
    }
}

const retrieveOrderByOrderIdAndProductVersionId = async (order_id, productVersion_id) => {
    try{
        const foundOrder = await orders.collection().where({
            'order_id': order_id,
            'productVersion_id': productVersion_id
        }).fetch({
            require: false
        })
        return foundOrder;
    } catch (error){
        console.error('error fetching order item by order id and product version id', error)
    }
}


const removeOrder = async (order_id, productVersion_id) => {
    try{
        const orderForDeletion = await retrieveOrderByOrderIdAndProductVersionId(order_id, productVersion_id);
        console.log('Item pending deletion', orderForDeletion)

        await knex('orders').where({'order_id': order_id,
        'productVersion_id': productVersion_id}).del()

    } catch (error) {
        console.error('failed to delete order item', error)
    }
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
