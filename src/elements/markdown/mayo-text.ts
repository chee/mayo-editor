import {MayoLiteralElement} from "./mayo-element"
import * as md from "mdast"
export default class MayoTextElement extends MayoLiteralElement<md.Text> {
	connectedCallback() {
		super.connectedCallback()
	}
}
