import * as z from "zod";
import NotFound from "./../../pages/NotFound/NotFound";

export const registerSchema = z
  .object({
    name: z
      .string()
      .nonempty("Name is required")
      .min(3, "Chars not less than 3 charectors")
      .max(20, "Chars not exceed 5 charectors"),
    username: z
      .string()
      .nonempty("Username is required")
      .min(3, "Chars not less than 3 charectors")
      .max(15, "Char not exceed 10 chars."),
    email: z.string().nonempty("Email is required").email("Invalid email"),
    password: z
      .string()
      .nonempty("Password is required")
      .min(4, "Password not less than 4 digts")
      .max(10, "Password not exceed 10 digits"),
    rePassword: z.string().nonempty("Password is required"),
    dateOfBirth: z.preprocess(
      (value) =>
        value && typeof value.toString === "function" ? value.toString() : "",
      z
        .string()
        .nonempty("Date of birth is required")
        .refine((userDate) => {
          const userYear = new Date(userDate).getFullYear();
          const currentYear = new Date().getFullYear();
          const age = currentYear - userYear;
          return age >= 18;
        }, "Your age must be 18 or above"),
    ),
    gender: z.string().nonempty("Gender is required"),
  })
  .refine((data) => data.password === data.rePassword, {
    path: ["rePassword"],
    message: "Passwords not matched",
  });

// No max length here: Change Password allows long passwords, and a cap would lock those users out
export const loginSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid Email"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(4, "Password not less than 4 digts"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().nonempty("Current password is required."),
    password: z
      .string()
      .nonempty("New password is required.")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Your password must be at least 8 characters and include: 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
      ),
    rePassword: z.string().nonempty("Password confirmation is required."),
  })
  .refine((data) => data.password === data.rePassword, {
    path: ["rePassword"],
    message: "Passwords do not match.",
  });
