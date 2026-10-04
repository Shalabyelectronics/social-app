import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Tooltip,
  Divider,
  Spinner,
  Button,
  Modal,
  ModalContent,
} from "@heroui/react";
import {
  Heart,
  MessageCircle,
  Repeat,
  Bookmark,
  Globe,
  LockIcon,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formattedDate } from "../../lib/tools";
import CommentsList from "../CommentsList/CommentsList";
import {
  bookmarkPostService,
  deletePostService,
  likePostService,
  sharePostService,
} from "../../services/postServices";
import { followUserService } from "../../services/userServices";
import SharePostModal from "../SharePostModal/SharePostModal";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext/AuthContextProvider";
import { FeedContext } from "../FeedContext/FeedContextProvider";
import UserPostSetting from "./../UserPostSetting/UserPostSetting";
import DeletePostModal from "../DeletePostModal/DeletePostModal";
import EditPostModal from "../EditPostModal/EditPostModal";
import {
  postDetailsService,
  updatePostService,
} from "../../services/postServices";

export default function PostCard({
  post,
  isDetailsView,
  onRefetch,
  onUnbookmark,
}) {
  const navigate = useNavigate();

  const {
    token,
    user: currentUser,
    refreshUserProfile,
  } = useContext(AuthContext);
  const { refreshBookmarkCount } = useContext(FeedContext);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likesCount || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const currentUserId = currentUser?.id || currentUser?._id;
  const postOwnerId = post?.user?._id || post?.user?.id;
  const isOwner = Boolean(
    currentUserId && postOwnerId && currentUserId === postOwnerId,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  const handleOpenImagePreview = (imageUrl) => {
    if (!imageUrl) return;
    setPreviewImageUrl(imageUrl);
    setIsImagePreviewOpen(true);
  };

  const handleCloseImagePreview = () => {
    setIsImagePreviewOpen(false);
    setPreviewImageUrl("");
  };

  useEffect(() => {
    const userId = currentUser?.id || currentUser?._id;
    const likes = post?.likes || [];
    setIsLiked(userId ? likes.includes(userId) : false);
    setLikeCount(post?.likesCount ?? likes.length ?? 0);
    setIsBookmarked(Boolean(post?.bookmarked));

    // Check localStorage for follow status since API doesn't return it in posts feed
    const followedUsers = JSON.parse(
      localStorage.getItem("followedUsers") || "{}",
    );
    const postUserId = post?.user?._id || post?.user?.id;
    setIsFollowing(Boolean(followedUsers[postUserId]));
  }, [post, currentUser]);

  const handleShare = async ({ postId, body }) => {
    try {
      await sharePostService(token, postId, body);
      toast.success("Post shared successfully!");
      onRefetch?.();
    } catch (error) {
      // Handle specific error codes
      if (error.response?.status === 409) {
        toast.error("You already shared this post!");
      } else {
        toast.error(error.response?.data?.message || "Failed to share post");
      }
      console.error("Share error:", error);
      throw error; // so modal keeps loading behavior consistent
    }
  };

  const getPostDetails = () => {
    if (!isDetailsView) {
      navigate(`/post/${post._id}`, { replace: true });
    } else {
      console.log("show comments");
    }
  };

  const toggleLikePostHandler = async () => {
    if (isLikeLoading) return;
    setIsLikeLoading(true);
    try {
      const response = await likePostService(token, post._id);
      const { liked, likesCount } = response.data.data;

      setIsLiked(liked); // Use response to set correct state
      setLikeCount(likesCount); // Use response to set correct count

      toast.success(liked ? "You Liked this post 🎉" : "You unLiked this post");
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Failed to update like status");
    } finally {
      setIsLikeLoading(false);
    }
  };
  const toggleBookmarkPostHandler = async () => {
    if (isBookmarkLoading) return;
    setIsBookmarkLoading(true);
    try {
      const response = await bookmarkPostService(token, post._id);

      const { bookmarked } = response.data.data;

      setIsBookmarked(bookmarked);

      toast.success(
        bookmarked
          ? "You Bookmarked this post 🎉"
          : "You unBookmarked this post",
      );

      refreshBookmarkCount?.();

      // If unbookmarking and callback provided, notify parent to remove from list
      if (!bookmarked && onUnbookmark) {
        onUnbookmark();
      }
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Failed to update bookmark status");
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const postUser = post?.user || {};

  const handleFollowClick = async () => {
    if (followLoading || !postUser?._id) return;
    setFollowLoading(true);
    try {
      const response = await followUserService(token, postUser._id);
      const { following: newFollowStatus } = response.data.data;

      // Update state
      setIsFollowing(newFollowStatus);

      // Update localStorage to persist follow status
      const followedUsers = JSON.parse(
        localStorage.getItem("followedUsers") || "{}",
      );
      const postUserId = postUser._id || postUser.id;

      if (newFollowStatus) {
        followedUsers[postUserId] = true;
      } else {
        delete followedUsers[postUserId];
      }

      localStorage.setItem("followedUsers", JSON.stringify(followedUsers));

      // Refresh user profile to update following count
      refreshUserProfile?.();

      toast.success(
        newFollowStatus
          ? `You are now following ${postUser.name} 🎉`
          : `You unfollowed ${postUser.name}`,
      );
    } catch (error) {
      console.error("Follow error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update follow status",
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (isDeleteLoading) return;

    setIsDeleteLoading(true);
    try {
      await deletePostService(token, post._id);
      toast.success("Post deleted successfully ✅");

      setIsDeleteOpen(false);

      onRefetch?.();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete post");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleUpdate = async ({ postId, body, image, privacy }) => {
    try {
      // Build payload for your update service
      // If your backend supports removing image via empty string or specific field,
      // adjust here.
      const payload = {
        body,
        image,
        privacy,
      };

      // If you KNOW your API supports remove:
      // payload.removeImage = removeImage;

      await updatePostService(token, postId, payload);

      toast.success("Post updated successfully ✅");
      onRefetch?.();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update post");
      throw error; // keeps modal consistent if you want to keep it open
    }
  };

  const showTopComment = post?.topComment ? [post.topComment] : [];
  const textPostBackgrounds = [
    "bg-gradient-to-br from-violet-600 to-purple-600",
    "bg-gradient-to-br from-pink-500 to-rose-600",
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-cyan-500 to-blue-600",
    "bg-gradient-to-br from-emerald-500 to-teal-600",
    "bg-gradient-to-br from-orange-500 to-red-500",
    "bg-gradient-to-br from-fuchsia-500 to-purple-600",
    "bg-gradient-to-br from-slate-600 to-gray-800",
  ];

  const getStableBackgroundClass = (postId) => {
    const idAsString = String(postId || "fallback");
    let hash = 0;

    for (let index = 0; index < idAsString.length; index += 1) {
      hash = (hash * 31 + idAsString.charCodeAt(index)) >>> 0;
    }

    return textPostBackgrounds[hash % textPostBackgrounds.length];
  };

  const isTextOnlyPost = Boolean(post?.body && !post?.image);
  const textPostBackgroundClass = getStableBackgroundClass(
    post?._id || post?.id,
  );

  // Early return only after every hook has run, so the hook order never changes
  if (!post) return null;

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
      <CardHeader className="flex justify-between items-center px-5 pt-5 pb-3">
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate(`/users/${postUser._id || postUser.id}`)}
        >
          <Avatar
            src={postUser?.photo || "https://placehold.co/80x80?text=User"}
            alt={postUser?.name || "User"}
            size="md"
            className="ring-2 ring-pink-500 ring-offset-2"
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {postUser?.name || "Anonymous hottie"}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>
                {postUser?.username ? `@${postUser.username}` : "@default_user"}
              </p>
              <p className="text-[10px] md:text-sm mt-1">
                {post?.createdAt
                  ? new Date(post.createdAt)
                      .toLocaleString("en-GB", formattedDate)
                      .replace(/\//g, "-")
                      .replace(", ", " | ")
                  : "Just now"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 items-center">
          {!isOwner && (
            <Button
              size="sm"
              color={isFollowing ? "default" : "primary"}
              variant={isFollowing ? "bordered" : "solid"}
              onPress={handleFollowClick}
              isLoading={followLoading}
              isDisabled={followLoading}
              className="mr-2"
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
          <Tooltip
            content={
              post?.privacy === "public"
                ? "Public"
                : post?.privacy === "following"
                  ? "Followers Only"
                  : post?.privacy === "only_me"
                    ? "Only Me"
                    : "Unknown"
            }
          >
            <span>
              {post?.privacy === "public" ? (
                <Globe size={16} className="text-blue-500" />
              ) : post?.privacy === "following" ? (
                <Users size={16} className="text-green-500" />
              ) : post?.privacy === "only_me" ? (
                <LockIcon size={16} className="text-orange-500" />
              ) : (
                <Globe size={16} className="text-default-400" />
              )}
            </span>
          </Tooltip>
          <Tooltip content={"Edit/delete your post"}>
            <span>
              {isOwner && (
                <UserPostSetting
                  onEdit={() => setIsEditOpen(true)}
                  onDelete={() => setIsDeleteOpen(true)}
                />
              )}
            </span>
          </Tooltip>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="px-5 py-4">
        {post?.body && !isTextOnlyPost && (
          <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
            {post.body}
          </p>
        )}

        {isTextOnlyPost && (
          <div
            className={`mb-4 rounded-2xl min-h-52 md:min-h-64 flex items-center justify-center p-6 md:p-10 ${textPostBackgroundClass}`}
          >
            <p className="text-white text-lg md:text-2xl font-semibold leading-relaxed text-center whitespace-pre-wrap wrap-break-word">
              {post.body}
            </p>
          </div>
        )}

        {post?.image && (
          <button
            type="button"
            onClick={() => handleOpenImagePreview(post.image)}
            className="w-full rounded-lg overflow-hidden mb-4 border border-gray-200 dark:border-gray-700 cursor-zoom-in"
            aria-label="Preview full post image"
          >
            <img
              src={post.image}
              alt="post media"
              className="w-full h-auto max-h-125 object-cover hover:scale-[1.02] transition-transform duration-500"
            />
          </button>
        )}

        {post?.isShare && post?.sharedPost && (
          <div className="mt-4 p-4 border-l-4 border-pink-500 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Shared post from @
              {post.sharedPost?.user?.username || "mystery lover"}
            </p>
            {post.sharedPost?.body && (
              <p className="mb-3">{post.sharedPost.body}</p>
            )}
            {post.sharedPost?.image && (
              <button
                type="button"
                onClick={() => handleOpenImagePreview(post.sharedPost.image)}
                className="rounded-lg max-h-64 overflow-hidden cursor-zoom-in"
                aria-label="Preview full shared post image"
              >
                <img
                  src={post.sharedPost.image}
                  alt="shared media"
                  className="rounded-lg max-h-64 object-cover"
                />
              </button>
            )}
          </div>
        )}
      </CardBody>

      <CardFooter className="px-5 py-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex gap-6 text-sm">
          <button
            className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer"
            onClick={toggleLikePostHandler}
            disabled={isLikeLoading}
            aria-busy={isLikeLoading}
          >
            <span className="inline-flex w-4 h-4 items-center justify-center">
              {isLikeLoading ? (
                <Spinner size="sm" color="danger" />
              ) : (
                <Heart
                  size={16}
                  fill={isLiked ? "currentColor" : "none"}
                  className={isLiked ? "text-red-500" : "text-gray-500"}
                />
              )}
            </span>

            <span className={isLiked ? "text-red-500" : ""}>
              {likeCount || 0}
            </span>
          </button>
          <button
            className="flex items-center gap-1.5 hover:text-pink-600 transition-colors cursor-pointer"
            onClick={() => getPostDetails()}
          >
            <MessageCircle size={16} /> <span>{post?.commentsCount || 0}</span>
          </button>
          <button
            className="flex items-center gap-1.5 hover:text-pink-600 transition-colors cursor-pointer"
            onClick={() => setIsShareOpen(true)}
          >
            <Repeat size={16} /> <span>{post?.sharesCount || 0}</span>
          </button>
        </div>

        <button
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-600 cursor-pointer transition-colors"
          onClick={toggleBookmarkPostHandler}
          disabled={isBookmarkLoading}
          aria-busy={isBookmarkLoading}
        >
          {isBookmarkLoading ? (
            <Spinner size="sm" />
          ) : (
            <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
          )}
        </button>
      </CardFooter>
      {!isDetailsView && showTopComment.length > 0 && (
        <>
          <Divider />
          <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-900/30">
            <CommentsList
              comments={showTopComment}
              postID={post._id}
              isDetailsView={isDetailsView}
            />
          </div>
        </>
      )}
      <SharePostModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onShare={handleShare}
        post={post}
      />
      <DeletePostModal
        isOpen={isDeleteOpen}
        onClose={() => !isDeleteLoading && setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleteLoading}
      />
      <EditPostModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        postId={post._id}
        token={token}
        fetchPostDetails={postDetailsService}
        onUpdate={handleUpdate}
      />

      <Modal
        isOpen={isImagePreviewOpen}
        onClose={handleCloseImagePreview}
        size="5xl"
        backdrop="blur"
        placement="center"
      >
        <ModalContent>
          <div className="relative bg-black/95 rounded-xl p-2 md:p-4 flex items-center justify-center">
            <button
              type="button"
              onClick={handleCloseImagePreview}
              className="absolute top-3 right-3 z-10 bg-white/90 text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-white"
              aria-label="Close image preview"
            >
              ✕
            </button>

            {previewImageUrl && (
              <img
                src={previewImageUrl}
                alt="Full post preview"
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
            )}
          </div>
        </ModalContent>
      </Modal>
    </Card>
  );
}
