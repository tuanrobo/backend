const orderRouter = require('express').Router();
let Order = require('../models/order.model');
let Inventory = require("../models/inventory.model");
var async = require("async");


// GET
orderRouter.route('/').get((req, res) => {
	Order.find()
		.then(order => res.json(order))
		.catch(err => res.status(400).json('Error: ' + err));
	console.log("This is get order method to order list")
});


// GET ORDER BY ID
orderRouter.route('/:id').get((req, res) => {
	Order.findById(req.params.id)
		.then(order => res.json(order)
		)
		.catch(err => res.status(400).json('Error: ' + err));
	console.log("This is get order to edit")
});



// CREATE NEW ORDER
orderRouter.route('/add').post((req, res) => {
	const customername = req.body.customername;
	const order_items = req.body.order_items;
	const description = req.body.description;
	const paid_status = req.body.paid_status;
	const date = Date.parse(req.body.date);

	// Ham check dieu kien
	var check_inStock = true;

	// lay list product tu order items
	function getProduct(item) { return item.product }
	const order_product = order_items.map((value, i) => (
		getProduct(value)
	))

	console.log('Order product:', order_product)

	// lay list of inventory tu list product
	Inventory.find({ product: { $in: order_product } }, (err, items) => {
		// console.log('items', items)		
		async.eachSeries(order_items, function (order_item, callback) {
			var orderQuantity = parseInt(order_item.quantity);
			var existenStock = items.find(itm => itm.product == order_item.product);
			if (existenStock == 0 || existenStock == undefined) {
				check_inStock = false
				console.log(`${order_item.product} không tồn tại trong Inventory!`)


			} else {
				console.log(`Order Item: ${order_item.product}`)
				console.log(`ExistentStock: ${existenStock.product}`)
				if (order_item.product == existenStock.product) {
					var inStock = existenStock.in_stock;
					var remainInStock = inStock - orderQuantity;
					var product = existenStock.product;

					console.log('--------------------------------------------')
					console.log(`- Order quantity of ${product} = ${orderQuantity}`)
					console.log(`- Instock current = ${inStock}`)

					if (orderQuantity > inStock) {
						console.log('- Instock Remain =', remainInStock)
						check_inStock = false
						console.log(`- ${product} Không đủ hàng để tạo!`)
					} else {
						var options = { new: false, useFindAndModify: false }
						Inventory.findOneAndUpdate({ product: existenStock.product }, { in_stock: remainInStock }, options, (err, res) => {
							console.log('- Instock remain = ', remainInStock)
						})
					}
					console.log('--------------------------------------------')
				}
			}
			callback();
		}, function (err) {
			if (err) {
				console.log('Error');
				throw err;
			}
			// Ham xu ly sau khi check
			if (check_inStock) {
				console.log('- HỢP LỆ!')
				const newOrder = new Order({ customername, order_items, description, paid_status, date });
				newOrder.save()
					.then(() => res.json('Tạo Đơn Thành Công!'))
					.catch(err => res.status(400).json('Error: ' + err));
			} else {
				console.log('- KHÔNG HỢP LỆ!')
			}
			console.log('-----------------KẾT THÚC----------------')
		});
	});
});




// DELETE 
orderRouter.route('/:id').delete((req, res) => {
	Order.findByIdAndDelete(req.params.id, (err, item) => {
		item.order_items.map((value) => {
			var options = { new: false, useFindAndModify: false }
			Inventory.findOne({ product: value.product }, (err, items) => {
				console.log(`- Current stock of ${value.product} is ${items.in_stock}`)
				var newStockUpdate = items.in_stock + value.quantity
				if (err) {
					res.status(400).send(err);
				} else {
					Inventory.updateOne({ product: value.product }, { $set: { in_stock: newStockUpdate } }, options, (err, doc) => {
						console.log(`- New stock updated of ${value.product} is ${newStockUpdate}`)
					})
				}
			})
		})
		if (err) {
			res.status(400).json('Error: ' + err);
		} else {
			res.status(200).json('An order has been deleted!')
		}
	})
})


// UPDATE
orderRouter.route('/update/:id').post((req, res) => {	
	const orderItem = req.body.order_items
	const newOrderQuantity = orderItem[0].quantity
	console.log(`- New order quantity:' ${newOrderQuantity}`)

	Order.findByIdAndUpdate(req.params.id, req.body, {useFindAndModify:false} ,(err, item) => {
		const currentOrderQuantity = item.order_items[0].quantity
		const currentOrderProduct = item.order_items[0].product
		console.log(`- Old order quantity of ${currentOrderProduct}: ${currentOrderQuantity}`)

		item.order_items.map((value) => {
			var options = { new: false, useFindAndModify: false }
			Inventory.findOne({ product: value.product }, (err, items) => {
				console.log(`- Current stock of ${value.product}: ${items.in_stock}`)
				var inStock = items.in_stock;
				var newStockUpdate = currentOrderQuantity + inStock - newOrderQuantity

				if (err) {
					console.log('- In stock is not enough!')
					res.status(400).send(err);
				} else {
					Inventory.updateOne({ product: value.product }, { $set: { in_stock: newStockUpdate } }, options, (err, doc) => {
						console.log(`- New stock updated of ${value.product}: ${newStockUpdate}`)
					})
				}
			})
		})
		if (err) {
			res.status(400).json('Error: ' + err);
		} else {
			res.status(200).json('An order has been updated!')
		}
	})

})

module.exports = orderRouter;