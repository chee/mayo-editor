import {MayoLiteralElement} from "./mayo-element"
import * as md from "mdast"

export default class MayoYamlElement extends MayoLiteralElement<md.FrontmatterContent> {
	connectedCallback() {
		super.connectedCallback()
	}
}
