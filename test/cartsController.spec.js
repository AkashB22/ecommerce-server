const cartsController = require('./../controllers/cartsController'),
cartsService = require('../services/cartsService'),
productsService = require('../services/productsService'),
req = {body:{
    userId: 'testUser',
    productId: "productId",
    quantity: 1
}},
sinon = require('sinon'),
chai = require('chai'),
error = new Error("bla bla bla");
let res = {}, expectedRes, next;
describe("CartsController:", ()=>{
    beforeEach(()=>{
        res = {
            json: sinon.spy(),
            status: sinon.stub().returns({ end: sinon.spy(), json: sinon.spy() }) //json required here to respond with message in addition to 404
        }
        next = sinon.spy();
    })
    it("create api check", ()=>{
        sinon.stub(productsService, 'readById').yields(error)
        cartsController.create(req, res, next);
        sinon.assert.calledOnce(productsService.readById);
        sinon.assert.calledOnce(next);
    })
})