const express = require('express');
const router = express.Router();

// Authentication
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// ORM relations
const { admin, products, suppliers, BlackListedToken, Session, carts, orders, productVersion } = require('../models');

// Forms
const { bootstrapField, 
        createLoginForm, 
        createProductForm, 
        createSearchForm, 
        createRegisterForm, 
        createSupplierSearchForm, 
        createSupplierProductsSearchForm,
        createCartSearchForm,
        createOrderSearchForm
     } = require('../forms'); 

// DAL logics with spare DAL methods for usage when not using DB query
const { retrieveAllProducts, retrieveAllProductVersion, retrieveAllSuppliers, findProductById, 
    addProductListing, getProductVersionsBySupplier,searchProductsBySearchForm } = require("../data-access-layer/products");
const { findSupplierById, addSupplierProductListing, updateSupplierProductListing } = require("../data-access-layer/suppliers");
const { retrieveAllOrders,
    retrieveOrderByCustomerId,
    retrieveOrderByOrderId,
    deleteOrder,
    retrieveOrderByProductVersionIdAndSupplierId,
    removeOrder,
    createNewOrder,
    retrieveOrderByOrderIdAndProductVersionId } = require("../data-access-layer/orders");
const { retrieveAllCarts,
    deleteCart,
    retrieveSingleCartItem,
    fetchCartItemByCustomerAndProductVersion,
    createNewCartItem,  
    removeEntryFromCart,
    removeEntireCart } = require("../data-access-layer/carts")

// Authentication
const {
    checkSessionAuthentication,
    checkAuthenticationWithJWT} = require('../middleware');

router.get("/register", (req, res)=>{
    const form = createRegisterForm();
    res.render('admin/register',{
        adminForm: form.toHTML(bootstrapField)
    })
})

// Register route is purely for testing
router.post("/register", (req, res)=>{

    const adminUserForm = createRegisterForm();

    adminUserForm.handle(req, {
            success: async (form) => {

                try {
                    const admin = new admin();

                    admin.set({
                        username: form.data.username,
                        password: getHashedPassword(form.data.password)
                    })
                    await admin.save();
                    req.flash("success", "Successful registration");
                    res.redirect('/admin/login');

                } catch (error) {
                    console.error("fail to access database", error)
                }
            },
            error: async (form) =>{
                res.render('admin/register', {
                    adminForm: form.toHTML(bootstrapField)
                })
            },
            empty: async (form) =>{
                res.render('admin/register', {
                    adminForm: form.toHTML(bootstrapField)
                })
            }        
    })
})

router.get('/login', (req, res) => {
    const form = createLoginForm();
    res.render('admin/login',{
        adminForm: form.toHTML(bootstrapField)
    })
})

const generateJWT = (admin, tokenSecret, expirationTime) => {
    return jwt.sign({
        'username': admin.username,
        'id': admin.id,
    }, tokenSecret, {expiresIn: expirationTime}
    )
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hashedPassword = sha256.update(password).digest('base64')
    return hashedPassword;
}

router.post('/login', async(req, res)=>{

    const form = createLoginForm();

    form.handle(req, {
        'success': async (form) => {
            let foundAdmin = await admin.where({
                'email': req.body.email,
                'password': getHashedPassword(req.body.password)
            }).fetch({
                require: false
            });

            if (foundAdmin){

                const accessToken = generateJWT(foundAdmin.toJSON(), process.env.ACCESS_TOKEN_SECRET, "1h");
                const refreshToken = generateJWT(foundAdmin.toJSON(), process.env.REFRESH_TOKEN_SECRET, "1d");

                console.log('found admin in db')

                req.session.admin = {
                    id: foundAdmin.get('id'),
                    username: foundAdmin.get('username'),
                    ipAddress: req.ip,
                    date: new Date(),
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
                
                req.headers.authorization = req.session.admin.accessToken;

                console.log("This is req.session.admin", req.session.admin)              
                console.log("this is req.headers.authorization", req.headers.authorization)

                const adminId = foundAdmin.get('id');
                console.log("this is superAdminId", adminId)

                try{
                    console.log('trying to create session')

                    const session = new Session();
                    session.set('session', req.session.admin);
                    session.set('admin_id', adminId)
                    await session.save()

                    console.log('session saved to db')

                    res.redirect('/admin/products')
    
                } catch (error){
                    console.error('fail to save session log', error)
                }
            } else {
                req.flash('error', 'Invalid Login');
                res.status(403);
                res.redirect('/admin/login');
            }
    }
    })
})

router.get('/products', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    let allProducts = await retrieveAllProducts();
    allProducts.unshift([0, '-------']);

    const searchForm = createSearchForm(allProducts);

    const query= products.collection();

    searchForm.handle(req, {
        'success': async (searchForm) => {
            console.log('search route hit')

            if (searchForm.data.productName) {
                console.log('search form product name hit', searchForm.data.productName)
                query.where('productName', 'like', '%' + searchForm.data.productName + '%')
            }

            if (searchForm.data.suppliers) {
                console.log('search form supplier hit', searchForm.data.suppliers)

                query.query(qb => {
                    qb.join('suppliers', 'products.supplier_id', 'suppliers.id');
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

            res.render('admin/products', {
                'products': products.toJSON(),
                'adminForm': searchForm.toHTML(bootstrapField)
            })
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

            res.render('admin/products',{
                'products': products.toJSON(),
                'adminForm': searchForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/products/:productId/update', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{
    const productId = req.params.productId;
    const product = await findProductById(productId)

    const allProducts = await retrieveAllProducts();
    const allProductVersion = await retrieveAllProductVersion();
   

    const form = createProductForm(allProducts, allProductVersion);

    form.fields.productName.value = await products.get('productName');
    form.fields.description.value = await products.get('description');
    form.fields.versionName.value = await products.get('versionName');
    form.fields.image_url.value = await products.get('image_url');
    form.fields.price.value = await products.get('price');
    form.fields.studioShopName.value = await products.get('studioShopName');

    res.render('admin/update', {
        'form': form.toHTML(bootstrapField),
        'product': product.toJSON(),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/products/:productId/update', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    console.log('update route for admin hit')

    const productId = req.params.productId;
    const product = await findProductById(productId);

    const allProducts = await retrieveAllProducts();
    const allProductVersion = await retrieveAllProductVersion();

    const form = createProductForm(allProducts, allProductVersion);

    form.handle(req, {
        "success" : async (form) =>{
            let {... productData} = form.data;
            product.set(productData);
            await product.save();

            req.flash("success", "product updated");
            res.redirect('/admin/products')
         },
         "error": (form)=>{
            res.render('admin/update',{
                'form': form.toHTML(bootstrapField),
                'products': product.toJSON(),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
         },
         "empty": (form)=>{
            res.render('admin/update',{
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON(),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
         }
    })
})

router.get('/add-product', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{
    const allProducts = await retrieveAllProducts();
    const allProductVersion = await retrieveAllProductVersion();

    const form = createProductForm(allProducts, allProductVersion);
    res.render('admin/create', {
        'form': form.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloundinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET    
    })
})

router.post('/add-product', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req, res)=>{
    const allProducts = await retrieveAllProducts();
    const allProductVersion = await retrieveAllProductVersion();

    const form = createProductForm(allProducts, allProductVersion);
    console.log('admin product form here', form);

    form.handle(req, {
        "success": async (form) =>{
            let product = await addProductListing(form);

            console.log(product)
            req.flash("success", "New product created");
            res.redirect('/admin/products')
        },
        "error": (form) => {
            res.render('admin/create', {
                'form': form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloundinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        },
        "empty": (form) =>{
            res.render('admin/create', {
            'form': form.toHTML(bootstrapField),
            cloudinaryName: process.env.CLOUDINARY_NAME,
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
            cloundinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })
})

router.get('/products/:productId/delete', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{
    let productId = req.params.productId;
    
    const product = await findProductById(productId);

    res.render('admin/delete', {
        'product': product.toJSON()
    })
})

router.post('/products/:productId/delete', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{
    let productId = req.params.productId;
    const product =await findProductById(productId);

    await product.destroy();
    res.redirect('/admin/products');
})

router.get('/logout', [checkSessionAuthentication, checkAuthenticationWithJWT], (req,res)=>{
    req.session.user = null;
    req.session.superAdmin = null;
    req.headers.authorization = null;
    req.flash('success', 'Log out successful! See you soon')
    res.redirect('/admin/login')
})

router.get('/suppliers', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    const supplierSearchForm = createSupplierSearchForm();

    const query= suppliers.collection();

    supplierSearchForm.handle(req, {
        'success': async (supplierSearchForm) => {
            console.log('supplier search route hit')

            if (supplierSearchForm.data.id) {
                console.log('search form id hit', supplierSearchForm.data.id)
                query.where('id', '=', supplierSearchForm.data.id)
            }

            if (supplierSearchForm.data.studioShopName) {
                console.log('search form studioShopName hit', supplierSearchForm.data.studioShopName)
                query.where('studioShopName', 'like', '%' + supplierSearchForm.data.studioShopName + '%')
            }

            if (supplierSearchForm.data.phoneNumber) {
                console.log('search form phone number hit', supplierSearchForm.data.phoneNumber)
                query.where('phoneNumber', '=', supplierSearchForm.data.phoneNumber)
            }

            const suppliers = await query.fetch()

            res.render('admin/suppliers', {
                'suppliers': suppliers.toJSON(),
                'searchForm': supplierSearchForm.toHTML(bootstrapField)
            })
        },
        'empty': async (supplierSearchForm) => {

            const suppliers = await query.fetch()
            console.log(suppliers)

            res.render('admin/suppliers',{
                'suppliers': suppliers.toJSON(),
                'searchForm': supplierSearchForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/suppliers/:supplierId/delete', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{
    let supplierId = req.params.supplierId;
    
    const suppliers = await findSupplierById(supplierId);

    res.render('admin/supplier-delete', {
        'suppliers': suppliers.toJSON()
    })
})

router.post('/suppliers/:supplierId/delete', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{

    console.log('user delete route hit');

    let supplierId = req.params.supplierId;
    console.log('req.params.supplierId here', supplierId)
    const supplier =await findSupplierById(supplierId);

    await supplier.destroy();
    req.flash('success', `Supplier Deleted`)
    res.redirect('/admin/suppliers');
})

router.get('/suppliers/:supplierId/products', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{
    
    console.log('user products route hit');

    let allProducts= await retrieveAllProducts();
    allProducts.unshift([0, '-------']);

    let allProductVersion = await retrieveAllProductVersion();
    allProductVersion.unshift([0, '-------']);

    const searchForm = createUserProductsSearchForm(allProducts, allProductVersion);

    const query= products.collection();

    searchForm.handle(req, {
        'success': async (searchForm) => {
            console.log('search route hit')

            query.where('products.supplier_id', '=', req.params.supplierId);
            
            if (searchForm.data.productName) {
                console.log('search form product name hit', searchForm.data.productName)
                query.where('productName', 'like', '%' + searchForm.data.productName + '%')
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
                withRelated:[    {
                        'productVersion': (queryBuild) => {
                        queryBuild.select('id', 'versionName', 'image_url', 'price', )
                        }
                    },
                    {
                        'suppliers' : (queryBuild) => {
                            queryBuild.select('studioShopName')
                        }
                    }
                            ]
            })

            const supplier = await findSupplierById(req.params.supplierId);

            res.render('admin/supplier-products', {
                'products': products.toJSON(),
                'suppliers': supplier.toJSON(),
                'searchForm': searchForm.toHTML(bootstrapField)
            })
        },
        'empty': async (searchForm) => {

            query.where('productVersion.supplier_id', '=', req.params.supplierId);

            const supplier = await findSupplierById(req.params.supplierId);

            const products = await query.fetch({
                withRelated:[    {
                    'productVersion': (queryBuild) => {
                    queryBuild.select('id', 'versionName', 'image_url', 'price', )
                    }
                },
                {
                    'suppliers' : (queryBuild) => {
                        queryBuild.select('studioShopName')
                    }
                }
                            ]
            })

            res.render('admin/supplier-products',{
                'products': products.toJSON(),
                'suppliers': supplier.toJSON(),
                'searchForm': searchForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/carts', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{
    
    const cartSearchForm = createCartSearchForm();

    const query= carts.collection();

    cartSearchForm.handle(req, {
        'success': async (cartSearchForm) => {
            console.log('carts search route hit')

            if (cartSearchForm.data.cart_id) {
                console.log('search form id hit', cartSearchForm.data.cart_id)
                query.where('cart_id', '=', cartSearchForm.data.cart_id)
            }

            if (cartSearchForm.data.customer_id) {
                console.log('search form id hit', cartSearchForm.data.customer_id)
                query.where('customer_id', '=', cartSearchForm.data.customer_id)
            }

            const carts = await query.orderBy('cart_id', 'desc').fetch()

            res.render('admin/carts', {
                'carts': carts.toJSON(),
                'searchForm': cartSearchForm.toHTML(bootstrapField)
            })
        },
        'empty': async (cartSearchForm) => {

            const carts = await query.orderBy('cart_id', 'desc').fetch()

            res.render('admin/carts',{
                'carts': carts.toJSON(),
                'searchForm': cartSearchForm.toHTML(bootstrapField)
            })
        }
    })  
})

router.get('/carts/:cartId/delete-cart', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{
    
    let cartId = parseInt(req.params.cartId);
    
    const carts = await retrieveSingleCartItem(cartId);
    console.log(carts.toJSON())

    res.render('admin/cart-delete', {
        'carts': carts.toJSON()
    })
})

router.post('/carts/:cartId/delete-cart', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{

    console.log('cart delete route hit');

    let cartId = req.params.cartId;

    await carts.query().where({ 'cart_id': cartId }).del();

    req.flash('success', `Cart Deleted`)
    res.redirect('/admin/carts');
})

router.get('/orders', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{
    
    const orderSearchForm = createOrderSearchForm();

    const query= orders.collection();

    orderSearchForm.handle(req, {
        'success': async (orderSearchForm) => {
            console.log('order search route hit')

            if (orderSearchForm.data.order_id) {
                console.log('search form id hit', orderSearchForm.data.order_id)
                query.where('order_id', '=', orderSearchForm.data.order_id)
            }

            if (orderSearchForm.data.supplier_id) {
                console.log('search form id hit', orderSearchForm.data.supplier_id)
                query.where('supplier_id', '=', orderSearchForm.data.supplier_id)
            }

            if (orderSearchForm.data.product_id) {
                console.log('search form id hit', orderSearchForm.data.product_id)
                query.where('product_id', '=', orderSearchForm.data.product_id)
            }

            if (orderSearchForm.data.customer_id) {
                console.log('search form id hit', orderSearchForm.data.customer_id)
                query.where('customer_id', '=', orderSearchForm.data.customer_id)
            }

            const orders = await query.orderBy('order_id', 'desc').fetch()

            res.render('admin/orders', {
                'orders': orders.toJSON(),
                'searchForm': orderSearchForm.toHTML(bootstrapField)
            })
        },
        'empty': async (orderSearchForm) => {

            const orders = await query.orderBy('cart_id', 'desc').fetch()

            res.render('admin/orders',{
                'orders': orders.toJSON(),
                'searchForm': orderSearchForm.toHTML(bootstrapField)
            })
        }
    })  
})

router.get('/orders/:orderId/update-order', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    let orderId = req.params.orderId;
    const orders = await retrieveOrderByOrderId(orderId);

    res.render('admin/order-update',{
        'orders': orders.toJSON()
    })
})

router.get('/orders/delete-item/', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    const orderId = req.query.orderId;
    const productVersionId = req.query.productVersionId;

    let order = await retrieveOrderByOrderIdAndProductVersionId(orderId, productVersionId);
    console.log("this is order item to delete", order.toJSON())

    res.render('admin/order-delete',{
        'order': order.toJSON()[0]
    })
})

router.post('/orders/delete-item/', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    const orderId = req.query.orderId;
    const productVersionId = req.query.productVersionId;
 
    console.log('order delete route hit');

    const orderItem =await removeOrder(orderId, productVersionId);

    req.flash('success', `Order Item Deleted`)
    res.redirect(`/admin/orders/${orderId}/update-order`);
})





// Extra route failsafe to delete refresh Token
router.delete('/blacklist', async(req,res)=>{

    console.log('blacklist route hit')

    const refreshToken = req.query.refreshToken;

    if (error){
        return res.sendStatus(400);
    } else {
           
            console.log('blacklist jwt verify route hit')
            const blackListedToken = new BlackListedToken({
                token: req.query.refreshToken,
                date_of_blacklist: new Date()
        })
            blackListedToken.save();
            res.json({
                "success": "Token blacklisted"
            })
        }
})


module.exports = router;