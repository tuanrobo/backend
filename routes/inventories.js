const inventoryRouter = require('express').Router();
let Inventory = require('../models/inventory.model');

inventoryRouter.route('/').get((req, res) => {
	Inventory.find()
		.then(store => res.json(store))
		.catch(err => res.status(400).json('Error: ' + err)); 
		console.log("Inventory list")
});


// inventoryRouter.route('/update').post((req, res) => {
// 	console.log("Inventory ADD",req.body)
// 	const importTotal = req.body.importTotal;
// 	const date = req.body.date;
	
// 	const newImportTotal = new Inventory({importTotal,date});

// 	newImportTotal.save()
// 		.then(() => res.json('Inventory added!'))
// 		.catch(err => res.status(400).json('Error: ' + err.res));
// });


// inventoryRouter.route('/update').post((req, res) => {
// 	var product = ['-1'];
// 	Inventory.find({'importTotal.date':{$in: product}}).sort({date: -1}).limit(1);
// });

module.exports = inventoryRouter;