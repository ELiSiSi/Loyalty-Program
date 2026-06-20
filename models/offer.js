import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    gifts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gift',

    },
    requiredPoints: {
      type: Number,
      required: true,
      min: 0,
    },

    startsAt: {
      type: Date,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startsAt;
        },
        message: 'expiresAt must be after startsAt',
      },
    },
catogary: {

      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
},
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

offerSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name description',
  })
    .populate({
      path: 'company',
      select: 'name logo',
    })
    .populate({
      path: 'gifts',
      select: 'name image description',
    });

  next();
});

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
