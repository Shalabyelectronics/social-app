import React, { useState, useRef, useContext } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { Image as ImageIcon, X, Send, Globe, Users, Lock } from "lucide-react";
import { CreateUserPostsService } from "../../services/postServices";
import { AuthContext } from "../AuthContext/AuthContextProvider";
import { toast } from "react-toastify";

export default function PostCreation({ onCreatePost }) {
  const [body, setBody] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [privacy, setPrivacy] = useState("public");
  const { token, user, userPhoto } = useContext(AuthContext);

  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      setIsModalOpen(true);
    }
  };

  const handleConfirmImage = () => {
    setIsModalOpen(false);
  };

  const handleCancelImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setBody("");
    handleRemoveImage();
    setIsModalOpen(false);
    setPrivacy("public");
  };

  const handleSubmit = async () => {
    if (!body.trim() && !selectedFile) return;
    setIsUploading(true);
    try {
      await CreateUserPostsService(token, {
        body,
        image: selectedFile,
        privacy,
      });
      resetForm();
      onCreatePost?.();
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Card className="w-full shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
        <CardBody className="px-5 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={userPhoto || "https://via.placeholder.com/80?text=😏"}
                alt={user?.name || "User"}
                size="md"
                className="ring-2 ring-[#5E17EB] ring-offset-2 flex-shrink-0"
              />

              <div className="leading-tight mt-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {user?.name || "Anonymous hottie"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.username ? `@${user.username}` : "@default_user"}
                </p>
              </div>
            </div>

            <div className="flex-grow">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 text-lg min-h-[60px] placeholder:text-gray-400 mt-2"
                rows={Math.max(2, body.split("\n").length)}
              />

              {previewUrl && !isModalOpen && (
                <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[300px]">
                  <img
                    src={previewUrl}
                    alt="Post preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-[#FF3131] transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardBody>

        <Divider />

        <CardFooter className="px-5 py-3 flex flex-wrap justify-between items-center gap-2 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 sm:gap-2 text-[#5E17EB] hover:text-[#FF3131] font-medium px-2 sm:px-3 py-2 rounded-lg hover:bg-[#5E17EB]/10 transition-colors"
            >
              <ImageIcon size={20} />
              <span className="text-sm hidden sm:inline">Photo</span>
            </button>

            <Select
              size="sm"
              selectedKeys={[privacy]}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-32 sm:w-36 md:w-40"
              aria-label="Post privacy"
              startContent={
                privacy === "public" ? (
                  <Globe size={16} />
                ) : privacy === "following" ? (
                  <Users size={16} />
                ) : (
                  <Lock size={16} />
                )
              }
            >
              <SelectItem
                key="public"
                value="public"
                startContent={<Globe size={16} />}
              >
                Public
              </SelectItem>
              <SelectItem
                key="following"
                value="following"
                startContent={<Users size={16} />}
              >
                Followers
              </SelectItem>
              <SelectItem
                key="only_me"
                value="only_me"
                startContent={<Lock size={16} />}
              >
                Only Me
              </SelectItem>
            </Select>
          </div>

          <Button
            className="bg-[#5E17EB] hover:bg-[#FF3131] text-white font-medium rounded-full px-6 transition-colors shadow-md"
            endContent={<Send size={16} />}
            isLoading={isUploading}
            isDisabled={!body.trim() && !selectedFile}
            onClick={() => handleSubmit()}
          >
            Post
          </Button>
        </CardFooter>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onClose={handleCancelImage}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-gray-900 dark:text-white">
                Image Preview
              </ModalHeader>
              <ModalBody>
                {previewUrl && (
                  <div className="w-full flex justify-center rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <img
                      src={previewUrl}
                      alt="Selected upload"
                      className="max-h-[400px] object-contain"
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleCancelImage}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#5E17EB] text-white"
                  onPress={handleConfirmImage}
                >
                  Confirm Image
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
