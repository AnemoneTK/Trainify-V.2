import {
  Card,
  Button,
  Table,
  Menu,
  Spin,
  Switch,
  notification,
  Tag,
} from "antd";
import { FiEdit } from "react-icons/fi";
import { useEffect, useState } from "react";
import axios from "axios";
export default function SuperAdminDashboard() {
  const URL = import.meta.env.VITE_BASE_URL;
  const [spinning, setSpinning] = useState(false);
  const [userID, setUserID] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(null);
  useEffect(() => {
    if (users) {
      console.log("users", users);
    }
  }, [users]);
  useEffect(() => {
    get_users();
  }, []);

  const get_users = async () => {
    try {
      setSpinning(true);
      const response = await axios.post(
        `${URL}/api/users/get_users`,
        { userID: userID },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data.data);
      setUsers(
        response.data.data.map((item, index) => ({
          ...item,
          key: item.id || index + 1,
        }))
      );
      setSpinning(false);
    } catch (error) {
      console.log(error.response?.data);
    }
  };
  const handleStatusChange = async (id) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${URL}/api/users/change_status`,
        {
          userID: id,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data.data;
      if (response.status === 200) {
        notification.success({
          message: "เปลี่ยนสถานะสำเร็จ",
          description: (
            <>
              <span
                style={{
                  color: data.newStatus === "active" ? "#52c41a" : "#f5222d",
                  fontWeight: "bolder",
                }}
              >
                {data.newStatus === "active" ? "เปิดใช้งาน" : "ปิดการใช้งาน"}
              </span>{" "}
              บัญชี {data.firstName} เรียบร้อยแล้ว
            </>
          ),
        });
        get_users();
      } else {
        notification.error({
          message: "การเปลี่ยนสถานะล้มเหลว",
          description:
            response.response.data.message ||
            "เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้",
        });
      }
    } catch (error) {
      console.error("Change Status Error :", error);
      notification.error({
        message: "การเปลี่ยนสถานะล้มเหลว",
        description: "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้",
      });
    } finally {
      setLoading(false); // ปิดสถานะการโหลดหลังจากที่ตอบกลับจาก API
    }
  };

  return (
    <div className="w-full flex flex-col gap-[1rem] h-screen overflow-auto">
      <div className="text-2xl font-bold mb-2">Dashboard</div>
      <div
        className="w-full flex flex-column md:flex-row gap-[1rem] h-full"
        style={{
          overflowY: "scroll", // Allows scrolling
          maxHeight: "80vh",
          scrollbarWidth: "none" /* Firefox */,
        }}
      >
        <div className="w-1/2 h-full bg-white">
          <div className="w-full ">
            <Spin spinning={spinning}>
              <Table
                pagination={false}
                sticky={true}
                Breakpoint={"md"}
                columns={[
                  {
                    title: "#",
                    dataIndex: "key",
                    defaultSortOrder: "ascend",
                    sorter: (a, b) => a.key - b.key,
                    width: 80,
                    align: "center",
                  },
                  {
                    title: "ชื่อ",
                    dataIndex: "name",
                    defaultSortOrder: "ascend",
                    sorter: (a, b) => a.name.localeCompare(b.name),
                  },
                  {
                    title: "ประเภท",
                    dataIndex: "role",
                    width: 120,
                    align: "center",
                    filters: [
                      { text: "ผู้ดูแลสูงสุด", value: "super_admin" },
                      { text: "ผู้ดูแล", value: "admin" },
                      { text: "พนักงาน", value: "employee" },
                    ],
                    onFilter: (value, record) => record.role === value,
                    render: (role) => {
                      let color = "";
                      let text = "";

                      switch (role) {
                        case "super_admin":
                          color = "orange";
                          text = "ผู้ดูแลสูงสุด";
                          break;
                        case "admin":
                          color = "pink";
                          text = "ผู้ดูแล";
                          break;
                        case "employee":
                          color = "blue";
                          text = "พนักงาน";
                          break;
                        default:
                          color = "gray";
                          text = "ไม่มีข้อมูล";
                      }

                      return (
                        <Tag className="w-full text-center" color={color}>
                          {text}
                        </Tag>
                      );
                    },
                  },
                  {
                    title: "สถานะ",
                    dataIndex: "status",
                    width: 150,
                    align: "center",
                    render: (text, record) => (
                      <div key={record}>
                        <Switch
                          checked={text === "active"}
                          checkedChildren="เปิดใช้งาน"
                          unCheckedChildren="ปิดใช้งาน"
                          onChange={() => {
                            if (!loading) {
                              handleStatusChange(record.userID);
                            }
                          }}
                          loading={loading}
                        />
                      </div>
                    ),
                    filters: [
                      {
                        text: "active",
                        value: "active",
                      },
                      {
                        text: "offline",
                        value: "offline",
                      },
                    ],
                    onFilter: (value, record) =>
                      record.status.indexOf(value) === 0,
                  },

                  {
                    title: "Actions",
                    key: "action",
                    width: 100,
                    render: () => (
                      <Button className=" border-none">
                        <FiEdit className="text-lg aspect-square h-full" />
                      </Button>
                    ),
                  },
                ]}
                dataSource={users || []}
                showSorterTooltip={{
                  target: "sorter-icon",
                }}
                rowKey="key"
              />
            </Spin>
          </div>
        </div>
        <div className="w-1/2 gap-3 flex flex-col ">
          <div className="w-full h-1/3 flex flex-column lg:flex-row gap-3">
            <Card
              title="บัญชีรอการยืนยัน"
              extra={<a href="#">ดูทั้งหมด</a>}
              className="w-1/2 h-full"
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
            <Card
              title="บัญชีที่ถูกลบ"
              extra={<a href="#">ดูทั้งหมด</a>}
              className="w-1/2 h-full"
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </div>
          <hr className="m-2" />
          <div className="w-full  h-full">
            <div>
              <div className="text-xl font-bold mb-2">ประวัติการแก้ไขบัญชี</div>

              <Spin spinning={spinning}>
                <Table
                  sticky={true}
                  Breakpoint={"md"}
                  columns={[
                    {
                      title: "#",
                      dataIndex: "key",
                      defaultSortOrder: "ascend",
                      sorter: (a, b) => a.key - b.key,
                      width: 80,
                      align: "center",
                    },
                    {
                      title: "ชื่อ",
                      dataIndex: "name",
                      defaultSortOrder: "ascend",
                      sorter: (a, b) => a.name.localeCompare(b.name),
                    },
                    {
                      title: "สถานะ",
                      dataIndex: "status",
                      width: 100,
                      filters: [
                        {
                          text: "active",
                          value: "active",
                        },
                        {
                          text: "offline",
                          value: "offline",
                        },
                      ],
                      onFilter: (value, record) =>
                        record.address.indexOf(value) === 0,
                    },

                    {
                      title: "Actions",
                      key: "action",
                      width: 100,
                      render: () => (
                        <Button className=" border-none">
                          <FiEdit className="text-lg aspect-square h-full" />
                        </Button>
                      ),
                    },
                  ]}
                  // dataSource={(users || []).slice(
                  //   (pagination.current - 1) * pagination.pageSize,
                  //   pagination.current * pagination.pageSize
                  // )}
                  // onChange={onChange}
                  showSorterTooltip={{
                    target: "sorter-icon",
                  }}
                  rowKey="key"
                />
              </Spin>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
