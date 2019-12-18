const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
	customername: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		minlength: 3
	},customer_info: [{
		address: String,
		phone_number: Number,	
	}]
}, {
	timestamps: true,
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;