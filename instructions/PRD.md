ConnectLLM Chat Application - Detailed Product Requirements Document (PRD)
1. Introduction
This document provides an exhaustive description of the user interface (UI), user experience (UX), interactions, and styling for the ConnectLLM chat application. It aims to capture all functional and visual aspects based on the provided codebase.
2. Core Application Structure (ChatPage.tsx, MainLayout.tsx)

    Initialization:
        Uses custom hooks (useConversationState, useSettingsForm, useMessageHandlers) to manage application state, form logic, and message handling logic respectively.
        Initial render might show nothing (null) until mounted state is true, preventing hydration errors.
    Layout Composition:
        The main export ChatPage primarily orchestrates state and passes props down to MainLayout.
        MainLayout defines the primary visual structure: a fixed top Navbar, a flexible content area below, containing a potentially visible Sidebar on the left and the main chat/split view area on the right.
    Global Event Handling:
        Listens for a custom browser event newChat. When triggered, it calls the handleNewChat function (likely resetting the chat state).
    Responsiveness & View Modes:
        The layout adapts based on isSidebarOpen state and form.watch('isSplitView') value.
        Single View: Sidebar can be toggled. Chat area uses MessageList.
        Split View: Sidebar is forced open (!w-64 class overrides width). Chat area uses SplitView.
    Positioning:
        Navbar is fixed to the top (fixed-navbar class likely applies position: fixed or similar).
        Main content area (content-below-navbar) occupies remaining height and handles overflow (flex-1 overflow-hidden).
        Sidebar uses position: fixed to stay in place relative to the viewport below the navbar (h-[calc(100vh-3.5rem)] top-14).

3. Navbar (Navbar.tsx)

    Layout: Fixed height (h-14), uses Flexbox (flex items-center justify-between), has horizontal padding (px-4), a bottom border (border-b), and specific background (bg-card).
    Left Section:
        BrainCircuit icon (h-5 w-5).
        "ConnectLLM" text (text-xl font-bold), wrapped in a Link component pointing to the root (/).
    Right Section (Action Buttons): Arranged horizontally with spacing (space-x-2). All action buttons are icon buttons (variant="ghost" size="icon") with a specific size (h-10 w-10).
        Export Conversation:
            Icon: Download (h-5 w-5).
            Conditional Visibility: Renders only if selectedConversation exists and selectedConversation.messages.length > 0.
            Action (onClick): Calls handleExport, which in turn calls exportToMarkdown(selectedConversation, compareMessages). Passes compareMessages only if they exist (implicitly checking for split view).
            Interaction: Wrapped in TooltipProvider and Tooltip. TooltipTrigger wraps the button. TooltipContent displays "Export Conversation" on hover.
        Theme Toggle:
            Icon: Sun (h-5 w-5) if theme === "dark", otherwise Moon (h-5 w-5).
            Action (onClick): Calls setTheme to toggle between "light" and "dark".
            Interaction: Wrapped in TooltipProvider and Tooltip. TooltipTrigger wraps the button. TooltipContent displays "Light Mode" or "Dark Mode" dynamically based on the opposite of the current theme.
        Settings:
            Implementation: Renders the SettingsSheet component directly.
            Interaction: The trigger mechanism is within SettingsSheet, but it's wrapped in TooltipProvider and Tooltip here. TooltipTrigger wraps the SettingsSheet. TooltipContent displays "Settings" on hover.

4. Sidebar (Sidebar.tsx)

    Layout & Visibility:
        Uses Flexbox (flex flex-col h-full). Returns null if isSidebarOpen is false.
        Sidebar Toggle Button (in MainLayout.tsx):
            Conditional Visibility: Renders only if !form.watch('isSplitView').
            Positioning: position: fixed, placed top-left below the navbar (left-0 top-14 z-20), with margin (m-2).
            Styling: variant="ghost" size="icon", specific size (h-10 w-10), background (bg-background), hover effect (hover:bg-muted), no border/shadow.
            Icon: PanelLeftClose if isSidebarOpen, otherwise PanelLeftOpen.
            Action (onClick): Toggles the isSidebarOpen state.
    Sidebar Header:
        Layout: Uses Flexbox (flex justify-end), padding (p-2), bottom border (border-b).
        New Chat Button:
            Icon: MessageSquarePlus (h-5 w-5).
            Styling: variant="ghost" size="icon", specific size (h-10 w-10), hover background effect.
            Action (onClick): Calls onNewChat prop.
            Interaction: Wrapped in TooltipProvider and Tooltip. TooltipTrigger wraps the button. TooltipContent displays "New Chat" (positioned below the button: side="bottom").
    Conversation List Area:
        Layout: Takes remaining vertical space (flex-1), enables vertical scrolling (overflow-y-auto), has padding (p-4), vertical spacing between groups (space-y-4).
        Grouping:
            Uses groupConversations utility function based on date-fns (isToday, isYesterday, etc.) to categorize conversations by timestamp ("Today", "Yesterday", "Previous 7 Days", "This Month", "Older").
            Renders each group with a header (h3 tag, specific styling: text-sm font-medium text-muted-foreground dark:text-gray-400).
        Conversation Item:
            Layout: Uses Flexbox (flex items-center), padding (p-2), rounded corners (rounded-lg), horizontal spacing (space-x-2).
            Interaction: cursor-pointer. Clicking the item calls onSelectConversation(conv.id).
            Styling: Dynamically applies background/text colors based on selectedConversation === conv.id (selected state) vs. default/hover states. Uses specific text/background colors for light/dark modes.
            Title Display: Shows conv.title. Uses truncate to prevent overflow.
            Inline Editing Mode (Conditional Rendering editingId === conv.id):
                Replaces title and action icons with an input field and save/cancel buttons.
                Outer div uses onClick={e => e.stopPropagation()} to prevent selection when clicking within the edit area.
                Input Field:
                    Bound to editingTitle state. onChange updates the state.
                    Styling: Specific height (h-8), background/text/border colors for light/dark modes.
                    Interaction: autoFocus gives it focus immediately. onKeyDown handles "Enter" (calls handleEditSave) and "Escape" (calls handleEditCancel).
                Save Button: Icon Check (h-4 w-4), variant="ghost" size="icon", specific size (h-8 w-8). onClick calls handleEditSave(conv.id, e), stops propagation. Performs trim and calls onUpdateTitle only if trimmed title is not empty. Resets editingId.
                Cancel Button: Icon X (h-4 w-4), variant="ghost" size="icon", specific size (h-8 w-8). onClick calls handleEditCancel(e), stops propagation. Resets editingId.
            Default Display Mode (Hover Actions):
                Action icons container (div): Uses opacity-0 group-hover:opacity-100 transition-opacity to fade icons in only on item hover.
                Edit Button:
                    Icon: Pencil (h-4 w-4).
                    Styling: variant="ghost" size="icon", specific size (h-6 w-6), specific text/hover colors for light/dark modes.
                    Action (onClick): Calls handleEditStart(conv, e), stops propagation. Sets editingId and editingTitle.
                    Interaction: Wrapped in TooltipProvider/Tooltip. TooltipContent shows "Edit Title".
                Delete Button:
                    Icon: Trash2 (h-4 w-4).
                    Styling: variant="ghost" size="icon", specific size (h-6 w-6), specific text/hover colors for light/dark modes.
                    Action (onClick): Calls onDeleteConversation(conv.id), stops propagation.
                    Interaction: Wrapped in TooltipProvider/Tooltip. TooltipContent shows "Delete Conversation".
        Conversation Selection Logic (onSelectConversation in MainLayout.tsx):
            Finds the selected Conversation object.
            Resets the settings form (form.reset()).
            Sets form values (isSplitView, model, compareModel) based on the selected conversation's stored properties. Sets isSplitView first due to dependencies.
            Triggers form validation/update (form.trigger([...])).
            Sets messages and compareMessages based on whether selectedConv.isSplitView is true.
            Persists current form settings to localStorage.
            Updates the selectedConversation state ID.
            If conversation not found, clears messages and sets ID.
        Conversation Deletion Logic (onDeleteConversation in MainLayout.tsx):
            Filters the deleted conversation from the conversations array.
            If the deleted conversation was the selected one, it resets selectedConversation to null, clears messages and compareMessages, and generates new primarySessionId and secondarySessionId.
            Updates localStorage with the filtered conversations.
            Updates the conversations state.

5. Chat Area - Single View (MessageList.tsx)

    Layout: Main container uses cn for class merging, allows className override, flex-1 overflow-y-auto p-4. Inner container max-w-4xl mx-auto space-y-6 pt-2.
    Empty State (messages.length === 0):
        Layout: Centered Flexbox (flex flex-col items-center justify-center h-full), spacing (space-y-6), padding (p-8), text alignment (text-center).
        Content:
            Title: "Welcome to ConnectLLM" (h1, text-3xl font-bold text-primary).
            Subtitle: "Your intelligent conversation companion" (p, text-muted-foreground text-lg).
            Guide Box: Specific background (bg-secondary/40 dark:bg-secondary/60), rounded corners, padding (p-6), max-width (max-w-md), shadow (shadow-sm). Contains:
                Title: "Getting Started" (h2, text-xl font-semibold).
                Numbered Steps (1, 2, 3) with headings (h3, font-medium) and descriptions (p, text-sm text-muted-foreground). Explains model choice, Deep Seek, and starting chat. Text is left-aligned within the box.
    Message Rendering (messages.length > 0):
        Maps messages array to MessageBubble components, passing message and useDeepSeek props.
    Loading Indicator:
        Conditionally renders <LoadingIndicator /> if isWaiting is true.
    Auto-Scroll:
        Uses useRef (messagesEndRef) attached to an empty div at the end of the list.
        useEffect hook calls scrollToBottom (which uses scrollIntoView({ behavior: "smooth" })) whenever the messages array changes.

6. Chat Area - Split View (SplitView.tsx)

    Layout: Main container (div) uses cn, allows className override, applies containerStyles (flex row, full height, overflow hidden). Uses useRef (containerRef).
    Panels (Left & Right):
        Layout: div with display: flex, flex-direction: column. Width is dynamically set via inline style (style={{ width: \${splitPosition}%` }}or100 - splitPosition`).
        Header:
            Layout: div with padding (p-2), centered text (text-center), medium font (font-medium), sticky positioning (sticky top-0 z-10), background blur (backdrop-blur-sm), specific background color (bg-gray-100 dark:bg-gray-800).
            Content: Displays leftModelName or rightModelName. Appends " + deepseek" conditionally based on form?.watch("use_deepseek") and model type check.
        Message Area:
            Layout: div with chatContainerStyles (flex: 1, overflow-y: auto, padding-top).
            Content: Renders <MessageList messages={leftMessages/rightMessages} ... />, passing relevant props (isWaiting, useDeepSeek).
    Resizable Divider:
        Layout: div absolutely positioned (absolute top-0 bottom-0), fixed width (w-2), specific horizontal position based on splitPosition (style={{ left: \calc(${splitPosition}% - 4px)` }}). Uses Flexbox to center icon (flex items-center justify-center). Specific background (bg-primary/10). Cursor style (cursor-col-resize`).
        Icon: GripVertical (h-4 w-4 text-muted-foreground).
        Interaction:
            onMouseDown: Sets isDragging state to true.
            useEffect hook: Adds/removes global mousemove and mouseup listeners when isDragging changes.
            handleMouseMove: Calculates new position based on mouse coordinates relative to the container. Clamps position between 20% and 80%. Updates splitPosition state.
            handleMouseUp: Sets isDragging state to false.
            Visual Feedback: Background changes (isDragging && "bg-primary/20") while dragging.

7. Message Bubbles (MessageBubble.tsx)

    Layout & Role Styling:
        Outer div uses Flexbox (flex) with justify-end (user) or justify-start (assistant).
        Inner div contains content. Styling differs significantly based on message.role:
            User: bg-gray-50 dark:bg-gray-800, max-w-[60%].
            Assistant: bg-gray-100 dark:bg-gray-900, border, inline-block, max-w-full w-full.
        Common styling: rounded-lg px-3 py-1.
    Image Display:
        Conditional Rendering: Renders only if message.images && message.images.length > 0.
        Layout: Uses CSS Grid (grid). Number of columns (grid-cols-1/2/3) depends on message.images.length. Gap between images (gap-2). Full width (w-full). Margin bottom (mb-4) added if there's also text content.
        Image Loading (useEffect hook triggered by message.images):
            Iterates through message.images (IDs).
            Calls getImage(id) (async utility likely returning a Blob URL).
            Stores URLs in imageUrls state (Map).
            Includes console logging for debugging loading process.
            Cleanup function revokes generated ObjectURLs to prevent memory leaks.
        Individual Image Wrapper (div): key={id}, cursor-pointer, relative positioning (relative), fixed aspect ratio (pb-[100%]), overflow hidden. onClick sets selectedImage state to the id.
        Image Element (img): src bound to imageUrls.get(id). alt="Uploaded content". Styling for positioning and fit (absolute inset-0 w-full h-full object-cover rounded-lg), hover effect (hover:opacity-90 transition-opacity). onError handler logs error and sets src to a fallback SVG placeholder.
        Loading Placeholder: If imageUrl is not yet available, renders a placeholder div with background color and centered "Loading image..." text.
    Image Preview Dialog:
        Uses Dialog, DialogContent, DialogTitle from @/components/ui/dialog.
        Controlled by selectedImage state (open={!!selectedImage}, onOpenChange={() => setSelectedImage(null)}).
        DialogContent: Constrained size (max-w-[95vw] sm:max-w-4xl max-h-[90vh]), no padding (p-0), overflow hidden, margin (mx-2 sm:mx-4).
        DialogTitle: Hidden for screen readers (sr-only).
        Image (img): Renders only if selectedImage and its URL exist. src from imageUrls. alt="Preview". Constrained size (max-w-full max-h-[90vh]), object fit (object-contain), rounded corners, padding (p-2 sm:p-4). Centered within the dialog content area.
    Reasoning Section (Conditional Rendering showReasoning):
        Condition: message.role === 'assistant', model is 'gpt-4o' or 'gpt-4o-mini', and (message.useDeepSeek is true OR (useDeepSeek prop is true AND isStreaming)).
        Layout: Outer div with margin bottom (mb-4).
        Toggle Button:
            button element. onClick toggles isReasoningExpanded state.
            Layout: Flexbox (flex items-center gap-2).
            Styling: Specific text colors/hover states (text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors).
            Icon: SVG path, rotates based on isReasoningExpanded (transition-transform ${isReasoningExpanded ? 'rotate-45' : ''}).
            Label: "Reasoning".
            Timer Display: span showing {elapsedTime}s. Appends '...' if !hasReasoning (i.e., still streaming). Styling (text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded).
            Download Button:
                Icon: Download (w-4 h-4).
                Styling: Margin left (ml-2), padding (p-1), hover background, rounded corners.
                Action (onClick): Stops event propagation. Gets reasoning content. Creates a Blob, generates ObjectURL, creates temporary <a> element, sets href and download attributes, simulates click, removes element, revokes URL.
                Interaction: Wrapped in TooltipProvider/Tooltip. TooltipContent shows "Download Reasoning".
        Reasoning Content Area:
            Outer div: Styling for background (bg-gray-50 dark:bg-gray-800), border (border border-gray-200 dark:border-gray-700), rounded corners, transition (transition-all duration-200 ease-in-out), overflow hidden. Dynamic inline styles for maxHeight, opacity, padding, marginBottom based on isReasoningExpanded to create expand/collapse animation.
            Inner div: ref={reasoningContentRef}. Styling for text (text-xs sm:text-sm text-gray-600 dark:text-gray-300), uses Tailwind prose classes, allows overflow (overflow-y-auto overflow-x-hidden). Dynamic maxHeight style based on isReasoningExpanded. onScroll handler calls handleScroll.
            Content: Renders <MarkdownContent content={reasoning || message.content} ...clearfix />. Uses reasoning if available, otherwise falls back to message.content (during streaming).
        Content Splitting: message.content.split('-----REASONING_END-----') determines hasReasoning, reasoning, and actualContent.
        Timer Logic (useEffect): Tracks elapsedTime. Starts timer (setInterval) when streaming begins (isStreaming && !hasReasoning). Updates elapsedTime state and message.reasoningTime property every 100ms. Stops timer and records final time when reasoning ends (hasReasoning). Uses startTimeRef.
        Auto-Scroll Logic (useEffect, handleScroll): Scrolls reasoningContentRef to bottom during streaming if showReasoning is true and userScrolled is false. handleScroll detects if user has scrolled away from the bottom and sets userScrolled state accordingly.
    Actual Content Display:
        Conditional Rendering: Renders only if actualContent exists OR if message.images exist.
        Layout: div with break-words, Tailwind prose classes, specific text size (text-sm sm:text-base).
        Content: Renders <MarkdownContent content={actualContent ? actualContent : '[Image]'} ... />. Shows "[Image]" placeholder if only images are present.
    Metadata Display (Conditional message.role === 'assistant'):
        Layout: div with margin top (mt-2), padding top (pt-1), top border (border-t border-gray-200 dark:border-gray-700), specific text styling (text-xs text-gray-500 dark:text-gray-400), vertical spacing (space-y-0.5).
        Content (Conditionally Rendered):
            Model Name: If message.modelName exists. Includes (+DeepSeek) if message.useDeepSeek is true.
            Temperature/MaxTokens: If model is 'gpt-4o'/'gpt-4o-mini' and values exist.
            Reasoning Effort: If model is 'o1'/'o3-mini' and value exists.
            Uses span with specific styling for values.

8. Input Area (InputArea.tsx)

    Layout: Outer div with top border (border-t), padding (p-4). Inner div with max-width (max-w-4xl mx-auto), vertical spacing (space-y-4).
    API Key Warning:
        Conditional Rendering: If selected model requires OpenAI key (gpt-4o, gpt-4o-mini, o1) AND !form.watch("openai_key").
        Styling: Specific text/background/border colors (text-amber-600 bg-amber-50 border-amber-200), padding (p-3), rounded corners. Displays warning text about setting the key in Settings.
    Selected Image Previews:
        Conditional Rendering: If selectedFiles.length > 0.
        Layout: Flexbox (flex flex-wrap gap-2).
        Individual Preview (div): key={index}, relative positioning (relative group).
            Image (img): src={URL.createObjectURL(file)}, fixed size (h-20 w-20), object fit (object-cover), rounded corners, border, shadow.
            Remove Button (button): Absolutely positioned top-right (absolute top-1 right-1), specific styling (bg-red-500 text-white rounded-full p-1), appears on hover (opacity-0 group-hover:opacity-100 transition-opacity). onClick filters the file from selectedFiles state and calls onImagesSelected prop. Displays '×'.
    Main Input Row: Layout uses Flexbox (flex space-x-2).
        Image Upload Button:
            Conditional Rendering: Complex condition checks !form.watch("use_deepseek"), model types (gpt-4o, gpt-4o-mini, o1, but NOT o3-mini in split view), isSplitView, and openai_key presence. Essentially enables upload for vision models if the key is set and deepseek isn't active.
            Implementation: Uses a hidden file input (input type="file" ref={fileInputRef} ... className="hidden") and a visible Button.
            Button: variant="ghost" size="icon", specific size (h-10 w-10), title="Attach images". Icon Upload (h-5 w-5). onClick triggers fileInputRef.current?.click().
            File Input: accept="image/*", multiple. onChange calls handleFileChange.
            handleFileChange: Validates files (type: jpg/png, size: <4MB, count: <=4) using alert for errors. Updates selectedFiles state. Calls onImagesSelected prop. Resets the file input value to allow re-selecting the same file.
            Disabled State: Button is disabled if selectedFiles.length >= 4 or isWaiting is true, or if API key is missing when required. File input is also disabled based on isWaiting and API key status.
        Textarea:
            Layout: Takes remaining space (flex-1), minimum height (min-h-[50px]), maximum height (max-h-[200px]), vertical resize enabled (resize-y).
            State: value bound to input prop. onChange calls setInput(e.target.value) only if !isWaiting.
            Interaction: onKeyDown checks for "Enter" without "Shift" and !isWaiting. If conditions met, prevents default newline and calls handleSendWrapper.
            Placeholder: Dynamically set based on isWaiting, API key status, or default "Type a message...".
            Disabled State: disabled if isWaiting or API key is missing when required. Applies specific styling (cursor-not-allowed bg-muted).
        Send Button Area: Layout (div flex items-center), relative positioning (relative).
            Model Indicator (Tooltip):
                Conditional Rendering: If form.watch("openai_key") exists AND !form.watch('isSplitView').
                Positioning: Absolutely positioned above the button (absolute -top-8 left-1/2 -translate-x-1/2), prevents wrapping (whitespace-nowrap).
                Styling: Inline flex (inline-flex items-center gap-1.5), padding (px-2.5 py-0.5), rounded corners (rounded-full), specific text/background/border colors for light/dark modes.
                Content: BrainCircuit icon (h-3 w-3), model name (form.watch("model")), optional " + deepseek".
                Interaction: Wrapped in TooltipProvider/Tooltip. TooltipTrigger wraps the indicator div. TooltipContent shows "Current AI model".
            Send Button:
                Button component. Text is "Send" or "Waiting..." based on isWaiting.
                Action (onClick): Calls handleSendWrapper.
                handleSendWrapper: Calls handleSend prop, clears selectedFiles state, resets the hidden file input.
                Disabled State: disabled if isWaiting or API key is missing when required.

9. General UX & Styling Notes

    Frameworks/Libraries: Built with React + Vite, Tailwind CSS, shadcn/ui components (Button, Textarea, Dialog, Tooltip, etc.), lucide-react for icons, date-fns for date formatting, react-hook-form for settings form.
    Styling: Heavily relies on Tailwind CSS utility classes and cn utility for merging classes. Includes specific light/dark mode styling (dark: prefix). Uses prose classes for Markdown rendering.
    State Management: Primarily uses React state (useState, useRef) and custom hooks encapsulating related state and logic. Form state managed by react-hook-form. Conversation/message state likely managed within useConversationState. Settings persisted to localStorage.
    Interactions: Uses standard button clicks, input changes, hover effects, tooltips, drag-and-drop (for resizing split view), keyboard events (Enter/Escape).
    Feedback: Provides visual feedback for loading states, disabled states, hover states, drag states, selected states, API key requirements, and file validation errors.
    Transitions: Uses CSS transitions for sidebar width changes, hover opacity changes (sidebar actions, image previews), and reasoning section expand/collapse. Scroll behavior is smooth.