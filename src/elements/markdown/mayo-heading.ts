import {customElement, LitElement} from "lit-element"
import {html} from "lit-html"

@customElement("mayo-heading")
export default class MayoHeadingElement extends LitElement {
	render() {
		return html`hello`
	}
	// get depth(): Depth {
	// 	return this.node.depth
	// }
	// set depth(val: Depth) {
	// 	this.node.depth = val
	// }
	// selfInsertText(text: string, range: StaticRange): CaretInstruction {
	// 	if (text == "#" && this.atBeginningOfBlock(range)) {
	// 		if (this.depth < 6) {
	// 			this.depth += 1
	// 		}
	// 		return {
	// 			type: "parent",
	// 			parent: this,
	// 			index: 0,
	// 			startOffset: 0,
	// 		}
	// 	}
	// 	return super.selfInsertText(text, range)
	// }
	// selfDeleteContentBackward(range: StaticRange): CaretInstruction {
	// 	if (this.atBeginningOfBlock(range)) {
	// 		let id = shortid()
	// 		this.node.id = id
	// 		if (this.depth > 1) {
	// 			this.depth -= 1
	// 		} else {
	// 			// @ts-ignore
	// 			this.node.type = "paragraph"
	// 			delete this.node.depth
	// 		}
	// 		return {
	// 			type: "id",
	// 			id,
	// 			index: 0,
	// 			startOffset: 0,
	// 		}
	// 	}
	// 	let caret = super.selfDeleteContentBackward(range)
	// 	return caret
	// }
}
