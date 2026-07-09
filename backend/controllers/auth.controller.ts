import { Request, Response } from "express";
import User from "../models/user.model";
import { registerSchema, loginSchema, resendVerificationSchema  } from "../validates/auth.validate";
import { sendVerificationEmail } from "../services/email.service";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateEmailVerificationToken,
  hashEmailVerificationToken,
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
    const { rawToken, hashedToken } = generateEmailVerificationToken();

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    try {
      await sendVerificationEmail(newUser.email, rawToken);
    } catch (mailErr) {
      console.error("Send verification email error:", mailErr);
      // Khong rollback user, chi log loi - user van co the request gui lai email sau
    }

    return res.status(201).json({
      code: "success",
      message: "Dang ky thanh cong, vui long kiem tra email de xac thuc tai khoan",
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
    if (!user.isEmailVerified) {
      return res.status(403).json({
        code: "email_not_verified",
        message: "Vui long xac thuc email truoc khi dang nhap",
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
export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        code: "no_refresh_token",
        message: "Khong tim thay refresh token",
      });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({
        code: "invalid_refresh_token",
        message: "Refresh token khong hop le hoac da het han",
      });
    }

    const user = await User.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        code: "invalid_refresh_token",
        message: "Refresh token khong con hieu luc",
      });
    }

    const newPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = generateAccessToken(newPayload);

    return res.status(200).json({
      code: "success",
      message: "Lam moi token thanh cong",
      data: { accessToken },
    });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await User.findByIdAndUpdate(payload.sub, {
          $inc: { tokenVersion: 1 },
        });
      } catch {
        // Token không hợp lệ thì bỏ qua, vẫn xoá cookie bên dưới
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      code: "success",
      message: "Dang xuat thanh cong",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        code: "missing_token",
        message: "Thieu token xac thuc",
      });
    }

    const hashedToken = hashEmailVerificationToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({
        code: "invalid_or_expired_token",
        message: "Token khong hop le hoac da het han",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      code: "success",
      message: "Xac thuc email thanh cong",
    });
  } catch (err) {
    console.error("Verify email error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { error, value } = resendVerificationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const { email } = value;
    const user = await User.findOne({ email });

    // Khong tiet lo email co ton tai hay khong, luon tra ve cung 1 thong diep
    const genericResponse = {
      code: "success",
      message:
        "Neu email ton tai va chua xac thuc, mot email xac thuc moi da duoc gui",
    };

    if (!user || user.isEmailVerified) {
      return res.status(200).json(genericResponse);
    }

    const { rawToken, hashedToken } = generateEmailVerificationToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(user.email, rawToken);
    } catch (mailErr) {
      console.error("Resend verification email error:", mailErr);
    }

    return res.status(200).json(genericResponse);
  } catch (err) {
    console.error("Resend verification error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};