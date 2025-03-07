import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Space, Button } from "antd";
import { RiAccountCircleFill } from "react-icons/ri";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import { useUser } from "../../contexts/UserContext";
import callApi from "../../utils/axios";
export default function Profile() {
  const { userData } = useUser();

  const dropdownItems = [
    {
      label: <a href="https://www.antgroup.com">Profile</a>,
      key: "0",
    },
    {
      label: <a href="https://www.aliyun.com">Settings</a>,
      key: "1",
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
    console.log("userData", userData);
    const response = await callApi({
      path: "/auth/logout",
      method: "get",
      value: {},
    });
    console.log(response);
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
          <Space className="text-primary">
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
