import {MayoParentElement} from "./mayo-element"
import * as md from "mdast"
import shortid from "shortid"
import {CaretInstruction} from "../../caret"

export default class MayoListElement extends MayoParentElement<md.List> {
	selfDeleteContentBackward(range: StaticRange): CaretInstruction {
		let targetNode = range.startContainer
		let targetIndex = this.interestingChildren.indexOf(targetNode)
		if (targetIndex == -1) {
			throw new Error(`${targetNode} is not a child of ${this}`)
		}

		let targetAstNode = this.node.children[targetIndex]
		let previousAstNode = this.node.children[targetIndex - 1]

		if (previousAstNode) {
			let index = previousAstNode.children.length
			let [first] = targetAstNode.children
			previousAstNode.children.splice(Infinity, 0, ...targetAstNode.children)
			let id = shortid()
			first.id = id

			return {
				type: "id",
				id,
				index: 0,
				startOffset: 0,
			}
		} else {
			// hello
			return
		}

		if (this.atBeginningOfBlock(range)) {
			let id = shortid()
			this.node.id = id
		}
		let caret = super.selfDeleteContentBackward(range)
		return caret
	}
	connectedCallback() {
		super.connectedCallback()
	}
}
