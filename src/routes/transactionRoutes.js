const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.post(
  "/",
  authMiddleware,
  upload.array("attachments", 5),
  createTransaction
);

router.get("/", authMiddleware, getTransactions);
router.get("/:id", authMiddleware, getTransaction);

router.put(
  "/:id",
  authMiddleware,
  upload.array("attachments", 5),
  updateTransaction
);

router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;
