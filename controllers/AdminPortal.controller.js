const Rental = require('../models/Rental.model');
const mongoose = require('mongoose');
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const Reserve = require('../models/Reserve.model');
const VideoModel = require('../models/Videos.model');
const PowerBank = require('../models/PowerBank.model');
const UserProfileImage = require('../models/UserProfileImage.model');
const UserSchoolProfile = require('../models/UserSchoolProfile.model');
const LateReturnPrice = require('../models/LateReturnPrice.model');
const fs = require('fs');
const path = require('path');


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
  

  
// Helper to encode file to base64 and remove it

const encodeAndRemoveFile = (filePath, mimeType) => {
  const fileData = fs.readFileSync(filePath);
  const base64 = fileData.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;

  // Remove the file after encoding
  fs.unlinkSync(filePath);

  return dataUri;
};





exports.getSummaryStats = async (req, res) => {
    try {
      // Get all power banks and sum up NumberInStor and NumberOnLine
      const powerBanks = await PowerBank.find({});
      let totalPowerBanks = 0;
      for (const pb of powerBanks) {
        totalPowerBanks += (pb.NumberInStor || 0) + (pb.NumberOnLine || 0);
      }
  
      const now = new Date();
      const allOngoingRentals = await Rental.find({ RentalStatus: { $ne: 'Completed' } });
  
      let totalOverdueRentals = 0;
      let totalActiveRentals = 0;
  
      for (const rental of allOngoingRentals) {
        const dueDate = calculateDueDate(rental.DateRented);
        if (!rental.DateReturned && now > dueDate) {
          totalOverdueRentals++;
        } else {
          totalActiveRentals++;
        }
      }
  
      const totalReservedRentals = await Reserve.countDocuments({ Rent: 'Reserved' });
  
      return res.status(200).json({
        totalPowerBanks,
        totalActiveRentals,
        totalOverdueRentals,
        totalReservedRentals
      });
    } catch (error) {
      console.error('Error getting summary stats:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  

  
exports.getRentalFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // ---------- PART 1: Overdue Rentals ----------
    const ongoingRentals = await Rental.find({ RentalStatus: { $ne: 'Completed' } });

    let totalLateFees = 0;

    for (const rental of ongoingRentals) {
      const dueDate = calculateDueDate(rental.DateRented);

      
      if (now > dueDate && dueDate >= start && dueDate <= end) {
        const overdueMs = now - dueDate;
        const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));

        const priceEntry = await LateReturnPrice.findOne({ Name: rental.Type });
        const lateFee = priceEntry ? overdueHours * priceEntry.Price : 0;

        totalLateFees += lateFee;
      }
    }

    // ---------- PART 2: Completed Rentals ----------
    const completedRentals = await Rental.find({
      RentalStatus: 'Completed',
      DateReturned: { $gte: start, $lte: end }
    });

    let totalCompletedAmount = 0;
    for (const rental of completedRentals) {
      totalCompletedAmount += rental.AmountPaid || 0;
    }

    // ---------- PART 3: User Balances (Money Owed) ----------
    const users = await User.find({});
    let totalMoneyOwedByUsers = 0;

    for (const user of users) {
      const balance = parseFloat(user.UserAccountBalance);
      if (!isNaN(balance)) {
        totalMoneyOwedByUsers += balance;
      }
    }

    // ---------- FINAL RESPONSE ----------
    return res.status(200).json({
      totalOverdueLateFees: totalLateFees,
      totalCompletedRentalAmount: totalCompletedAmount,
      totalMoneyOwedByUsers: totalMoneyOwedByUsers
    });

  } catch (error) {
    console.error('Error calculating rental summary:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};




exports.getUserInfoWithPin = async (req, res) => {
  const { UserPin, orders } = req.body; // powerBanks is the array of items with serialNo and selectedType
  const now = new Date();

  try {
    // Step 1: Find the user using the provided pin
    const users = await User.find();
    const matchedUsers = await Promise.all(users.map(async user => {
      const match = await bcrypt.compare(UserPin, user.UserPin);
      return match ? user : null;
    }));

    const user = matchedUsers.find(u => u);
    if (!user) return res.status(404).json({ message: 'Invalid pin' });

    // Step 2: Fetch profile image
    const profileImg = await UserProfileImage.findOne({ UserId: user._id });

    // Step 3: Get active rentals
    const ongoingRentals = await Rental.find({ UserId: user._id, RentalStatus: { $ne: 'Completed' } });

    // Step 4: Separate them into active (not overdue) and overdue rentals
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

    // Step 5: Calculate total overdue fees
    let totalOverdueFee = 0;
    for (const rental of overdueRentals) {
      const dueDate = calculateDueDate(rental.DateRented);
      if (now > dueDate) {
        const overdueMs = now - dueDate;
        const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));

        const priceEntry = await LateReturnPrice.findOne({ Name: rental.Type });
        const lateFee = priceEntry ? overdueHours * priceEntry.Price : 0;
        totalOverdueFee += lateFee;
      }
    }

    // Step 6: Match power bank types and get prices
    let totalPowerBankFee = 0;
    const powerBanksWithPrices = await Promise.all(
      orders.map(async (item) => {
        const matched = await PowerBank.findOne({ Name: item.selectedType });
        const price = matched ? matched.Price : 0;
        totalPowerBankFee += price;
    
        item.price = price; // mutate the existing item
        return item; // return the mutated item
      })
    );

    // Step 7: Calculate total fee (overdue fees + power bank total)
    const totalFee = totalOverdueFee + totalPowerBankFee;

    // Step 8: Send final response
    return res.status(200).json({
      userInfo: {
        id:user._id,
        name: user.UserName,
        accountApproved: user.AccountSetup,
        accountBalance: user.UserAccountBalance
      },
      profileImg,
      activeRentals,
      overdueRentals,
      overdueFee: totalOverdueFee,
      powerBanks: powerBanksWithPrices, // now includes price in each item
      totalPowerBankFee,
      totalFee
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


exports.getUserInfoWithPinFromReserve = async (req, res) => {
  const { UserPin} = req.body; // powerBanks is the array of items with serialNo and selectedType
  const now = new Date();

  try {
    // Step 1: Find the user using the provided pin
    console.log("test");
    const users = await User.find();
    const matchedUsers = await Promise.all(users.map(async user => {
      const match = await bcrypt.compare(UserPin, user.UserPin);
      return match ? user : null;
    }));

    const user = matchedUsers.find(u => u);
    if (!user) return res.status(404).json({ message: 'Invalid pin' });

    // Step 2: Fetch profile image
    const profileImg = await UserProfileImage.findOne({ UserId: user._id });

    // Step 3: Get active rentals
    const ongoingRentals = await Rental.find({ UserId: user._id, RentalStatus: { $ne: 'Completed' } });

    // Step 4: Separate them into active (not overdue) and overdue rentals
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

    // Step 5: Calculate total overdue fees
    let totalOverdueFee = 0;
    for (const rental of overdueRentals) {
      const dueDate = calculateDueDate(rental.DateRented);
      if (now > dueDate) {
        const overdueMs = now - dueDate;
        const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));

        const priceEntry = await LateReturnPrice.findOne({ Name: rental.Type });
        const lateFee = priceEntry ? overdueHours * priceEntry.Price : 0;
        totalOverdueFee += lateFee;
      }
    }

    const orders = []

    const rentalsResults = await Reserve.find({ UserId : user._id , Rent : "Reserved"})
    
    for (const items in rentalsResults) {
      const item =rentalsResults[items]
        const data ={
          selectedType : item.Type,
          serialNo : "",
          price : item.Amount,
          duration:item.Duration,
          reserveId:item._id
        }
        
        orders.push(data)
    }


    // Step 6: Match power bank types and get prices
    let totalPowerBankFee = 0;
    // const powerBanksWithPrices = await Promise.all(
    //   orders.map(async (item) => {
    //     const matched = await PowerBank.findOne({ Name: item.selectedType });
    //     const price = matched ? matched.Price : 0;
    //     totalPowerBankFee += price;
    
    //     // item.price = price; // mutate the existing item
    //     return item; // return the mutated item
    //   })
    // );

    // Step 7: Calculate total fee (overdue fees + power bank total)
    const totalFee = totalOverdueFee + totalPowerBankFee;

    // Step 8: Send final response
    return res.status(200).json({
      userInfo: {
        id:user._id,
        name: user.UserName,
        accountApproved: user.AccountSetup,
        accountBalance: user.UserAccountBalance
      },
      profileImg,
      activeRentals,
      overdueRentals,
      overdueFee: totalOverdueFee,
      powerBanks: orders, // now includes price in each item
      totalPowerBankFee,
      totalFee
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};




exports.uploadVideo = async (req, res) => {
  try {
    // Check if user exists and hasn't completed setup
   
   
       const Video = new VideoModel({
        FilePath: req.file.path,
      }); 
      console.log(req.file.path)
      await Video.save();
  

    res.status(200).json(Video);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.GetVideo = async (req, res) => {
  try {
    // Check if user exists and hasn't completed setup
    const Video = await VideoModel.find({});
    // Encode file into base64 with data URI
   
    res.status(200).json(Video);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};
