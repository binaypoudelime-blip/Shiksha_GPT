"use client";

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { FontFamily } from '@tiptap/extension-font-family';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { motion, AnimatePresence } from 'framer-motion';

const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Undo,
    Redo,
    Save,
    X,
    Maximize2,
    History,
    Printer,
    Plus,
    Type,
    ChevronDown,
    Palette,
    ArrowLeft,
    Highlighter
} from 'lucide-react';

import { Typography } from '@tiptap/extension-typography';

interface DocumentEditorProps {
    initialTitle?: string;
    initialContent?: string;
    onSave: (title: string, content: string) => void;
    onClose: () => void;
}

const DocumentEditor = ({ initialTitle = "Untitled Document", initialContent = "", onSave, onClose }: DocumentEditorProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [isSaving, setIsSaving] = useState(false);
    const [showTextColor, setShowTextColor] = useState(false);
    const [showHighlightColor, setShowHighlightColor] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            FontFamily,
            FontSize,
            Typography,
            Placeholder.configure({
                placeholder: 'Start typing your document...',
            }),
        ],
        content: initialContent,
        immediatelyRender: false,
    });

    if (!editor) {
        return null;
    }

    const handleSave = () => {
        setIsSaving(true);
        onSave(title, editor.getHTML());
        setTimeout(() => setIsSaving(false), 1000);
    };

    const ToolbarButton = ({ onClick, isActive = false, children, title, disabled = false }: any) => (
        <button
            onClick={onClick}
            title={title}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-all ${isActive
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-white dark:bg-[#1A1A1E] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10">
            {/* Top Bar: Title & Primary Actions */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3 flex-1">
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors dark:text-white"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Type className="w-4 h-4 text-primary" />
                    </div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent text-base font-bold outline-none border-b border-transparent focus:border-primary/30 px-1 py-0.5 transition-all dark:text-white flex-1 max-w-[300px]"
                        placeholder="Document Title"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${isSaving ? 'bg-green-500 text-white' : 'bg-primary text-white hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95'
                            }`}
                    >
                        <Save className="w-3.5 h-3.5" />
                        {isSaving ? 'Saved!' : 'Save Document'}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 px-4 py-1.5 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#1A1A1E] sticky top-0 z-10 shadow-sm">
                {/* Font Actions */}
                <div className="flex items-center gap-1 px-1 border-r border-slate-200 dark:border-white/10 mr-1">
                    <select
                        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                        className="bg-slate-100 dark:bg-white/5 text-[11px] font-bold dark:text-white px-2 py-1.5 rounded-lg border-none outline-none cursor-pointer"
                    >
                        <option value="Arial">Arial</option>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Serif">Serif</option>
                        <option value="Monospace">Monospace</option>
                    </select>
                    <select
                        onChange={(e) => editor.chain().focus().setFontSize(e.target.value + 'px').run()}
                        className="bg-slate-100 dark:bg-white/5 text-[11px] font-bold dark:text-white px-2 py-1.5 rounded-lg border-none outline-none cursor-pointer"
                        defaultValue="11"
                    >
                        {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                {/* Text Formatting */}
                <div className="flex items-center gap-1 px-1 border-r border-slate-200 dark:border-white/10 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Underline (Ctrl+U)"
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Colors */}
                <div className="flex items-center gap-1 px-1 border-r border-slate-200 dark:border-white/10 mr-1">
                    {/* Text Color Picker */}
                    <div className="relative">
                        <ToolbarButton
                            onClick={() => {
                                setShowTextColor(!showTextColor);
                                setShowHighlightColor(false);
                            }}
                            isActive={showTextColor}
                            title="Text Color"
                        >
                            <Palette className="w-4 h-4" />
                        </ToolbarButton>

                        <AnimatePresence>
                            {showTextColor && (
                                <>
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setShowTextColor(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        className="absolute left-0 mt-2 p-2 bg-white dark:bg-[#1A1A1E] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 z-30 flex gap-1 items-center"
                                    >
                                        {[
                                            { name: 'Black', color: '#000000' },
                                            { name: 'Red', color: '#ef4444' },
                                            { name: 'Blue', color: '#3b82f6' },
                                            { name: 'Green', color: '#22c55e' },
                                            { name: 'Purple', color: '#a855f7' }
                                        ].map((txt) => (
                                            <button
                                                key={txt.name}
                                                onClick={() => {
                                                    editor.chain().focus().setColor(txt.color).run();
                                                    setShowTextColor(false);
                                                }}
                                                className={`w-6 h-6 rounded-md border border-black/10 transition-all ${editor.isActive('textStyle', { color: txt.color }) ? 'ring-2 ring-primary scale-90 shadow-sm' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: txt.color }}
                                                title={`${txt.name} Color`}
                                            />
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Highlight Picker */}
                    <div className="relative">
                        <ToolbarButton
                            onClick={() => {
                                setShowHighlightColor(!showHighlightColor);
                                setShowTextColor(false);
                            }}
                            isActive={showHighlightColor}
                            title="Highlight Color"
                        >
                            <Highlighter className="w-4 h-4" />
                        </ToolbarButton>

                        <AnimatePresence>
                            {showHighlightColor && (
                                <>
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setShowHighlightColor(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        className="absolute left-0 mt-2 p-2 bg-white dark:bg-[#1A1A1E] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 z-30 flex gap-1 items-center"
                                    >
                                        {[
                                            { name: 'Yellow', color: '#fef08a' },
                                            { name: 'Green', color: '#bbf7d0' },
                                            { name: 'Blue', color: '#bfdbfe' },
                                            { name: 'Pink', color: '#fbcfe8' }
                                        ].map((hl) => (
                                            <button
                                                key={hl.color}
                                                onClick={() => {
                                                    editor.chain().focus().toggleHighlight({ color: hl.color }).run();
                                                    setShowHighlightColor(false);
                                                }}
                                                className={`w-6 h-6 rounded-md transition-all hover:scale-110 active:scale-90 border border-black/5 ${editor.isActive('highlight', { color: hl.color }) ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-[#1A1A1E] scale-90' : ''
                                                    }`}
                                                style={{ backgroundColor: hl.color }}
                                                title={`${hl.name} Highlight`}
                                            />
                                        ))}
                                        <button
                                            onClick={() => {
                                                editor.chain().focus().unsetHighlight().run();
                                                setShowHighlightColor(false);
                                            }}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                                            title="Clear Highlight"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-white/10 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                    >
                        <AlignLeft className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                    >
                        <AlignCenter className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                    >
                        <AlignRight className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                    >
                        <AlignJustify className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Lists */}
                <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-white/10 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                    >
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                    >
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* History */}
                <div className="flex items-center gap-0.5 px-1">
                    <ToolbarButton
                        onClick={() => editor.commands.undo()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.commands.redo()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Extra Actions */}
                <div className="ml-auto hidden sm:flex items-center gap-0.5 pt-1 sm:pt-0">
                    <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                        <Plus className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => { }} title="History">
                        <History className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => window.print()} title="Print">
                        <Printer className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            if (!document.fullscreenElement) {
                                document.documentElement.requestFullscreen();
                            } else if (document.exitFullscreen) {
                                document.exitFullscreen();
                            }
                        }}
                        title="Fullscreen"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black/20 p-2 sm:p-4 flex justify-center scrollbar-thin">
                <div className="w-full max-w-none min-h-full bg-white dark:bg-[#121214] shadow-sm border border-slate-200 dark:border-white/5 rounded-xl p-4 sm:p-6 md:p-8 prose dark:prose-invert max-w-none">
                    <EditorContent editor={editor} className="outline-none h-full" />
                </div>
            </div>

            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror {
                    outline: none;
                    min-height: 100%;
                }
                .prose {
                    font-size: 14px;
                    line-height: 1.6;
                }
                .prose ul {
                    list-style-type: disc;
                    padding-left: 1.5em;
                    margin: 1em 0;
                }
                .prose ol {
                    list-style-type: decimal;
                    padding-left: 1.5em;
                    margin: 1em 0;
                }
                .prose li {
                    margin-bottom: 0.25em;
                }
                .prose strong {
                    font-weight: 700;
                }
                .prose em {
                    font-style: italic;
                }
                .prose u {
                    text-decoration: underline;
                }
                .prose s {
                    text-decoration: line-through;
                }
                .dark .prose {
                    color: #e2e8f0;
                }
                .dark .prose strong {
                    color: #fff;
                }
                .dark .prose ul li::marker {
                    color: #A78BFA;
                }
                .dark .prose ol li::marker {
                    color: #A78BFA;
                }
            `}</style>
        </div>
    );
};

export default DocumentEditor;
