const { default: knex } = require('knex');
const { suppliers , products, productVersion } = require('../models');
// const router = require('../routes/suppliers');
const { checkUserAuthenticationWithJWT } = require('../middleware');


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
        const product = new products();
        product.set('productName',  payload.productName);
        product.set('description',  payload.description);
        const newproductVersion = new productVersion();
        newproductVersion.set('versionName',  payload.versionName);
        newproductVersion.set('image_url',  payload.image_url);
        newproductVersion.set('price',  payload.price); 
        newproductVersion.set('supplier_id',  payload.supplier_id)
        try{
            await product.save();
            newproductVersion.set('product_id',  product.get('id'));
            await newproductVersion.save()
            console.log('success save product', product.toJSON())
        } catch (error) {
            console.log('fail to save products', error)
        }
    } catch (error) {
        console.error('error adding product listing', error)
    }
}

const updateSupplierProductListing = async (payload) => {

    console.log('route hit for addSupplierProduct, payload here', payload)

    const productFoundById = await products.where({
        'id': payload.productId
    }).fetch({
        require:true,
        withRelated: ['productVersion', 'productVersion.suppliers'
        ]
    })

    try{
        productFoundById.set('productName',  payload.productName);
        productFoundById.set('description',  payload.description);
        productFoundById.set('versionName',  payload.versionName);
        productFoundById.set('image_url',  payload.image_url);
        productFoundById.set('price',  payload.price);
        productFoundById.set('studioShopName',  payload.studioShopName);

        const productId = payload.productId;

        const insertData = productId.map(productId => ({
            "product_id": parseInt(productId),
        })
        )


        console.log('insertData here', insertData)
        
        try{
            await productFoundById.save();
            console.log('success save product', productFoundById.toJSON())
        } catch (error) {
            console.log('failed to save update on product', error)
        }

    } catch (error) {
        console.error('error updating product listing', error)
    }
}




module.exports = {findSupplierById, addSupplierProductListing, updateSupplierProductListing};