const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  getSchema,
  addField,
  updateSchema,
} = require("../controllers/schemaController");

router.get("/", auth, getSchema);
router.post("/add", auth, addField);
router.put("/update", auth, updateSchema);

module.exports = router;
