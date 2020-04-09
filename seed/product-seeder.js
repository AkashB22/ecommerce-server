let mongoose = require('mongoose');
let ProductModel = require('./../models/products');
let reviewModel = require('./../models/reviews');

mongoose.connect('mongodb://localhost:27017/ecommerce');

let db = mongoose.connection;

db.on('error', (err)=>{
  console.log(err);
});

db.once('open', ()=>{
  console.log('db is connected');
});

let products = [
    new ProductModel({
        name: 'Monkey.D.Luffy, Straw Hats',
        imagePath: ['bg-10.jpg', 'bg-69.jpg', 'bg-84.jpg', 'image00008.jpg'],
        description: 'Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs',
        discountPercent: 10,
        availableQuantity: 100,
        price: 799,
        category: 'pirates',
        seller: 'Online Store',
        reviews: [],
        isTrending: true,
        isDiscounted: true,
        offers: ['Bank Offer20% Discount on SBI cards', 'Bank Offer5% CashBack offer on Axis Bank', 'Bank Offer25% Discount on all Credit cards', 'Coupon OfferExtra 10% Offer Coupon on BookMyShow'],
        sizes: ['small', 'medium', 'large'],
        colors: ['Sky Blue', 'Blue', 'Green', 'Yellow', 'Red'],
        averageRating: 3.5
    }),
    new ProductModel({
        name: 'WhiteBeard, Whitebeard pirates',
        imagePath: ['bg-10.jpg', 'bg-69.jpg', 'bg-84.jpg', 'image00008.jpg'],
        description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Architecto adipisci modi',
        discountPercent: 10,
        availableQuantity: 100,
        price: 799,
        category: 'pirates',
        seller: 'Online Store',
        reviews: [],
        isTrending: true,
        isDiscounted: true,
        offers: ['Bank Offer20% Discount on SBI cards', 'Bank Offer5% CashBack offer on Axis Bank', 'Bank Offer25% Discount on all Credit cards', 'Coupon OfferExtra 10% Offer Coupon on BookMyShow'],
        sizes: ['small', 'medium', 'large'],
        colors: ['Sky Blue', 'Blue', 'Green', 'Yellow', 'Red'],
        averageRating: 3.5
    }),    
]

let done = 0;

for(let product of products){
    product.save(()=>{
        done++;
        if(done === products.length){
            disconnect();
        }
    })
}

function disconnect(){
    console.log('db is disconnected');
    mongoose.disconnect();
}