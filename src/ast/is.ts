import * as md from "mdast"

export type MarkdownLeafBlock =
	| md.ThematicBreak
	| md.Heading
	| md.Code
	| md.HTML
	| md.LinkReference
	| md.Paragraph
	| md.Break

let leafBlock = [
	"thematicBreak",
	"heading",
	"code",
	"html",
	"linkReference",
	"paragraph",
	"break",
]

export type MarkdownEmpty =
	| md.Break
	| md.ThematicBreak
	| md.Link
	| md.LinkReference
	| md.Image
	| md.ImageReference

let empties = [
	"break",
	"thematicBreak",
	"link",
	"linkReference",
	"image",
	"imageReference",
]

export type MarkdownLeafInline = md.InlineCode | md.Text

let leafInline = ["inlineCode", "text"]

export type MarkdownContainerBlock = md.Blockquote | md.ListItem | md.List

let containerBlock = ["blockquote", "listItem", "list"]

export type MarkdownContainerInline = md.Delete | md.Emphasis | md.Strong

let containerInline = ["delete", "emphasis", "strong"]

export type MarkdownInline = MarkdownLeafInline | MarkdownContainerInline

let inlines = [...leafInline, ...containerInline]

export type MarkdownLeaf = MarkdownLeafBlock | MarkdownLeafInline

let leaves = [...leafBlock, ...leafInline]

export type MarkdownBlock = MarkdownLeafBlock | MarkdownContainerBlock

let blocks = [...leafBlock, ...containerBlock]

export type MarkdownContainer =
	| MarkdownContainerBlock
	| MarkdownContainerInline
	| md.Root

let containers = [...containerInline, ...containerBlock, "root"]

import type * as unist from "unist"
import {Unwrappable} from "./unwrap"

export function empty(node: unist.Node): node is MarkdownEmpty {
	return empties.includes(node.type)
}

export function leaf(node: unist.Node): node is MarkdownLeaf {
	return leaves.includes(node.type)
}

export function inline(node: unist.Node): node is MarkdownInline {
	return inlines.includes(node.type)
}

export function container(node: unist.Node): node is MarkdownContainer {
	return containers.includes(node.type)
}

export function block(node: unist.Node): node is MarkdownBlock {
	return blocks.includes(node.type)
}

export function list(node: unist.Node): node is md.List {
	return node.type == "list"
}

export function textish(node: unist.Node): node is md.Text | md.InlineCode {
	return node.type == "text" || node.type == "inlineCode"
}

export function text(node: unist.Node): node is md.Text {
	return node.type == "text"
}

export function inlineCode(node: unist.Node): node is md.InlineCode {
	return node.type == "inlineCode"
}

export function unwrappable(node: unist.Node): node is Unwrappable {
	return ["emphasis", "delete", "strong", "inlineCode"].includes(node.type)
}
