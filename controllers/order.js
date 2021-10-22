const {Order, CartItem} = require("../models/order");
const { errorHandler} = require("../helpers/dbErrorHandler");

// Get Order by ID
exports.orderById = (req, res, next, id) => {
	Order.findById(id)
		.populate("products.product", "name price")
		.exec((err, order) => {
			if (err || !order){
				return res.status(400).json({
				error: errorHandler(error)
				});
			}
			// make order available in the request
			req.order = order;
			next();
		});
};

// Create Order
exports.create = (req, res) => {
	console.log("CREATE ORDER:", req.body);
	req.body.order.user = req.profile;
	const order = new Order(req.body.order);
	order.save((error,data) => {
		if(error) {
			return res.status(400).json({
				error: errorHandler(error)
			})
		}
		res.json(data);
	});
};

// List all Orders
exports.listOrders = (req, res) => {
    Order.find()
        .populate("user", "_id name address")
        .sort("-created")
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(error)
                });
            }
            res.json(orders);
        });
};

// Get Order Status Values
exports.getStatusValues = (req, res) => {
	res.json(Order.schema.path("status").enumValues);
};

// Update Order Status
exports.updateOrderStatus = (req, res) => {
	Order.update(
		// send order ID from front end client
		{_id: req.body.orderId}, 
		// use mongoose method to set status
		{$set: {status: req.body.status}}, 
		// use callback for either error or order
		(err, order) => {
			if (err) {
				return res.status(400).json({
				error: errorHandler(error)
				});
			}
			res.json(order);
		}
	);
};