const mongoose = require('mongoose');

const LateReturnPriceSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('LateReturnPrice', LateReturnPriceSchema);
