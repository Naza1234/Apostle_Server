const Rental = require('../models/Rental.model');
const mongoose = require('mongoose');
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const PowerBank = require('../models/PowerBank.model');
const Reserve = require('../models/Reserve.model');
const { SendRentalEmail, RentalReturned } = require('../assets/mailingFunctions');
const RentalModel = require('../models/Rental.model');
// const moment = require('moment');



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



exports.createRental = async (req, res) => {
  try {
    const { userId, orders } = req.body;

    if (!userId || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: "Missing userId or orders" });
    }
    const user = await User.findById(userId);
    const now = new Date();

    // Step 1: Mark all ongoing rentals of the user as completed
    const rentals = await Rental.find( { UserId: userId, RentalStatus: { $ne: 'Completed' } });
    for (const rental of rentals) {
      const durationInHours = Math.abs(now - rental.DateRented) / (1000 * 60 * 60);
      rental.RentalStatus = "Completed";
      rental.DateReturned = now;
      rental.ReturnConfirmation = true;
      rental.RentalDuration = durationInHours;
      await rental.save();

     
      // Prepare email data
      const due = calculateDueDate(rental.DateRented); // Use original rent time
      const data = {
        Type: rental.Type,
        SnNo: rental.PowerBankSerialNo,
        Time: new Date(now).toLocaleString(),
      };

      // Send email
      await RentalReturned(user.UserEmail, user.UserName, data);
    }

    let totalPrice = 0;
    const newRentals = [];

    // Step 2: Process orders
    for (const item of orders) {
      totalPrice += item.price;

      // Create rental
      const rental = new Rental({
        UserId: userId,
        PowerBankSerialNo: item.serialNo,
        Type: item.selectedType,
        DateRented: now,
        AmountPaid: item.price,
        PaymentStatus: item.price > 0 ? 'Paid' : 'Unpaid',
      });
      await rental.save();
      newRentals.push(rental);

      // Update power bank stock
      const updatedPowerBank = await PowerBank.findOneAndUpdate(
        { Name: item.selectedType },
        { $inc: { NumberInStor: -1 } },
        { new: true }
      );

      if (!updatedPowerBank) {
        console.warn(`PowerBank type '${item.selectedType}' not found.`);
      }

      

      const due = calculateDueDate(now);

      const data = {
        Type: item.selectedType,
        SnNo: item.serialNo,
        StartTime: new Date(now).toLocaleString(),     // e.g., "5/13/2025, 3:45:30 PM"
        EndTime: new Date(due).toLocaleString()
      };

      await SendRentalEmail(user.UserEmail,user.UserName ,data)

    }

    // Step 3: Update user balance
 
    if (user) {
      user.UserAccountBalance = Math.max(user.UserAccountBalance - totalPrice, 0);
      await user.save();
    }

    res.status(201).json({ message: "Rentals created", rentals: newRentals });
  } catch (error) {
    console.error("Error creating rental:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.createRentalForReserve = async (req, res) => {
  try {
    const { userId, orders } = req.body;

    if (!userId || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: "Missing userId or orders" });
    }
    const user = await User.findById(userId);
    const now = new Date();
    const newRentals = [];
    let totalPrice = 0;

    // Step 1: Mark all ongoing rentals of the user as completed
    const rentals = await Rental.find( { UserId: userId, RentalStatus: { $ne: 'Completed' } });
    for (const rental of rentals) {
      const durationInHours = Math.abs(now - rental.DateRented) / (1000 * 60 * 60);
      rental.RentalStatus = "Completed";
      rental.DateReturned = now;
      rental.ReturnConfirmation = true;
      rental.RentalDuration = durationInHours;
      await rental.save();

      // Fetch user
  

      // Prepare email data
      const due = calculateDueDate(rental.DateRented); // Use original rent time
      const data = {
        Type: rental.Type,
        SnNo: rental.PowerBankSerialNo,
        Time: new Date(now).toLocaleString(),
      };

      // Send email
      await RentalReturned(user.UserEmail, user.UserName, data);
    }
 

 
    // Step 2: Handle each order
    for (const item of orders) {
      totalPrice += item.price;

      // Create rental
      const rental = new Rental({
        UserId: userId,
        PowerBankSerialNo: item.serialNo,
        Type: item.selectedType,
        DateRented: now,
        AmountPaid: item.price,
        PaymentStatus: item.price > 0 ? 'Paid' : 'Unpaid',
      });
      await rental.save();
      newRentals.push(rental);


   
      // Step 3: Update specific reserve using reserveId
      if (item.reserveId) {
        await Reserve.findByIdAndUpdate(item.reserveId, {
          $set: { Rent: 'Collected' }
        });
      }


      const due = calculateDueDate(now);

      const data = {
        Type: item.selectedType,
        SnNo: item.serialNo,
        StartTime: new Date(now).toLocaleString(),     // e.g., "5/13/2025, 3:45:30 PM"
        EndTime: new Date(due).toLocaleString()
      };
      
      await SendRentalEmail(user.UserEmail,user.UserName ,data)

    }

    res.status(201).json({ message: "Rentals created", rentals: newRentals });
  } catch (error) {
    console.error("Error creating rental:", error);
    res.status(500).json({ error: error.message });
  }
};



exports.ReturnRental = async (req, res) => {
  try {
    const ids = req.body; // Expecting array of _id strings

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Request body must be a non-empty array of IDs." });
    }

    const now = new Date();

    // Step 1: Fetch rentals
    const rentals = await Rental.find({ _id: { $in: ids } });

    if (!rentals || rentals.length === 0) {
      return res.status(404).json({ error: "No rentals found for provided IDs." });
    }

    // Step 2: Update each rental individually (to also calculate duration)
    // const rentals = await Rental.find( { UserId: userId, RentalStatus: { $ne: 'Completed' } });
    for (const rental of rentals) {
      const durationInHours = Math.abs(now - rental.DateRented) / (1000 * 60 * 60);
      rental.RentalStatus = "Completed";
      rental.DateReturned = now;
      rental.ReturnConfirmation = true;
      rental.RentalDuration = durationInHours;
      await rental.save();

      // Fetch user
      const user = await User.findById(rental.UserId);

      // Prepare email data
      const due = calculateDueDate(rental.DateRented); // Use original rent time
      const data = {
        Type: rental.Type,
        SnNo: rental.PowerBankSerialNo,
        Time: new Date(now).toLocaleString(),
      };

      // Send email
      await RentalReturned(user.UserEmail, user.UserName, data);
    }

    res.status(200).json({ message: "Rentals returned successfully", updatedCount: rentals.length });

  } catch (error) {
    console.error("Error returning rentals:", error);
    res.status(500).json({ error: error.message });
  }
};




exports.getAllRentals = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1; // default to page 1
    const limit = 100;
    const skip = (page - 1) * limit;

    const total = await Rental.countDocuments(); // total rentals

    const rentals = await Rental.find()
      .sort({ createdAt: -1 }) // sort from most recent to oldest
      .skip(skip)
      .limit(limit)
      .populate('UserId');

    const rentalsWithUserNames = rentals.map((rental) => {
      const rentalObj = rental.toObject();
      const user = rental.UserId;
      rentalObj.UserName = user && user.UserName ? user.UserName : 'Unknown';
      return rentalObj;
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      total,
      page,
      pages: totalPages,
      data: rentalsWithUserNames,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};



exports.getRentalsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const rentals = await Rental.find({ UserId: userId })
    console.log(userId);
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOverdueRentals = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;
    const now = new Date();

    const rentals = await Rental.find({ RentalStatus: { $ne: 'Completed' } });
    const overdue = rentals.filter((rental) => {
      const dueDate = calculateDueDate(rental.DateRented);
      return !rental.DateReturned && now > dueDate;
    });

    // Sort by createdAt descending (most recent first)
    overdue.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = overdue.length;
    const paginatedOverdue = overdue.slice(skip, skip + limit);

    const overdueWithUserNames = await Promise.all(
      paginatedOverdue.map(async (rental) => {
        let userName = 'Unknown';
        if (rental.UserId) {
          const user = await User.findById(rental.UserId).select('UserName');
          if (user) {
            userName = user.UserName;
          }
        }

        return {
          ...rental.toObject(),
          UserName: userName,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      total,
      page,
      pages: totalPages,
      data: overdueWithUserNames,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};



exports.getOverdueRentalsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const rentals = await Rental.find({ UserId: userId, RentalStatus: { $ne: 'Completed' } });

    const overdue = rentals.filter((rental) => {
      const dueDate = calculateDueDate(rental.DateRented);
      return !rental.DateReturned && now > dueDate;
    });

    res.status(200).json(overdue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getActiveRentals = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1; // page from param
    const limit = 100;
    const skip = (page - 1) * limit;

    const rentals = await Rental.find({ RentalStatus: { $ne: 'Completed' } });

    // Sort by createdAt descending (most recent first)
    rentals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = rentals.length;
    const paginatedRentals = rentals.slice(skip, skip + limit);

    const rentalsWithUserNames = await Promise.all(
      paginatedRentals.map(async (rental) => {
        let userName = 'Unknown';
        if (rental.UserId) {
          const user = await User.findById(rental.UserId).select('UserName');
          if (user) {
            userName = user.UserName;
          }
        }

        return {
          ...rental.toObject(),
          UserName: userName
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      total,
      page,
      pages: totalPages,
      data: rentalsWithUserNames
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};


exports.getActiveRentalsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const rentals = await Rental.find({ UserId: userId, RentalStatus: { $ne: 'Completed' } });
    const active = rentals.filter((rental) => {
      const dueDate = calculateDueDate(rental.DateRented);
      return !rental.DateReturned && now < dueDate;
    });
    res.status(200).json(active);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRental = await Rental.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedRental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRental = async (req, res) => {
  try {
    const { id } = req.params;
    await Rental.findByIdAndDelete(id);
    res.status(200).json({ message: 'Rental deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Optional: Return rental
exports.returnRental = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    rental.DateReturned = new Date();
    rental.ReturnConfirmation = true;

    const dueDate = calculateDueDate(rental.DateRented);
    rental.RentalStatus = rental.DateReturned > dueDate ? 'Overdue' : 'Completed';

    const duration = Math.ceil((rental.DateReturned - rental.DateRented) / (1000 * 60 * 60)); // in hours
    rental.RentalDuration = duration;

    await rental.save();
    res.status(200).json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user info and active rentals by pin
exports.getUserAndActiveRentalsByPin = async (req, res) => {
    const { UserPin } = req.body;
  
    try {
      const users = await User.find();
  
      // Find the correct user by comparing hashed pins
      let matchedUser = null;
      for (const user of users) {
        if (await bcrypt.compare(UserPin, user.UserPin)) {
          matchedUser = user;
          break;
        }
      }
  
      if (!matchedUser) {
        return res.status(404).json({ message: 'Invalid PIN' });
      }
  
      const activeRentals = await Rental.find({
        UserId: matchedUser._id,
        RentalStatus: 'active',
      });
  
      return res.status(200).json({
        user: matchedUser,
        activeRentals,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };


exports.getUserRentalStats = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Find user
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      // Get user's rentals
      const rentals = await Rental.find({ UserId: userId });
  
      const now = new Date();
      let activeCount = 0;
      let overdueCount = 0;
  
      rentals.forEach((rental) => {
        if (rental.RentalStatus === 'Ongoing') {
          
          const dueDate = calculateDueDate(rental.DateRented);
          if (!rental.DateReturned && now > dueDate) {
            overdueCount++;
          }else{
            activeCount++;
          }
        }
      });
  
      res.status(200).json({
        userName: user.UserName,
        accountBalance: user.UserAccountBalance,
        activeRentals: activeCount,
        overdueRentals: overdueCount,
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};  



exports.getPrioritizedRecentRentalsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    const rentals = await Rental.find({ UserId: userId });

    const overdue = [];
    const ongoing = [];
    const completed = [];

    rentals.forEach((rental) => {
      const dueDate = calculateDueDate(rental.DateRented);

      if (rental.RentalStatus === 'Ongoing' && !rental.DateReturned && now > dueDate) {
        overdue.push(rental);
      } else if (rental.RentalStatus === 'Ongoing') {
        ongoing.push(rental);
      } else if (rental.RentalStatus === 'Completed' || rental.RentalStatus === 'Overdue') {
        completed.push(rental);
      }
    });

    // Sort all by most recent DateRented
    overdue.sort((a, b) => b.DateRented - a.DateRented);
    ongoing.sort((a, b) => b.DateRented - a.DateRented);
    completed.sort((a, b) => b.DateRented - a.DateRented);

    const result = [...overdue, ...ongoing, ...completed].slice(0, 12);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getPrioritizedRecentRentals = async (req, res) => {
  try {
    const now = new Date();

    // Get today's date at midnight
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Get the next day's midnight to use as upper bound
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch only rentals created today
    const rentals = await Rental.find({
      DateRented: { $gte: startOfToday, $lte: endOfToday }
    });

    const overdue = [];
    const ongoing = [];
    const completed = [];

    rentals.forEach((rental) => {
      const dueDate = calculateDueDate(rental.DateRented);

      if (rental.RentalStatus === 'Ongoing' && !rental.DateReturned && now > dueDate) {
        overdue.push(rental);
      } else if (rental.RentalStatus === 'Ongoing') {
        ongoing.push(rental);
      } else if (rental.RentalStatus === 'Completed' || rental.RentalStatus === 'Overdue') {
        completed.push(rental);
      }
    });

    // Sort each category by most recent DateRented
    overdue.sort((a, b) => b.DateRented - a.DateRented);
    ongoing.sort((a, b) => b.DateRented - a.DateRented);
    completed.sort((a, b) => b.DateRented - a.DateRented);

    const result = [...overdue, ...ongoing, ...completed];

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

