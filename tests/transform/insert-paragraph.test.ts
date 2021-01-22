import insertParagraph from "../../src/ast/insert-paragraph"
import parse from "../parse"
import toMarkdown from "mdast-util-to-markdown"
import {select, selectAll} from "unist-utils-core"
import * as md from "mdast"

describe("insertParagraph", () => {
	test("inserts a new paragraph where the cursor is", () => {
		let tree = parse("hellothere")
		let expected = parse(`hello
 
there`)
		let p = select("paragraph", tree)
		let text = select<md.Text>("text", p)
		insertParagraph(tree, text, 5)

		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})

	test("inserts a new paragraph where the cursor is (in a code)", () => {
		let tree = parse("`hellothere`")
		let expected = parse(`\`hello\`
 
\`there\``)
		let p = select("paragraph", tree)
		let text = select<md.InlineCode>("inlineCode", p)
		insertParagraph(tree, text, 5)

		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})

	test("inserts a new paragraph where the cursor is (in a complex place)", () => {
		let tree = parse(
			"this is *story __all about how my life__ got flipped* turned up side down"
		)
		let expected = parse(
			`this is *story __all ab__*

*__out how my life__ got flipped* turned up side down`
		)
		let p = select("paragraph", tree)
		let text = selectAll<md.Text>("text", p)[2]
		insertParagraph(tree, text, 6)

		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})

	test("inserts a new paragraph where the cursor is (in a complex place in a code)", () => {
		let tree = parse(
			"this is *story __all about `how` my life__ got flipped* turned up side down"
		)
		let expected = parse(
			`this is *story __all about \`h\`__*

*__\`ow\` my life__ got flipped* turned up side down`
		)
		let p = select("paragraph", tree)
		let inlineCode = select<md.InlineCode>("inlineCode", p)
		insertParagraph(tree, inlineCode, 1)

		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})

	test("inserts a new paragraph, maintaining whole nodes", () => {
		let tree = parse("split __mein two__ please")
		let expected = parse(`split __me__
		
__in two__ please`)
		let p = select("paragraph", tree)
		let text = selectAll<md.Text>("text", p)[1]

		insertParagraph(tree, text, 2)

		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})

	it("works in a heading", () => {
		let tree = parse("# well, well, well")
		let expected = parse(`# well, well
			
, well`)
		let h1 = select("heading", tree)
		let text = select<md.Text>("text", h1)
		insertParagraph(tree, text, 10)
		expect(tree).toEqual(expected)
	})

	it("works in a heading with special elements", () => {
		let tree = parse("# well, _well_, well, well")
		let expected = parse(`# we
			
ll, _well_, well, well`)
		let h1 = select("heading", tree)
		let text = selectAll<md.Text>("text", h1)[0]
		insertParagraph(tree, text, 2)
		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})
})
