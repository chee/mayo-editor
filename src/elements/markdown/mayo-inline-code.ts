import {MayoLiteralElement} from "./mayo-element"
import * as md from "mdast"
export default class MayoInlineCodeElement extends MayoLiteralElement<md.InlineCode> {
	connectedCallback() {
		super.connectedCallback()
	}
}
