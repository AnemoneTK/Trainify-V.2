import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import PolicyModal from "../../components/PolicyModal";
import Swal from "sweetalert2";
import axios from "axios";

export default function SuperAdminLogin() {
  const URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [data, setData] = useState({
    role: "super_admin",
    email: "",
    password: "",
  });

  const [modal, setModal] = useState(false);

  const Login = async () => {
    try {
      const response = await axios.post(`${URL}/auth/login`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response)
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
          title: `${errorResponse.data.message || 'error'}`,
          icon: `${errorResponse.data.status || ''}`,
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

      <div className="flex flex-col px-0 lg:flex-row lg:px-10 items-center justify-center xl:gap-[6rem] h-screen w-screen bg-white lg:bg-background overflow-hidden">
        <div className="bg-white  flex-col items-center justify-center rounded-none lg:rounded-lg h-screen w-screen sm:h-screen sm:w-screen lg:h-[70dvh] lg:w-1/2  xl:h-[60dvh] xl:w-1/3 shadow-xl shadow-cyan-500/50 p-8">
          <div className="text-4xl relative font-bold text-primary text-center">
            <Link
              to={"/"}
              className=" absolute left-3 h-full flex items-center"
            >
              <FaArrowLeft className="text-2xl text-primary" />
            </Link>
            เข้าสู่ระบบ{" "}
            <span className="font-extrabold text-orange">ผู้ดูแลระบบ</span>
          </div>
          <div className="flex flex-col items-center justify-start p-0 sm:p-8  sm:w-full md:h-full  lg:h-3/4   gap-[1.5rem] lg:gap-[2.5rem] mt-10 ">
            <Form layout={"vertical"} className="w-full px-0 " form={form}>
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
                  className="h-[3rem] text-lg  rounded-lg"
                  value={data.password}
                  onChange={(e) =>
                    setData((preData) => ({
                      ...preData,
                      password: e.target.value,
                    }))
                  }
                />
               
              </Form.Item>
              <Form.Item>
                <Button
                  type="default"
                  variant="filled"
                  className="w-full text-xl font-semibold font-kanit h-[3rem] mt-3 bg-orange text-primary"
                  onClick={Login}
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
