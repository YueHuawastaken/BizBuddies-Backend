const { default: knex } = require('knex');
const { suppliers , products, productVersion } = require('../models');
// const router = require('../routes/suppliers');
const { checkSupplierAuthenticationWithJWT } = require('../middleware');


const findSupplierById = async (supplier_id) => {
    console.log('findSupplierById dal hit');
    try{
        const supplierFoundById = await suppliers.where({
            'id': supplier_id
        }).fetch()
    //     .map(suppliers=> [suppliers.get('studioShopName'), suppliers.get( 'zhiFuVerification'),
    // suppliers.get('phoneNumber'), suppliers.get('wxId'), suppliers.get('password')])
        return supplierFoundById;
    } catch (error){
        console.error('error finding supplier by Id', error)
    }
}

const addSupplierProductListing = async (payload) => {

    console.log('route hit for addSupplierProduct')

    try{
        let productId;
        try {
            const productFoundById = await products.where({
                'productName': payload.productName
            }).fetch();
            productId = productFoundById.get('id')
        } catch (error) {
            console.log("New Product");
            const product = new products();
            // product.set('product_id', payload.product_id)
            product.set('productName', payload.productName);
            product.set('description', payload.description);

            // Save the product
            await product.save();
            productId = product.get('id');
            console.log('Product:', product.toJSON());
        }

        // Create a new product version
        const newproductVersion = new productVersion();
        newproductVersion.set('product_id', productId);
        newproductVersion.set('versionName', payload.versionName);
        newproductVersion.set('image_url', payload.image_url);
        newproductVersion.set('price', payload.price);
        newproductVersion.set('supplier_id', payload.supplier_id);
        console.log("what is payload.supplierId", payload.supplier_id)
        // Save the new product version
        await newproductVersion.save();
        console.log('Success: Product and Product Version saved');
        console.log('Product Version:', newproductVersion.toJSON());
    } catch (error) {
        console.error('Error: Failed to save product and product version', error);
    }
};
//         try{
          
//             const productId = product.get('id');
//             const supplierId = newproductVersion.get('supplier_id')
//             newproductVersion.set('product_id',  productId);
//             newproductVersion.set('supplier_id', supplierId);

//             await newproductVersion.save()
//             console.log('success save product', product.toJSON())
//             console.log('success save productVersion', newproductVersion.toJSON())
//         } catch (error) {
//             console.log('fail to save products', error)
//         }
//     } catch (error) {
//         console.error('error adding product listing', error)
//     }
// }

const updateSupplierProductListing = async (payload,product_id) => {

    console.log('route hit for addSupplierProduct, payload here', payload, product_id)

    try {
        // Fetch the product by its ID
        const productFoundById = await products.where({
            'id': product_id
        }).fetch({
            require: true,
            withRelated: ['productVersion']
        });

        // Update the product details
        productFoundById.set('productName', payload.productName);
        productFoundById.set('description', payload.description);
        await productFoundById.save();
        // const productVersion = productFoundById.related('productVersion').first();
        const updateProductVersion = await productVersion.where({
            id: payload.productVersion_id
        }).fetch({
            require: true,
        });
        // Update the product version details
        updateProductVersion.set('versionName', payload.versionName);
        updateProductVersion.set('image_url', payload.image_url);
        updateProductVersion.set('price', payload.price);
        // Ensure that payload.supplier_id is a valid supplier ID and set it
        if (payload.supplier_id) {
            updateProductVersion.set('supplier_id', payload.supplier_id);
        }

        // Save the changes to the product version
        await updateProductVersion.save();

        console.log('Success: Product and Product Version updated');
        console.log('Product:', productFoundById.toJSON());
        console.log('Product Version:', updateProductVersion.toJSON());
    } catch (error) {
        console.error('Error: Failed to update product listing', error);
    }

        // Save the changes to the product and product version
    //     await productVersion.save();

    //     console.log('Success: Product and Product Version updated');
    //     console.log('Product:', productFoundById.toJSON());
    //     console.log('Product Version:', productVersion.toJSON());
    // } catch (error) {
    //     console.error('Error: Failed to update product listing', error);
    // }
    // const productFoundById = await products.where({
    //     'product_id': payload.product_id
    // }).fetch({
    //     require:true,
    //     withRelated: ['productVersion', 'productVersion.suppliers'
    //     ]
    // })

    // try{
    //     productFoundById.set('productName',  payload.productName);
    //     productFoundById.set('description',  payload.description);
    //     productFoundById.set('versionName',  payload.versionName);
    //     productFoundById.set('image_url',  payload.image_url);
    //     productFoundById.set('price',  payload.price);
    //     productFoundById.set('supplier_id',  payload.supplier_id);

    //     const productId = payload.product_id;

    //     const insertData = productId.map(product_id => ({
    //         "product_id": parseInt(product_id),
    //     })
    //     )


    //     console.log('insertData here', insertData)
        
    //     try{
    //         await productFoundById.save();
    //         console.log('success save product', productFoundById.toJSON())
    //     } catch (error) {
    //         console.log('failed to save update on product', error)
    //     }

    // } catch (error) {
    //     console.error('error updating product listing', error)
    // }
}




module.exports = {findSupplierById, addSupplierProductListing, updateSupplierProductListing};