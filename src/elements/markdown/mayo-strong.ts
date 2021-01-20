import {MayoParentElement} from "./mayo-element"
import * as md from "mdast"

export default class MayoStrongElement extends MayoParentElement<md.Strong> {
	connectedCallback() {
		super.connectedCallback()
	}
}
