import insertParagraph from "../../src/ast/transform/insert-paragraph"
import parse from "../parse"
import {select, selectAll} from "unist-utils-core"
import * as md from "mdast"

describe(insertParagraph, () => {
	it("inserts paragraph in the correct place", () => {
		let tree = parse("helloagain")
		let expected = parse(`hello
		
again`)
		selectAll<md.Text>("text", expected)[1].data = {
			caret: {
				type: "collapsed",
				offset: 0,
			},
		}
		insertParagraph(tree, {
			data: null,
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
})
