import backspaceParagraph from "../src/ast/backspace-paragraph"
import parse from "./parse"
import toMarkdown from "mdast-util-to-markdown"
import {select, selectAll} from "unist-utils-core"
import * as md from "mdast"

describe("backspaceParagraph", () => {
	test("removes a new paragraph at the start", () => {
		let tree = parse(`hello
		
there`)
		let expected = parse("hellothere")
		let p = selectAll<md.Paragraph>("paragraph", tree)[1]

		backspaceParagraph(tree, p)

		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})

	// 	test("removes a new paragraph at the start (in a code)", () => {
	// 		let tree = parse(`\`hello\`

	// \`there\``)
	// 		let expected = parse("`hellothere`")
	// 		let p = selectAll<md.Paragraph>("paragraph", tree)[1]
	// 		backspaceParagraph(tree, p)

	// 		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
	// 		expect(tree).toEqual(expected)
	// 	})

	// 	test("removes a new paragraph at the start (in a complex place)", () => {
	// 		let tree = parse(
	// 			"this is *story __all about how my life__ got flipped* turned up side down"
	// 		)
	// 		let expected = parse(
	// 			`this is *story __all ab__*

	// *__out how my life__ got flipped* turned up side down`
	// 		)
	// 		let p = select("paragraph", tree)
	// 		let text = selectAll<md.Text>("text", p)[2]
	// 		backspaceParagraph(tree, text, 6)

	// 		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
	// 		expect(tree).toEqual(expected)
	// 	})

	// 	test("removes a new paragraph at the start (in a complex place in a code)", () => {
	// 		let tree = parse(
	// 			"this is *story __all about `how` my life__ got flipped* turned up side down"
	// 		)
	// 		let expected = parse(
	// 			`this is *story __all about \`h\`__*

	// *__\`ow\` my life__ got flipped* turned up side down`
	// 		)
	// 		let p = select("paragraph", tree)
	// 		let inlineCode = select<md.InlineCode>("inlineCode", p)
	// 		backspaceParagraph(tree, inlineCode, 1)

	// 		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
	// 		expect(tree).toEqual(expected)
	// 	})

	// 	test("removes a new paragraph, maintaining whole nodes", () => {
	// 		let tree = parse("split __mein two__ please")
	// 		let expected = parse(`split __me__

	// __in two__ please`)
	// 		let p = select("paragraph", tree)
	// 		let text = selectAll<md.Text>("text", p)[1]

	// 		backspaceParagraph(tree, text, 2)

	// 		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
	// 		expect(tree).toEqual(expected)
	// 	})

	it("works in a heading", () => {
		let tree = parse(`# well, well
			
, well`)
		let expected = parse("# well, well, well")
		let p = select<md.Paragraph>("paragraph", tree)
		backspaceParagraph(tree, p)
		expect(tree).toEqual(expected)
	})

	// 	it("works in a heading with special elements", () => {
	// 		let tree = parse("# well, _well_, well, well")
	// 		let expected = parse(`# we

	// ll, _well_, well, well`)
	// 		let h1 = select("heading", tree)
	// 		let text = selectAll<md.Text>("text", h1)[0]
	// 		backspaceParagraph(tree, text, 2)
	// 		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
	// 		expect(tree).toEqual(expected)
	// 	})
})
