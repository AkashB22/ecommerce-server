let productsController = {};

let formidable = require('formidable');
let fs = require('fs');
let async = require('async');
let {promisify} = require('util');
let unlinkFile = promisify(fs.unlink);
let readFile = promisify(fs.readFile);
let productsService = require('../services/productsService');
let reviewsService = require('../services/reviewsService');
let validation = require('./../lib/validation');


productsController.createProduct = async (req, res, next)=>{
    try{
        const option = {
            uploadDir: __dirname + '/../imagePath', 
            multiples: true,
            keepExtensions: true
        };
        const form = formidable(option);
    
        form.on('fileBegin', (filename, file) => {
            let fileWithoutExtension = file.name.split('.');
            file.path = `${__dirname}/../imagePath/${fileWithoutExtension[0]}_${Date.now()}.${fileWithoutExtension[1]}`
            form.emit('data', { name: 'fileBegin', filename, value: file });
        });
           
        form.on('file', (filename, file) => {
            form.emit('data', { name: 'file', key: filename, value: file });
        });
           
        form.on('field', (fieldName, fieldValue) => {
            form.emit('data', { name: 'field', key: fieldName, value: fieldValue });
        });
           
        form.once('end', () => {
            console.log('Done!');
        })
          
        form.parse(req, async (err, fields, files)=>{
            if(err){
                res.status(500).json({
                    info: 'Internal server error',
                    error: err
                });
            }
            let productObj = {};
            for(let key of Object.keys(fields)){
                if(key === 'offers' || key === 'sizes' || key === 'colors'){
                    let toArr = fields[key].split(',');
                    productObj[key] = toArr;
                }else if(key === 'isDiscounted' || key === 'isTrending'){
                    productObj[key] = fields[key].toLowerCase() === 'yes' ? true : false;
                } else {
                    productObj[key] = fields[key];
                }
            }
            let arrOfImages = [];
            for(let key of Object.keys(files)){
                arrOfImages = arrOfImages.concat(files[key]);
            }
            productObj['imagePath'] = [];
            for(let i=0; i<arrOfImages.length; i++){
               if(arrOfImages[i]['name']){
                    let imagePath = arrOfImages[i]['path'].split('/');
                    productObj['imagePath'].push(imagePath[imagePath.length-1]);
               } 
            }
    
            let product = await productsService.create(productObj);
    
            res.status(200).json({  
                info: "created your product",
                product: product
            });
        });
    } catch(e){
        res.status(500).json({
            info: 'Internal server error',
            error: e.message
        });
    }
}

productsController.getAllProducts = async (req, res, next)=>{
    try{
        let products = await productsService.getAllProducts();

        res.status(200).json({  
            info: "Fetched all products",
            products: products
        });
    } catch(e){
        res.status(500).json({
            info: 'Internal server error',
            error: e.message
        });
    }
}

productsController.getParticularProduct = async (req, res, next)=>{
    try{
        let productId = req.params.id;

        let product = await productsService.readById(productId);

        async.waterfall([(callback)=>{
            let count = 0;
            if(Array.isArray(product.imagePath) && product.imagePath.length > 0){
                product.imagePath.forEach(async (image, index)=>{
                    let base64Image = await readFile(__dirname + '/../imagePath/' + image, 'base64');
                    count++;
                    product.imagePath[index] = `data:image/jpeg;base64,${base64Image}`;
                    if(count === product.imagePath.length) callback(null, product);
                })
            }
        }], (error, response)=>{
            if(error){
                res.status(500).json({
                    info: 'Internal server error',
                    error: e.message
                });
            }
            res.status(200).json({  
                info: "Successfully fetched the product",
                product: response
            });
        })
        
    } catch(e){
        res.status(500).json({
            info: 'Internal server error',
            error: e.message
        });
    }
}

productsController.updateParticularProduct = async (req, res, next)=>{
    try {
        let productId = req.params.id;
        let {error} = validation.updateProductJsonFields(req);
        let totalReviewId = [];

        if(error){
            return res.status(400).json({
                'info': 'Validation error in inputs',
                'error': error.details[0].message
            });
        }

        if(req.body.reviews){
            let reviews = req.body.reviews;
            for(let i=0; i<reviews.length; i++){
                let savedReviews = await reviewsService.create(reviews[i]);
                totalReviewId.push(savedReviews._id);
            }
        }

        let product = await productsService.readById(productId);

        product.name =  req.body.name ? req.body.name : product.name;
        // imagePath: ['bg-10.jpg', 'bg-69.jpg', 'bg-84.jpg', 'image00008.jpg'],
        product.description = req.body.description ? req.body.description : product.description;
        product.discountPercent = req.body.discountPercent ? req.body.discountPercent : product.discountPercent;
        product.availableQuantity = req.body.availableQuantity ? req.body.availableQuantity : product.availableQuantity;
        product.price = req.body.price ? req.body.price : product.price;
        product.category = req.body.category ? req.body.category : product.category;
        product.seller = req.body.seller ? req.body.seller : product.seller;
        product.reviews =totalReviewId ? product.reviews.concat(totalReviewId) : product.reviews;
        product.isTrending = req.body.isTrending ? req.body.isTrending : product.isTrending;
        product.isDiscounted = req.body.isDiscounted ? req.body.isDiscounted : product.isDiscounted;
        product.offers = req.body.offers ? req.body.offers : product.offers;
        product.sizes = req.body.sizes ? req.body.sizes : product.sizes;
        product.colors = req.body.colors ? req.body.colors : product.colors;
        product.averageRating = req.body.averageRating ? req.body.averageRating : product.averageRating;

        let updatedProduct = await productsService.update(product);

        res.status(200).json({
            info: "Successfully updated the product",
            product: updatedProduct
        });
    } catch (e) {
        res.status(500).json({
            info: 'Internal server error',
            error: e.message
        });
    }
}

productsController.deleteParticularProduct = async (req, res, next)=>{
    try{
    let productId = req.params.id;

        let deletedProduct = await productsService.delete(productId);

        res.status(200).json({
            info: "Successfully deleted the product",
            deletedProduct: deletedProduct
        });
    } catch (e) {
        res.status(500).json({
            info: 'Internal server error',
            error: e.message
        });
    }
}

productsController.updateImagesForProduct = async (req, res, next)=>{
    try{
        let productId = req.params.id;
        let options = option = {
            uploadDir: __dirname + '/../imagePath', 
            multiples: true,
            keepExtensions: true
        };
        const form = formidable(options);

        form.on('fileBegin', (filename, file) => {
            let fileWithoutExtension = file.name.split('.');
            file.path = `${__dirname}/../imagePath/${fileWithoutExtension[0]}_${Date.now()}.${fileWithoutExtension[1]}`
            form.emit('data', { name: 'fileBegin', filename, value: file });
        });
        
        form.on('file', (filename, file) => {
            form.emit('data', { name: 'file', key: filename, value: file });
        });
        
        form.on('field', (fieldName, fieldValue) => {
            form.emit('data', { name: 'field', key: fieldName, value: fieldValue });
        });
        
        form.once('end', () => {
            console.log('Done!');
        })
        
        form.parse(req, async (err, fields, files)=>{
            if(err){
                res.status(500).json({
                    info: 'Internal server error',
                    error: err
                });
            }
            let product = await productsService.readById(productId);
            let arrOfImages = [];
            for(let key of Object.keys(files)){
                arrOfImages = arrOfImages.concat(files[key]);
            }
            for(let i=0; i< product['imagePath'].length; i++){
                await unlinkFile(__dirname + '/../imagePath/' + product['imagePath'][i]);
            }
            product['imagePath'] = [];
            for(let i=0; i<arrOfImages.length; i++){
            if(arrOfImages[i]['name']){
                    let imagePath = arrOfImages[i]['path'].split('/');
                    product['imagePath'].push(imagePath[imagePath.length-1]);
            } 
            }

            let updatedProduct = await productsService.update(product);

            res.status(200).json({  
                info: "images are updated in your product",
                product: updatedProduct
            });
        });
    } catch(e){
        res.status(500).json({
            info: 'Internal server error',
            error: e.message
        });
    }
}

module.exports = productsController;