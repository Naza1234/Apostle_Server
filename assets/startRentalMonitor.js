// tasks/rentalMonitor.js
const cron = require("node-cron");

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
const { SendRentalEndingEmail, SendReserveEndingEmail } = require("./mailingFunctions");




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




const monitorRentalActivity = async () => {
 
console.log("Rental monitor ran at:", new Date().toLocaleString());

  const now = new Date();

  const rentals = await Rental.find({ RentalStatus: { $ne: 'Completed' } });
  const reserves = await Reserve.find({ Rent: 'Reserved'});
if (rentals.length > 0){
  for (const rental of rentals) {
    const dueDate = calculateDueDate(rental.DateRented);
    const user = await User.findById(rental.UserId);
    if (now > dueDate) {
      await Rental.updateOne(
        { _id: rental._id },
        { $set: { RentalStatus: "Overdue" } }
      );

    } else {
      const timeRemainingMs = dueDate - now;
      const timeRemainingMinutes = timeRemainingMs / (1000 * 60);

      if (timeRemainingMinutes <= 30) {
        const data ={
        Type : rental.Type,
        SnNo:rental.PowerBankSerialNo,
        Time:new Date(dueDate).toLocaleString(),

        }
        SendRentalEndingEmail(user.UserEmail,user.UserName,data)
      }
    }
  }
}

if (reserves.length > 0) {
  for (const reserve of reserves) {
    const dueDate = new Date(reserve.Reserved.getTime() + reserve.Duration * 60 * 60 * 1000);
    const user = await User.findById(reserve.UserId);
    const powerBank = await PowerBank.findOne({ Name: reserve.Type });

    if (!powerBank) continue; // Skip if power bank not found

    if (now > dueDate) {
      // Mark as Denied
      await Reserve.updateOne(
        { _id: reserve._id },
        { $set: { Rent: "Denied" } }
      );

      // Refund to user's account balance
      const refundAmount = powerBank.Price;
      const currentBalance = parseFloat(user.UserAccountBalance || "0");
      const updatedBalance = currentBalance + refundAmount;

      await User.updateOne(
        { _id: user._id },
        { $set: { UserAccountBalance: updatedBalance.toString() } }
      );

    } else {
      const timeRemainingMs = dueDate - now;
      const timeRemainingMinutes = timeRemainingMs / (1000 * 60);

      if (timeRemainingMinutes <= 30) {
        const data = {
          Type: reserve.Type,
          Time: dueDate.toLocaleString(),
        };
        SendReserveEndingEmail(user.UserEmail, user.UserName, data);
      }
    }
  }
}
};





function StartRentalMonitor() {
  

  // Run immediately on start
  monitorRentalActivity();

  // Then run every 10 minutes (600,000 ms)
  setInterval(() => {
    monitorRentalActivity();
  }, 10 * 60 * 1000);
}

module.exports = StartRentalMonitor;
