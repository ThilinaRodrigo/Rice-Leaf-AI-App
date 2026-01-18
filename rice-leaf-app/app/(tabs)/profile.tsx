import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React from "react";
import { ArrowLeft, User, Settings, LogOut, Edit } from "lucide-react-native";
import { router } from "expo-router";

const Profile = () => {
  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-green-900 h-48 rounded-b-3xl p-4 justify-end shadow-md ">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 w-10 h-10 rounded-full bg-white items-center justify-center"
        >
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>

        {/* Avatar */}
        <View className="absolute top-28 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-gray-300 border-4 border-white items-center justify-center">
          <User size={50} color="#fff" />
        </View>
      </View>

      {/* User Info */}
      <View className="mt-20 items-center px-4">
        <Text className="text-2xl font-bold text-gray-900 mb-1">John Doe</Text>
        <Text className="text-gray-500 mb-6">john.doe@example.com</Text>

        {/* Stats Cards */}
        <View className="flex-row justify-between w-full mb-6">
          <View className="bg-white flex-1 mx- p-4 rounded-2xl shadow items-center">
            <Text className="text-lg font-bold text-gray-900">24</Text>
            <Text className="text-gray-500 text-sm mt-1">Posts</Text>
          </View>
          <View className="bg-white flex-1 mx-1 p-4 rounded-2xl shadow items-center">
            <Text className="text-lg font-bold text-gray-900">1.2K</Text>
            <Text className="text-gray-500 text-sm mt-1">Followers</Text>
          </View>
          <View className="bg-white flex-1 mx-1 p-4 rounded-2xl shadow items-center">
            <Text className="text-lg font-bold text-gray-900">180</Text>
            <Text className="text-gray-500 text-sm mt-1">Following</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4 w-full gap-2">
          <TouchableOpacity className="bg-white px-5 py-4 rounded-2xl shadow flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2 gap-2">
              <Edit size={20} color="#2563EB" />
              <Text className="text-gray-900 font-medium">Edit Profile</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white px-5 py-4 rounded-2xl shadow flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2 gap-2">
              <Settings size={20} color="#10B981" />
              <Text className="text-gray-900 font-medium">Settings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white px-5 py-4 rounded-2xl shadow flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2 gap-2">
              <LogOut size={20} color="#EF4444" />
              <Text className="text-red-500 font-medium">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;
