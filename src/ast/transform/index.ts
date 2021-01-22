import * as md from "mdast"
import {CaretIdInstruction} from "../caret"
import BeforeInputEvent, {InputType} from "../before-input-event"
import insertText from "./insert-text"
import visit from "unist-util-visit"
import type * as unist from "unist"
import {produce} from "immer"

export interface TransformOptions {
	data: string
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

export let nothing = Symbol("@transform/don't-actually")

type TransformResult = CaretIdInstruction | typeof nothing

interface TransformHandlers {
	[key: string]: TransformHandler
}

export interface TransformHandler {
	(root: md.Root, options: TransformHandlerOptions): TransformResult
}

export let handlers: TransformHandlers = {
	insertReplacementText(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertText,
	insertLineBreak(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertParagraph(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteContentBackward(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteContentForward(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteByCut(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertOrderedList(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertUnorderedList(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertHorizontalRule(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertFromYank(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertFromDrop(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertFromPaste(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertFromPasteAsQuotation(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertTranspose(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertCompositionText(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	insertLink(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteWordBackward(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteWordForward(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteSoftLineBackward(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteSoftLineForward(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteEntireSoftLine(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteHardLineBackward(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteHardLineForward(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteByDrag(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	deleteContent(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	historyUndo(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	historyRedo(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatBold(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatItalic(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatUnderline(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatStrikeThrough(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatSuperscript(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatSubscript(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatJustifyFull(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatJustifyCenter(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatJustifyRight(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatJustifyLeft(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatIndent(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatOutdent(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatRemove(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatSetBlockTextDirection(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatSetInlineTextDirection(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatBackColor(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatFontColor(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
	formatFontName(root, options) {
		console.error(`unhandled inputType`)
		return nothing
	},
}

export interface TransformHandlerOptions {
	data: string
	start: {
		node: md.Content
		offset: number
	}
	end: {
		node: md.Content
		offset: number
	}
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

	let startParts = options.start.path.slice(1).split(".").map(Number)
	console.log(startParts)
	let startNode: unist.Node = root

	while (startParts.length) {
		if (!Array.isArray(startNode.children)) {
			throw new TypeError("no chilcren")
		}
		let idx = startParts.shift()
		startNode = startNode.children[idx]
	}
	let endParts = options.end.path.slice(1).split(".").map(Number)
	let endNode: unist.Node = root
	while (endParts.length) {
		if (!Array.isArray(endNode.children)) {
			throw new TypeError("no chilcren")
		}
		endNode = endNode.children[endParts.shift()]
	}

	let opts = {
		data: options.data,
		start: {
			node: startNode as md.Content,
			offset: options.start.offset,
		},
		end: {
			node: endNode as md.Content,
			offset: options.end.offset,
		},
	}

	handler(root, opts)
}
