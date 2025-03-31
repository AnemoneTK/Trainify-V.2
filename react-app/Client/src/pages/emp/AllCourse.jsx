import { useEffect, useState } from "react";
import { Button, Input, Row, Col, message, Tag } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import callApi from "../../utils/axios";
import RegisterModal from "../../components/RegisterModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import blank_pic from "/Blank_Picture.jpg";
import { FaUserFriends } from "react-icons/fa";
export default function AllCourse() {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [courses, setCourses] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseID, setCourseID] = useState(null);

  useEffect(() => {
    if (!isModalVisible) {
      getCourses();
    }
  }, [isModalVisible]);
  useEffect(() => {
    console.log("courses", courses);
  }, [courses]);

  const getCourses = async () => {
    try {
      const response = await callApi({
        path: "/api/course/get_course",
        method: "post",
        value: {},
      });

      // ตรวจสอบว่า response มีข้อมูลหรือไม่
      if (response && response.data) {
        setCourses(response.data);
      } else {
        message.error("ไม่สามารถดึงข้อมูลหลักสูตรได้");
      }
    } catch (error) {
      console.log("error", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร");
      if (error.statusCode === 401) {
        Swal.fire({
          title: `${error.message}`,
          icon: `${error.icon}`,
          confirmButtonText: "ตกลง",
        }).then(() => {
          navigate("/");
        });
      }
    }
  };

  // ฟังก์ชันเปิด Modal
  const openModal = (id) => {
    setCourseID(id);
    setIsModalVisible(true);
  };

  // ฟังก์ชันปิด Modal
  const closeModal = () => {
    setIsModalVisible(false);
    setCourseID(null);
  };

  // ฟังก์ชันค้นหาหลักสูตร
  const filteredCourses = courses?.data?.filter((course) =>
    course.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <div className="p-4 max-w-full ">
        {/* Back Button */}
        <div className="flex items-center mb-7 relative">
          <div
            className="mr-4 border-none absolute left-0 text-xl font-bold"
            onClick={() => window.history.back()}
          >
            <LeftOutlined />
          </div>
          <h1 className="text-2xl font-bold text-center w-full">
            หลักสูตรทั้งหมด
          </h1>
        </div>

        {/* Search Bar */}
        <Input
          className="mb-4"
          placeholder="ค้นหาหลักสูตร"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* Courses List */}
        <div className="bg-white shadow-md py-5 px-2 flex justify-around overflow-y-auto max-h-[75dvh] custom-scrollbar">
          <Row gutter={[16, 16]} className="w-full">
            {filteredCourses?.map((course, index) => (
              <Col xs={24} sm={24} md={12} lg={6} key={index}>
                <div className="shadow-md w-full border p-0 rounded-md flex flex-col h-full">
                  <div className="relative h-36  md:h-52 mb-4 border-opacity-30 rounded-t-md">
                    <img
                      src={course.banner ? course.banner : blank_pic}
                      alt="Course Banner"
                      className="w-full h-full object-cover rounded-t-md"
                    />
                  </div>
                  <div className="px-3 pb-3 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-1">
                      {course?.tag?.map((item, index) => (
                        <Tag key={index}>{item.name}</Tag>
                      ))}
                    </div>
                    <div className="text-wrap text-xl mt-2 line-clamp-2 h-full">
                      {course.title}
                    </div>
                    <div className="flex gap-2">
                      {course?.instructors?.map((item, index) => (
                        <div key={index}>
                          {item}
                          {index < course.instructors.length - 1 && ","}
                        </div>
                      ))}
                    </div>
                    <div className="flex my-3 gap-3">
                      <div className="text-sm text-gray-600 ">
                        <Tag
                          color={course.type == "online" ? "green" : "magenta"}
                          className="py-2  font-bold"
                        >
                          {course.type == "online" ? "Online" : "Offline"}
                        </Tag>
                      </div>
                      <Tag
                        color={course.availabilityStatus ? "cyan" : "red"}
                        className="flex flex-row items-center justify-center gap-2"
                      >
                        <FaUserFriends className="text-2xl" />
                        <div className="py-2 text-[1rem] font-bold">
                          {course.availabilityStatus ? "ว่าง" : "เต็ม"}
                        </div>
                      </Tag>
                    </div>
                    <div className="mt-2 text-gray-500">{course.duration}</div>
                    <Button
                      type="primary"
                      className="w-full"
                      onClick={() => openModal(course._id)}
                    >
                      ดูรายละเอียด
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Register Modal */}
      <RegisterModal
        visible={isModalVisible}
        onClose={closeModal}
        courseID={courseID}
      />
    </div>
  );
}
