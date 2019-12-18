const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
	product: {type: String, unique: true,},	
	in_stock: { type: Number, required: true, default: 0 },
	price: { type: Number, required: false },
	dateUpdate: Date
}, {
	timestamps: true
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;