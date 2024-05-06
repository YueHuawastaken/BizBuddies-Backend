const { default: knex } = require('knex');
const { customers , products, productVersion } = require('../models');
// const router = require('../routes/suppliers');
const { checkUserAuthenticationWithJWT } = require('../middleware');


const findCustomerById = async (customer_id) => {
    console.log('findCustomerById dal hit');
    try{
        const customerFoundById = await customers.where({
            'id': customer_id
        }).fetchAll().map(customers=> [customers.get('userName'), customers.get( 'email'),
        customers.get('phoneNumber'), customers.get('warehouseAddress'), customers.get('password')])
        return customerFoundById;
    } catch (error){
        console.error('error finding customer by Id', error)
    }
}




module.exports = {findCustomerById};