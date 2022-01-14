import { createCookieSessionStorage, redirect } from "remix";
import { db } from "./db.server";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "MT_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getInviteeId(request: Request) {
  const session = await getUserSession(request);
  const inviteeId = session.get("inviteeId");
  if (!inviteeId || typeof inviteeId !== "string") return null;

  return inviteeId;
}

export async function createUserSession(inviteeId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("inviteeId", inviteeId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
