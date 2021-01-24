import {visit, EXIT} from "unist-utils-core"
import * as unist from "unist"
import * as md from "mdast"
import u from "unist-builder"
import * as is from "./is"
import compact from "mdast-util-compact"

export type Unwrappable = md.Emphasis | md.Strong | md.Delete | md.InlineCode

export default function unwrap(root: md.Parent, target: Unwrappable): void {
	visit(root, target, (node, index, parents) => {
		if (is.inline(node)) {
			let directParent = parents[parents.length - 1]
			if (is.container(node)) {
				directParent.children.splice(index, 1, ...node.children)
				node.children[node.children.length - 1].data = {
					caret: {
						caretStart: node.children[node.children.length - 1].value.length,
						caretEnd: node.children[node.children.length - 1].value.length,
					},
				}
			} else if (node.type == "inlineCode") {
				;((node as unknown) as md.Text).type = "text"
				node.data = {
					caret: {
						caretStart: node.value.length,
						caretEnd: node.value.length,
					},
				}
			}

			// TODO this flatten-text might be over the top, or needed elsewhere
			directParent.children = directParent.children.reduce(
				(children, next) => {
					if (children.length) {
						let previous = children[children.length - 1]
						if (next.type == "text" && previous.type == "text") {
							if (next.data?.caret) {
								previous.data = {
									caret: {
										caretStart:
											previous.value.length + next.data.caret.caretStart,
										caretEnd: previous.value.length + next.data.caret.caretEnd,
									},
								}
							}
							previous.value += next.value
							return children
						} else {
							return children.concat(next)
						}
					} else {
						return children.concat(next)
					}
				},
				[]
			)
		}
	})
}
