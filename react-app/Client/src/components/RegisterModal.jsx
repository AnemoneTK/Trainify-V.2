import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Space,
  Row,
  Col,
  Typography,
  message,
  Divider,
} from "antd";
import dayjs from "dayjs";
import callApi from "../utils/axios";

const { Title, Text } = Typography;

export default function RegisterModal({ visible, onClose, courseID }) {
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [register, setRegister] = useState({
    courseId: "",
    date: "",
    timeSlot: "",
  });

  useEffect(() => {
    if (visible && courseID) {
      setRegister({
        courseId: courseID,
        date: "",
        timeSlot: "",
      });
      getCourse();
      setAvailableTimes([]);
    }
  }, [visible, courseID]);

  useEffect(() => {
    setRegister((prev) => ({
      ...prev,
      timeSlot: "",
    }));
  }, [register.dete]);

  useEffect(() => {
    console.log("register", register);
  }, [register]);

  const getCourse = async () => {
    try {
      const response = await callApi({
        path: "/api/course/get_course",
        method: "post",
        value: { courseID: courseID },
      });

      if (response && response.data && response.data.data.length > 0) {
        setCourse(response.data.data[0]);
      } else {
        message.error("ไม่สามารถดึงข้อมูลหลักสูตรได้");
      }
    } catch (error) {
      console.log("error", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร");
    }
  };

  const handleDateSelect = (date) => {
    setRegister((prev) => ({
      ...prev,
      date: date.format("YYYY-MM-DD"), // set selected date in register
    }));
    const scheduleForSelectedDate = course.schedule.filter((sch) =>
      dayjs(sch.date).isSame(date, "day")
    );
    setAvailableTimes(scheduleForSelectedDate[0]?.times || []);
  };

  const handleTimeSelect = (timeSlot) => {
    setRegister((prev) => ({
      ...prev,
      timeSlot: timeSlot, // set selected timeSlot in register
    }));
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await callApi({
        path: "/api/course/register",
        method: "post",
        value: register,
      });
      if (response.status === "success") {
        message.success("ลงทะเบียนสำเร็จ");
      }
      onClose(true);
    } catch (error) {
      const errorResponse = error;
      console.error("Error saving course:", errorResponse);

      if (errorResponse.statusCode !== 500) {
        message.error(`${errorResponse.message}`);
      } else {
        message.error("เกิดข้อผิดพลาดในการลงทะเบียน");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="ลงทะเบียนหลักสูตร"
      onCancel={() => onClose(false)}
      footer={null}
      width={1000}
    >
      {course && (
        <>
          {/* Course Banner */}
          {course.banner && (
            <div className="relative mb-4 border border-black  border-opacity-30  rounded-md">
              <img
                src={course.banner}
                alt="Course Banner"
                className="w-full h-[300px] object-cover rounded-lg"
              />
            </div>
          )}

          {/* Course Title */}
          <Title level={2} className="m-0 p-0">
            {course.title}
          </Title>
          <div className="text-md">{course.description}</div>
          <Divider />

          {/* Instructors */}
          <Text strong>อาจารย์ผู้สอน:</Text>
          <p>{course.instructors?.join(", ")}</p>

          {/* Course Location */}
          <Text strong>สถานที่จัดอบรม:</Text>
          <p>{course.place?.description}</p>

          {/* Course Due Date */}
          <Text strong>วันเปิดรับสมัคร/ปิดรับสมัคร:</Text>
          <p>
            {dayjs(course.dueDate?.start).format("DD MMM YYYY")} -{" "}
            {dayjs(course.dueDate?.end).format("DD MMM YYYY")}
          </p>

          <Divider />
          {/* Select Date for Registration */}
          <Row>
            <Col span={24}>
              <Text strong>เลือกวันที่จะลงทะเบียน:</Text>
              <div>
                <Space direction="horizontal" size={[10, 10]} wrap>
                  {course.schedule.map((sch) => {
                    // เช็คว่าในวันนั้นๆ ทุกเวลาเต็มไหม
                    const allTimesFull = sch.times.every(
                      (time) => time.seat - time.registeredSeats === 0
                    );

                    return (
                      <Button
                        key={sch.date}
                        className={`${
                          register.date &&
                          register.date === dayjs(sch.date).format("YYYY-MM-DD")
                            ? "border-2 border-emp-primary bg-emp-secondary"
                            : ""
                        }`}
                        onClick={() => handleDateSelect(dayjs(sch.date))}
                        disabled={
                          allTimesFull ||
                          dayjs(sch.date).isBefore(
                            dayjs(course.dueDate?.start),
                            "day"
                          ) ||
                          course.registrationStatus
                        }
                      >
                        {allTimesFull
                          ? `${dayjs(sch.date).format("DD MMM YYYY")} (เต็ม)`
                          : dayjs(sch.date).format("DD MMM YYYY")}
                      </Button>
                    );
                  })}
                </Space>
              </div>
            </Col>
          </Row>

          {/* Available Time */}
          {register.date && (
            <>
              <Divider />
              <Text strong>เลือกเวลา:</Text>
              <Space direction="vertical" className="w-full">
                {availableTimes.length > 0 ? (
                  availableTimes.map((time, index) => (
                    <Button
                      key={index}
                      block
                      onClick={() => handleTimeSelect(time)}
                      className={`${
                        register.timeSlot && register.timeSlot._id === time._id
                          ? "border-2 border-emp-primary bg-emp-secondary"
                          : ""
                      }`}
                      disabled={time.seat - time.registeredSeats === 0} // Disable button when no seats are available
                    >
                      {dayjs(time.start).format("HH:mm")} -{" "}
                      {dayjs(time.end).format("HH:mm")} (
                      {time.seat - time.registeredSeats === 0
                        ? "เต็ม"
                        : `${time.seat - time.registeredSeats} ที่นั่งว่าง`}
                      )
                    </Button>
                  ))
                ) : (
                  <Text type="danger">
                    ไม่พบเวลาที่เปิดให้ลงทะเบียนสำหรับวันที่นี้
                  </Text>
                )}
              </Space>
            </>
          )}

          {/* Register Button */}
          <div className="mt-4">
            <Button
              type="primary"
              loading={loading}
              onClick={handleRegister}
              block
              disabled={!register.date || !register.timeSlot}
            >
              ลงทะเบียน
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

RegisterModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  courseID: PropTypes.string,
};
