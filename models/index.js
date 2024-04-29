const bookshelf = require('../bookshelf')

const productVersion = bookshelf.model('productVersion', {
    tableName:'productVersion',

    products(){
        return this.belongsTo('products')
    },
});

const products = bookshelf.model('products',{

    tableName: 'products',

    productVersion(){
        return this.hasMany('productVersion')
    }
});



module.exports = { products, productVersion };