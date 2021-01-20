import * as md from "mdast"
import {MayoParentElement} from "./mayo-element"

export default class MayoDeleteElement extends MayoParentElement<md.Delete> {
	connectedCallback() {
		super.connectedCallback()
	}
}
