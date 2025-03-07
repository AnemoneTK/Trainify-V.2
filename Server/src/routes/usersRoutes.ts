import express from "express";
import { createUser } from "../controller/users/createUser";
import { getUsers } from "../controller/users/getUsers";
import { getUserDelete } from "../controller/users/getUserDelete";
import { deleteUser } from "../controller/users/deleteUser";
import { confirmUser } from "../controller/users/confirmUser";
import { changeStatus } from "../controller/users/changeStatus";
import { getRegisteredCourses } from "../controller/users/userCourse";
import { editUser } from "../controller/users/editUser";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controller/department/department";
const router = express.Router();

router.post("/create", createUser);
router.post("/get_users", getUsers);
router.post("/get_users_deleted", getUserDelete);
router.post("/delete_user", deleteUser);
router.post("/confirm_user", confirmUser);
router.post("/change_status", changeStatus);
router.post("/register_course", getRegisteredCourses);
router.patch("/edit_user", editUser);

router.post("/create_department", createDepartment);
router.get("/get_department", getDepartments);
router.put("/update_department", updateDepartment);
router.delete("/delete_department", deleteDepartment);

export default router;
