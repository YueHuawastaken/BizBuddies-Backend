const express = require('express');
const cors = require('cors');
const { connectToDB, getConnection } = require('./sql');
const { getAllProducts, addProduct, deleteProduct, deleteProductVersion, updateProduct} = require('./productDataLayer');
const productCrud = require('./productCrudLayer');
require('dotenv').config();

const app = express();

// RESTFUL API
app.use(cors()); // enable cross origin resources sharing
app.use(express.json()); // enable sending back responses as JSON
                         // and reciving data as JSON

async function main() {

    await connectToDB(
        process.env.DB_HOST,
        process.env.DB_USER,
        process.env.DB_DATABASE,
        process.env.DB_PASSWORD
    );

    const connection = getConnection();

    app.get('/api/products', async function(req,res){
        const products = await productCrud.getAllProducts();
        res.json({
            'products': products
        })
    });

    app.post('/api/products', async function(req,res){
        // We can use object destructuring to quickly do the following:
        // const first_name = req.body.first_name;
        // const last_name = req.body.last_name;
        // const rating = req.body.rating;
        // const company_id = req.body.company_id;

        // Object Destructuring
        const {productName, description, image_url,  versionName,  price} = req.body;
        const results = await productCrud.addNewProduct( productName, description, image_url,  versionName,  price)
        
        if (results.success) {
            res.json({
                'new_product_id': results.insertId
            })
        } else {
            res.json(400);
            res.json(results);
        }
      
   
    })

    app.delete('/api/products/:productId', async function(req,res){
        const {productId} = req.params;
        const results = await deleteProduct(productId);
        if (results.success) {
            res.status(200);
            res.json(results);
        } else {
            res.status(400);
            res.json(results);
        }
    })

    app.delete('/api/products/version/:versionId', async function(req,res){
        const {versionId} = req.params;
        
        const results = await deleteProductVersion (versionId);
        if (results.success) {
            res.status(200);
            res.json(results);
        } else {
            res.status(400);
            res.json(results);
        }
    })

    app.put('/api/products/:productId', async function(req,res){
        const {productId} = req.params;
       
        await updateProduct(productId, {...req.body});
        res.json({
            'message':"The product has been updated successfully"
        });
        
    })

    // , {...req.body}
    // app.put('/api/products/version/:versionId', async function(req,res){
    //     const {versionId} = req.params;
       
    //     await updateProduct(versionId, {...req.body});
    //     res.json({
    //         'message':"The product has been updated successfully"
    //     });
        
    // })

}

main();



app.listen(3000, function(){
    console.log("server has started");
})