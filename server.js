const express = require('express');
const cors = require('cors');
const mongoose =  require('mongoose');
f = require('util').format,
fs = require('fs');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//CONNECT DATABASE

const uri = process.env.DATABASE_URL;
mongoose.connect(uri,{ 
	useNewUrlParser: true, 
	useCreateIndex: true,
	useUnifiedTopology: true,
	server: {
		sslValidate:true
	  , sslCA:ca
	  , sslKey:key
	  , sslCert:cert
	  , sslPass:'10gen'
	}
});

const connection = mongoose.connection;
connection.once('open', () => {
	console.log("MongoDB database connection established successfully!");
})

// END OF CONNECT DATABASE

const importRouter = require('./routes/imports');
const orderRouter = require('./routes/order');
const productRouter = require('./routes/product');
const customersRouter = require('./routes/customer');
const inventoryRouter = require('./routes/inventories');

app.use('/import', importRouter);
app.use('/orders', orderRouter);
app.use('/products', productRouter);
app.use('/customers', customersRouter);
app.use('/inventories', inventoryRouter);
app.listen(port, () => {	
	console.log(`Server is running on port: ${port}`)
});
