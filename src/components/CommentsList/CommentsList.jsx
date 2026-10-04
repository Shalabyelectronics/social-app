import React, { useContext, useEffect, useState } from "react";
import { Avatar, Divider, Skeleton, Modal, ModalContent } from "@heroui/react";
import { Heart, MessageSquare } from "lucide-react";
import CommentReplyCreation from "../CommentReplyForm/CommentReplyForm";
import {
  createCommentReplyService,
  likeCommentService,
  deleteCommentService,
} from "../../services/commentsServices";
import { AuthContext } from "../AuthContext/AuthContextProvider";
import CommentRepliesList from "../CommentRepliesList/CommentRepliesList";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EditCommentModal from "../EditCommentModal/EditCommentModal";
import DeleteCommentModal from "../DeleteCommentModal/DeleteCommentModal";
import CommentSettings from "../CommentSettings/CommentSettings";

export default function CommentsList({
  comments,
  postID,
  onRefetch,
  isDetailsView,
  isLoadingMore,
}) {
  const { token, user } = useContext(AuthContext);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [openRepliesId, setOpenRepliesId] = useState(null);
  const [isLoadingReplyForId, setIsLoadingReplyForId] = useState(null);
  const [likedByCommentId, setLikedByCommentId] = useState({});
  const [likeCountByCommentId, setLikeCountByCommentId] = useState({});
  const navigate = useNavigate();

  // Modal states for edit/delete
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    if (!comments) return;
    const likedMap = {};
    const countMap = {};
    comments.forEach((comment) => {
      const likes = comment.likes || [];
      const userId = user?.id || user?._id;
      likedMap[comment._id] = userId ? likes.includes(userId) : false;
      countMap[comment._id] = comment.likesCount ?? likes.length ?? 0;
    });
    setLikedByCommentId(likedMap);
    setLikeCountByCommentId(countMap);
  }, [comments, user]);

  // Early return only after every hook has run, so the hook order never changes
  if (!comments || comments.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4 text-center italic">
        No comments yet. Be the first to share your thoughts!
      </div>
    );
  }

  const formatCommentDate = (dateString) => {
    return new Date(dateString)
      .toLocaleString("en-GB", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      .replace(/\//g, "-")
      .replace(", ", " | ");
  };

  const toggleLikeCommentHandler = async (commentId) => {
    try {
      const response = await likeCommentService(token, postID, commentId);
      const { liked, likesCount } = response.data.data;

      setLikedByCommentId((prev) => ({ ...prev, [commentId]: liked }));
      setLikeCountByCommentId((prev) => ({ ...prev, [commentId]: likesCount }));

      toast.success(
        liked ? "You Liked this comment 🎉" : "You unLiked this comment",
      );
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Failed to update like status");
    }
  };

  // Check if user is the owner of a comment
  const isCommentOwner = (comment) => {
    const userId = user?.id || user?._id;
    const creatorId = comment.commentCreator?._id || comment.commentCreator?.id;
    return userId && creatorId && userId === creatorId;
  };

  // Handle edit comment
  const handleEditComment = (comment) => {
    setSelectedComment(comment);
    setEditModalOpen(true);
  };

  // Handle delete comment
  const handleDeleteComment = (comment) => {
    setSelectedComment(comment);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDeleteComment = async () => {
    if (!selectedComment) return;

    setIsDeleting(true);
    try {
      await deleteCommentService(token, postID, selectedComment._id);
      toast.success("Comment deleted successfully! 🗑️");
      setDeleteModalOpen(false);
      setSelectedComment(null);
      onRefetch?.(); // Refresh comments list
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error(error.response?.data?.message || "Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 mt-2 px-1">
      {comments.map((comment, index) => (
        <div key={comment._id} className="flex flex-col gap-1.5">
          <div className="flex gap-3 items-start">
            <Avatar
              src={
                comment.commentCreator?.photo ||
                "https://via.placeholder.com/40"
              }
              alt={comment.commentCreator?.name || "User"}
              size="sm"
              className="ring-2 ring-[#5E17EB] ring-offset-1 shrink-0 mt-1 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() =>
                navigate(
                  `/users/${comment.commentCreator?._id || comment.commentCreator?.id}`,
                )
              }
            />
            <div className="flex flex-col w-full">
              <div className="bg-gray-100 dark:bg-gray-800/80 p-3 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="font-bold text-sm text-gray-900 dark:text-white cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      navigate(
                        `/users/${comment.commentCreator?._id || comment.commentCreator?.id}`,
                      )
                    }
                  >
                    {comment.commentCreator?.name || "Anonymous"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 font-medium">
                      {formatCommentDate(comment.createdAt)}
                    </span>
                    {isCommentOwner(comment) && (
                      <CommentSettings
                        onEdit={() => handleEditComment(comment)}
                        onDelete={() => handleDeleteComment(comment)}
                      />
                    )}
                  </div>
                </div>
                {/* Comment Text */}
                {comment.content && (
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}

                {/* Comment Image */}
                {comment.image && (
                  <button
                    type="button"
                    onClick={() => handleOpenImagePreview(comment.image)}
                    className="mt-2 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-zoom-in"
                    aria-label="Preview full comment image"
                  >
                    <img
                      src={comment.image}
                      alt="comment media"
                      className="w-full max-h-60 object-cover"
                    />
                  </button>
                )}
              </div>

              <div className="flex gap-4 mt-1.5 ml-2 text-xs text-gray-500 font-medium">
                {comment.repliesCount > 0 && (
                  <button
                    className="ml-2 mt-1 text-xs text-[#5E17EB] hover:underline"
                    onClick={() =>
                      setOpenRepliesId((prev) =>
                        prev === comment._id ? null : comment._id,
                      )
                    }
                  >
                    {openRepliesId === comment._id
                      ? "Hide replies"
                      : `View replies (${comment.repliesCount})`}
                  </button>
                )}
                <button
                  className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer"
                  onClick={() => toggleLikeCommentHandler(comment._id)}
                >
                  <Heart
                    size={14}
                    fill={
                      likedByCommentId[comment._id] ? "currentColor" : "none"
                    }
                    className={
                      likedByCommentId[comment._id]
                        ? "text-red-500"
                        : "text-gray-500"
                    }
                  />
                  <span
                    className={
                      likedByCommentId[comment._id] ? "text-red-500" : ""
                    }
                  >
                    {likeCountByCommentId[comment._id] || 0}
                  </span>
                </button>
                <button
                  className="flex items-center gap-1 hover:text-[#5E17EB] transition-colors cursor-pointer"
                  onClick={() => {
                    if (!isDetailsView) {
                      navigate(`/post/${postID}`, { replace: true });
                    } else {
                      setActiveReplyId((prev) =>
                        prev === comment._id ? null : comment._id,
                      );
                    }
                  }}
                >
                  <MessageSquare size={14} />{" "}
                  <span>{comment.repliesCount || 0} Reply</span>
                </button>
              </div>
            </div>
          </div>
          {activeReplyId === comment._id && (
            <CommentReplyCreation
              currentUser={user}
              onCancel={() => setActiveReplyId(null)}
              onSubmitReply={async (payload) => {
                try {
                  // Set loading state and keep replies open
                  setIsLoadingReplyForId(comment._id);
                  setOpenRepliesId(comment._id);

                  await createCommentReplyService(
                    token,
                    payload,
                    postID,
                    comment._id,
                  );

                  setActiveReplyId(null); // close reply box

                  // Trigger a refetch of this comment's replies by closing and reopening
                  // This shows the skeleton while replies are being fetched without blocking other comments
                  setOpenRepliesId(null);
                  setTimeout(() => {
                    setOpenRepliesId(comment._id);
                  }, 100);
                } catch (error) {
                  console.error("Error creating reply", error);
                  setIsLoadingReplyForId(null);
                } finally {
                  // Clear loading state after refetch completes
                  setTimeout(() => {
                    setIsLoadingReplyForId(null);
                  }, 500);
                }
              }}
            />
          )}
          <CommentRepliesList
            postId={postID}
            commentId={comment._id}
            isOpen={openRepliesId === comment._id}
            isLoadingReply={isLoadingReplyForId === comment._id}
          />
          {index !== comments.length - 1 && (
            <Divider className="my-2 ml-12 w-[calc(100%-3rem)] bg-gray-200 dark:bg-gray-700" />
          )}
        </div>
      ))}

      {/* Skeleton Loaders for Loading More Comments */}
      {isLoadingMore && (
        <>
          {[1, 2].map((skeleton) => (
            <div key={`skeleton-${skeleton}`} className="flex flex-col gap-1.5">
              <div className="flex gap-3 items-start">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex flex-col w-full gap-2">
                  <Skeleton className="w-32 h-4 rounded-lg" />
                  <div className="bg-gray-100 dark:bg-gray-800/80 p-3 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-700 space-y-2">
                    <Skeleton className="w-full h-4 rounded-lg" />
                    <Skeleton className="w-4/5 h-4 rounded-lg" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="w-8 h-4 rounded-lg" />
                    <Skeleton className="w-8 h-4 rounded-lg" />
                  </div>
                </div>
              </div>
              <Divider className="my-2 ml-12 w-[calc(100%-3rem)] bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </>
      )}

      {/* Edit Comment Modal */}
      <EditCommentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedComment(null);
        }}
        comment={selectedComment}
        postId={postID}
        token={token}
        onUpdate={() => {
          onRefetch?.(); // Refresh comments list after edit
        }}
      />

      {/* Delete Comment Modal */}
      <DeleteCommentModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedComment(null);
        }}
        onConfirm={confirmDeleteComment}
        isLoading={isDeleting}
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
                alt="Full comment preview"
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
            )}
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
