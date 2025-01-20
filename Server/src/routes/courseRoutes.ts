import express from "express";
import { createCourse } from "../controller/course/createCourse";
import { uploadBanner } from "../controller/course/uploadBanner";
import { getCourse } from "../controller/course/getCourse";
import { deleteCourse } from "../controller/course/deleteCourse";
import { registerCourse } from "../controller/course/registerCourse";
import { getCourseRegistrations } from "../controller/course/getCourseRegis";
import { confirmTrainingResults } from "../controller/course/confirmResults";
import { getAvailableCourses } from "../controller/course/getCourseOpen";
const router = express.Router();

router.post("/create", createCourse);
router.post("/upload_banner", uploadBanner);
router.post("/get_course", getCourse);
router.post("/delete_course", deleteCourse);
router.post("/register", registerCourse);
router.post("/course_register_details", getCourseRegistrations);
router.post("/confirm_result", confirmTrainingResults);
router.get("/available_courses", getAvailableCourses);

export default router;
