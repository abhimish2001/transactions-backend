const Transaction = require("../models/Transaction");
const cloudinary = require("../config/cloudinary");

/* =========================================================
   HELPER: Upload buffer to Cloudinary
========================================================= */
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "transactions" }, (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      })
      .end(buffer);
  });
};

/* =========================================================
   CREATE TRANSACTION
========================================================= */
exports.createTransaction = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      transactionType = "Debit",
      transactionMode = "UPI",
      transactionDate,
      counterparty = "",
      remarks = "",
    } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({
        message: "Title, amount and category are required",
      });
    }

    /* ---------- Upload Attachments ---------- */
    let attachments = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        attachments.push(uploaded);
      }
    }

    const transaction = await Transaction.create({
      title: title.trim(),
      category,
      transactionType,
      transactionMode,
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      counterparty: counterparty.trim(),
      amount: Number(amount),
      remarks: remarks.trim(),
      attachments,
      createdBy: req.user._id,
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error("CREATE_TRANSACTION_ERROR:", error);
    return res.status(500).json({ message: "Failed to create transaction" });
  }
};

/* =========================================================
   GET SINGLE TRANSACTION
========================================================= */
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      active: true,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error("GET_TRANSACTION_ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch transaction" });
  }
};

/* =========================================================
   GET ALL TRANSACTIONS (FILTER + PAGINATION)
========================================================= */
exports.getTransactions = async (req, res) => {
  try {
    const {
      transactionType,
      transactionMode,
      category,
      counterparty,
      startDate,
      endDate,
      month,
      year,
      limit = 20,
      page = 1,
    } = req.query;

    const filter = {
      createdBy: req.user._id,
      active: true,
    };

    if (transactionType && transactionType !== "All") {
      filter.transactionType = transactionType;
    }

    if (transactionMode && transactionMode !== "All") {
      filter.transactionMode = transactionMode;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (counterparty) {
      filter.counterparty = { $regex: counterparty, $options: "i" };
    }

    if (month && year) {
      filter.transactionDate = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59),
      };
    } else if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET_TRANSACTIONS_ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

/* =========================================================
   UPDATE TRANSACTION
========================================================= */
exports.updateTransaction = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.amount) {
      updateData.amount = Number(updateData.amount);
    }

    if (updateData.transactionDate) {
      updateData.transactionDate = new Date(updateData.transactionDate);
    }

    /* ---------- Upload New Attachments ---------- */
    let newAttachments = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        newAttachments.push(uploaded);
      }
    }

    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
        ...updateData,
        ...(newAttachments.length && {
          $push: { attachments: { $each: newAttachments } },
        }),
        updatedBy: req.user._id,
        updatedOn: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Transaction not found or unauthorized" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error("UPDATE_TRANSACTION_ERROR:", error);
    return res.status(500).json({ message: "Failed to update transaction" });
  }
};

/* =========================================================
   DELETE TRANSACTION
========================================================= */
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    /* ---------- Delete Cloudinary Files ---------- */
    for (const file of transaction.attachments || []) {
      if (file.publicId) {
        await cloudinary.uploader.destroy(file.publicId);
      }
    }

    await transaction.deleteOne();

    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("DELETE_TRANSACTION_ERROR:", error);
    return res.status(500).json({ message: "Failed to delete transaction" });
  }
};
