const productRouter = require('express').Router();
let Product = require('../models/product.model');

productRouter.route('/').get((req, res) => {
	Product.find()
		.then(product => res.json(product))
		.catch(err => res.status(400).json('Error: ' + err)); 
});

productRouter.route('/add').post((req, res) => {
	console.log("ADD",req.body.product)
	const product = req.body.product;
	const model = req.body.model;
	const newProduct = new Product({product, model});

	newProduct.save()
		.then(() => res.json('Product added!'))
		.catch(err => res.status(400).json('Error: ' + err));
});

module.exports = productRouter;