import { Tabs } from "antd";
import EmpList from "./EmpList";
import Log from "./Log";

export default function Dashboard() {
  return (
    <div className="p-5 ">
      {/* <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1> */}
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="รายชื่อพนักงาน" key="1">
          <EmpList />
        </Tabs.TabPane>
        <Tabs.TabPane tab="ประวัติการเข้า-ออกระบบ" key="/">
          <Log />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
