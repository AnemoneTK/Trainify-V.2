// src/config/config.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserSchema from "../models/userSchema";
import CourseSchema from "../models/courseSchema";
import UserLogSchema from "../models/userLogSchema";
import LoginLogSchema from "../models/loginLogSchema";
import { encryptData, decryptData } from "./encryptionUtils";
import * as otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY || "TrainifyKey#CSI401";

export {
  Request,
  Response,
  bcrypt,
  jwt,
  JwtPayload,
  UserSchema,
  CourseSchema,
  UserLogSchema,
  LoginLogSchema,
  encryptData,
  decryptData,
  otpGenerator,
  nodemailer,
  JWT_SECRET,
};
