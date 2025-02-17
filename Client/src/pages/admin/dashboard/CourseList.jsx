import { CiCirclePlus, CiSearch } from "react-icons/ci";
import { Input, Button, Table, Spin } from "antd";
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
                    render: (text, record) => (
                      <div key={record._id}>
                        {text == "public"
                          ? "เปิดรับสมัคร"
                          : text == "close"
                          ? "ปิดรับสมัคร"
                          : text == "end"
                          ? "จบการอบรม"
                          : ""}
                      </div>
                    ),
                    sorter: (a, b) => a.status.localeCompare(b.status),
                  },

                  {
                    title: "รูปแบบการอบรม",
                    dataIndex: "type",
                    sorter: (a, b) => a.type.localeCompare(b.type),
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
