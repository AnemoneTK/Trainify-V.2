import {
  Card,
  Input,
  Button,
  Table,
  Dropdown,
  Menu,
  Pagination,
  Spin,
} from "antd";
import { FiEdit } from "react-icons/fi";
import { useState } from "react";
export default function AdminDashboard() {
  const [spinning, setSpinning] = useState(false);

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
        <div className="w-1/2 ">
          <div className="w-full h-full bg-white">
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
          {/* <div className="flex justify-between items-center p-4">
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
              onChange={(page) =>
                setPagination({ ...pagination, current: page })
              } // อัพเดทค่า current page
            />
          </div> */}
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
