import { Request, Response, NextFunction } from "express";
import "express";

declare global {
  namespace Express {
    export interface Response {
      success(
        message: string,
        data?: any,
        nextStep?: string | null,
        icon?: "success" | "info" | "warning"
      ): void;
      error(
        statusCode: number,
        message: string,
        error?: any,
        nextStep?: string | null,
        icon?: "error" | "info" | "warning"
      ): void;
    }
  }
}

function formatResponse(req: Request, res: Response, next: NextFunction) {
  res.success = (
    message: string,
    data: any = null,
    nextStep?: string,
    icon: "success" | "info" | "warning" = "success"
  ) => {
    const response: any = {
      statusCode: 200,
      status: "success",
      icon,
      message,
      data,
    };

    if (nextStep && nextStep.trim() !== "") {
      response.nextStep = nextStep;
    }

    res.status(200).json(response);
  };

  res.error = (
    statusCode: number,
    message: string,
    error: any = null,
    nextStep?: string,
    icon: "error" | "info" | "warning" = "error"
  ) => {
    const response: any = {
      statusCode,
      status: "error",
      icon,
      message,
      error,
    };

    if (nextStep && nextStep.trim() !== "") {
      response.nextStep = nextStep;
    }

    res.status(statusCode).json(response);
  };

  next();
}

export default formatResponse;
