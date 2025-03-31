import { useEffect } from "react";
import PropTypes from "prop-types";

import { useNavigate } from "react-router-dom";
import { Layout, theme } from "antd";
// icon ทั้งหมด

const { Content } = Layout;
import Navbar from "./Navbar";
import Swal from "sweetalert2";

import { useUser } from "../../contexts/UserContext";
import callApi from "../../utils/axios";

export default function EmpLayout({ children }) {
  const navigate = useNavigate();

  const {
    token: { borderRadiusLG },
    // token: { colorBgContainer, borderRadiusLG },
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
        value: { role: "employee" },
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
      <Layout
        style={{ minHeight: "100vh", minWidth: "100dvw" }}
        className="flex flex-col "
      >
        <Navbar />
        <Layout style={{ display: "flex", flexDirection: "row" }}>
          <div className="flex flex-col ">
            <Content
              cla
              style={{
                // background: colorBgContainer,
                borderRadius: borderRadiusLG,
                overflowY: "auto",
                maxHeight: "100dvh",
              }}
              className=" p-[24px] md:px-[60px] w-screen bg-bg custom-scrollbar"
            >
              {children}
            </Content>
          </div>
        </Layout>
      </Layout>
    </div>
  );
}

EmpLayout.propTypes = {
  children: PropTypes.node,
};
