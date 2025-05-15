
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  ID: { type: String, default: '' },
  UserName: { type: String, default: '' },
  UserMobile: { type: String, default: '' },
  UserEmail: { type: String, default: '' },
  Department: { type: String, default: '' },
  RegNo: { type: String, default: '' },
  Address: { type: String, default: '' },
  Admission: { type: String, default: '' },
  Level: { type: String, default: '' },
  Profile: { type: String, default: '' },
  UserPin: { type: String, default: '' },
  UserPassword: { type: String, default: '' },
  UserAccountBalance: { type: String, default: '0' },
  EmailVerified: {
    type: Boolean,
    default: false,
  },
  EmailVerificationCode: {
    type: String,
  },
  UserStat: {
    type: String,
    enum: ['admin', 'owner', 'user', 'blocked'],
    default: 'user',
  },
  AccountSetup: { type: Boolean, default: false },
  UserAgrees: { type: Boolean, default: true },
}, { timestamps: true });

// Hash UserPassword and UserPin before saving (for create and save)
UserSchema.pre('save', async function (next) {
  if (this.isModified('UserPassword')) {
    const salt = await bcrypt.genSalt(10);
    this.UserPassword = await bcrypt.hash(this.UserPassword, salt);
  }

  if (this.isModified('UserPin')) {
    const salt = await bcrypt.genSalt(10);
    this.UserPin = await bcrypt.hash(this.UserPin, salt);
  }

  next();
});

// Hash fields on update
UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  if (update.UserPassword) {
    const salt = await bcrypt.genSalt(10);
    update.UserPassword = await bcrypt.hash(update.UserPassword, salt);
  }
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('User', UserSchema);
