import type {TransformHandler} from "../../src/ast/transform"
import {visit} from "unist-utils-core"
import insertText from "../../src/ast/transform/insert-text"
import parse from "../parse"
import toMarkdown from "mdast-util-to-markdown"
import {select, selectAll} from "unist-utils-core"
import * as md from "mdast"
import * as unist from "unist"

describe(insertText, () => {
	it("inserts text in the correct place", () => {
		let tree = parse("hello again")
		let expected = parse("hello! again")
		insertText(tree, {
			data: "!",
			inputType: "insertText",
			start: {
				node: select("text", tree),
				offset: 5,
			},
			end: {
				node: select("text", tree),
				offset: 5,
			},
		})
		expect(expected).toEqual(tree)
	})

	it("inserts text in the correct in an inline code", () => {
		let tree = parse("hello `code` again")
		let expected = parse("hello `co-de` again")
		insertText(tree, {
			data: "-",
			inputType: "insertText",
			start: {
				node: select("inlineCode", tree),
				offset: 2,
			},
			end: {
				node: select("inlineCode", tree),
				offset: 2,
			},
		})
		expect(expected).toEqual(tree)
	})

	it("inserts text in a nested thing", () => {
		let tree = parse("hello _**hey `wow` nice**_ again")
		let expected = parse("hello _**hey `wow` niice**_ again")
		insertText(tree, {
			data: "i",
			inputType: "insertText",
			start: {
				node: selectAll<md.Text>("text", tree)[2],
				offset: 2,
			},
			end: {
				node: selectAll<md.Text>("text", tree)[2],
				offset: 2,
			},
		})
		expect(expected).toEqual(tree)
	})

	it("inserts text across a range", () => {
		let tree = parse("hello _**hey nice**_ again")
		let expected = parse("hello _**hehe**_ again")
		insertText(tree, {
			data: "h",
			inputType: "insertText",
			start: {
				node: selectAll<md.Text>("text", tree)[1],
				offset: 2,
			},
			end: {
				node: selectAll<md.Text>("text", tree)[1],
				offset: 7,
			},
		})
		expect(expected).toEqual(tree)
	})

	it("inserts text across a range as a common ancestor", () => {
		let tree = parse("hello _**hey `code` nice**_ again")
		let expected = parse("hello _**hehe**_ again")
		insertText(tree, {
			data: "-",
			inputType: "insertText",
			start: {
				node: selectAll<md.Text>("text", tree)[1],
				offset: 2,
			},
			end: {
				node: selectAll<md.Text>("text", tree)[2],
				offset: 2,
			},
		})
		expect(expected).toEqual(tree)
	})
})
