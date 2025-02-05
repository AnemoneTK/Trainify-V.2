import { Tabs } from "antd";

import EmpList from "./EmpList";
import CourseList from "./CourseList";
export default function Dashboard() {
  return (
    <div className="p-5 ">
      {/* <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1> */}
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="รายชื่อพนักงาน" key="1">
          <EmpList />
        </Tabs.TabPane>
        <Tabs.TabPane tab="หลักสูตรฝึกอบรม" key="2">
          <CourseList />
        </Tabs.TabPane>
        <Tabs.TabPane tab="หลักสูตรรอการอนุมัติ" key="3">
          <p>หน้าหลักสูตรอยู่ที่นี่...</p>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
