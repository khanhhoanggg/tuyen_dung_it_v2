import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

const SALT_ROUNDS = 10;

export const hashPassword = async (plainPassword: string) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
  tokenVersion: number;
};

export const generateAccessToken = (payload: AccessTokenPayload) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Missing ACCESS_TOKEN_SECRET in environment variables");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "15m",
  } as SignOptions);
};

export const generateRefreshToken = (payload: AccessTokenPayload) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Missing REFRESH_TOKEN_SECRET in environment variables");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  } as SignOptions);
};

export const verifyAccessToken = (token: string) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Missing ACCESS_TOKEN_SECRET in environment variables");
  }

  return jwt.verify(token, secret) as AccessTokenPayload;
};
