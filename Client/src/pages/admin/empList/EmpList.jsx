import { CiCirclePlus, CiSearch } from "react-icons/ci";
import {
  Input,
  Button,
  Table,
  Dropdown,
  Menu,
  Pagination,
  Spin,
  Switch,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import { TbFileExport } from "react-icons/tb";
import { DownOutlined } from "@ant-design/icons";
import { FiEdit } from "react-icons/fi";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
dayjs.extend(buddhistEra);
dayjs.locale("th");

export default function EmpList() {
  const URL = import.meta.env.VITE_BASE_URL;

  const [pagination, setPagination] = useState({ pageSize: 5, current: 1 });
  const [userID, setUserID] = useState("");
  const handlePageSizeChange = (size) => {
    setPagination({ ...pagination, pageSize: size, current: 1 });
  };

  const pageSizeMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => handlePageSizeChange(5)}>
        5
      </Menu.Item>
      <Menu.Item key="2" onClick={() => handlePageSizeChange(10)}>
        10
      </Menu.Item>
      <Menu.Item key="3" onClick={() => handlePageSizeChange(15)}>
        15
      </Menu.Item>
    </Menu>
  );

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
    setPagination(pagination);
  };
  const [spinning, setSpinning] = useState(false);
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
    }
  };

  return (
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
          <Button type="primary">
            <CiCirclePlus className="text-xl" />
            เพิ่มผู้ใช้งาน
          </Button>
        </div>
      </div>
      <div className="flex flex-col shadow-md  bg-white rounded-lg mt-5">
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
                  title: "แผนก",
                  dataIndex: "department",
                  width: 300,
                  filters: Array.from(
                    new Set((users || []).map((user) => user.department))
                  ).map((department) => ({
                    text: department,
                    value: department,
                  })),
                  defaultSortOrder: "descend",
                  onFilter: (value, record) => record.department === value,
                },
                {
                  title: "วันเริ่มงาน",
                  dataIndex: "startDate",
                  width: 200,
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
                  align: "center",
                  render: (text, record) => (
                    <div key={record}>
                      <Switch
                        checked={text === "active"}
                        checkedChildren="เปิดใช้งาน"
                        unCheckedChildren="ปิดใช้งาน"
                        onChange={() => {
                          handleStatusChange(record.userID); // เรียกฟังก์ชันที่เปลี่ยนสถานะ
                        }}
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
                    <Button className=" border-none m-0  h-full w-full">
                      <FiEdit className="text-lg aspect-square h-full" />
                    </Button>
                  ),
                },
              ]}
              dataSource={(users || []).slice(
                (pagination.current - 1) * pagination.pageSize,
                pagination.current * pagination.pageSize
              )}
              onChange={onChange}
              showSorterTooltip={{
                target: "sorter-icon",
              }}
              className=" rounded-none"
              rowKey="key"
            />
          </Spin>
        </div>
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            แสดง
            <Dropdown overlay={pageSizeMenu}>
              <Button>
                {pagination.pageSize} <DownOutlined />
              </Button>
            </Dropdown>
            แถวต่อหน้า
          </div>
          <Pagination
            simple={{ readOnly: true }} // ใช้ simple pagination
            current={pagination.current} // ใช้ค่า current ที่กำหนด
            total={users?.length} // ใช้จำนวนข้อมูลทั้งหมด
            pageSize={pagination.pageSize} // จำนวนแถวต่อหน้า
            onChange={(page) => setPagination({ ...pagination, current: page })} // อัพเดทค่า current page
          />
        </div>
      </div>
    </div>
  );
}
