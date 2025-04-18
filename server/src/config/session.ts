// server/src/config/session.ts
import session from "express-session";
import MongoStore from "connect-mongo";
import { config } from "./env";

export const sessionConfig: session.SessionOptions = {
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.MONGODB_URI,
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: "native",
  }),
  cookie: {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "strict",
  },
};
