const { knex } = require('knex');
const { customers , products, productVersion } = require('../models');
// const router = require('../routes/suppliers');
const { checkCustomerAuthenticationWithJWT } = require('../middleware');


const findCustomerById = async (customer_id) => {
    console.log('findCustomerById dal hit');
    try{
        const customerFoundById = await customers.where({
            'id': customer_id
        }).fetch()  
        return customerFoundById;
    } catch (error){
        console.error('error finding customer by Id', error)
    }
}




module.exports = {findCustomerById};