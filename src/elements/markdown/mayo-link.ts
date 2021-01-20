import * as md from "mdast"
import {MayoEmptyElement} from "./mayo-element"
export default class MayoLinkElement extends MayoEmptyElement<md.Link> {
	connectedCallback() {
		super.connectedCallback()
	}
}
