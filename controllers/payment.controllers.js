const Rental = require('../models/Rental.model');
const mongoose = require('mongoose');
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const Reserve = require('../models/Reserve.model');
const PowerBank = require('../models/PowerBank.model');
const UserProfileImage = require('../models/UserProfileImage.model');
const UserSchoolProfile = require('../models/UserSchoolProfile.model');
const LateReturnPrice = require('../models/LateReturnPrice.model');
const ReserveTime = require('../models/ReserveTime.model');
const axios = require('axios');
const { SendReserveEmail } = require('../assets/mailingFunctions');
require("dotenv").config();



const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_PASSKEY; // Replace with your actual key


// Utility: Calculate due date based on rental time
function calculateDueDate(dateRented) {
    const dueDate = new Date(dateRented);
    const hour = dueDate.getHours();
  
    if (hour < 14) {
      // Before 2PM: due same day before 10PM
      dueDate.setHours(22, 0, 0, 0); // 10PM
    } else {
      // After 2PM: due next day before 10AM
      dueDate.setDate(dueDate.getDate() + 1);
      dueDate.setHours(10, 0, 0, 0); // 10AM
    }
  
    return dueDate;
  }
  



 // ProcessPayOut
exports.ProcessPayOut = async (req, res) => {
  const { UserId, orders, CallBackUrl } = req.body;
  const now = new Date();

  try {
    const user = await User.findById(UserId);
    if (!user) return res.status(404).json({ message: 'Invalid user ID' });

    const ongoingRentals = await Rental.find({
      UserId: user._id,
      RentalStatus: { $ne: 'Completed' },
    });

    const activeRentals = [];
    const overdueRentals = [];

    for (const rental of ongoingRentals) {
      const dueDate = calculateDueDate(rental.DateRented);

      if (!rental.DateReturned && now > dueDate) {
        overdueRentals.push(rental);
      } else {
        activeRentals.push(rental);
      }
    }

    let totalOverdueFee = 0;
    let totalAmount = 0;
    for (const rental of overdueRentals) {
      const dueDate = calculateDueDate(rental.DateRented);
      const overdueMs = now - dueDate;
      const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));

      const priceEntry = await LateReturnPrice.findOne({ Name: rental.Type });
      const lateFee = priceEntry ? overdueHours * priceEntry.Price : 0;

      totalOverdueFee += lateFee;
    }

    const newOrders = [];

    for (const item of orders) {
      const powerBank = await PowerBank.findById(item.id);
      const ReserveDetails = await ReserveTime.findOne({ Name: powerBank.Name });
       // Stock check
       if (powerBank.NumberOnLine < 1) {
       return res.status(400).json({ 
       message: `PowerBank '${powerBank.Name}' is currently out of stock for online rental.` 
       });
      }
     
      const Charges = (item.duration * ReserveDetails.Price) + powerBank.Price;
      const ChargesInKobo = Math.round(Charges * 100);
      totalAmount += ChargesInKobo;
      const updatedPowerBank = await PowerBank.findOneAndUpdate(
        { Name: powerBank.Name },
        { $inc: { NumberOnLine: -1 } },
        { new: true }
      );
      
      newOrders.push({
        name: powerBank.Name,
        amount: ChargesInKobo,
        quantity: 1,
        metadata: {
          duration: item.duration,
          basePrice: powerBank.Price,
          ratePerHour: ReserveDetails.Price
        }
      });
    }

    const encodedOrderData = Buffer.from(JSON.stringify(newOrders)).toString('base64');
    const callbackUrl = `${CallBackUrl}?data=${encodeURIComponent(encodedOrderData)}`;

    const paymentResults = await createPaystackTransaction(newOrders, totalAmount, user.UserEmail, callbackUrl);

    return res.status(200).json({
      activeRentals,
      overdueRentals,
      overdueFee: totalOverdueFee,
      paymentResults,
    });

  } catch (error) {
    console.error("Error in ProcessPayOut:", error);
    return res.status(500).json({ error: error.message });
  }
};




// ProcessPayOutFinal
exports.ProcessPayOutFinal = async (req, res) => {
  try {
    const { UserId, data } = req.body;
    const now = new Date();
    const Verification = await verifyPayment(data.reference, data.trxref);

    if (!Verification || Verification.status !== "success") {
      const RentalData = Verification.metadata.custom_fields || [];
      for (const item of RentalData) {
        const updatedPowerBank = await PowerBank.findOneAndUpdate(
          { Name: item.name},
          { $inc: { NumberOnLine: +1 } },
          { new: true }
        );
      }
      return res.status(400).json({
        message: "Your payment did not go through"
      });
    }

    const RentalData = Verification.metadata.custom_fields || [];
    const reserves = [];
    // Fetch user
    const user = await User.findById(UserId);

    for (const item of RentalData) {
      const newReserve = new Reserve({
        UserId,
        Type: item.name,
        Duration: item.metadata.duration,
        Amount: item.amount / 100,
        Payment: "Paid"
      });

      await newReserve.save();
      reserves.push(newReserve);

      const data = {
        Type: item.name,
        Time: new Date(now.getTime() + item.metadata.duration * 60 * 60 * 1000).toLocaleString()
      };
      
      SendReserveEmail(user.UserEmail, user.UserName, data)


    }

    
    return res.status(200).json({
      Status: "success",
      reserves
    });

  } catch (error) {
    console.error("Error in ProcessPayOutFinal:", error);
    return res.status(500).json({ error: error.message });
  }
};

  


  async function createPaystackTransaction(orders, totalAmount, email, callbackUrl) {
    const callback_url = callbackUrl;
    const redirect_url = 'https://yourdomain.com/thank-you'; // Placeholder
    console.log("proccesing");
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: totalAmount, // already in kobo
          callback_url,
          metadata: {
            custom_fields: orders
          }
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.error('Error initializing Paystack transaction:', error.response?.data || error.message);
      throw new Error('Unable to initialize payment');
    }
  }

  function decodeBase64(base64String) {
    try {
      const decodedString = atob(base64String);
      const parsedData = JSON.parse(decodedString);
      return parsedData;
    } catch (e) {
      console.error("Invalid Base64 or JSON format", e);
      throw new Error(e);
    }
  }

  async function verifyPayment(reference, trxref) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, // Replace with your Paystack secret key
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.status) {
        return response.data.data; // Contains payment details
      } else {
        return null;
      }
  
    } catch (error) {
      return null;
    }
  }
  


