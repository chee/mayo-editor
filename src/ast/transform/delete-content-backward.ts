import type {TransformHandler} from "."
import * as md from "mdast"
import visitParents from "unist-util-visit-parents"
import backspaceParagraph from "../backspace-paragraph"
import * as is from "../is"
import unwrap from "../unwrap"

let deleteContentBackward: TransformHandler = (root, options) => {
	let startNode = options.start.node
	let endNode = options.end.node

	if (is.leaf(startNode) && is.inline(startNode) && is.block(endNode)) {
		backspaceParagraph(root, (endNode as unknown) as md.Paragraph)
		return
	}

	visitParents(
		root,
		startNode as md.Text,
		(node, parents) => {
			let directParent = parents[parents.length - 1]

			if (is.textish(endNode)) {
				if (options.flags.unwrap !== false) {
					if (options.end.offset == endNode.value.length) {
						if (is.unwrappable(endNode)) {
							unwrap(root, endNode)
							return
						} else if (is.unwrappable(directParent)) {
							unwrap(root, directParent)
							return
						}
					}
				}
			}
			if (
				startNode == endNode &&
				is.textish(startNode) &&
				is.textish(endNode)
			) {
				startNode.value =
					startNode.value.slice(0, options.start.offset) +
					startNode.value.slice(options.end.offset)

				startNode.data = {
					caret: {
						caretStart: options.start.offset,
						caretEnd: options.start.offset,
					},
				}
			}
		},
		true
	)
}
export default deleteContentBackward
