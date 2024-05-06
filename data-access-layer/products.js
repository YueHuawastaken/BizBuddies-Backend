const {productVersion, products, suppliers } = require('../models');

const retrieveAllProducts = async () => {
    console.log('retrieve all products hit')
    
    try{
        return await products.fetchAll({
            withRelated: [{
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
        });

    } catch (error) {
        console.error('error retrieving all products', error)
    }
}

const retrieveAllProductVersion = async () => {
    try{
        const allProductVersion = await productVersion.fetchAll()
                                    .map(productVersion=> [productVersion.get('versionName'), productVersion.get('image_url'),
                                         productVersion.get('price')])
        return allProductVersion;

    } catch (error){
        console.error('error retrieving product version', error)
    }
}

const retrieveAllSuppliers = async () => {
    try{
        const allSuppliers = await suppliers.fetchAll()
                                    .map(suppliers=> [suppliers.get('id'),suppliers.get('studioShopName')])
        return allSuppliers;

    } catch (error){
        console.error('error retrieving suppliers', error)
    }
}

const findProductById = async (product_Id) => {
    try{
        const productFoundById = await products.where({
            'id': product_Id
        }).fetch({
            require:true,
            withRelated: [  {
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
        return productFoundById;

    } catch (error){
        console.error('error finding product by Id', error)
    }
}

const addProductListing = async (productForm) => {

    try{
        const product = new products();
        product.set('productName', productForm.data.productName);
        product.set('description', productForm.data.description);
        product.set('versionName', productForm.data.versionName);
        product.set('image_url', productForm.data.image_url);
        product.set('price', productForm.data.price); 
        product.set('studioShopName', productForm.data.studioShopName)

        await product.save();
        return product;
    
    } catch (error) {
        console.error('error adding product listing', error)
    }
}

const findProductsByStudioShopName = async (studioShopName) => {
    
    try{
        const productsFoundByStudioShopName = await productVersion
        // .query(qb => {
        //     qb.innerJoin('suppliers', 'productVersion.supplier_id', 'suppliers.id')
        //       .whereRaw('LOWER(suppliers.studioShopName) LIKE LOWER(?)', `%${studioShopName}%`);
        // })
            .innerJoin('suppliers', 'productVersion.supplier_id', 'suppliers.id')
            .whereILike('suppliers.studioShopName', `%${studioShopName}`)
            .fetchAll({
                withRelated: [  {
                    'products': (queryBuild) => {   
                        queryBuild.select('id', 'productName', 'description' )
                        }
                    },
                     {
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
        return productsFoundByStudioShopName;

    } catch (error){
        console.error('error finding product by StudioShop Name', error)
    }
}

const searchProductsBySearchForm = async (payload)=>{

    const query= products.collection();

    const searchCriteria = payload
    console.log('search payload =>', searchCriteria)

    try{
        if (searchCriteria.productName) {
            console.log('search form name hit', searchCriteria.productName)
            query.where('productName', 'ilike', '%' + searchCriteria.productName + '%')
        }

        if (searchCriteria.minPrice) {
            console.log('search form min price hit', searchCriteria.minPrice)
            query.where('price', '>=', searchCriteria.minPrice)
        }

        if (searchCriteria.maxPrice) {
            console.log('search form max price hit', searchCriteria.maxPrice)
            query.where('price', '<=', searchCriteria.maxPrice)
        }

        if (searchCriteria.studioShopName) {
            console.log('search form studio shop name hit =>', searchCriteria.studioShopName);

            query.where('studioShopName', '=', searchCriteria.studioShopName);
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
        console.log('fetched products')
        return products;

    } catch (error) {
        console.log('unable to fetch at products DAL =>', error)
    }  
}

module.exports = {
    retrieveAllProducts, retrieveAllProductVersion, retrieveAllSuppliers, findProductById, 
    addProductListing, findProductsByStudioShopName,searchProductsBySearchForm
}
