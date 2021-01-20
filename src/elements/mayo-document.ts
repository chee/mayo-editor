import parse from "mdast-util-from-markdown"
import convertToHtml from "../ast/convert-to-html"
import type * as md from "mdast"
import {target} from "@github/catalyst"
import shortId from "shortid"
import type {
	BeforeInputEvent,
	CaretInstruction,
	MayoContentElement,
} from "./index"
import {html, render} from "lit-html"
import u from "unist-builder"
import {
	MayoElement,
	MayoLiteralElement,
	MayoParentElement,
} from "./markdown/mayo-element"
// TODO learn how to declare types for this
// @ts-ignore
import compact from "mdast-util-compact"
import {insertParagraph} from "../ast/utils"
import toMarkdown from "mdast-util-to-markdown"

function isTextOrInlineCode(
	node: MayoContentElement
): node is MayoLiteralElement<md.InlineCode> | MayoLiteralElement<md.Text> {
	return node.node.type == "inlineCode" || node.node.type == "text"
}

export default class MayoDocumentElement extends HTMLElement {
	@target document: HTMLElement

	get path(): string {
		return this.getAttribute("path") || ""
	}

	set path(value: string) {
		this.setAttribute("path", value)
	}

	get contents(): string {
		return this.getAttribute("contents") || ""
	}

	set contents(value: string) {
		this.setAttribute("contents", value)
	}

	ast: md.Root

	static get observedAttributes(): string[] {
		return ["contents", "path"]
	}

	get interestingChildren(): Node[] {
		return Array.from(this.document.childNodes).filter(
			n => "node" in n || n.nodeName == "#text"
		)
	}
	updateSelection(caret: CaretInstruction | null): void {
		let selection = document.getSelection()!
		if (caret) {
			let target: Text | null = null
			if (caret && caret.type == "id") {
				let parent = document.getElementById(
					caret.id
				) as MayoParentElement<any>
				target = parent.interestingChildren[caret.index] as Text
			} else if (caret && caret.type == "parent") {
				target = caret.parent.interestingChildren[caret.index] as Text
			} else if (caret && caret.type == "text") {
				target = caret.element
			}
			if (target) {
				selection.removeAllRanges()
				let range = document.createRange()
				range.setStart(target, caret ? caret.startOffset : 0)
				selection.addRange(range)
			}
		} else {
			// this.straightUpWingTheSelection()
		}
	}

	handleInput(event: BeforeInputEvent) {
		// TODO multiple ranges?

		let range: StaticRange = event.getTargetRanges()[0]
		let isCaret =
			range.endContainer == range.startContainer &&
			range.startOffset == range.endOffset
		let isRange = !isCaret

		let startElement = range.startContainer
			.parentElement! as MayoContentElement
		let endElement = range.endContainer.parentElement! as MayoContentElement

		let startNode: md.Content = startElement.node
		let endNode: md.Content = startElement.node

		let startBlockElement = startElement.block
			? startElement
			: (startElement.closest("[block]")! as MayoParentElement<any>)

		let endBlockElement = endElement.block
			? endElement
			: (endElement.closest("[block]")! as MayoParentElement<any>)

		// the index of the start block in the mayo-document (y)
		let startBlockIndex = Array.from(this.document.children).indexOf(
			startBlockElement
		)

		let endBlockIndex = Array.from(this.document.children).indexOf(
			endBlockElement
		)

		// the index of the start element in the start block (x)
		let startElementIndex = 0
		if (startElement.inline) {
			startElementIndex = startBlockElement.interestingChildren.indexOf(
				startElement
			)
		} else if (startElement.block) {
			startElementIndex = startBlockElement.interestingChildren.indexOf(
				range.startContainer
			)
		}

		let endElementIndex = 0
		if (endElement.inline) {
			endElementIndex = endBlockElement.interestingChildren.indexOf(endElement)
		} else if (endElement.block) {
			endElementIndex = endBlockElement.interestingChildren.indexOf(
				range.endContainer
			)
		}
		switch (event.inputType) {
			case "insertReplacementText":
				event.dataTransfer.items[0].getAsString(text => {
					startElement.selfInsertText(text, range)
					this.setAttribute("dirty", "true")
					this.update()
				})
				break
			case "insertText": {
				let caret: CaretInstruction | null = null
				if (range.startContainer == range.endContainer) {
					caret = startElement.selfInsertText(event.data || "", range)
					event.preventDefault()
				} else if (startBlockElement == endBlockElement) {
					caret = (startBlockElement as MayoParentElement<any>).insertTextAsCommonAncestor(
						startElement,
						endElement,
						event.data || "",
						range
					)
				} else {
					// TODO this is a textInsert across blocks, sounds hard
				}

				this.setAttribute("dirty", "true")
				this.update()
				this.updateSelection(caret)
				break
			}
			case "insertLineBreak": {
				let index = startBlockElement.interestingChildren.indexOf(startElement)
				startBlockElement.node.children.splice(index + 1, 0, u("break"))
				this.setAttribute("dirty", "true")
				this.update()
				event.preventDefault()
				break
			}
			case "insertParagraph": {
				let id = shortId()
				if ("value" in startElement.node) {
					// TODO isLiteralElement typeguard

					if (isTextOrInlineCode(startElement)) {
						insertParagraph(this.ast, startElement.node, range.startOffset, id)
					}
				} else if (startElement == startBlockElement) {
					if (Array.isArray(startElement.node.children)) {
						insertParagraph(
							this.ast,
							startElement.node.children[startElementIndex],
							range.startOffset,
							id
						)
					}
				} else {
					let idx = startElement.interestingChildren.indexOf(
						range.startContainer
					)
					if (Array.isArray(startElement.node.children)) {
						insertParagraph(
							this.ast,
							startElement.node.children[idx],
							range.startOffset,
							id
						)
					}
				}

				this.setAttribute("dirty", "true")
				this.update()
				this.updateSelection({
					type: "id" as const,
					id,
					index: 0,
					startOffset: 0,
				})
				break
			}
			case "deleteContentBackward": {
				let atStartOfSomeChild =
					range.startContainer == range.endContainer &&
					"node" in range.startContainer
				let child = range.startContainer as MayoElement<md.PhrasingContent>

				let index = startElement.interestingChildren.indexOf(child)

				if (atStartOfSomeChild) {
					let somethingHappened = false
					switch (child.node.type) {
						case "strong":
						case "emphasis":
						case "delete":
							if (Array.isArray(startElement.node.children)) {
								startElement.node.children.splice(
									index,
									1,
									...child.node.children
								)
							}
							somethingHappened = true
							break
						case "inlineCode":
							// @ts-ignore
							child.node.type = "text"
							somethingHappened = true
							break
					}
					if (somethingHappened) {
						this.update()
						event.preventDefault()
					}
					this.updateSelection({
						type: "parent",
						parent: startBlockElement as MayoParentElement<md.Parent>,
						index: index,
						startOffset: 0,
					})
				} else if (range.startContainer == range.endContainer) {
					let caret = startElement.selfDeleteContentBackward(range)
					this.setAttribute("dirty", "true")
					this.update()
					if (caret) {
						this.updateSelection(caret)
					}
				}
				break
			}
			case "deleteContentForward": {
				let atStartOfBlock =
					startElement == startBlockElement && range.collapsed
			}
			case "deleteByCut":
			case "insertOrderedList":
			case "insertUnorderedList":
			case "insertHorizontalRule":
			case "insertFromYank":
			case "insertFromDrop":
			case "insertFromPaste":
			case "insertFromPasteAsQuotation":
			case "insertTranspose":
			case "insertCompositionText":
			case "insertLink":
			case "deleteWordBackward":
			case "deleteWordForward":
			case "deleteSoftLineBackward":
			case "deleteSoftLineForward":
			case "deleteEntireSoftLine":
			case "deleteHardLineBackward":
			case "deleteHardLineForward":
			case "deleteByDrag":
			case "deleteContent":
			case "historyUndo":
			case "historyRedo":
			case "formatBold":
			case "formatItalic":
			case "formatUnderline":
			case "formatStrikeThrough":
			case "formatSuperscript":
			case "formatSubscript":
			case "formatJustifyFull":
			case "formatJustifyCenter":
			case "formatJustifyRight":
			case "formatJustifyLeft":
			case "formatIndent":
			case "formatOutdent":
			case "formatRemove":
			case "formatSetBlockTextDirection":
			case "formatSetInlineTextDirection":
			case "formatBackColor":
			case "formatFontColor":
			case "formatFontName":
				console.log(`unhandled input event: ${event.inputType}`)
		}

		event.preventDefault()
		//this.updateForTransform(event)
	}

	updateForTransform(caret: CaretInstruction) {
		this.setAttribute("dirty", "true")
		this.update()
		this.updateSelection(caret)
	}

	handleKeydown(event: KeyboardEvent) {
		if (event.key == "s" && (event.ctrlKey || event.metaKey)) {
			this.save()
			event.preventDefault()
		}
	}

	save() {
		this.contents = toMarkdown(compact(this.ast))
		this.dispatchEvent(new CustomEvent("save"))
	}

	update() {
		if (!this.ast) {
			return
		}
		this.ast = compact(this.ast)
		render(convertToHtml(this.ast, this.ast), this.document)
	}

	attributeChangedCallback(name: string, oldValue: any, newValue: any): void {
		if (name == "contents") {
			let contents = newValue

			this.ast = parse(contents)

			if (this.ast.children.length == 0) {
				this.ast.children.splice(0, 0, u("paragraph", [u("text", " ")]))
			}
			this.update()
		}
	}

	connectedCallback() {
		render(
			html`<article
				id="doc"
				contenteditable
				block
				container
				data-target="mayo-document.document"
				data-action="beforeinput:mayo-document#handleInput keydown:mayo-document#handleKeydown"
			></article>`,
			this
		)
		if (this.contents) {
			let contents = this.contents
			this.ast = parse(contents)

			if (this.ast.children.length == 0) {
				this.ast.children.splice(0, 0, u("paragraph", [u("text", " ")]))
			}
			this.update()
		}
	}
}
