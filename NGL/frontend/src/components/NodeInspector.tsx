import React, { useState } from 'react';
import { X, Plus, Trash2, Palette, Edit3, Tag, Image as ImageIcon, Upload, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { INode, INodeLabel } from '../types/graph';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { api } from '../lib/api';

interface NodeInspectorProps {
  node: INode | null;
  onClose: () => void;
  onUpdateTitle: (nodeId: string, title: string) => void;
  onUpdateColor: (nodeId: string, color: string) => void;
  onUpdateImage: (nodeId: string, imageUrl: string) => void;
  onAddLabel: (nodeId: string, text: string, detail?: string) => void;
  onUpdateLabel: (nodeId: string, labelId: string, text: string, detail?: string) => void;
  onReorderLabels: (nodeId: string, newLabels: INodeLabel[]) => void;
  onDeleteLabel: (nodeId: string, labelId: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

const PRESET_SWATCHES = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#d946ef', // Fuchsia
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#e11d48', // Crimson
  '#84cc16', // Lime
];

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onClose,
  onUpdateTitle,
  onUpdateColor,
  onUpdateImage,
  onAddLabel,
  onUpdateLabel,
  onReorderLabels,
  onDeleteLabel,
  onDeleteNode,
}) => {
  const [newLabelTitle, setNewLabelTitle] = useState('');
  const [newLabelDetail, setNewLabelDetail] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  if (!node) return null;

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabelTitle.trim()) {
      onAddLabel(node.id, newLabelTitle.trim(), newLabelDetail.trim());
      setNewLabelTitle('');
      setNewLabelDetail('');
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const res = await api.uploadImage(file);
      onUpdateImage(node.id, res.url);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to upload image to Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  const moveLabelUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...node.labels];
    const [item] = updated.splice(index, 1);
    updated.splice(index - 1, 0, item);
    onReorderLabels(node.id, updated);
  };

  const moveLabelDown = (index: number) => {
    if (index >= node.labels.length - 1) return;
    const updated = [...node.labels];
    const [item] = updated.splice(index, 1);
    updated.splice(index + 1, 0, item);
    onReorderLabels(node.id, updated);
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className="fixed top-20 right-6 z-50 w-96 glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl animate-fade-in flex flex-col max-h-[85vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-white/40 shadow-sm shrink-0"
            style={{ backgroundColor: node.color || '#6366f1' }}
          />
          <h3 className="font-bold text-white text-base truncate">Node Inspector</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 space-y-5">
        {/* Node Title Editor */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Node Title
          </label>
          <input
            type="text"
            value={node.title}
            onChange={(e) => onUpdateTitle(node.id, e.target.value)}
            className="w-full bg-slate-900/90 text-white font-semibold text-sm px-3 py-2 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Cloudinary Image Upload Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Node Image (Cloudinary)
          </label>

          {node.imageUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 group bg-slate-950">
              <img
                src={node.imageUrl}
                alt="Uploaded Node Attachment"
                className="w-full h-36 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => onUpdateImage(node.id, '')}
                  className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-md"
                >
                  <Trash2 className="w-4 h-4" /> Remove Image
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 cursor-pointer transition">
              {isUploading ? (
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Upload className="w-6 h-6 text-indigo-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-200">Upload Image to Cloudinary</span>
                  <span className="text-[10px] text-slate-500">PNG, JPG, WEBP up to 10MB</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          )}

          {uploadError && (
            <p className="mt-1.5 text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              ⚠️ {uploadError}
            </p>
          )}
        </div>

        {/* Any Custom Color Wheel & Circle Swatches */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" /> Custom Node Color
          </label>

          <div className="flex items-center gap-3">
            {/* Custom Color Wheel Circle Picker */}
            <div className="relative group shrink-0">
              <input
                type="color"
                value={node.color || '#6366f1'}
                onChange={(e) => onUpdateColor(node.id, e.target.value)}
                className="opacity-0 absolute inset-0 w-8 h-8 cursor-pointer z-10"
                title="Choose any custom color"
              />
              <div
                className="w-8 h-8 rounded-full border-2 border-white/60 shadow-md cursor-pointer flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: node.color || '#6366f1' }}
              >
                <Palette className="w-4 h-4 text-white drop-shadow-sm opacity-80" />
              </div>
            </div>

            {/* Quick Circle Swatches */}
            <div className="flex items-center flex-wrap gap-1.5 flex-1">
              {PRESET_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  onClick={() => onUpdateColor(node.id, hex)}
                  style={{ backgroundColor: hex }}
                  title={`Select color ${hex}`}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    node.color === hex
                      ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-md'
                      : 'hover:scale-110 opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Labels & Auto-Expanding Textareas List with Reordering */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" /> Node Text Labels & Reordering
          </label>

          <div className="space-y-3">
            {node.labels.map((lbl, idx) => (
              <div
                key={lbl.id}
                className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 group"
              >
                <div className="flex items-center justify-between gap-1.5">
                  {/* Up / Down Reorder Buttons */}
                  <div className="flex items-center gap-0.5 shrink-0 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => moveLabelUp(idx)}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                      title="Move Label Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveLabelDown(idx)}
                      disabled={idx === node.labels.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                      title="Move Label Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={lbl.text}
                    onChange={(e) => onUpdateLabel(node.id, lbl.id, e.target.value, lbl.detail)}
                    placeholder="Label Title..."
                    className="bg-slate-950 text-white font-semibold text-xs px-2.5 py-1 rounded-lg border border-slate-700/80 focus:border-indigo-500 focus:outline-none w-full"
                  />
                  <button
                    onClick={() => onDeleteLabel(node.id, lbl.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition shrink-0"
                    title="Delete Label"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Auto-expanding Textarea under label */}
                <div>
                  <span className="block text-[10px] text-slate-500 font-medium mb-1">
                    Label Textarea Notes / Code:
                  </span>
                  <AutoResizeTextarea
                    value={lbl.detail || ''}
                    onChange={(newDetail) => onUpdateLabel(node.id, lbl.id, lbl.text, newDetail)}
                    placeholder="Type notes, parameters, or details... (Expands automatically as you type)"
                    className="bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Label Form */}
        <form onSubmit={handleAddLabel} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
          <span className="block text-xs font-bold text-slate-300">+ Add New Label Item</span>
          <input
            type="text"
            placeholder="Label Title..."
            value={newLabelTitle}
            onChange={(e) => setNewLabelTitle(e.target.value)}
            className="w-full bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
          />
          {newLabelTitle.trim() && (
            <AutoResizeTextarea
              value={newLabelDetail}
              onChange={setNewLabelDetail}
              placeholder="Textarea details for this label..."
              className="bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
            />
          )}
          <button
            type="submit"
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Label</span>
          </button>
        </form>

        {/* Delete Node Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => onDeleteNode(node.id)}
            className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Node</span>
          </button>
        </div>
      </div>
    </div>
  );
};
