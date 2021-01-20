import * as md from "mdast"
import {MayoLiteralElement} from "./mayo-element"

export default class MayoCodeElement extends MayoLiteralElement<md.Code> {
	connectedCallback() {
		super.connectedCallback()
	}
}
