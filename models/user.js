import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
    },

    photo: {
      type: String,
      default: 'uploads/general/download.jpg',
    },

    role: {
      type: String,
      enum: ['user', 'superAdmin', 'admin'],
      default: 'user',
    },

    totalPoints: { type: Number, default: 0 },
    pendingPoints: { type: Number, default: 0 },
    availablePoints: { type: Number, default: 0 },

    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [
        function () {
          return this.isNew || this.isModified('password');
        },
        'Please confirm your password',
      ],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenExpires: {
      type: Date,
      select: false,
    },

    bookings: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking',
      },
    ],

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now();

  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function (candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
};

userSchema.methods.changedPasswordAfter = function (iat) {
  return this.passwordChangedAt
    ? Math.floor(this.passwordChangedAt.getTime() / 1000) > iat
    : false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.setRefreshToken = function (token) {
  this.refreshToken = crypto.createHash('sha256').update(token).digest('hex');
  this.refreshTokenExpires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
};

userSchema.methods.clearRefreshToken = function () {
  this.refreshToken = undefined;
  this.refreshTokenExpires = undefined;
};

userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;
