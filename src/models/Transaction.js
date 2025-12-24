const mongoose = require("mongoose");

/* ================= ATTACHMENT ================= */
const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/* ================= TRANSACTION ================= */
const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },

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

    transactionMode: {
      type: String,
      enum: ["UPI", "Cash", "Card", "Bank", "Wallet"],
      index: true,
    },

    transactionDate: {
      type: Date,
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

    remarks: {
      type: String,
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    customFields: {
      type: mongoose.Schema.Types.Mixed,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
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
    minimize: false,
    timestamps: false,
  }
);

/* ================= INDEXES ================= */

// 🔥 User + Date (most used)
transactionSchema.index({ createdBy: 1, transactionDate: -1 });

// 🔥 Filters
transactionSchema.index({ createdBy: 1, transactionType: 1 });
transactionSchema.index({ createdBy: 1, transactionMode: 1 });
transactionSchema.index({ createdBy: 1, category: 1 });

// 🔥 Full-text search
transactionSchema.index({
  title: "text",
  counterparty: "text",
  remarks: "text",
});

module.exports = mongoose.model("Transaction", transactionSchema);
