import type {TransformHandler} from "."
// TODO move _insertParagraph in here :D
import _insertParagraph from "../insert-paragraph"
import * as md from "mdast"
import visitParents from "unist-util-visit-parents"

let insertParagraph: TransformHandler = (root, options) => {
	let startNode = options.start.node
	let endNode = options.end.node

	visitParents(root, startNode as md.Text, (node, parents) => {
		parents.reverse()
		let list = parents.find(p => p.type == "list")
	})

	if (startNode == endNode && typeof startNode.value == "string") {
		startNode = startNode as md.Text
		_insertParagraph(root, startNode, options.start.offset)
	}
}
export default insertParagraph
