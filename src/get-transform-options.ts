import type {TransformOptions} from "./ast/transform"
import BeforeInputEvent from "./before-input-event"
import MayoNodeElement from "./elements/mayo-node"
import type * as md from "mdast"
import {find} from "unist-utils-core"

export default async function getTransformOptions(
	event: BeforeInputEvent
): Promise<TransformOptions> {
	let data = event.data

	if (event.inputType == "insertReplacementText") {
		// i'm going to regret this
		// instead i should be creating a placeholder element
		data = await new Promise(yay =>
			event.dataTransfer.items[0].getAsString(yay)
		)
	}

	let range = event.getTargetRanges()[0]
	let start = range.startContainer.parentElement as MayoNodeElement
	let end = range.endContainer.parentElement as MayoNodeElement

	if (start.tagName.toLowerCase() != "mayo-node") {
		start = start.closest("mayo-node")
	}
	if (end.tagName.toLowerCase() != "mayo-node") {
		end = end.closest("mayo-node")
	}

	return {
		data,
		start: {
			path: start.path,
			offset: range.startOffset,
		},
		end: {
			path: end.path,
			offset: range.endOffset,
		},
		inputType: event.inputType,
	}
}
