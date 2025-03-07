import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Upload,
  Radio,
  DatePicker,
  TimePicker,
  InputNumber,
  Space,
} from "antd";
import {
  UploadOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import callApi from "../utils/axios";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import axios from "axios";
const { Option } = Select;
const { TextArea } = Input;

export default function CourseModal({ visible, onClose, data }) {
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isNew = !data;
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState(null);

  // ค่า default สำหรับหลักสูตรใหม่
  const blackData = {
    title: "",
    description: "",
    dueDate: { start: null, end: null },
    schedule: [],
    type: "online",
    place: {
      description: "",
      mapUrl: "",
    },
    instructors: [],
    tag: [],
    status: "public",
    banner: "",
  };

  useEffect(() => {
    getTags();
    console.log("data", data);
    if (data) {
      // กรณีแก้ไขหลักสูตร ให้ set ค่าเดิมกลับเข้า form พร้อมแปลงวันที่ด้วย dayjs
      form.setFieldsValue({
        ...data,
        dueDate: {
          start: data.dueDate ? dayjs(data.dueDate.start) : null,
          end: data.dueDate ? dayjs(data.dueDate.end) : null,
        },
        schedule: data.schedule
          ? data.schedule.map((sch) => ({
              ...sch,
              date: sch.date ? dayjs(sch.date) : null,
              times: sch.times
                ? sch.times.map((t) => ({
                    ...t,
                    start: t.start ? dayjs(t.start) : null,
                    end: t.end ? dayjs(t.end) : null,
                  }))
                : [],
            }))
          : [],
      });
      setImageUrl(data.banner);
    } else {
      form.resetFields();
      setImageUrl("");
    }
  }, [data, form]);

  const getTags = async () => {
    try {
      const response = await callApi({
        path: "/api/course/tag/gets",
        method: "get",
        value: {},
      });

      // ตรวจสอบว่า response มีข้อมูลหรือไม่
      if (response && response.data) {
        console.log("tag", response.data);
        setTags(response.data);
      } else {
        console.error("No data found in response");
        message.error("ไม่สามารถดึงข้อมูลแท็กได้");
      }
    } catch (error) {
      console.error("errorResponse", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลแท็ก");
    }
  };

  // ฟังก์ชันสำหรับอัปโหลดรูป banner
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("banner", file);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/course/upload_banner`,
        formData,
        {
          withCredentials: true, // ส่ง cookie ไปด้วย (หากจำเป็น)
          // ไม่ต้องกำหนด header "Content-Type" เพราะ axios จะตั้งค่าให้เอง
        }
      );
      console.log("banner", response);
      setImageUrl(response.data.data.bannerUrl);
      message.success("อัปโหลดรูปภาพสำเร็จ");
    } catch (error) {
      console.error("Upload error:", error);
      message.error("อัปโหลดรูปภาพล้มเหลว");
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await callApi({
        path: "/api/course/delete_banner", // ใช้ API ที่สร้างในฝั่ง Backend
        method: "post",
        value: { courseID: data._id },
      });

      if (response.status === "success") {
        message.success("ลบแบนเนอร์สำเร็จ");
        setImageUrl(""); // เคลียร์แบนเนอร์ใน UI
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      message.error("เกิดข้อผิดพลาดในการลบแบนเนอร์");
    }
  };

  // ฟังก์ชันสำหรับบันทึก (สร้าง/แก้ไข) หลักสูตร
  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // แนบ banner (URL รูปภาพ) จาก state หากมี
      values.banner = imageUrl;

      // แปลงวันที่เป็น ISO String
      if (values.dueDate) {
        values.dueDate.start = values.dueDate.start?.toISOString();
        values.dueDate.end = values.dueDate.end?.toISOString();
      }
      if (values.schedule) {
        values.schedule = values.schedule.map((sch) => ({
          ...sch,
          date: sch.date?.toISOString(),
          times: sch.times
            ? sch.times.map((t) => ({
                ...t,
                start: t.start?.toISOString(),
                end: t.end?.toISOString(),
              }))
            : [],
        }));
      }

      console.log("Saving course with values:", values);

      // สร้าง object ที่มี courseID และ updateData (เฉพาะการแก้ไข)
      const finalValues = isNew
        ? values // หากเป็นการสร้างใหม่ จะส่งเฉพาะ updateData
        : { courseID: data?._id, updateData: values }; // หากเป็นการแก้ไข จะส่ง courseID ด้วย

      // เรียก API สำหรับการสร้างหรือแก้ไขหลักสูตร
      const response = await callApi({
        path: isNew ? "/api/course/create" : `/api/course/edit`,
        method: isNew ? "post" : "put",
        value: finalValues, // ส่งข้อมูลในรูปแบบ courseID และ updateData (เฉพาะการแก้ไข)
      });

      if (response && response.status == "สำเร็จ") {
        console.log("response", response);
        message.success(response.message || "สำเร็จ");
      }

      onClose(true);
    } catch (error) {
      const errorResponse = error;
      console.error("Error saving course:", errorResponse);

      if (errorResponse.statusCode !== 500) {
        message.error(`${errorResponse.message}`);
      } else {
        message.error("เกิดข้อผิดพลาดในการบันทึกหลักสูตร");
      }
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับลบหลักสูตร (เฉพาะในโหมดแก้ไข)
  const handleDelete = async () => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบหลักสูตรนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบหลักสูตร",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await callApi({
            path: "/api/course/delete",
            method: "post",
            value: { courseID: data._id },
          });
          if (response) {
            console.log("response", response);
            message.success("ลบหลักสูตรสำเร็จ");
          }
          onClose(true);
        } catch (error) {
          console.error("Error deleting course:", error);
          message.error("เกิดข้อผิดพลาดในการลบหลักสูตร");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <Modal
      visible={visible}
      title={isNew ? "เพิ่มหลักสูตรอบรมพนักงาน" : "รายละเอียดหลักสูตร"}
      onCancel={() => onClose(false)}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={blackData}
        disabled={data?.status == "end"}
      >
        {/* Banner */}
        <Form.Item label={imageUrl ? "" : "อัปโหลดรูปภาพ"}>
          {imageUrl ? (
            <div className="relative h-[300px] bg-black rounded-md overflow-hidden">
              <img
                src={imageUrl}
                alt="Banner Preview"
                className="object-cover rounded-md shadow-md h-full w-full"
              />
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteImage}
                className="absolute top-2 right-2"
              >
                ลบรูป
              </Button>
            </div>
          ) : (
            <Upload
              customRequest={handleUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
            </Upload>
          )}
        </Form.Item>

        {/* Title */}
        <Form.Item
          name="title"
          label="หัวข้อการอบรม"
          rules={[{ required: true, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }]}
        >
          <Input />
        </Form.Item>

        {/* Description */}
        <Form.Item name="description" label="รายละเอียด">
          <TextArea rows={4} />
        </Form.Item>

        {/* Due Date: วันเปิดรับสมัครและวันปิดรับสมัคร */}
        <Form.Item label="วันเปิด/ปิดรับสมัคร">
          <Space>
            <Form.Item
              name={["dueDate", "start"]}
              rules={[
                { required: true, message: "กรุณาเลือกวันเริ่มเปิดรับสมัคร" },
              ]}
            >
              <DatePicker placeholder="วันเริ่ม" />
            </Form.Item>
            <Form.Item
              name={["dueDate", "end"]}
              rules={[
                { required: true, message: "กรุณาเลือกวันสิ้นสุดรับสมัคร" },
              ]}
            >
              <DatePicker placeholder="วันสิ้นสุด" />
            </Form.Item>
          </Space>
        </Form.Item>

        {/* Schedule: ตารางเรียน */}
        <Form.Item label="ตารางเรียน">
          <Form.List name="schedule">
            {(scheduleFields, { add: addSchedule, remove: removeSchedule }) => (
              <>
                {scheduleFields.map((scheduleField) => (
                  <div
                    key={scheduleField.key} // ใช้ key ที่ไม่ซ้ำกัน
                    className="border p-4 mb-4 rounded-md"
                  >
                    <Space align="baseline">
                      <Form.Item
                        {...scheduleField}
                        label="วันที่"
                        name={[scheduleField.name, "date"]}
                        rules={[{ required: true, message: "กรุณากรอกวันที่" }]}
                      >
                        <DatePicker />
                      </Form.Item>
                      <MinusCircleOutlined
                        onClick={() => removeSchedule(scheduleField.name)}
                        className="text-red-500"
                      />
                    </Space>
                    <Form.List name={[scheduleField.name, "times"]}>
                      {(timeFields, { add: addTime, remove: removeTime }) => (
                        <>
                          {timeFields.map((timeField) => (
                            <Space
                              key={timeField.key} // ใช้ key ที่ไม่ซ้ำกันจาก timeField
                              align="baseline"
                              style={{ display: "flex", marginBottom: 8 }}
                            >
                              <Form.Item
                                {...timeField}
                                label="เวลาเริ่ม"
                                name={[timeField.name, "start"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "กรุณากรอกเวลาเริ่ม",
                                  },
                                ]}
                              >
                                <TimePicker format="HH:mm" />
                              </Form.Item>
                              <Form.Item
                                {...timeField}
                                label="เวลาจบ"
                                name={[timeField.name, "end"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "กรุณากรอกเวลาเริ่ม",
                                  },
                                ]}
                              >
                                <TimePicker format="HH:mm" />
                              </Form.Item>
                              <Form.Item
                                {...timeField}
                                label="จำนวนที่นั่ง"
                                name={[timeField.name, "seat"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "กรุณาระบุจำนวนที่นั่ง",
                                  },
                                ]}
                              >
                                <InputNumber min={1} />
                              </Form.Item>
                              <Form.Item
                                {...timeField}
                                label="จำนวนที่ลงสมัคร"
                                name={[timeField.name, "registeredSeats"]}
                              >
                                <InputNumber
                                  min={0}
                                  disabled
                                  defaultValue={0}
                                />
                              </Form.Item>
                              <MinusCircleOutlined
                                onClick={() => removeTime(timeField.name)}
                                className="text-red-500"
                              />
                            </Space>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => addTime()}
                              block
                              icon={<PlusOutlined />}
                            >
                              เพิ่มช่วงเวลา
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => addSchedule()}
                    block
                    icon={<PlusOutlined />}
                  >
                    เพิ่มตารางเรียน
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>

        {/* Instructors */}
        <Form.Item label="อาจาร์ยผู้สอน" style={{ marginBottom: 0 }}>
          <Form.List name="instructors">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key} className="flex items-center mb-2">
                    <Form.Item
                      {...restField}
                      name={[name]}
                      fieldKey={[fieldKey]}
                      rules={[
                        { required: true, message: "กรุณากรอกชื่อผู้สอน" },
                      ]}
                      className="flex-1 m-0"
                    >
                      <Input placeholder="ชื่อผู้สอน / ผู้อบรม" />
                    </Form.Item>
                    <MinusCircleOutlined
                      className="ml-2 text-red-500"
                      onClick={() => remove(name)}
                    />
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    เพิ่มผู้สอน / ผู้อบรม
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item name="tag" label="แท็ก">
          <Select
            placeholder="เลือกแท็กสำหรับหลักสูตร"
            mode="multiple"
            optionFilterProp="children"
          >
            {tags?.length > 0 &&
              tags.map((tag) => (
                <Option key={tag._id} value={tag._id}>
                  {tag.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        {/* Type และ Place */}
        <div className="flex flex-col md:flex-row">
          <Form.Item name="type" label="รูปแบบการจัดอบรม" className="md:w-1/5">
            <Radio.Group>
              <Radio value="online">online</Radio>
              <Radio value="offline">offline</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name={["place", "description"]}
            label="สถานที่จัดอบรม"
            rules={[{ required: true, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }]}
            className="md:w-4/5"
          >
            <Input placeholder="ระบุสถานที่ หรือ URL ของแผนที่" />
          </Form.Item>
        </div>

        {/* ปุ่มบันทึก/ลบ */}
        <div className="flex justify-between">
          {!isNew && (
            <Button danger onClick={handleDelete}>
              ลบหลักสูตร
            </Button>
          )}
          <Button
            type="primary"
            loading={loading}
            onClick={handleSave}
            className="ml-auto"
          >
            {isNew ? "สร้างหลักสูตร" : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

CourseModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.shape({
    _id: PropTypes.string,
    banner: PropTypes.string,
    createdAt: PropTypes.string,
    createdBy: PropTypes.object,
    description: PropTypes.string,
    dueDate: PropTypes.object,
    instructors: PropTypes.array,
    place: PropTypes.object,
    schedule: PropTypes.array,
    status: PropTypes.string,
    tag: PropTypes.array,
    type: PropTypes.string,
    title: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
};
