import React, { useRef, useCallback } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Heading1, Heading2, Link, Image, Video, Quote, Code, Undo, Redo, RemoveFormatting } from 'lucide-react';

/**
 * RichTextEditor — A lightweight, React 19-compatible rich text editor
 * using contentEditable + document.execCommand (still supported in all browsers).
 * Replaces react-quill which relies on ReactDOM.findDOMNode (removed in React 19).
 */

const ToolbarButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
      border: 'none',
      borderRadius: 4,
      padding: '0.35rem',
      cursor: 'pointer',
      color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = active ? 'rgba(59,130,246,0.15)' : 'transparent'; }}
  >
    {children}
  </button>
);

const Divider = () => (
  <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.25rem' }} />
);

const RichTextEditor = ({ value, onChange, style, placeholder = 'Start writing...' }) => {
  const editorRef = useRef(null);

  const exec = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Trigger onChange after command
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInsertLink = useCallback(() => {
    const url = prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  }, [exec]);

  const handleInsertImage = useCallback(() => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) exec('insertImage', url);
  }, [exec]);

  const handleInsertVideo = useCallback(() => {
    const url = prompt('Enter YouTube or video embed URL:');
    if (url) {
      // Convert YouTube watch URLs to embed URLs
      let embedUrl = url;
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (ytMatch) {
        embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
      }
      const html = `<div style="margin:1rem 0;"><iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen style="max-width:100%;border-radius:8px;"></iframe></div>`;
      exec('insertHTML', html);
    }
  }, [exec]);

  // Set initial value
  const initialized = useRef(false);
  React.useEffect(() => {
    if (editorRef.current && value && !initialized.current) {
      editorRef.current.innerHTML = value;
      initialized.current = true;
    }
  }, [value]);

  // Reset when value is cleared externally (e.g. form reset)
  React.useEffect(() => {
    if (editorRef.current && !value && initialized.current) {
      editorRef.current.innerHTML = '';
      initialized.current = false;
    }
  }, [value]);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', ...style }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.15rem',
        padding: '0.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
      }}>
        <ToolbarButton onClick={() => exec('undo')} title="Undo"><Undo size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => exec('redo')} title="Redo"><Redo size={16} /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => exec('formatBlock', '<h1>')} title="Heading 1"><Heading1 size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', '<h2>')} title="Heading 2"><Heading2 size={16} /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => exec('bold')} title="Bold"><Bold size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="Italic"><Italic size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => exec('underline')} title="Underline"><Underline size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => exec('strikethrough')} title="Strikethrough"><Strikethrough size={16} /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bullet List"><List size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered List"><ListOrdered size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', '<blockquote>')} title="Quote"><Quote size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', '<pre>')} title="Code Block"><Code size={16} /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={handleInsertLink} title="Insert Link"><Link size={16} /></ToolbarButton>
        <ToolbarButton onClick={handleInsertImage} title="Insert Image"><Image size={16} /></ToolbarButton>
        <ToolbarButton onClick={handleInsertVideo} title="Insert Video"><Video size={16} /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => exec('removeFormat')} title="Clear Formatting"><RemoveFormatting size={16} /></ToolbarButton>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight: 250,
          padding: '1rem',
          outline: 'none',
          color: 'var(--text-primary)',
          lineHeight: 1.7,
          fontSize: '0.95rem',
          background: 'var(--bg-primary)',
          overflowY: 'auto',
          maxHeight: 500,
        }}
        suppressContentEditableWarning
      />

      {/* Placeholder CSS injection */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
          font-style: italic;
        }
        [contenteditable] h1 { font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0; }
        [contenteditable] h2 { font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0; }
        [contenteditable] blockquote { border-left: 3px solid var(--accent-blue); padding-left: 1rem; margin: 0.5rem 0; color: var(--text-secondary); }
        [contenteditable] pre { background: var(--bg-elevated); padding: 0.75rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; overflow-x: auto; }
        [contenteditable] img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
        [contenteditable] a { color: var(--accent-blue); text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
