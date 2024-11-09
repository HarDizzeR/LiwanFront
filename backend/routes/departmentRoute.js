const express = require("express");
const departmentController = require("../controllers/departmentController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.protect);
router
  .route("/:id")
  .get(
    authController.restrictTo("admin", "manager","e"),
    departmentController.getDepartment
  )
  .patch(
    authController.restrictTo("admin", "manager"),
    departmentController.updateDepartment
  )
  .delete(
    authController.restrictTo("admin", "manager"),
    departmentController.deleteDepartment
  );
router.use(authController.restrictTo("admin", "manager","employee"));
router
  .route("/")
  .get(departmentController.getAllDepartments)
  .post(departmentController.createDepartment);

module.exports = router;
