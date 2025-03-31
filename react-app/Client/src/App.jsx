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
import AllCourse from "./pages/emp/AllCourse";
import RegisteredCourse from "./pages/emp/RegisteredCourse";
import AdminLayout from "./layout/admin/AdminLayout";
import SuperAdminLayout from "./layout/superadmin/SaAdminLayout";

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
              path="/courses"
              element={
                <EmpLayout>
                  <AllCourse />
                </EmpLayout>
              }
            />
            <Route
              path="/register_courses"
              element={
                <EmpLayout>
                  <RegisteredCourse />
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
                <SuperAdminLayout>
                  <SuperAdminDashboard />
                </SuperAdminLayout>
              }
            />
            <Route
              path="/all_list"
              element={
                <SuperAdminLayout>
                  <SaEmpList />
                </SuperAdminLayout>
              }
            />
            <Route
              path="/Saadmin_list"
              element={
                <SuperAdminLayout>
                  <SaAdminList />
                </SuperAdminLayout>
              }
            />
          </Routes>
        </UserProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
