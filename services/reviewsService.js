let reviewsService = {};

let ReviewsModel = require('./../models/reviews');

reviewsService.create = async (reviewsObj)=>{
    let review = new ReviewsModel({
        name: reviewsObj.name,
        rating: reviewsObj.rating,
        description: reviewsObj.description
    });

    return await review.save();
}

reviewsService.update = async (reviews)=>{
    return await reviews.save();
};

reviewsService.readById = async (reviewsId)=>{
    return await review.findbyId(reviewsId);
} 

reviewsService.delete = async (reviewsId)=>{
    return await reviews.findByIdAndDelete(reviewsId);
}

module.exports = reviewsService;

