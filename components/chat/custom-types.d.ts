import {
  Text,
  createEditor,
  Node,
  Element,
  Editor,
  Descendant,
  BaseEditor,
} from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

export type ImageData = {
  url: string | ArrayBuffer | null
}

export type EditableVoidElement = {
  type: 'editable-void'
  children: EmptyText[]
}

export type ImageElement = {
  type: 'image'
  imageData: ImageData
  children: EmptyText[]
}

export type EmojiElement = {
  type: 'emoji',
  emojiId: string,
  children: EmptyText[]
}

export type LinkElement = {
  type: 'link';
  url: string;
  children: Descendant[]
}

export type MentionElement = {
  type: 'mention'
  character: string
  children: CustomText[]
}

export type ParagraphElement = {
  type: 'paragraph'
  align?: string
  children: Descendant[]
}

type CustomElement =
  | EditableVoidElement
  | ImageElement
  | LinkElement
  | MentionElement
  | ParagraphElement
  | EmojiElement

export type EmptyText = {
  text: string
}

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText | EmptyText
  }
}