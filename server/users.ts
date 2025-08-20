"use server";

import { auth } from "@/lib/auth";

export const signIn = async () => {
  await auth.api.signInEmail({
    body: {
      email: "user@example.com",
      password: "password",
    },
  });
};
export const signUp = async () => {
  await auth.api.signUpEmail({
    body: {
      email: "user@example.com",
      password: "password",
      name: "User Name",
    },
  });
};
