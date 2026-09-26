import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Plus,
  Trash2,
  Share2,
  ShieldCheck,
  Store,
  User as UserIcon,
  X,
  Send,
} from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  fetchCommunityPosts,
  voteCommunityPost,
  fetchPostComments,
  addPostComment,
  deleteCommunityPost,
  deletePostComment,
} from "@/service/apiClient";
import { API_BASE_URL } from "@/constant/api";

const DISEASE_TAGS = [
  { label: "All", value: "All" },
  { label: "Bacterial Blight", value: "bacterial_leaf_blight" },
  { label: "Brown Spot", value: "brown_spot" },
  { label: "Healthy Leaf", value: "healthy" },
  { label: "Leaf Scald", value: "leaf_scald" },
  { label: "Narrow Brown Spot", value: "narrow_brown_spot" },
  { label: "General", value: "general" },
];

export default function Community() {
  const { user, token } = useAuth();
  const [selectedTag, setSelectedTag] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Comments Modal State
  const [activePostForComments, setActivePostForComments] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCommunityPosts(selectedTag, token || undefined);
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err: any) {
      console.log("Error loading community posts:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTag, token]);

  // Reload posts every time this screen comes into focus
  // (e.g. after navigating back from create-post)
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const getFullImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith("/uploads")) {
      const domain = API_BASE_URL.replace("/api/v1", "");
      return `${domain}${url}`;
    }
    return url;
  };

  const handleVote = async (postId: string, voteType: "like" | "dislike") => {
    if (!token) {
      Alert.alert("Sign In Required", "Please sign in to vote on posts.");
      router.push("/login");
      return;
    }

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        let newLikes = p.likes_count;
        let newDislikes = p.dislikes_count;
        let newVote: string = voteType;

        if (p.user_vote === voteType) {
          // Toggle off
          newVote = "";
          if (voteType === "like") newLikes = Math.max(0, newLikes - 1);
          if (voteType === "dislike") newDislikes = Math.max(0, newDislikes - 1);
        } else {
          // Switch or add
          if (voteType === "like") {
            newLikes += 1;
            if (p.user_vote === "dislike") newDislikes = Math.max(0, newDislikes - 1);
          } else {
            newDislikes += 1;
            if (p.user_vote === "like") newLikes = Math.max(0, newLikes - 1);
          }
        }

        return {
          ...p,
          likes_count: newLikes,
          dislikes_count: newDislikes,
          user_vote: newVote,
        };
      })
    );

    try {
      await voteCommunityPost(postId, voteType, token);
    } catch (err) {
      console.log("Vote sync error:", err);
      loadPosts();
    }
  };

  const handleDeletePost = (postId: string) => {
    if (!token) return;
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCommunityPost(postId, token);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete post");
          }
        },
      },
    ]);
  };

  const openCommentsModal = async (post: any) => {
    setActivePostForComments(post);
    setLoadingComments(true);
    try {
      const data = await fetchPostComments(post.id);
      if (Array.isArray(data)) {
        setComments(data);
      }
    } catch (err) {
      console.log("Error loading comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!token) {
      Alert.alert("Sign In Required", "Please sign in to post comments.");
      router.push("/login");
      return;
    }
    if (!commentInput.trim() || !activePostForComments) return;

    setSubmittingComment(true);
    try {
      const newComment = await addPostComment(activePostForComments.id, commentInput.trim(), token);
      setComments((prev) => [...prev, newComment]);
      setCommentInput("");

      setPosts((prev) =>
        prev.map((p) =>
          p.id === activePostForComments.id ? { ...p, comments_count: p.comments_count + 1 } : p
        )
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;
    try {
      await deletePostComment(commentId, token);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (activePostForComments) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === activePostForComments.id
              ? { ...p, comments_count: Math.max(0, p.comments_count - 1) }
              : p
          )
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete comment");
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Top Header Banner */}
      <View className="pt-14 pb-6 px-5 bg-emerald-800 rounded-b-3xl border-b border-emerald-900/20 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center space-x-2 mb-0.5">
              <View className="w-2 h-2 rounded-full bg-emerald-300" />
              <Text className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
                Farmer Knowledge Base
              </Text>
            </View>
            <Text className="text-xl font-black text-white" numberOfLines={1}>
              Community Solutions & Advice
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/create-post" as any)}
            className="w-11 h-11 rounded-2xl bg-emerald-700 border border-emerald-600 items-center justify-center shadow-sm active:opacity-80 ml-2"
          >
            <Plus size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 mt-5 space-y-6 mb-32" showsVerticalScrollIndicator={false}>
        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-5 px-5">
          {DISEASE_TAGS.map((tag) => {
            const isSelected = selectedTag === tag.value;
            return (
              <TouchableOpacity
                key={tag.value}
                onPress={() => setSelectedTag(tag.value)}
                className={`mr-2.5 px-4 py-2.5 rounded-2xl border flex-row items-center shadow-sm active:opacity-80 ${
                  isSelected ? "bg-emerald-800 border-emerald-800" : "bg-white border-gray-200/80"
                }`}
              >
                <Text className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-700"}`}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Create Post Prompt Banner */}
        <TouchableOpacity
          onPress={() => router.push("/create-post" as any)}
          className="bg-white border border-emerald-200 rounded-2xl p-4 flex-row items-center space-x-3 shadow-sm active:opacity-80 mb-4"
        >
          <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center">
            <Plus size={20} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-sm">Have a crop disease solution?</Text>
            <Text className="text-gray-500 text-xs">Share your experience & remedies with farmers</Text>
          </View>
        </TouchableOpacity>

        {/* Posts Feed */}
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-gray-500 text-xs font-bold mt-3">Loading community posts...</Text>
          </View>
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const isOwner = user && user.id === post.user_id;
            const isAdmin = user && user.role === "sys_admin";
            const imageUrl = getFullImageUrl(post.image_url);

            return (
              <View
                key={post.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 mb-4"
              >
                {/* Author Info & Tag */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center space-x-2.5 flex-1">
                    <View className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 items-center justify-center">
                      <UserIcon size={18} color="#059669" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center space-x-1.5">
                        <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                          {post.author_name}
                        </Text>
                        {post.author_role === "shop_owner" ? (
                          <Store size={14} color="#D97706" />
                        ) : post.author_role === "sys_admin" ? (
                          <ShieldCheck size={14} color="#7E22CE" />
                        ) : null}
                      </View>
                      <Text className="text-[10px] text-gray-400 font-medium">
                        {post.author_role === "shop_owner"
                          ? "Agro Store Owner"
                          : post.author_role === "sys_admin"
                          ? "System Admin"
                          : "Farmer"}
                      </Text>
                    </View>
                  </View>

                  {/* Disease Tag */}
                  <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <Text className="text-emerald-800 font-bold text-[10px] uppercase">
                      {post.disease_tag.replace(/_/g, " ")}
                    </Text>
                  </View>

                  {/* Admin / Owner Delete Button */}
                  {(isOwner || isAdmin) && (
                    <TouchableOpacity
                      onPress={() => handleDeletePost(post.id)}
                      className="ml-2 p-1.5 rounded-lg bg-red-50"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Post Title & Content */}
                <Text className="text-base font-black text-gray-900 mb-1.5">{post.title}</Text>
                <Text className="text-xs text-gray-700 leading-relaxed mb-3">{post.content}</Text>

                {/* Post Image */}
                {imageUrl && (
                  <View className="rounded-xl overflow-hidden border border-gray-100 mb-3">
                    <Image source={{ uri: imageUrl }} className="w-full h-48" resizeMode="cover" />
                  </View>
                )}

                {/* Vote & Comment Actions Bar */}
                <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
                  <View className="flex-row items-center space-x-3">
                    {/* Like Button */}
                    <TouchableOpacity
                      onPress={() => handleVote(post.id, "like")}
                      className={`flex-row items-center space-x-1.5 px-3 py-1.5 rounded-xl border active:opacity-80 ${
                        post.user_vote === "like"
                          ? "bg-emerald-800 border-emerald-800"
                          : "bg-slate-50 border-gray-200/80"
                      }`}
                    >
                      <ThumbsUp size={15} color={post.user_vote === "like" ? "#FFFFFF" : "#059669"} />
                      <Text
                        className={`text-xs font-bold ${
                          post.user_vote === "like" ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {post.likes_count}
                      </Text>
                    </TouchableOpacity>

                    {/* Dislike Button */}
                    <TouchableOpacity
                      onPress={() => handleVote(post.id, "dislike")}
                      className={`flex-row items-center space-x-1.5 px-3 py-1.5 rounded-xl border active:opacity-80 ${
                        post.user_vote === "dislike"
                          ? "bg-red-600 border-red-600"
                          : "bg-slate-50 border-gray-200/80"
                      }`}
                    >
                      <ThumbsDown size={15} color={post.user_vote === "dislike" ? "#FFFFFF" : "#94A3B8"} />
                      <Text
                        className={`text-xs font-bold ${
                          post.user_vote === "dislike" ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {post.dislikes_count}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Comment Button */}
                  <TouchableOpacity
                    onPress={() => openCommentsModal(post)}
                    className="flex-row items-center space-x-1.5 bg-slate-50 border border-gray-200/80 px-3 py-1.5 rounded-xl active:opacity-80"
                  >
                    <MessageSquare size={15} color="#059669" />
                    <Text className="text-xs font-bold text-gray-700">{post.comments_count} Comments</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View className="py-16 items-center bg-white rounded-2xl border border-gray-200/80 px-6">
            <Text className="text-gray-900 font-bold text-base mb-1">No community posts yet</Text>
            <Text className="text-gray-500 text-xs text-center leading-relaxed">
              Be the first farmer or expert to share a crop remedy or post for this category!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Comments Modal */}
      <Modal
        visible={!!activePostForComments}
        animationType="slide"
        transparent
        onRequestClose={() => setActivePostForComments(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%] p-5 shadow-xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
              <View>
                <Text className="text-base font-black text-gray-900">Comments</Text>
                <Text className="text-xs text-gray-500" numberOfLines={1}>
                  {activePostForComments?.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActivePostForComments(null)} className="p-1">
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView className="py-4 my-1" showsVerticalScrollIndicator={false}>
              {loadingComments ? (
                <ActivityIndicator size="small" color="#059669" className="py-8" />
              ) : comments.length > 0 ? (
                comments.map((c) => {
                  const isCommentOwner = user && user.id === c.user_id;
                  const isAdmin = user && user.role === "sys_admin";
                  return (
                    <View key={c.id} className="bg-slate-50 border border-gray-200/60 rounded-xl p-3 mb-2.5">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-xs font-bold text-gray-900">{c.author_name}</Text>
                        {(isCommentOwner || isAdmin) && (
                          <TouchableOpacity onPress={() => handleDeleteComment(c.id)}>
                            <Trash2 size={14} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text className="text-xs text-gray-700 leading-relaxed">{c.comment}</Text>
                    </View>
                  );
                })
              ) : (
                <Text className="text-center text-gray-400 text-xs py-8">
                  No comments yet. Start the conversation!
                </Text>
              )}
            </ScrollView>

            {/* Comment Input */}
            <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-2xl px-4 py-1.5 pt-2">
              <TextInput
                className="flex-1 text-xs py-2 text-gray-900"
                placeholder="Write a comment..."
                placeholderTextColor="#94A3B8"
                value={commentInput}
                onChangeText={setCommentInput}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentInput.trim() || submittingComment}
                className={`ml-2 w-8 h-8 rounded-xl items-center justify-center ${
                  commentInput.trim() ? "bg-emerald-800" : "bg-slate-300"
                }`}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
