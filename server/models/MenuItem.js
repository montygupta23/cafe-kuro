import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0.01 },
  description: { type: String, default: '' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600' },
  isAvailable: { type: Boolean, default: true },
  isSignature: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);
