let userProfilesService = {};

let UserProfileModel = require('../models/userProfiles');

userProfilesService.create = async (user)=>{
    let userProfile = new UserProfileModel({
        email: user.email,
        username: user.username,
        phone: user.phone,
        user : user.userId
    });

    let savedUserProfile = await userProfile.save();

    return savedUserProfile;
}

userProfilesService.read = async (userId)=>{
    let userProfile = await UserProfileModel.findOne({user : userId});

    return userProfile;
}

userProfilesService.update = async (userProfile)=>{
    let updatedUserProfile = await userProfile.save();

    return updatedUserProfile;

}

userProfilesService.findByIdAndDelete = async (userProfileId)=>{
    let deletedUserProfile = await UserProfileModel.findByIdAndDelete(userProfileId);

    return deletedUserProfile;
}

userProfilesService.deleteByUserId = async (userId)=>{
    let deletedUserProfile = await UserProfileModel.deleteOne({user: userId});

    return deletedUserProfile;
}

module.exports = userProfilesService;
