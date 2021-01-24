import unwrap from "../src/ast/unwrap"

import parse from "./parse"
import toMarkdown from "mdast-util-to-markdown"
import {select, selectAll} from "unist-utils-core"
import * as md from "mdast"

test("1=1", () => {
	expect(1).toBe(1)
})
