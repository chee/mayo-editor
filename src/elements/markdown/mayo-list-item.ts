import {MayoParentElement} from "./mayo-element"
import * as md from "mdast"

export default class MayoListItemElement extends MayoParentElement<md.ListItem> {
	connectedCallback() {
		super.connectedCallback()
	}
}
