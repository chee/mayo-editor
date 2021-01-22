import type {TransformHandler} from "."
import {visit} from "unist-utils-core"
import {produce} from "immer"

let insertText: TransformHandler = (root, options) => {
	let startNode = options.start.node
	let endNode = options.end.node
	if (startNode == endNode && typeof startNode.value == "string") {
		if (!startNode.data) {
			startNode.data = {}
		}
		startNode.data.caret = {
			type: "collapsed",
			offset: options.start.offset + 1,
		}
		startNode.value =
			startNode.value.slice(0, options.start.offset) +
			options.data +
			startNode.value.slice(options.end.offset)
	}
}
export default insertText
