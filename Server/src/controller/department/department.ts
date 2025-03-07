import { Request, Response } from "express";
import departmentSchema from "../../models/departmentSchema";
import { error } from "console";

const Department = departmentSchema;

const checkAdminRole = (req: Request, res: Response) => {
  const sessionData = req.session as any;
  if (!sessionData || !sessionData.user) {
    return res.error(401, "ไม่พบข้อมูลผู้ใช้", "กรุณาเข้าสู่ระบบใหม่");
  }
  const { role } = sessionData.user;
  if (role !== "admin" && role !== "super_admin") {
    return res.error(
      403,
      "คุณไม่มีสิทธิ์จัดการแผนก",
      "เฉพาะแอดมินเท่านั้นที่สามารถแก้ไขข้อมูลแผนกได้"
    );
  }
  return role;
};

export const createDepartment = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name)
    return res.error(400, "กรุณากรอกชื่อแผนก", "ชื่อแผนกต้องไม่เป็นค่าว่าง");

  const role = checkAdminRole(req, res);
  if (!role) return;

  try {
    const existingDept = await Department.findOne({ name });
    if (existingDept)
      return res.error(400, "แผนกนี้มีอยู่แล้ว", "กรุณากรอกชื่อแผนกใหม่");

    const newDepartment = new Department({ name });
    await newDepartment.save();
    return res.success("สร้างแผนกสำเร็จ", newDepartment);
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการสร้างแผนก",
      (error as Error).message
    );
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find({});
    return res.success("ดึงข้อมูลแผนกสำเร็จ", departments);
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการดึงข้อมูล",
      (error as Error).message
    );
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { id, name } = req.body;
  if (!id || !name) return res.error(400, "กรุณาระบุรหัสแผนกและชื่อแผนกใหม่");

  const role = checkAdminRole(req, res);
  if (!role) return;

  try {
    const department = await Department.findById(id);
    if (!department) return res.error(404, "ไม่พบแผนกที่ต้องการอัปเดต");

    department.name = name;
    await department.save();
    return res.success("อัปเดตข้อมูลแผนกสำเร็จ", department);
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการอัปเดตแผนก",
      (error as Error).message
    );
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) return res.error(400, "กรุณาระบุรหัสแผนกที่ต้องการลบ");

  const role = checkAdminRole(req, res);
  if (!role) return;

  try {
    const department = await Department.findByIdAndDelete(id);
    if (!department) return res.error(404, "ไม่พบแผนกที่ต้องการลบ");

    return res.success("ลบข้อมูลแผนกสำเร็จ");
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการลบแผนก",
      (error as Error).message
    );
  }
};
