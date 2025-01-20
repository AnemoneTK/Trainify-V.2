import { Request, Response, courseSchema } from "../../utils/constants";
import upload from "../../middlewares/upload"; // import multer middleware

const Course = courseSchema;

export const getcourseDelete = async (req: Request, res: Response) => {
  const { courseID } = req.body;

  try {
    if (!courseID) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a course ID.",
      });
    }

    const course = await Course.findById(courseID);

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found.",
      });
    }

    if (course.status === "deleted") {
      return res.status(400).json({
        status: "error",
        message: "Course has already been deleted.",
      });
    }

    course.status = "deleted";
    await course.save();

    return res.status(200).json({
      status: "success",
      message: "Course deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "An error occurred while deleting the course.",
    });
  }
};
