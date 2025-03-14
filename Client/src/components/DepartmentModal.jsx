import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Form, List, notification, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import callApi from '../utils/axios';
import Swal from 'sweetalert2';

export default function DepartmentModal({ visible, onClose }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Flag for editing
  const [selectedDepartment, setSelectedDepartment] = useState(null); // Department to be edited

  useEffect(() => {
    if (visible) {
      getDepartments();
    }
  }, [visible]);

  // Function to get all departments
  const getDepartments = async () => {
    try {
      setSpinning(true);
      const response = await callApi({
        path: "/api/users/get_department",
        method: "get",
        value: {},
      });
      setDepartmentList(response.data);
      setSpinning(false);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setSpinning(false);
    }
  };

  // Function to handle creating a new department
  const handleCreateDepartment = async (values) => {
    try {
      setSpinning(true);
      const response = await callApi({
        path: "/api/users/add_department", // Assuming this is the API for adding a department
        method: "post",
        value: { name: values.name },
      });
      notification.success({
        message: "เพิ่มแผนกสำเร็จ",
        description: response.data.message,
      });
      getDepartments(); // Refresh the list after adding
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "เพิ่มแผนกล้มเหลว",
        description: error.message,
      });
    } finally {
      setSpinning(false);
    }
  };

  // Function to handle updating a department
  const handleUpdateDepartment = async (values) => {
    try {
      setSpinning(true);
      const response = await callApi({
        path: `/api/users/update_department/${selectedDepartment._id}`, // Assuming this is the API for updating a department
        method: "put",
        value: { name: values.name },
      });
      notification.success({
        message: "แก้ไขแผนกสำเร็จ",
        description: response.data.message,
      });
      getDepartments(); // Refresh the list after updating
      setSelectedDepartment(null);
      setIsEditing(false);
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "แก้ไขแผนกล้มเหลว",
        description: error.message,
      });
    } finally {
      setSpinning(false);
    }
  };

  // Function to handle deleting a department
  const handleDeleteDepartment = async (id) => {
    try {
      setSpinning(true);
      const response = await callApi({
        path: `/api/users/delete_department/${id}`, // Assuming this is the API for deleting a department
        method: "delete",
      });
      notification.success({
        message: "ลบแผนกสำเร็จ",
        description: response.data.message,
      });
      getDepartments(); // Refresh the list after deleting
    } catch (error) {
      notification.error({
        message: "ลบแผนกล้มเหลว",
        description: error.message,
      });
    } finally {
      setSpinning(false);
    }
  };

  // Function to open the edit form for an existing department
  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    form.setFieldsValue({
      name: department.name,
    });
    setIsEditing(true);
  };

  return (
    <Modal
      title={isEditing ? "แก้ไขแผนก" : "เพิ่มแผนก"}
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      {spinning ? (
        <Spin size="large" />
      ) : (
        <>
          <Form
            form={form}
            onFinish={isEditing ? handleUpdateDepartment : handleCreateDepartment}
          >
            <Form.Item
              label="ชื่อแผนก"
              name="name"
              rules={[{ required: true, message: "กรุณาระบุชื่อแผนก" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                {isEditing ? "บันทึก" : "เพิ่มแผนก"}
              </Button>
              <Button onClick={() => { setIsEditing(false); form.resetFields(); onClose(); }}>
                ยกเลิก
              </Button>
            </Form.Item>
          </Form>

          <h3>แผนกทั้งหมด</h3>
          <List
            dataSource={departmentList}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button onClick={() => handleEditDepartment(item)}>แก้ไข</Button>,
                  <Button danger onClick={() => handleDeleteDepartment(item._id)}>ลบ</Button>,
                ]}
              >
                {item.name}
              </List.Item>
            )}
          />
        </>
      )}
    </Modal>
  );
}
