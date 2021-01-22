import type * as md from "mdast"
import {html, TemplateResult} from "lit-html"
import {spread} from "@open-wc/lit-helpers"
import * as is from "./is"
import {DataCaret} from "../caret"

type Handler = (node: md.Content) => any

interface Handlers {
	[type: string]: Handler
}

export function spreadable(node: md.Content | md.Root) {
	let {data, position, children, ...spreadable} = node
	if (is.leaf(node.type)) {
		spreadable.leaf = true
	}
	if (is.block(node.type)) {
		spreadable.block = true
	}
	if (is.inline(node.type)) {
		spreadable.inline = true
	}
	if (is.container(node.type)) {
		spreadable.container = true
	}
	if (is.empty(node.type)) {
		spreadable.empty = true
	}

	if (data && data.caret) {
		let caret: DataCaret = data.caret as DataCaret
		spreadable.caret = caret.type
		spreadable.caretOffset = caret.offset
	}
	return spreadable
}

let handlers: Handlers = {
	blockquote(node) {
		node = node as md.Blockquote
		return html`<mayo-blockquote
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-blockquote>`
	},

	break(node) {
		node = node as md.Break
		return html`<mayo-break
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-break>`
		// return html`<br />`
	},

	code(node) {
		node = node as md.Code
		return html`<mayo-code
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-code>`
	},

	delete(node) {
		node = node as md.Delete
		return html`<mayo-delete
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-delete>`
	},

	emphasis(node) {
		node = node as md.Emphasis
		return html`<mayo-emphasis
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-emphasis>`
	},

	footnoteReference(node) {
		node = node as md.FootnoteReference
		return html`<mayo-footnote-reference
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-footnote-reference>`
	},

	footnote(node) {
		node = node as md.Footnote
		return html`<mayo-footnote
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-footnote>`
	},

	heading(node) {
		node = node as md.Heading
		let h
		switch (node.depth) {
			case 1:
				h = html`<h1></h1>`
				break
			case 2:
				h = html`<h2></h2>`
				break
			case 3:
				h = html`<h3></h3>`
				break
			case 4:
				h = html`<h4></h4>`
				break
			case 5:
				h = html`<h5></h5>`
				break
			case 6:
				h = html`<h6></h6>`
				break
		}
		return html`<mayo-heading
			.node=${node}
			...=${spread(spreadable(node))}
		></mayo-heading>`
	},

	html(node) {
		node = node as md.HTML
		return html`<mayo-html
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-html>`
	},

	imageReference(node) {
		node = node as md.ImageReference
		return html`<mayo-image-reference
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-image-reference>`
	},

	image(node) {
		node = node as md.Image
		return html`<mayo-image
			src="${node.url}"
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-image>`
	},

	inlineCode(node) {
		node = node as md.InlineCode
		return html`<mayo-inline-code
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-inline-code>`
	},

	linkReference(node) {
		node = node as md.LinkReference
		return html`<mayo-link-reference
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-link-reference>`
	},

	link(node) {
		node = node as md.Link
		return html`<mayo-link
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-link>`
	},

	listItem(node) {
		node = node as md.ListItem
		return html`<mayo-list-item
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-list-item>`
	},

	list(node) {
		node = node as md.List
		return html`<mayo-list
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-list>`
	},

	paragraph(node) {
		node = node as md.Paragraph
		return html`<mayo-paragraph
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-paragraph>`
	},

	// root(node) {
	//node = node as md.Root
	/* 		return html`<mayo-root ...="${spread(spreadable(node))}" .node=${node}>
			
		</mayo-root>` */
	//return children(node)
	// },

	strong(node) {
		node = node as md.Strong
		return html`<mayo-strong
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-strong>`
	},

	table(node) {
		node = node as md.Table
		return html`<mayo-table
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-table>`
	},

	text(node) {
		// You probably don't want this.
		// remember: if you enable this, every text (including those inside an <em>)
		// becomes a mayo- element
		// node = node as md.Text
		// if (parent.type == "emphasis") {
		// return node.value
		// } else {
		// return html`<mayo-text ...="${spread(spreadable(node))}" .node=${node}
		// 	>${node.value}</mayo-text
		// >`
		return node.value
	},

	thematicBreak(node) {
		node = node as md.ThematicBreak
		return html`<mayo-thematic-break
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-thematic-break>`
	},

	toml(node) {
		node = node as md.FrontmatterContent
		return html`<mayo-toml
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-toml>`
	},

	yaml(node) {
		node = node as md.FrontmatterContent
		return html`<mayo-yaml
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-yaml>`
	},

	definition(node) {
		node = node as md.Definition
		return html`<mayo-definition
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-definition>`
	},

	footnoteDefinition(node) {
		node = node as md.FootnoteDefinition
		return html`<mayo-footnote
			...="${spread(spreadable(node))}"
			.node=${node}
		></mayo-footnote>`
	},
}

export default function convertToHtml(
	node: md.Content
): TemplateResult | string {
	let handler = handlers[node.type]
	if (handler) {
		return handler(node)
	} else {
		throw new Error(node.type)
	}
}
