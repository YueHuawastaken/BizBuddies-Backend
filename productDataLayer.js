const { getConnection } = require("./sql");

async function getAllProducts() {
    const connection = await getConnection();
    console.log(connection)
    // the [ ] is known as array destructuring
    let [products] = await connection.execute(`
    SELECT * FROM Products JOIN
    ProductVersion ON Products.product_id = ProductVersion.product_id
    ORDER BY productName, productVersion_id
    `);
    // is the same as:
    // let customers = await connection.execute("SELECT * FROM Customers")[0];
    return products;

}

async function addProduct(productName, description) {

    const connection = getConnection();

    // create the query
    const query = `INSERT INTO Products (productName, description)
    VALUES (?,?);`

    // get the query to test
    // res.send(query);

    const [response] = await connection.execute(query, [productName, description]);
    const insertId = response.insertId; // id of the newly created customer

    // ADD IN M:N relationship after the creating the row
    // We have to do so because the primary key is only available after the insert
    return insertId;
}

async function addProductVersion(product_id, image_url, versionName, price) {

    const connection = getConnection();

    // create the query
    const query = `INSERT INTO ProductVersion (product_id, image_url, versionName, price)
    VALUES (?,?,?,?);`

    // get the query to test
    // res.send(query);

    const [response] = await connection.execute(query, [product_id, image_url, versionName, price]);
    const insertId = response.insertId; // id of the newly created customer

    // ADD IN M:N relationship after the creating the row
    // We have to do so because the primary key is only available after the inser
     return insertId;
}

async function deleteProduct(productId) {
    console.log("DAL hit")
    const connection = getConnection();
    // check if the customerId in a relationship with an employee
    const query1 = `DELETE FROM ProductVersion WHERE ProductVersion.product_id = ?`
    const query2 = `DELETE FROM Products WHERE Products.product_id = ? `;
    await connection.execute(query1, [productId]);
    await connection.execute(query2, [productId]);
    return {
        'success': true,
        'message': 'Product has been deleted'
    }
}
async function deleteProductVersion(VersionId) {
    const connection = getConnection();
    // check if the customerId in a relationship with an employee
    const query = `DELETE FROM ProductVersion WHERE productVersion_id = ?`;
    await connection.execute(query, [VersionId]);
    return {
        'success': true,
        'message': 'Product has been deleted'
    }
}

async function updateProduct(productId, newProduct) {
    const connection = getConnection();
    
    console.log("DAL product here", productId, newProduct);
    const {productName, description, versionName, price, image_url} = newProduct;

    const query1 = `UPDATE Products SET productName=?,
    description=?
    WHERE product_id = ${productId};`
    const query2 = `UPDATE ProductVersion SET versionName=?,
    price=?,
    image_url=?
    WHERE product_id = ${productId};`

  
    // update the customer first
    await connection.execute(query1, [productName, description]);
    await connection.execute(query2, [versionName, price, image_url]);
 
    return {
        'success': true,
        'message': 'Product has been updated'
    }
    // 1. update the relationship by first DELETE all M:N relationships
   // same as `const employees = req.body.employees`
 

}

module.exports = { getAllProducts, addProduct, addProductVersion, deleteProduct, deleteProductVersion, updateProduct}