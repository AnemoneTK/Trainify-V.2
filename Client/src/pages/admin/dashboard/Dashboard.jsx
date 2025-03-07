import { Tabs, Badge } from "antd";
import Swal from "sweetalert2";
import EmpList from "./EmpList";
import CourseList from "./CourseList";
import CourseEndList from "./CouseEndList";
import { useState, useEffect } from "react";
import callApi from "../../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [endCourse, setEndCourse] = useState(0);
  useEffect(() => {
    get_courses();
  }, []);

  const get_courses = async () => {
    try {
      const response = await callApi({
        path: "/api/course/get_course_end",
        method: "get",
        value: {},
      });

      console.log(response);
      setEndCourse(response.data.count.end);
    } catch (error) {
      console.log("errorResponse", error);
      if (error.statusCode === 400 || error.statusCode === 401) {
        Swal.fire({
          title: `${error.message}`,
          message: `${error.error}`,
          icon: `${error.icon}`,
          confirmButtonText: "ตกลง",
        }).then(() => {
          if (error.statusCode === 401) {
            navigate("/");
          }
        });
      } else {
        navigate("/");
      }
    }
  };
  return (
    <div className="p-5 ">
      {/* <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1> */}
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="รายชื่อพนักงาน" key="1">
          <EmpList />
        </Tabs.TabPane>
        <Tabs.TabPane tab="หลักสูตรฝึกอบรม" key="2">
          <CourseList />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span>
              หลักสูตรที่จบแล้ว{" "}
              <Badge
                count={endCourse}
                style={{ position: "static", marginLeft: 8 }}
              />
            </span>
          }
          key="3"
        >
          <CourseEndList setEndCourse={setEndCourse} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
