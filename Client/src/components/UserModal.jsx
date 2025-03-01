import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  message,
  Radio,
} from "antd";
import Swal from "sweetalert2";
import callApi from "../utils/axios";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { useUser } from "../contexts/UserContext";

const { Option } = Select;

export default function UserModal({ visible, onClose, data }) {
  const { userData } = useUser();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isNew = !data;
  const [department, setDepartment] = useState(null);

  const blackData = {
    email: "",
    role: "employee",
    nationalId: "",
    titleName: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    startDate: dayjs(),
    departmentID: "",
    status: "active",
  };

  useEffect(() => {
    getDepartmentOption();
    if (data) {
      console.log(data);
      form.setFieldsValue({
        ...data,
        startDate: data.startDate ? dayjs(data.startDate) : null,
        departmentID: data.departmentID._id,
      });
    } else {
      form.resetFields();
    }
  }, [data, form]);

  const getDepartmentOption = async () => {
    const response = await callApi({
      path: "/api/users/get_department",
      method: "get",
    });

    if (response) {
      setDepartment(response.data);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // แปลง startDate เป็น dayjs
      if (values.startDate) {
        values.startDate = dayjs(values.startDate);
      }

      const updateData = { ...values, userId: data?.userID || "" };
      console.log("updateData", updateData);

      const response = await callApi({
        path: isNew ? "/api/users/create" : `/api/users/edit_user`,
        method: isNew ? "post" : "patch",
        value: isNew ? values : updateData,
      });

      if (response.statusCode === 200) {
        message.success(`ผู้ใช้ถูก${isNew ? "สร้าง" : "อัปเดต"}สำเร็จ`);
        onClose(true);
      } else {
        message.error(response.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error(error);
      message.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;

    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "เมื่อลบแล้วจะไม่สามารถกู้คืนได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await callApi({
            path: `/api/users/delete/${data?.userID}`,
            method: "delete",
          });

          if (response.statusCode === 200) {
            message.success("ลบผู้ใช้สำเร็จ");
            onClose(true);
          } else {
            message.error(response.message || "เกิดข้อผิดพลาด");
          }
        } catch (error) {
          console.error(error);
          message.error("เกิดข้อผิดพลาด");
        }
      }
    });
  };

  return (
    <Modal
      visible={visible}
      title={
        isNew ? (
          <div className="text-xl">สร้างผู้ใช้ใหม่</div>
        ) : (
          <div className="text-xl">รายละเอียดผู้ใช้</div>
        )
      }
      onCancel={() => onClose(false)}
      footer={null}
      style={{
        top: 20,
      }}
    >
      <Form form={form} layout="vertical" initialValues={blackData}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: "email",
              message: "กรุณากรอกข้อมูลให้ครบถ้วน",
            },
          ]}
        >
          <Input disabled={!isNew} />
        </Form.Item>

        {isNew && (
          <Form.Item
            name="nationalId"
            label="รหัสประจำตัวประชาชน"
            rules={[{ required: true, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }]}
          >
            <Input type="number" maxLength={13} />
          </Form.Item>
        )}
        <div className="flex flex-col md:flex-row justify-between">
          <Form.Item name="titleName" label="คำนำหน้า" className="md:w-1/5">
            <Select>
              <Option value="">ไม่ระบุ</Option>
              <Option value="นาย">นาย</Option>
              <Option value="นาง">นาง</Option>
              <Option value="นางสาว">นางสาว</Option>
              <Option value="อื่นๆ">อื่นๆ</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="firstName"
            label="ชื่อจริง"
            rules={[{ required: true, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="นามสกุล"
            rules={[{ required: true, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }]}
          >
            <Input />
          </Form.Item>
        </div>
        <Form.Item
          name="phoneNumber"
          label="เบอร์โทรศัพท์"
          rules={[{ required: true, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }]}
        >
          <Input type="number" maxLength={10} disabled={!isNew} />
        </Form.Item>
        <Form.Item name="startDate" label="วันที่เริ่มงาน">
          <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} />
        </Form.Item>
        <Form.Item
          name="departmentID"
          label="แผนก"
          rules={[{ required: true, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }]}
        >
          <Select>
            <Option value="">ไม่ระบุ</Option>
            {department?.length > 0 &&
              department?.map((dep) => (
                <Option key={dep._id} value={dep._id}>
                  {dep.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <div className="flex justify-between gap-2 ">
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="employee">พนักงาน</Radio>
              <Radio value="admin">ผู้ดูแล</Radio>
              {userData?.role === "super_admin" ? (
                <Radio value="super_admin">ผู้ดูแลระบบ</Radio>
              ) : null}
            </Radio.Group>
          </Form.Item>
          <Form.Item name="status" label="สถานะ">
            <Radio.Group>
              <Radio value="active">เปิดใช้งาน</Radio>
              <Radio value="inactive">ปิดการใช้งาน</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
        {/* <Form.Item label="รีเซทรหัสผ่าน">
          <Button onClick={handleSave} className="ml-auto ">
            รีเซทรหัสผ่านผู้ใช้
          </Button>
        </Form.Item> */}
        <div className="flex justify-between  ">
          {!isNew && (
            <Button danger onClick={handleDelete}>
              ลบผู้ใช้
            </Button>
          )}
          <Button
            type="primary"
            loading={loading}
            onClick={handleSave}
            className="ml-auto "
          >
            {isNew ? "สร้างผู้ใช้" : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

UserModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.shape({
    userID: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    nationalId: PropTypes.string,
    titleName: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    phone: PropTypes.string,
    startDate: PropTypes.string,
    departmentID: PropTypes.object,
    department: PropTypes.string,
    status: PropTypes.string,
  }),
};
