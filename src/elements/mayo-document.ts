import fromMarkdown from "mdast-util-from-markdown"
import type * as md from "mdast"
import BeforeInputEvent from "../events/before-input-event"
import {html, TemplateResult} from "lit-html"
// TODO learn how to declare types for this
// @ts-ignore
import compact from "mdast-util-compact"
import toMarkdown from "mdast-util-to-markdown"
import * as is from "../ast/is"
import {customElement, LitElement, property} from "lit-element"
import transform from "../ast/transform"
import getTransformOptions, {
	GetTransformOptionsOptions,
} from "../dom/get-transform-options"
import "./mayo-node"
import * as gfm from "mdast-util-gfm"

import type {Patch} from "immer"
import {
	produceWithPatches,
	enableAllPlugins as enableAllOfImmer,
	applyPatches,
} from "immer"

enableAllOfImmer()

function parse(contents: string): md.Root {
	let root = fromMarkdown(contents, {mdastExtensions: [gfm.fromMarkdown]})
	// addParents(root)
	return root
}

enum modifiers {
	control = 1,
	shift = 2,
	super = 4,
	option = 8,
	hyper = 16,
}

@customElement("mayo-document")
class MayoDocumentElement extends LitElement {
	@property()
	contents: string
	@property({type: Boolean})
	dirty: boolean
	node: md.Root
	modifier: number

	createRenderRoot(): this {
		return this
	}

	attributeChangedCallback(name: string, before: string, now: string): void {
		super.attributeChangedCallback(name, before, now)
		if (name == "contents") {
			this.node = parse(this.contents)
		}
	}

	// history
	history: Patch[][] = []
	// future of the history
	futures: Patch[][] = []

	historyIndex = 0

	undo(): void {
		this.node = applyPatches(this.node, this.history[this.historyIndex])
		this.historyIndex += 1
		this.requestUpdate()
	}

	redo(): void {
		this.node = applyPatches(this.node, this.futures[this.historyIndex])
		this.historyIndex -= 1
		this.requestUpdate()
	}

	async transform(options: GetTransformOptionsOptions): Promise<void> {
		let transformOptions = await getTransformOptions(options)
		let [node, patches, inversePatches] = produceWithPatches(
			this.node,
			draft => {
				transform(draft, transformOptions)
			}
		)

		this.node = node
		// TODO better undo/redoo
		this.history.splice(this.historyIndex, 0, inversePatches)
		this.futures.splice(this.historyIndex, 0, patches)

		this.setAttribute("dirty", "true")
		await this.requestUpdate()
	}

	async handleInput(event: BeforeInputEvent): Promise<void> {
		let metaBindings = {
			s: this.save,
			"[": () => {
				this.transform({
					inputType: "formatOutdent",
					range: event.getTargetRanges()[0],
				})
			},
			"]": () => {
				this.transform({
					inputType: "formatIndent",
					range: event.getTargetRanges()[0],
				})
			},
		}

		if (
			this.modifier & modifiers.super &&
			event.inputType == "insertText" &&
			Object.keys(metaBindings).includes(event.data)
		) {
			event.preventDefault()
			// @ts-ignore
			metaBindings[event.data]()
			return
		}

		event.preventDefault()
		await this.transform({
			inputType: event.inputType,
			range: event.getTargetRanges()[0],
			data: event.data,
			dataTransfer: event.dataTransfer,
		})

		return
	}

	// this is messed up, but
	handleKeydown(event: KeyboardEvent): void {
		switch (event.key) {
			case "Meta":
				this.modifier |= modifiers.super
				break
			case "Alt":
				this.modifier |= modifiers.option
				break
			case "Hyper":
				this.modifier |= modifiers.hyper
				break
			case "Control":
				this.modifier |= modifiers.control
				break
			case "Shift":
				this.modifier |= modifiers.shift
		}
	}

	handleKeyup(event: KeyboardEvent): void {
		switch (event.key) {
			case "Meta":
				this.modifier ^= modifiers.super
				break
			case "Alt":
				this.modifier ^= modifiers.option
				break
			case "Hyper":
				this.modifier ^= modifiers.hyper
				break
			case "Control":
				this.modifier ^= modifiers.control
				break
			case "Shift":
				this.modifier ^= modifiers.shift
		}
	}

	getCurrentRange(): StaticRange {
		let {
			startContainer,
			startOffset,
			endContainer,
			endOffset,
		} = document.getSelection().getRangeAt(0).cloneRange()

		return {
			collapsed: startContainer == endContainer && startOffset == endOffset,
			startContainer: startContainer,
			startOffset: startOffset,
			endContainer: endContainer,
			endOffset: endOffset,
		}
	}

	save(): void {
		this.contents = toMarkdown(compact(this.node), {
			bullet: "-",
			fence: "`",
			emphasis: "_",
			strong: "*",
			rule: "*",
			setext: false,
			fences: true,
			listItemIndent: "tab",
			incrementListMarker: true,
			quote: '"',
			extensions: [gfm.toMarkdown()],
		})
		this.dispatchEvent(new CustomEvent("save"))
	}

	render(): TemplateResult {
		return html`<article
			type="root"
			?block=${true}
			?container=${true}
			.node=${this.node}
			path=""
		>
			${this.node
				? this.node.children.map((child, index) => {
						return html`<mayo-node
							path=".${index}"
							.parent=${this.node}
							.node=${child}
							index=${index}
							type=${child.type}
							?container=${is.container(child)}
							?empty=${is.empty(child)}
							?inline=${is.inline(child)}
							?leaf=${is.leaf(child)}
							?list=${is.list(child)}
							?block=${is.block(child)}
						></mayo-node>`
						// eslint-disable-next-line no-mixed-spaces-and-tabs
				  })
				: ""}
		</article>`
	}

	constructor() {
		super()
		this.addEventListener("keydown", this.handleKeydown)
		this.addEventListener("keyup", this.handleKeyup)
		this.addEventListener("beforeinput", this.handleInput)
	}
}

export default MayoDocumentElement
