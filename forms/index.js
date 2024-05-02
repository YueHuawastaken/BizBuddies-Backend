const forms = require("forms");
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createRegisterForm = () => {
    return forms.create({
        'studioShopName': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.minlength(0),
                validators.required(),
                validators.regexp(/^[a-zA-Z0-9._%+ -!@*()^#]+$/)
            ]
        }),
        'phoneNumber': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.phoneNumber()]
        }),
        'zhiFuVerification': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.zhiFuVerification()]
        }),
        'wxId': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.wxId()]
        }),
           'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.minlength(0),
                validators.required(),
                validators.regexp(/^[a-zA-Z0-9._%+ -!@*()^#]+$/)
            ]
        }),
        'passwordConfirmation': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.matchField('password')]
        })
    })
};


const createLoginForm = () => {
    return forms.create({
        'phoneNumber': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.minlength(0),
                validators.maxlength(14),
                validators.phoneNumber(),
                validators.required()
            ]
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.minlength(0),
                validators.required(),
                validators.regexp(/^[a-zA-Z0-9._%+ -!@*()^#]+$/)
            ]
        }),
    })
};

const createProductForm = () => {
    return forms.create({
        'productName': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.minlength(0),
                validators.required(),
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.regexp(/^[a-zA-Z0-9._%+ -()!'"?@]+$/)]
        }),
        'versionName': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.regexp(/^[a-zA-Z0-9._%+ -()!'"?@]+$/)]
        }),
        'image_url': fields.string({
            widget: widgets.hidden()
        }),
        'price': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.min(0), validators.integer()]
        }),
        'studioShopName': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.regexp(/^[a-zA-Z0-9._%+ -()!'"?@]+$/)]
        }),
    })
};


const createSearchForm = () => {
    return forms.create({
        'productName': fields.string({
            label: "Name of Product",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
        'suppliers': fields.string({
            label: "Studio/Shop Name",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@]+$/)
            ]
        }),
        'min_price': fields.number({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.min(0), validators.integer()]
        }),
        'max_price': fields.number({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.min(0), validators.integer()] 
        }),
    })
};


const createSupplierSearchForm = () => {
    return forms.create({
        'id': fields.number({
            label: "Supplier Id",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
        'studioShopName': fields.string({
            label: "Studio/Shop Name",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
    })
};

const createUserProductsSearchForm = () => {
    return forms.create({
        'name': fields.string({
            label: "Name of work",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
        'min_price': fields.number({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.min(0), validators.integer()]
        }),
        'max_price': fields.number({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.min(0), validators.integer()] 
        }),
        'post_category_id': fields.string({
            label:'Post Category',
            required: false,
            errorAfterField: true,
            widget: widgets.select(),
            choices: post_category,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'genres': fields.string({
            label: 'Genres',
            required: false,
            errorAfterField: true,
            widget: widgets.select(),
            choices: genres,
            cssClasses: {
                label: ['form-label']
            }
        })
    })
};


const createCartSearchForm = () => {
    return forms.create({
        'cart_id': fields.number({
            label: "Cart Id",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
        'user_id': fields.string({
            label: "User Id",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        })
    })
};

const createOrderSearchForm = () => {
    return forms.create({
        'order_id': fields.number({
            label: "Order Id",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
        'user_id': fields.string({
            label: "User Id",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
        'product_id': fields.string({
            label: "Product Id",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
        'seller_id': fields.string({
            label: "Seller Id",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        }),
        'fulfilment': fields.string({
            label: "Fulfilmment",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[
                validators.regexp(/^[a-zA-Z0-9._%+ -!'"?@()]+$/)
            ]
        })
    })
};

module.exports = { bootstrapField, createProductForm, createLoginForm, createRegisterForm, createSearchForm, createUserSearchForm, createUserProductsSearchForm, createCartSearchForm, createOrderSearchForm };



