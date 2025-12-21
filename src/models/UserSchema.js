const mongoose = require("mongoose");

const customFieldSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["string", "number", "date", "boolean", "email", "media"],
  },
  required: { type: Boolean, default: false },
});

const userSchemaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  fields: { type: [customFieldSchema], default: [] },
});

module.exports = mongoose.model("UserSchema", userSchemaSchema);
