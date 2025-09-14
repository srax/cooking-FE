"use client";

import {
  Comment,
  getTokenComments,
  likeThread,
  postThread,
  unlikeThread,
} from "@/api/thread";
import {
  addToast,
  Avatar,
  Button,
  Image,
  Spinner,
  Textarea,
} from "@heroui/react";
import moment from "moment";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FaArrowUp, FaHeart, FaRegHeart } from "react-icons/fa6";
import { IoCloseSharp, IoImageOutline } from "react-icons/io5";
import FancyButton from "./FancyButton";
import UploadImage from "./UploadImage";

interface ThreadProps {
  address: string;
}

export default function Thread({ address }: ThreadProps) {
  const t = useTranslations("Detail");
  const tCommon = useTranslations("Common");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [likedThreads, setLikedThreads] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`likedThreads_${address}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchComments = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const response = await getTokenComments(
        address,
        1,
        10,
        "created_at",
        sortOrder
      );
      if (response.code === 200 && response.data) {
        const data = Array.isArray(response.data.items)
          ? response.data.items
          : [];
        const updatedData = data.map((comment) => ({
          ...comment,
          is_liked: likedThreads.includes(comment.id),
        }));
        setComments(updatedData);
      } else {
        addToast({
          title: tCommon("toasts.error.fetchFailed"),
          description: response.message || tCommon("toasts.error.genericError"),
          color: "danger",
        });
        setComments([]);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      addToast({
        title: tCommon("toasts.error.fetchFailed"),
        description:
          error instanceof Error
            ? error.message
            : tCommon("toasts.error.genericError"),
        color: "danger",
      });
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [address, sortOrder]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `likedThreads_${address}`,
        JSON.stringify(likedThreads)
      );
    }
  }, [likedThreads, address]);

  const handleImageChange = (newImageUrl: string) => {
    setImageUrl(newImageUrl);
  };

  const handleLike = async (threadId: number, isLiked: boolean) => {
    try {
      const response = isLiked
        ? await unlikeThread(threadId)
        : await likeThread(threadId);
      if (response.code === 200 || response.code === 201) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === threadId
              ? {
                  ...comment,
                  is_liked: !isLiked,
                  likes: (comment.likes ?? 0) + (isLiked ? -1 : 1),
                }
              : comment
          )
        );
        setLikedThreads((prev) =>
          isLiked ? prev.filter((id) => id !== threadId) : [...prev, threadId]
        );
        addToast({
          title: isLiked
            ? tCommon("toasts.success.unlikeSuccess")
            : tCommon("toasts.success.likeSuccess"),
          description: isLiked
            ? tCommon("toasts.success.unliked")
            : tCommon("toasts.success.liked"),
          color: "success",
        });
      } else {
        throw new Error(
          response.message || tCommon("toasts.error.genericError")
        );
      }
    } catch (error) {
      console.error(`${isLiked ? "Unlike" : "Like"} failed:`, error);
      addToast({
        title: isLiked
          ? tCommon("toasts.error.unlikeFailed")
          : tCommon("toasts.error.likeFailed"),
        description:
          error instanceof Error
            ? error.message
            : tCommon("toasts.error.genericError"),
        color: "danger",
      });
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      addToast({
        title: tCommon("toasts.error.postFailed"),
        description: tCommon("toasts.error.emptyComment"),
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await postThread({
        comment: content,
        image_url: imageUrl,
        token_address: address,
      });

      if (response.code === 201) {
        addToast({
          title: tCommon("toasts.success.postSuccess"),
          description: tCommon("toasts.success.commentPosted"),
          color: "success",
        });
        setContent("");
        setImageUrl("");
        fetchComments();
      } else {
        throw new Error(response.message || tCommon("toasts.error.postFailed"));
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
      addToast({
        title: tCommon("toasts.error.postFailed"),
        description:
          error instanceof Error
            ? error.message
            : tCommon("toasts.error.genericError"),
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: string) => {
    if (e === "Enter" && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 mt-5 sm:mb-6">
        <Textarea
          placeholder={"Post a reply..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            handleKeyDown(e.code);
          }}
          minRows={1}
          maxRows={4}
          variant="bordered"
          isDisabled={isSubmitting}
          endContent={
            <div className="flex flex-col items-end">
              <div className="w-[60px] h-[60px] relative">
                {imageUrl && (
                  <>
                    <Image
                      src={imageUrl}
                      className="rounded mb-4"
                      width={60}
                      height={60}
                    />
                    <button
                      className="absolute top-0 right-0 z-10 w-[18px] h-[18px] rounded-full bg-white/40 flex items-center justify-center"
                      onClick={() => setImageUrl("")}
                    >
                      <IoCloseSharp className="text-black" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <UploadImage
                  defaultImage={imageUrl}
                  onUpload={handleImageChange}
                  className="flex items-center justify-center bg-transparent w-6 min-w-6 p-0 h-6 min-h-6"
                  aria-label={t("accessibility.uploadImage")}
                >
                  <IoImageOutline className="w-6" />
                </UploadImage>
                <FancyButton
                  buttonText=""
                  icon={<FaArrowUp />}
                  onClick={handleSubmit}
                ></FancyButton>
              </div>
            </div>
          }
          classNames={{
            base: ["max-w-full"],
            inputWrapper: [
              "bg-[#1F121D]",
              "rounded-lg border border-white/15",
              "!h-auto min-h-[56px]",
              "py-4 px-3",
              "flex items-center",
            ],
            input: ["text-sm sm:text-base bg-[#1F121D] font-cofo"],
          }}
          aria-label={"Post a reply..."}
        />
      </div>

      <div className="space-y-4 max-h-[298px] sm:max-h-[400px] overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner size="md" />
          </div>
        ) : comments.length ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="group"
              role="article"
              aria-label={t("accessibility.commentItem", {
                name: comment.profile.nick_name || comment.sender_address,
              })}
            >
              <div className="flex gap-2 sm:gap-3">
                <Avatar
                  src={comment.profile.avatar_url}
                  className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
                  fallback={
                    comment.profile.nick_name?.[0] || comment.sender_address[0]
                  }
                  aria-label={t("accessibility.commentAvatar", {
                    name: comment.profile.nick_name || comment.sender_address,
                  })}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs sm:text-sm truncate">
                      {comment.profile.nick_name || comment.sender_address}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        isIconOnly
                        className={`bg-transparent min-w-0 w-6 h-6 sm:w-8 sm:h-8 ${
                          comment.is_liked ? "text-[#ff3b3b]" : "text-gray-400"
                        } hover:text-[#ff3b3b]/80 transition-colors`}
                        onPress={() => handleLike(comment.id, comment.is_liked)}
                        aria-label={t("accessibility.likeButton", {
                          action: comment.is_liked
                            ? tCommon("toasts.success.unliked")
                            : tCommon("toasts.success.liked"),
                        })}
                      >
                        {comment.is_liked ? (
                          <FaHeart className="text-[#ff3b3b]" />
                        ) : (
                          <FaRegHeart />
                        )}
                      </Button>
                      <span className="text-gray-400 text-xs sm:text-sm">
                        {comment.likes ?? 0}
                      </span>
                    </div>
                  </div>
                  <p className="text-white text-sm sm:text-base mb-2 break-words">
                    {comment.comment}
                  </p>
                  {comment.image_url && (
                    <div className="mt-2">
                      <Image
                        src={comment.image_url}
                        alt={t("accessibility.commentImage")}
                        width={100}
                        height={100}
                        classNames={{
                          wrapper: [
                            "aspect-video",
                            "w-full",
                            "max-w-[200px] sm:max-w-[300px]",
                          ],
                          img: ["object-contain", "rounded-lg"],
                        }}
                        onError={() =>
                          console.error(
                            `Failed to load image: ${comment.image_url}`
                          )
                        }
                      />
                    </div>
                  )}
                  <span className="text-gray-400 text-xs">
                    {moment(comment.created_at).format("YYYY-MM-DD HH:mm:ss")}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <span className="text-gray-400 text-sm sm:text-base">
            {t("thread.noComments")}
          </span>
        )}
      </div>
    </div>
  );
}
