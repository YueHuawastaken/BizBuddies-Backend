const { default: knex } = require('knex');
const { suppliers , products } = require('../models');
const router = require('../routes/users');
const { checkUserAuthenticationWithJWT } = require('../middleware');

const retrieveAllCustomers = async () => {
    console.log('retrieve all users hit')
    try{
        return await User.fetchAll({
            withRelated: ['order_items', 'products']
        });
    } catch (error) {
        console.error('error retrieving all Users', error)
    }
}

const findUserById = async (userId) => {
    console.log('findUserById dal hit');
    try{
        const userFoundById = await User.where({
            'id': userId
        }).fetch({
            require:true,
            withRelated: ['order_items', 'products']
        })
        return userFoundById;
    } catch (error){
        console.error('error finding user by Id', error)
    }
}

const addUserProductListing = async (payload) => {

    console.log('route hit for addUserProduct')

    try{
        const product = new Product();
        product.set('name', payload.name);
        product.set('price', payload.price);
        product.set('description', payload.description);
        product.set('image_url', payload.imageUrl);
        product.set('thumbnail_url', payload.thumbnailUrl);
        product.set('date_created', new Date());
        product.set('stock', payload.stock);
        product.set('post_category_id', payload.postCategoryId)
        product.set('chapter_content', payload.chapterContent)
        product.set('user_id', payload.userId)

        try{
            await product.save();
            console.log('success save product', product.toJSON())
        } catch (error) {
            console.log('fail to save products', error)
        }

        const productId = product.get('id');
        console.log('fetched productId here', productId);
        const genreIds = payload.genreId;

        const insertData = genreIds.map(genreId => ({
            "product_id": parseInt(productId),
            "genre_id": parseInt(genreId)
        })
        )

        console.log('insertData here', insertData)
        
        try{
            await product.genres().attach(insertData);
            console.log('success saving genres')
        } catch (error) {
            console.log('Fail to save genres', error)
        }

    } catch (error) {
        console.error('error adding product listing', error)
    }
}

const updateUserProductListing = async (payload) => {

    console.log('route hit for addUserProduct, payload here', payload)

    const productFoundById = await Product.where({
        'id': payload.productId
    }).fetch({
        require:true,
        withRelated: [  'post_category', 
                        'genres',
        ]
    })

    try{
        productFoundById.set('name', payload.name);
        productFoundById.set('price', payload.price);
        productFoundById.set('description', payload.description);
        productFoundById.set('image_url', payload.imageUrl);
        productFoundById.set('thumbnail_url', payload.thumbnailUrl);
        productFoundById.set('stock', payload.stock);
        productFoundById.set('post_category_id', payload.postCategoryId)
        productFoundById.set('chapter_content', payload.chapterContent)

        const productId = payload.productId;
        const genreIds = payload.genreId;

        const insertData = genreIds.map(genreId => ({
            "product_id": parseInt(productId),
            "genre_id": parseInt(genreId)
        })
        )

        const dataToPluck = parseInt(productId)

        console.log('insertData here', insertData)
        
        try{
            await productFoundById.save();
            console.log('success save product', productFoundById.toJSON())
            try{
                console.log('updating genres after saving product')
                await productFoundById.genres().detach();

                console.log('successful detach genres from M:n r/s')

                await productFoundById.genres().attach(insertData);
                console.log('success updating genres')
            } catch (error) {
                console.log('Fail to save genres', error)
            }
        } catch (error) {
            console.log('failed to save update on product', error)
        }

    } catch (error) {
        console.error('error updating product listing', error)
    }
}




module.exports = {retrieveAllUsers,findUserById, addUserProductListing, updateUserProductListing};