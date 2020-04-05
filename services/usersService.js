let usersService = {};

let UsersModel = require('./../models/users');

usersService.create = async (userObj)=>{
    let user = new UsersModel({
        email: userObj.email,
        password: userObj.password,
        username: userObj.username,
        phone: userObj.phone
    });

    let savedUser = await user.save(user);
    return savedUser;
};

usersService.readById = async (userId)=>{
    let user = await UsersModel.findById(userId);

    return user;
};

usersService.readByEmail = async (email)=>{
    let user = await UsersModel.findOne({email: email});

    return user;
}

usersService.readByResetPasswordToken = async (resetPasswordToken, onlyEmail=true)=>{
    let user = null;
    if(onlyEmail){
        user = await UsersModel.findOne({resetPasswordToken, resetPasswordExpires: {$gt : Date.now()}}).select('email');
    } else{
        user = await UsersModel.findOne({resetPasswordToken, resetPasswordExpires: {$gt : Date.now()}});
    }

    return user;
}

usersService.update = async (user)=>{
    return await user.save();
}

usersService.deleteById = async (userId)=>{
    return await UsersModel.deleteById(userId);
}

usersService.deleteByEmail = async (email)=>{
    return await UsersModel.deleteOne({email});
}

usersService.getFullUserDetails = async (email)=>{
    let userDetails = await UsersModel.findOne({email}).populate('userProfile').select("-_id -__v").exec();

    return userDetails;
}
module.exports = usersService;