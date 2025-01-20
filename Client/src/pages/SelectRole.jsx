import { FaUser, FaUserShield, FaUsersCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function SelectRole() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'employee',
      label: 'Employee',
      icon: <FaUser className="text-7xl" />,
      path: '/emp_login',
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <FaUserShield className="text-7xl" />,
      path: '/admin_login',
    },
    {
      id: 'super_admin',
      label: 'Super Admin',
      icon: <FaUsersCog className="text-7xl" />,
      path: '/sa_login',
    },
  ];
    return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-background overflow-hidden" >
        <div className="bg-white flex-col items-center justify-center rounded-none lg:rounded-lg h-screen w-screen sm:h-screen sm:w-screen lg:h-[70dvh] lg:w-[90dvw]  xl:h-[50dvh] xl:w-[50dvw] shadow-lg px-4 pt-8">
          <div className='h-[1rem] mb-7  lg:h-1/5'>
            <h1 className="text-4xl font-semibold text-center text-primary ">เลือกบทบาทของคุณ</h1>
          </div>
          <div className="flex flex-col p-5 sm:flex-col md:flex-col lg:flex-row h-4/5 sm:w-full md:h-full  lg:h-2/4 items-center justify-center  gap-[1.5rem] lg:gap-[2.5rem]">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => navigate(role.path)}
                className={`flex flex-col gap-[1.5rem] border-primary shadow-lg shadow-dark_blur w-full sm:w-2/5 aspect-square  items-center justify-center border rounded-3xl cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 `}>
                <div className="rounded-full bg-gray-200  flex items-center text-primary justify-center">{role.icon}</div>
                <span className="text-2xl  flex items-center text-primary font-bold justify-center">{role.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}
