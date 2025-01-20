import "express-session";

declare module "express-session" {
  interface SessionData {
    token?: string; // เพิ่ม token ใน SessionData
    userId?: string; // สามารถเพิ่ม property อื่นได้
  }
}
