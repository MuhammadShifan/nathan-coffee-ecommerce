import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  doorNo: { type: String, default: '' },
  street: { type: String, default: '' },
  landmark: { type: String, default: '' },
  city: { type: String, default: 'Thanjavur' },
  state: { type: String, default: 'Tamil Nadu' },
  pincode: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    addresses: [addressSchema],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
