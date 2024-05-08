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

const findProductById = async (product_Id) => {
    let product = await productsDataAccess.findProductById(product_Id);
    return product;
}

const findProductsByStudioID = async (studioShopName) => {
    let product = await productsDataAccess.getProductVersionsBySupplier(studioShopName);
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

module.exports= {
    retrieveAllProducts, retrieveAllProductVersion, retrieveAllSuppliers, findProductById, 
    addProductListing, findProductsByStudioID,searchProductsBySearchForm
                }