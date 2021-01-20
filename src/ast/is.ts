let leafBlock = [
	"thematicBreak",
	"heading",
	"code",
	"html",
	"linkReference",
	"paragraph",
	"break",
]

let empties = [
	"break",
	"thematicBreak",
	"link",
	"linkReference",
	"image",
	"imageReference",
]

let leafInline = ["inlineCode"]

let containerBlock = ["blockquote", "listItem", "list"]

let containerInline = ["delete", "emphasis", "strong"]

let inlines = [...leafInline, ...containerInline]

let leaves = [...leafBlock]

let blocks = [...leafBlock, ...containerBlock]

let containers = [...containerBlock, "root"]

export function empty(type: string): boolean {
	return empties.includes(type)
}

export function leaf(type: string): boolean {
	return leaves.includes(type)
}

export function inline(type: string): boolean {
	return inlines.includes(type)
}

export function container(type: string): boolean {
	return containers.includes(type)
}

export function block(type: string): boolean {
	return blocks.includes(type)
}

export function list(type: string): boolean {
	return type == "list"
}
