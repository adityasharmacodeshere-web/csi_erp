import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  studentId: string;
  enrollmentNo: string;
  name: string;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
  studentId: "",
  enrollmentNo: "",
  name: "",
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "bennett_campus_erp_super_secret_session_key_32chars_long_minimum",
  cookieName: "bennett_erp_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}
