import React, { useState, useRef } from 'react';
import { Bold, Italic, Heading2, Heading3, List, Quote, Eye, Code, Image as ImageIcon, Loader2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label = 'Article Body (Rich Text / HTML)'
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const lastCursorRef = useRef<number>(0);

  const trackCursor = () => {
    if (textareaRef.current) {
      lastCursorRef.current = textareaRef.current.selectionStart;
    }
  };

  const handleInsertImageClick = () => {
    setImageError('');
    imageInputRef.current?.click();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setImageError('File size exceeds 10MB limit.');
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    setIsUploadingImage(true);
    setImageError('');

    try {
      const result = await adminApi.uploadImage(file);
      const pos = lastCursorRef.current;
      const imageTag = `\n<img src="${result.url}" alt="" style="max-width: 100%; border-radius: 12px;" />\n`;
      const newValue = value.substring(0, pos) + imageTag + value.substring(pos);
      onChange(newValue);

      setTimeout(() => {
        const newPos = pos + imageTag.length;
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newPos, newPos);
        lastCursorRef.current = newPos;
      }, 50);
    } catch (err: any) {
      setImageError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${openTag}${selectedText || 'text'}${closeTag}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + replacement.length - closeTag.length);
    }, 50);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="text-xs font-medium text-lotus-clay hover:underline flex items-center gap-1"
        >
          {isPreview ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{isPreview ? 'Edit Source' : 'Live Preview'}</span>
        </button>
      </div>

      {/* Formatting Toolbar */}
      {!isPreview && (
        <div className="flex items-center gap-1 p-1.5 bg-gray-100 rounded-t-xl border border-b-0 border-gray-300 text-xs">
          <button
            type="button"
            onClick={() => insertTag('<h2>', '</h2>')}
            title="Heading 2"
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<h3>', '</h3>')}
            title="Heading 3"
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => insertTag('<strong>', '</strong>')}
            title="Bold"
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<em>', '</em>')}
            title="Italic"
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => insertTag('<p>', '</p>')}
            title="Paragraph"
            className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 font-mono text-[11px]"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => insertTag('<blockquote>', '</blockquote>')}
            title="Blockquote"
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
            title="Bullet List"
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
          >
            <List className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={handleInsertImageClick}
            disabled={isUploadingImage}
            title="Insert Image"
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            {isUploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageFileChange}
            className="hidden"
          />
        </div>
      )}
      {imageError && <p className="text-xs text-red-600">{imageError}</p>}

      {/* Editor Body */}
      {isPreview ? (
        <div
          className="min-h-[300px] p-6 bg-white rounded-xl border border-gray-300 prose prose-sm max-w-none font-light overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: value || '<p className="text-gray-400">Empty content preview...</p>' }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          rows={14}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={trackCursor}
          onKeyUp={trackCursor}
          onClick={trackCursor}
          placeholder="Write your article content using HTML tags like <p>, <h2>, <blockquote>... Use the image icon above to insert a photo anywhere in the article."
          className="w-full p-4 rounded-b-xl border border-gray-300 font-mono text-xs text-gray-800 focus:outline-none focus:border-lotus-forest bg-white leading-relaxed"
        />
      )}
    </div>
  );
};
