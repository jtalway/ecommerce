const User = require("../models/user");   // bring in User model
const {Order} = require("../models/order");
const {errorHandler} = require("../helpers/dbErrorHandler");

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
// console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
	const { name, password } = req.body;

	User.findOne({ _id: req.profile._id }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: 'User not found'
			});
		}
		if (!name) {
			return res.status(400).json({
				error: 'Name is required'
			});
		} else {
			user.name = name;
		}

		if (password) {
			if (password.length < 6) {
				return res.status(400).json({
					error: 'Password should be min 6 characters long'
				});
			} else {
				user.password = password;
			}
		}

		user.save((err, updatedUser) => {
			if (err) {
				console.log('USER UPDATE ERROR', err);
				return res.status(400).json({
					error: 'User update failed'
				});
			}
			updatedUser.hashed_password = undefined;
			updatedUser.salt = undefined;
			res.json(updatedUser);
		});
	});
};

// Add Order to User History
exports.addOrderToUserHistory = (req, res, next) => {
	let history = [];
	// get all products from the order
	// for each item push to history array
	req.body.order.products.forEach((item) => {
		history.push({
			_id: item._id,
			name: item.name,
			description: item.description,
			category: item.category,
			quantity: item.count,
			transaction_id: req.body.order.transaction_id,
			amount: req.body.order.amount
		})
	});
	// find the user by id, push the history, retrieve updated user info and send back
	User.findOneAndUpdate(
		{_id: req.profile._id}, 
		{$push: {history: history}}, 
		{new: true}, 
		(error, data) => {
			if (error) {
				return res.status(400).json({
					error: "Could not update user purchase history"
				});
			}
			next();
		}
	);
};

// Get Users past purchases
exports.purchaseHistory = (req, res) => {
	Order.find({user: req.profile._id})
		.populate("user", "_id name")
		.sort("-createdAt")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			res.json(orders);
		});
};

// User List
exports.listUsers = (req, res) => {
	User.find({})
		.populate("user", "_id name email about role")
		.sort("-createdAt")
		.exec((err, users) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			res.json(users);
		});
};