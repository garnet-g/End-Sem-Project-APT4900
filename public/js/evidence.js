// models/Evidence.js
const mongoose = require('mongoose');

const CustodySchema = new mongoose.Schema({
  action: { type: String }, // e.g., Collected, Transferred, Verified
  from: { type: String },
  to: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String }
}, { _id: false });

const EvidenceSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true, unique: true },
  caseNumber: { type: String, required: false },
  evidenceType: { type: String },
  description: { type: String },
  location: { type: String },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  officerName: { type: String },
  filePath: { type: String, required: true },     // local path to uploaded file
  fileName: { type: String },                      // original filename
  contentType: { type: String },
  size: { type: Number },
  signaturePath: { type: String },                 // optional signature PNG path
  sha256: { type: String },
  status: { type: String, default: 'in_custody' },
  custodyHistory: { type: [CustodySchema], default: [] },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evidence', EvidenceSchema);
