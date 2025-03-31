import "express-session";

declare module "express-session" {
  interface SessionData {
    JWT_userID?: string;
    token?: string;
    userId?: string;
  }
}
