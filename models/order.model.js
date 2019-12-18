const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
	customername: {
		type: String,
		required: true
	},
	order_items: [{
		product: String,
		quantity: {
			type: Number,
			required: true
		},
		price: {
			type: Number,			
		}

	}],
	paid_status: Boolean,
	date: {
		type: Date,
		// required: true	
		// set: getDate
	},
	description: {
		type: String,
		required: false,
	},
}, {
	timestamps: true,
});

// function getDate(v) {3
// 	return new Date(v.getDate(), v.getMonth(),v.getFullYear());
// }


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;