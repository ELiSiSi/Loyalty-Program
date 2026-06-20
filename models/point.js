import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    usedPoints: {
      type: Number,
      required: [true, 'Please tell us your points'],
      default: 0,
    },
    pendingPoints: {
      type: Number,
      required: [true, 'Please tell us your pending points'],
      default: 0,
    },
    allPoints: {
      type: Number,
      required: [true, 'Please tell us your all points'],
      default: 0,
    },

    name: {
      type: String,
      required: [true, 'Please tell us your name'],
    },
    currency: {
      type: String,
      required: [true, 'Please tell us your currency'],
    },

    pointValue: {
      type: Number,
      required: [true, 'Please provide point value'],
      min: 0,
    },
    pointsPercentage: {
      type: Number,
      required: [true, 'Please provide points percentage'],
      min: 0,
      max: 100,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please tell us your company'],
    },
    pointSign: {
      type: Number,
      required: [true, 'Please tell us your point sign'],
    },
  },
  {
    timestamps: true,
  }
);

const Point = mongoose.model('Point', pointSchema);

export default Point;
