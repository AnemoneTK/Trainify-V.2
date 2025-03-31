import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

// สร้าง Context
const UserContext = createContext();

// Hook สำหรับใช้ Context
export const useUser = () => useContext(UserContext);

// Provider สำหรับห่อ component ต่าง ๆ
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};
UserProvider.propTypes = {
  children: PropTypes.node,
};
