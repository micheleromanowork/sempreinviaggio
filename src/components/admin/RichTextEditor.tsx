'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback } from 'react'

interface Props {
  content: string
  onChange: (html: string) => void
  onImageRequest?: () => void
}

export default function RichTextEditor({ content, onChange, onImageRequest }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Inizia a scrivere il tuo articolo…' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose max-w-none min-h-64 focus:outline-none p-4' },
    },
  })

  const btn = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1.5 text-xs rounded font-medium transition-colors ${
        active ? 'bg-[--color-brand-blue] text-white' : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      {label}
    </button>
  )

  const addLink = useCallback(() => {
    const url = window.prompt('URL del link:')
    if (!url || !editor) return
    if (editor.state.selection.empty) {
      editor.chain().focus().setLink({ href: url }).run()
    } else {
      editor.chain().focus().toggleLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap px-3 py-2 border-b border-gray-100 bg-gray-50">
        {btn('H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn('H3', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {btn('G', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run())}
        {btn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run())}
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {btn('Lista •', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run())}
        {btn('Lista 1.', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run())}
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {btn('Citazione', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run())}
        {btn('Link', editor.isActive('link'), addLink)}
        {btn('—', false, () => editor.chain().focus().setHorizontalRule().run())}
        {onImageRequest && btn('Immagine', false, onImageRequest)}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
