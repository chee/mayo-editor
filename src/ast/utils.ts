import {find, visit, EXIT, selectAll} from "unist-utils-core"
// @ts-ignore
import uremove from "unist-util-remove"
import * as unist from "unist"
import * as md from "mdast"
import u from "unist-builder"
import * as is from "./is"

export function insertParagraph(
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

export function split(
	root: md.Parent,
	target: md.Text | md.InlineCode,
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

export function toString(node: unist.Node): string {
	return (
		(node && node.value) ||
		("children" in node &&
			Array.isArray(node.children) &&
			toStringAll(node.children)) ||
		""
	).toString()
}

function toStringAll(values: unist.Node[]): string {
	let result = []
	let index = -1

	while (++index < values.length) {
		result[index] = toString(values[index])
	}

	return result.join("")
}

export function pairSymbolFor(
	node: md.Emphasis | md.Strong | md.InlineCode | md.Delete
): string {
	switch (node.type) {
		case "emphasis":
			return "_"
		case "strong":
			return "**"
		case "inlineCode":
			return "`"
		case "delete":
			return "~"
		default:
			return ""
	}
}

export {find}

interface RemoveOptions {
	cascade?: boolean
}

export function remove(
	tree: unist.Node,
	options: RemoveOptions,
	condition: string | Record<string, unknown> | ((node: unist.Node) => boolean)
): unist.Node | null | undefined {
	return uremove(tree, options, condition)
}

export function getMayoName(camelName: string): string {
	let hyphenName = camelName.replace(/([A-Z]($|[a-z]))/g, "-$1").toLowerCase()
	let mayoName = `mayo-${hyphenName}`
	return mayoName
}
