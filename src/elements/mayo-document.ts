import parse from "mdast-util-from-markdown"
import type * as md from "mdast"
import BeforeInputEvent from "../before-input-event"
import {CaretInstruction} from "../caret"
import {html} from "lit-html"
// TODO learn how to declare types for this
// @ts-ignore
import compact from "mdast-util-compact"
import toMarkdown from "mdast-util-to-markdown"
import * as is from "../ast/is"
import {css, CSSResult, customElement, LitElement, property} from "lit-element"
import transform, {nothing} from "../ast/transform"
import getTransformOptions from "../get-transform-options"
import "./mayo-node"
import MayoNodeElement from "./mayo-node"
import {produce, enableAllPlugins} from "immer"
import {spread} from "@open-wc/lit-helpers"
import {spreadable} from "../ast/convert-to-html"

enableAllPlugins()

@customElement("mayo-document")
export default class MayoDocumentElement extends LitElement {
	@property()
	contents: string
	@property({type: Boolean})
	dirty: boolean
	node: md.Root

	createRenderRoot(): this {
		return this
	}

	static get styles(): CSSResult {
		return css`
			article {
				white-space: pre-wrap;
			}

			article > * + * {
				margin-top: 1em;
			}

			article {
				width: 100%;
				height: 100%;
				font-size: 1.6em;
				font-family: avenir next, sans-serif;
				padding: 1em;
				color: #000;
				line-height: 1.2;
				max-width: 80ex;
				margin: auto;
				margin-bottom: 2em;
			}

			article:focus {
				outline: none;
			}
		`
	}

	attributeChangedCallback(name: string, before: string, now: string): void {
		super.attributeChangedCallback(name, before, now)
		if (name == "contents") {
			this.node = parse(this.contents)
		}
	}

	updateSelection(caret: CaretInstruction | null): void {
		let selection = document.getSelection()
		if (caret) {
			let target: Text | null = null
			if (caret && caret.type == "id") {
				let parent = document.getElementById(
					caret.elementId
				) as MayoNodeElement
			} else if (caret && caret.type == "parent") {
				target = caret.parentElement.interestingChildren[
					caret.textChildIndex
				] as Text
			} else if (caret && caret.type == "text") {
				target = caret.element
			}
			if (target) {
				selection.removeAllRanges()
				let range = document.createRange()
				range.setStart(target, caret ? caret.startOffset : 0)
				selection.addRange(range)
			}
		}
	}

	async handleInput(event: BeforeInputEvent) {
		event.preventDefault()
		// TODO multiple ranges?

		let transformOptions = await getTransformOptions(event)
		this.node = produce(this.node, draft => transform(draft, transformOptions))
		this.setAttribute("dirty", "true")
		await this.requestUpdate()
		// await this.updateComplete
		// this.placeCaret()
		event.preventDefault()
		return

		// let startContainerElement = startElement.container
		// 	? startElement
		// 	: (startElement.closest("[container]")! as MayoParentElement<any>)

		// let startBlockElement = startElement.block
		// 	? startElement
		// 	: (startElement.closest("[block]")! as MayoParentElement<any>)

		// let endBlockElement = endElement.block
		// 	? endElement
		// 	: (endElement.closest("[block]")! as MayoParentElement<any>)

		// // the index of the start element in the start block (x)
		// let startElementIndex = 0
		// if (startElement.inline) {
		// 	startElementIndex = startBlockElement.interestingChildren.indexOf(
		// 		startElement
		// 	)
		// } else if (startElement.block) {
		// 	startElementIndex = startBlockElement.interestingChildren.indexOf(
		// 		range.startContainer
		// 	)
		// }

		// let endElementIndex = 0
		// if (endElement.inline) {
		// 	endElementIndex = endBlockElement.interestingChildren.indexOf(endElement)
		// } else if (endElement.block) {
		// 	endElementIndex = endBlockElement.interestingChildren.indexOf(
		// 		range.endContainer
		// 	)
		// }
		// switch (event.inputType) {
		// 	case "insertReplacementText":
		// 		event.dataTransfer.items[0].getAsString(text => {
		// 			startElement.selfInsertText(text, range)
		// 			this.setAttribute("dirty", "true")
		// 		})
		// 		break
		// 	case "insertText": {
		// 		let caret: CaretInstruction | null = null
		// 		if (range.startContainer == range.endContainer) {
		// 			caret = startElement.selfInsertText(event.data || "", range)
		// 			event.preventDefault()
		// 		} else if (startBlockElement == endBlockElement) {
		// 			caret = (startBlockElement as MayoParentElement<any>).insertTextAsCommonAncestor(
		// 				startElement,
		// 				endElement,
		// 				event.data || "",
		// 				range
		// 			)
		// 		} else {
		// 			// TODO this is a textInsert across blocks, sounds hard
		// 		}

		// 		this.setAttribute("dirty", "true")

		// 		this.updateSelection(caret)
		// 		break
		// 	}
		// 	case "insertLineBreak": {
		// 		let index = startBlockElement.interestingChildren.indexOf(startElement)
		// 		startBlockElement.node.children.splice(index + 1, 0, u("break"))
		// 		this.setAttribute("dirty", "true")

		// 		event.preventDefault()
		// 		break
		// 	}
		// 	case "insertParagraph": {
		// 		let id = shortId()
		// 		if ("value" in startElement.node) {
		// 			if (isTextOrInlineCode(startElement)) {
		// 				insertParagraph(
		// 					this.node,
		// 					startElement.node,
		// 					range.startOffset,
		// 					id
		// 				)
		// 			}
		// 		} else if (startElement == startBlockElement) {
		// 			if (Array.isArray(startElement.node.children)) {
		// 				insertParagraph(
		// 					this.node,
		// 					startElement.node.children[startElementIndex],
		// 					range.startOffset,
		// 					id
		// 				)
		// 			}
		// 		} else {
		// 			let idx = startElement.interestingChildren.indexOf(
		// 				range.startContainer
		// 			)
		// 			if (Array.isArray(startElement.node.children)) {
		// 				insertParagraph(
		// 					this.node,
		// 					startElement.node.children[idx],
		// 					range.startOffset,
		// 					id
		// 				)
		// 			}
		// 		}

		// 		this.setAttribute("dirty", "true")

		// 		this.updateSelection({
		// 			type: "id" as const,
		// 			elementId: id,
		// 			textChildIndex: 0,
		// 			startOffset: 0,
		// 		})
		// 		break
		// 	}
		// 	case "deleteContentBackward": {
		// 		if (startElement.node.type == "paragraph") {
		// 			startElement = startElement as MayoParagraphElement

		// 			if (startElement.atBeginningOfBlock(range)) {
		// 				backspaceParagraph(this.node, startElement.node)
		// 			}
		// 		} else if (startElement != startBlockElement) {
		// 			if (is.container(startElement.node.type)) {
		// 				// go through the children and move the top-level text nodes out into the parent
		// 				let indexOfTextNode = startElement.interestingChildren.indexOf(
		// 					range.startContainer
		// 				)
		// 				if (Array.isArray(startElement.node.children)) {
		// 					let textNode = startElement.node.children[indexOfTextNode]
		// 				}
		// 			} else if (typeof startElement.node.value == "string") {
		// 				if (range.startOffset == startElement.node.value.length - 1) {
		// 					startElement.node.type = "text"

		// 					// TODO fix caret position
		// 					// this.updateSelection()
		// 					event.preventDefault()
		// 				}
		// 			}
		// 		}

		// 		let caret = startElement.selfDeleteContentBackward(range)

		// 		this.setAttribute("dirty", "true")

		// 		if (caret) {
		// 			this.updateSelection(caret)
		// 		}
		// 		break
		// 	}
		// }

		// event.preventDefault()
		//this.updateForTransform(event)
	}

	updateForTransform(caret: CaretInstruction) {
		this.setAttribute("dirty", "true")
		this.updateSelection(caret)
	}

	handleKeydown(event: KeyboardEvent) {
		if (event.key == "s" && (event.ctrlKey || event.metaKey)) {
			this.save()
			event.preventDefault()
		}
	}

	save() {
		this.contents = toMarkdown(compact(this.node))
		this.dispatchEvent(new CustomEvent("save"))
	}

	render() {
		return html`<article
			type="root"
			?block=${true}
			?container=${true}
			.node=${this.node}
			path=""
		>
			${this.node
				? this.node.children.map((child, index) => {
						return html`<mayo-node
							path=".${index}"
							.parent=${this.node}
							.node=${child}
							index=${index}
							type=${child.type}
							...=${spread(spreadable(child))}
							?container=${is.container(child.type)}
							?empty=${is.empty(child.type)}
							?inline=${is.inline(child.type)}
							?leaf=${is.leaf(child.type)}
							?list=${is.list(child.type)}
							?block=${is.block(child.type)}
						></mayo-node>`
				  })
				: ""}
		</article>`
	}

	constructor() {
		super()
		this.addEventListener("keydown", this.handleKeydown)
		this.addEventListener("beforeinput", this.handleInput)
	}

	connectedCallback() {
		super.connectedCallback()
	}
}
