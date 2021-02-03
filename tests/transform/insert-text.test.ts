import insertText from "../../src/ast/transform/insert-text"
import parse from "../parse"
import {select, selectAll} from "unist-utils-core"
import * as md from "mdast"

describe(insertText, () => {
	it("inserts text in the correct place", () => {
		let tree = parse("hello again")
		let expected = parse("hello! again")
		select("text", expected).data = {
			caret: {
				caretStart: 6,
				caretEnd: 6,
			},
		}
		insertText(tree, {
			detail: "!",
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
		select("inlineCode", expected).data = {
			caret: {
				caretStart: 3,
				caretEnd: 3,
			},
		}
		insertText(tree, {
			detail: "-",
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
		selectAll<md.Text>("text", expected)[2].data = {
			caret: {
				caretStart: 3,
				caretEnd: 3,
			},
		}
		insertText(tree, {
			detail: "i",

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
		selectAll<md.Text>("text", expected)[1].data = {
			caret: {
				caretStart: 3,
				caretEnd: 3,
			},
		}
		insertText(tree, {
			detail: "h",

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
		selectAll<md.Text>("text", expected)[1].data = {
			caret: {
				caretStart: 3,
				caretEnd: 3,
			},
		}
		insertText(tree, {
			detail: "-",
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
