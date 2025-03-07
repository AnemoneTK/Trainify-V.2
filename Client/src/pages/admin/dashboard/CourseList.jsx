import { CiCirclePlus, CiSearch } from "react-icons/ci";
import { Input, Button, Table, Spin, Tag, Checkbox } from "antd";
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
import CourseModal from "../../../components/CourseModal";

export default function CourseList() {
  const { userData } = useUser();
  const navigate = useNavigate();

  const [spinning, setSpinning] = useState(false);
  const [users, setUsers] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (users) {
      console.log("course", users);
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
        path: "/api/course/get_course",
        method: "post",
        value: {},
      });

      console.log(response);
      setUsers(
        response.data.data.map((item, index) => ({
          ...item,
          key: item.id || index + 1,
        }))
      );
      setSpinning(false);
    } catch (error) {
      console.log("errorResponse", error);
      if (error.statusCode === 400 || error.statusCode === 401) {
        Swal.fire({
          title: `${error.message}`,
          message: `${error.error}`,
          icon: `${error.icon}`,
          confirmButtonText: "ตกลง",
        }).then(() => {
          if (error.statusCode === 401) {
            navigate("/");
          }
        });
      } else {
        navigate("/");
      }
    }
  };

  const handleRowClick = (record) => {
    setSelectedCourse(record);
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCourse(null);
    get_users();
  };

  return (
    <>
      <div>
        {/* <ListHeader /> */}

        <div className="flex flex-row md:flex-row items-end justify-between">
          <div>
            <div className="text-2xl font-bold">
              หลักสูตร ({users?.length || 0})
            </div>
            <div className="text-md hidden md:block">
              รายชื่อหลักสูตร (Course)
            </div>
          </div>
          <div>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              <CiCirclePlus className="text-xl" />
              เพิ่มหลักสูตร
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
                pagination={
                  users && users.length > 10
                    ? {
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50],
                        pageSize: 10,
                      }
                    : false
                }
                sticky={true}
                dataSource={users || []}
                showSorterTooltip={{
                  target: "full-header",
                }}
                className=" rounded-none px-3 pb-3"
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
                    dataIndex: "title",
                    sorter: (a, b) => a.title.localeCompare(b.title),
                  },
                  {
                    title: "สถานะ",
                    dataIndex: "status",
                    filters: [
                      { text: "เปิดรับสมัคร", value: "public" },
                      { text: "ปิดรับสมัคร", value: "close" },
                      { text: "จบการอบรม", value: "end" },
                      { text: "ถูกลบ", value: "deleted" },
                    ],
                    onFilter: (value, record) =>
                      record.status.indexOf(value) === 0,
                    render: (status) => {
                      let color = "";
                      let text = "";
                      switch (status) {
                        case "public":
                          color = "green";
                          text = "เปิดรับสมัคร";
                          break;
                        case "close":
                          color = "red";
                          text = "ปิดรับสมัคร";
                          break;
                        case "end":
                          color = "blue";
                          text = "จบการอบรม";
                          break;
                        case "deleted":
                          color = "gray";
                          text = "ถูกลบ";
                          break;
                        default:
                          color = "default";
                          text = "ไม่ระบุ";
                      }
                      return <Tag color={color}>{text}</Tag>;
                    },
                    filterDropdown: ({
                      setSelectedKeys,
                      selectedKeys,
                      confirm,
                      clearFilters,
                    }) => (
                      <div style={{ padding: 8 }}>
                        <Checkbox
                          value="public"
                          checked={selectedKeys.includes("public")}
                          onChange={(e) => {
                            setSelectedKeys(e.target.checked ? ["public"] : []);
                          }}
                        >
                          เปิดรับสมัคร
                        </Checkbox>
                        <br />
                        <Checkbox
                          value="close"
                          checked={selectedKeys.includes("close")}
                          onChange={(e) => {
                            setSelectedKeys(e.target.checked ? ["close"] : []);
                          }}
                        >
                          ปิดรับสมัคร
                        </Checkbox>
                        <br />
                        <Checkbox
                          value="end"
                          checked={selectedKeys.includes("end")}
                          onChange={(e) => {
                            setSelectedKeys(e.target.checked ? ["end"] : []);
                          }}
                        >
                          จบการอบรม
                        </Checkbox>
                        <br />
                        <Checkbox
                          value="deleted"
                          checked={selectedKeys.includes("deleted")}
                          onChange={(e) => {
                            setSelectedKeys(
                              e.target.checked ? ["deleted"] : []
                            );
                          }}
                        >
                          ถูกลบ
                        </Checkbox>
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
                  {
                    title: "รูปแบบการอบรม",
                    dataIndex: "type",
                    sorter: (a, b) => a.type.localeCompare(b.type),
                    filters: [
                      { text: "ออนไลน์", value: "online" },
                      { text: "ออฟไลน์", value: "offline" },
                    ],
                    onFilter: (value, record) =>
                      record.type.indexOf(value) === 0,
                    render: (type) => {
                      let color = "";
                      let text = "";
                      if (type === "online") {
                        color = "green";
                        text = "ออนไลน์";
                      } else if (type === "offline") {
                        color = "magenta";
                        text = "ออฟไลน์";
                      }
                      return <Tag color={color}>{text}</Tag>;
                    },
                    filterDropdown: ({
                      setSelectedKeys,
                      selectedKeys,
                      confirm,
                      clearFilters,
                    }) => (
                      <div style={{ padding: 8 }}>
                        <Checkbox
                          value="online"
                          checked={selectedKeys.includes("online")}
                          onChange={(e) => {
                            setSelectedKeys(e.target.checked ? ["online"] : []);
                          }}
                        >
                          ออนไลน์
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
                          ออฟไลน์
                        </Checkbox>
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
      <CourseModal
        visible={isModalVisible}
        onClose={closeModal}
        data={selectedCourse}
      />
    </>
  );
}
