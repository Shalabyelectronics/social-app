import React, { useContext, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
} from "@heroui/react";
import { Eye, EyeOff, Lock, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "../../lib/validationSchemas/authSchema";
import { changePasswordService } from "../../services/authServices";
import { AuthContext } from "../AuthContext/AuthContextProvider";
import { toast } from "react-toastify";
import { isDemoUser } from "../../lib/demo";

export default function ChangePassword() {
  const [isVisibleCurrent, setIsVisibleCurrent] = useState(false);
  const [isVisibleNew, setIsVisibleNew] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const { token, setToken, user } = useContext(AuthContext);
  // Visitors share the demo account, so one of them must not lock out the rest
  const isDemo = isDemoUser(user);

  const toggleVisibilityCurrent = () => setIsVisibleCurrent(!isVisibleCurrent);
  const toggleVisibilityNew = () => setIsVisibleNew(!isVisibleNew);
  const toggleVisibilityConfirm = () => setIsVisibleConfirm(!isVisibleConfirm);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      password: "",
      rePassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Please login first");
      return;
    }
    if (isDemo) {
      toast.info("Password changes are turned off for the demo account");
      return;
    }

    try {
      const response = await changePasswordService(token, {
        password: data.currentPassword,
        newPassword: data.password,
      });

      // Update token with new one from response
      const newToken = response.data.data.token;
      setToken(newToken);

      toast.success("Password changed successfully! 🎉");
      reset();
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <Card className="w-full max-w-[600px] shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl">
      <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-4">
        <div className="p-4 bg-[#5E17EB]/10 rounded-full mb-2">
          <KeyRound size={32} className="text-[#5E17EB]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          Change Password
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Secure your account with a new password
        </p>
        {isDemo && (
          <p className="text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg px-4 py-2 text-center">
            You're using the shared demo account, so password changes are
            turned off.
          </p>
        )}
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardBody className="flex flex-col gap-6 py-4 px-8">
          <div>
            <Input
              {...register("currentPassword")}
              label="Current Password"
              variant="bordered"
              placeholder="Enter your current password"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibilityCurrent}
                >
                  {isVisibleCurrent ? (
                    <EyeOff className="text-xl text-gray-400 pointer-events-none" />
                  ) : (
                    <Eye className="text-xl text-gray-400 pointer-events-none" />
                  )}
                </button>
              }
              startContent={<Lock className="text-gray-400" size={18} />}
              type={isVisibleCurrent ? "text" : "password"}
              className="w-full"
              isInvalid={!!errors.currentPassword}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <Input
              {...register("password")}
              label="New Password"
              variant="bordered"
              placeholder="Enter your new password"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibilityNew}
                >
                  {isVisibleNew ? (
                    <EyeOff className="text-xl text-gray-400 pointer-events-none" />
                  ) : (
                    <Eye className="text-xl text-gray-400 pointer-events-none" />
                  )}
                </button>
              }
              startContent={<Lock className="text-gray-400" size={18} />}
              type={isVisibleNew ? "text" : "password"}
              className="w-full"
              isInvalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Input
              {...register("rePassword")}
              label="Confirm New Password"
              variant="bordered"
              placeholder="Confirm your new password"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibilityConfirm}
                >
                  {isVisibleConfirm ? (
                    <EyeOff className="text-xl text-gray-400 pointer-events-none" />
                  ) : (
                    <Eye className="text-xl text-gray-400 pointer-events-none" />
                  )}
                </button>
              }
              startContent={<Lock className="text-gray-400" size={18} />}
              type={isVisibleConfirm ? "text" : "password"}
              className="w-full"
              isInvalid={!!errors.rePassword}
            />
            {errors.rePassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.rePassword.message}
              </p>
            )}
          </div>
        </CardBody>

        <CardFooter className="px-8 pb-8 pt-4">
          <Button
            type="submit"
            isLoading={isSubmitting}
            isDisabled={isDemo}
            className="w-full bg-[#5E17EB] hover:bg-[#FF3131] text-white font-medium py-6 rounded-xl transition-colors duration-300 shadow-md text-md"
          >
            Update Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
