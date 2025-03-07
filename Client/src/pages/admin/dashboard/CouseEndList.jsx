import { CiSearch } from "react-icons/ci";
import { Input, Button, Table, Spin, Tag, Space, Badge } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import callApi from "../../../utils/axios";
import ConfirmResult from "../../../components/ConfirmResult";

export default function CourseEndList({ setEndCourse }) {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // all, end, close
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [counts, setCounts] = useState({ all: 0, end: 0, close: 0 });

  useEffect(() => {
    if (navigate && navigate) {
      getCourses();
    }
  }, []);

  // เมื่อมีการดึงข้อมูล courses แล้ว ให้กรองตาม status ที่เลือก
  useEffect(() => {
    if (courses.length) {
      applyFilter(statusFilter);
    }
  }, [courses, statusFilter]);

  const getCourses = async () => {
    try {
      setSpinning(true);
      const response = await callApi({
        path: "/api/course/get_course_end",
        method: "get",
        value: {},
      });

      if (response && response.data) {
        // response.data.count จะมีรูปแบบ { all: number, end: number, close: number }
        setCounts(response.data.count);
        setEndCourse(response.data.count.end); // set EndCourse count ให้กับ parent ถ้ามี

        const courseData = response.data.data.map((item, index) => ({
          ...item,
          key: item._id || index + 1,
          totalRegisteredSeats: item.schedule.reduce((sum, sch) => {
            return (
              sum +
              sch.times.reduce((tSum, timeSlot) => {
                return tSum + timeSlot.registeredSeats;
              }, 0)
            );
          }, 0),
        }));
        setCourses(courseData);
      } else {
        Swal.fire({
          title: "ไม่สามารถดึงข้อมูลหลักสูตรได้",
          icon: "error",
          confirmButtonText: "ตกลง",
        });
      }
      setSpinning(false);
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
      setSpinning(false);
    }
  };

  const handleRowClick = (record) => {
    setSelectedCourse(record);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCourse(null);
    getCourses();
  };

  // ฟังก์ชันกรอง courses ตามสถานะ
  const applyFilter = (filterStatus) => {
    if (filterStatus === "all") {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(
        courses.filter((course) => course.status === filterStatus)
      );
    }
  };

  // ปุ่มกรองสถานะหลักสูตร
  const renderFilterButtons = () => {
    return (
      <Space size="middle">
        <Button
          type={statusFilter === "all" ? "primary" : "default"}
          onClick={() => setStatusFilter("all")}
        >
          ทั้งหมด{" "}
          <Badge
            color="blue"
            count={counts.all || 0}
            style={{ position: "static", marginLeft: 8 }}
          />
        </Button>
        <Button
          type={statusFilter === "end" ? "primary" : "default"}
          onClick={() => setStatusFilter("end")}
        >
          รออนุมัติ{" "}
          <Badge
            color="red"
            count={counts.end || 0}
            style={{ position: "static", marginLeft: 8 }}
          />
        </Button>
        <Button
          type={statusFilter === "close" ? "primary" : "default"}
          onClick={() => setStatusFilter("close")}
        >
          อนุมัติแล้ว{" "}
          <Badge
            color="green"
            count={counts.close || 0}
            style={{ position: "static", marginLeft: 8 }}
          />
        </Button>
      </Space>
    );
  };

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      render: (text, record, index) => index + 1,
      width: 80,
      align: "center",
    },
    {
      title: "ชื่อหลักสูตร",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "สถานที่",
      dataIndex: "place",
      key: "place",
      render: (place) => place?.description || "-",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        let text = "";
        switch (status) {
          case "public":
            color = "green";
            text = "เปิดรับสมัคร";
            break;
          case "close":
            color = "red";
            text = "ปิดรับสมัคร";
            break;
          case "end":
            color = "blue";
            text = "จบการอบรม";
            break;
          case "deleted":
            color = "gray";
            text = "ถูกลบ";
            break;
          default:
            color = "default";
            text = "ไม่ระบุ";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "รูปแบบการอบรม",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "online" ? "green" : "magenta"}>
          {type === "online" ? "ออนไลน์" : "ออฟไลน์"}
        </Tag>
      ),
    },
    {
      title: "จำนวนที่นั่งที่ลงทะเบียน",
      dataIndex: "totalRegisteredSeats",
      key: "totalRegisteredSeats",
      render: (text) => <span>{text}</span>,
    },
  ];

  return (
    <>
      <div className="p-4">
        <div className="flex flex-col md:flex-row items-end justify-between">
          <div>
            <div className="text-2xl font-bold">หลักสูตรที่จบแล้ว</div>
            <div className="text-md hidden md:block">
              ยืนยันผลการอบรมหลักสูตร
            </div>
          </div>
        </div>
        <div className="flex flex-col shadow-md bg-white rounded-lg mt-5 max-h-[70dvh]">
          <div className="search flex flex-row items-center justify-between p-4">
            <div className="w-1/6">
              <Input prefix={<CiSearch />} placeholder="ค้นหาหลักสูตร" />
            </div>
            <div>{renderFilterButtons()}</div>
          </div>
          <div>
            <Spin spinning={spinning}>
              <Table
                pagination={
                  filteredCourses && filteredCourses.length > 10
                    ? {
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50],
                        pageSize: 10,
                      }
                    : false
                }
                sticky={true}
                dataSource={filteredCourses || []}
                rowKey="key"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                })}
                columns={columns}
              />
            </Spin>
          </div>
        </div>
      </div>
      <ConfirmResult
        visible={isModalVisible}
        onClose={closeModal}
        courseId={selectedCourse?._id || ""}
      />
    </>
  );
}

CourseEndList.propTypes = {
  setEndCourse: PropTypes.func.isRequired,
};
