import Logo from "/Logo-BG-03.png";
import Profile from "./Profile";
import Notification from "./Notification";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Layout, Menu, theme, Button } from "antd";
import { MdDashboard, MdAccountBox } from "react-icons/md";

import { useUser } from "../../contexts/UserContext";
import axios from "axios";
import Swal from "sweetalert2";

const { Header, Content, Footer, Sider } = Layout;
const items = [
  {
    key: "1",
    icon: (
      <div className="p-0 ">
        <MdDashboard className="text-2xl p-0" />
      </div>
    ),
    label: (
      <Link
        to="/admin_dashboard"
        className="text-xl font-bold focus:no-underline hover:no-underline"
      >
        ภาพรวม
      </Link>
    ),
  },
  {
    key: "2",
    icon: (
      <div className="p-0">
        <MdAccountBox className="text-2xl" />
      </div>
    ),
    label: (
      <Link
        to="/emp_list"
        className="text-xl  font-bold focus:no-underline hover:no-underline"
      >
        บัญชีพนักงาน
      </Link>
    ),
  },
];

export default function AdminLayout({ children }) {
  const URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const selectedKey =
    currentPath === "/emp_list"
      ? "2"
      : currentPath === "/admin_list"
      ? "2"
      : items.find((item) => item.label.props.to === currentPath)?.key || "1";

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState(false);
  const [collapsedWidth, setCollapsedWidth] = useState(80);
  const { userData, setUserData } = useUser();

  useEffect(() => {
    if (!userData) {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.post(
        `${URL}/auth/auth`,
        { role: "admin" },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setUserData(response.data.userData);
      }
    } catch (error) {
      const errorResponse = error.response;
      console.log("errorResponse", error);
      Swal.fire({
        title: `${errorResponse.data.message}`,
        text: `${errorResponse.data.detail}`,
        icon: `${errorResponse.status === 500 ? "error" : "warning"}`,
        confirmButtonText: "ตกลง",
      }).then(() => {
        navigate("/");
      });
    }
  };

  const updateCollapsedWidth = () => {
    if (window.innerWidth < 992) {
      setCollapsedWidth(0);
    } else {
      setCollapsedWidth(80);
    }
  };

  // ใช้ useEffect เพื่อตรวจสอบขนาดหน้าจอเมื่อเริ่มต้นหรือเมื่อมีการเปลี่ยนแปลงขนาดหน้าจอ
  useEffect(() => {
    updateCollapsedWidth();
    window.addEventListener("resize", updateCollapsedWidth);
    return () => window.removeEventListener("resize", updateCollapsedWidth);
  }, []);
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          breakpoint="lg"
          collapsedWidth={collapsedWidth}
          trigger={null}
          className="bg-admin-pink"
          width={230}
        >
          <div className="demo-logo-vertical h-[5rem] flex gap-3 items-center justify-center">
            <img className="h-1/2" src={Logo} alt="" />
            {!collapsed && (
              <div className="text-2xl font-extrabold text-white">Trainify</div>
            )}
          </div>
          <Menu
            theme="light"
            mode="inline"
            items={items}
            className="bg-admin-pink mt-1"
            selectedKeys={[selectedKey]}
          />
        </Sider>
        <Layout style={{ display: "flex", flexDirection: "column" }}>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
            }}
            className="flex items-center justify-between"
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "20px",
                marginLeft: "20px",
                border: "none",
                outline: "none",
                background: "none",
              }}
            />
            <div className="flex flex-1 items-center justify-end gap-[2rem] mr-[20px] text-primary">
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
          <Footer className="flex justify-center items-center h-[3rem] p-0 ">
            <div className=" text-center">
              Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </div>
          </Footer>
        </Layout>
      </Layout>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node,
};
