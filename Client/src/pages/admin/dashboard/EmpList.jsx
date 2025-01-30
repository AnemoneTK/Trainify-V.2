import { CiCirclePlus, CiSearch } from "react-icons/ci";
import {
  Input,
  Button,
  Table,
  Checkbox,
  Spin,
  Switch,
  notification,
} from "antd";
import Swal from "sweetalert2";
import { useUser } from "../../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TbFileExport } from "react-icons/tb";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
dayjs.extend(buddhistEra);
dayjs.locale("th");
import callApi from "../../../utils/axios";
import UserModal from "../../../components/UserModal";

export default function EmpList() {
  const { userData } = useUser();
  const navigate = useNavigate();

  const [spinning, setSpinning] = useState(false);
  const [users, setUsers] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (users) {
      console.log("users", users);
    }
  }, [users]);
  useEffect(() => {
    if (userData) {
      get_users();
    }
  }, [userData]);

  const get_users = async () => {
    try {
      setSpinning(true);
      const response = await callApi({
        path: "/api/users/get_users",
        method: "post",
        value: {},
      });

      console.log(response);
      setUsers(
        response.data.map((item, index) => ({
          ...item,
          key: item.id || index + 1,
        }))
      );
      setSpinning(false);
    } catch (error) {
      console.log("errorResponse", error);
      if (error.statusCode === 400) {
        Swal.fire({
          title: `${error.message}`,
          message: `${error.error}`,
          icon: `${error.icon}`,
          confirmButtonText: "ตกลง",
        });
      } else {
        Swal.fire({
          title: `${error.message}`,
          icon: `${error.icon}`,
          confirmButtonText: "ตกลง",
        }).then(() => {
          navigate("/");
        });
      }
    }
  };

  const handleStatusChange = async (id) => {
    try {
      const response = await callApi({
        path: "/api/users/change_status",
        method: "post",
        value: {
          userID: id,
        },
      });
      console.log("response", response);
      if (response.statusCode === 200) {
        notification.success({
          message: "เปลี่ยนสถานะสำเร็จ",
          description: (
            <>
              <span
                style={{
                  color:
                    response.data.newStatus === "active"
                      ? "#52c41a"
                      : "#f5222d",
                  fontWeight: "bolder",
                }}
              >
                {response.data.newStatus === "active"
                  ? "เปิดใช้งาน"
                  : "ปิดการใช้งาน"}
              </span>{" "}
              บัญชี {response.firstName} เรียบร้อยแล้ว
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
    }
  };

  const handleRowClick = (record) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
    get_users();
  };

  return (
    <>
      <div>
        {/* <ListHeader /> */}

        <div className="flex flex-row md:flex-row items-end justify-between">
          <div>
            <div className="text-2xl font-bold">
              พนักงาน ({users?.length || 0})
            </div>
            <div className="text-md hidden md:block">
              บัญชีผู้ใช้งาน - พนักงาน (Employee)
            </div>
          </div>
          <div>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              <CiCirclePlus className="text-xl" />
              เพิ่มผู้ใช้งาน
            </Button>
          </div>
        </div>
        <div className="flex flex-col shadow-md  bg-white rounded-lg mt-5 max-h-[70dvh]">
          <div className="search flex flex-row items-center justify-between p-4">
            <div className="w-1/6">
              <Input prefix={<CiSearch />} />
            </div>
            <div>
              <Button>
                <TbFileExport className="text-lg" />
                ส่งออกข้อมูล
              </Button>
            </div>
          </div>
          <div>
            <Spin spinning={spinning}>
              <Table
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: [5, 10, 20, 50],
                }}
                sticky={true}
                dataSource={users || []}
                showSorterTooltip={{
                  target: "full-header",
                }}
                className=" rounded-none px-3 "
                rowKey="key"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                })}
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
                    dataIndex: "firstName",
                    sorter: (a, b) => a.firstName.localeCompare(b.firstName),
                    render: (text, record) => {
                      return `${record.firstName} ${record.lastName}`;
                    },
                  },
                  {
                    title: "แผนก",
                    dataIndex: "department",
                    width: 200,
                    responsive: ["sm"],
                    filters: Array.from(
                      new Set((users || [])?.map((user) => user.department))
                    ).map((department) => ({
                      text: department,
                      value: department,
                    })),
                    defaultSortOrder: "descend",
                    onFilter: (value, record) => record.department === value,
                    filterDropdown: ({
                      setSelectedKeys,
                      selectedKeys,
                      confirm,
                      clearFilters,
                    }) => (
                      <div style={{ padding: 8 }}>
                        {Array.from(
                          new Set((users || [])?.map((user) => user.department))
                        ).map((department) => (
                          <Checkbox
                            key={department}
                            value={department}
                            checked={selectedKeys.includes(department)}
                            onChange={(e) => {
                              setSelectedKeys(
                                e.target.checked ? [department] : []
                              );
                            }}
                          >
                            {department}
                          </Checkbox>
                        ))}
                        <div className="flex justify-between mt-2 pt-1">
                          <Button
                            onClick={() => clearFilters()}
                            size="small"
                            style={{ marginRight: 8 }}
                          >
                            รีเซ็ต
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => {
                              confirm(); // กดปุ่ม ตกลง
                            }}
                            size="small"
                          >
                            ตกลง
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "วันเริ่มงาน",
                    dataIndex: "startDate",
                    width: 120,
                    responsive: ["sm"],
                    align: "center",
                    defaultSortOrder: "ascend",
                    sorter: (a, b) =>
                      dayjs(a.startDate).isBefore(dayjs(b.startDate)) ? -1 : 1, // การจัดเรียงโดยใช้ dayjs
                    render: (startDate) => {
                      return dayjs(startDate).format("DD/MM/YYYY"); // แสดงวันที่ในรูปแบบ วัน/เดือน/ปี
                    },
                  },
                  {
                    title: "สถานะ",
                    dataIndex: "status",
                    width: 150,
                    responsive: ["md"],
                    align: "center",
                    render: (text, record) => (
                      <div key={record.userID}>
                        <Switch
                          checked={text === "active"}
                          checkedChildren="เปิดใช้งาน"
                          unCheckedChildren="ปิดใช้งาน"
                          onChange={() => {
                            handleStatusChange(record.userID);
                          }}
                        />
                      </div>
                    ),
                    filters: [
                      { text: "active", value: "active" },
                      { text: "offline", value: "offline" },
                    ],
                    onFilter: (value, record) =>
                      record.status.indexOf(value) === 0,
                    filterDropdown: ({
                      setSelectedKeys,
                      selectedKeys,
                      confirm,
                      clearFilters,
                    }) => (
                      <div style={{ padding: 8 }}>
                        <Checkbox
                          value="active"
                          checked={selectedKeys.includes("active")}
                          onChange={(e) => {
                            setSelectedKeys(e.target.checked ? ["active"] : []);
                          }}
                        >
                          active
                        </Checkbox>
                        <br />
                        <Checkbox
                          value="offline"
                          checked={selectedKeys.includes("offline")}
                          onChange={(e) => {
                            setSelectedKeys(
                              e.target.checked ? ["offline"] : []
                            );
                          }}
                        >
                          offline
                        </Checkbox>
                        <div className="flex justify-between mt-2 pt-1  ">
                          <Button
                            onClick={() => clearFilters()}
                            size="small"
                            style={{ marginRight: 8 }}
                          >
                            รีเซ็ต
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => {
                              confirm();
                            }}
                            size="small"
                          >
                            ตกลง
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Spin>
          </div>
        </div>
      </div>
      <UserModal
        visible={isModalVisible}
        onClose={closeModal}
        data={selectedUser}
      />
    </>
  );
}
