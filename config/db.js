import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected');
    console.log(`App listening at http://localhost:${process.env.PORT || 3000}`);
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

export default connectDB;
