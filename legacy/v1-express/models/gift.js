import mongoose from "mongoose";

const giftSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    unique: true,
  },
  image: {
    type: String,
    required: [true, 'Please tell us your image'],
  },
  description: {
    type: String,
    required: [true, 'Please tell us your description'],
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Please tell us your company'],
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


}, {
  timestamps: true,
});

giftSchema.pre('save', function (next) {
  const now = new Date();

  this.isActive = now >= this.startsAt && now <= this.expiresAt;

  next();
});
const Gift = mongoose.model('Gift', giftSchema);

export default Gift;
