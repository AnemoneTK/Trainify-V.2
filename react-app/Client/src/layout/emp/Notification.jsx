import { Badge } from "antd";
import { IoNotifications } from "react-icons/io5";
export default function Notification() {
  return (
    <Badge count={5} color="red">
      <IoNotifications className="text-white text-xl" />
    </Badge>
  );
}
