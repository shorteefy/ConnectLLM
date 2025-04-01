import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquarePlus, Pencil, Trash2 } from 'lucide-react';
import { Conversation } from '@/types';
import { groupConversations } from '@/lib/conversation-utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onNewChat: () => void;
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onDeleteConversation,
  onUpdateTitle,
  onNewChat,
  isSidebarOpen
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  if (!isSidebarOpen) return null;
  
  const groupedConversations = groupConversations(conversations);
  
  const handleEditStart = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };
  
  const handleEditSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmedTitle = editingTitle.trim();
    if (trimmedTitle) {
      onUpdateTitle(id, trimmedTitle);
    }
    setEditingId(null);
  };
  
  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end h-10 px-2 py-1 border-b">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-300 dark:hover:bg-sidebar-accent"
                onClick={onNewChat}
              >
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {groupedConversations.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                {group.title}
              </h3>
              
              <div className="space-y-1">
                {group.items.map((conv) => (
                  <div
                    key={conv.id}
                    className={`
                      flex items-center p-2 rounded-lg space-x-2 cursor-pointer group
                      ${selectedConversation === conv.id 
                        ? 'bg-sidebar-primary/10 text-sidebar-primary dark:bg-sidebar-primary/20 dark:text-sidebar-primary-foreground' 
                        : 'hover:bg-sidebar-primary/10 dark:hover:bg-sidebar-primary/20'}
                    `}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    {editingId === conv.id ? (
                      <div onClick={(e) => e.stopPropagation()} className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="h-8 flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded px-2"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(conv.id, e as unknown as React.MouseEvent);
                            if (e.key === "Escape") handleEditCancel(e as unknown as React.MouseEvent);
                          }}
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => handleEditSave(conv.id, e)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Save</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleEditCancel}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancel</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 truncate">{conv.title}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-gray-500 hover:text-sidebar-primary dark:text-gray-400 dark:hover:text-sidebar-primary-foreground"
                                  onClick={(e) => handleEditStart(conv, e)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Title</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Conversation</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center text-muted-foreground p-4">
              No conversations yet. Start a new chat!
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
