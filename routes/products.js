const express = require('express');
const router = express.Router();
const { bootstrapField, createProductForm, createSearchForm } = require('../forms'); 
const { retrieveAllProducts, retrieveAllProductVersion, findProductById, 
    addProductListing, findProductsByStudioID} = require("../service-layer/products-service");

router.get('/', async(req,res)=>{

    let products = await retrieveAllProducts();
    res.json({'products': products.toJSON()})
})

router.get('/:productId', async(req,res)=>{
    const productId = req.params.productId
    let product = await findProductById(productId)

    console.log('find product by id route hit', product)
    res.json({'product': product.toJSON()});
})

router.get('/suppliers/:supplierId', async(req,res)=>{
    let supplier_id = req.params.supplierId;
    let supplierProducts = await findProductsByStudioID(supplier_id);
    res.json({'products': supplierProducts.toJSON()})
})


router.get('/search', async(req,res)=>{

    let allProductVersion = await retrieveAllProductVersion();

    allProductVersion.unshift([0, '-------']);


    const searchForm = createSearchForm(allProductVersion);

    const query= products.collection();

    searchForm.handle(req, {
        'success': async (searchForm) => {
            console.log('search route hit')

            if (searchForm.data.productName) {
                console.log('search form name hit', searchForm.data.productName)
                query.where('productName', 'like', '%' + searchForm.data.productName + '%')
            }

            if (searchForm.data.suppliers) {
                console.log('search form supplier hit', searchForm.data.suppliers)

                query.query(qb => {
                    qb.join('suppliers', 'productVersion.supplier_id', 'suppliers.id');
                    qb.where('suppliers.studioShopName', 'like', '%' + searchForm.data.suppliers + '%');
                });                
            }

            if (searchForm.data.min_price) {
                console.log('search form min price hit', searchForm.data.min_price)
                query.where('price', '>=', searchForm.data.min_price)
            }

            if (searchForm.data.max_price) {
                console.log('search form max price hit', searchForm.data.max_price)
                query.where('price', '<=', searchForm.data.max_price)
            }

            const products = await query.fetch({
                withRelated:[{
                    'productVersion': (queryBuild) => {
                        queryBuild.select('id', 'versionName', 'image_url', 'price', )
                        }
                    },
                    {
                        'suppliers' : (queryBuild) => {
                            queryBuild.select('studioShopName')
                        }
                    }]
            })

            res.json({'products': products.toJSON()})
        },
        'empty': async (searchForm) => {

            const products = await query.fetch({
                withRelated:[{
                    'productVersion': (queryBuild) => {
                        queryBuild.select('id', 'versionName', 'image_url', 'price', )
                        }
                    },
                    {
                        'suppliers' : (queryBuild) => {
                            queryBuild.select('studioShopName')
                        }
                    }]
            })

            res.json({'products': products.toJSON()})
        }
    })
})

router.get('/add-product', async (req,res)=>{
    const allProductVersion = await retrieveAllProductVersion();
    const allProducts = await retrieveAllProducts();

    const form = createProductForm(allProductVersion, allProducts);
    res.json({
        'form': form.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloundinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET    
    })
})

router.post('/add-poster', async (req, res)=>{
    const allProductVersion = await retrieveAllProductVersion();
    const allProducts = await retrieveAllProducts();

    const form = createProductForm(allProductVersion, allProducts);

    form.handle(req, {
        "success": async (form) =>{
            let product = await addProductListing(form);

            if (form.data.productVersion){
                await product.productVersion().attach(form.data.productVersion.split(','));
            }
            res.status(201);
            res.json({"success": "New product created"});
        },
        "error": (form) => {
            res.json({
                'form': form.toHTML(bootstrapField)
            })
        },
        "empty": (form) =>{
            res.json({
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:productId/update', async(req,res)=>{
    const product_id = req.params.productId;
    const product = await findProductById(product_id)

    const allProductVersion = await retrieveAllProductVersion();
    const allProducts = await retrieveAllProducts();

    const form = createProductForm(allProductVersion, allProducts);

    form.fields.productName.value = await product.get('productName');
    form.fields.description.value = await product.get('description');
    form.fields.versionName.value = await product.get('versionName');
    form.fields.image_url.value = await product.get('image_url');
    form.fields.price.value = await product.get('price');
    form.fields.studioShopName.value = await product.get('studioShopName');

    res.json({
            'form': form.toHTML(bootstrapField),
            'product': product.toJSON(),
            cloudinaryName: process.env.CLOUDINARY_NAME,
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
            cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/:productId/update', async(req,res)=>{
    const product_id = req.params.productId;
    const product = await findProductById(product_id);

    const allProductVersion = await retrieveAllProductVersion();
    const allProducts = await retrieveAllProducts();

    const form = createProductForm(allProductVersion, allProducts);

    form.handle(req, {
        "success" : async (form) =>{
            let {... productData} = form.data;
            product.set(productData);
            await product.save();

            res.status(200);
            res.json({"success": "update product success"});
         },
         "error": (form)=>{
            res.json({
                'form': form.toHTML(bootstrapField),
                'products': product.toJSON()
            })
         },
         "empty": (form)=>{
            res.json({
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
         }
    })
})

router.post('/:productId/delete', async (req,res)=>{
    let product_id = req.params.productId;
    const product =await findProductById(product_id);

    await product.destroy();
    res.json({"success":"item deleted"});
})




module.exports = router;