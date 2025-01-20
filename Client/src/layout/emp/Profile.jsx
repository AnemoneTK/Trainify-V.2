import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Space, Button } from "antd";
import { RiAccountCircleFill } from "react-icons/ri";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import { useUser } from "../../contexts/UserContext";
import axios from "axios";
import { useEffect } from "react";
export default function Profile() {
  const { userData } = useUser();
  const URL = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    if (userData) {
      console.log("userData", userData);
    }
  }, [userData]);
  const dropdownItems = [
    {
      label: (
        <div>
          <div className=" text-xl font-bold">{userData?.fullName}</div>
          <div>{userData?.email}</div>
        </div>
      ),
      key: "0",
    },
    {
      type: "divider",
    },
    {
      label: <a href="https://www.antgroup.com">Profile</a>,
      key: "1",
    },
    {
      label: <a href="https://www.aliyun.com">Settings</a>,
      key: "2",
    },
    {
      type: "divider",
    },
    {
      label: (
        <Button
          className="w-full text-left text-red-600"
          type="text"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
        >
          Logout
        </Button>
      ),
      key: "logout",
    },
  ];
  const navigate = useNavigate();
  const logout = async () => {
    await axios.get(`${URL}/auth/logout`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    navigate("/");
  };

  const menu = <Menu items={dropdownItems} />;

  return (
    <div className="flex items-center justify-center">
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        overlayClassName="w-[60dvw] md:w-[20rem] pt-5 md:pt-2"
        className="flex"
      >
        <a onClick={(e) => e.preventDefault()}>
          <Space className="text-white">
            <RiAccountCircleFill className="text-4xl " />
            <div className=" hidden md:flex md:flex-row  gap-2">
              <div>{userData?.name}</div>
              <DownOutlined />
            </div>
          </Space>
        </a>
      </Dropdown>
    </div>
  );
}

Profile.propTypes = {
  collapsed: PropTypes.bool,
};
