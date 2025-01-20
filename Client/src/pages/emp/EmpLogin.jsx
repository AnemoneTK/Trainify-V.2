import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "/Logo-BG-03.png";
import { FaArrowLeft } from "react-icons/fa6";
import { Button, Form, Input } from "antd";
import PolicyModal from "../../components/PolicyModal";
import axios from "axios";
import Swal from "sweetalert2";

export default function EmpLogin() {
  const URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();
  const [data, setData] = useState({
    role: "employee",
    email: "",
    password: "",
  });

  const Login = async () => {
    try {
      const response = await axios.post(`${URL}/auth/login`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        navigate("/otp");
      }
    } catch (error) {
      const errorResponse = error.response;
      console.error(errorResponse);
      if (errorResponse.status === 410) {
        setModal(true);
      } else {
        Swal.fire({
          title: `${errorResponse.data.message}`,
          icon: `${errorResponse.data.status}`,
          confirmButtonText: "ตกลง",
        });
      }
    }
  };

  const submitModal = () => {
    setModal(false);
    Login();
  };

  return (
    <>
      <PolicyModal open={modal} submitModal={submitModal} />
      <div className="flex items-center justify-center h-screen w-screen bg-background overflow-hidden">
        <div className="bg-white relative flex-col items-center justify-center rounded-none lg:rounded-lg h-screen w-screen sm:h-screen sm:w-screen lg:h-[90dvh] lg:w-[70dvw] xl:h-[80dvh] xl:w-[30dvw] shadow-xl shadow-cyan-500/50 p-8">
          <Link to={"/"} className=" absolute">
            <FaArrowLeft className="text-2xl text-primary" />
          </Link>
          <div className="h-1/6 xl:h-1/7 flex flex-col items-center justify-center mb-7 ">
            <img className="h-full" src={Logo} alt="" />
          </div>
          <div className="text-4xl font-bold text-primary text-center">
            เข้าสู่ระบบ
            <span className="font-extrabold text-employee"> พนักงาน</span>
          </div>
          <div className="flex flex-col items-center justify-start p-0 sm:p-8 sm:flex-col md:flex-col lg:flex-row sm:w-full md:h-full lg:h-2/4 gap-[1.5rem] lg:gap-[2.5rem] mt-10">
            {/* Add onFinish to form to trigger Login on Enter key press */}
            <Form
              layout={"vertical"}
              className="w-full px-0"
              form={form}
              onFinish={Login}
            >
              <Form.Item
                label={
                  <label className="text-2xl font-kanit font-semibold">
                    Email
                  </label>
                }
              >
                <Input
                  placeholder="อีเมล"
                  className="h-[3rem] text-lg rounded-lg"
                  value={data.email}
                  onChange={(e) =>
                    setData((preData) => ({
                      ...preData,
                      email: e.target.value,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={
                  <label className="text-2xl font-kanit font-semibold">
                    Password
                  </label>
                }
              >
                <Input.Password
                  placeholder="รหัสผ่าน"
                  className="h-[3rem] text-lg rounded-lg"
                  value={data.password}
                  onChange={(e) =>
                    setData((preData) => ({
                      ...preData,
                      password: e.target.value,
                    }))
                  }
                />
                <div
                  className="text-end text-md mt-2 text-employee no-underline hover:underline decoration-solid cursor-pointer"
                  onClick={() => {
                    Swal.fire({
                      title: "ลืมรหัสผ่าน",
                      text: "กรุณาติดต่อ Admin ผู้ดูแลเพื่อรีเซ็ตรหัสผ่าน",
                      icon: "info",
                      confirmButtonText: "ตกลง",
                    });
                  }}
                >
                  ลืมรหัสผ่าน / Forget your password?
                </div>
              </Form.Item>
              <Form.Item>
                {/* No need for onClick handler here, as onFinish handles the form submission */}
                <Button
                  type="primary"
                  className="w-full text-xl font-semibold font-kanit h-[3rem] mt-3"
                  htmlType="submit" // This triggers the form submission
                >
                  เข้าสู่ระบบ
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
