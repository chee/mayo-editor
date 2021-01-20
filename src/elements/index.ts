import {MayoParentElement} from "./markdown/mayo-element"

import MayoBreakElement from "./markdown/mayo-break"
import MayoCodeElement from "./markdown/mayo-code"
import MayoInlineCodeElement from "./markdown/mayo-inline-code"
import MayoDeleteElement from "./markdown/mayo-delete"
import MayoEmphasisElement from "./markdown/mayo-emphasis"
import MayoHeadingElement from "./markdown/mayo-heading"
import MayoThematicBreakElement from "./markdown/mayo-thematic-break"
import MayoHtmlElement from "./markdown/mayo-html"
import MayoImageElement from "./markdown/mayo-image"
import MayoImageReferenceElement from "./markdown/mayo-image-reference"
import MayoListItemElement from "./markdown/mayo-list-item"
import MayoLinkElement from "./markdown/mayo-link"
import MayoLinkReferenceElement from "./markdown/mayo-link-reference"
import MayoListElement from "./markdown/mayo-list"
import MayoParagraphElement from "./markdown/mayo-paragraph"
import MayoBlockquoteElement from "./markdown/mayo-blockquote"
import MayoStrongElement from "./markdown/mayo-strong"
import MayoTableElement from "./markdown/mayo-table"
import MayoTextElement from "./markdown/mayo-text"
import MayoTomlElement from "./markdown/mayo-toml"
import MayoYamlElement from "./markdown/mayo-yaml"

import MayoKillerElement from "./mayo-killer"

import MayoAppElement from "./mayo-app"
import MayoSidebarElement from "./mayo-sidebar"
import MayoSidebarFileElement from "./mayo-sidebar-file"
import MayoSidebarTreeElement from "./mayo-sidebar-tree"
import MayoDocumentElement from "./mayo-document"

export type MayoStaticPhrasingContentElement =
	| MayoBreakElement
	| MayoEmphasisElement
	| MayoHtmlElement
	| MayoImageElement
	| MayoImageReferenceElement
	| MayoInlineCodeElement
	| MayoStrongElement
	| MayoTextElement

export type MayoPhrasingContentElement =
	| MayoLinkElement
	| MayoLinkReferenceElement
	| MayoStaticPhrasingContentElement

export type MayoListContentElement = MayoListItemElement

export type MayoFlowContentElement =
	| MayoBlockquoteElement
	| MayoCodeElement
	| MayoHeadingElement
	| MayoHtmlElement
	| MayoListElement
	| MayoThematicBreakElement
	| MayoParagraphElement

export type MayoContentElement =
	| MayoFlowContentElement
	| MayoListContentElement
	| MayoPhrasingContentElement

export type {
	MayoDocumentElement,
	MayoKillerElement,
	MayoSidebarElement,
	MayoSidebarFileElement,
	MayoSidebarTreeElement,
	MayoBreakElement,
	MayoCodeElement,
	MayoDeleteElement,
	MayoEmphasisElement,
	MayoHeadingElement,
	MayoInlineCodeElement,
	MayoThematicBreakElement,
	MayoHtmlElement,
	MayoImageElement,
	MayoImageReferenceElement,
	MayoListItemElement,
	MayoLinkElement,
	MayoLinkReferenceElement,
	MayoListElement,
	MayoParagraphElement,
	MayoBlockquoteElement,
	MayoStrongElement,
	MayoTableElement,
	MayoTextElement,
	MayoTomlElement,
	MayoYamlElement,
}

export default [
	MayoAppElement,
	MayoDocumentElement,
	MayoSidebarElement,
	MayoSidebarFileElement,
	MayoSidebarTreeElement,
	MayoBreakElement,
	MayoCodeElement,
	MayoInlineCodeElement,
	MayoDeleteElement,
	MayoEmphasisElement,
	MayoHeadingElement,
	MayoThematicBreakElement,
	MayoHtmlElement,
	MayoImageElement,
	MayoImageReferenceElement,
	MayoListItemElement,
	MayoLinkElement,
	MayoLinkReferenceElement,
	MayoListElement,
	MayoParagraphElement,
	MayoBlockquoteElement,
	MayoStrongElement,
	MayoTableElement,
	MayoTextElement,
	MayoTomlElement,
	MayoYamlElement,
]

export interface BeforeInputEvent extends InputEvent {
	getTargetRanges(): StaticRange[]
	dataTransfer: DataTransfer
}

export type CaretInstruction =
	| CaretIdInstruction
	| CaretParentInstruction
	| CaretTextInstruction

export interface CaretIdInstruction {
	type: "id"
	// the id of the parent element to move to
	id: string
	// the index of the child in that parent element
	index: number
	// where the selection range should start
	startOffset: number
	// where the selection range should end
	endOffset?: number
}

export interface CaretParentInstruction {
	type: "parent"
	// the parent element to move to
	parent: MayoParentElement<any>
	// the index of the child in that parent element
	index: number
	// where the selection range should start
	startOffset: number
	// where the selection range should end
	endOffset?: number
}

export interface CaretTextInstruction {
	type: "text"
	// the parent element to move to
	element: Text
	// where the selection range should start
	startOffset: number
	// where the selection range should end
	endOffset?: number
}
