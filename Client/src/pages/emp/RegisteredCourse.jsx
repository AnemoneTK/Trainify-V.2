import { useEffect, useState } from "react";
import { Table, Button, Tag, message, Space, Input } from "antd";
import callApi from "../../utils/axios";
import { LeftOutlined } from "@ant-design/icons";

export default function RegisteredCourse() {
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [passedCourses, setPassedCourses] = useState(0);
  const [expiredCourses, setExpiredCourses] = useState(0);
  const [searchText, setSearchText] = useState("");

  // Fetch data
  useEffect(() => {
    fetchRegisteredCourses();
  }, []);

  const fetchRegisteredCourses = async () => {
    try {
      const response = await callApi({
        path: "/api/course/user_register_details", // Replace with your API endpoint
        method: "post",
        value: {},
      });

      if (response?.data) {
        const courses = response.data.courses;
        setRegisteredCourses(courses);
        setFilteredCourses(courses);

        // Count categories (all, passed, expired)
        setTotalCourses(courses.length);
        setPassedCourses(
          courses.filter((course) => course.status === "passed").length
        );
        setExpiredCourses(
          courses.filter((course) => course.status === "expired").length
        );
      } else {
        message.error("ไม่สามารถดึงข้อมูลหลักสูตรที่ลงทะเบียนได้");
      }
    } catch (error) {
      console.log("Error fetching registered courses:", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  };

  // Handle filter button click
  const filterCourses = (status) => {
    if (status === "all") {
      setFilteredCourses(registeredCourses);
    } else {
      const filtered = registeredCourses.filter(
        (course) => course.status === status
      );
      setFilteredCourses(filtered);
    }
  };

  const columns = [
    {
      title: "หลักสูตร",
      dataIndex: "courseTitle",
      key: "courseTitle",
      render: (text) => <span className="font-semibold">{text}</span>,
    },

    {
      title: "สถานที่",
      dataIndex: "coursePlace",
      key: "coursePlace",
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "passed") {
          return <Tag color="green">ผ่าน</Tag>;
        } else if (status === "expired") {
          return <Tag color="red">หมดอายุ</Tag>;
        }
        return <Tag color="orange">รอการยืนยัน</Tag>;
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center mb-6 relative">
        <div
          className="absolute left-0 text-xl font-bold cursor-pointer text-blue-600"
          onClick={() => window.history.back()}
        >
          <LeftOutlined />
        </div>
        <h1 className="text-2xl font-semibold text-center w-full">
          หลักสูตรที่ลงทะเบียน
        </h1>
      </div>

      <Space className="mb-4" size="large">
        <Input
          placeholder="ค้นหาหลักสูตร"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          onClick={() => filterCourses("all")}
          className="bg-gray-300 text-black"
        >
          ทั้งหมด {totalCourses}
        </Button>
        <Button
          onClick={() => filterCourses("passed")}
          className="bg-green-300 text-black"
        >
          ผ่านแล้ว {passedCourses}
        </Button>
        <Button
          onClick={() => filterCourses("expired")}
          className="bg-red-300 text-black"
        >
          หมดอายุ {expiredCourses}
        </Button>
      </Space>

      {/* Table for Registered Courses */}
      <div className="bg-white shadow-lg rounded-lg p-4 max-h-[70vh] overflow-auto">
        <Table
          columns={columns}
          dataSource={filteredCourses}
          rowKey="courseId"
          pagination={false}
          bordered
        />
      </div>
    </div>
  );
}
