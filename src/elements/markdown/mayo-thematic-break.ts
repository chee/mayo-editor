import * as md from "mdast"
import {MayoEmptyElement} from "./mayo-element"

export default class MayoThematicBreakElement extends MayoEmptyElement<md.ThematicBreak> {
	connectedCallback() {
		super.connectedCallback()
	}
}
