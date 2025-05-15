const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  PowerBankSerialNo: {
    type: String,
    required: true,
  },
  Type: {
    type: String,
    required: true,
  },
  DateRented: {
    type: Date,
    default: Date.now,
  },
  DateReturned: {
    type: Date,
  },
  RentalDuration: {
    type: Number, // e.g. in hours or days
    default: 0,
  },
  ReturnConfirmation: {
    type: Boolean,
    default: false,
  },
  RentalStatus: {
    type: String,
    enum: ['Ongoing', 'Completed', 'Overdue'],
    default: 'Ongoing',
  },
  AmountPaid: {
    type: Number,
    required: true,
  },
  PaymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partially Paid'],
    default: 'Paid',
  },
});

module.exports = mongoose.model('Rental', RentalSchema);
