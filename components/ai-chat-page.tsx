"use client";

import { aiApi } from "@/lib/api";
import { Loader2, Plus, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface AIMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

interface AISession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export function AIChatPage() {
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AISession | null>(
    null,
  );
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
    }
  }, [selectedSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await aiApi.getSessions();
      setSessions(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0]);
      }
    } catch (error) {
      console.error("Failed to load AI sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const data = await aiApi.getMessages(sessionId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const createSession = async () => {
    try {
      const session = await aiApi.createSession("New AI Chat");
      setSessions([session, ...sessions]);
      setSelectedSession(session);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await aiApi.deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(sessions[0] || null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedSession || isSending) return;

    const content = input.trim();
    setInput("");
    setIsSending(true);

    // Optimistically add user message
    const tempUserMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, tempUserMsg]);

    try {
      const response = await aiApi.sendMessage(selectedSession.id, content);
      // Replace temp message and add AI response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        response.userMessage,
        response.aiMessage,
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex gap-3">
      {/* Sessions Sidebar */}
      <div
        className="w-[352px] bg-[#FFFFFF] dark:bg-[#1C1C1C] rounded-3xl shadow-sm flex flex-col overflow-hidden"
        style={{ padding: "24px", gap: "24px" }}>
        <div className="flex items-center justify-between">
          <h2
            className="text-[#111625] dark:text-[#FFFFFF] flex items-center gap-2"
            style={{
              fontSize: "20px",
              lineHeight: "30px",
              fontWeight: 600,
              letterSpacing: "0%",
            }}>
            <Image
              src="/spark.svg"
              alt="AI"
              width={20}
              height={20}
              className="dark:invert"
            />
            AI Chat
          </h2>
          <button
            onClick={createSession}
            className="bg-[#1E9A80] text-[#FFFFFF] rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            style={{
              height: "32px",
              padding: "8px",
              gap: "8px",
            }}
            title="New Chat">
            <Plus size={16} strokeWidth={2} />
            <span
              style={{
                fontSize: "12px",
                lineHeight: "16px",
                fontWeight: 500,
                letterSpacing: "0%",
              }}>
              New Chat
            </span>
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ gap: "8px" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E9A80]" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#8B8B8B] dark:text-[#9CA3AF]">
              <p>No conversations yet</p>
              <button
                onClick={createSession}
                className="mt-2 text-[#1E9A80] hover:underline">
                Start a new chat
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                style={{
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  gap: "12px",
                  cursor: "pointer",
                }}
                className={`transition-colors hover:bg-[#F3F3EE] dark:hover:bg-[#363636] group ${
                  selectedSession?.id === session.id
                    ? "bg-[#F3F3EE] dark:bg-[#363636]"
                    : "bg-[#FFFFFF] dark:bg-[#2C2C2C]"
                }`}>
                <div
                  className="relative shrink-0 rounded-full bg-[#F7F9FB] dark:bg-[#3C3C3C] flex items-center justify-center overflow-hidden"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "1000px",
                  }}>
                  <Image
                    src="/spark.svg"
                    alt="AI"
                    width={20}
                    height={20}
                    className="dark:invert"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="flex items-center justify-between"
                    style={{ height: "20px", marginBottom: "2px" }}>
                    <h3
                      className="text-[#1C1C1C] dark:text-white truncate"
                      style={{
                        fontSize: "14px",
                        lineHeight: "20px",
                        fontWeight: 500,
                        letterSpacing: "-0.006em",
                      }}>
                      {session.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                  <p
                    className="text-[#8B8B8B] dark:text-gray-400 truncate"
                    style={{
                      fontSize: "12px",
                      lineHeight: "16px",
                      fontWeight: 400,
                      letterSpacing: "0",
                    }}>
                    {session._count?.messages || 0} messages
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1C1C1C] rounded-3xl shadow-sm overflow-hidden p-3">
        {selectedSession ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-hidden mb-2">
              <div
                className="h-full overflow-y-auto dark:bg-[#111111]"
                style={{
                  borderRadius: "16px",
                  padding: "12px",
                  backgroundColor: "#F3F3EE",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}>
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Image
                        src="/spark.svg"
                        alt="AI"
                        width={48}
                        height={48}
                        className="mx-auto mb-4 dark:invert"
                      />
                      <h3 className="text-xl font-semibold text-[#111625] dark:text-white mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-[#8B8B8B] dark:text-gray-400">
                        Ask me anything! I'm powered by Google Gemini.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"}`}>
                      <div className="flex flex-col max-w-[70%]">
                        {msg.role === "ASSISTANT" ? (
                          <div className="flex flex-col gap-2">
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "horizontal",
                                width: "fit-content",
                                maxWidth: "349px",
                                height: "fit-content",
                                minHeight: "40px",
                                borderTopLeftRadius: "12px",
                                borderTopRightRadius: "12px",
                                borderBottomRightRadius: "12px",
                                borderBottomLeftRadius: "4px",
                                padding: "12px",
                                gap: "10px",
                                backgroundColor: "#FFFFFF",
                              }}
                              className="dark:!bg-[#2C2C2C]">
                              <p
                                className="text-[#1C1C1C] dark:!text-[#FFFFFF] whitespace-pre-wrap"
                                style={{
                                  fontFamily: "Inter",
                                  fontWeight: 400,
                                  fontSize: "12px",
                                  lineHeight: "16px",
                                  letterSpacing: "0px",
                                }}>
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-2">
                            <div className="px-4 py-2 rounded-2xl bg-[#F0FDF4] text-gray-800 dark:!bg-[#1E9A80] dark:!text-white">
                              <p className="whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-[#FFFFFF] dark:bg-[#2C2C2C] rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2
                        className="w-4 h-4 animate-spin"
                        style={{ color: "#1E9A80" }}
                      />
                      <span className="text-[#8B8B8B] dark:text-gray-400">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="h-10 rounded-[100px] border border-[#E8E5DF] dark:border-[#3C3C3C] pt-3 pr-1 pb-3 pl-4 flex items-center gap-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-[#8796AF] dark:text-[#9CA3AF] placeholder-[#8796AF] dark:placeholder-[#6B7280] focus:outline-none disabled:opacity-50 text-xs leading-4 tracking-[0px]"
                disabled={isSending}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isSending}
                className="w-8 h-8 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center p-2"
                style={{ backgroundColor: "#1E9A80" }}>
                <Send
                  size={14}
                  strokeWidth={2}
                  className="text-white"
                  style={{ marginLeft: "1px" }}
                />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Image
                src="/spark.svg"
                alt="AI"
                width={64}
                height={64}
                className="mx-auto mb-4 dark:invert"
              />
              <h2 className="text-2xl font-semibold text-[#111625] dark:text-white mb-2">
                Welcome to AI Chat
              </h2>
              <p className="text-[#8B8B8B] dark:text-gray-400 mb-6">
                Chat with AI powered by Google Gemini
              </p>
              <button
                onClick={createSession}
                className="px-6 py-3 text-white font-semibold rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1E9A80" }}>
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
