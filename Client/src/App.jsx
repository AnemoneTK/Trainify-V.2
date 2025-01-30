import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import "./App.css";
import CustomLocale from "./components/CustomLocale";
import { UserProvider } from "./contexts/UserContext";
// import pages for route
import SelectRole from "./pages/SelectRole";
import Login from "./pages/Login";
import EmpLayout from "./layout/emp/EmpLayout";
import EmpDashboard from "./pages/emp/dashboard/Dashboard";
import Empschedule from "./pages/emp/schedule/Schedule";
import Enmpmycourse from "./pages/emp/mycourse/Mycourse";
import Course from "./pages/emp/courseadd/Course";
import AdminLayout from "./layout/admin/AdminLayout";
import SaAdminLayout from "./layout/superadmin/SaAdminLayout";

import Policy from "./pages/Policy";

// Admin Route Page
import AdminDashboard from "./pages/admin/dashboard/Dashboard";

// SuperAdmin Route Page
import SuperAdminDashboard from "./pages/superadmin/dashboard/Dashboard";
import SaEmpList from "./pages/superadmin/empAccount/SaEmpList";
import SaAdminList from "./pages/superadmin/empAccount/SaAdminList";

import Otp from "./pages/Otp";

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider locale={CustomLocale}>
        <UserProvider>
          <Routes>
            <Route path="/" element={<SelectRole />} />
            <Route path="/login" element={<Login />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/otp" element={<Otp />} />

            {/* หน้า  EMP */}
            <Route
              path="/dashboard"
              element={
                <EmpLayout>
                  <EmpDashboard />
                </EmpLayout>
              }
            />
            <Route
              path="/schedule"
              element={
                <EmpLayout>
                  <Empschedule />
                </EmpLayout>
              }
            />
            <Route
              path="/my_course"
              element={
                <EmpLayout>
                  <Enmpmycourse />
                </EmpLayout>
              }
            />
            <Route
              path="/courses"
              element={
                <EmpLayout>
                  <Course />
                </EmpLayout>
              }
            />
            {/* หน้า admin */}
            <Route
              path="/admin_dashboard"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />

            {/* หน้า superadmin */}

            <Route
              path="/sa_dashboard"
              element={
                <SaAdminLayout>
                  <SuperAdminDashboard />
                </SaAdminLayout>
              }
            />
            <Route
              path="/all_list"
              element={
                <SaAdminLayout>
                  <SaEmpList />
                </SaAdminLayout>
              }
            />
            <Route
              path="/Saadmin_list"
              element={
                <SaAdminLayout>
                  <SaAdminList />
                </SaAdminLayout>
              }
            />
          </Routes>
        </UserProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
