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

const suppliers = bookshelf.model('suppliers',{
    
    tableName: 'suppliers',

    products(){
        return this.hasMany('products')
    },

    productVersion(){
        return this.hasMany('productVersion')
    },

    carts(){
        return this.hasMany('carts')
    },

    orders(){
        return this.hasMany('orders')
    }
});

const carts = bookshelf.model('carts',{
    tableName: 'carts',
    products(){
        return this.hasMany('products')
    },
    productVersion(){
        return this.hasMany('productVersion')
    },
    suppliers(){
        return this.hasMany('suppliers')
    }
});

const orders = bookshelf.model('orders',{
    tableName: 'orders',
    products(){
        return this.hasMany('products')
    },
    productVersion(){
        return this.hasMany('productVersion')
    },
    suppliers(){
        return this.hasMany('suppliers')
    },
    customers() {
        return this.belongsTo('customers')
    }
})

const admin = bookshelf.model('admin', {
    tableName: 'admin',

    sessions(){
        return this.hasMany('Session')
    }
})

const customers = bookshelf.model('customers',{
    tableName:'customers',
    products(){
        return this.hasMany('products')
    },
    productVersion(){
        return this.hasMany('productVersion')
    },
    orders(){
        return this.hasMany('orders')
    },
    carts(){
        return this.hasMany('carts')
    },

})

const BlackListedToken = bookshelf.model("BlackListedToken", {
    tableName: 'blacklisted_tokens'
})

const Session = bookshelf.model("Session",{
    tableName: 'sessions',

    admin(){
        return this.belongsTo('admin')
    }
})


module.exports = { products, productVersion, suppliers, carts, orders, 
    admin, customers, BlackListedToken, Session };