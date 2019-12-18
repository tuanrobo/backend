const customerRouter = require('express').Router();
let Customer = require('../models/customer.model');

customerRouter.route('/').get((req, res) => {
	Customer.find()
		.then(customers => res.json(customers))
		.catch(err => res.status(400).json('Error: ' + err));
});

customerRouter.route('/add').post((req, res) => {
	const customername = req.body.customername;
	const customer_info = req.body.customer_info;	
	const newCustomer = new Customer({customername, customer_info});

	newCustomer.save()
		.then(() => res.json('Customer added!'))
		.catch(err => res.status(400).json('Error: ' + err));
});

module.exports = customerRouter;