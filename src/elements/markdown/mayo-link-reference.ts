import * as md from "mdast"
import {MayoEmptyElement} from "./mayo-element"
export default class MayoLinkReferenceElement extends MayoEmptyElement<md.LinkReference> {
	connectedCallback() {
		super.connectedCallback()
	}
}
