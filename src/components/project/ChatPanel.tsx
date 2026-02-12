"use client";

import { useAppStore } from "@/lib/store";
import { useMemo, useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Hash, Plus, Send, Reply, X, Trash2, Pencil, Check, AtSign } from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { getInitials, cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

function formatMsgTime(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return format(d, "'Today at' h:mm a");
  if (isYesterday(d)) return format(d, "'Yesterday at' h:mm a");
  return format(d, "MMM d 'at' h:mm a");
}

const channelColors = ["#6366f1", "#0ea5e9", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6"];

export function ChatPanel({ projectId }: { projectId: string }) {
  const allChannels = useAppStore((s) => s.chatChannels);
  const allMessages = useAppStore((s) => s.chatMessages);
  const allMembers = useAppStore((s) => s.teamMembers);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const editMessage = useAppStore((s) => s.editMessage);
  const deleteMessage = useAppStore((s) => s.deleteMessage);
  const addChannel = useAppStore((s) => s.addChannel);
  const deleteChannel = useAppStore((s) => s.deleteChannel);

  const channels = useMemo(() => allChannels.filter((c) => c.projectId === projectId), [allChannels, projectId]);
  const members = useMemo(() => allMembers.filter((m) => m.projectId === projectId), [allMembers, projectId]);

  const [activeChannel, setActiveChannel] = useState<string>(() => {
    const defaultCh = channels.find((c) => c.isDefault);
    return defaultCh?.id || channels[0]?.id || "";
  });

  const messages = useMemo(
    () => allMessages.filter((m) => m.channelId === activeChannel && m.threadId === null).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [allMessages, activeChannel]
  );

  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const threadMessages = useMemo(
    () => threadId ? allMessages.filter((m) => m.threadId === threadId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [],
    [allMessages, threadId]
  );

  const threadParent = useMemo(() => threadId ? allMessages.find((m) => m.id === threadId) : null, [allMessages, threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || !activeChannel) return;
    const mentions = members
      .filter((m) => input.includes(`@${m.name}`))
      .map((m) => m.id);
    sendMessage({
      channelId: activeChannel,
      projectId,
      senderId: "you",
      senderName: "You",
      content: input.trim(),
      threadId: null,
      mentions,
    });
    setInput("");
  };

  const handleThreadReply = (content: string) => {
    if (!content.trim() || !threadId || !activeChannel) return;
    sendMessage({
      channelId: activeChannel,
      projectId,
      senderId: "you",
      senderName: "You",
      content: content.trim(),
      threadId,
      mentions: [],
    });
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    const id = addChannel({
      projectId,
      name: newChannelName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newChannelDesc.trim(),
      createdBy: "you",
      isDefault: false,
    });
    setActiveChannel(id);
    setNewChannelName("");
    setNewChannelDesc("");
    setShowNewChannel(false);
  };

  const handleDeleteChannel = (chId: string) => {
    const ch = channels.find((c) => c.id === chId);
    if (!ch || ch.isDefault) return;
    if (!confirm(`Delete #${ch.name}?`)) return;
    deleteChannel(chId);
    const def = channels.find((c) => c.isDefault);
    setActiveChannel(def?.id || "");
  };

  const handleStartEdit = (msgId: string, content: string) => {
    setEditingId(msgId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      editMessage(editingId, editContent.trim());
    }
    setEditingId(null);
    setEditContent("");
  };

  const getReplyCount = (msgId: string) => allMessages.filter((m) => m.threadId === msgId).length;

  const activeChannelData = channels.find((c) => c.id === activeChannel);
  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]";

  return (
    <div className="flex gap-0 h-[600px] rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]">
      {/* Channel Sidebar */}
      <div className="w-56 shrink-0 border-r border-[var(--color-border)] flex flex-col" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Channels</span>
          <button onClick={() => setShowNewChannel(true)} className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {channels.map((ch, i) => {
            const isActive = ch.id === activeChannel;
            const unread = allMessages.filter((m) => m.channelId === ch.id).length;
            return (
              <div key={ch.id} className="group relative">
                <button
                  onClick={() => { setActiveChannel(ch.id); setThreadId(null); }}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors cursor-pointer text-left",
                    isActive
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                  )}
                >
                  <Hash size={14} style={{ color: channelColors[i % channelColors.length] }} />
                  <span className="truncate">{ch.name}</span>
                </button>
                {!ch.isDefault && (
                  <button
                    onClick={() => handleDeleteChannel(ch.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-all cursor-pointer"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
          <Hash size={16} className="text-[var(--color-text-muted)]" />
          <span className="text-sm font-bold text-[var(--color-text-primary)]">{activeChannelData?.name || "..."}</span>
          {activeChannelData?.description && (
            <span className="text-xs text-[var(--color-text-muted)] ml-2 hidden sm:inline">— {activeChannelData.description}</span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Hash size={32} className="mx-auto text-[var(--color-text-muted)] mb-2" />
              <p className="text-sm text-[var(--color-text-muted)]">No messages in #{activeChannelData?.name} yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((msg) => {
            const replyCount = getReplyCount(msg.id);
            const isEditing = editingId === msg.id;
            return (
              <div key={msg.id} className="group flex gap-3 py-2 px-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold mt-0.5"
                  style={{ backgroundColor: msg.senderId === "you" ? "var(--color-primary)" : channelColors[msg.senderName.length % channelColors.length] }}
                >
                  {getInitials(msg.senderName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{msg.senderName}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{formatMsgTime(msg.timestamp)}</span>
                    {msg.edited && <span className="text-[10px] text-[var(--color-text-muted)] italic">(edited)</span>}
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        className="flex-1 px-2 py-1 text-sm rounded border border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                        autoFocus
                      />
                      <button onClick={handleSaveEdit} className="text-[var(--color-primary)] cursor-pointer"><Check size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="text-[var(--color-text-muted)] cursor-pointer"><X size={14} /></button>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {replyCount > 0 && (
                      <button
                        onClick={() => setThreadId(msg.id)}
                        className="text-xs text-[var(--color-primary)] font-semibold hover:underline cursor-pointer"
                      >
                        {replyCount} {replyCount === 1 ? "reply" : "replies"}
                      </button>
                    )}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button onClick={() => setThreadId(msg.id)} className="p-1 rounded hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-pointer" title="Reply in thread">
                        <Reply size={12} />
                      </button>
                      {msg.senderId === "you" && (
                        <>
                          <button onClick={() => handleStartEdit(msg.id, msg.content)} className="p-1 rounded hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-pointer" title="Edit">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => deleteMessage(msg.id)} className="p-1 rounded hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] cursor-pointer" title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
                placeholder={`Message #${activeChannelData?.name || "channel"}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              />
              <button
                onClick={() => setShowMentions(!showMentions)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary)] cursor-pointer"
              >
                <AtSign size={14} />
              </button>
              {showMentions && (
                <div className="absolute bottom-full mb-1 right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 w-48 z-10">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setInput(input + `@${m.name} `); setShowMentions(false); inputRef.current?.focus(); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--color-surface-hover)] cursor-pointer text-[var(--color-text-secondary)]"
                    >
                      @{m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button size="sm" onClick={handleSend} disabled={!input.trim()}>
              <Send size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Thread Panel */}
      {threadId && threadParent && (
        <div className="w-80 shrink-0 border-l border-[var(--color-border)] flex flex-col bg-[var(--color-surface)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <span className="text-sm font-bold text-[var(--color-text-primary)]">Thread</span>
            <button onClick={() => setThreadId(null)} className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Parent message */}
            <div className="flex gap-3 pb-3 border-b border-[var(--color-border)]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ backgroundColor: channelColors[threadParent.senderName.length % channelColors.length] }}>
                {getInitials(threadParent.senderName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">{threadParent.senderName}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{formatMsgTime(threadParent.timestamp)}</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">{threadParent.content}</p>
              </div>
            </div>
            {/* Replies */}
            {threadMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold" style={{ backgroundColor: msg.senderId === "you" ? "var(--color-primary)" : channelColors[msg.senderName.length % channelColors.length] }}>
                  {getInitials(msg.senderName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{msg.senderName}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{formatMsgTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Thread input */}
          <ThreadInput onSend={handleThreadReply} />
        </div>
      )}

      {/* New Channel Modal */}
      <Modal open={showNewChannel} onClose={() => setShowNewChannel(false)} title="Create Channel">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Channel Name</label>
            <input className={inputClass} placeholder="e.g. design-reviews" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Description</label>
            <input className={inputClass} placeholder="What is this channel about?" value={newChannelDesc} onChange={(e) => setNewChannelDesc(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewChannel(false)}>Cancel</Button>
            <Button onClick={handleCreateChannel} disabled={!newChannelName.trim()}>Create Channel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ThreadInput({ onSend }: { onSend: (content: string) => void }) {
  const [value, setValue] = useState("");
  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };
  return (
    <div className="px-3 py-3 border-t border-[var(--color-border)]">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
          placeholder="Reply..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={!value.trim()} className="p-2 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-40 cursor-pointer">
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}
