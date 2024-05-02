const supplierDataAccess = require('../data-access-layer/suppliers');

const postNewSupplierProduct = async (payload) => {
    await supplierDataAccess.addSupplierProductListing(payload);
}

const updateSupplierProduct = async (payload) => {
    await supplierDataAccess.updateSupplierProductListing(payload);
}

module.exports = {postNewSupplierProduct, updateSupplierProduct};