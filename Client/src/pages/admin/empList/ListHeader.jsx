import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const items = [
  {
    label: "บัญชีพนักงาน",
    key: "emp",
  },
  {
    label: "บัญชีแอดมิน (เฉพาะ Head Admin)",
    key: "admin",
  },
];

export default function ListHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("emp");

  useEffect(() => {
    // ตรวจสอบว่าเส้นทางปัจจุบันคืออะไรแล้วปรับ current ให้ตรง
    if (location.pathname === "/emp_list") {
      setCurrent("emp");
    } else if (location.pathname === "/admin_list") {
      setCurrent("admin");
    }
  }, [location.pathname]);

  const onClick = (e) => {
    setCurrent(e.key);
    if (e.key === "emp") {
      navigate("/emp_list");
    } else if (e.key === "admin") {
      navigate("/admin_list");
    }
  };

  return (
    <div>
      <Menu style={{backgroundColor:'transparent', marginBottom:'2rem', fontSize:"1.2rem"}} onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} className="bg-none"  />
    </div>
  );
}
