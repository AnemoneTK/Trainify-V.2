import { useEffect, useState } from "react";
import { Button } from "antd";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Otp() {
  const URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  // สร้างสถานะสำหรับเก็บค่าที่กรอกในแต่ละช่อง
  const [otp, setOtp] = useState(new Array(6).fill(""));

  // ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงในช่องกรอก
  const handleChange = (element, index) => {
    if (/^[0-9]$/.test(element.value) || element.value === "") {
      const newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);

      // โฟกัสไปที่ช่องถัดไปหากกรอกครบและไม่ใช่ช่องสุดท้าย
      if (element.nextSibling && element.value) {
        element.nextSibling.focus();
      }
    }
  };

  // Handle pasting OTP
  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("Text").trim();
    const otpDigits = pasteData.split("").slice(0, 6); // Get only the first 6 digits
    const newOtp = [...otp];
    otpDigits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);
  };

  //สร้าง OTP
  const [otpRef, setOtpRef] = useState("");
  const [waitingTime, setWaitingTime] = useState(null);

  const CreateOtp = async () => {
    try {
      const response = await axios.post(`${URL}/auth/create_otp`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      if (data) {
        setOtpRef(data.ref);
        const waitTime = parseFloat(response.data.time);
        setWaitingTime(waitTime);
      }
    } catch (error) {
      const errorResponse = error.response;
      console.error("CreateOtp Error",errorResponse);
      Swal.fire({
        title: `${errorResponse.data.message}`,
        icon: `${errorResponse.data.status}`,
        confirmButtonText: "ตกลง",
      }).then(() => {
        navigate("/");
      });
    }
  };

  useEffect(() => {
    CreateOtp();
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`; // แสดงผลในรูปแบบ นาที:วินาที
  };

  // Reset OTP
  const resetOtp = async () => {
    setOtpRef("กำลังส่ง OTP");
    setWaitingTime(null);
    try {
      const response = await axios.get(`${URL}/auth/reset_otp`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      if (data) {
        setOtpRef(data.ref);
        const waitTime = parseFloat(response.data.time);
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
      const response = await axios.post(
        `${URL}/auth/verify_otp`,
        {
          otp: otp.join(""),
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response",response)
      const data = response.data;
      if (response.status === 200) {
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
      const errorResponse = error.response;
      console.log("errorResponse",errorResponse)
      if (errorResponse.status === 400) {
        Swal.fire({
          title: `${errorResponse.data.message}`,
          icon: `${errorResponse.data.status}`,
          confirmButtonText: "ตกลง",
        });
      } else {
        Swal.fire({
          title: `${errorResponse.data.message}`,
          icon: `${errorResponse.data.status}`,
          confirmButtonText: "ตกลง",
        }).then(() => {
          navigate("/");
        });
      }
    }
  };

  // Handle Enter key press to submit OTP
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !otp.some((value) => value === "")) {
        verifyOtp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [otp]);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-background overflow-hidden">
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
          <div className="flex  w-full gap-2 justify-between">
            {otp.map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="w-12 aspect-square text-xl text-center border border-gray-300 bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-employee"
                value={otp[index]}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" &&
                    !otp[index] &&
                    e.target.previousSibling
                  ) {
                    e.target.previousSibling.focus();
                  }
                }}
                onPaste={handlePaste}
              />
            ))}
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
                    className="text-employee underline cursor-pointer"
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
            disabled={otp.some((value) => value === "")}
          >
            ยืนยัน
          </Button>
        </div>
      </div>
    </div>
  );
}
