import type {TransformOptions} from "../ast/transform"
import {InputType} from "../events/before-input-event"
import MayoNodeElement from "../elements/mayo-node"
import htmlToHast from "rehype-parse"
import hastToMdast from "hast-util-to-mdast"
import unified from "unified"

export interface GetTransformOptionsOptions {
	inputType: InputType
	range: StaticRange
	data?: string
	dataTransfer?: DataTransfer
}

export default async function getTransformOptions({
	inputType,
	range,
	data,
	dataTransfer,
}: GetTransformOptionsOptions): Promise<TransformOptions> {
	let start = range.startContainer.parentElement as MayoNodeElement
	let end = range.endContainer.parentElement as MayoNodeElement
	let detail = data
	if (inputType == "insertReplacementText") {
		// i'm going to regret this
		// instead i should be creating a placeholder element
		detail = await new Promise(yay => dataTransfer.items[0].getAsString(yay))
	}

	if (inputType == "insertFromPaste") {
		let items = Array.from(dataTransfer.items)
		let imageItem = items.find(item => item.type.startsWith("image"))
		let htmlItem = items.find(item => item.type == "text/html")
		let textItem = items.find(item => item.type == "text/plain")
		if (imageItem) {
			// TODO we copy the image
		}

		if (htmlItem) {
			detail = await new Promise(yay => htmlItem.getAsString(yay)).then(
				string => {
					let hast = unified().use(htmlToHast).parse(string)
					return hastToMdast(hast)
				}
			)
		} else if (textItem) {
			detail = await new Promise(yay => textItem.getAsString(yay))
			inputType = "insertText"
		}
	}

	if (start.tagName.toLowerCase() != "mayo-node") {
		start = start.closest("mayo-node")
	}
	if (end.tagName.toLowerCase() != "mayo-node") {
		end = end.closest("mayo-node")
	}

	return {
		detail,
		start: {
			path: start.path,
			offset: range.startOffset,
		},
		end: {
			path: end.path,
			offset: range.endOffset,
		},
		inputType: inputType,
	}
}
