import SaListHeader from "./SaListHeader";
import { CiCirclePlus, CiSearch } from "react-icons/ci";
import { Input, Button, Table, Dropdown, Menu, Pagination, Spin } from "antd";
import { useEffect, useState } from "react";
import { TbFileExport } from "react-icons/tb";
import { DownOutlined } from "@ant-design/icons";
import { FiEdit } from "react-icons/fi";
import axios from "axios";


const data = [
  {
    key: "1",
    name: "John Brown",
    user_ID: "U001",
    department: 32,
    address: "New York No. 1 Lake Park",
  },
  {
    key: "2",
    name: "Jim Green",
    user_ID: "U001",
    department: 42,
    address: "London No. 1 Lake Park",
  },
  {
    key: "3",
    name: "Joe Black",
    department: 32,
    address: "Sydney No. 1 Lake Park",
  },
  {
    key: "4",
    name: "Jim Red",
    department: 32,
    address: "London No. 2 Lake Park",
  },
];

export default function EmpList() {
  const [pagination, setPagination] = useState({ pageSize: 5, current: 1 });

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
const [spinning,setSpinning]=useState(false)
const [users,setUsers]=useState(null)
  useEffect(()=>{
    get_users()
  },[])
  const URL = import.meta.env.VITE_BASE_URL;
  const get_users = async () => {
    try {
      setSpinning(true)
      const response = await axios.post(`${URL}/api/users/get_users`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
     console.log(response.data.data)
     setUsers(response.data.data.map((item, index) => ({
      ...item,
      key: item.id || index+1, 
  })));
     setSpinning(false)
    } catch (error) {
      console.log(error)
  };}

  return (
    <div>
      <SaListHeader />

      <div className="flex flex-row md:flex-row items-end justify-between">
        <div>
          <div className="text-2xl font-bold">พนักงาน ({data.length})</div>
          <div className="text-md hidden md:block">
            บัญชีผู้ใช้งาน - พนักงาน (Employee)
          </div>
        </div>
        <div>
          <Button type="primary">
            <CiCirclePlus className="text-xl"/>
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
            sticky={true}
            Breakpoint={"md"}
            columns={ [
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
                width: 100,
                filters: Array.from(new Set((users || []).map(user => user.department))).map(department => ({
                    text: department,
                    value: department,
                })),
                defaultSortOrder: "descend",
                onFilter: (value, record) => record.department === value,
            }
            ,{
              title: "สถานะ",
              dataIndex: "status",
              width:100,
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
              onFilter: (value, record) => record.address.indexOf(value) === 0,
            },
            
              {
                title: "Actions",
                key: "action",
                width: 100,
                render: () => (
                  <Button className=" border-none" >
                    <FiEdit className="text-lg aspect-square h-full"/>
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
            total={data.length} // ใช้จำนวนข้อมูลทั้งหมด
            pageSize={pagination.pageSize} // จำนวนแถวต่อหน้า
            onChange={(page) => setPagination({ ...pagination, current: page })} // อัพเดทค่า current page
          />
        </div>
      </div>
    </div>
  );
}
