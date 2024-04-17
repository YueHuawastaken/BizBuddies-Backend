const express = require('express');

// CORS: cross origin resources sharing
const cors = require('cors');

const app = express();

// enable CORS (so that other web pages  can use our RESTFUl API)
app.use(cors());

// enable recieving and sending of JSON
app.use(express.json());

// using the array as an in-memory database
const suppliers = [
    {
        id: 1,
        phoneNumber: "+8610903282399",
        zhiFuVerification: "张",
        wxId: "hudson0101",
        studioName: "WTF"
    },
    {
        id: 2,
        phoneNumber: "+8610908286399",
        zhiFuVerification: "河",
        wxId: "feifei0101",
        studioName: "GK"
    },

]
const shippingCompany = [
    {
        id: 1,
        phoneNumber: "+8610903282300",
        zhiFuVerification: "小",
        wxId: "realg0001",
        companyName: "yue yue express"
    },
    {
        id: 2,
        phoneNumber: "+8610908908399",
        zhiFuVerification: "大",
        wxId: "mf27",
        companyName: "集运 Express"
    },
]
const customers = [
    {
        id: 1,
        username: "RealGornot",
        phoneNumber: "+6597820482",
        email: "RealGornot@gmail.com"
    },
    {
        id: 2,
        username: "notsoReal",
        phoneNumber: "+8610903282300",
        email: "notsoReal@gmail.com"
    }
]

app.get("/", function(req,res){
    res.json({
        "message":"Success"
    })
})

// Every RESTFul endpoint consists of a HTTP method + URL fragment
// The url fragment is like a file path
// Every endpoint in a RESTFUL API refers to a resource
app.get("/suppliers", function(req,res){
    res.json({
        "suppliers": suppliers
    })
});

// create a new recipe
// the client is expected to provide the following key
// in the json request:
// title: a string to describe the title of the recipe
// ingredients: an array of strings, with each string being one ingredient
// cuisine: a string representing the cuisine of the recipe
app.post("/suppliers", function(req,res){
    // const  id = req.body.id;
    const phoneNumber = req.body.phoneNumber;
    const zhiFuVerification = req.body.zhiFuVerification;
    const wxId = req.body.wxId;
    const studioName = req.body.studioName; 


    // validate the user provide the data
    if (!phoneNumber || !zhiFuVerification || ! wxId || !studioName) {
        res.status(400);
        res.json({
            "error":"Incomplete Information"
        });
        // stop processing so use `return` to end the function
        return;
    }

    // if (!Array.isArray(req.body.zhiFuVerification)) {
    //     res.status(400);
    //     res.json({
    //         "error":"Incomplete Information"
    //     });
    //     return;
    // }

    const newSupplier = {
        'id': Math.floor(Math.random() * 10000 + 1),
        'phoneNumber': phoneNumber,
        'zhiFuVerification': zhiFuVerification,
        ' wxId':  wxId,
        'studioName' : studioName
    }

    recipes.push(newSupplier);

    res.status(200);
    res.json({
        'message':'Supplier Added successfully'
    })

})

app.get("/shippingCompany", function(req,res){
    res.json({
        "shippingCompany": shippingCompany
    })
});

app.post("/shippingCompany", function(req,res){
    // const  id = req.body.id;
    const phoneNumber = req.body.phoneNumber;
    const zhiFuVerification = req.body.zhiFuVerification;
    const wxId = req.body.wxId;
    const companyName = req.body.companyName; 
})

app.get("/customers", function(req,res){
    res.json({
        "customers": customers
    })
});

app.post("/customers", function(req,res){
    // const  id = req.body.id;
    const username = req.body.username;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
})
// http://3000-yuehuawasta-bizbuddiesf-98nmy2tijdg.ws-us110.gitpod.io/suppliers/1
// https://3000-yuehuawasta-bizbuddiesf-98nmy2tijdg.ws-us110.gitpod.io/suppliers/1
// delete
app.delete("/suppliers/:id", function(req,res){
    // find the index of the recipe that we want to delete
    console.log("Entered Delete")
    // if findIndex cannot find the record we want, it will return -1
    const indexToDelete = suppliers.findIndex(function(s){
        return s.id == req.params.id
    })
    console.log(indexToDelete)
    if (indexToDelete == -1) {
        res.status(400);
        res.json({
            "error":"The Suppliers ID cannot be found"
        });
        return;
    }

    suppliers.splice(indexToDelete, 1);

    res.status(200);
    res.json({"message":"Supplier has been delete"});
});

app.put("/suppliers/:id", function(req,res){
    const phoneNumber = req.body.phoneNumber;
    const zhiFuVerification = req.body.zhiFuVerification;
    const wxId = req.body.wxId;
    const studioName = req.body.studioName

    const modifiedSupplier = {
        "phoneNumber": phoneNumber,
        "zhiFuVerification": zhiFuVerification,
        "wxId": wxId,
        "studioName" : studioName
    }

    // find the index in the recipes array to replace
    const indexToReplace = suppliers.findIndex(function(s){
        return s.id == req.params.id;
    })

    recipes[indexToReplace] = modifiedSupplier;

    res.status(200);
    res.json({
        "message":"Update Supplier is successful"
    })
})

app.delete("/shippingCompany/:id", function(req,res){
    // find the index of the recipe that we want to delete

    // if findIndex cannot find the record we want, it will return -1
    const indexToDelete = shippingCompany.findIndex(function(c){
        return c.id == req.params.id
    })

    if (indexToDelete == -1) {
        res.status(400);
        res.json({
            "error":"The Company ID cannot be found"
        });
        return;
    }

    shippingCompany.splice(indexToDelete, 1);

    res.status(200);
    res.json({"message":"Company has been delete"});
});

app.put("/shippingCompany/:id", function(req,res){
    const phoneNumber = req.body.phoneNumber;
    const zhiFuVerification = req.body.zhiFuVerification;
    const wxId = req.body.wxId;
    const companyName = req.body.companyName

    const modifiedCompany = {
        "phoneNumber": phoneNumber,
        "zhiFuVerification": zhiFuVerification,
        "wxId": wxId,
        "companyName" : companyName
    }

    // find the index in the recipes array to replace
    const indexToReplace = shippingCompany.findIndex(function(c){
        return c.id == req.params.id;
    })

    recipes[indexToReplace] = modifiedCompany;

    res.status(200);
    res.json({
        "message":"Update Company is successful"
    })
})

app.delete("/customers/:id", function(req,res){
    // find the index of the recipe that we want to delete

    // if findIndex cannot find the record we want, it will return -1
    const indexToDelete = customers.findIndex(function(c){
        return c.id == req.params.id
    })

    if (indexToDelete == -1) {
        res.status(400);
        res.json({
            "error":"The Company ID cannot be found"
        });
        return;
    }

    customers.splice(indexToDelete, 1);

    res.status(200);
    res.json({"message":"Customer has been deleted"});
});

app.put("/customers/:id", function(req,res){
    const username = req.body.username;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;

    const modifiedCustomers = {
        "username": username,
        " phoneNumber":  phoneNumber,
        "email": email,
    }

    // find the index in the recipes array to replace
    const indexToReplace = customers.findIndex(function(c){
        return c.id == req.params.id;
    })

    recipes[indexToReplace] = modifiedCustomers;

    res.status(200);
    res.json({
        "message":"Update Customer is successful"
    })
})

app.listen(3000, function(){
    console.log("server has started");
})