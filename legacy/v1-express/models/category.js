import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please tell us your name'] },
    image: { type: String, required: [true, 'Please tell us your image'] },
    description: {
      type: String,
      required: [true, 'Please tell us your description'],
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please tell us your company'],
    },
  },
  {
    timestamps: true,
  }
);


const Category = mongoose.model('Category', categorySchema);


export default Category;
