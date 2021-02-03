import * as md from "mdast"
import {InputType} from "../../events/before-input-event"
import insertText from "./insert-text"
import insertParagraph from "./insert-paragraph"
import visit from "unist-util-visit"
import type * as unist from "unist"
import {DataCaret} from "../../caret"
import deleteContentBackward from "./delete-content-backward"
import * as is from "../is"
import visitParents from "unist-util-visit-parents"

interface TransformHandlers {
	[key: string]: TransformHandler
}

export let nothing = Symbol("@transform/don't-actually")

export interface TransformHandler {
	(root: md.Root, options: TransformHandlerOptions): void | typeof nothing
}

function restoreCaret(options: TransformHandlerOptions): void {
	if (!options.start.node.data?.caret) {
		let caret: Partial<DataCaret> = {}
		options.start.node.data = {caret}
	}
	if (!options.end.node.data?.caret) {
		let caret: Partial<DataCaret> = {}
		options.end.node.data = {caret}
	}
	let startCaret: Partial<DataCaret> = options.start.node.data.caret
	startCaret.caretStart = options.start.offset
	let endCaret: Partial<DataCaret> = options.end.node.data.caret
	endCaret.caretEnd = options.end.offset
}

export let handlers: TransformHandlers = {
	insertReplacementText(root, options) {
		if (typeof options.start.node.value == "string") {
			options.end.offset = options.start.offset = options.detail.length
		}
		options.start.node.value = options.detail
		let caret: DataCaret = {
			caretStart: options.detail.length,
			caretEnd: options.detail.length,
		}
		options.start.node.data = {
			caret,
		}
	},
	insertText,
	insertLineBreak(root, options) {
		return nothing
	},
	insertParagraph,
	deleteContentBackward,
	deleteContentForward(root, options) {
		return nothing
	},
	deleteByCut(root, options) {
		return nothing
	},
	insertOrderedList(root, options) {
		return nothing
	},
	insertUnorderedList(root, options) {
		return nothing
	},
	insertHorizontalRule(root, options) {
		return nothing
	},
	insertFromYank(root, options) {
		return nothing
	},
	insertFromDrop(root, options) {
		return nothing
	},
	insertFromPaste(root, options) {
		return nothing
	},
	insertFromPasteAsQuotation(root, options) {
		return nothing
	},
	insertTranspose(root, options) {
		return nothing
	},
	insertCompositionText(root, options) {
		return nothing
	},
	insertLink(root, options) {
		return nothing
	},
	deleteWordBackward(root, options) {
		return nothing
	},
	deleteWordForward(root, options) {
		return nothing
	},
	deleteSoftLineBackward(root, options) {
		return nothing
	},
	deleteSoftLineForward(root, options) {
		return nothing
	},
	deleteEntireSoftLine(root, options) {
		return nothing
	},
	deleteHardLineBackward(root, options) {
		return nothing
	},
	deleteHardLineForward(root, options) {
		return nothing
	},
	deleteByDrag(root, options) {
		return nothing
	},
	deleteContent(root, options) {
		return nothing
	},
	historyUndo(root, options) {
		return nothing
	},
	historyRedo(root, options) {
		return nothing
	},
	formatBold(root, options) {
		return nothing
	},
	formatItalic(root, options) {
		return nothing
	},
	formatUnderline(root, options) {
		return nothing
	},
	formatStrikeThrough(root, options) {
		return nothing
	},
	formatSuperscript(root, options) {
		return nothing
	},
	formatSubscript(root, options) {
		return nothing
	},
	formatJustifyFull(root, options) {
		return nothing
	},
	formatJustifyCenter(root, options) {
		return nothing
	},
	formatJustifyRight(root, options) {
		return nothing
	},
	formatJustifyLeft(root, options) {
		return nothing
	},
	formatIndent(root, options) {
		// TODO lists
		visitParents(root, options.start.node, (node, parents) => {
			for (let p of parents) {
				if (p.type == "heading") {
					if (p.depth < 6) p.depth += 1
					restoreCaret(options)
				}
			}
		})
		return nothing
	},
	formatOutdent(root, options) {
		// TODO lists
		visitParents(root, options.start.node, (node, parents) => {
			for (let p of parents) {
				if (p.type == "heading") {
					if (p.depth > 1) p.depth -= 1
					restoreCaret(options)
				}
			}
		})
		return nothing
	},
	formatRemove(root, options) {
		return nothing
	},
	formatSetBlockTextDirection(root, options) {
		return nothing
	},
	formatSetInlineTextDirection(root, options) {
		return nothing
	},
	formatBackColor(root, options) {
		return nothing
	},
	formatFontColor(root, options) {
		return nothing
	},
	formatFontName(root, options) {
		return nothing
	},
}

export interface TransformOptions {
	detail: string | md.Root | md.Content
	flags: Record<string, boolean>
	inputType: InputType
	start: {
		path: string
		offset: number
	}
	end: {
		path: string
		offset: number
	}
}

export interface TransformHandlerOptions {
	detail: string | md.Root | md.Content
	flags: Record<string, boolean>
	start: {
		node: unist.Node
		offset: number
	}
	end: {
		node: unist.Node
		offset: number
	}
}

function getNodeFromPath(root: md.Root, path: string): unist.Node {
	let parts = path.slice(1).split(".").map(Number)
	let node: unist.Node = root
	while (parts.length) {
		if (!Array.isArray(node.children)) {
			throw new TypeError("no chilcren")
		}
		let idx = parts.shift()
		node = node.children[idx]
	}
	if (node.type != "text" && node.type != "inlineCode") {
		throw new Error(
			`path must lead to text or inline code, led to: ${node.type}`
		)
	}
	return node
}

export default function transform(
	root: md.Root,
	options: TransformOptions
): void {
	let handler = handlers[options.inputType]

	if (!handler) {
		throw new Error(`unknown inputType`)
	}

	visit(root, node => {
		if (node.data && node.data.caret) {
			delete node.data.caret
		} else if (!node.data) {
			node.data = {}
		}
	})

	let startNode = getNodeFromPath(root, options.start.path)
	let endNode = getNodeFromPath(root, options.end.path)

	let handlerOptions: TransformHandlerOptions = {
		detail: options.detail,
		flags: options.flags,
		start: {
			node: startNode,
			offset: options.start.offset,
		},
		end: {
			node: endNode,
			offset: options.end.offset,
		},
	}

	if (handler(root, handlerOptions) == nothing) {
		console.error(`unhandled inputType: ${options.inputType}`)
	}
}
