import { zodResolver } from "@hookform/resolvers/zod";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { LuEye } from "react-icons/lu";
import { LuEyeClosed } from "react-icons/lu";
import { useForm } from "react-hook-form";
import { loginSchema } from "../../../lib/validationSchemas/authSchema";
import { Input, Button } from "@heroui/react";
import { loginService } from "../../../services/authServices";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../../components/AuthContext/AuthContextProvider";
import { formatErrorMessage } from "../../../lib/tools";
import { demoCredentials } from "../../../lib/demo";

export default function Login() {
  const [isShowPass, setIsShowPass] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const submit = async (data) => {
    try {
      const response = await loginService(data);
      toast.success(response.data.message);
      setToken(response.data.data.token);
      navigate("/profile");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during login";
      toast.error(formatErrorMessage(errorMessage));
    }
  };

  // Fill the form with the shared demo account and log in
  const loginWithDemo = async () => {
    setValue("email", demoCredentials.email);
    setValue("password", demoCredentials.password);
    setIsDemoLoading(true);
    try {
      await submit(demoCredentials);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        Welcome to Our Social Media Login Form
      </h2>
      <p className="text-gray-500 text-base md:text-lg font-semibold mb-6">
        Please Fill In This Form To Login
      </p>
      <form onSubmit={handleSubmit(submit)} className="w-full">
        <div className="form-body w-full mb-8">
          <div className="min-h-[90px]">
            <Input
              {...register("email")}
              label="Email"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              type="email"
              variant="bordered"
              classNames={{
                inputWrapper: errors.email ? "border-red-600" : "",
              }}
            />
          </div>
          <div className="min-h-[90px]">
            <Input
              {...register("password")}
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              label="Password"
              type={isShowPass ? "text" : "password"}
              variant="bordered"
              endContent={
                isShowPass ? (
                  <LuEyeClosed
                    className="cursor-pointer text-[1.5rem] text-gray-500 hover:text-gray-700 transition-colors duration-300"
                    onClick={() => setIsShowPass(!isShowPass)}
                  />
                ) : (
                  <LuEye
                    className="cursor-pointer text-[1.5rem] text-gray-500 hover:text-gray-700 transition-colors duration-300"
                    onClick={() => setIsShowPass(!isShowPass)}
                  />
                )
              }
              classNames={{
                innerWrapper: errors.password ? "border-red-600" : "",
              }}
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            isDisabled={isDemoLoading}
            className="w-full text-center cursor-pointer hover:bg-blue-700 transition-colors duration-300 py-2 rounded-lg bg-blue-600 text-white"
          >
            Login
          </Button>
        </div>
      </form>
      {demoCredentials && (
        <div className="w-full -mt-4 mb-6">
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            or
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <Button
            type="button"
            variant="bordered"
            onPress={loginWithDemo}
            isLoading={isDemoLoading}
            isDisabled={isSubmitting}
            className="w-full py-2 rounded-lg border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors duration-300"
          >
            Try the demo
          </Button>
          <p className="text-center text-xs text-gray-500 mt-2">
            No sign-up needed. You'll use a shared demo account.
          </p>
        </div>
      )}
      <p className="text-center text-sm md:text-base pb-4">
        Please register if you do not have an account?{" "}
        <Link className="text-blue-600 font-semibold" to="/register">
          Register
        </Link>
      </p>
    </>
  );
}
