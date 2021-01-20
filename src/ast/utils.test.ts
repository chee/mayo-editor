import * as utils from "./utils"

import fromMarkdown from "mdast-util-from-markdown"
import toMarkdown from "mdast-util-to-markdown"
import {select, selectAll} from "unist-utils-core"
import * as md from "mdast"

import removePosition from "unist-util-remove-position"

describe("split", () => {
	test("splits an ordinary text node", () => {
		let tree = parse("hellothere")
		let expected = [
			parse(`hello`).children[0].children[0],
			parse(`there`).children[0].children[0],
		]
		let p = select("paragraph", tree)
		let text = select<md.Text>("text", p)
		let actual = utils.split(tree, text, 5)

		expect(toMarkdown(actual[0])).toEqual(toMarkdown(expected[0]))
		expect(toMarkdown(actual[1])).toEqual(toMarkdown(expected[1]))
		expect(actual).toEqual(expected)
	})
	test("splits a node in half", () => {
		let tree = parse("_hellothere_")
		let expected = [
			parse(`_hello_`).children[0].children[0],
			parse(`_there_`).children[0].children[0],
		]
		let p = select("paragraph", tree)
		let text = select<md.Text>("text", p)
		let actual = utils.split(tree, text, 5)
		expect(actual).toEqual(expected)
	})

	it("works in a heading", () => {
		let tree = parse("# well, well, well")
		let expected = [
			parse(`# well, well`).children[0].children[0],
			parse(`, well`).children[0].children[0],
		]
		let h1 = select("heading", tree)
		let text = select<md.Text>("text", h1)
		let actual = utils.split(tree, text, 10)
		expect(actual).toEqual(expected)
	})

	test("splits a complex node correct", () => {
		let tree = parse("_oh **hey** ok_")
		let expected = [
			parse(`_oh **he**_`).children[0].children[0],
			parse(`_**y** ok_`).children[0].children[0],
		]
		let p = select("paragraph", tree)
		let text = selectAll<md.Text>("text", p)[1]
		let actual = utils.split(tree, text, 2)

		expect(toMarkdown(actual[0])).toEqual(toMarkdown(expected[0]))
		expect(toMarkdown(actual[1])).toEqual(toMarkdown(expected[1]))
		expect(actual).toEqual(expected)
	})

	test("splits a code node correct", () => {
		let tree = parse("_oh **hello, `here` is it** ok_")
		let expected = [
			parse(`_oh **hello, \`he\`**_`).children[0].children[0],
			parse(`_**\`re\` is it** ok_`).children[0].children[0],
		]
		let p = select("paragraph", tree)
		let text = select<md.InlineCode>("inlineCode", p)

		let actual = utils.split(tree, text, 2)

		expect(toMarkdown(actual[0])).toEqual(toMarkdown(expected[0]))
		expect(toMarkdown(actual[1])).toEqual(toMarkdown(expected[1]))
		expect(actual).toEqual(expected)
	})

	test("returns only the split node when there are other children", () => {
		let tree = parse("one two **three** four")
		let expected = [
			parse(`**thr**`).children[0].children[0],
			parse(`**ee**`).children[0].children[0],
		]
		let p = select("paragraph", tree)
		let text = selectAll<md.Text>("text", p)[1]

		let actual = utils.split(tree, text, 3)

		expect(toMarkdown(actual[0])).toEqual(toMarkdown(expected[0]))
		expect(toMarkdown(actual[1])).toEqual(toMarkdown(expected[1]))
		expect(actual).toEqual(expected)
	})
})

function parse(string: string): md.Root {
	return removePosition(fromMarkdown(string), true) as md.Root
}

describe("insertParagraph", () => {
	test("inserts a new paragraph where the cursor is", () => {
		let tree = parse("hellothere")
		let expected = parse(`hello
 
there`)
		let p = select("paragraph", tree)
		let text = select<md.Text>("text", p)
		utils.insertParagraph(tree, text, 5)

		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})

	test("inserts a new paragraph where the cursor is (in a code)", () => {
		let tree = parse("`hellothere`")
		let expected = parse(`\`hello\`
 
\`there\``)
		let p = select("paragraph", tree)
		let text = select<md.InlineCode>("inlineCode", p)
		utils.insertParagraph(tree, text, 5)

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
		utils.insertParagraph(tree, text, 6)

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
		utils.insertParagraph(tree, inlineCode, 1)

		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})

	test("inserts a new paragraph, maintaining whole nodes", () => {
		let tree = parse("split __mein two__ please")
		let expected = parse(`split __me__
		
__in two__ please`)
		let p = select("paragraph", tree)
		let text = selectAll<md.Text>("text", p)[1]

		utils.insertParagraph(tree, text, 2)

		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})

	it("works in a heading", () => {
		let tree = parse("# well, well, well")
		let expected = parse(`# well, well
			
, well`)
		let h1 = select("heading", tree)
		let text = select<md.Text>("text", h1)
		utils.insertParagraph(tree, text, 10)
		expect(tree).toEqual(expected)
	})

	it("works in a heading with special elements", () => {
		let tree = parse("# well, _well_, well, well")
		let expected = parse(`# we
			
ll, _well_, well, well`)
		let h1 = select("heading", tree)
		let text = selectAll<md.Text>("text", h1)[0]
		utils.insertParagraph(tree, text, 2)
		expect(toMarkdown(tree)).toEqual(toMarkdown(expected))
		expect(tree).toEqual(expected)
	})
})
