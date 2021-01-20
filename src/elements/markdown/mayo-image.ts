import * as md from "mdast"
import {MayoEmptyElement} from "./mayo-element"
export default class MayoImageElement extends MayoEmptyElement<md.Image> {
	connectedCallback() {
		super.connectedCallback()
	}
}
