import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `ORD-${Math.floor(100000 + Math.random() * 900000)}`
  },
  orderType: {
    type: String,
    enum: ['Dine-in', 'Takeaway'],
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: function() { return this.orderType === 'Dine-in'; }
  },
  customer: {
    name: { type: String, default: 'Guest' },
    phone: { type: String, default: '' }
  },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    title: String,
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    notes: String
  }],
  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0.05 },
  taxAmount: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Served', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Unassigned'],
    default: 'Unassigned'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
