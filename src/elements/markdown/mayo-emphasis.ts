import {MayoParentElement} from "./mayo-element"
import type * as md from "mdast"

export default class MayoEmphasisElement extends MayoParentElement<md.Emphasis> {
	connectedCallback() {
		super.connectedCallback()
	}
}
