"use client";

import { chatApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  FileText,
  Image,
  Link as LinkIcon,
  Phone,
  Video,
  X,
  File,
  FileCode,
} from "lucide-react";
import { useEffect, useState } from "react";

// File type icon component matching Figma design visual style
function FileIcon({ type }: { type: string }) {
  const baseClasses =
    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0";

  // Icon logic matches the colorful squares in the screenshot
  switch (type.toLowerCase()) {
    case "pdf":
      return (
        <div className={`${baseClasses} bg-red-50 text-red-500`}>
          <FileText size={24} />
        </div>
      );
    case "fig":
    case "figma":
      return (
        <div className={`${baseClasses} bg-purple-50 text-purple-600`}>
          <span className="font-bold text-[10px]">FIG</span>
        </div>
      );
    case "ai":
      return (
        <div className={`${baseClasses} bg-orange-50 text-orange-600`}>
          <span className="font-bold text-[10px]">AI</span>
        </div>
      );
    case "doc":
    case "docx":
      return (
        <div className={`${baseClasses} bg-blue-50 text-blue-600`}>
          <FileText size={24} />
        </div>
      );
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return (
        <div className={`${baseClasses} bg-green-50 text-green-600`}>
          <Image size={24} />
        </div>
      );
    default:
      return (
        <div className={`${baseClasses} bg-gray-100 text-gray-500`}>
          <File size={24} />
        </div>
      );
  }
}

interface MediaItem {
  id: string;
  url: string;
  type: string;
  name: string;
  createdAt: string;
}

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface DocItem {
  id: string;
  name: string;
  type: string;
  size: string;
  pages?: string;
  url: string;
  createdAt: string;
}

export function ContactInfoPanel() {
  const {
    selectedContactInfo,
    toggleInfoPanel,
    isInfoPanelOpen,
    sessions,
    selectedSessionId,
    currentUser,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<"Media" | "Link" | "Docs">("Docs");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [docItems, setDocItems] = useState<DocItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get the selected session to extract user info
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Get the other user from the session
  const otherUser = selectedSession?.users?.find(
    (u: { userId: string; user: any }) => u.userId !== currentUser?.id,
  );

  const contactInfo = otherUser?.user || selectedContactInfo;

  // Fetch data based on active tab
  useEffect(() => {
    if (!selectedSessionId || !isInfoPanelOpen) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "Media") {
          const data = await chatApi.getSessionMedia(selectedSessionId);
          setMediaItems(data || []);
        } else if (activeTab === "Link") {
          const data = await chatApi.getSessionLinks(selectedSessionId);
          setLinkItems(data || []);
        } else if (activeTab === "Docs") {
          const data = await chatApi.getSessionDocs(selectedSessionId);
          setDocItems(data || []);
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab}:`, error);
        if (activeTab === "Media") setMediaItems([]);
        if (activeTab === "Link") setLinkItems([]);
        if (activeTab === "Docs") setDocItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedSessionId, isInfoPanelOpen]);

  if (!isInfoPanelOpen) return null;
  if (!contactInfo) return null;

  // Helper to group docs by month/year for the list headers
  const groupDocsByDate = (docs: DocItem[]) => {
    const grouped: { [key: string]: DocItem[] } = {};

    docs.forEach((doc) => {
      const date = new Date(doc.createdAt);
      const key = date.toLocaleDateString("en-US", { month: "long" }); // e.g., "May", "April"
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(doc);
    });

    return grouped;
  };

  const groupedDocs = groupDocsByDate(docItems);
  const groupedLinks = groupDocsByDate(linkItems as any); // Reusing same grouper logic for links
  const groupedMedia = groupDocsByDate(mediaItems as any);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/10"
        onClick={toggleInfoPanel}
      />

      {/* Main Card Container 
         Fixed Width: 450px
         Fixed Height: 1000px (max-height set for smaller screens)
         Radius: 24px
      */}
      <div
        className="fixed right-6 top-6 bg-[#FFFFFF] dark:bg-[#1C1C1C] rounded-[24px] z-50 flex flex-col overflow-hidden"
        style={{
          width: "450px",
          height: "1000px",
          maxHeight: "calc(100vh - 48px)",
          padding: "24px",
          gap: "24px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}>
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ width: "402px", height: "28px", gap: "10px" }}>
          <h3
            style={{
              fontFamily: "Inter Display, Inter, sans-serif",
              fontSize: "20px",
              lineHeight: "28px",
              fontWeight: 600,
              letterSpacing: "0px",
              color: "#111625",
              width: "368px",
              height: "28px",
            }}
            className="dark:!text-[#FFFFFF]">
            Contact Info
          </h3>
          <button
            onClick={toggleInfoPanel}
            className="flex items-center justify-center rounded-full"
            style={{ width: "24px", height: "24px", color: "#596881" }}>
            <X size={20} strokeWidth={2} className="dark:text-[#9CA3AF]" />
          </button>
        </div>

        {/* Profile Section */}
        <div
          className="flex flex-col items-center"
          style={{ width: "402px", gap: "16px", height: "132px" }}>
          <div className="relative">
            {contactInfo.avatarUrl ? (
              <img
                src={contactInfo.avatarUrl}
                alt="Profile"
                className="object-cover"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "1798.2px",
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center text-2xl font-bold text-gray-500"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "1798.2px",
                  backgroundColor: "#E5E7EB",
                }}>
                {(contactInfo.name || contactInfo.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center" style={{ gap: "4px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 500,
                letterSpacing: "-0.011em",
                color: "#111625",
                textAlign: "center",
              }}
              className="dark:!text-[#FFFFFF]">
              {("displayName" in contactInfo
                ? contactInfo.displayName
                : contactInfo.name) || contactInfo.username}
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                lineHeight: "16px",
                fontWeight: 400,
                letterSpacing: "0px",
                color: "#8B8B8B",
                textAlign: "center",
              }}>
              {contactInfo.email || `@${contactInfo.username}`}
            </span>
          </div>
        </div>

        {/* Audio and Video Buttons - Horizontal, Fill 402px, Hug 32px, Gap 16px */}
        <div
          className="flex"
          style={{ width: "402px", height: "32px", gap: "16px" }}>
          <button
            className="flex items-center justify-center"
            style={{
              width: "193px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #E8E5DF",
              padding: "8px",
              gap: "6px",
              backgroundColor: "#FFFFFF",
              color: "#111625",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              letterSpacing: "-0.006em",
            }}>
            <Phone size={13} strokeWidth={1.5} />
            Audio
          </button>
          <button
            className="flex items-center justify-center"
            style={{
              width: "193px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #E8E5DF",
              padding: "8px",
              gap: "6px",
              backgroundColor: "#FFFFFF",
              color: "#111625",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              letterSpacing: "-0.006em",
            }}>
            <Video size={13} strokeWidth={1.5} />
            Video
          </button>
        </div>

        {/* Media/Link/Docs Container - Vertical, Fill 402px, Fill 688px, Gap 12px */}
        <div
          className="flex flex-col"
          style={{ width: "402px", height: "688px", gap: "12px" }}>
          {/* Media/Link/Docs Tabs - Horizontal, Hug 167px, Hug 40px, Radius 12px, Padding 2px */}
          <div
            className="flex items-center dark:bg-[#2C2C2C]"
            style={{
              width: "167px",
              height: "40px",
              borderRadius: "12px",
              padding: "2px",
              backgroundColor: "#F3F3EE",
              gap: "4px",
            }}>
            {[
              {
                label: "Media",
                width: "61px",
                active: activeTab === "Media",
                color: "#8B8B8B",
              },
              {
                label: "Link",
                width: "48px",
                active: activeTab === "Link",
                color: "#111625",
              },
              {
                label: "Docs",
                width: "54px",
                active: activeTab === "Docs",
                color: "#8B8B8B",
              },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label as any)}
                className="flex items-center justify-center"
                style={{
                  width: tab.width,
                  height: "36px",
                  borderRadius: "10px",
                  padding: "8px 10px",
                  gap: "8px",
                  backgroundColor: tab.active ? "#FFFFFF" : "#F3F3EE",
                  color: tab.active ? "#111625" : tab.color,
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  letterSpacing: "-0.006em",
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area Under Tabs - Vertical, Fill 402px, Hug 332px, Gap 12px */}
          <div
            className="flex flex-col overflow-y-auto custom-scrollbar"
            style={{ width: "402px", height: "332px", gap: "12px" }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
              </div>
            ) : (
              <>
                {/* DOCS TAB */}
                {activeTab === "Docs" &&
                  (Object.keys(groupedDocs).length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                      No documents found
                    </div>
                  ) : (
                    Object.entries(groupedDocs).map(([month, docs]) => (
                      <div
                        key={month}
                        className="flex flex-col"
                        style={{ width: "402px", gap: "12px" }}>
                        {/* May Text Div - Horizontal, Fill 402px, Hug 32px, Radius 8px, Padding 8/12/8/12, Gap 12px */}
                        <div
                          className="flex items-center"
                          style={{
                            width: "402px",
                            height: "32px",
                            borderRadius: "8px",
                            paddingTop: "8px",
                            paddingRight: "12px",
                            paddingBottom: "8px",
                            paddingLeft: "12px",
                            gap: "12px",
                          }}>
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "12px",
                              lineHeight: "16px",
                              fontWeight: 500,
                              letterSpacing: "0px",
                              color: "#596881",
                            }}>
                            {month}
                          </span>
                        </div>

                        {/* Under Month Text - Vertical, Fill 402px, Hug 288px, Gap 16px */}
                        <div
                          className="flex flex-col"
                          style={{
                            width: "402px",
                            height: "288px",
                            gap: "16px",
                          }}>
                          {docs.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.url}
                              target="_blank"
                              className="flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                              <FileIcon type={doc.type} />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {doc.pages ? `${doc.pages} pages • ` : ""}
                                  {doc.size} • {doc.type.toUpperCase()}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))
                  ))}

                {/* LINKS TAB */}
                {activeTab === "Link" &&
                  (Object.keys(groupedLinks).length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                      No links found
                    </div>
                  ) : (
                    Object.entries(groupedLinks).map(([month, links]) => (
                      <div
                        key={month}
                        className="flex flex-col"
                        style={{ width: "402px", gap: "12px" }}>
                        {/* May Text Div */}
                        <div
                          className="flex items-center"
                          style={{
                            width: "402px",
                            height: "32px",
                            borderRadius: "8px",
                            paddingTop: "8px",
                            paddingRight: "12px",
                            paddingBottom: "8px",
                            paddingLeft: "12px",
                            gap: "12px",
                          }}>
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "12px",
                              lineHeight: "16px",
                              fontWeight: 500,
                              letterSpacing: "0px",
                              color: "#596881",
                            }}>
                            {month}
                          </span>
                        </div>

                        {/* Under Month Links */}
                        <div
                          className="flex flex-col"
                          style={{
                            width: "402px",
                            height: "288px",
                            gap: "16px",
                          }}>
                          {(links as LinkItem[]).map((link) => (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              className="flex items-start gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                              <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                                <LinkIcon
                                  size={20}
                                  className="text-gray-700 dark:text-gray-300"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                  {link.title || new URL(link.url).hostname}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                  {link.description || link.url}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))
                  ))}

                {/* MEDIA TAB */}
                {activeTab === "Media" &&
                  (Object.keys(groupedMedia).length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                      No media found
                    </div>
                  ) : (
                    Object.entries(groupedMedia).map(([month, items]) => (
                      <div
                        key={month}
                        className="flex flex-col"
                        style={{ width: "402px", gap: "12px" }}>
                        {/* May Text Div */}
                        <div
                          className="flex items-center"
                          style={{
                            width: "402px",
                            height: "32px",
                            borderRadius: "8px",
                            paddingTop: "8px",
                            paddingRight: "12px",
                            paddingBottom: "8px",
                            paddingLeft: "12px",
                            gap: "12px",
                          }}>
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "12px",
                              lineHeight: "16px",
                              fontWeight: 500,
                              letterSpacing: "0px",
                              color: "#596881",
                            }}>
                            {month}
                          </span>
                        </div>

                        {/* Under Month Media */}
                        <div
                          className="flex flex-col"
                          style={{
                            width: "402px",
                            height: "288px",
                            gap: "16px",
                          }}>
                          <div className="grid grid-cols-3 gap-2">
                            {(items as MediaItem[]).map((item) => (
                              <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 hover:opacity-90 transition-opacity">
                                {item.type.includes("image") ? (
                                  <img
                                    src={item.url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FileCode size={24} />
                                  </div>
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
