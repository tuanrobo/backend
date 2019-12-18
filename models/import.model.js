const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const importSchema = new Schema({
	date: Date,	
	items: [{
		product: String,
		quantity: {type: Number, required: true ,default: 0},
	}],	
},{
	timestamps: true
});

const Import = mongoose.model('Import', importSchema);

module.exports = Import;