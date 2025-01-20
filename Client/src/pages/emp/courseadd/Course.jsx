import { useEffect, useState } from "react";
import { Button, Card, Tag, Input, Select, Empty, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useUser } from "../../../contexts/UserContext";
import axios from "axios";

export default function Course() {
  const { userData } = useUser();
  const URL = import.meta.env.VITE_BASE_URL;
  const [spin, setSpin] = useState(false);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (userData) {
      getCourse();
      console.log("course", course);
    }
  }, [userData]);

  const getCourse = async () => {
    try {
      const response = await axios.post(
        `${URL}/api/course/get_course`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response) {
        setCourse(response.data.data);
      } else {
        setCourse(null);
      }
      setSpin(true);
    } catch (error) {
      console.error(
        "Error fetching course:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="w-full flex flex-col  h-screen overflow-auto ">
      <div className="text-2xl font-bold mb-2">ลงทะเบียนคอร์ส</div>
      <div className="flex flex-row gap-2 border-b pb-3 border-b-opacity-5">
        <Input
          size="large"
          placeholder="ค้นหาชื่อคอร์ส"
          prefix={<SearchOutlined />}
          className="w-4/5"
        />
        <Select
          showSearch
          size="large"
          placeholder="รูปแบบการสอน"
          className="w-1/5"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={[
            { value: "1", label: "online" },
            { value: "2", label: "offline" },
          ]}
        />
        <Select
          showSearch
          size="large"
          placeholder="สถานะ"
          className="w-1/5"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={[
            { value: "1", label: "Jack" },
            { value: "2", label: "Lucy" },
            { value: "3", label: "Tom" },
          ]}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="ค้นหาจาก แท็ก"
          className="w-1/5"
        />
      </div>
      <div className="w-full flex flex-row flex-wrap gap-7 h-full overflow-y-auto p-5 max-h-[80dvh] m-0">
        {course && course.length > 0 ? (
          course.map((course) => (
            <Card
              key={course._id}
              hoverable
              className=" w-1/5 h-[450px]  shadow-md select-none"
              cover={
                <img
                  alt={course.title}
                  src={`${URL}${course.banner}`} // ใช้รูป default หากไม่มี banner
                  className="w-full h-[200px] object-cover"
                />
              }
            >
              <div className="flex flex-col h-[13rem] relative">
                <div className="text-[18px] font-bold">{course.title}</div>
                <div>{course.description || ""}</div>
                <div className="flex flex-col absolute bottom-0 w-full ">
                  <div>
                    {course.tag.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </div>
                  <hr />
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    className="btn w-full"
                  >
                    ลงทะเบียน
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="h-full w-full items-center">
            <Spin spinning={spin}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Spin>
          </div>
        )}
      </div>
    </div>
  );
}
