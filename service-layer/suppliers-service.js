const supplierDataAccess = require('../data-access-layer/suppliers');

const postNewSupplierProduct = async (payload) => {
    await supplierDataAccess.addSupplierProductListing(payload);
}

const updateSupplierProduct = async (payload, product_id) => {
    await supplierDataAccess.updateSupplierProductListing(payload, product_id);
}

module.exports = {postNewSupplierProduct, updateSupplierProduct};