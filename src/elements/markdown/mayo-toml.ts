import {MayoLiteralElement} from "./mayo-element"
import * as md from "mdast"
export default class MayoTomlElement extends MayoLiteralElement<md.FrontmatterContent> {
	connectedCallback() {
		super.connectedCallback()
	}
}
