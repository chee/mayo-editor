import {find} from "unist-utils-core"
// @ts-ignore
import uremove from "unist-util-remove"
import * as unist from "unist"
import * as md from "mdast"

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
