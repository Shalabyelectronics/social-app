import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Spinner } from "@heroui/react";
import { AuthContext } from "../AuthContext/AuthContextProvider";
import PostCard from "../PostCard/PostCard";
import CommentsList from "../CommentsList/CommentsList";
import { postDetailsService } from "../../services/postServices";
import { getCommentsService } from "../../services/commentsServices";
import CommentCreation from "../CommentCreation/CommentCreation";
import { createCommentService } from "../../services/commentsServices";
import { toast } from "react-toastify";

export default function PostDetails() {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [, setIsLoadingCreateCommet] = useState(false);

  useEffect(() => {
    const getPostDetails = async () => {
      // Don't fetch if no token (user not logged in yet)
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await postDetailsService(token, id);
        setPost(response.data.data.post);
      } catch (error) {
        // Don't log 401 errors (user will be redirected to login)
        if (error.response?.status !== 401) {
          console.error(error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getPostDetails();
  }, [token, id]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!id || !token) return;
      try {
        // Use different loading state based on whether it's initial load or loading more
        if (commentsPage === 1) {
          setIsLoadingComments(true);
        } else {
          setIsLoadingMoreComments(true);
        }

        const response = await getCommentsService(token, id, commentsPage, 2);
        const newComments = response.data.data.comments;

        if (commentsPage === 1) {
          setComments(newComments);
        } else {
          setComments((prev) => [...prev, ...newComments]);
        }

        const totalPages = response.data.meta.pagination.numberOfPages;
        if (commentsPage >= totalPages) {
          setHasMoreComments(false);
        }
      } catch (error) {
        // Don't log 401 errors (user will be redirected to login)
        if (error.response?.status !== 401) {
          console.error("Error fetching comments:", error);
        }
      } finally {
        setIsLoadingComments(false);
        setIsLoadingMoreComments(false);
      }
    };
    fetchComments();
  }, [token, id, commentsPage]);

  const refreshComments = async () => {
    if (!id || !token) return;
    try {
      setIsLoadingComments(true);
      const response = await getCommentsService(token, id, 1, 10);
      const newComments = response.data.data.comments;
      setComments(newComments);
      setCommentsPage(1);
      setHasMoreComments(true);
    } catch (error) {
      // Don't log 401 errors (user will be redirected to login)
      if (error.response?.status !== 401) {
        console.error("Error refreshing comments:", error);
      }
    } finally {
      setIsLoadingComments(false);
    }
  };

  const onCreateComment = async (payLoad) => {
    try {
      setIsLoadingCreateCommet(true);
      await createCommentService(token, payLoad, id);
      toast.success("Comment created successfully!");

      // Refresh comments after successful creation
      await refreshComments();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Can't create comment, try again later!",
      );
      console.error("Error on creating a comment", error);
    } finally {
      setIsLoadingCreateCommet(false);
    }
  };
  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
          <PostCard post={post} isDetailsView={true} />
          <CommentCreation
            currentUser={user}
            onCreateComment={onCreateComment}
          />

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Comments ({comments.length})
            </h3>
            {isLoadingComments ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : (
              <>
                <CommentsList
                  comments={comments}
                  postID={id}
                  onRefetch={refreshComments}
                  isDetailsView={true}
                  isLoadingMore={isLoadingMoreComments}
                />
                {hasMoreComments && !isLoadingMoreComments && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    onClick={() => setCommentsPage((prev) => prev + 1)}
                    className="w-full mt-4"
                  >
                    Load More Comments
                  </Button>
                )}
              </>
            )}
          </div>

          <Button
            color="primary"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            ← Back to Feed
          </Button>
        </div>
      )}
    </>
  );
}
