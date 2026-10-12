import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true, min: 1 },
  capacity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Reserved'],
    default: 'Available'
  },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });

export default mongoose.model('Table', tableSchema);
