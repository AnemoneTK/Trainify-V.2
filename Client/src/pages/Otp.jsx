import { useEffect, useState, useRef } from "react";
import { Input, Button } from "antd";
import callApi from "../utils/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Otp() {
  const navigate = useNavigate();
  const otpRequested = useRef(false);
  const [otp, setOtp] = useState("");
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const handleChange = (value) => {
    setOtp(value);
  };

  //สร้าง OTP
  const [otpRef, setOtpRef] = useState("");
  const [waitingTime, setWaitingTime] = useState(null);

  useEffect(() => {
    if (!otpRequested.current) {
      otpRequested.current = true;
      CreateOtp();
    }
  }, []);

  useEffect(() => {
    if (waitingTime > 0) {
      const timer = setInterval(() => {
        setWaitingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [waitingTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && otp.length === 6) {
        verifyOtp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [otp]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`; // แสดงผลในรูปแบบ นาที:วินาที
  };
  const CreateOtp = async () => {
    if (isOtpRequested) return; // ป้องกันการเรียกซ้ำ
    setIsOtpRequested(true);
    try {
      const response = await callApi({
        path: "/auth/create_otp",
        method: "POST",
        value: {},
      });

      if (response) {
        console.log(response);
        setOtpRef(response.data.ref);
        const waitTime = parseFloat(response.data.waitingTime);
        setWaitingTime(waitTime);
      }
    } catch (error) {
      const errorResponse = error.response;
      console.error("CreateOtp Error", errorResponse);
      Swal.fire({
        icon: error.icon,
        title: error.message,
        text: error.error || "",
        confirmButtonText: "ตกลง",
      }).then(() => {
        navigate("/");
      });
    }
  };
  // Reset OTP
  const resetOtp = async () => {
    setOtpRef("กำลังส่ง OTP");
    setWaitingTime(null);
    try {
      const response = await callApi({
        path: "/auth/reset_otp",
        method: "get",
      });
      console.log(response);
      if (response) {
        setOtpRef(response.data.ref);
        const waitTime = parseFloat(response.data.waitingTime);
        setWaitingTime(waitTime);
      }
    } catch (error) {
      const errorResponse = error.response;
      console.error(errorResponse);
      Swal.fire({
        title: `${errorResponse.data.message}`,
        icon: `${errorResponse.data.status}`,
        confirmButtonText: "ตกลง",
      }).then(() => {
        navigate("/");
      });
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await callApi({
        path: "/auth/verify_otp",
        method: "post",
        value: {
          otp: otp,
        },
      });
      console.log("response", response);
      const data = response.data;
      if (response.status === "success") {
        if (data.role === "employee") {
          navigate("/dashboard");
        }
        if (data.role === "admin") {
          navigate("/admin_dashboard");
        }
        if (data.role === "super_admin") {
          navigate("/sa_dashboard");
        }
      }
    } catch (error) {
      const errorResponse = error;
      console.log("errorResponse", errorResponse);
      if (errorResponse.statusCode === 400) {
        Swal.fire({
          title: `${errorResponse.message}`,
          icon: `${errorResponse.icon}`,
          confirmButtonText: "ตกลง",
        });
      } else {
        Swal.fire({
          title: `${errorResponse.message}`,
          icon: `${errorResponse.icon}`,
          confirmButtonText: "ตกลง",
        }).then(() => {
          navigate("/");
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-background overflow-hidden bg-bg text-black">
      <div className="bg-white relative flex-col items-center justify-center rounded-none lg:rounded-lg h-screen w-screen  md:h-1/2 md:w-1/2 xl:w-1/3 shadow-xl shadow-cyan-500/50 px-2 pt-3">
        <div className="text-4xl text-center font-extrabold text-employee">
          ยืนยันรหัส OTP
          <p className="text-primary text-sm font-normal mt-2">
            กรุณาตรวจสอบ gmail ของคุณ
          </p>
        </div>
        <div className="text-center my-8 text-xl">
          <div>รหัสอ้างอิง</div>
          <span className="text-2xl font-bold underline">
            {otpRef ? otpRef : "กำลังส่ง OTP"}
          </span>
        </div>
        <div className="flex items-center justify-center flex-col my-12 gap-4 px-5  lg:px-12  ">
          <div className="flex justify-center w-full">
            <Input.OTP
              size="large"
              length={6}
              value={otp}
              onChange={handleChange}
              className="w-16 h-16 text-center text-2xl border border-gray-300 rounded"
            />
          </div>

          <div className="flex flex-row w-full items-center justify-between">
            {waitingTime === 0 ? (
              <div>
                รหัส OTP หมดอายุ{" "}
                <span
                  className="text-employee underline cursor-pointer"
                  onClick={() => resetOtp()}
                >
                  ขอ OTP ใหม่
                </span>
              </div>
            ) : (
              <>
                <div>รหัสจะหมดอายุใน {formatTime(waitingTime)}</div>
                <div>
                  ไม่ได้รับรหัส OTP?{" "}
                  <span
                    className="text-emp-primary underline cursor-pointer"
                    onClick={() => resetOtp()}
                  >
                    ขอ OTP ใหม่
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center w-full px-12 ">
          <Button
            size="large"
            variant="outlined"
            color="primary"
            className="w-full"
            onClick={() => verifyOtp()}
          >
            ยืนยัน
          </Button>
        </div>
      </div>
    </div>
  );
}
