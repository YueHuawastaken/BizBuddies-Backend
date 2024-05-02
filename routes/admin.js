const express = require('express');
const router = express.Router();

// Authentication
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// ORM relations
const { admin, Product, User, BlackListedToken, Session, Cart_Item, Order_Item } = require('../models');

// Forms
const { bootstrapField, 
        createLoginForm, 
        createProductForm, 
        createSearchForm, 
        createRegisterForm, 
        createUserSearchForm, 
        createUserProductsSearchForm,
        createCartSearchForm,
        createOrderSearchForm
     } = require('../forms'); 

// DAL logics with spare DAL methods for usage when not using DB query
const { retrieveAllProducts, retrieveAllProductVersion, retrieveAllSuppliers, findProductById, 
    addProductListing, findProductsByStudioShopName,searchProductsBySearchForm } = require("../data-access-layer/products");
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

                const accessToken = generateJWT(foundAdmin.toJSON(), process.env.ACCESS_TOKEN_SECRET, "10s");
                const refreshToken = generateJWT(foundAdmin.toJSON(), process.env.REFRESH_TOKEN_SECRET, "4h");

                console.log('found admin in db')

                req.session.admin = {
                    id: foundAdmin.get('id'),
                    name: foundAdmin.get('username'),
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
                    session.set('super_admin_id', adminId)
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

    form.fields.productName.value = await product.get('name');
    form.fields.price.value = await product.get('price');
    form.fields.description.value = await product.get('description');
    form.fields.post_category_id.value = await product.get('post_category_id');
    form.fields.image_url.value = await product.get('image_url');
    form.fields.thumbnail_url.value = await product.get('thumbnail_url');
    form.fields.chapter_content.value = await product.get('chapter_content');
    form.fields.stock.value = await product.get('stock');

    const selectedGenres = await product.related('genres').pluck('id');
    form.fields.genres.value = selectedGenres;

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

    const allPostCategories = await retrieveAllPostCategories();
    const allGenres = await retrieveAllGenres();

    const form = createProductForm(allPostCategories, allGenres);

    form.handle(req, {
        "success" : async (form) =>{
            let {genres, ... productData} = form.data;
            product.set(productData);
            await product.save();

            const indicatedGenres = await product.related('genres').pluck('id');

            await product.genres().detach(indicatedGenres);
            await product.genres().attach(form.data.genres.split(','));

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
    const allPostCategories = await retrieveAllPostCategories();
    const allGenres = await retrieveAllGenres();

    const form = createProductForm(allPostCategories, allGenres);
    res.render('admin/create', {
        'form': form.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloundinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET    
    })
})

router.post('/add-product', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req, res)=>{
    const allPostCategories = await retrieveAllPostCategories();
    const allGenres = await retrieveAllGenres();

    const form = createProductForm(allPostCategories, allGenres);
    console.log('super admin product form here', form);

    form.handle(req, {
        "success": async (form) =>{
            let product = await addProductListing(form);

            console.log(product)
            if (form.data.genres){
                console.log('form genres here', form.data.genres)
                await product.genres().attach(form.data.genres.split(','));
            }
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

router.get('/users', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    const userSearchForm = createUserSearchForm();

    const query= User.collection();

    userSearchForm.handle(req, {
        'success': async (userSearchForm) => {
            console.log('user search route hit')

            if (userSearchForm.data.id) {
                console.log('search form id hit', userSearchForm.data.id)
                query.where('id', '=', userSearchForm.data.id)
            }

            if (userSearchForm.data.name) {
                console.log('search form name hit', userSearchForm.data.name)
                query.where('name', 'like', '%' + userSearchForm.data.name + '%')
            }

            if (userSearchForm.data.email) {
                console.log('search form email hit', userSearchForm.data.email)
                query.where('email', '=', userSearchForm.data.email)
            }

            const users = await query.fetch()

            res.render('admin/users', {
                'users': users.toJSON(),
                'searchForm': userSearchForm.toHTML(bootstrapField)
            })
        },
        'empty': async (userSearchForm) => {

            const users = await query.fetch()
            console.log(users)

            res.render('admin/users',{
                'users': users.toJSON(),
                'searchForm': userSearchForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/users/:userId/delete', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{
    let userId = req.params.userId;
    
    const user = await findUserById(userId);

    res.render('admin/user-delete', {
        'user': user.toJSON()
    })
})

router.post('/users/:userId/delete', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{

    console.log('user delete route hit');

    let userId = req.params.userId;
    console.log('req.params.userId here', userId)
    const user =await findUserById(userId);

    await user.destroy();
    req.flash('success', `User Deleted`)
    res.redirect('/admin/users');
})

router.get('/users/:userId/products', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{
    
    console.log('user products route hit');

    let allPostCategories = await retrieveAllPostCategories();
    allPostCategories.unshift([0, '-------']);

    let allGenres = await retrieveAllGenres();
    allGenres.unshift([0, '-------']);

    const searchForm = createUserProductsSearchForm(allPostCategories, allGenres);

    const query= Product.collection();

    searchForm.handle(req, {
        'success': async (searchForm) => {
            console.log('search route hit')

            query.where('products.user_id', '=', req.params.userId);
            
            if (searchForm.data.name) {
                console.log('search form name hit', searchForm.data.name)
                query.where('name', 'like', '%' + searchForm.data.name + '%')
            }

            if (searchForm.data.min_price) {
                console.log('search form min price hit', searchForm.data.min_price)
                query.where('price', '>=', searchForm.data.min_price)
            }

            if (searchForm.data.max_price) {
                console.log('search form max price hit', searchForm.data.max_price)
                query.where('price', '<=', searchForm.data.max_price)
            }

            if (searchForm.data.post_category_id && searchForm.data.post_category_id != 0) {
                console.log('search form post category id hit =>', searchForm.data.post_category_id);

                query.where('post_category_id', '=', searchForm.data.post_category_id);
            }

            if (searchForm.data.genres && searchForm.data.genres != 0) {
                console.log('search form genres hit', searchForm.data.genres)

                query.query(qb => {
                    qb.join('genres_products', 'product_id', 'products.id');
                    qb.where('genre_id', 'in', searchForm.data.genres.split(','));
                });                
            }

            const products = await query.fetch({
                withRelated:[   'post_category', 
                                'genres', {
                                'user': (queryBuild) => {
                                                            queryBuild.select('id', 'name')
                                                        }
                                }
                            ]
            })

            const user = await findUserById(req.params.userId);

            res.render('admin/user-products', {
                'products': products.toJSON(),
                'user': user.toJSON(),
                'searchForm': searchForm.toHTML(bootstrapField)
            })
        },
        'empty': async (searchForm) => {

            query.where('products.user_id', '=', req.params.userId);

            const user = await findUserById(req.params.userId);

            const products = await query.fetch({
                withRelated:[   'post_category', 
                                'genres', {
                                'user': (queryBuild) => {
                                                            queryBuild.select('id', 'name')
                                                        }
                                }
                            ]
            })

            res.render('admin/user-products',{
                'products': products.toJSON(),
                'user': user.toJSON(),
                'searchForm': searchForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/carts', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{
    
    const cartSearchForm = createCartSearchForm();

    const query= Cart_Item.collection();

    cartSearchForm.handle(req, {
        'success': async (cartSearchForm) => {
            console.log('carts search route hit')

            if (cartSearchForm.data.cart_id) {
                console.log('search form id hit', cartSearchForm.data.cart_id)
                query.where('cart_id', '=', cartSearchForm.data.cart_id)
            }

            if (cartSearchForm.data.user_id) {
                console.log('search form id hit', cartSearchForm.data.user_id)
                query.where('user_id', '=', cartSearchForm.data.user_id)
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
    
    const cartItems = await retrieveSingleCartItems(cartId);
    console.log(cartItems.toJSON())

    res.render('admin/cart-delete', {
        'cartItems': cartItems.toJSON()
    })
})

router.post('/carts/:cartId/delete-cart', [checkSessionAuthentication, checkAuthenticationWithJWT], async (req,res)=>{

    console.log('cart delete route hit');

    let cartId = req.params.cartId;

    await Cart_Item.query().where({ 'cart_id': cartId }).del();

    req.flash('success', `Cart Deleted`)
    res.redirect('/admin/carts');
})

router.get('/orders', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{
    
    const orderSearchForm = createOrderSearchForm();

    const query= Order_Item.collection();

    orderSearchForm.handle(req, {
        'success': async (orderSearchForm) => {
            console.log('order search route hit')

            if (orderSearchForm.data.order_id) {
                console.log('search form id hit', orderSearchForm.data.order_id)
                query.where('order_id', '=', orderSearchForm.data.order_id)
            }

            if (orderSearchForm.data.user_id) {
                console.log('search form id hit', orderSearchForm.data.user_id)
                query.where('user_id', '=', orderSearchForm.data.user_id)
            }

            if (orderSearchForm.data.product_id) {
                console.log('search form id hit', orderSearchForm.data.product_id)
                query.where('product_id', '=', orderSearchForm.data.product_id)
            }

            if (orderSearchForm.data.seller_id) {
                console.log('search form id hit', orderSearchForm.data.seller_id)
                query.where('seller_id', '=', orderSearchForm.data.seller_id)
            }

            if (orderSearchForm.data.fulfilment) {
                console.log('search form id hit', orderSearchForm.data.fulfilment)
                query.where('fulfilled', 'like', '%' + orderSearchForm.data.fulfilment + '%')
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

router.get('/orders/update-quantity', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    const orderId = req.query.orderId;
    const productId = req.query.productId;
    const newQuantity = req.query.newQuantity;
    console.log('orderId:', orderId, 'productId:', productId, 'newQuantity', newQuantity);

    let order = await updateOrderItemQuantity(orderId, productId, newQuantity);
    console.log("this is updated order", order.toJSON())

    res.render('admin/order-update-one',{
        'order': order.toJSON()[0]
    })
})

router.post('/orders/update-quantity', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    const orderId = req.query.orderId;
    const productId = req.query.productId;
    const newQuantity = req.body.newQuantity;

    await updateOrderItemQuantity(orderId, productId, newQuantity);
    req.flash('success', 'Item quantity updated');
    res.redirect(`/orders/${orderId}/update-order`);
})

router.get('/orders/update-status/', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    const orderId = req.query.orderId;
    const productId = req.query.productId;
    let updatedStatus = req.query.updatedStatus;
    console.log('orderId:', orderId, 'productId:', productId, 'updatedStatus', updatedStatus);

    let order = await updateOrderFulfilment(orderId, productId, updatedStatus);
    console.log("this is updated status", order.toJSON())

    res.render('admin/order-update-status',{
        'order': order.toJSON()[0]
    })
})


router.get('/orders/delete-item/', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    const orderId = req.query.orderId;
    const productId = req.query.productId;

    let order = await retrieveOrderItemByOrderIdAndProduct(orderId, productId);
    console.log("this is order item to delete", order.toJSON())

    res.render('admin/order-delete',{
        'order': order.toJSON()[0]
    })
})

router.post('/orders/delete-item/', [checkSessionAuthentication, checkAuthenticationWithJWT], async(req,res)=>{

    const orderId = req.query.orderId;
    const productId = req.query.productId;
 
    console.log('order delete route hit');

    const orderItem =await removeOrderItem(orderId, productId);

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