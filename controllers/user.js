const User = require("../models/user");   // bring in User model

// User By ID
exports.userById = (req, res, next, id) => {
	// try to find the user, get error or user
	User.findById(id).exec((err, user) => {
		// if error or no user
		if(err || !user) {
			return res.status(400).json({
				error: "User not found"
			});
		}
		// add user information to request object with name of profile
		req.profile = user;
		// next phase of middleware
		next();
	});
};

// READ PROFILE
exports.read = (req, res) => {
	req.profile.hashed_password = undefined;
	req.profile.salt = undefined;
	return res.json(req.profile);
};

// UPDATE PROFILE
exports.update = (req, res) => {
	// find the user by id and update with provided info from fields
	User.findOneAndUpdate(
		{ _id: req.profile._id }, 
		{ $set: req.body }, 
		{ new: true },
		(err, user) => {
			if(err) {
				return res.status(400).json({
					error: "You are not authorized to perform this action."
				});
			}
			user.hashed_password = undefined;
			user.salt = undefined;
			res.json(user);
		}
	);
};