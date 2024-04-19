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
    const connection = getConnection();
    // check if the customerId in a relationship with an employee
    const query = `DELETE FROM Products WHERE product_id = ?`;
    await connection.execute(query, [productId]);
    return {
        'success': true,
        'message': 'Product has been deleted'
    }
}

async function updateProduct(productId, newProduct) {
    const connection = getConnection();
    const query = `UPDATE Products SET productName=?,
    description=?, 
    image_url=?,
    versionName=?
    price=?`
  
    // update the customer first
    const {first_name, last_name, rating, company_id} = newCustomer;
    console.log(first_name, last_name, rating, company_id);
    await connection.execute(query, [first_name, last_name, rating, company_id, customerId]);

    // 1. update the relationship by first DELETE all M:N relationships
    await connection.execute("DELETE FROM EmployeeCustomer WHERE customer_id = ?", [customerId]);

    // 2. add back the relationship that is selected by the user
    // ADD IN M:N relationship after the creating the row
    // We have to do so because the primary key is only available after the insert
    const { employees } = newCustomer; // same as `const employees = req.body.employees`

    let employeeArray = [];
    if (Array.isArray(employees)) {
        employeeArray = employees;
    } else {
        employeeArray.push(employees);
    }

    for (let employee_id of employeeArray) {
        await connection.execute(`INSERT INTO EmployeeCustomer (employee_id, customer_id) 
            VALUES (?, ?)
`, [employee_id, customerId])
    }
}

module.exports = { getAllProducts, addProduct, addProductVersion }