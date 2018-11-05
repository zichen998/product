let chai = require('chai');
let chaiHttp = require('chai-http');

let server = require('../../bin/www');
let expect = chai.expect;
let Datastore = require('../../models/products');
chai.use(chaiHttp);
let _ = require('lodash' );
chai.use(require('chai-things'));
describe('products', function (){
    beforeEach(function(done){
        let datastore1 = new Datastore({
            upvotes: 0,
            _id: "5bd0b9e03aa4ac29084f6fc7",
            paymenttype: "Direct",
            amount: 1600,
            color: "black",
            name: "Air Jordan 1*Off-White",

        });
        let datastore2 = new Datastore({
            upvotes: 0,
            _id: "5bd0ba6e3aa4ac29084f6fc8",
            paymenttype: "Pay Pal",
            amount: 1600,
            color: "white",
            name: "Supreme*CDG boxlogo",
        });
        let datastore3 = new Datastore({

            upvotes: 0,


            _id: "5bd2e4597c992c4e74424b0e",
            amount: 1600,
            name: "Fragment design",
        });
        datastore1.save();
        datastore2.save();
        datastore3.save();
        done();
    });

    describe('GET /products',  () => {
        it('should return all the products in an array', function(done) {
            chai.request(server)
                .get('/products')
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    expect(res.body.length).to.equal(3);
                    let result = _.map(res.body, (products) => {
                        return { name: products.name,
                            amount: products.amount }
                    });
                    expect(result).to.include( {  name: "Air Jordan 1*Off-White", amount: 1600  } );
                    expect(result).to.include( { name: "Supreme*CDG boxlogo", amount: 1600  } );
                    expect(result).to.include( { name: "Fragment design", amount: 1600  } );
                    Datastore.collection.remove();
                    done();
                });
        });
    });
    describe('POST /products', function () {
        it('should return confirmation message and update datastore', function(done) {
            let product = {
                paymenttype: 'Direct' ,
                amount: 1600,
                upvotes: 0
            };
            chai.request(server)
                .post('/products')
                .send(product)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message').equal('product Successfully Added!' );
                    done();
                });
        });
        after(function  (done) {
            chai.request(server)
                .get('/products')
                .end(function (err, res) {
                    let result = _.map(res.body, (product) => {
                        return {
                            paymenttype: product.paymenttype,
                            amount: product.amount
                        };
                    });
                    expect(result).to.include({paymenttype: 'Direct', amount: 1600});
                    Datastore.collection.remove();
                    done();
                });
        });
});
    describe('PUT /products/name/vote', () => {
        it('should return a message and the product upvoted by 1', function(done) {
            chai.request(server)
                .put('/products/5bd2e4597c992c4e74424b0e/vote')
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message',"product Successfully UpVoted!");
                    expect(res.body.data.upvotes).to.equal(1);
                    Datastore.collection.remove();
                    done();
                });
        });

    });


});
module.exports = server;
