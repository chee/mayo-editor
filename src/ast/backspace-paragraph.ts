import {visit, EXIT} from "unist-utils-core"
import * as md from "mdast"
import compact from "mdast-util-compact"

export default function backspaceParagraph(
	root: md.Parent,
	target: md.Paragraph,
	id?: string
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
			previous.children.splice(length, 0, ...node.children)
			parent.children[index - 1] = compact(previous)
			// TODO come back and use merge
			if (id) {
				let child = previous.children[length - 1]
				child.id = id
			}
		} else {
			throw new TypeError("line before somehow has no children?")
		}

		parent.children.splice(index, 1)
		return EXIT
	})
}
