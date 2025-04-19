import express from "express";
import { createCourse } from "../controller/course/createCourse";
import {
  handleUpload,
  uploadBannerMiddleware,
  deleteBanner,
} from "../controller/course/uploadBanner";
import { editCourse } from "../controller/course/editCourse";
import { getCourse, getEndedCourses } from "../controller/course/getCourse";
import { deleteCourse } from "../controller/course/deleteCourse";
import { registerCourse } from "../controller/course/registerCourse";
import { getCourseRegistrations } from "../controller/course/getCourseRegis";
import { confirmTrainingResults } from "../controller/course/confirmResults";
import { getAvailableCourses } from "../controller/course/getCourseOpen";
// import {
//   createTag,
//   getTags,
//   updateTag,
// } from "../controller/course/tagController";
import { getUserRegistrations } from "../controller/course/userCourse";

const router = express.Router();

router.post("/create", createCourse);
router.post("/upload_banner", uploadBannerMiddleware, handleUpload);
router.post("/delete_banner", deleteBanner);
router.post("/get_course", getCourse);
router.get("/get_course_end", getEndedCourses);
router.put("/edit", editCourse);
router.post("/delete", deleteCourse);
router.post("/register", registerCourse);
router.post("/course_register_details", getCourseRegistrations);
router.post("/user_register_details", getUserRegistrations);
router.post("/confirm_result", confirmTrainingResults);
router.get("/available_courses", getAvailableCourses);

// router.post("/tag/create", createTag);
// router.get("/tag/gets", getTags);
// router.post("/tag/update", updateTag);

export default router;
