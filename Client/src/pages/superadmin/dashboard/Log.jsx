import { useState, useEffect } from "react";
import { Table, Spin, Button } from "antd";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import callApi from "../../../utils/axios";

export default function Log() {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [loginLogs, setLoginLogs] = useState([]);
  const [logoutLogs, setLogoutLogs] = useState([]);
  const [showLogin, setShowLogin] = useState(true); // Use this state to toggle between login and logout logs

  useEffect(() => {
    getLog();
  }, []);

  const getLog = async () => {
    try {
      setSpinning(true);
      const response = await callApi({
        path: "/api/users/logs",
        method: "get",
        value: {},
      });

      console.log(response);
      setLoginLogs(response.data.loginLogs);
      setLogoutLogs(response.data.logoutLogs);
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

  const loginColumns = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      align: "center",
    },
    {
      title: "อีเมล์",
      dataIndex: "email",
      key: "email",
      render: (email) => email,
    },
    {
      title: "ชื่อ",
      dataIndex: "userData.firstName",
      key: "userData.firstName",
      render: (firstName, record) =>
        `${record.userData.firstName} ${record.userData.lastName}`,
    },
    {
      title: "สถานะ",
      dataIndex: "success",
      key: "success",
      render: (success) => (success ? "สำเร็จ" : "ล้มเหลว"),
      align: "center",
    },
    {
      title: "IP",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "วันที่",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => new Date(createdAt).toLocaleString(),
      align: "center",
    },
  ];

  const logoutColumns = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      align: "center",
    },
    {
      title: "อีเมล์",
      dataIndex: "email",
      key: "email",
      render: (email) => email,
    },
    {
      title: "เหตุผล",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "IP",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "วันที่",
      dataIndex: "logoutAt",
      key: "logoutAt",
      render: (logoutAt) => new Date(logoutAt).toLocaleString(),
      align: "center",
    },
  ];

  return (
    <div>
      <div className="flex flex-row md:flex-row items-end justify-between">
        <div>
          <div className="text-2xl font-bold">ประวัติการเข้า - ออกระบบ</div>
        </div>
        <div className="flex gap-3">
          {/* Toggle buttons */}
          <Button
            type={showLogin ? "primary" : "default"}
            onClick={() => setShowLogin(true)}
          >
            ประวัติการเข้าสู่ระบบ
          </Button>
          <Button
            type={!showLogin ? "primary" : "default"}
            onClick={() => setShowLogin(false)}
          >
            ประวัติการออกจากระบบ
          </Button>
        </div>
      </div>
      <Spin spinning={spinning}>
        {/* Conditional rendering based on showLogin */}
        {showLogin ? (
          <div>
            <h3>ประวัติการเข้าสู่ระบบ</h3>
            <Table
              pagination={
                loginLogs && loginLogs.length > 10
                  ? {
                      showSizeChanger: true,
                      pageSize: 10,
                    }
                  : false
              }
              rowKey="_id"
              dataSource={loginLogs}
              columns={loginColumns}
            />
          </div>
        ) : (
          <div>
            <h3>ประวัติการออกจากระบบ</h3>
            <Table
              pagination={
                logoutLogs && logoutLogs.length > 10
                  ? {
                      showSizeChanger: true,
                      pageSize: 10,
                    }
                  : false
              }
              rowKey="_id"
              dataSource={logoutLogs}
              columns={logoutColumns}
            />
          </div>
        )}
      </Spin>
    </div>
  );
}
