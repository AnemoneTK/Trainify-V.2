import {
  Card,
  Button,
  Calendar,
  List,
  message,
  Tag,
  Col,
  Divider,
  Badge,
} from "antd";
import { useState, useEffect } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import callApi from "../../../utils/axios";
import RegisterModal from "../../../components/RegisterModal";
import { FaUserFriends } from "react-icons/fa";
import dayjs from "dayjs";
import { SmileOutlined } from "@ant-design/icons"; // Import
import { RiPassExpiredFill } from "react-icons/ri";
import { VscPassFilled } from "react-icons/vsc";
import { MdEditDocument } from "react-icons/md";
export default function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseID, setCourseID] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [scheduleDetails, setScheduleDetails] = useState([]);
  useEffect(() => {
    getCourses();
    getCoursesRegis();
    handleDateSelect(dayjs());
  }, []);

  useEffect(() => {
    console.log(courses);
  }, [courses]);
  useEffect(() => {
    console.log("selectedDate", selectedDate);
  }, [selectedDate]);

  const getCourses = async () => {
    try {
      const response = await callApi({
        path: "/api/course/get_course",
        method: "post",
        value: {},
      });

      // ตรวจสอบว่า response มีข้อมูลหรือไม่
      if (response && response.data) {
        setCourses(response.data.data);
      } else {
        message.error("ไม่สามารถดึงข้อมูลหลักสูตรได้");
      }
    } catch (error) {
      console.log("error", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร");
    }
  };

  const getCoursesRegis = async () => {
    try {
      const response = await callApi({
        path: "/api/course/user_register_details",
        method: "post",
        value: {},
      });

      // ตรวจสอบว่า response มีข้อมูลหรือไม่
      if (response && response.data) {
        setSchedule(response.data);
      } else {
        message.error("ไม่สามารถดึงข้อมูลหลักสูตรได้");
      }
    } catch (error) {
      console.log("error", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร");
    }
  };
  const openModal = (id) => {
    setCourseID(id);
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setIsModalVisible(false);
    setCourseID(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const selectedDateStr = dayjs(date).format("YYYY-MM-DD");

    // Filter schedule based on the selected date
    const filteredSchedules = schedule?.courses?.filter(
      (course) =>
        dayjs(course.registrationDate).format("YYYY-MM-DD") === selectedDateStr
    );

    setScheduleDetails(filteredSchedules);
  };

  const dateCellRender = (date) => {
    const dateStr = date.format("YYYY-MM-DD");

    const coursesOnDate = schedule?.courses?.filter(
      (course) =>
        dayjs(course.registrationDate).format("YYYY-MM-DD") === dateStr
    );

    if (coursesOnDate?.length) {
      return (
        <Badge
          count={coursesOnDate.length}
          status="warning"
          className="absolute -top-1  -right-1"
          size="small"
        />
      );
    }
  };

  return (
    <>
      <div className="p-4 ">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3 flex flex-col gap-4">
            <Card
              title="ภาพรวมการอบรม"
              className="rounded-md shadow-md"
              extra={
                <Button
                  type="primary"
                  onClick={() => navigate("/register_courses")}
                >
                  ดูทั้งหมด
                </Button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gray-100">
                  <div className="flex flex-row items-center justify-between">
                    <div className="text-left ">
                      <p className="text-md  md:text-lg">
                        หลักสูตรที่ลงทะเบียน
                      </p>
                      <p className=" text-5xl font-bold">
                        {" "}
                        {schedule?.registeredCourses}
                      </p>
                    </div>
                    <div>
                      <MdEditDocument className="text-[4rem] text-emp-primary" />
                    </div>
                  </div>
                </Card>
                <Card className="bg-gray-100">
                  <div className="flex flex-row items-center justify-between">
                    <div className="text-left ">
                      <p className=" text-md  md:text-lg">
                        หลักสูตรที่ผ่านการอบรม
                      </p>
                      <p className=" text-5xl font-bold ">
                        {" "}
                        {schedule?.passedCourses}
                      </p>
                    </div>
                    <div>
                      <VscPassFilled className="text-[4rem] text-admin-primary" />
                    </div>
                  </div>
                </Card>
                <Card className="bg-gray-100">
                  <div className="flex flex-row items-center justify-between">
                    <div className="text-left ">
                      <p className=" text-md  md:text-lg">หลักสูตรที่หมดอายุ</p>
                      <p className=" text-5xl font-bold">
                        {" "}
                        {schedule?.expiredCourses}
                      </p>
                    </div>
                    <div>
                      <RiPassExpiredFill className="text-[4rem] text-danger" />
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* หลักสูตรแนะนำ */}
            <Card
              title="หลักสูตรแนะนำ"
              className="rounded-md shadow-md"
              extra={
                <Button type="primary" onClick={() => navigate("/courses")}>
                  หลักสูตรทั้งหมด
                </Button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(courses?.slice(0, 3) || [])?.map((course, index) => (
                  <Col xs={24} sm={24} md={8} lg={24} key={index}>
                    <div className="shadow-md w-full border p-0 rounded-md flex flex-col h-full">
                      <div className="p-3 flex flex-col flex-grow">
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
                              color={
                                course.type == "online" ? "green" : "magenta"
                              }
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
                        <div className="mt-2 text-gray-500">
                          {course.duration}
                        </div>
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
              </div>
            </Card>
          </div>

          <div className="w-full md:w-1/3 flex flex-col gap-4 ">
            <Card className="rounded-md shadow-md">
              <Calendar
                fullscreen={false}
                dateCellRender={dateCellRender}
                onSelect={handleDateSelect}
                headerRender={({ value, onChange }) => {
                  return (
                    <div className="flex items-center justify-between p-2">
                      <Button
                        onClick={() =>
                          onChange(value.clone().subtract(1, "month"))
                        }
                        icon={<LeftOutlined />}
                      />
                      <div className="text-lg font-semibold">
                        {value.format("MMMM YYYY")}
                      </div>
                      <Button
                        onClick={() => onChange(value.clone().add(1, "month"))}
                        icon={<RightOutlined />}
                      />
                    </div>
                  );
                }}
              />
              <Divider />
              <div className="text-xl font-bold mb-3">
                กำหนดการวันที่ {selectedDate?.format("DD MMM YYYY")}
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {selectedDate && (
                  <Card className="rounded-md shadow-xl border-2">
                    {scheduleDetails && scheduleDetails.length > 0 ? (
                      <List
                        dataSource={scheduleDetails}
                        renderItem={(item) => (
                          <List.Item>
                            <div>
                              <div className="text-xl flex flex-row gap-2">
                                เวลา :
                                <div className="font-bold">
                                  {dayjs(item.timeSlot.start).format("HH:mm")} -{" "}
                                  {dayjs(item.timeSlot.end).format("HH:mm")}
                                </div>
                              </div>
                              <h4>
                                {" "}
                                <strong>หลักสูตร:</strong> {item.courseTitle}
                              </h4>

                              <div>
                                <strong>สถานที่:</strong> {item.coursePlace}
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <div className="flex flex-col gap-3 items-center justify-center py-10">
                        <SmileOutlined className="text-[3rem] text-admin-accent" />
                        <p className="text-lg text-gray-600">
                          ไม่มีการกำหนดการ
                        </p>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <RegisterModal
        visible={isModalVisible}
        onClose={closeModal}
        courseID={courseID}
      />
    </>
  );
}
