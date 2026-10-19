import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please tell us your coupon code'],
      unique: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: [true, 'Please tell us your discount'],
      min: 0,
      max: 100,
    },
    startsAt: {
      type: Date,
      required: [true, 'Please tell us your start date'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Please tell us your expiration date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please tell us your company'],
    },
  },
  {
    timestamps: true,
     toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);







const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
