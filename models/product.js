const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32
		},
		description: {
			type: String,
			trim: true,
			required: true,
			maxlength: 2000
		},
		price: {
			type: Number,
			trim: true,
			required: true,
			maxlength: 32
		},
		category: {
			type: ObjectId,
			ref: "Category",
			required: true
		},
		quantity: {
			type: Number
		},
		sold: {
			type: Number,
			default: 0
		},
		photo: {
			data: Buffer,
			contentType: String
		},
		shipping: {
			required: false,
			type: Boolean
		},
		condition: {
			type: String,
			trim: true,
			maxlength: 100
		},
		rarity: {
			type: String,
			trim: true,
			maxlength: 32
		},
		expansion: {
			type: String,
			trim: true,
			maxlength: 100
		},
		maker: {
			type: String,
			trim: true,
			maxlength: 100
		},
		released: {
			type: String,
			trim: true,
			maxlength: 32
		}

	}, 
	{timestamps: true}
);


module.exports = mongoose.model("Product", productSchema);