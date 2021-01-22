import {visit, EXIT} from "unist-utils-core"
import * as unist from "unist"
import * as md from "mdast"
import u from "unist-builder"
import * as is from "./is"

export type Unwrappable = md.Emphasis | md.Strong | md.Delete | md.InlineCode

export default function unwrap(
	root: md.Parent,
	target: md.InlineCode,
	offset: number
): [unist.Node, unist.Node] {
	let leftText = target.value.slice(0, offset)
	let rightText = target.value.slice(offset)

	let leftNode: unist.Node = u(target.type, leftText)
	let rightNode: unist.Node = u(target.type, rightText)

	visit(root, target, (node, index, parents) => {
		let firstp = parents[parents.length - 1]
		let nextpc = firstp.children.slice(0, index)
		let nextac = firstp.children.slice(index + 1)
		for (let i = parents.length - 1; i > 0; i--) {
			let highParent = parents[i - 1]
			let lowParent = parents[i]
			let idx = highParent.children.indexOf(lowParent)
			let pc = highParent.children.slice(0, idx)
			let ac = highParent.children.slice(idx + 1)
			if (is.inline(lowParent.type)) {
				leftNode = u(lowParent.type, [...nextpc, leftNode])
				rightNode = u(lowParent.type, [rightNode, ...nextac])
			}
			nextpc = pc
			nextac = ac
			if (is.block(lowParent.type)) {
				break
			}
		}

		return EXIT
	})

	return [leftNode, rightNode]
}
