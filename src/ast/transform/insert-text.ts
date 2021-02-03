import type {TransformHandler} from "."
import inviteParentsOverForDinner from "unist-util-parents"
import {find} from "unist-utils-core"
import * as md from "mdast"
import * as m from "mdast-builder"
import {DataCaret} from "../../caret"
import * as is from "../is"
import split from "../split"
import unistBuilder from "unist-builder"

let insertText: TransformHandler = (root, options) => {
	let startNode = options.start.node
	let endNode = options.end.node
	let treeWithParents = inviteParentsOverForDinner(root)
	let node = find<typeof startNode>(treeWithParents, startNode)
	let parent = node.parent
	let index = parent.children.indexOf(node)

	if (index == 0 && options.start.offset == 0) {
		if (options.detail == "#") {
			if (parent.type == "paragraph") {
				parent = parent as md.Heading
				;(parent.node as md.Heading).type = "heading"
				;(parent.node as md.Heading).depth = 1
				return
			} else if (parent.type == "heading") {
				parent = parent as md.Heading
				if (parent.depth < 6) {
					;(parent.node as md.Heading).depth += 1
					return
				}
			}
		}

		if (options.detail == "." || options.detail == "-") {
			if (parent.type == "paragraph") {
				let pnode = parent.node as md.List
				pnode.type = "list"
				pnode.ordered = options.detail == "."
				pnode.children = [
					m.listItem(m.paragraph(pnode.children)) as md.ListItem,
				]
				return
			}
		}
	}

	// TODO this will involve splitting the text node and inserting an insertCode
	if (options.detail == "`") {
		// make up my own inputTypes? why not
		if (is.text(options.start.node)) {
			let [left, right] = split(root, options.start.node, options.start.offset)
			let p = parent
			let path = [index]
			while (!is.block(p)) {
				path.unshift(p.parent.children.indexOf(p))
				p = p.parent
			}
			p.node.children.splice(
				path[0],
				1,
				left,
				unistBuilder(
					"inlineCode",
					{
						data: {
							caret: {
								caretStart: 0,
								caretEnd: 1,
							},
						},
					},
					" "
				),
				right
			)
		} else if (is.inlineCode(options.start.node)) {
			let [left, right] = split(root, options.start.node, options.start.offset)
			let p = parent
			let path = [index]
			while (!is.block(p)) {
				path.unshift(p.parent.children.indexOf(p))
				p = p.parent
			}
			let kids = [
				left,
				unistBuilder(
					"text",
					{
						data: {
							caret: {
								caretStart: 0,
								caretEnd: 1,
							},
						},
					},
					" "
				),
				right,
			].filter(n => n.value)
			p.node.children.splice(path[0], 1, ...kids)
		}

		// tranformHandlers.formatCode(options)
	}
	// TODO this will involve splitting the text node and inserting an emphasis
	// if (options.data == "_") {
	// 	transformHandlers.formatItalic(options)
	// }
	// TODO this will involve splitting the text node and inserting a strong
	// if (options.data == "*") {
	// 	transformHandlers.formatBold(options)
	//}

	if (startNode == endNode) {
		if (!startNode.data) {
			startNode.data = {}
		}

		let caret: DataCaret = {
			caretStart: options.start.offset + options.detail.length,
			caretEnd: options.start.offset + options.detail.length,
		}

		startNode.data.caret = caret

		if (is.leaf(startNode) && is.inline(startNode)) {
			startNode.value =
				startNode.value.slice(0, options.start.offset) +
				options.detail +
				startNode.value.slice(options.end.offset)
		} else {
			throw new Error("start node isn't inline??")
		}
	}
}
export default insertText
