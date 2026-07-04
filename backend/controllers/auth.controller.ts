import { Request, Response } from "express";
import User from "../models/user.model";
import { registerSchema, loginSchema } from "../validates/auth.validate";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const { fullName, email, password, role } = value;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        code: "email_already_exists",
        message: "Email da duoc su dung",
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      code: "success",
      message: "Dang ky tai khoan thanh cong",
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const { email, password } = value;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        code: "invalid_credentials",
        message: "Email hoac mat khau khong dung",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        code: "invalid_credentials",
        message: "Email hoac mat khau khong dung",
      });
    }

    const tokenPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      code: "success",
      message: "Dang nhap thanh cong",
      data: {
        accessToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay nguoi dung",
      });
    }

    return res.status(200).json({
      code: "success",
      message: "Lay thong tin thanh cong",
      data: user,
    });
  } catch (err) {
    console.error("Get me error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};
