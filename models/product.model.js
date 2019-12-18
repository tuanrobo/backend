const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
	product: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		minlength: 3
	},
	model: {
		type: String,
		unique: true
	}
}, {
	timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;