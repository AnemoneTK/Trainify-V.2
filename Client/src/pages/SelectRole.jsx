import { FaUser, FaUserShield, FaUsersCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SelectRole() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "employee",
      label: "พนักงาน",
      icon: <FaUser className="text-7xl" />,
      path: "/login",
    },
    {
      id: "admin",
      label: "ผู้ดูแล",
      icon: <FaUserShield className="text-7xl" />,
      path: "/login",
    },
    {
      id: "super_admin",
      label: "ผู้ดูแลระบบ",
      icon: <FaUsersCog className="text-7xl" />,
      path: "/login",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-background overflow-hidden px-4 bg-bg">
      <div className="bg-white flex flex-col items-center justify-center rounded-lg h-auto w-full  max-w-5xl shadow-lg px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-center text-black">
            เลือกบทบาทของคุณ
          </h1>
        </div>
        {/* Role Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => navigate(role.path, { state: { role: role.id } })}
              className={`flex flex-col items-center justify-center gap-4  rounded-3xl shadow-lg border-2 transition duration-300 ease-in-out transform hover:scale-105 p-6 cursor-pointer ${
                role.id === "employee"
                  ? "hover:bg-emp-secondary border-emp-primary text-emp-primary"
                  : role.id === "admin"
                  ? "hover:bg-admin-secondary border-admin-primary text-admin-primary"
                  : "hover:bg-sa-secondary border-sa-primary text-sa-primary"
              } bg-gray-50`}
            >
              <div className="rounded-full bg-gray-200 flex items-center justify-center p-4">
                {role.icon}
              </div>
              <span className="text-xl sm:text-2xl font-bold">
                {role.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
