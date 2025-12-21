const mongoose = require("mongoose");

/* ================= ATTACHMENT ================= */
const attachmentSchema = new mongoose.Schema(
  {
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    url: String,
  },
  { _id: false }
);

/* ================= TRANSACTION ================= */
const transactionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      index: true,
    },

    transactionType: {
      type: String,
      enum: ["Credit", "Debit"],
      required: true,
      index: true,
    },

    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      index: true,
    },

    counterparty: {
      type: String,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    remarks: String,

    transactionMode: {
      type: String,
      enum: ["UPI", "Cash", "Card", "Bank", "Wallet"],
      index: true,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    attachments: [attachmentSchema],

    customFields: {
      type: mongoose.Schema.Types.Mixed,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdOn: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedOn: {
      type: Date,
    },
  },
  {
    minimize: false, // keeps empty objects (important for customFields)
  }
);

/* ================= COMPOUND INDEXES ================= */

// 🔥 User + Date (MOST IMPORTANT)
transactionSchema.index({ createdBy: 1, transactionDate: -1 });

// 🔥 User + Type
transactionSchema.index({ createdBy: 1, transactionType: 1 });

// 🔥 User + Mode
transactionSchema.index({ createdBy: 1, transactionMode: 1 });

// 🔥 User + Category
transactionSchema.index({ createdBy: 1, category: 1 });

// 🔥 Search optimization
transactionSchema.index({
  title: "text",
  counterparty: "text",
  remarks: "text",
});

module.exports = mongoose.model("Transaction", transactionSchema);
