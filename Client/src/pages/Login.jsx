import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input } from "antd";
import Swal from "sweetalert2";

import logo from "/Logo-BG-03.png";
import callApi from "../utils/axios.ts";
import PolicyModal from "../components/PolicyModal";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || null;
  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!role) {
      navigate("/");
    }
  }, [role, navigate]);

  const themes = {
    employee: {
      background: "bg-emp-secondary",
      button: "bg-emp-primary hover:bg-emp-accent",
      text: "text-emp-primary",
      title: "พนักงาน",
    },
    admin: {
      background: "bg-admin-secondary",
      button: "bg-admin-primary hover:bg-admin-accent",
      text: "text-admin-primary",
      title: "ผู้ดูแล",
    },
    super_admin: {
      background: "bg-sa-secondary",
      button: "bg-sa-primary hover:bg-sa-accent",
      text: "text-sa-primary",
      title: "ผู้ดูแลระดับสูง",
    },
  };

  const theme = themes[role] || {};

  const Login = async (values) => {
    console.log(values);
    console.log(role);
    try {
      const response = await callApi({
        path: "/auth/login",
        method: "POST",
        value: {
          email: values.email,
          password: values.password,
          role: role,
        },
      });
      console.log("Profile Data:", response);
      if (response.status === "success") {
        navigate("/otp");
      }
      form.resetFields();
    } catch (error) {
      console.log("error", error);
      if (error.statusCode == 410) {
        setModal(true);
        form.resetFields();
      } else {
        Swal.fire({
          icon: error.icon,
          title: error.message,
          text: error.error || "",
          confirmButtonText: "ตกลง",
        });
      }
    }
  };

  return (
    <>
      <PolicyModal open={modal} />

      <div
        className={`flex items-center justify-center min-h-screen w-screen ${
          theme.background || "bg-gray-100"
        }`}
      >
        <div className="bg-white w-full max-w-lg mx-4 p-8 rounded-lg shadow-lg">
          {/* Back Button */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate("/")}
              className={`${
                theme.text || "text-black"
              } hover:underline text-sm`}
            >
              &larr; ย้อนกลับ
            </button>
          </div>
          {/* Logo */}
          <div className="flex flex-col items-center">
            <img src={logo} alt="Logo" className="w-28 h-28 mb-4" />
            <h1 className="text-3xl font-bold text-center text-black">
              เข้าสู่ระบบ
              <span className={`${theme.text || "text-black"}`}>
                {" "}
                {theme.title || ""}
              </span>
            </h1>
          </div>
          {/* Ant Design Form */}
          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={Login}
            className="mt-6 w-full"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "กรุณากรอกอีเมล!" },
                { type: "email", message: "กรุณากรอกอีเมลที่ถูกต้อง!" },
              ]}
            >
              <Input
                placeholder="Enter your email"
                size="large"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน!" }]}
            >
              <Input.Password
                placeholder="Enter your password"
                size="large"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item className="mt-10">
              <button
                type="submit"
                className={`w-full h-10 text-white text-xl rounded-md transition-none ${theme.button}`}
              >
                เข้าสู่ระบบ
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
}
