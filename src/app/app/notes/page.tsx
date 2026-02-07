"use client";

import React, { useState, useRef } from "react";
import {
    FileText,
    Folder,
    Plus,
    Upload,
    MoreVertical,
    Search,
    LayoutGrid,
    List,
    X,
    FileIcon,
    Image as ImageIcon,
    Trash2,
    Download,
    FolderPlus,
    Palette,
    Check,
    ChevronDown,
    Type,
    FileSpreadsheet,
    FileVideo,
    FileArchive,
    FileCode,
    FileAudio,
    FileDigit,
    FileImage
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DocumentEditor from "./_components/DocumentEditor";

interface MaterialFolder {
    _id: string;
    name: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

interface MaterialResource {
    _id: string;
    title: string;
    type: 'file' | 'note';
    user_id: string;
    folder_id: string | null;
    content: string | null;
    file_path: string | null;
    file_url: string | null;
    file_size: string | null;
    mime_type: string | null;
    created_at: string;
    updated_at: string;
}

const FOLDER_COLORS = [
    { name: "Purple", value: "#A78BFA" },
    { name: "Blue", value: "#60A5FA" },
    { name: "Green", value: "#34D399" },
    { name: "Yellow", value: "#FBBF24" },
    { name: "Red", value: "#F87171" },
    { name: "Pink", value: "#F472B6" },
    { name: "Indigo", value: "#818CF8" },
    { name: "Orange", value: "#FB923C" },
];

const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'svg', 'pptx', 'docx', 'xlsx'];

export default function NotesPage() {
    const [folders, setFolders] = useState<MaterialFolder[]>([]);
    const [resources, setResources] = useState<MaterialResource[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [selectedFolderId, setSelectedFolderId] = useState("all");

    // Folder Creation State
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);

    // File Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Document Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [activeDocument, setActiveDocument] = useState<{ id: string; name: string; content: string } | null>(null);

    // Folder Rename State
    const [editingFolder, setEditingFolder] = useState<MaterialFolder | null>(null);
    const [editFolderName, setEditFolderName] = useState("");

    // Folder Color logic (visual only for now as API doesn't store color)
    const getFolderColor = (folderId: string) => {
        const index = folderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return FOLDER_COLORS[index % FOLDER_COLORS.length].value;
    };

    const fetchFolders = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("https://shiksha-gpt.com/api/folders/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFolders(data);
            }
        } catch (error) {
            console.error("Failed to fetch folders", error);
        }
    };

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            let url = "https://shiksha-gpt.com/api/resources/";
            const params = new URLSearchParams();
            if (selectedFolderId !== "all") {
                params.append("folder_id", selectedFolderId);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setResources(data);
            }
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchFolders();
    }, []);

    React.useEffect(() => {
        fetchResources();
    }, [selectedFolderId]);

    const handleCreateBlankDocument = () => {
        setActiveDocument(null);
        setIsEditorOpen(true);
    };

    const handleEditDocument = (resource: MaterialResource) => {
        setActiveDocument({ id: resource._id, name: resource.title, content: resource.content || "" });
        setIsEditorOpen(true);
    };

    const handleSaveDocument = async (title: string, content: string) => {
        try {
            const token = localStorage.getItem("access_token");
            const payload = {
                title: title || "Untitled Document",
                type: "note",
                folder_id: selectedFolderId === "all" ? null : selectedFolderId,
                content: content
            };

            const response = await fetch("https://shiksha-gpt.com/api/resources/note", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await fetchResources();
                setIsEditorOpen(false);
                setActiveDocument(null);
            }
        } catch (error) {
            console.error("Failed to save document", error);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("https://shiksha-gpt.com/api/folders/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: newFolderName.trim() })
            });

            if (response.ok) {
                await fetchFolders();
                setNewFolderName("");
                setIsFolderModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create folder", error);
        }
    };

    const handleUpdateFolder = async (folderId: string, newName: string) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`https://shiksha-gpt.com/api/folders/${folderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (response.ok) {
                await fetchFolders();
                setEditingFolder(null);
            }
        } catch (error) {
            console.error("Failed to update folder", error);
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!confirm("Are you sure you want to delete this folder? All contents might be affected.")) return;
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`https://shiksha-gpt.com/api/folders/${folderId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchFolders();
                if (selectedFolderId === folderId) setSelectedFolderId("all");
            }
        } catch (error) {
            console.error("Failed to delete folder", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side size check (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setToast({ message: "File is too large. Maximum size is 10MB.", type: "error" });
            setTimeout(() => setToast(null), 3000);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension && ALLOWED_EXTENSIONS.includes(extension)) {
            setIsUploading(true);
            try {
                const token = localStorage.getItem("access_token");
                const formData = new FormData();
                formData.append("file", file);
                if (selectedFolderId !== "all") {
                    formData.append("folder_id", selectedFolderId);
                }

                const response = await fetch("https://shiksha-gpt.com/api/resources/upload", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                if (response.ok) {
                    await fetchResources();
                    setIsUploadModalOpen(false);
                    setToast({ message: "File uploaded successfully", type: "success" });
                    setTimeout(() => setToast(null), 3000);
                } else {
                    setToast({ message: "Failed to upload file", type: "error" });
                    setTimeout(() => setToast(null), 3000);
                }
            } catch (error) {
                console.error("Failed to upload file", error);
                setToast({ message: "An error occurred during upload", type: "error" });
                setTimeout(() => setToast(null), 3000);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        } else {
            setToast({
                message: `File type .${extension} is not supported. Please upload ${ALLOWED_EXTENSIONS.join(', ')}`,
                type: "error"
            });
            setTimeout(() => setToast(null), 3000);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteResource = async (resourceId: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`https://shiksha-gpt.com/api/resources/${resourceId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchResources();
            }
        } catch (error) {
            console.error("Failed to delete resource", error);
        }
    };

    const handleDownload = async (fileUrl: string, fileName: string) => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch("/api/proxy/file-download", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ fileUrl })
            });

            if (!response.ok) {
                console.error("Download failed:", response.status, response.statusText);
                setToast({ message: "Failed to download file.", type: "error" });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            setToast({ message: "An error occurred during download.", type: "error" });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const getFileIcon = (item: any) => {
        if (item.type === 'note') {
            return {
                icon: <FileText className="w-5 h-5 text-indigo-500" />,
                bg: "bg-indigo-50 dark:bg-indigo-500/10"
            };
        }

        const extension = item.title?.split('.').pop()?.toLowerCase() || item.mime_type?.split('/').pop()?.toLowerCase();

        switch (extension) {
            case 'pdf':
                return {
                    icon: <FileText className="w-5 h-5 text-red-500" />,
                    bg: "bg-red-50 dark:bg-red-500/10"
                };
            case 'docx':
            case 'doc':
                return {
                    icon: <FileDigit className="w-5 h-5 text-blue-500" />,
                    bg: "bg-blue-50 dark:bg-blue-500/10"
                };
            case 'xlsx':
            case 'xls':
            case 'csv':
                return {
                    icon: <FileSpreadsheet className="w-5 h-5 text-emerald-500" />,
                    bg: "bg-emerald-50 dark:bg-emerald-500/10"
                };
            case 'pptx':
            case 'ppt':
                return {
                    icon: <FileDigit className="w-5 h-5 text-orange-500" />,
                    bg: "bg-orange-50 dark:bg-orange-500/10"
                };
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
            case 'webp':
                return {
                    icon: <FileImage className="w-5 h-5 text-purple-500" />,
                    bg: "bg-purple-50 dark:bg-purple-500/10"
                };
            case 'mp4':
            case 'mov':
            case 'avi':
                return {
                    icon: <FileVideo className="w-5 h-5 text-pink-500" />,
                    bg: "bg-pink-50 dark:bg-pink-500/10"
                };
            case 'zip':
            case 'rar':
            case '7z':
                return {
                    icon: <FileArchive className="w-5 h-5 text-amber-500" />,
                    bg: "bg-amber-50 dark:bg-amber-500/10"
                };
            default:
                return {
                    icon: <FileIcon className="w-5 h-5 text-slate-400" />,
                    bg: "bg-slate-50 dark:bg-slate-500/10"
                };
        }
    };

    const filteredItems = [
        ...folders.map(f => ({ ...f, itemType: 'folder' as const, title: f.name, id: f._id })),
        ...resources.map(r => ({ ...r, itemType: 'file' as const, id: r._id, name: r.title }))
    ].filter(item => {
        const matchesSearch = (item as any).title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item as any).name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" ||
            (filterType === "folder" && item.itemType === "folder") ||
            (filterType === "file" && item.itemType === "file");

        // When a folder is selected, we only show files inside it
        const matchesFolder = selectedFolderId === "all"
            ? item.itemType === "folder" || !(item as any).folder_id // Show folders and root files
            : (item.itemType === "file" && (item as any).folder_id === selectedFolderId);

        return matchesSearch && matchesType && matchesFolder;
    });

    return (
        <div className="max-w-[1500px] mx-auto space-y-5 pt-0 p-4">
            {/* Dashboard Header - Only show when editor is closed */}
            <AnimatePresence mode="wait">
                {!isEditorOpen && (
                    <motion.div
                        key="dashboard-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold dark:text-white tracking-tight">Notes & Materials</h1>
                                <p className="text-slate-500 text-xs">Manage your study materials and organized notes.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search materials..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-100 dark:bg-white/5 border-none py-2.5 pl-10 pr-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white w-64"
                                />
                            </div>

                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-[#1A1A1E] shadow-sm text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-[#1A1A1E] shadow-sm text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsFolderModalOpen(true)}
                                className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                            >
                                <FolderPlus className="w-4 h-4" /> Create Folder
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                {isEditorOpen ? (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full"
                    >
                        <DocumentEditor
                            initialTitle={activeDocument?.name}
                            initialContent={activeDocument?.content}
                            onSave={handleSaveDocument}
                            onClose={() => {
                                setIsEditorOpen(false);
                                setActiveDocument(null);
                            }}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Quick Actions / Filters */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Showing Materials for:</span>
                                    <div className="flex items-center gap-2">
                                        {selectedFolderId !== "all" && (
                                            <button
                                                onClick={() => setSelectedFolderId("all")}
                                                className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[10px] font-bold text-primary transition-colors"
                                            >
                                                ← All
                                            </button>
                                        )}
                                        <div className="relative">
                                            <select
                                                value={selectedFolderId}
                                                onChange={(e) => setSelectedFolderId(e.target.value)}
                                                className="appearance-none bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold px-3 py-1.5 pr-8 outline-none cursor-pointer dark:text-white uppercase tracking-wider"
                                            >
                                                <option value="all">All Folders</option>
                                                {folders.map(f => (
                                                    <option key={f._id} value={f._id}>{f.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                                <div className="flex items-center gap-1.5">
                                    {['all', 'folder', 'file'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filterType === type
                                                ? "bg-primary/20 text-primary"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                }`}
                                        >
                                            {type === 'all' ? 'All' : type + 's'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCreateBlankDocument}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Create Document
                                </button>

                            </div>
                        </div>

                        {/* Content Grid/List */}
                        <div className="relative">
                            {filteredItems.length === 0 && searchQuery ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-[#121214] border border-dashed border-slate-300 dark:border-slate-800 rounded-[32px]">
                                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                                        <FileText className="w-8 h-8 text-primary/40" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold dark:text-white">No items found</h3>
                                        <p className="text-slate-500 text-sm max-w-[250px]">Try searching for something else or upload a new file.</p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={viewMode === "grid"
                                        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5"
                                        : "flex flex-col gap-2"}
                                >
                                    {/* Add Material Card (Grid Mode Only) */}
                                    {viewMode === "grid" && !searchQuery && (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => setIsUploadModalOpen(true)}
                                            className="group bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all h-[155px]"
                                        >
                                            <div className="w-12 h-12 bg-white dark:bg-[#1A1A1E] rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform text-primary border border-slate-100 dark:border-slate-800">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold dark:text-white group-hover:text-primary transition-colors">Add Material</p>
                                                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Upload Files</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Add Document Card (Grid Mode Only) */}
                                    {viewMode === "grid" && !searchQuery && (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={handleCreateBlankDocument}
                                            className="group bg-primary/5 dark:bg-primary/10 border-2 border-dashed border-primary/20 dark:border-primary/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-all h-[155px]"
                                        >
                                            <div className="w-12 h-12 bg-white dark:bg-primary/20 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform text-primary border border-primary/10">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold dark:text-white group-hover:text-primary transition-colors">Blank Document</p>
                                                <p className="text-[9px] text-primary/60 mt-1 uppercase tracking-widest font-bold">Create New</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {filteredItems.map((item) => (
                                        <motion.div
                                            layout
                                            key={item.itemType + item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => {
                                                if (item.itemType === 'folder') {
                                                    setSelectedFolderId(item.id);
                                                } else if (item.itemType === 'file' && (item as any).type === 'note') {
                                                    handleEditDocument(item as any);
                                                } else if (item.itemType === 'file' && (item as any).file_url) {
                                                    handleDownload((item as any).file_url, (item as any).name || 'download');
                                                }
                                            }}
                                            className={`group bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/50 hover:shadow-xl cursor-pointer overflow-hidden ${viewMode === "grid" ? "flex flex-col h-[155px]" : "p-3 flex items-center justify-between"
                                                }`}
                                            transition={{
                                                layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
                                            }}
                                        >
                                            {viewMode === "grid" && (
                                                <motion.div layout className="h-[95px] w-full bg-slate-50 dark:bg-white/5 flex items-center justify-center relative group-hover:bg-slate-100/50 dark:group-hover:bg-white/10 transition-colors">
                                                    {item.itemType === 'folder' ? (
                                                        <motion.div
                                                            layout
                                                            layoutId={`icon-${item.id}`}
                                                            className="w-11 h-11 rounded-xl flex items-center justify-center relative shadow-sm"
                                                            style={{ backgroundColor: `${getFolderColor(item.id)}15` }}
                                                        >
                                                            <Folder className="w-7 h-7" style={{ color: getFolderColor(item.id) }} fill={getFolderColor(item.id)} />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            layout
                                                            layoutId={`icon-${item.id}`}
                                                            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 ${getFileIcon(item).bg}`}
                                                        >
                                                            {getFileIcon(item).icon}
                                                        </motion.div>
                                                    )}

                                                    {/* Overlay Actions */}
                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingFolder(item as any);
                                                                setEditFolderName((item as any).name || (item as any).title);
                                                            }}
                                                            className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-primary/20 rounded-lg shadow-sm group/edit"
                                                        >
                                                            <Type className="w-3.5 h-3.5 text-slate-500 group-hover/edit:text-primary" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (item.itemType === 'folder') {
                                                                    handleDeleteFolder(item.id);
                                                                } else {
                                                                    handleDeleteResource(item.id);
                                                                }
                                                            }}
                                                            className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-red-500/20 rounded-lg shadow-sm group/del"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-slate-500 group-hover/del:text-red-500" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <motion.div layout className={viewMode === "grid" ? "p-3 bg-white dark:bg-[#121214] border-t border-slate-50 dark:border-slate-800/50" : "flex items-center gap-3 flex-1 px-1"}>
                                                {viewMode !== "grid" && (
                                                    item.itemType === 'folder' ? (
                                                        <motion.div layout layoutId={`icon-${item.id}`} className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10">
                                                            <Folder className="w-4.5 h-4.5 text-primary" fill="currentColor" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            layout
                                                            layoutId={`icon-${item.id}`}
                                                            className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${getFileIcon(item).bg}`}
                                                        >
                                                            {getFileIcon(item).icon}
                                                        </motion.div>
                                                    )
                                                )}
                                                <div className="min-w-0">
                                                    <motion.h3 layout layoutId={`title-${item.id}`} className="text-[12px] font-bold dark:text-white truncate group-hover:text-primary transition-colors leading-tight">{item.name}</motion.h3>
                                                    <motion.div layout className="flex items-center gap-2 mt-1.5">
                                                        {item.itemType === 'folder' && (
                                                            <motion.div layout className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getFolderColor(item.id) }} />
                                                        )}
                                                        <motion.div layout className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
                                                            {item.itemType === 'folder' ? (
                                                                <span className="text-primary font-bold">Folder</span>
                                                            ) : (item as any).file_size ? (
                                                                <span className="font-bold">{(parseInt((item as any).file_size) / 1024 / 1024).toFixed(2)} MB</span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-[4px] font-extrabold shadow-sm">
                                                                    Note
                                                                </span>
                                                            )}
                                                            <span className="opacity-40">•</span>
                                                            <span className="opacity-70 font-bold">{new Date((item as any).created_at).toLocaleDateString()}</span>
                                                        </motion.div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            {viewMode !== "grid" && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {(item as any).file_url && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownload((item as any).file_url, (item as any).name || 'download');
                                                            }}
                                                            className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg text-slate-400"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (item.itemType === 'folder') handleDeleteFolder(item.id);
                                                            else handleDeleteResource(item.id);
                                                        }}
                                                        className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals & Overlays */}
            <AnimatePresence>
                {/* Create Folder Modal */}
                {isFolderModalOpen && (
                    <motion.div key="folder-modal-wrapper" className="relative z-[100]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFolderModalOpen(false)}
                            key="folder-backdrop"
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm w-screen h-screen"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            key="folder-modal-content"
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[450px] bg-white dark:bg-[#1A1A1E] rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold dark:text-white">Create New Folder</h2>
                                <button
                                    onClick={() => setIsFolderModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Folder Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="e.g. Mathematics, Unit 1..."
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Palette className="w-3.5 h-3.5" /> Select Color
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {FOLDER_COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => setSelectedColor(color.value)}
                                                className={`h-10 rounded-xl transition-all relative flex items-center justify-center`}
                                                style={{ backgroundColor: color.value }}
                                            >
                                                {selectedColor === color.value && (
                                                    <Check className="w-5 h-5 text-white" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsFolderModalOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateFolder}
                                    disabled={!newFolderName.trim()}
                                    className="flex-1 py-3 px-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    Create Folder
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Upload Material Modal */}
                {isUploadModalOpen && (
                    <motion.div key="upload-modal-wrapper" className="relative z-[100]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isUploading && setIsUploadModalOpen(false)}
                            key="upload-backdrop"
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm w-screen h-screen"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            key="upload-modal-content"
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[450px] bg-white dark:bg-[#1A1A1E] rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold dark:text-white">Upload Material</h2>
                                <button
                                    onClick={() => !isUploading && setIsUploadModalOpen(false)}
                                    className={`p-2 rounded-xl transition-colors text-slate-400 ${isUploading ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-100 dark:hover:bg-white/5"}`}
                                    disabled={isUploading}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                className={`group border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 transition-all ${isUploading
                                    ? "border-primary/50 bg-primary/5 cursor-wait"
                                    : "border-slate-200 dark:border-slate-800 cursor-pointer hover:border-primary/50 hover:bg-primary/5"
                                    }`}
                            >
                                <div className={`w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary ${!isUploading && "group-hover:scale-110"} transition-transform`}>
                                    {isUploading ? (
                                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    ) : (
                                        <Upload className="w-8 h-8" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold dark:text-white">
                                        {isUploading ? "Uploading..." : "Click to select file"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {isUploading ? "Please wait while we process your file" : "Maximum file size 10MB"}
                                    </p>
                                </div>
                            </div>

                            {!isUploading && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Supported Formats</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {ALLOWED_EXTENSIONS.map((ext) => (
                                            <span key={ext} className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md text-[9px] font-bold text-slate-500 uppercase">
                                                .{ext}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 italic">
                                    Files will be saved in: <span className="text-primary font-bold">{selectedFolderId === 'all' ? 'Root' : folders.find(f => f._id === selectedFolderId)?.name}</span>
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <motion.div
                        key="toast-notification"
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 50, x: "-50%" }}
                        className={`fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === "success"
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "bg-red-500 border-red-400 text-white"
                            }`}
                    >
                        {toast.type === "success" ? (
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        ) : (
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <X className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <p className="text-sm font-bold tracking-wide">{toast.message}</p>
                    </motion.div>
                )}

                {/* Edit Folder Modal */}
                {editingFolder && (
                    <motion.div key="edit-folder-wrapper" className="relative z-[100]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingFolder(null)}
                            key="edit-folder-backdrop"
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm w-screen h-screen"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            key="edit-folder-modal-content"
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[450px] bg-white dark:bg-[#1A1A1E] rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold dark:text-white">Rename Folder</h2>
                                <button
                                    onClick={() => setEditingFolder(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editFolderName}
                                        onChange={(e) => setEditFolderName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateFolder(editingFolder._id, editFolderName)}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEditingFolder(null)}
                                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateFolder(editingFolder._id, editFolderName)}
                                    disabled={!editFolderName.trim()}
                                    className="flex-1 py-3 px-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    Update Name
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
            />
        </div>
    );
}
