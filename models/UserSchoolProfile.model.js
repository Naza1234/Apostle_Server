const mongoose = require('mongoose');

const UserSchoolProfileSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  FilePath: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('UserSchoolProfile', UserSchoolProfileSchema);
