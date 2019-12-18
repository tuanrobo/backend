const importRouter = require("express").Router();
let Import = require("../models/import.model");
let Inventory = require("../models/inventory.model");

// router.route("/").get((req, res) => {
// 	Import.find()
// 		.then(products => res.json(products))
// 		.catch(err => res.status(400).json("Error: " + err));
// });

importRouter.route("/add").post((req, res) => {
	const items = req.body.items;
	const date = Date.parse(req.body.date);

	const newImport = new Import({ items, date });
	console.log("1. New Import", newImport);

	newImport
		.save()
		.then(() => {
			newItems = items.map(item => {
				findInStock = Inventory.find({ product: item.product },  (err,currentStock) => {
					if (currentStock === undefined || currentStock.length == 0) {
						newQuantity = parseInt(item.quantity, 10);
						console.log("-----------------------------------------------");
						console.log("2. New Quantity is", newQuantity);
						console.log("");
						var newInventory = new Inventory({
							product: item.product,
							in_stock: newQuantity
						});
						newInventory
							.save()
							.then(() => {
								return res.send();
							})
							.catch(err => res.status(400).json("Error: " + err));
					} else {
						var currentStockQuantity = currentStock[0].in_stock;
						var addStockQuantity = parseInt(item.quantity, 10);
						var newStockQuantity = currentStockQuantity + addStockQuantity;
						var options = { new: false, useFindAndModify: false }

						Inventory.findOneAndUpdate({ product: item.product }, { in_stock: newStockQuantity }, options, (err, res) => {
							console.log("-----------------------------------------------");
							console.log("3. Total Stocks in Inventory:", newStockQuantity);
							console.log("");
						})
					}
					res.json("Import added to database!");
				});
			});
		})
		.catch(err => res.status(400).json("Error: " + err));
});

module.exports = importRouter;
