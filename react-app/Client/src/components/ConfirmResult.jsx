import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal, Table, Select, Button, Spin, message } from "antd";
import { CheckOutlined, CloseOutlined, StopOutlined } from "@ant-design/icons";
import callApi from "../utils/axios";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
dayjs.extend(buddhistEra);
dayjs.locale("th");

export default function ConfirmResult({ visible, onClose, courseId }) {
  const [loading, setLoading] = useState(false);
  const [flatRegistrations, setFlatRegistrations] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseStatus, setCourseStatus] = useState("");
  const [results, setResults] = useState([]); // เก็บผลการเลือกสถานะในรูปแบบ { id, result }

  useEffect(() => {
    if (visible && courseId) {
      fetchRegistrations();
    }
  }, [visible, courseId]);
  useEffect(() => {
    console.log("courseStatus", courseStatus);
  }, [courseStatus]);
  useEffect(() => {
    console.log("flatRegistrations", flatRegistrations);
  }, [flatRegistrations]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await callApi({
        path: "/api/course/course_register_details",
        method: "post",
        value: { courseId },
      });

      if (response && response.data) {
        console.log("course_register_details", response);
        const regData = response.data;
        let flattened = [];

        Object.entries(regData.data).forEach(([dateKey, groups]) => {
          groups.forEach((group) => {
            const groupCourseTitle = group.courseTitle || "";
            setCourseStatus(group.status || "wait");
            group.users.forEach((user) => {
              const fullName = `${user.titleName || ""} ${
                user.firstName || ""
              } ${user.lastName || ""}`.trim();
              flattened.push({
                key: user._id,
                name: fullName,
                email: user.email,
                registrationDate: dateKey,
                timeSlot: group.timeSlot,
                courseTitle: groupCourseTitle,
                status: user.status || "wait",
              });
            });
          });
        });

        setFlatRegistrations(flattened);
        setCourseTitle(flattened[0]?.courseTitle || "หลักสูตร");

        // Initialize results state: ส่งเป็น { id, result } สำหรับแต่ละ registration
        setResults(
          flattened.map((reg) => ({ id: reg.key, result: reg.status }))
        );
      } else {
        message.error("ไม่สามารถดึงข้อมูลการลงทะเบียนได้");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน");
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับยืนยันผลการอบรม โดยส่งข้อมูล results ไปยัง backend
  const confirmResult = async () => {
    try {
      setLoading(true);
      console.log("results", results);

      const response = await callApi({
        path: "/api/course/confirm_result",
        method: "post",
        value: { courseId, results },
      });
      console.log("response", response);
      if (response.status === "Success" || response.status === "success") {
        message.success("ยืนยันผลการอบรมสำเร็จ");
        onClose(true);
      } else {
        message.error(response.message || "เกิดข้อผิดพลาด");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error confirming results:", error);
      message.error("เกิดข้อผิดพลาดในการยืนยันผลการอบรม");
      setLoading(false);
    }
  };

  const handleStatusChange = (value, record) => {
    // Update flatRegistrations
    const updatedFlat = flatRegistrations.map((item) =>
      item.key === record.key ? { ...item, status: value } : item
    );
    setFlatRegistrations(updatedFlat);

    // Update results array (ในรูปแบบ { id, result })
    const updatedResults = results.map((resItem) =>
      resItem.id === record.key ? { ...resItem, result: value } : resItem
    );
    setResults(updatedResults);
  };

  const columns = [
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "วันที่ลงทะเบียน",
      dataIndex: "registrationDate",
      key: "registrationDate",
    },
    {
      title: "เวลาอบรม",
      dataIndex: "timeSlot",
      key: "timeSlot",
      render: (timeSlot) =>
        `${dayjs(timeSlot.start).format("HH:mm")} - ${dayjs(
          timeSlot.end
        ).format("HH:mm")} น.`,
    },

    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        // ถ้า status เป็น "registered" ให้ถือว่าเป็น "wait" เพื่อแสดง "รอการยืนยันผล"
        return (
          <Select
            value={status}
            style={{ width: 150 }}
            onChange={(value) => handleStatusChange(value, record)}
            disabled={courseStatus == "close"}
          >
            <Select.Option value="wait">
              <span className="text-orange-600">รอการยืนยันผล</span>
            </Select.Option>
            <Select.Option value="passed">
              <span className="text-green-600">
                <CheckOutlined /> ผ่าน
              </span>
            </Select.Option>
            <Select.Option value="failed">
              <span className="text-red-600">
                <CloseOutlined /> ไม่ผ่าน
              </span>
            </Select.Option>
            <Select.Option value="not-attended">
              <span className="text-gray-600">
                <StopOutlined /> ไม่ได้เข้าอบรม
              </span>
            </Select.Option>
          </Select>
        );
      },
    },
  ];

  return (
    <Modal
      title={`ยืนยันผลการอบรม: ${courseTitle}`}
      visible={visible}
      onCancel={() => onClose(false)}
      width={1000}
      footer={
        courseStatus === "close"
          ? "หลักสูตรนี้ได้ยืนยันผลการอบรมไปแล้ว"
          : [
              <Button key="cancel" onClick={() => onClose(false)}>
                ยกเลิก
              </Button>,
              <Button key="confirm" type="primary" onClick={confirmResult}>
                ยืนยันผลการอบรม
              </Button>,
            ]
      }
    >
      <Spin spinning={loading}>
        <Table
          rowSelection={{ type: "checkbox" }}
          columns={columns}
          dataSource={flatRegistrations}
          rowKey="key"
          pagination={false} // ไม่มี pagination
          bordered
          scroll={{ y: 400 }} // เลื่อนแนวตั้ง
        />
      </Spin>
    </Modal>
  );
}

ConfirmResult.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  courseId: PropTypes.string,
};
