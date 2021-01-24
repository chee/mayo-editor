import {visit, EXIT} from "unist-utils-core"
import * as md from "mdast"
import compact from "mdast-util-compact"
import {DataCaret} from "../caret"

export default function backspaceParagraph(
	root: md.Parent,
	target: md.Paragraph
): void {
	visit(root, target, (node, index, parents) => {
		let parent = parents[parents.length - 1]

		let previous = parent.children[index - 1]
		if (!previous) {
			throw new RangeError(
				"can't merge backwards when there is nothing behind"
			)
		}

		if (Array.isArray(previous.children)) {
			let length = previous.children.length
			let lastChildOfPrevious = previous.children[length - 1]
			while (lastChildOfPrevious.children) {
				let len = lastChildOfPrevious.children.length - 1
				lastChildOfPrevious = lastChildOfPrevious.children[len]
			}

			previous.children.splice(length, 0, ...node.children)
			parent.children[index - 1] = previous
			let n = node.children[0]

			while (n.children) {
				n = n.children[0]
			}

			let caret: DataCaret = {
				caretStart: 0,
				caretEnd: 0,
			}

			n.data = {caret}
			// TODO come back and use merge
		} else {
			throw new TypeError("line before somehow has no children?")
		}

		parent.children.splice(index, 1)
		return EXIT
	})
}
