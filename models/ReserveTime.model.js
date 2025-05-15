const mongoose = require('mongoose');

const ReserveTimeSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('ReserveTime', ReserveTimeSchema);
