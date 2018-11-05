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
    describe('PUT /products/:id/vote', function () {
        it('should return a 404 and a message for invalid product id', function(done) {
            chai.request(server)
                .put('/products/5bdxxxxxx7179a176d3b377a/vote')
                .end(function(err, res) {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message').equal('product NOT Found!' ) ;
                    done();
                });
        });
        it('should return a message and the product reported by 1', function(done) {
            chai.request(server)
                .put('/products/5bd0b9e03aa4ac29084f6fc7/vote')
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    // let imitation = res.body.data ;
                    // expect(imitation).to.include( { brand:'Coach', type:'bag', price:350, reports: 20  } );
                    expect(res.body).to.have.property('message').equal('product Successfully UpVoted!' );
                    done();
                });
        });
        after(function  (done) {
            chai.request(server)
                .get('/products')
                .end(function(err, res) {
                    let result = _.map(res.body, (product) => {
                        return { name: product.name,
                            paymenttype: product.paymenttype,
                            amount: product.amount,
                        };
                    }  );
                    expect(result).to.include( {name:"Air Jordan 1*Off-White",paymenttype:"Direct",amount: 1600 } );
                    Datastore.collection.remove();
                    done();
                });
        });
    });

    describe('Delete /products/:id', function () {
        describe('when it is valid id', function () {
            it('should return a message and the product successfully deleted', function (done) {
                chai.request(server)
                    .delete('/products/5bd0b9e03aa4ac29084f6fc7')
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('message').equal('product Successfully Deleted!');
                        done();
                    })
            });
            after(function (done) {
                chai.request(server)
                    .get('/products')
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.a('array');
                        let result = _.map(res.body, (product) => {
                            return {
                                name: product.name,
                                paymenttype: product.paymenttype,
                                amount: product.amount,
                            };
                        });
                        expect(result).to.not.include({
                            name: "Air Jordan 1*Off-White",
                            amount: 1600,
                            paymenttype: "Direct"
                        });
                        done();
                    });
            });
            describe('when it is invalid', function () {
                it('should return a message and the product unsuccessfully deleted', function (done) {
                    chai.request(server)
                        .delete('/products/5bdxxxxxx7179a176d3b377a')
                        .end(function (err, res) {
                            expect(res).to.have.status(200);
                            expect(res.body).to.have.property('message').equal('product NOT DELETED!');
                            Datastore.collection.remove();
                            done();
                        })
                });

            });
        });

    });


});
module.exports = server;
