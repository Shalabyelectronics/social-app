import { DatePicker, Input, Select, SelectItem, Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { LuEye } from "react-icons/lu";
import { LuEyeClosed } from "react-icons/lu";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { registerSchema } from "../../../lib/validationSchemas/authSchema";
import { registerService } from "../../../services/authServices";
import { toast } from "react-toastify";
import { formatErrorMessage } from "../../../lib/tools";

export default function Register() {
  const [isShowPass, setIsShowPass] = useState(false);
  const [isShowRePass, setIsShowRePass] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      rePassword: "",
      dateOfBirth: null,
      gender: "",
    },
    resolver: zodResolver(registerSchema),
  });
  async function submit(data) {
    try {
      const response = await registerService(data);

      toast.success(response.data.message);
      console.log(response);

      navigate("/login");
    } catch (error) {
      const errorMSG =
        error.response?.data?.message ||
        "An error occurred during registration";

      toast.error(formatErrorMessage(errorMSG));
      if (errorMSG === "user already exists.") {
        navigate("/login");
      }
    } finally {
      console.log("Done from registration service");
    }
  }

  return (
    <>
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        Welcome to Our Social Media Registration Form
      </h2>
      <p className="text-gray-500 text-base md:text-lg font-semibold mb-6">
        Please Fill In This Form To create An Account
      </p>
      <form onSubmit={handleSubmit(submit)} className="w-full">
        <div className="form-body w-full mb-8">
          <div className="min-h-[90px]">
            <Input
              {...register("name")}
              label="Name"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              type="text"
              variant="bordered"
              classNames={{
                inputWrapper: errors.name ? "border-red-600" : "",
              }}
            />
          </div>
          <div className="min-h-[90px]">
            <Input
              {...register("username")}
              label="username"
              isInvalid={!!errors.username}
              errorMessage={errors.username?.message}
              type="text"
              variant="bordered"
              classNames={{
                inputWrapper: errors.username ? "border-red-600" : "",
              }}
            />
          </div>

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
          <div className="min-h-[90px]">
            <Input
              {...register("rePassword")}
              isInvalid={!!errors.rePassword}
              errorMessage={errors.rePassword?.message}
              label="Re-Password"
              type={isShowRePass ? "text" : "password"}
              variant="bordered"
              endContent={
                isShowRePass ? (
                  <LuEyeClosed
                    className="cursor-pointer text-[1.5rem] text-gray-500 hover:text-gray-700 transition-colors duration-300"
                    onClick={() => setIsShowRePass(!isShowRePass)}
                  />
                ) : (
                  <LuEye
                    className="cursor-pointer text-[1.5rem] text-gray-500 hover:text-gray-700 transition-colors duration-300"
                    onClick={() => setIsShowRePass(!isShowRePass)}
                  />
                )
              }
              classNames={{
                inputWrapper: errors.rePassword ? "border-red-600" : "",
              }}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-5 min-h-[90px] mb-6">
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  type="date"
                  isInvalid={!!errors.dateOfBirth}
                  errorMessage={errors.dateOfBirth?.message}
                  className="w-full md:max-w-[284px]"
                  classNames={{
                    inputWrapper: errors.dateOfBirth ? "border-red-600" : "",
                  }}
                  label="Birth date"
                />
              )}
            />
            <Select
              {...register("gender")}
              className="w-full md:max-w-xs"
              isInvalid={!!errors.gender}
              errorMessage={errors.gender?.message}
              classNames={{
                inputWrapper: errors.gender ? "border-red-600" : "",
              }}
              label="Select a gender"
            >
              <SelectItem key="male">Male</SelectItem>
              <SelectItem key="female">Female</SelectItem>
            </Select>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full text-center cursor-pointer hover:bg-blue-700 transition-colors duration-300 py-2 rounded-lg bg-blue-600 text-white"
          >
            Register
          </Button>
        </div>
      </form>
      <p className="text-center text-sm md:text-base pb-4">
        Already have an account?{" "}
        <Link className="text-blue-600 font-semibold" to="/login">
          Login
        </Link>
      </p>
    </>
  );
}
