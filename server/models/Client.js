const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: { type: String, enum: ['id_proof', 'address_proof', 'photo', 'other'], required: true },
  filename: String,
  path: String,
  uploadedAt: { type: Date, default: Date.now },
});

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    aadhaar: { type: String, required: true, trim: true, index: true },
    pan: { type: String, trim: true, uppercase: true },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    occupation: String,
    income: Number,
    documents: [documentSchema],
    notes: String,
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', index: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Composite index: aadhaar + isDeleted
clientSchema.index({ aadhaar: 1, isDeleted: 1 });
clientSchema.index({ name: 'text', phone: 'text' });

module.exports = mongoose.model('Client', clientSchema);
