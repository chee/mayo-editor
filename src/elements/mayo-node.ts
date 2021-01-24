import {customElement, LitElement, property} from "lit-element"
import {html, TemplateResult} from "lit-html"
import * as md from "mdast"
import * as is from "../ast/is"
import {ifDefined} from "lit-html/directives/if-defined"

interface Info {
	leaf?: true
	block?: true
	inline?: true
	container?: true
	empty?: true
	caretStart?: number
	caretEnd?: number
}

export function info(node: md.Content | md.Root): Info {
	let info: Info = {}
	if (is.leaf(node)) {
		info.leaf = true
	}
	if (is.block(node)) {
		info.block = true
	}
	if (is.inline(node)) {
		info.inline = true
	}
	if (is.container(node)) {
		info.container = true
	}
	if (is.empty(node)) {
		info.empty = true
	}

	return info
}

@customElement("mayo-node")
class MayoNodeElement extends LitElement {
	@property()
	type: string
	@property({type: Number})
	index: number
	@property({type: Object})
	node: md.Content
	@property({type: Number})
	depth: number
	@property({type: Boolean})
	container: boolean
	@property({type: Boolean})
	empty: boolean
	@property({type: Boolean})
	inline: boolean
	@property({type: Boolean})
	leaf: boolean
	@property({type: Boolean})
	list: boolean
	@property({type: Boolean})
	block: boolean
	@property()
	value: string
	@property({type: Number, attribute: "caret-start"})
	caretStart?: number
	@property({type: Number, attribute: "caret-end"})
	caretEnd?: number
	@property()
	path: string

	get textNode(): Text {
		return (function recurse(node: Node): Text {
			for (let child of Array.from(node.childNodes)) {
				if (child.nodeType == child.TEXT_NODE) {
					return child as Text
				} else if (child.nodeType == child.COMMENT_NODE) {
					continue
				} else {
					return recurse(child)
				}
			}
		})(this)
	}

	createRenderRoot(): this {
		return this
	}

	renderChildren(): TemplateResult | TemplateResult[] {
		if (!this.node || !Array.isArray(this.node.children)) {
			return html``
		}
		return html`${this.node.children.map((child, index) => {
			let caret = child.data?.caret
			return html`<mayo-node
				...=${info(child)}
				caret-start=${ifDefined(caret?.caretStart)}
				caret-end=${ifDefined(caret?.caretEnd)}
				path="${this.path}.${index}"
				.node=${child}
				type=${child.type}
				index=${index}
				value=${child.value}
				?container=${is.container(child)}
				?empty=${is.empty(child)}
				?inline=${is.inline(child)}
				?leaf=${is.leaf(child)}
				?list=${is.list(child)}
				?block=${is.block(child)}
			></mayo-node>`
		})}`
	}

	render(): string | TemplateResult {
		if (!this.node) return html``
		if (this.node.type == "heading") {
			switch (this.node.depth) {
				case 1:
					return html`<h1>${this.renderChildren()}</h1>`
				case 2:
					return html`<h2>${this.renderChildren()}</h2>`
				case 3:
					return html`<h3>${this.renderChildren()}</h3>`
				case 4:
					return html`<h4>${this.renderChildren()}</h4>`
				case 5:
					return html`<h5>${this.renderChildren()}</h5>`
				case 6:
					return html`<h6>${this.renderChildren()}</h6>`
			}
		} else if (this.node.type == "blockquote") {
			return html`<blockquote>${this.renderChildren()}</blockquote>`
		} else if (this.node.type == "break") {
			return html`<br />`
		} else if (this.node.type == "code") {
			return html`<mayo-code
				lang=${this.node.lang}
				meta=${this.node.meta}
				value=${this.node.value}
				>${this.node.value}</mayo-code
			>`
		} else if (this.node.type == "delete") {
			return html`<del>${this.renderChildren()}</del>`
		} else if (this.node.type == "emphasis") {
			return html`<em>${this.renderChildren()}</em>`
			// } else if (this.node.type == "footnoteReference") {
			// } else if (this.node.type == "footnote") {
		} else if (this.node.type == "html") {
			let element = document.createElement("div")
			element.innerHTML = this.node.value
			return html`${element}`
		} else if (this.node.type == "imageReference") {
			return ""
		} else if (this.node.type == "image") {
			return html`<img
				alt=${this.node.alt}
				src=${this.node.url}
				title=${this.node.title || ""}
			/>`
			// } else if (this.node.type == "linkReference") {
		} else if (this.node.type == "link") {
			return html`<mayo-link
				href=${this.node.url}
				title=${this.node.title || ""}
				>${this.renderChildren()}</mayo-link
			>`
		} else if (this.node.type == "listItem") {
			// TODO spread, todo-box w/ toggle event
			return html`<li>
				${this.node == null
					? ""
					: html`<mayo-todo-box
							checked=${this.node.checked}
					  ></mayo-todo-box>`}${this.renderChildren()}
			</li>`
		} else if (this.node.type == "list") {
			// TODO this.node.spread
			if (this.node.ordered) {
				// TODO this.node.start
				return html`<ol>
					${this.renderChildren()}
				</ol>`
			} else {
				return html`<ul>
					${this.renderChildren()}
				</ul>`
			}
		} else if (this.node.type == "paragraph") {
			return html`<p>${this.renderChildren()}</p>`
		} else if (this.node.type == "strong") {
			return html`<strong>${this.renderChildren()}</strong>`
		} else if (this.node.type == "table") {
			// TODO table
			return ""
		} else if (this.node.type == "thematicBreak") {
			return html`<hr />`
		} else if (this.node.type == "yaml") {
			return ""
		} else if (this.node.type == "definition") {
			return ""
		} else if (this.node.type == "footnoteDefinition") {
			return ""
		} else if (this.node.type == "inlineCode") {
			return html`<code>${this.node.value}</code>`
		} else if (this.node.type == "text") {
			return html`${this.node.value}`
		} else {
			console.error(`unhandled node type: ${this.node.type}`)
		}
	}

	updated(): void {
		if (this.caretStart != null || this.caretEnd != null) {
			if (!this.textNode) {
				return console.error(`no text node in ${this.tagName}`)
			}
			let selection = document.getSelection()
			let range = document.createRange()

			selection.removeAllRanges()

			if (this.caretStart != null) {
				range.setStart(this.textNode, this.caretStart)
			}
			if (this.caretEnd != null) {
				range.setEnd(this.textNode, this.caretEnd)
			}

			selection.addRange(range)
		}
	}
}

export default MayoNodeElement
