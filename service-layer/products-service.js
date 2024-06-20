const productsDataAccess = require('../data-access-layer/products');

const retrieveAllProducts = async () => {
    let products = await productsDataAccess.retrieveAllProducts();
    return products;
}

const retrieveAllProductVersion = async () => {
    let productVersion = await productsDataAccess.retrieveAllProductVersion();
    return productVersion;
}

const retrieveAllSuppliers = async () => {
    let suppliers = await productsDataAccess.retrieveAllSuppliers();
    return suppliers;
}

const findProductById = async (productId) => {
    let product = await productsDataAccess.findProductById(productId);
    return product;
}

const findProductVersionById = async (productId) => {
    let product = await productsDataAccess.findProductVersionById(productId);
    return product;
}

const getProductVersionsBySupplier = async (supplier_id) => {
    let product = await productsDataAccess.getProductVersionsBySupplier(supplier_id);
    return product;
}

const addProductListing = async (productForm) => {
    let addProduct = await productsDataAccess.addProductListing(productForm);
    return addProduct;
}

const searchProductsBySearchForm = async (payload) => {
    let searchedProducts = await productsDataAccess.searchProductsBySearchForm(payload)
    return searchedProducts;
}

const getProductsBySupplier = async (supplier_id = 0) => {
    let product = await productsDataAccess.getProductsBySupplier(supplier_id);
    return product; 
}

module.exports= {
    retrieveAllProducts, retrieveAllProductVersion, retrieveAllSuppliers, findProductById, findProductVersionById,
    addProductListing, getProductVersionsBySupplier,searchProductsBySearchForm, getProductsBySupplier
                }