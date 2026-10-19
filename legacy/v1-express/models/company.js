import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Please tell us your category'],
    },
    logo: {
      type: String,
      required: [true, 'Please tell us your logo'],
    },

  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model('Company', companySchema);

export default Company;
