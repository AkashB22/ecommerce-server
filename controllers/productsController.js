let productsController = {};

let formidable = require('formidable');
let fs = require('fs');
let async = require('async');
let etag = require('etag');
let _ = require('lodash');
let {promisify} = require('util');
let unlinkFile = promisify(fs.unlink);
let readFile = promisify(fs.readFile);
let productsService = require('../services/productsService');
let reviewsService = require('../services/reviewsService');
let validation = require('./../lib/validation');
let mimeType = require('mime');
let path = require('path');
const http = require('http');
const qs = require('querystring');
const rp = require('request-promise').defaults({simple : false});
var tough = require('tough-cookie');


productsController.createProduct = async (req, res, next)=>{
    try{
        const option = {
            uploadDir: __dirname + '/../../../imagePath', 
            multiples: true,
            keepExtensions: true
        };
        const form = formidable(option);
        
        form.on('fileBegin', (filename, file) => {
            let fileWithoutExtension = file.name.split('.');
            file.path = `${__dirname}/../../../imagePath/${fileWithoutExtension[0]}_${Date.now()}.${fileWithoutExtension[1]}`
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

        let productsObj = [];

        products.forEach(product=>{
            const newProduct = {
                name: product.name,
                imagePath: product.imagePath,
                description: product.description,
                discountPercent: product.discountPercent,
                availableQuantity: product.availableQuantity,
                price: product.price,
                category: product.category,
                seller: product.seller,
                isTrending: product.isTrending,
                isDiscounted: product.isDiscounted,
                offers: product.offers,
                sizes: product.sizes,
                colors: product.colors,
                averageRating: product.averageRating ,
                _id: product._id
            }
            productsObj.push(newProduct);
        })

        // res.setHeader('Etag', etag(JSON.stringify(products)));
        // res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        // if(req.headers['if-none-match'] === etag(JSON.stringify(products))){
        //     res.status(304);
        // } else{
            async.eachSeries(productsObj, (product, callback)=>{
                if(product.imagePath[0] && product.imagePath[1]){
                    product.imageBase64Path = [];
                    fs.readFile(__dirname + '/../../../imagePath/' + product.imagePath[0], 'base64', (error, base64Image0)=>{
                        if(error && error.code && error.code === "ENOENT"){
                            return callback(null);
                        } else if(error){
                            return callback(error, null);
                        } else{
                            product.imageBase64Path.push(`data:image/jpeg;base64,${base64Image0}`);
                            fs.readFile(__dirname + '/../../../imagePath/' + product.imagePath[1], 'base64', (error, base64Image1)=>{
                                if(error && error.code && error.code === "ENOENT"){
                                    return callback(null);
                                } else if(error){
                                    return callback(error, null);
                                } else{
                                    product.imageBase64Path.push(`data:image/jpeg;base64,${base64Image1}`);
                                    return callback(null, product);
                                }
                            })
                        }
                    })
                } else{
                    return callback(null);
                }
            }, (error)=>{
                if(error){
                    return res.status(500).json({
                        info: 'Internal server error',
                        error: error.message
                    });
                }
                // console.log(product.imageBase64Path)
                
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, maxage=0");
                res.status(200).json({
                    message: "Fetched producted successfully",
                    products: productsObj
                })
            })
        // }
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
        let imageBase64Path = [];
        async.eachSeries(product.imagePath, (imagePath, callback)=>{
            if(imagePath){
                fs.readFile(__dirname + '/../../../imagePath/' + imagePath, 'base64', (error, base64Image)=>{
                    if(error && error.code && error.code === "ENOENT"){
                        return callback(null);
                    } else if(error){
                        return callback(error, null);
                    } else{
                        imageBase64Path.push(`data:image/jpeg;base64,${base64Image}`);
                        return callback(null, product);
                    }
                })
                    
            } else{
                return callback(true, null);
            }
        }, (error)=>{
            if(error){
                return res.status(500).json({
                    info: 'Internal server error',
                    error: error.message
                });
            }
            // console.log(product.imageBase64Path)
            return res.status(200).json({  
                info: "Successfully fetched the product",
                product: product,
                imageBase64Path: imageBase64Path
            });
        })
        
    } catch(e){
        return res.status(500).json({
            info: 'Internal server error',
            error: e.message
        });
    }
}

productsController.updateParticularProduct = async (req, res, next)=>{
    try {
        const option = {
            uploadDir: __dirname + '/../../../imagePath', 
            multiples: true,
            keepExtensions: true
        };
        const form = formidable(option);
    
        form.on('fileBegin', (filename, file) => {
            let fileWithoutExtension = file.name.split('.');
            file.path = `${__dirname}/../../../imagePath/${fileWithoutExtension[0]}_${Date.now()}.${fileWithoutExtension[1]}`
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
                return res.status(500).json({
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
            if(arrOfImages.length > 0){
                const previousImage = JSON.parse(productObj['imagePath']);
                productObj['imagePath'] = [];
                for(let i=0; i<arrOfImages.length; i++){
                    if(arrOfImages[i]['name']){
                            let imagePath = arrOfImages[i]['path'].split('/');
                            productObj['imagePath'].push(imagePath[imagePath.length-1]);
                    } 
                }

                for(let i=0; i<previousImage.length; i++){
                    try {
                        await unlinkFile(__dirname + '/../../../imagePath/' + previousImage[i]);
                    } catch (error) {
                        if(error && error.code && error.code === "ENOENT"){
                            console.log("file misiing");
                        } else {
                            return res.status(500).json({
                                'info': 'Error while deleting the files',
                                'error': error.message
                            });
                        }
                    }
                }
            }
    
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
            req.body = productObj;
            product.name =  req.body.name ? req.body.name : product.name;
            // imagePath: ['bg-10.jpg', 'bg-69.jpg', 'bg-84.jpg', 'image00008.jpg'],
            product.imagePath = Array.isArray(req.body.imagePath) && req.body.imagePath.length > 1 ? req.body.imagePath : product.imagePath;
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

productsController.sendImage = async (req, res,next)=>{
    let imageName = req.body.image;
    fs.readFile(__dirname + `/../../../imagePath/${imageName}`, 'base64', (error, base64Image)=>{
        if(error){
            return res.status(404).json({
                info: `Image with the ${imageName} name is missing`,
                error: error.message
            })
        } 
        const fileMimeType = mimeType.getType(imageName);
        // res.setHeader('Content-Type', fileMimeType);
        // res.setHeader('Content-Disposition', "attachment; filename=" + imageName);
        return res.status(200).json({
            data: `data:${fileMimeType};base64,${base64Image}`,
            info: `${imageName} sent successfully`
        });
    })

    // const fileMimeType = mimeType.getType(imageName);
    // res.setHeader('Content-Type', fileMimeType);
    // res.setHeader('Content-Disposition', "attachment; charset=utf-8; filename=" + imageName);
    // const resolvedPath = path.resolve(__dirname + `/../../../imagePath/${imageName}`);
    // res.sendFile(resolvedPath);
}

productsController.uploadAfile = (req, res, next)=>{
    const option = {
        uploadDir: __dirname + '/../../../imagePath', 
        multiples: true,
        keepExtensions: true
    };
    const form = formidable(option);
    let formData;

    form.on('fileBegin', (filename, file) => {
        let fileWithoutExtension = file.name.split('.');
        file.path = `${__dirname}/../../../imagePath/${fileWithoutExtension[0]}_${Date.now()}.${fileWithoutExtension[1]}`
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
        return res.status(200).json({data: "sent"});
            
    })
}

productsController.downloadImage = async (req, res, next)=>{
    let imageName = req.params.image;
    const fileStream = fs.createReadStream(__dirname + `/../../../imagePath/${imageName}`),
        fileMimeType = mimeType.getType(imageName);
    res.setHeader('Content-Type', fileMimeType);
    res.setHeader('Content-Disposition', "attachment; filename=" + imageName);
    res.setHeader('Content-Description', 'File-Transfer');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    fileStream.pipe(res);
    return;

    // const fileMimeType = mimeType.getType(imageName);
    // res.setHeader('Content-Type', fileMimeType);
    // res.setHeader('Content-Disposition', "attachment; charset=utf-8; filename=" + imageName);
    // const resolvedPath = path.resolve(__dirname + `/../../../imagePath/${imageName}`);
    // res.sendFile(resolvedPath);
}

module.exports = productsController;