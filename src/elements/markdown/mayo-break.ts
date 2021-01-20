import * as md from "mdast"
import {MayoEmptyElement} from "./mayo-element"
export default class MayoBreakElement extends MayoEmptyElement<md.Break> {
	connectedCallback() {
		super.connectedCallback()
	}
}
