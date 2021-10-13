const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const {errorHandler} = require("../helpers/dbErrorHandler");

// FIND PRODUCT
exports.productById = (req, res, next, id) => {
	// access Product model
	Product.findById(id).exec((err, product) => {
		// error or no product
		if(err || !product) {
			return res.status(400).json({
				error: "Product not found"
			});
		}
		// make product we found in database available
		req.product = product;
		next();
	});
};

// READ PRODUCT
exports.read = (req, res) => {
	req.product.photo = undefined;
	// return requested product in response
	return res.json(req.product);
};

// CREATE PRODUCT
exports.create = (req, res) => {
	// get incoming form data
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	// parse the request
	form.parse(req, (err, fields, files) => {
		if(err) {
			return res.status(400).json({
				error: "Image could not be uploaded"
			});
		}

		// grab all fields
		const {
			name, 
			description, 
			price, 
			category, 
			quantity, 
			shipping
		} = fields;

		if (
			!name || 
			!description || 
			!price || 
			!category || 
			!quantity || 
			!shipping
		) {
			return res.status(400).json({
				error: "All fields are required"
			});
		}

		// create a new product with supplied fields
		let product = new Product(fields);

		// add photo to product
		if(files.photo) {
			// console.log("FILES PHOTO: ", files.photo);
			// 1 kb = 1000
			// 1 mb = 1000000
			if(files.photo.size > 2000000) {
				return res.status(400).json({
				error: "Image needs to be 2 MB or less"
				});
			}
			product.photo.data = fs.readFileSync(files.photo.path);
			product.photo.contentType = files.photo.type;
		}

		// save product in DB
		product.save((err, result) => {
			if(err) {
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			// send json response
			res.json(result);
		});
	});
};


// DELETE PRODUCT
exports.remove = (req, res) => {
	// grab product
	let product = req.product;
	product.remove((err, deletedProduct) =>{
		if(err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({
			"message": "Product deleted successfully"
		});
	});
};

// UPDATE PRODUCT
exports.update = (req, res) => {
	// get incoming form data
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	// parse the request
	form.parse(req, (err, fields, files) => {
		if(err) {
			return res.status(400).json({
				error: "Image could not be uploaded"
			});
		}

		// grab all fields
		const {
			name, 
			description, 
			price, 
			category, 
			quantity, 
			shipping
		} = fields;

		if (
			!name || 
			!description || 
			!price || 
			!category || 
			!quantity || 
			!shipping
		) {
			return res.status(400).json({
				error: "All fields are required"
			});
		}

		// replace with the new information
		let product = req.product;
		// use lodash to extend product with supplied fields
		product = _.extend(product, fields);

		// add photo to product
		if(files.photo) {
			// console.log("FILES PHOTO: ", files.photo);
			// 1 kb = 1000
			// 1 mb = 1000000
			if(files.photo.size > 2000000) {
				return res.status(400).json({
				error: "Image needs to be 2 MB or less"
				});
			}
			product.photo.data = fs.readFileSync(files.photo.path);
			product.photo.contentType = files.photo.type;
		}

		// save product in DB
		product.save((err, result) => {
			if(err) {
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			// send json response
			res.json(result);
		});
	});
};


// LIST PRODUCTS
// TOP SELLERS / NEW ARRIVALS
// by sell = /products?sortBy=sold&order=desc&limit=4
// by arrival = /products?sortBy=createdAt&order=desc&limit=4
// if no params are sent by client, then all products are returned
exports.list = (req, res) => {
	// if we get from route param (and default values)
	let order = req.query.order ? req.query.order : "asc";
	let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
	let limit = req.query.limit ? parseInt(req.query.limit) : 6;

	Product.find()
		.select("-photo")  // remove photo
		.populate("category")  // objectId in model
		.sort([[sortBy, order]])  // pass array of arrays
		.limit(limit)
		.exec((err, products) => {
			if(err) {
				return res.status(400).json({
					error: "Products not found"
				});
			}
			res.json(products);
		});
};

// LIST RELATED PRODUCTS
// it will find the product based on the req product category
// other products that have same category will be returned
exports.listRelated = (req, res) => {
	let limit = req.query.limit ? parseInt(req.query.limit) : 6;
	// find other products except this one (ne = not included)
	Product.find({ _id: { $ne: req.product }, category: req.product.category })
	.limit(limit)
	.populate("category", "_id name")
	.exec((err, products) => {
		if(err) {
			return res.status(400).json({
				error: "Products not found"
			});
		}
		res.json(products);
	});
};

// LIST CATEGORIES USED
exports.listCategories = (req, res) => {
	// get all the categories used in the Product model
	Product.distinct("category", {}, (err, categories) => {
		if(err) {
			return res.status(400).json({
				error: "Categories not found"
			});
		}
		res.json(categories);
	});
};

// LIST BY SEARCH
/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    // pagination
    let skip = parseInt(req.body.skip);
    // category ids and price points
    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],  // mongo >=
                    $lte: req.body.filters[key][1]  // mongo <=
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

// RETURN PHOTO
exports.photo = (req, res, next) => {
	if(req.product.photo.data) {
		res.set("Content-Type", req.product.photo.contentType);
		return res.send(req.product.photo.data);
	}
	next();
};