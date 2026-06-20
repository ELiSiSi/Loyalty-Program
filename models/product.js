import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    points: {
      type: Number,
      required: true,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    gifts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gift',

    },
    addPoints: [
      {
        points: {
          type: Number,
          required: true,
        },
        startsAt: {
          type: Date,
          required: true,
        },
        endAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.pre(/^find/, function (next) {
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


const Product = mongoose.model('Product', productSchema);

export default Product;
