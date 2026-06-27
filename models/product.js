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



    isActive: {
      type: Boolean,
      default: true,
    },
    gifts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gift',
    },
    fromLocation: {
      type: String,
      required: true,
    },
    toLocation: {
      type: String,
      required: true,
    },
    addPoints: [
      {
        points: {
          type: Number,
          default: 0,
        },
        startsAt: {
          type: Date,
        },
        endAt: {
          type: Date,
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
