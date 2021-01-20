import * as md from "mdast"
import {MayoEmptyElement} from "./mayo-element"
export default class MayoImageReferenceElement extends MayoEmptyElement<md.ImageReference> {
	connectedCallback() {
		super.connectedCallback()
	}
}
