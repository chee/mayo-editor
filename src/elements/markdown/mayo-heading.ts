import {CaretInstruction} from ".."
import type * as md from "mdast"
import {MayoParentElement} from "./mayo-element"
import {property} from "lit-element"

export default class MayoHeadingElement extends MayoParentElement<md.Heading> {
	get depth() {
		return this.node.depth
	}

	set depth(val: 1 | 2 | 3 | 4 | 5 | 6) {
		this.node.depth = val
	}

	selfInsertText(text: string, range: StaticRange): CaretInstruction {
		if (text == "#" && this.atBeginningOfBlock(range)) {
			if (this.depth < 6) {
				this.depth += 1
			}
			return {
				type: "parent",
				parent: this,
				index: 0,
				startOffset: 0,
			}
		}
		return super.selfInsertText(text, range)
	}

	connectedCallback(): void {
		super.connectedCallback()
	}
}
