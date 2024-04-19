const data = require('./productDataLayer');


async function getAllProducts() {
    const products = await data.getAllProducts();
    return products;
}

async function addNewProduct(productName, description, image_url,  versionName,  price) {
    // check for product
    const insertId = await data.addProduct(productName, description);
    const result = await data.addProductVersion(insertId, image_url,  versionName,  price)
    return {
        'success': true,
        'insertId': insertId,
        'result' : result, 
    }

}

module.exports = { getAllProducts, addNewProduct};