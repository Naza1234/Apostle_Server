const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/image", express.static("./image"));

// Import all routes
// const ExampleRoutes = require('./routes/example.routes');
const UserRoutes = require('./routes/User.routes');
const rentalRoutes = require('./routes/Rental.route');
const reserveRoutes = require('./routes/reserve.routes');
const powerBankRoutes = require('./routes/powerbank.route'); 
const lateReturnPriceRoutes = require('./routes/latereturnprice.route');
const reserveTimeRoutes = require('./routes/reservetime.route');
const AdminPortal = require('./routes/AdminPortal.route');
const Payment = require('./routes/Payment.route');
const Emails = require('./routes/customEmails.route');
const StartRentalMonitor = require("./assets/startRentalMonitor")

// Use the routes
// app.use('/user', ExampleRoutes);
app.use('/user', UserRoutes);
app.use('/rentals', rentalRoutes);
app.use('/reserves', reserveRoutes);
app.use('/powerbanks', powerBankRoutes);
app.use('/latereturnprices', lateReturnPriceRoutes);
app.use('/reservetimes', reserveTimeRoutes); 
app.use('/adminporttal', AdminPortal); 
app.use('/payment', Payment); 
app.use('/contact', Emails); 




// ASwebServer
// 9HWOiBm9bH61AQ4T
// ApostleRentalServer
// ApostleRentalServerPassword 

const url = "mongodb+srv://ApostleRentalServer:ApostleRentalServerPassword@cluster0.vtrhktd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const port = 4000;



mongoose
  .connect(url)
  .then(() => {
    console.log('Connected to the database');   
    StartRentalMonitor()
    app.use("/",(req,res)=>{
        res.end('origin')
      })
    app.listen(port, () => {
      console.log(`Server is now running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });