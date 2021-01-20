import type * as md from "mdast"
import {MayoLiteralElement} from "./mayo-element"

export default class MayoHtmlElement extends MayoLiteralElement<md.HTML> {
	connectedCallback() {
		super.connectedCallback()
		this.innerHTML = this.textContent || ""
	}
}
