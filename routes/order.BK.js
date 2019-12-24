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
	const customerName = req.body.customername
	const orderItem = req.body.order_items
	const description = req.body.description
	const newOrderQuantity = orderItem[0].quantity
	Order.findById(req.params.id, (err, order) => {
		const currentOrderQuantity = order.order_items[0].quantity
		if (err) {
			console.log('Chưa biết gọi là lỗi gì')
		} else {
			var increaseOrderQuantity = newOrderQuantity - currentOrderQuantity
			var decreaseOrderQuantity = currentOrderQuantity - newOrderQuantity
			console.log('--------------------------------------------')
			console.log('1.Sản phẩm: ', order.order_items[0].product)
			console.log('2.Current order quantity:', currentOrderQuantity)
			console.log('3.New order quantity:', newOrderQuantity)
			if (newOrderQuantity > currentOrderQuantity) {
				console.log('4.Added order quantity(tăng):', increaseOrderQuantity)
			} else {
				console.log('4.Added order quantity(giảm):', decreaseOrderQuantity)
			}
			orderItem.forEach(item => {
				findInStock = Inventory.find({ product: item.product }, (err, existenStock) => {
					if (existenStock == 0 || existenStock == undefined) {
						console.log('Không tồn tại')
					} else {
						var inStock = existenStock[0].in_stock;
						var options = { new: false, useFindAndModify: false }
						var remainInStock = currentOrderQuantity + inStock - newOrderQuantity
						console.log('5.Trong kho hiện tại:', inStock)
						if (newOrderQuantity <= inStock) {
							Inventory.findOneAndUpdate({ product: item.product }, { in_stock: remainInStock }, options, (err, res) => {
								console.log("-----------------------------------------------");
								console.log('6.Còn lại trong Inventory:', remainInStock)
								console.log("");
							})
							order.customername = customerName;
							order.order_items = orderItem;
							order.description = description;
							order.save()
								.then(() => res.json('Order updated!'))
								.catch(err => res.status(400).json('Error: ' + err));
						} else {
							console.log('5.Không đủ hàng để tạo!')
						}
					}
				})
			})

		}
	})
})

module.exports = orderRouter;