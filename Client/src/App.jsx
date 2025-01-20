import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import "./App.css";
import CustomLocale from "./components/CustomLocale";
import { UserProvider } from "./contexts/UserContext";
// import pages for route
import SelectRole from "./pages/SelectRole";
import EmpLogin from "./pages/emp/EmpLogin";
import AdminLogin from "./pages/admin/AdminLogin";
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
import EmpList from "./pages/admin/empList/EmpList";
import AdminList from "./pages/admin/empList/AdminList";

// SuperAdmin Route Page
import SuperAdminLogin from "./pages/superadmin/SALogin"
import SuperAdminDashboard from "./pages/superadmin/dashboard/Dashboard";
import SaEmpList from "./pages/superadmin/empAccount/SaEmpList";
import SaAdminList from "./pages/superadmin/empAccount/SaAdminList";

import Otp from "./components/Otp";

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider locale={CustomLocale}>
        <UserProvider>
          <Routes>
            <Route path="/" element={<SelectRole />} />
            <Route path="/emp_login" element={<EmpLogin />} />
            <Route path="/admin_login" element={<AdminLogin />} />
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
            <Route
              path="/emp_list"
              element={
                <AdminLayout>
                  <EmpList />
                </AdminLayout>
              }
            />
            <Route
              path="/admin_list"
              element={
                <AdminLayout>
                  <AdminList />
                </AdminLayout>
              }
            />
            {/* หน้า superadmin */}
            <Route
              path="/sa_login"
              element={
                  <SuperAdminLogin />
              }
            />
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
