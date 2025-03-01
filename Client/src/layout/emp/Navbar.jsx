import Logo from "/Logo-BG-03.png";
import { Layout } from "antd";
import Profile from "./Profile";
import Notification from "./Notification";
import PropTypes from "prop-types";

const { Header } = Layout;
const Navbar = () => {
  return (
    <Header className="flex flex-row items-center justify-between px-2 md:px-10 m-0">
      <div className="h-[5rem] flex gap-3 items-center justify-center">
        <img className="h-1/2 " src={Logo} alt="" />
        <div className="text-2xl font-extrabold text-white">Trainify</div>
      </div>
      <div className=" relative flex flex-row items-center justify-center gap-5">
        <div className=" absolute -left-8 md:-left-12 flex items-center justify-center">
          <Notification />
        </div>
        <Profile />
      </div>
    </Header>
  );
};

export default Navbar;

Navbar.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};
