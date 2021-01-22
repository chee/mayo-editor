import {MayoParentElement} from "./mayo-element"
import * as md from "mdast"
import shortid from "shortid"
import {CaretInstruction} from "../../caret"

export default class MayoListItemElement extends MayoParentElement<md.ListItem> {
	selfDeleteContentBackward(range: StaticRange): CaretInstruction {
		if (this.atBeginningOfBlock(range)) {
			let id = shortid()
			this.node.id = id
			return {
				type: "id",
				id,
				index: 0,
				startOffset: 0,
			}
		}
		let caret = super.selfDeleteContentBackward(range)
		return caret
	}
	connectedCallback() {
		super.connectedCallback()
	}
}
