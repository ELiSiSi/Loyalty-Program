import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {

userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please tell us your user'],
},
earngPoints: {
      type: Number,
      required: [true, 'Please tell us your points'],
      default: 0,
    },
LostPoints: {
      type: Number,
      default: 0,
    },

    due: {
      type: String,
},

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },

  },
  {
    timestamps: true,
  }
);

const Point = mongoose.model('Point', pointSchema);

export default Point;
