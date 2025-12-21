const UserSchema = require("../models/UserSchema");

/* ================= GET SCHEMA ================= */
exports.getSchema = async (req, res) => {
  try {
    let schema = await UserSchema.findOne({ user: req.user._id });

    if (!schema) {
      schema = await UserSchema.create({ user: req.user._id, fields: [] });
    }

    return res.status(200).json(schema);
  } catch (error) {
    console.error("GET_SCHEMA_ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch schema" });
  }
};

/* ================= ADD FIELD ================= */
exports.addField = async (req, res) => {
  try {
    const { key, label, type, required = false } = req.body;

    if (!key || !label || !type) {
      return res
        .status(400)
        .json({ message: "Key, label and type are required" });
    }

    const schema = await UserSchema.findOne({ user: req.user._id });
    if (!schema) {
      return res.status(404).json({ message: "Schema not found" });
    }

    const fieldExists = schema.fields.some((f) => f.key === key);
    if (fieldExists) {
      return res.status(409).json({ message: "Field already exists" });
    }

    schema.fields.push({
      key: key.trim(),
      label: label.trim(),
      type,
      required,
    });

    await schema.save();

    return res.status(200).json(schema);
  } catch (error) {
    console.error("ADD_FIELD_ERROR:", error.message);
    return res.status(500).json({ message: "Failed to add field" });
  }
};

/* ================= UPDATE SCHEMA ================= */
exports.updateSchema = async (req, res) => {
  try {
    const { fields } = req.body;

    if (!Array.isArray(fields)) {
      return res.status(400).json({ message: "Fields must be an array" });
    }

    const schema = await UserSchema.findOneAndUpdate(
      { user: req.user._id },
      { fields },
      { new: true, runValidators: true }
    );

    if (!schema) {
      return res.status(404).json({ message: "Schema not found" });
    }

    return res.status(200).json(schema);
  } catch (error) {
    console.error("UPDATE_SCHEMA_ERROR:", error.message);
    return res.status(500).json({ message: "Failed to update schema" });
  }
};
