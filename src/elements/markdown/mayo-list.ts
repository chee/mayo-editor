import {MayoParentElement} from "./mayo-element"
import * as md from "mdast"

export default class MayoListElement extends MayoParentElement<md.List> {
	connectedCallback() {
		super.connectedCallback()
	}
}
