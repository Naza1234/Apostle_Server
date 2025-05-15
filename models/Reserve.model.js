const mongoose = require('mongoose');

const ReserveSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  Type: {
    type: String,
    required: true
  },
  Reserved: {
    type: Date,
    default: Date.now
  },
  Rent: {
    type: String,
    enum: ['Reserved', 'Collected', 'Denied'],
    default: 'Reserved'
  },
  Duration: {
    type: Number, // in hours
    required: true
  },
  Amount: {
    type: Number,
    default: 0
  },
  Payment: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  }
});

module.exports = mongoose.model('Reserve', ReserveSchema);
