import { Table, Tabs } from "antd";

import EmpList from "./EmpList";
export default function Dashboard() {
  return (
    <div className="p-5 ">
      {/* <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1> */}
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="รายชื่อพนักงาน" key="1">
          <EmpList />
        </Tabs.TabPane>
        <Tabs.TabPane tab="บัญชีที่ถูกปิดการใช้งาน" key="2">
          <Table />
        </Tabs.TabPane>
        <Tabs.TabPane tab="หลักสูตรฝึกอบรม" key="3">
          <p>หน้าหลักสูตรอยู่ที่นี่...</p>
        </Tabs.TabPane>
        <Tabs.TabPane tab="หลักสูตรรอการอนุมัติ" key="4">
          <p>หน้าหลักสูตรอยู่ที่นี่...</p>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
