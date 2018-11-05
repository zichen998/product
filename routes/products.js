let products = require('../models/products');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let db = mongoose.connection;

var mongodbUri ='mongodb://productsdb:xiangqianzou988@ds139883.mlab.com:39883/productsdb';
mongoose.connect(mongodbUri);
db.on('error', function (err) {
    console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});

db.once('open', function () {
    console.log('Successfully Connected to [ ' + db.name + ' ] on mlab.com');
});

router.findAll = (req, res) => {
    // Return a JSON representation of our list
    res.setHeader('Content-Type', 'application/json');

    products.find(function(err, products) {
        if (err)
            res.send(err);
        else
            res.send(JSON.stringify(products,null,5));
    });
}

router.findOne = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    products.find({ "_id" : req.params.id },function(err, products) {
        if (err)
            res.json({ message: 'Product NOT Found!', errmsg : err } );
        // return a suitable error message
        else
            res.send(JSON.stringify(products,null,5));

    });
}


function getTotalVotes(array) {
    let totalVotes = 0;
    array.forEach(function(obj) { totalVotes += obj.upvotes; });
    return totalVotes;
}

router.addProduct = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    var product = new products();

    product.paymenttype = req.body.paymenttype;// the requested value
        product.amount = req.body.amount;
    product.color = req.body.color;
    product.name = req.body.name;

            product.save(function(err) {
                if (err)
                    res.json({ message: 'product NOT Added!', errmsg : err } );// return a suitable error message
                else
                    res.json({ message: 'product Successfully Added!', data: product });// return a suitable success message
            });
}


router.incrementUpvotes = (req, res) => {

    products.findById(req.params.id, function(err,product) {
        if (err) {
            res.status(404);
            res.json({message: 'product NOT Found!', errmsg: err});
        }
        else {
            product.upvotes += 1;
            product.save(function (err) {
                if (err)
                    res.json({ message: 'product NOT UpVoted!', errmsg : err } );
                else
                    res.json({ message: 'product Successfully UpVoted!', data: product });
            });
        }
    });
}

router.deleteProduct = (req, res) => {

    products.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.json({ message: 'product NOT DELETED!', errmsg : err } );
        else
            res.json({ message: 'product Successfully Deleted!'});
    });
}

router.findTotalVotes = (req, res) => {

    products.find(function(err, product) {
        if (err)
            res.send(err);
        else
            res.json({ totalvotes : getTotalVotes(product) });
    });
}
router.findBYName = (req, res) => {
    res.setHeader('Content-Type','application/json');
    var keyword = req.params.name;
    var _filter = {
        $or:[
            {
                name:{$regex:keyword,$options:'$i'}
            }
        ]
    };
    var count = 0;
    products.count(_filter,function(err,account){
        if (err){
            res.json({errmsq : err});
        }
        else{
            count = account;
        }}
    );
   products.find(_filter).limit(10).sort({"_id": -1}).exec(function(err,product){
       if(err || product.length == 0){
           res.json({message:"products NOT Found!",errmsq:err});
       }else{
           res.send(JSON.stringify(product,null,5));
       }
   });
}

module.exports = router;
