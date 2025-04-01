
import { Conversation, Message } from "@/types";
import { isToday, isYesterday, subDays, isAfter, startOfMonth } from "date-fns";

export function groupConversations(conversations: Conversation[]) {
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const lastWeek: Conversation[] = [];
  const thisMonth: Conversation[] = [];
  const older: Conversation[] = [];

  const oneWeekAgo = subDays(new Date(), 7);
  const monthStart = startOfMonth(new Date());

  conversations.forEach((conv) => {
    const date = new Date(conv.timestamp);
    if (isToday(date)) {
      today.push(conv);
    } else if (isYesterday(date)) {
      yesterday.push(conv);
    } else if (isAfter(date, oneWeekAgo)) {
      lastWeek.push(conv);
    } else if (isAfter(date, monthStart)) {
      thisMonth.push(conv);
    } else {
      older.push(conv);
    }
  });

  const result = [];

  if (today.length) result.push({ title: "Today", items: today });
  if (yesterday.length) result.push({ title: "Yesterday", items: yesterday });
  if (lastWeek.length) result.push({ title: "Previous 7 Days", items: lastWeek });
  if (thisMonth.length) result.push({ title: "This Month", items: thisMonth });
  if (older.length) result.push({ title: "Older", items: older });

  return result;
}

export function exportToMarkdown(conversation: Conversation, compareMessages?: Message[]) {
  let markdown = `# ${conversation.title}\n\n`;
  
  markdown += "## Primary Conversation\n\n";
  conversation.messages.forEach((message) => {
    const role = message.role === "user" ? "User" : "Assistant";
    const modelInfo = message.modelName 
      ? `\n\n*Model: ${message.modelName}${message.useDeepSeek ? " + DeepSeek" : ""}*` 
      : "";
    
    markdown += `### ${role}: ${new Date(message.timestamp).toLocaleString()}\n\n`;
    markdown += `${message.content}${modelInfo}\n\n`;
  });
  
  if (compareMessages && compareMessages.length > 0) {
    markdown += "## Comparison Conversation\n\n";
    compareMessages.forEach((message) => {
      const role = message.role === "user" ? "User" : "Assistant";
      const modelInfo = message.modelName 
        ? `\n\n*Model: ${message.modelName}${message.useDeepSeek ? " + DeepSeek" : ""}*` 
        : "";
      
      markdown += `### ${role}: ${new Date(message.timestamp).toLocaleString()}\n\n`;
      markdown += `${message.content}${modelInfo}\n\n`;
    });
  }
  
  return markdown;
}

export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
