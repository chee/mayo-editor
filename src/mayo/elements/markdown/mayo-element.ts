import type * as md from "mdast"
import type * as unist from "unist"
import {split} from "../../utils"
import {CaretInstruction, MayoContentElement} from ".."
export abstract class MayoElement<
	AstNodeType extends unist.Node
> extends HTMLElement {
	node: AstNodeType
	get value(): string | undefined {
		return this.getAttribute("value")
	}

	get type(): string | undefined {
		return this.getAttribute("type")
	}

	get block(): boolean {
		return this.hasAttribute("block")
	}

	get leaf(): boolean {
		return this.hasAttribute("leaf")
	}

	get container(): boolean {
		return this.hasAttribute("container")
	}

	get inline(): boolean {
		return this.hasAttribute("inline")
	}

	get interestingChildren(): Node[] {
		return Array.from(this.childNodes).filter(
			n => "node" in n || n.nodeName == "#text"
		)
	}
	/**
	 * Insert text when the range start and end are both in a single element
	 * @param text the text to insert
	 * @param range the selected range, which may be of interest
	 */
	abstract selfInsertText(text: string, range: StaticRange): CaretInstruction

	connectedCallback(): void {
		return void void 0
	}
}

export class MayoEmptyElement<
	AstNodeType extends
		| md.ImageReference
		| md.LinkReference
		| md.Link
		| md.Break
		| md.ThematicBreak
		| md.Image
> extends MayoElement<AstNodeType> {
	selfDeleteContentBackward(r: StaticRange): void {
		throw new TypeError()
	}
	selfInsertText(_text: string, _range: StaticRange): CaretInstruction {
		throw new Error("empty elements")
	}
}

export class MayoLiteralElement<
	AstNodeType extends md.Literal
> extends MayoElement<AstNodeType> {
	insertText(selection: Selection, event: InputEvent) {
		let special = event.data!.match(/[~`*_]/)
		if (special) {
			console.log(this.nodeValue, this.node.value)
		} else {
			this.node.value = selection.focusNode!.nodeValue || ""
			return true
		}
	}

	selfInsertText(text: string, range: StaticRange): CaretInstruction {
		this.node.value =
			this.node.value.slice(0, range.startOffset) +
			text +
			this.node.value.slice(range.endOffset)
		return {
			type: "text",
			element: this.interestingChildren[0] as Text,
			startOffset: range.startOffset + 1,
		}
	}

	selfDeleteContentBackward(range: StaticRange): CaretInstruction {
		this.node.value =
			this.node.value.slice(0, range.startOffset) +
			this.node.value.slice(range.endOffset)
		return {
			type: "text",
			element: this.interestingChildren[0] as Text,
			startOffset: range.startOffset,
		}
	}
}

export class MayoParentElement<
	AstNodeType extends md.Parent
> extends MayoElement<AstNodeType> {
	atBeginningOfBlock(range: StaticRange): boolean {
		return (
			range.collapsed &&
			this.interestingChildren.indexOf(range.startContainer) == 0 &&
			range.startOffset == 0
		)
	}

	selfInsertText(text: string, range: StaticRange): CaretInstruction {
		// TODO if the character is special, and the range is !caret then wrap the selected area
		let targetTextNode = range.startContainer
		let targetIndex = this.interestingChildren.indexOf(targetTextNode)
		if (targetIndex == -1) {
			throw new Error(`${targetTextNode} is not a child of ${this}`)
		}

		let targetAstNode = this.node.children[targetIndex]
		if (targetAstNode.type != "text") {
			throw new Error(
				`expected the ast node to be of type text, got ${targetAstNode.type}`
			)
		}
		targetAstNode.value =
			targetAstNode.value.slice(0, range.startOffset) +
			text +
			targetAstNode.value.slice(range.endOffset)

		let caret = {
			type: "parent" as const,
			parent: this,
			index: targetIndex,
			startOffset: range.startOffset + 1,
		}

		return caret
		// TODO replace this with code that creates a code node when you press `
		// let ticks = targetAstNode.value.match(/(\s)`([^`]+)`(\s)/)

		// if (ticks) {
		// 	let tickIndex = targetAstNode.value.indexOf(ticks[0])
		// 	let prespace = ticks[1]
		// 	let tickContent = ticks[2]

		// 	let aftspace = ticks[3]
		// 	this.node.children.splice(
		// 		targetIndex,
		// 		1,
		// 		u("text", targetAstNode.value.slice(0, tickIndex) + prespace),
		// 		u("inlineCode", {id: shortId()}, tickContent),
		// 		u(
		// 			"text",
		// 			aftspace + targetAstNode.value.slice(tickIndex + ticks[0].length)
		// 		)
		// 	)
		// } else {
		// 	return caret
		// }
	}

	insertTextAsCommonAncestor(
		startElement: MayoContentElement,
		endElement: MayoContentElement,
		text: string,
		range: StaticRange
	): CaretInstruction {
		// This is tricky for me right now
		// but, what i want to to i think is
		// to move the startNode and endNode (which are both text nodes) up to being direct
		// children of `this`, removing the other nodes between start and end
		// and then merging them if they're the same type...
		// i think.
		// i think.
		// TODO write a

		let startVal = range.startContainer.nodeValue?.slice(0, range.startOffset)
		let endVal = range.endContainer.nodeValue?.slice(range.endOffset)

		let startChildIndex = startElement.interestingChildren.indexOf(
			range.startContainer
		)
		let endChildIndex = endElement.interestingChildren.indexOf(
			range.endContainer
		)
		let startIndex = this.interestingChildren.indexOf(startElement)
		let endIndex = this.interestingChildren.indexOf(endElement)
		let snode
		if (startChildIndex != -1 && Array.isArray(startElement.node.children)) {
			snode = startElement.node.children[startChildIndex]
		} else {
			snode = startElement.node
		}

		let child = startElement.firstChild
		if (child.nodeName == "#text") {
			let element = child as Text
			return {type: "text", element, startOffset: 0}
		}
	}

	insertParagraph(range: StaticRange) {}

	selfDeleteContentBackward(range: StaticRange) {
		let targetTextNode = range.startContainer
		let targetIndex = this.interestingChildren.indexOf(targetTextNode)
		if (targetIndex == -1) {
			throw new Error(`${targetTextNode} is not a child of ${this}`)
		}

		let targetAstNode = this.node.children[targetIndex]
		if (targetAstNode.type != "text") {
			throw new Error(
				`expected the ast node to be of type text, got ${targetAstNode.type}`
			)
		}
		targetAstNode.value =
			targetAstNode.value.slice(0, range.startOffset) +
			targetAstNode.value.slice(range.endOffset)

		let caret = {
			type: "parent" as const,
			parent: this,
			index: targetIndex,
			startOffset: range.startOffset,
		}

		return caret
	}
}
