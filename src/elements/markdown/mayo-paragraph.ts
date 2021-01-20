import {MayoParentElement} from "./mayo-element"
import * as md from "mdast"
import u from "unist-builder"
import {CaretInstruction} from ".."
import shortid from "shortid"

export default class MayoParagraphElement extends MayoParentElement<md.Paragraph> {
	selfInsertText(text: string, range: StaticRange): CaretInstruction {
		let atBeginning = this.atBeginningOfBlock(range)

		let id = shortid()
		let caret: CaretInstruction = {
			type: "id",
			id,
			index: 0,
			startOffset: 0,
		}

		if (atBeginning) {
			switch (text) {
				case "#": {
					this.node.depth = 1
					// @ts-ignore
					this.node.type = "heading"
					this.node.id = id
					return caret
				}
				case ">": {
					this.node.children = [
						// @ts-ignore
						{
							...this.node,
							id,
						},
					]
					// @ts-ignore
					this.node.type = "blockquote"
					return caret
				}
				case "-": {
					this.node.children = [
						// @ts-ignore
						u("listItem", [{...this.node, id}]),
					]
					// @ts-ignore
					this.node.type = "list"
					this.node.ordered = false
					return caret
				}
				case ".": {
					this.node.children = [
						// @ts-ignore
						u("listItem", [{...this.node, id}]),
					]
					// @ts-ignore
					this.node.type = "list"
					this.node.ordered = true
					return caret
				}
			}
		}
		return super.selfInsertText(text, range)
	}
	connectedCallback() {
		super.connectedCallback()
	}
}
