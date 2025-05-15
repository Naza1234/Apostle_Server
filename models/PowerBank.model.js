const mongoose = require('mongoose');

const PowerBankSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  },
  NumberInStor: {
    type: Number,
    default:0
  },
  NumberOnLine: {
    type: Number,
    default:0
  }
}, { timestamps: true });

module.exports = mongoose.model('PowerBank', PowerBankSchema);
