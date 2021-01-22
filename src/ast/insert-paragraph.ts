import {visit, EXIT, selectAll} from "unist-utils-core"
import * as unist from "unist"
import * as md from "mdast"
import u from "unist-builder"
import * as is from "./is"
import {remove} from "./utils"
import split from "./split"

export default function insertParagraph(
	root: md.Parent,
	target: md.Text | md.InlineCode,
	offset: number,
	id?: string
): void {
	if (!target || (target.type != "text" && target.type != "inlineCode")) {
		throw new Error(
			`must have a text or inlineCode target, got ${target?.type}`
		)
	}
	let [left, right] = split(root, target, offset)
	let t = selectAll<md.Text | md.InlineCode>("text, inlineCode", right)
	if (t.length == 1) {
		let [node] = t
		if (node.value.length == 0) {
			node.type = "text"
			node.value = " "
		}
	}

	visit(root, target, (node, index, parents) => {
		node.value = left.value
		let firstp = parents[parents.length - 1]
		let prest = firstp.children.slice(index + 1)

		let rest: unist.Node[] = []
		if (target.type == "text" || target.type == "inlineCode") {
			parents.forEach((parent, index) => {
				if (is.inline(parent.type)) {
					let idx = parents[index - 1].children.indexOf(parent)
					parents[index - 1].children.splice(idx, 1, left)
					if (!rest.length) {
						rest = parents[index - 1].children.slice(idx + 1)
					}
					rest.forEach((n: unist.Node) => remove(parents[index - 1], {}, n))
				}
			})
		}
		parents.forEach((parent, index) => {
			if (is.block(parent.type) && is.leaf(parent.type)) {
				let idx = parents[index - 1].children.indexOf(parent)
				let opts: {id?: string} = {}
				if (id) {
					opts.id = id
				}
				prest.forEach((n: unist.Node) => remove(parents[index - 1], {}, n))
				if (parent != firstp) {
					prest = []
				}
				parents[index - 1].children.splice(
					idx + 1,
					0,
					u("paragraph", opts, [right, ...rest, ...prest])
				)
			}
		})
		return EXIT
	})
}
