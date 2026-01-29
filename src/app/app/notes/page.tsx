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
    Type
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DocumentEditor from "./_components/DocumentEditor";

interface MaterialFolder {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    type: 'folder';
}

interface MaterialFile {
    id: string;
    name: string;
    type: 'file';
    fileType: string;
    size: string;
    folderId: string | null;
    createdAt: string;
    url?: string;
    content?: string; // For text documents
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
    const [folders, setFolders] = useState<MaterialFolder[]>([
        { id: '1', name: 'Mathematics', color: '#A78BFA', createdAt: new Date().toISOString(), type: 'folder' },
        { id: '2', name: 'Physics Notes', color: '#60A5FA', createdAt: new Date().toISOString(), type: 'folder' },
    ]);
    const [files, setFiles] = useState<MaterialFile[]>([
        { id: 'f1', name: 'Algebra_Basics.pdf', type: 'file', fileType: 'pdf', size: '1.2 MB', folderId: '1', createdAt: new Date().toISOString() },
        { id: 'f2', name: 'Lab_Report.docx', type: 'file', fileType: 'docx', size: '450 KB', folderId: '2', createdAt: new Date().toISOString() },
    ]);

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

    // Document Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [activeDocument, setActiveDocument] = useState<{ id: string; name: string; content: string } | null>(null);

    const handleCreateBlankDocument = () => {
        setActiveDocument(null);
        setIsEditorOpen(true);
    };

    const handleEditDocument = (file: MaterialFile) => {
        setActiveDocument({ id: file.id, name: file.name, content: file.content || "" });
        setIsEditorOpen(true);
    };

    const handleSaveDocument = (title: string, content: string) => {
        if (activeDocument) {
            // Update existing document
            setFiles(prev => prev.map(f =>
                f.id === activeDocument.id
                    ? { ...f, name: title, content }
                    : f
            ));
        } else {
            // Create new document
            const newFile: MaterialFile = {
                id: Date.now().toString(),
                name: title || "Untitled Document",
                type: 'file',
                fileType: 'doc',
                size: (new Blob([content]).size / 1024).toFixed(1) + " KB",
                folderId: selectedFolderId === "all" ? null : selectedFolderId,
                createdAt: new Date().toISOString(),
                content: content
            };
            setFiles(prev => [newFile, ...prev]);
        }
        setIsEditorOpen(false);
        setActiveDocument(null);
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;

        const newFolder: MaterialFolder = {
            id: Date.now().toString(),
            name: newFolderName.trim(),
            color: selectedColor,
            createdAt: new Date().toISOString(),
            type: 'folder'
        };

        setFolders(prev => [newFolder, ...prev]);
        setNewFolderName("");
        setIsFolderModalOpen(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension && ALLOWED_EXTENSIONS.includes(extension)) {
            const newFile: MaterialFile = {
                id: Date.now().toString(),
                name: file.name,
                type: 'file',
                fileType: extension,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                folderId: selectedFolderId === "all" ? null : selectedFolderId,
                createdAt: new Date().toISOString()
            };
            setFiles(prev => [newFile, ...prev]);
        } else {
            alert(`File type .${extension} is not supported. Please upload ${ALLOWED_EXTENSIONS.join(', ')}`);
        }
        setIsUploadModalOpen(false);
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
            case 'docx': return <FileText className="w-5 h-5 text-blue-500" />;
            case 'xlsx': return <FileText className="w-5 h-5 text-green-500" />;
            case 'pptx': return <FileText className="w-5 h-5 text-orange-500" />;
            case 'doc': return <FileText className="w-5 h-5 text-indigo-500" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'svg': return <ImageIcon className="w-5 h-5 text-purple-500" />;
            default: return <FileIcon className="w-5 h-5 text-slate-400" />;
        }
    };

    const filteredItems = [
        ...folders.map(f => ({ ...f, itemType: 'folder' as const })),
        ...files.map(f => ({ ...f, itemType: 'file' as const }))
    ].filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" ||
            (filterType === "folder" && item.itemType === "folder") ||
            (filterType === "file" && item.itemType === "file");
        const matchesFolder = selectedFolderId === "all" ||
            (item.itemType === "folder" && item.id === selectedFolderId) ||
            (item.itemType === "file" && (item as any).folderId === selectedFolderId);

        return matchesSearch && matchesType && matchesFolder;
    });

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 p-4">
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
                                onClick={() => setIsUploadModalOpen(true)}
                                className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                            >
                                <Upload className="w-4 h-4" /> Upload Material
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
                                    <div className="relative">
                                        <select
                                            value={selectedFolderId}
                                            onChange={(e) => setSelectedFolderId(e.target.value)}
                                            className="appearance-none bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold px-3 py-1.5 pr-8 outline-none cursor-pointer dark:text-white uppercase tracking-wider"
                                        >
                                            <option value="all">All Subjects</option>
                                            {folders.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                                <button
                                    onClick={() => setIsFolderModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <FolderPlus className="w-3.5 h-3.5 text-primary" />
                                    Create Folder
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
                                        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                                        : "flex flex-col gap-2"}
                                >
                                    {/* Add Material Card (Grid Mode Only) */}
                                    {viewMode === "grid" && !searchQuery && (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => setIsUploadModalOpen(true)}
                                            className="group bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all h-[145px]"
                                        >
                                            <div className="w-10 h-10 bg-white dark:bg-[#1A1A1E] rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform text-primary border border-slate-100 dark:border-slate-800">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold dark:text-white group-hover:text-primary transition-colors">Add Material</p>
                                                <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold">Upload Files</p>
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
                                            className="group bg-primary/5 dark:bg-primary/10 border-2 border-dashed border-primary/20 dark:border-primary/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-all h-[145px]"
                                        >
                                            <div className="w-10 h-10 bg-white dark:bg-primary/20 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform text-primary border border-primary/10">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold dark:text-white group-hover:text-primary transition-colors">Blank Document</p>
                                                <p className="text-[9px] text-primary/60 mt-0.5 uppercase tracking-widest font-bold">Create New</p>
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
                                                if (item.itemType === 'file' && (item as MaterialFile).fileType === 'doc') {
                                                    handleEditDocument(item as MaterialFile);
                                                }
                                            }}
                                            className={`group bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/50 hover:shadow-xl cursor-pointer overflow-hidden ${viewMode === "grid" ? "flex flex-col h-[145px]" : "p-3 flex items-center justify-between"
                                                }`}
                                            transition={{
                                                layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
                                            }}
                                        >
                                            {viewMode === "grid" && (
                                                <motion.div layout className="h-[85px] w-full bg-slate-50 dark:bg-white/5 flex items-center justify-center relative group-hover:bg-slate-100/50 dark:group-hover:bg-white/10 transition-colors">
                                                    {item.itemType === 'folder' ? (
                                                        <motion.div
                                                            layout
                                                            layoutId={`icon-${item.id}`}
                                                            className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                                                            style={{ backgroundColor: `${item.color}15` }}
                                                        >
                                                            <Folder className="w-6 h-6" style={{ color: item.color }} fill={item.color} />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div layout layoutId={`icon-${item.id}`} className="w-10 h-10 bg-white dark:bg-[#1A1A1E] rounded-xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800">
                                                            {getFileIcon((item as any).fileType)}
                                                        </motion.div>
                                                    )}

                                                    {/* Overlay Actions */}
                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-sm">
                                                            <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
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
                                                        <motion.div layout layoutId={`icon-${item.id}`} className="w-9 h-9 bg-slate-50 dark:bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                                            {getFileIcon((item as any).fileType)}
                                                        </motion.div>
                                                    )
                                                )}
                                                <div className="min-w-0">
                                                    <motion.h3 layout layoutId={`title-${item.id}`} className="text-[12px] font-bold dark:text-white truncate group-hover:text-primary transition-colors">{item.name}</motion.h3>
                                                    <motion.div layout className="flex items-center gap-2 mt-0.5">
                                                        {item.itemType === 'folder' && (
                                                            <motion.div layout className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                        )}
                                                        <motion.p layout className="text-[8px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                                                            {item.itemType === 'folder' ? 'Folder' : (item as any).size} • {new Date(item.createdAt).toLocaleDateString()}
                                                        </motion.p>
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            {viewMode !== "grid" && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg text-slate-400">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg text-slate-400">
                                                        <MoreVertical className="w-4 h-4" />
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
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFolderModalOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] w-screen h-screen"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
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
                    </>
                )}

                {/* Upload Material Modal */}
                {isUploadModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsUploadModalOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] w-screen h-screen"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[450px] bg-white dark:bg-[#1A1A1E] rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold dark:text-white">Upload Material</h2>
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-bold dark:text-white">Click to select file</p>
                                    <p className="text-xs text-slate-400 mt-1">Maximum file size 10MB</p>
                                </div>
                            </div>

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

                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 italic">
                                    Files will be saved in: <span className="text-primary font-bold">{selectedFolderId === 'all' ? 'All Subjects' : folders.find(f => f.id === selectedFolderId)?.name}</span>
                                </p>
                            </div>
                        </motion.div>
                    </>
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
