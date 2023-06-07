const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide the username'],
    },
    email: {
      type: String,
      required: [true, 'Please provide the email address'],
      unique: true,
      /** validate an email address */
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide the password'],
      minLength: 6,
      select: false,
    },

    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    // StudentEmail: { type: String, default: '' },
    mobileNumber: { type: String, default: '' },
    portfolio: { type: String, default: '' },

    about: { type: String, default: '' },
    address: { type: String, default: '' },

    education: { type: [], default: [''] },
    skills: { type: [], default: [''] },
    projects: { type: [], default: [''] },
    experience: { type: [], default: [''] },

    appliedJobs: [],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  // { typeKey: '$type' },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/** match the password */
userSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/** jsonwebtoken */
userSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE,
  });
};

/** reset jsonwebtoken */
userSchema.methods.getresetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  /** hash token (private key) and save to database */
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  /** set token expire date */
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // ten min

  return resetToken;
};

// userSchema.statics.isThisEmailInUse = async function (email) {
//   try {
//     const user = await this.findOne({ email });
//     if (user) return false;

//     return true;
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// };

const userModal = new mongoose.model('users', userSchema);

module.exports = userModal;
