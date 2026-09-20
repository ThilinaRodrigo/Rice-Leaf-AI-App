import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { ArrowLeft, Send } from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendChatMessage } from "@/service/apiClient";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isError?: boolean;
};

type QuickReply = {
  id: string;
  text: string;
  action?: string;
};

const INITIAL_MESSAGE: Message = {
  id: "1",
  text: "Hello! I've analyzed your plant and detected Bacterial Blight. How can I help you treat this condition?",
  sender: "bot",
  timestamp: new Date(),
};

const QUICK_REPLIES: QuickReply[] = [
  { id: "1", text: "Product recommendations", action: "products" },
  { id: "2", text: "Application schedule", action: "schedule" },
  { id: "3", text: "Prevention tips", action: "prevention" },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Format time helper
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Scroll to bottom with slight delay for better UX
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        scrollToBottom();
      }
    );
    
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        scrollToBottom();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [scrollToBottom]);

  // Generate bot response based on user input
  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("product") || lowerMessage.includes("recommend")) {
      return "For Bacterial Blight, I recommend:\n\n1. Copper-based bactericides (e.g., Kocide 3000)\n2. Streptomycin sulfate for severe cases\n3. Biological control agents like Bacillus subtilis\n\nWould you like detailed application instructions for any of these?";
    }
    
    if (lowerMessage.includes("schedule") || lowerMessage.includes("when")) {
      return "Application Schedule:\n\n• Week 1-2: Apply copper bactericide every 7 days\n• Week 3-4: Reduce to every 10 days if symptoms improve\n• Preventive: Monthly applications during wet season\n\nBest time: Early morning or late afternoon. Avoid application before rain.";
    }
    
    if (lowerMessage.includes("prevention") || lowerMessage.includes("prevent")) {
      return "Prevention Tips:\n\n✓ Use disease-free seeds\n✓ Practice crop rotation (3-year cycle)\n✓ Ensure proper plant spacing for air circulation\n✓ Avoid overhead irrigation\n✓ Remove and destroy infected plant debris\n✓ Disinfect tools between plants\n\nWould you like more specific guidance?";
    }
    
    return "I understand you're asking about treating Bacterial Blight. I can help with product recommendations, application schedules, or prevention strategies. What would you like to know more about?";
  };

  // Send message handler
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: userText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendChatMessage(userText);
      const botMessage: Message = {
        id: res.id || `bot-${Date.now()}`,
        text: res.text || generateBotResponse(userText),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.log("Using offline bot response:", err);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: generateBotResponse(userText),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping]);


  // Handle quick reply
  const handleQuickReply = useCallback((reply: QuickReply) => {
    setInput(reply.text);
    inputRef.current?.focus();
  }, []);

  // Message bubble component
  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.sender === "user";
    
    return (
      <View
        className={`mb-4 flex-row ${isUser ? "justify-end" : "justify-start"}`}
      >
        <View
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-green-600 rounded-tr-sm"
              : "bg-gray-100 rounded-tl-sm"
          }`}
        >
          <Text
            className={`text-base leading-5 ${
              isUser ? "text-white" : "text-gray-800"
            }`}
          >
            {message.text}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              isUser ? "text-green-100" : "text-gray-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <View className="mb-4 flex-row justify-start">
      <View className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <View className="flex-row items-center space-x-1">
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <View
            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <View
            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#16a34a' }} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {/* Header */}
          <View className="bg-green-600 pb-4 px-4 shadow-lg">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 -ml-2"
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <View className="ml-3 flex-1">
                <Text className="text-white text-lg font-semibold">
                  AgriScan AI Assistant
                </Text>
                <Text className="text-green-100 text-sm">
                  {isTyping ? "Typing..." : "Online"}
                </Text>
              </View>
            </View>
          </View>

          {/* Chat Body */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4 pt-4 bg-white"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isTyping && <TypingIndicator />}
          </ScrollView>

          {/* Quick Reply Buttons */}
          {!isTyping && messages.length < 4 && (
            <View className="px-4 pb-2">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
                keyboardShouldPersistTaps="handled"
              >
                {QUICK_REPLIES.map((reply) => (
                  <TouchableOpacity
                    key={reply.id}
                    onPress={() => handleQuickReply(reply)}
                    className="bg-green-50 border border-green-200 rounded-full px-4 py-2 mr-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-green-700 text-sm font-medium">
                      {reply.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input Box */}
          <View className="border-t border-gray-200 bg-white px-4 py-3">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-1">
              <TextInput
                ref={inputRef}
                className="flex-1 text-base py-2 text-gray-800"
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                multiline
                maxLength={500}
                editable={!isTyping}
              />
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!input.trim() || isTyping}
                className={`ml-2 p-2 rounded-full ${
                  input.trim() && !isTyping ? "bg-green-600" : "bg-gray-300"
                }`}
                activeOpacity={0.7}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Send size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;