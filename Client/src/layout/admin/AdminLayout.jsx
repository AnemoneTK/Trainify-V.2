import Logo from "/Logo-BG-03.png";
import Profile from "./Profile";
import Notification from "./Notification";
import { useEffect } from "react";
import PropTypes from "prop-types";

import { useNavigate } from "react-router-dom";
import { Layout, theme } from "antd";

import { useUser } from "../../contexts/UserContext";
import callApi from "../../utils/axios";
import Swal from "sweetalert2";

const { Header, Content } = Layout;

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { userData, setUserData } = useUser();

  useEffect(() => {
    if (!userData) {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await callApi({
        path: "/auth/auth",
        method: "post",
        value: { role: "admin" },
      });
      console.log(response.data);
      if (response.statusCode === 200) {
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.log("errorResponse", error);
      Swal.fire({
        icon: error.icon,
        title: error.message,
        text: error.error.detail || "",
        confirmButtonText: "ตกลง",
      }).then(() => {
        navigate("/");
      });
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Layout style={{ minHeight: "100vh" }}>
        <Layout style={{ display: "flex", flexDirection: "column" }}>
          <Header
            style={{
              background: colorBgContainer,
            }}
            className="flex items-center  px-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={Logo}
                alt="Company Logo"
                className="w-12 h-auto max-w-full"
              />
              <div className="text-2xl ">
                Trainify :{" "}
                <span className="text-admin-accent font-bold">Admin</span>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end gap-[2rem]  text-primary">
              <Notification />
              <Profile />
            </div>
          </Header>

          <Content
            style={{
              // background: colorBgContainer,
              borderRadius: borderRadiusLG,
              flex: 1,
              overflowY: "auto",
            }}
            className="mt-[5px] p-[24px] md:px-[60px]"
          >
            {children}
          </Content>
          {/* <Footer className="flex justify-center items-center h-[3rem] p-0 ">
            <div className=" text-center">
              Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </div>
          </Footer> */}
        </Layout>
      </Layout>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node,
};
