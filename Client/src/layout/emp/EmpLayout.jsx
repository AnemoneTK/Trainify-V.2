import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, theme } from "antd";
// icon ทั้งหมด
import { MdSpaceDashboard } from "react-icons/md";
import { MdAssignment } from "react-icons/md";
import { MdCalendarMonth } from "react-icons/md";
import { MdAssignmentAdd } from "react-icons/md";
const { Content, Sider } = Layout;
import Navbar from "./Navbar";
import axios from "axios";
import Swal from "sweetalert2";

import { useUser } from "../../contexts/UserContext";
const items = [
  {
    key: "1",
    icon: (
      <div className="p-0 ">
        <MdSpaceDashboard className="text-xl p-0" />
      </div>
    ),
    label: (
      <Link
        to="/dashboard"
        style={{ fontSize: "16px" }}
        className="text-xl font-bold focus:no-underline hover:no-underline"
      >
        ภาพรวม
      </Link>
    ),
  },
  {
    key: "2",
    icon: (
      <div className="p-0 ">
        <MdCalendarMonth className="text-xl p-0" />
      </div>
    ),
    label: (
      <Link
        to="/schedule"
        style={{ fontSize: "16px" }}
        className="text-xl font-bold focus:no-underline hover:no-underline"
      >
        ตารางเรียน
      </Link>
    ),
  },
  {
    key: "3",
    icon: (
      <div className="p-0 ">
        <MdAssignment className="text-xl p-0" />
      </div>
    ),
    label: (
      <Link
        to="/my_course"
        style={{ fontSize: "16px" }}
        className="font-bold focus:no-underline hover:no-underline"
      >
        คอร์สของฉัน
      </Link>
    ),
  },
  {
    key: "4",
    icon: (
      <div className="p-0 ">
        <MdAssignmentAdd className="text-xl p-0" />
      </div>
    ),
    label: (
      <Link
        to="/courses"
        style={{ fontSize: "16px" }}
        className=" font-bold focus:no-underline hover:no-underline"
      >
        ลงทะเบียนคอร์ส
      </Link>
    ),
  },
];

export default function EmpLayout({ children }) {
  const URL = import.meta.env.VITE_BASE_URL;
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

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

  const updateCollapsedWidth = () => {
    if (window.innerWidth < 992) {
      setCollapsedWidth(0);
    } else {
      setCollapsedWidth(500);
    }
  };

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
        { role: "employee" },
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
      console.log("errorResponse", errorResponse);
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
  useEffect(() => {
    updateCollapsedWidth();
    window.addEventListener("resize", updateCollapsedWidth);
    return () => window.removeEventListener("resize", updateCollapsedWidth);
  }, []);
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Layout
        style={{ minHeight: "100vh", minWidth: "100dvw" }}
        className="flex flex-col "
      >
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Layout style={{ display: "flex", flexDirection: "row" }}>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            breakpoint="lg"
            collapsedWidth={collapsedWidth}
            trigger={null}
            width={200}
            style={{
              background: colorBgContainer,
            }}
          >
            <div className="flex-column items-start h-full ">
              <div className=" h-2/4  overflow-y-auto">
                <Menu
                  theme="light"
                  mode="inline"
                  items={items}
                  selectedKeys={[selectedKey]}
                />
              </div>
            </div>
          </Sider>
          <div className="flex flex-col ">
            <Content
              style={{
                // background: colorBgContainer,
                borderRadius: borderRadiusLG,
                flex: 1,
                overflowY: "auto",
              }}
              className=" px-[20px] pt-[20px]  w-[89dvw]"
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
