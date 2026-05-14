import { createRequire } from "node:module";
var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name2, newValue) {
  this[name2] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, {
      get: all[name2],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name2)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/.pnpm/web-tree-sitter@0.25.10/node_modules/web-tree-sitter/tree-sitter.js
var exports_tree_sitter = {};
__export(exports_tree_sitter, {
  TreeCursor: () => TreeCursor,
  Tree: () => Tree,
  Query: () => Query,
  Parser: () => Parser,
  Node: () => Node,
  MIN_COMPATIBLE_VERSION: () => MIN_COMPATIBLE_VERSION,
  LookaheadIterator: () => LookaheadIterator,
  Language: () => Language,
  LANGUAGE_VERSION: () => LANGUAGE_VERSION,
  CaptureQuantifier: () => CaptureQuantifier
});
function assertInternal(x) {
  if (x !== INTERNAL)
    throw new Error("Illegal constructor");
}
function isPoint(point) {
  return !!point && typeof point.row === "number" && typeof point.column === "number";
}
function setModule(module2) {
  C = module2;
}
function getText(tree, startIndex, endIndex, startPosition) {
  const length = endIndex - startIndex;
  let result = tree.textCallback(startIndex, startPosition);
  if (result) {
    startIndex += result.length;
    while (startIndex < endIndex) {
      const string = tree.textCallback(startIndex, startPosition);
      if (string && string.length > 0) {
        startIndex += string.length;
        result += string;
      } else {
        break;
      }
    }
    if (startIndex > endIndex) {
      result = result.slice(0, length);
    }
  }
  return result ?? "";
}
function unmarshalCaptures(query, tree, address, patternIndex, result) {
  for (let i2 = 0, n = result.length;i2 < n; i2++) {
    const captureIndex = C.getValue(address, "i32");
    address += SIZE_OF_INT;
    const node = unmarshalNode(tree, address);
    address += SIZE_OF_NODE;
    result[i2] = { patternIndex, name: query.captureNames[captureIndex], node };
  }
  return address;
}
function marshalNode(node, index = 0) {
  let address = TRANSFER_BUFFER + index * SIZE_OF_NODE;
  C.setValue(address, node.id, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, node.startIndex, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, node.startPosition.row, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, node.startPosition.column, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, node[0], "i32");
}
function unmarshalNode(tree, address = TRANSFER_BUFFER) {
  const id = C.getValue(address, "i32");
  address += SIZE_OF_INT;
  if (id === 0)
    return null;
  const index = C.getValue(address, "i32");
  address += SIZE_OF_INT;
  const row = C.getValue(address, "i32");
  address += SIZE_OF_INT;
  const column = C.getValue(address, "i32");
  address += SIZE_OF_INT;
  const other = C.getValue(address, "i32");
  const result = new Node(INTERNAL, {
    id,
    tree,
    startIndex: index,
    startPosition: { row, column },
    other
  });
  return result;
}
function marshalTreeCursor(cursor, address = TRANSFER_BUFFER) {
  C.setValue(address + 0 * SIZE_OF_INT, cursor[0], "i32");
  C.setValue(address + 1 * SIZE_OF_INT, cursor[1], "i32");
  C.setValue(address + 2 * SIZE_OF_INT, cursor[2], "i32");
  C.setValue(address + 3 * SIZE_OF_INT, cursor[3], "i32");
}
function unmarshalTreeCursor(cursor) {
  cursor[0] = C.getValue(TRANSFER_BUFFER + 0 * SIZE_OF_INT, "i32");
  cursor[1] = C.getValue(TRANSFER_BUFFER + 1 * SIZE_OF_INT, "i32");
  cursor[2] = C.getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
  cursor[3] = C.getValue(TRANSFER_BUFFER + 3 * SIZE_OF_INT, "i32");
}
function marshalPoint(address, point) {
  C.setValue(address, point.row, "i32");
  C.setValue(address + SIZE_OF_INT, point.column, "i32");
}
function unmarshalPoint(address) {
  const result = {
    row: C.getValue(address, "i32") >>> 0,
    column: C.getValue(address + SIZE_OF_INT, "i32") >>> 0
  };
  return result;
}
function marshalRange(address, range) {
  marshalPoint(address, range.startPosition);
  address += SIZE_OF_POINT;
  marshalPoint(address, range.endPosition);
  address += SIZE_OF_POINT;
  C.setValue(address, range.startIndex, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, range.endIndex, "i32");
  address += SIZE_OF_INT;
}
function unmarshalRange(address) {
  const result = {};
  result.startPosition = unmarshalPoint(address);
  address += SIZE_OF_POINT;
  result.endPosition = unmarshalPoint(address);
  address += SIZE_OF_POINT;
  result.startIndex = C.getValue(address, "i32") >>> 0;
  address += SIZE_OF_INT;
  result.endIndex = C.getValue(address, "i32") >>> 0;
  return result;
}
function marshalEdit(edit, address = TRANSFER_BUFFER) {
  marshalPoint(address, edit.startPosition);
  address += SIZE_OF_POINT;
  marshalPoint(address, edit.oldEndPosition);
  address += SIZE_OF_POINT;
  marshalPoint(address, edit.newEndPosition);
  address += SIZE_OF_POINT;
  C.setValue(address, edit.startIndex, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, edit.oldEndIndex, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, edit.newEndIndex, "i32");
  address += SIZE_OF_INT;
}
function unmarshalLanguageMetadata(address) {
  const major_version = C.getValue(address, "i32");
  const minor_version = C.getValue(address += SIZE_OF_INT, "i32");
  const patch_version = C.getValue(address += SIZE_OF_INT, "i32");
  return { major_version, minor_version, patch_version };
}
function parseAnyPredicate(steps, index, operator, textPredicates) {
  if (steps.length !== 3) {
    throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected 2, got ${steps.length - 1}`);
  }
  if (!isCaptureStep(steps[1])) {
    throw new Error(`First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}"`);
  }
  const isPositive = operator === "eq?" || operator === "any-eq?";
  const matchAll = !operator.startsWith("any-");
  if (isCaptureStep(steps[2])) {
    const captureName1 = steps[1].name;
    const captureName2 = steps[2].name;
    textPredicates[index].push((captures) => {
      const nodes1 = [];
      const nodes2 = [];
      for (const c of captures) {
        if (c.name === captureName1)
          nodes1.push(c.node);
        if (c.name === captureName2)
          nodes2.push(c.node);
      }
      const compare = /* @__PURE__ */ __name((n1, n2, positive) => {
        return positive ? n1.text === n2.text : n1.text !== n2.text;
      }, "compare");
      return matchAll ? nodes1.every((n1) => nodes2.some((n2) => compare(n1, n2, isPositive))) : nodes1.some((n1) => nodes2.some((n2) => compare(n1, n2, isPositive)));
    });
  } else {
    const captureName = steps[1].name;
    const stringValue = steps[2].value;
    const matches = /* @__PURE__ */ __name((n) => n.text === stringValue, "matches");
    const doesNotMatch = /* @__PURE__ */ __name((n) => n.text !== stringValue, "doesNotMatch");
    textPredicates[index].push((captures) => {
      const nodes = [];
      for (const c of captures) {
        if (c.name === captureName)
          nodes.push(c.node);
      }
      const test = isPositive ? matches : doesNotMatch;
      return matchAll ? nodes.every(test) : nodes.some(test);
    });
  }
}
function parseMatchPredicate(steps, index, operator, textPredicates) {
  if (steps.length !== 3) {
    throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected 2, got ${steps.length - 1}.`);
  }
  if (steps[1].type !== "capture") {
    throw new Error(`First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}".`);
  }
  if (steps[2].type !== "string") {
    throw new Error(`Second argument of \`#${operator}\` predicate must be a string. Got @${steps[2].name}.`);
  }
  const isPositive = operator === "match?" || operator === "any-match?";
  const matchAll = !operator.startsWith("any-");
  const captureName = steps[1].name;
  const regex = new RegExp(steps[2].value);
  textPredicates[index].push((captures) => {
    const nodes = [];
    for (const c of captures) {
      if (c.name === captureName)
        nodes.push(c.node.text);
    }
    const test = /* @__PURE__ */ __name((text, positive) => {
      return positive ? regex.test(text) : !regex.test(text);
    }, "test");
    if (nodes.length === 0)
      return !isPositive;
    return matchAll ? nodes.every((text) => test(text, isPositive)) : nodes.some((text) => test(text, isPositive));
  });
}
function parseAnyOfPredicate(steps, index, operator, textPredicates) {
  if (steps.length < 2) {
    throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected at least 1. Got ${steps.length - 1}.`);
  }
  if (steps[1].type !== "capture") {
    throw new Error(`First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}".`);
  }
  const isPositive = operator === "any-of?";
  const captureName = steps[1].name;
  const stringSteps = steps.slice(2);
  if (!stringSteps.every(isStringStep)) {
    throw new Error(`Arguments to \`#${operator}\` predicate must be strings.".`);
  }
  const values = stringSteps.map((s) => s.value);
  textPredicates[index].push((captures) => {
    const nodes = [];
    for (const c of captures) {
      if (c.name === captureName)
        nodes.push(c.node.text);
    }
    if (nodes.length === 0)
      return !isPositive;
    return nodes.every((text) => values.includes(text)) === isPositive;
  });
}
function parseIsPredicate(steps, index, operator, assertedProperties, refutedProperties) {
  if (steps.length < 2 || steps.length > 3) {
    throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected 1 or 2. Got ${steps.length - 1}.`);
  }
  if (!steps.every(isStringStep)) {
    throw new Error(`Arguments to \`#${operator}\` predicate must be strings.".`);
  }
  const properties = operator === "is?" ? assertedProperties : refutedProperties;
  if (!properties[index])
    properties[index] = {};
  properties[index][steps[1].value] = steps[2]?.value ?? null;
}
function parseSetDirective(steps, index, setProperties) {
  if (steps.length < 2 || steps.length > 3) {
    throw new Error(`Wrong number of arguments to \`#set!\` predicate. Expected 1 or 2. Got ${steps.length - 1}.`);
  }
  if (!steps.every(isStringStep)) {
    throw new Error(`Arguments to \`#set!\` predicate must be strings.".`);
  }
  if (!setProperties[index])
    setProperties[index] = {};
  setProperties[index][steps[1].value] = steps[2]?.value ?? null;
}
function parsePattern(index, stepType, stepValueId, captureNames, stringValues, steps, textPredicates, predicates, setProperties, assertedProperties, refutedProperties) {
  if (stepType === PREDICATE_STEP_TYPE_CAPTURE) {
    const name2 = captureNames[stepValueId];
    steps.push({ type: "capture", name: name2 });
  } else if (stepType === PREDICATE_STEP_TYPE_STRING) {
    steps.push({ type: "string", value: stringValues[stepValueId] });
  } else if (steps.length > 0) {
    if (steps[0].type !== "string") {
      throw new Error("Predicates must begin with a literal value");
    }
    const operator = steps[0].value;
    switch (operator) {
      case "any-not-eq?":
      case "not-eq?":
      case "any-eq?":
      case "eq?":
        parseAnyPredicate(steps, index, operator, textPredicates);
        break;
      case "any-not-match?":
      case "not-match?":
      case "any-match?":
      case "match?":
        parseMatchPredicate(steps, index, operator, textPredicates);
        break;
      case "not-any-of?":
      case "any-of?":
        parseAnyOfPredicate(steps, index, operator, textPredicates);
        break;
      case "is?":
      case "is-not?":
        parseIsPredicate(steps, index, operator, assertedProperties, refutedProperties);
        break;
      case "set!":
        parseSetDirective(steps, index, setProperties);
        break;
      default:
        predicates[index].push({ operator, operands: steps.slice(1) });
    }
    steps.length = 0;
  }
}
async function initializeBinding(moduleOptions) {
  if (!Module3) {
    Module3 = await tree_sitter_default(moduleOptions);
  }
  return Module3;
}
function checkModule() {
  return !!Module3;
}
var __defProp2, __name = (target, value) => __defProp2(target, "name", { value, configurable: true }), SIZE_OF_SHORT = 2, SIZE_OF_INT = 4, SIZE_OF_CURSOR, SIZE_OF_NODE, SIZE_OF_POINT, SIZE_OF_RANGE, ZERO_POINT, INTERNAL, C, LookaheadIterator, Tree, TreeCursor, Node, PREDICATE_STEP_TYPE_CAPTURE = 1, PREDICATE_STEP_TYPE_STRING = 2, QUERY_WORD_REGEX, CaptureQuantifier, isCaptureStep, isStringStep, QueryErrorKind, QueryError, Query, LANGUAGE_FUNCTION_REGEX, Language, Module2, tree_sitter_default, Module3 = null, TRANSFER_BUFFER, LANGUAGE_VERSION, MIN_COMPATIBLE_VERSION, Parser;
var init_tree_sitter = __esm(() => {
  __defProp2 = Object.defineProperty;
  SIZE_OF_CURSOR = 4 * SIZE_OF_INT;
  SIZE_OF_NODE = 5 * SIZE_OF_INT;
  SIZE_OF_POINT = 2 * SIZE_OF_INT;
  SIZE_OF_RANGE = 2 * SIZE_OF_INT + 2 * SIZE_OF_POINT;
  ZERO_POINT = { row: 0, column: 0 };
  INTERNAL = Symbol("INTERNAL");
  __name(assertInternal, "assertInternal");
  __name(isPoint, "isPoint");
  __name(setModule, "setModule");
  LookaheadIterator = class {
    static {
      __name(this, "LookaheadIterator");
    }
    [0] = 0;
    language;
    constructor(internal, address, language) {
      assertInternal(internal);
      this[0] = address;
      this.language = language;
    }
    get currentTypeId() {
      return C._ts_lookahead_iterator_current_symbol(this[0]);
    }
    get currentType() {
      return this.language.types[this.currentTypeId] || "ERROR";
    }
    delete() {
      C._ts_lookahead_iterator_delete(this[0]);
      this[0] = 0;
    }
    reset(language, stateId) {
      if (C._ts_lookahead_iterator_reset(this[0], language[0], stateId)) {
        this.language = language;
        return true;
      }
      return false;
    }
    resetState(stateId) {
      return Boolean(C._ts_lookahead_iterator_reset_state(this[0], stateId));
    }
    [Symbol.iterator]() {
      return {
        next: /* @__PURE__ */ __name(() => {
          if (C._ts_lookahead_iterator_next(this[0])) {
            return { done: false, value: this.currentType };
          }
          return { done: true, value: "" };
        }, "next")
      };
    }
  };
  __name(getText, "getText");
  Tree = class _Tree {
    static {
      __name(this, "Tree");
    }
    [0] = 0;
    textCallback;
    language;
    constructor(internal, address, language, textCallback) {
      assertInternal(internal);
      this[0] = address;
      this.language = language;
      this.textCallback = textCallback;
    }
    copy() {
      const address = C._ts_tree_copy(this[0]);
      return new _Tree(INTERNAL, address, this.language, this.textCallback);
    }
    delete() {
      C._ts_tree_delete(this[0]);
      this[0] = 0;
    }
    get rootNode() {
      C._ts_tree_root_node_wasm(this[0]);
      return unmarshalNode(this);
    }
    rootNodeWithOffset(offsetBytes, offsetExtent) {
      const address = TRANSFER_BUFFER + SIZE_OF_NODE;
      C.setValue(address, offsetBytes, "i32");
      marshalPoint(address + SIZE_OF_INT, offsetExtent);
      C._ts_tree_root_node_with_offset_wasm(this[0]);
      return unmarshalNode(this);
    }
    edit(edit) {
      marshalEdit(edit);
      C._ts_tree_edit_wasm(this[0]);
    }
    walk() {
      return this.rootNode.walk();
    }
    getChangedRanges(other) {
      if (!(other instanceof _Tree)) {
        throw new TypeError("Argument must be a Tree");
      }
      C._ts_tree_get_changed_ranges_wasm(this[0], other[0]);
      const count = C.getValue(TRANSFER_BUFFER, "i32");
      const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const result = new Array(count);
      if (count > 0) {
        let address = buffer;
        for (let i2 = 0;i2 < count; i2++) {
          result[i2] = unmarshalRange(address);
          address += SIZE_OF_RANGE;
        }
        C._free(buffer);
      }
      return result;
    }
    getIncludedRanges() {
      C._ts_tree_included_ranges_wasm(this[0]);
      const count = C.getValue(TRANSFER_BUFFER, "i32");
      const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const result = new Array(count);
      if (count > 0) {
        let address = buffer;
        for (let i2 = 0;i2 < count; i2++) {
          result[i2] = unmarshalRange(address);
          address += SIZE_OF_RANGE;
        }
        C._free(buffer);
      }
      return result;
    }
  };
  TreeCursor = class _TreeCursor {
    static {
      __name(this, "TreeCursor");
    }
    [0] = 0;
    [1] = 0;
    [2] = 0;
    [3] = 0;
    tree;
    constructor(internal, tree) {
      assertInternal(internal);
      this.tree = tree;
      unmarshalTreeCursor(this);
    }
    copy() {
      const copy = new _TreeCursor(INTERNAL, this.tree);
      C._ts_tree_cursor_copy_wasm(this.tree[0]);
      unmarshalTreeCursor(copy);
      return copy;
    }
    delete() {
      marshalTreeCursor(this);
      C._ts_tree_cursor_delete_wasm(this.tree[0]);
      this[0] = this[1] = this[2] = 0;
    }
    get currentNode() {
      marshalTreeCursor(this);
      C._ts_tree_cursor_current_node_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    get currentFieldId() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_current_field_id_wasm(this.tree[0]);
    }
    get currentFieldName() {
      return this.tree.language.fields[this.currentFieldId];
    }
    get currentDepth() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_current_depth_wasm(this.tree[0]);
    }
    get currentDescendantIndex() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_current_descendant_index_wasm(this.tree[0]);
    }
    get nodeType() {
      return this.tree.language.types[this.nodeTypeId] || "ERROR";
    }
    get nodeTypeId() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_current_node_type_id_wasm(this.tree[0]);
    }
    get nodeStateId() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_current_node_state_id_wasm(this.tree[0]);
    }
    get nodeId() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_current_node_id_wasm(this.tree[0]);
    }
    get nodeIsNamed() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_current_node_is_named_wasm(this.tree[0]) === 1;
    }
    get nodeIsMissing() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_current_node_is_missing_wasm(this.tree[0]) === 1;
    }
    get nodeText() {
      marshalTreeCursor(this);
      const startIndex = C._ts_tree_cursor_start_index_wasm(this.tree[0]);
      const endIndex = C._ts_tree_cursor_end_index_wasm(this.tree[0]);
      C._ts_tree_cursor_start_position_wasm(this.tree[0]);
      const startPosition = unmarshalPoint(TRANSFER_BUFFER);
      return getText(this.tree, startIndex, endIndex, startPosition);
    }
    get startPosition() {
      marshalTreeCursor(this);
      C._ts_tree_cursor_start_position_wasm(this.tree[0]);
      return unmarshalPoint(TRANSFER_BUFFER);
    }
    get endPosition() {
      marshalTreeCursor(this);
      C._ts_tree_cursor_end_position_wasm(this.tree[0]);
      return unmarshalPoint(TRANSFER_BUFFER);
    }
    get startIndex() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_start_index_wasm(this.tree[0]);
    }
    get endIndex() {
      marshalTreeCursor(this);
      return C._ts_tree_cursor_end_index_wasm(this.tree[0]);
    }
    gotoFirstChild() {
      marshalTreeCursor(this);
      const result = C._ts_tree_cursor_goto_first_child_wasm(this.tree[0]);
      unmarshalTreeCursor(this);
      return result === 1;
    }
    gotoLastChild() {
      marshalTreeCursor(this);
      const result = C._ts_tree_cursor_goto_last_child_wasm(this.tree[0]);
      unmarshalTreeCursor(this);
      return result === 1;
    }
    gotoParent() {
      marshalTreeCursor(this);
      const result = C._ts_tree_cursor_goto_parent_wasm(this.tree[0]);
      unmarshalTreeCursor(this);
      return result === 1;
    }
    gotoNextSibling() {
      marshalTreeCursor(this);
      const result = C._ts_tree_cursor_goto_next_sibling_wasm(this.tree[0]);
      unmarshalTreeCursor(this);
      return result === 1;
    }
    gotoPreviousSibling() {
      marshalTreeCursor(this);
      const result = C._ts_tree_cursor_goto_previous_sibling_wasm(this.tree[0]);
      unmarshalTreeCursor(this);
      return result === 1;
    }
    gotoDescendant(goalDescendantIndex) {
      marshalTreeCursor(this);
      C._ts_tree_cursor_goto_descendant_wasm(this.tree[0], goalDescendantIndex);
      unmarshalTreeCursor(this);
    }
    gotoFirstChildForIndex(goalIndex) {
      marshalTreeCursor(this);
      C.setValue(TRANSFER_BUFFER + SIZE_OF_CURSOR, goalIndex, "i32");
      const result = C._ts_tree_cursor_goto_first_child_for_index_wasm(this.tree[0]);
      unmarshalTreeCursor(this);
      return result === 1;
    }
    gotoFirstChildForPosition(goalPosition) {
      marshalTreeCursor(this);
      marshalPoint(TRANSFER_BUFFER + SIZE_OF_CURSOR, goalPosition);
      const result = C._ts_tree_cursor_goto_first_child_for_position_wasm(this.tree[0]);
      unmarshalTreeCursor(this);
      return result === 1;
    }
    reset(node) {
      marshalNode(node);
      marshalTreeCursor(this, TRANSFER_BUFFER + SIZE_OF_NODE);
      C._ts_tree_cursor_reset_wasm(this.tree[0]);
      unmarshalTreeCursor(this);
    }
    resetTo(cursor) {
      marshalTreeCursor(this, TRANSFER_BUFFER);
      marshalTreeCursor(cursor, TRANSFER_BUFFER + SIZE_OF_CURSOR);
      C._ts_tree_cursor_reset_to_wasm(this.tree[0], cursor.tree[0]);
      unmarshalTreeCursor(this);
    }
  };
  Node = class {
    static {
      __name(this, "Node");
    }
    [0] = 0;
    _children;
    _namedChildren;
    constructor(internal, {
      id,
      tree,
      startIndex,
      startPosition,
      other
    }) {
      assertInternal(internal);
      this[0] = other;
      this.id = id;
      this.tree = tree;
      this.startIndex = startIndex;
      this.startPosition = startPosition;
    }
    id;
    startIndex;
    startPosition;
    tree;
    get typeId() {
      marshalNode(this);
      return C._ts_node_symbol_wasm(this.tree[0]);
    }
    get grammarId() {
      marshalNode(this);
      return C._ts_node_grammar_symbol_wasm(this.tree[0]);
    }
    get type() {
      return this.tree.language.types[this.typeId] || "ERROR";
    }
    get grammarType() {
      return this.tree.language.types[this.grammarId] || "ERROR";
    }
    get isNamed() {
      marshalNode(this);
      return C._ts_node_is_named_wasm(this.tree[0]) === 1;
    }
    get isExtra() {
      marshalNode(this);
      return C._ts_node_is_extra_wasm(this.tree[0]) === 1;
    }
    get isError() {
      marshalNode(this);
      return C._ts_node_is_error_wasm(this.tree[0]) === 1;
    }
    get isMissing() {
      marshalNode(this);
      return C._ts_node_is_missing_wasm(this.tree[0]) === 1;
    }
    get hasChanges() {
      marshalNode(this);
      return C._ts_node_has_changes_wasm(this.tree[0]) === 1;
    }
    get hasError() {
      marshalNode(this);
      return C._ts_node_has_error_wasm(this.tree[0]) === 1;
    }
    get endIndex() {
      marshalNode(this);
      return C._ts_node_end_index_wasm(this.tree[0]);
    }
    get endPosition() {
      marshalNode(this);
      C._ts_node_end_point_wasm(this.tree[0]);
      return unmarshalPoint(TRANSFER_BUFFER);
    }
    get text() {
      return getText(this.tree, this.startIndex, this.endIndex, this.startPosition);
    }
    get parseState() {
      marshalNode(this);
      return C._ts_node_parse_state_wasm(this.tree[0]);
    }
    get nextParseState() {
      marshalNode(this);
      return C._ts_node_next_parse_state_wasm(this.tree[0]);
    }
    equals(other) {
      return this.tree === other.tree && this.id === other.id;
    }
    child(index) {
      marshalNode(this);
      C._ts_node_child_wasm(this.tree[0], index);
      return unmarshalNode(this.tree);
    }
    namedChild(index) {
      marshalNode(this);
      C._ts_node_named_child_wasm(this.tree[0], index);
      return unmarshalNode(this.tree);
    }
    childForFieldId(fieldId) {
      marshalNode(this);
      C._ts_node_child_by_field_id_wasm(this.tree[0], fieldId);
      return unmarshalNode(this.tree);
    }
    childForFieldName(fieldName) {
      const fieldId = this.tree.language.fields.indexOf(fieldName);
      if (fieldId !== -1)
        return this.childForFieldId(fieldId);
      return null;
    }
    fieldNameForChild(index) {
      marshalNode(this);
      const address = C._ts_node_field_name_for_child_wasm(this.tree[0], index);
      if (!address)
        return null;
      return C.AsciiToString(address);
    }
    fieldNameForNamedChild(index) {
      marshalNode(this);
      const address = C._ts_node_field_name_for_named_child_wasm(this.tree[0], index);
      if (!address)
        return null;
      return C.AsciiToString(address);
    }
    childrenForFieldName(fieldName) {
      const fieldId = this.tree.language.fields.indexOf(fieldName);
      if (fieldId !== -1 && fieldId !== 0)
        return this.childrenForFieldId(fieldId);
      return [];
    }
    childrenForFieldId(fieldId) {
      marshalNode(this);
      C._ts_node_children_by_field_id_wasm(this.tree[0], fieldId);
      const count = C.getValue(TRANSFER_BUFFER, "i32");
      const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const result = new Array(count);
      if (count > 0) {
        let address = buffer;
        for (let i2 = 0;i2 < count; i2++) {
          result[i2] = unmarshalNode(this.tree, address);
          address += SIZE_OF_NODE;
        }
        C._free(buffer);
      }
      return result;
    }
    firstChildForIndex(index) {
      marshalNode(this);
      const address = TRANSFER_BUFFER + SIZE_OF_NODE;
      C.setValue(address, index, "i32");
      C._ts_node_first_child_for_byte_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    firstNamedChildForIndex(index) {
      marshalNode(this);
      const address = TRANSFER_BUFFER + SIZE_OF_NODE;
      C.setValue(address, index, "i32");
      C._ts_node_first_named_child_for_byte_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    get childCount() {
      marshalNode(this);
      return C._ts_node_child_count_wasm(this.tree[0]);
    }
    get namedChildCount() {
      marshalNode(this);
      return C._ts_node_named_child_count_wasm(this.tree[0]);
    }
    get firstChild() {
      return this.child(0);
    }
    get firstNamedChild() {
      return this.namedChild(0);
    }
    get lastChild() {
      return this.child(this.childCount - 1);
    }
    get lastNamedChild() {
      return this.namedChild(this.namedChildCount - 1);
    }
    get children() {
      if (!this._children) {
        marshalNode(this);
        C._ts_node_children_wasm(this.tree[0]);
        const count = C.getValue(TRANSFER_BUFFER, "i32");
        const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
        this._children = new Array(count);
        if (count > 0) {
          let address = buffer;
          for (let i2 = 0;i2 < count; i2++) {
            this._children[i2] = unmarshalNode(this.tree, address);
            address += SIZE_OF_NODE;
          }
          C._free(buffer);
        }
      }
      return this._children;
    }
    get namedChildren() {
      if (!this._namedChildren) {
        marshalNode(this);
        C._ts_node_named_children_wasm(this.tree[0]);
        const count = C.getValue(TRANSFER_BUFFER, "i32");
        const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
        this._namedChildren = new Array(count);
        if (count > 0) {
          let address = buffer;
          for (let i2 = 0;i2 < count; i2++) {
            this._namedChildren[i2] = unmarshalNode(this.tree, address);
            address += SIZE_OF_NODE;
          }
          C._free(buffer);
        }
      }
      return this._namedChildren;
    }
    descendantsOfType(types, startPosition = ZERO_POINT, endPosition = ZERO_POINT) {
      if (!Array.isArray(types))
        types = [types];
      const symbols = [];
      const typesBySymbol = this.tree.language.types;
      for (const node_type of types) {
        if (node_type == "ERROR") {
          symbols.push(65535);
        }
      }
      for (let i2 = 0, n = typesBySymbol.length;i2 < n; i2++) {
        if (types.includes(typesBySymbol[i2])) {
          symbols.push(i2);
        }
      }
      const symbolsAddress = C._malloc(SIZE_OF_INT * symbols.length);
      for (let i2 = 0, n = symbols.length;i2 < n; i2++) {
        C.setValue(symbolsAddress + i2 * SIZE_OF_INT, symbols[i2], "i32");
      }
      marshalNode(this);
      C._ts_node_descendants_of_type_wasm(this.tree[0], symbolsAddress, symbols.length, startPosition.row, startPosition.column, endPosition.row, endPosition.column);
      const descendantCount = C.getValue(TRANSFER_BUFFER, "i32");
      const descendantAddress = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const result = new Array(descendantCount);
      if (descendantCount > 0) {
        let address = descendantAddress;
        for (let i2 = 0;i2 < descendantCount; i2++) {
          result[i2] = unmarshalNode(this.tree, address);
          address += SIZE_OF_NODE;
        }
      }
      C._free(descendantAddress);
      C._free(symbolsAddress);
      return result;
    }
    get nextSibling() {
      marshalNode(this);
      C._ts_node_next_sibling_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    get previousSibling() {
      marshalNode(this);
      C._ts_node_prev_sibling_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    get nextNamedSibling() {
      marshalNode(this);
      C._ts_node_next_named_sibling_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    get previousNamedSibling() {
      marshalNode(this);
      C._ts_node_prev_named_sibling_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    get descendantCount() {
      marshalNode(this);
      return C._ts_node_descendant_count_wasm(this.tree[0]);
    }
    get parent() {
      marshalNode(this);
      C._ts_node_parent_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    childWithDescendant(descendant) {
      marshalNode(this);
      marshalNode(descendant, 1);
      C._ts_node_child_with_descendant_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    descendantForIndex(start2, end = start2) {
      if (typeof start2 !== "number" || typeof end !== "number") {
        throw new Error("Arguments must be numbers");
      }
      marshalNode(this);
      const address = TRANSFER_BUFFER + SIZE_OF_NODE;
      C.setValue(address, start2, "i32");
      C.setValue(address + SIZE_OF_INT, end, "i32");
      C._ts_node_descendant_for_index_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    namedDescendantForIndex(start2, end = start2) {
      if (typeof start2 !== "number" || typeof end !== "number") {
        throw new Error("Arguments must be numbers");
      }
      marshalNode(this);
      const address = TRANSFER_BUFFER + SIZE_OF_NODE;
      C.setValue(address, start2, "i32");
      C.setValue(address + SIZE_OF_INT, end, "i32");
      C._ts_node_named_descendant_for_index_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    descendantForPosition(start2, end = start2) {
      if (!isPoint(start2) || !isPoint(end)) {
        throw new Error("Arguments must be {row, column} objects");
      }
      marshalNode(this);
      const address = TRANSFER_BUFFER + SIZE_OF_NODE;
      marshalPoint(address, start2);
      marshalPoint(address + SIZE_OF_POINT, end);
      C._ts_node_descendant_for_position_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    namedDescendantForPosition(start2, end = start2) {
      if (!isPoint(start2) || !isPoint(end)) {
        throw new Error("Arguments must be {row, column} objects");
      }
      marshalNode(this);
      const address = TRANSFER_BUFFER + SIZE_OF_NODE;
      marshalPoint(address, start2);
      marshalPoint(address + SIZE_OF_POINT, end);
      C._ts_node_named_descendant_for_position_wasm(this.tree[0]);
      return unmarshalNode(this.tree);
    }
    walk() {
      marshalNode(this);
      C._ts_tree_cursor_new_wasm(this.tree[0]);
      return new TreeCursor(INTERNAL, this.tree);
    }
    edit(edit) {
      if (this.startIndex >= edit.oldEndIndex) {
        this.startIndex = edit.newEndIndex + (this.startIndex - edit.oldEndIndex);
        let subbedPointRow;
        let subbedPointColumn;
        if (this.startPosition.row > edit.oldEndPosition.row) {
          subbedPointRow = this.startPosition.row - edit.oldEndPosition.row;
          subbedPointColumn = this.startPosition.column;
        } else {
          subbedPointRow = 0;
          subbedPointColumn = this.startPosition.column;
          if (this.startPosition.column >= edit.oldEndPosition.column) {
            subbedPointColumn = this.startPosition.column - edit.oldEndPosition.column;
          }
        }
        if (subbedPointRow > 0) {
          this.startPosition.row += subbedPointRow;
          this.startPosition.column = subbedPointColumn;
        } else {
          this.startPosition.column += subbedPointColumn;
        }
      } else if (this.startIndex > edit.startIndex) {
        this.startIndex = edit.newEndIndex;
        this.startPosition.row = edit.newEndPosition.row;
        this.startPosition.column = edit.newEndPosition.column;
      }
    }
    toString() {
      marshalNode(this);
      const address = C._ts_node_to_string_wasm(this.tree[0]);
      const result = C.AsciiToString(address);
      C._free(address);
      return result;
    }
  };
  __name(unmarshalCaptures, "unmarshalCaptures");
  __name(marshalNode, "marshalNode");
  __name(unmarshalNode, "unmarshalNode");
  __name(marshalTreeCursor, "marshalTreeCursor");
  __name(unmarshalTreeCursor, "unmarshalTreeCursor");
  __name(marshalPoint, "marshalPoint");
  __name(unmarshalPoint, "unmarshalPoint");
  __name(marshalRange, "marshalRange");
  __name(unmarshalRange, "unmarshalRange");
  __name(marshalEdit, "marshalEdit");
  __name(unmarshalLanguageMetadata, "unmarshalLanguageMetadata");
  QUERY_WORD_REGEX = /[\w-]+/g;
  CaptureQuantifier = {
    Zero: 0,
    ZeroOrOne: 1,
    ZeroOrMore: 2,
    One: 3,
    OneOrMore: 4
  };
  isCaptureStep = /* @__PURE__ */ __name((step) => step.type === "capture", "isCaptureStep");
  isStringStep = /* @__PURE__ */ __name((step) => step.type === "string", "isStringStep");
  QueryErrorKind = {
    Syntax: 1,
    NodeName: 2,
    FieldName: 3,
    CaptureName: 4,
    PatternStructure: 5
  };
  QueryError = class _QueryError extends Error {
    constructor(kind, info2, index, length) {
      super(_QueryError.formatMessage(kind, info2));
      this.kind = kind;
      this.info = info2;
      this.index = index;
      this.length = length;
      this.name = "QueryError";
    }
    static {
      __name(this, "QueryError");
    }
    static formatMessage(kind, info2) {
      switch (kind) {
        case QueryErrorKind.NodeName:
          return `Bad node name '${info2.word}'`;
        case QueryErrorKind.FieldName:
          return `Bad field name '${info2.word}'`;
        case QueryErrorKind.CaptureName:
          return `Bad capture name @${info2.word}`;
        case QueryErrorKind.PatternStructure:
          return `Bad pattern structure at offset ${info2.suffix}`;
        case QueryErrorKind.Syntax:
          return `Bad syntax at offset ${info2.suffix}`;
      }
    }
  };
  __name(parseAnyPredicate, "parseAnyPredicate");
  __name(parseMatchPredicate, "parseMatchPredicate");
  __name(parseAnyOfPredicate, "parseAnyOfPredicate");
  __name(parseIsPredicate, "parseIsPredicate");
  __name(parseSetDirective, "parseSetDirective");
  __name(parsePattern, "parsePattern");
  Query = class {
    static {
      __name(this, "Query");
    }
    [0] = 0;
    exceededMatchLimit;
    textPredicates;
    captureNames;
    captureQuantifiers;
    predicates;
    setProperties;
    assertedProperties;
    refutedProperties;
    matchLimit;
    constructor(language, source) {
      const sourceLength = C.lengthBytesUTF8(source);
      const sourceAddress = C._malloc(sourceLength + 1);
      C.stringToUTF8(source, sourceAddress, sourceLength + 1);
      const address = C._ts_query_new(language[0], sourceAddress, sourceLength, TRANSFER_BUFFER, TRANSFER_BUFFER + SIZE_OF_INT);
      if (!address) {
        const errorId = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
        const errorByte = C.getValue(TRANSFER_BUFFER, "i32");
        const errorIndex = C.UTF8ToString(sourceAddress, errorByte).length;
        const suffix = source.slice(errorIndex, errorIndex + 100).split(`
`)[0];
        const word = suffix.match(QUERY_WORD_REGEX)?.[0] ?? "";
        C._free(sourceAddress);
        switch (errorId) {
          case QueryErrorKind.Syntax:
            throw new QueryError(QueryErrorKind.Syntax, { suffix: `${errorIndex}: '${suffix}'...` }, errorIndex, 0);
          case QueryErrorKind.NodeName:
            throw new QueryError(errorId, { word }, errorIndex, word.length);
          case QueryErrorKind.FieldName:
            throw new QueryError(errorId, { word }, errorIndex, word.length);
          case QueryErrorKind.CaptureName:
            throw new QueryError(errorId, { word }, errorIndex, word.length);
          case QueryErrorKind.PatternStructure:
            throw new QueryError(errorId, { suffix: `${errorIndex}: '${suffix}'...` }, errorIndex, 0);
        }
      }
      const stringCount = C._ts_query_string_count(address);
      const captureCount = C._ts_query_capture_count(address);
      const patternCount = C._ts_query_pattern_count(address);
      const captureNames = new Array(captureCount);
      const captureQuantifiers = new Array(patternCount);
      const stringValues = new Array(stringCount);
      for (let i2 = 0;i2 < captureCount; i2++) {
        const nameAddress = C._ts_query_capture_name_for_id(address, i2, TRANSFER_BUFFER);
        const nameLength = C.getValue(TRANSFER_BUFFER, "i32");
        captureNames[i2] = C.UTF8ToString(nameAddress, nameLength);
      }
      for (let i2 = 0;i2 < patternCount; i2++) {
        const captureQuantifiersArray = new Array(captureCount);
        for (let j = 0;j < captureCount; j++) {
          const quantifier = C._ts_query_capture_quantifier_for_id(address, i2, j);
          captureQuantifiersArray[j] = quantifier;
        }
        captureQuantifiers[i2] = captureQuantifiersArray;
      }
      for (let i2 = 0;i2 < stringCount; i2++) {
        const valueAddress = C._ts_query_string_value_for_id(address, i2, TRANSFER_BUFFER);
        const nameLength = C.getValue(TRANSFER_BUFFER, "i32");
        stringValues[i2] = C.UTF8ToString(valueAddress, nameLength);
      }
      const setProperties = new Array(patternCount);
      const assertedProperties = new Array(patternCount);
      const refutedProperties = new Array(patternCount);
      const predicates = new Array(patternCount);
      const textPredicates = new Array(patternCount);
      for (let i2 = 0;i2 < patternCount; i2++) {
        const predicatesAddress = C._ts_query_predicates_for_pattern(address, i2, TRANSFER_BUFFER);
        const stepCount = C.getValue(TRANSFER_BUFFER, "i32");
        predicates[i2] = [];
        textPredicates[i2] = [];
        const steps = new Array;
        let stepAddress = predicatesAddress;
        for (let j = 0;j < stepCount; j++) {
          const stepType = C.getValue(stepAddress, "i32");
          stepAddress += SIZE_OF_INT;
          const stepValueId = C.getValue(stepAddress, "i32");
          stepAddress += SIZE_OF_INT;
          parsePattern(i2, stepType, stepValueId, captureNames, stringValues, steps, textPredicates, predicates, setProperties, assertedProperties, refutedProperties);
        }
        Object.freeze(textPredicates[i2]);
        Object.freeze(predicates[i2]);
        Object.freeze(setProperties[i2]);
        Object.freeze(assertedProperties[i2]);
        Object.freeze(refutedProperties[i2]);
      }
      C._free(sourceAddress);
      this[0] = address;
      this.captureNames = captureNames;
      this.captureQuantifiers = captureQuantifiers;
      this.textPredicates = textPredicates;
      this.predicates = predicates;
      this.setProperties = setProperties;
      this.assertedProperties = assertedProperties;
      this.refutedProperties = refutedProperties;
      this.exceededMatchLimit = false;
    }
    delete() {
      C._ts_query_delete(this[0]);
      this[0] = 0;
    }
    matches(node, options = {}) {
      const startPosition = options.startPosition ?? ZERO_POINT;
      const endPosition = options.endPosition ?? ZERO_POINT;
      const startIndex = options.startIndex ?? 0;
      const endIndex = options.endIndex ?? 0;
      const matchLimit = options.matchLimit ?? 4294967295;
      const maxStartDepth = options.maxStartDepth ?? 4294967295;
      const timeoutMicros = options.timeoutMicros ?? 0;
      const progressCallback = options.progressCallback;
      if (typeof matchLimit !== "number") {
        throw new Error("Arguments must be numbers");
      }
      this.matchLimit = matchLimit;
      if (endIndex !== 0 && startIndex > endIndex) {
        throw new Error("`startIndex` cannot be greater than `endIndex`");
      }
      if (endPosition !== ZERO_POINT && (startPosition.row > endPosition.row || startPosition.row === endPosition.row && startPosition.column > endPosition.column)) {
        throw new Error("`startPosition` cannot be greater than `endPosition`");
      }
      if (progressCallback) {
        C.currentQueryProgressCallback = progressCallback;
      }
      marshalNode(node);
      C._ts_query_matches_wasm(this[0], node.tree[0], startPosition.row, startPosition.column, endPosition.row, endPosition.column, startIndex, endIndex, matchLimit, maxStartDepth, timeoutMicros);
      const rawCount = C.getValue(TRANSFER_BUFFER, "i32");
      const startAddress = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const didExceedMatchLimit = C.getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
      const result = new Array(rawCount);
      this.exceededMatchLimit = Boolean(didExceedMatchLimit);
      let filteredCount = 0;
      let address = startAddress;
      for (let i2 = 0;i2 < rawCount; i2++) {
        const patternIndex = C.getValue(address, "i32");
        address += SIZE_OF_INT;
        const captureCount = C.getValue(address, "i32");
        address += SIZE_OF_INT;
        const captures = new Array(captureCount);
        address = unmarshalCaptures(this, node.tree, address, patternIndex, captures);
        if (this.textPredicates[patternIndex].every((p) => p(captures))) {
          result[filteredCount] = { pattern: patternIndex, patternIndex, captures };
          const setProperties = this.setProperties[patternIndex];
          result[filteredCount].setProperties = setProperties;
          const assertedProperties = this.assertedProperties[patternIndex];
          result[filteredCount].assertedProperties = assertedProperties;
          const refutedProperties = this.refutedProperties[patternIndex];
          result[filteredCount].refutedProperties = refutedProperties;
          filteredCount++;
        }
      }
      result.length = filteredCount;
      C._free(startAddress);
      C.currentQueryProgressCallback = null;
      return result;
    }
    captures(node, options = {}) {
      const startPosition = options.startPosition ?? ZERO_POINT;
      const endPosition = options.endPosition ?? ZERO_POINT;
      const startIndex = options.startIndex ?? 0;
      const endIndex = options.endIndex ?? 0;
      const matchLimit = options.matchLimit ?? 4294967295;
      const maxStartDepth = options.maxStartDepth ?? 4294967295;
      const timeoutMicros = options.timeoutMicros ?? 0;
      const progressCallback = options.progressCallback;
      if (typeof matchLimit !== "number") {
        throw new Error("Arguments must be numbers");
      }
      this.matchLimit = matchLimit;
      if (endIndex !== 0 && startIndex > endIndex) {
        throw new Error("`startIndex` cannot be greater than `endIndex`");
      }
      if (endPosition !== ZERO_POINT && (startPosition.row > endPosition.row || startPosition.row === endPosition.row && startPosition.column > endPosition.column)) {
        throw new Error("`startPosition` cannot be greater than `endPosition`");
      }
      if (progressCallback) {
        C.currentQueryProgressCallback = progressCallback;
      }
      marshalNode(node);
      C._ts_query_captures_wasm(this[0], node.tree[0], startPosition.row, startPosition.column, endPosition.row, endPosition.column, startIndex, endIndex, matchLimit, maxStartDepth, timeoutMicros);
      const count = C.getValue(TRANSFER_BUFFER, "i32");
      const startAddress = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const didExceedMatchLimit = C.getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
      const result = new Array;
      this.exceededMatchLimit = Boolean(didExceedMatchLimit);
      const captures = new Array;
      let address = startAddress;
      for (let i2 = 0;i2 < count; i2++) {
        const patternIndex = C.getValue(address, "i32");
        address += SIZE_OF_INT;
        const captureCount = C.getValue(address, "i32");
        address += SIZE_OF_INT;
        const captureIndex = C.getValue(address, "i32");
        address += SIZE_OF_INT;
        captures.length = captureCount;
        address = unmarshalCaptures(this, node.tree, address, patternIndex, captures);
        if (this.textPredicates[patternIndex].every((p) => p(captures))) {
          const capture = captures[captureIndex];
          const setProperties = this.setProperties[patternIndex];
          capture.setProperties = setProperties;
          const assertedProperties = this.assertedProperties[patternIndex];
          capture.assertedProperties = assertedProperties;
          const refutedProperties = this.refutedProperties[patternIndex];
          capture.refutedProperties = refutedProperties;
          result.push(capture);
        }
      }
      C._free(startAddress);
      C.currentQueryProgressCallback = null;
      return result;
    }
    predicatesForPattern(patternIndex) {
      return this.predicates[patternIndex];
    }
    disableCapture(captureName) {
      const captureNameLength = C.lengthBytesUTF8(captureName);
      const captureNameAddress = C._malloc(captureNameLength + 1);
      C.stringToUTF8(captureName, captureNameAddress, captureNameLength + 1);
      C._ts_query_disable_capture(this[0], captureNameAddress, captureNameLength);
      C._free(captureNameAddress);
    }
    disablePattern(patternIndex) {
      if (patternIndex >= this.predicates.length) {
        throw new Error(`Pattern index is ${patternIndex} but the pattern count is ${this.predicates.length}`);
      }
      C._ts_query_disable_pattern(this[0], patternIndex);
    }
    didExceedMatchLimit() {
      return this.exceededMatchLimit;
    }
    startIndexForPattern(patternIndex) {
      if (patternIndex >= this.predicates.length) {
        throw new Error(`Pattern index is ${patternIndex} but the pattern count is ${this.predicates.length}`);
      }
      return C._ts_query_start_byte_for_pattern(this[0], patternIndex);
    }
    endIndexForPattern(patternIndex) {
      if (patternIndex >= this.predicates.length) {
        throw new Error(`Pattern index is ${patternIndex} but the pattern count is ${this.predicates.length}`);
      }
      return C._ts_query_end_byte_for_pattern(this[0], patternIndex);
    }
    patternCount() {
      return C._ts_query_pattern_count(this[0]);
    }
    captureIndexForName(captureName) {
      return this.captureNames.indexOf(captureName);
    }
    isPatternRooted(patternIndex) {
      return C._ts_query_is_pattern_rooted(this[0], patternIndex) === 1;
    }
    isPatternNonLocal(patternIndex) {
      return C._ts_query_is_pattern_non_local(this[0], patternIndex) === 1;
    }
    isPatternGuaranteedAtStep(byteIndex) {
      return C._ts_query_is_pattern_guaranteed_at_step(this[0], byteIndex) === 1;
    }
  };
  LANGUAGE_FUNCTION_REGEX = /^tree_sitter_\w+$/;
  Language = class _Language {
    static {
      __name(this, "Language");
    }
    [0] = 0;
    types;
    fields;
    constructor(internal, address) {
      assertInternal(internal);
      this[0] = address;
      this.types = new Array(C._ts_language_symbol_count(this[0]));
      for (let i2 = 0, n = this.types.length;i2 < n; i2++) {
        if (C._ts_language_symbol_type(this[0], i2) < 2) {
          this.types[i2] = C.UTF8ToString(C._ts_language_symbol_name(this[0], i2));
        }
      }
      this.fields = new Array(C._ts_language_field_count(this[0]) + 1);
      for (let i2 = 0, n = this.fields.length;i2 < n; i2++) {
        const fieldName = C._ts_language_field_name_for_id(this[0], i2);
        if (fieldName !== 0) {
          this.fields[i2] = C.UTF8ToString(fieldName);
        } else {
          this.fields[i2] = null;
        }
      }
    }
    get name() {
      const ptr = C._ts_language_name(this[0]);
      if (ptr === 0)
        return null;
      return C.UTF8ToString(ptr);
    }
    get version() {
      return C._ts_language_version(this[0]);
    }
    get abiVersion() {
      return C._ts_language_abi_version(this[0]);
    }
    get metadata() {
      C._ts_language_metadata(this[0]);
      const length = C.getValue(TRANSFER_BUFFER, "i32");
      const address = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      if (length === 0)
        return null;
      return unmarshalLanguageMetadata(address);
    }
    get fieldCount() {
      return this.fields.length - 1;
    }
    get stateCount() {
      return C._ts_language_state_count(this[0]);
    }
    fieldIdForName(fieldName) {
      const result = this.fields.indexOf(fieldName);
      return result !== -1 ? result : null;
    }
    fieldNameForId(fieldId) {
      return this.fields[fieldId] ?? null;
    }
    idForNodeType(type, named) {
      const typeLength = C.lengthBytesUTF8(type);
      const typeAddress = C._malloc(typeLength + 1);
      C.stringToUTF8(type, typeAddress, typeLength + 1);
      const result = C._ts_language_symbol_for_name(this[0], typeAddress, typeLength, named ? 1 : 0);
      C._free(typeAddress);
      return result || null;
    }
    get nodeTypeCount() {
      return C._ts_language_symbol_count(this[0]);
    }
    nodeTypeForId(typeId) {
      const name2 = C._ts_language_symbol_name(this[0], typeId);
      return name2 ? C.UTF8ToString(name2) : null;
    }
    nodeTypeIsNamed(typeId) {
      return C._ts_language_type_is_named_wasm(this[0], typeId) ? true : false;
    }
    nodeTypeIsVisible(typeId) {
      return C._ts_language_type_is_visible_wasm(this[0], typeId) ? true : false;
    }
    get supertypes() {
      C._ts_language_supertypes_wasm(this[0]);
      const count = C.getValue(TRANSFER_BUFFER, "i32");
      const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const result = new Array(count);
      if (count > 0) {
        let address = buffer;
        for (let i2 = 0;i2 < count; i2++) {
          result[i2] = C.getValue(address, "i16");
          address += SIZE_OF_SHORT;
        }
      }
      return result;
    }
    subtypes(supertype) {
      C._ts_language_subtypes_wasm(this[0], supertype);
      const count = C.getValue(TRANSFER_BUFFER, "i32");
      const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const result = new Array(count);
      if (count > 0) {
        let address = buffer;
        for (let i2 = 0;i2 < count; i2++) {
          result[i2] = C.getValue(address, "i16");
          address += SIZE_OF_SHORT;
        }
      }
      return result;
    }
    nextState(stateId, typeId) {
      return C._ts_language_next_state(this[0], stateId, typeId);
    }
    lookaheadIterator(stateId) {
      const address = C._ts_lookahead_iterator_new(this[0], stateId);
      if (address)
        return new LookaheadIterator(INTERNAL, address, this);
      return null;
    }
    query(source) {
      console.warn("Language.query is deprecated. Use new Query(language, source) instead.");
      return new Query(this, source);
    }
    static async load(input) {
      let bytes;
      if (input instanceof Uint8Array) {
        bytes = Promise.resolve(input);
      } else {
        if (globalThis.process?.versions.node) {
          const fs2 = await import("fs/promises");
          bytes = fs2.readFile(input);
        } else {
          bytes = fetch(input).then((response) => response.arrayBuffer().then((buffer) => {
            if (response.ok) {
              return new Uint8Array(buffer);
            } else {
              const body2 = new TextDecoder("utf-8").decode(buffer);
              throw new Error(`Language.load failed with status ${response.status}.

${body2}`);
            }
          }));
        }
      }
      const mod = await C.loadWebAssemblyModule(await bytes, { loadAsync: true });
      const symbolNames = Object.keys(mod);
      const functionName = symbolNames.find((key) => LANGUAGE_FUNCTION_REGEX.test(key) && !key.includes("external_scanner_"));
      if (!functionName) {
        console.log(`Couldn't find language function in WASM file. Symbols:
${JSON.stringify(symbolNames, null, 2)}`);
        throw new Error("Language.load failed: no language function found in WASM file");
      }
      const languageAddress = mod[functionName]();
      return new _Language(INTERNAL, languageAddress);
    }
  };
  Module2 = (() => {
    var _scriptName = import.meta.url;
    return async function(moduleArg = {}) {
      var moduleRtn;
      var Module = moduleArg;
      var readyPromiseResolve, readyPromiseReject;
      var readyPromise = new Promise((resolve, reject) => {
        readyPromiseResolve = resolve;
        readyPromiseReject = reject;
      });
      var ENVIRONMENT_IS_WEB = typeof window == "object";
      var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";
      var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
      var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
      if (ENVIRONMENT_IS_NODE) {
        const { createRequire: createRequire2 } = await import("module");
        var require = createRequire2(import.meta.url);
      }
      Module.currentQueryProgressCallback = null;
      Module.currentProgressCallback = null;
      Module.currentLogCallback = null;
      Module.currentParseCallback = null;
      var moduleOverrides = Object.assign({}, Module);
      var arguments_ = [];
      var thisProgram = "./this.program";
      var quit_ = /* @__PURE__ */ __name((status, toThrow) => {
        throw toThrow;
      }, "quit_");
      var scriptDirectory = "";
      function locateFile(path) {
        if (Module["locateFile"]) {
          return Module["locateFile"](path, scriptDirectory);
        }
        return scriptDirectory + path;
      }
      __name(locateFile, "locateFile");
      var readAsync, readBinary;
      if (ENVIRONMENT_IS_NODE) {
        var fs = require("fs");
        var nodePath = require("path");
        if (!import.meta.url.startsWith("data:")) {
          scriptDirectory = nodePath.dirname(require("url").fileURLToPath(import.meta.url)) + "/";
        }
        readBinary = /* @__PURE__ */ __name((filename) => {
          filename = isFileURI(filename) ? new URL(filename) : filename;
          var ret = fs.readFileSync(filename);
          return ret;
        }, "readBinary");
        readAsync = /* @__PURE__ */ __name(async (filename, binary2 = true) => {
          filename = isFileURI(filename) ? new URL(filename) : filename;
          var ret = fs.readFileSync(filename, binary2 ? undefined : "utf8");
          return ret;
        }, "readAsync");
        if (!Module["thisProgram"] && process.argv.length > 1) {
          thisProgram = process.argv[1].replace(/\\/g, "/");
        }
        arguments_ = process.argv.slice(2);
        quit_ = /* @__PURE__ */ __name((status, toThrow) => {
          process.exitCode = status;
          throw toThrow;
        }, "quit_");
      } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER) {
          scriptDirectory = self.location.href;
        } else if (typeof document != "undefined" && document.currentScript) {
          scriptDirectory = document.currentScript.src;
        }
        if (_scriptName) {
          scriptDirectory = _scriptName;
        }
        if (scriptDirectory.startsWith("blob:")) {
          scriptDirectory = "";
        } else {
          scriptDirectory = scriptDirectory.slice(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
        }
        {
          if (ENVIRONMENT_IS_WORKER) {
            readBinary = /* @__PURE__ */ __name((url) => {
              var xhr = new XMLHttpRequest;
              xhr.open("GET", url, false);
              xhr.responseType = "arraybuffer";
              xhr.send(null);
              return new Uint8Array(xhr.response);
            }, "readBinary");
          }
          readAsync = /* @__PURE__ */ __name(async (url) => {
            if (isFileURI(url)) {
              return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, true);
                xhr.responseType = "arraybuffer";
                xhr.onload = () => {
                  if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                    resolve(xhr.response);
                    return;
                  }
                  reject(xhr.status);
                };
                xhr.onerror = reject;
                xhr.send(null);
              });
            }
            var response = await fetch(url, {
              credentials: "same-origin"
            });
            if (response.ok) {
              return response.arrayBuffer();
            }
            throw new Error(response.status + " : " + response.url);
          }, "readAsync");
        }
      } else {}
      var out = Module["print"] || console.log.bind(console);
      var err = Module["printErr"] || console.error.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      if (Module["arguments"])
        arguments_ = Module["arguments"];
      if (Module["thisProgram"])
        thisProgram = Module["thisProgram"];
      var dynamicLibraries = Module["dynamicLibraries"] || [];
      var wasmBinary = Module["wasmBinary"];
      var wasmMemory;
      var ABORT = false;
      var EXITSTATUS;
      function assert(condition, text) {
        if (!condition) {
          abort(text);
        }
      }
      __name(assert, "assert");
      var HEAP, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAP64, HEAPU64, HEAPF64;
      var HEAP_DATA_VIEW;
      var runtimeInitialized = false;
      var isFileURI = /* @__PURE__ */ __name((filename) => filename.startsWith("file://"), "isFileURI");
      function updateMemoryViews() {
        var b = wasmMemory.buffer;
        Module["HEAP_DATA_VIEW"] = HEAP_DATA_VIEW = new DataView(b);
        Module["HEAP8"] = HEAP8 = new Int8Array(b);
        Module["HEAP16"] = HEAP16 = new Int16Array(b);
        Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
        Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
        Module["HEAP32"] = HEAP32 = new Int32Array(b);
        Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
        Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
        Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
        Module["HEAP64"] = HEAP64 = new BigInt64Array(b);
        Module["HEAPU64"] = HEAPU64 = new BigUint64Array(b);
      }
      __name(updateMemoryViews, "updateMemoryViews");
      if (Module["wasmMemory"]) {
        wasmMemory = Module["wasmMemory"];
      } else {
        var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 33554432;
        wasmMemory = new WebAssembly.Memory({
          initial: INITIAL_MEMORY / 65536,
          maximum: 32768
        });
      }
      updateMemoryViews();
      var __RELOC_FUNCS__ = [];
      function preRun() {
        if (Module["preRun"]) {
          if (typeof Module["preRun"] == "function")
            Module["preRun"] = [Module["preRun"]];
          while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift());
          }
        }
        callRuntimeCallbacks(onPreRuns);
      }
      __name(preRun, "preRun");
      function initRuntime() {
        runtimeInitialized = true;
        callRuntimeCallbacks(__RELOC_FUNCS__);
        wasmExports["__wasm_call_ctors"]();
        callRuntimeCallbacks(onPostCtors);
      }
      __name(initRuntime, "initRuntime");
      function preMain() {}
      __name(preMain, "preMain");
      function postRun() {
        if (Module["postRun"]) {
          if (typeof Module["postRun"] == "function")
            Module["postRun"] = [Module["postRun"]];
          while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift());
          }
        }
        callRuntimeCallbacks(onPostRuns);
      }
      __name(postRun, "postRun");
      var runDependencies = 0;
      var dependenciesFulfilled = null;
      function getUniqueRunDependency(id) {
        return id;
      }
      __name(getUniqueRunDependency, "getUniqueRunDependency");
      function addRunDependency(id) {
        runDependencies++;
        Module["monitorRunDependencies"]?.(runDependencies);
      }
      __name(addRunDependency, "addRunDependency");
      function removeRunDependency(id) {
        runDependencies--;
        Module["monitorRunDependencies"]?.(runDependencies);
        if (runDependencies == 0) {
          if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
          }
        }
      }
      __name(removeRunDependency, "removeRunDependency");
      function abort(what) {
        Module["onAbort"]?.(what);
        what = "Aborted(" + what + ")";
        err(what);
        ABORT = true;
        what += ". Build with -sASSERTIONS for more info.";
        var e = new WebAssembly.RuntimeError(what);
        readyPromiseReject(e);
        throw e;
      }
      __name(abort, "abort");
      var wasmBinaryFile;
      function findWasmBinary() {
        if (Module["locateFile"]) {
          return locateFile("tree-sitter.wasm");
        }
        return new URL("tree-sitter.wasm", import.meta.url).href;
      }
      __name(findWasmBinary, "findWasmBinary");
      function getBinarySync(file) {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        }
        throw "both async and sync fetching of the wasm failed";
      }
      __name(getBinarySync, "getBinarySync");
      async function getWasmBinary(binaryFile) {
        if (!wasmBinary) {
          try {
            var response = await readAsync(binaryFile);
            return new Uint8Array(response);
          } catch {}
        }
        return getBinarySync(binaryFile);
      }
      __name(getWasmBinary, "getWasmBinary");
      async function instantiateArrayBuffer(binaryFile, imports) {
        try {
          var binary2 = await getWasmBinary(binaryFile);
          var instance2 = await WebAssembly.instantiate(binary2, imports);
          return instance2;
        } catch (reason) {
          err(`failed to asynchronously prepare wasm: ${reason}`);
          abort(reason);
        }
      }
      __name(instantiateArrayBuffer, "instantiateArrayBuffer");
      async function instantiateAsync(binary2, binaryFile, imports) {
        if (!binary2 && typeof WebAssembly.instantiateStreaming == "function" && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE) {
          try {
            var response = fetch(binaryFile, {
              credentials: "same-origin"
            });
            var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
            return instantiationResult;
          } catch (reason) {
            err(`wasm streaming compile failed: ${reason}`);
            err("falling back to ArrayBuffer instantiation");
          }
        }
        return instantiateArrayBuffer(binaryFile, imports);
      }
      __name(instantiateAsync, "instantiateAsync");
      function getWasmImports() {
        return {
          env: wasmImports,
          wasi_snapshot_preview1: wasmImports,
          "GOT.mem": new Proxy(wasmImports, GOTHandler),
          "GOT.func": new Proxy(wasmImports, GOTHandler)
        };
      }
      __name(getWasmImports, "getWasmImports");
      async function createWasm() {
        function receiveInstance(instance2, module2) {
          wasmExports = instance2.exports;
          wasmExports = relocateExports(wasmExports, 1024);
          var metadata2 = getDylinkMetadata(module2);
          if (metadata2.neededDynlibs) {
            dynamicLibraries = metadata2.neededDynlibs.concat(dynamicLibraries);
          }
          mergeLibSymbols(wasmExports, "main");
          LDSO.init();
          loadDylibs();
          __RELOC_FUNCS__.push(wasmExports["__wasm_apply_data_relocs"]);
          removeRunDependency("wasm-instantiate");
          return wasmExports;
        }
        __name(receiveInstance, "receiveInstance");
        addRunDependency("wasm-instantiate");
        function receiveInstantiationResult(result2) {
          return receiveInstance(result2["instance"], result2["module"]);
        }
        __name(receiveInstantiationResult, "receiveInstantiationResult");
        var info2 = getWasmImports();
        if (Module["instantiateWasm"]) {
          return new Promise((resolve, reject) => {
            Module["instantiateWasm"](info2, (mod, inst) => {
              receiveInstance(mod, inst);
              resolve(mod.exports);
            });
          });
        }
        wasmBinaryFile ??= findWasmBinary();
        try {
          var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info2);
          var exports = receiveInstantiationResult(result);
          return exports;
        } catch (e) {
          readyPromiseReject(e);
          return Promise.reject(e);
        }
      }
      __name(createWasm, "createWasm");
      var ASM_CONSTS = {};

      class ExitStatus {
        static {
          __name(this, "ExitStatus");
        }
        name = "ExitStatus";
        constructor(status) {
          this.message = `Program terminated with exit(${status})`;
          this.status = status;
        }
      }
      var GOT = {};
      var currentModuleWeakSymbols = /* @__PURE__ */ new Set([]);
      var GOTHandler = {
        get(obj, symName) {
          var rtn = GOT[symName];
          if (!rtn) {
            rtn = GOT[symName] = new WebAssembly.Global({
              value: "i32",
              mutable: true
            });
          }
          if (!currentModuleWeakSymbols.has(symName)) {
            rtn.required = true;
          }
          return rtn;
        }
      };
      var LE_HEAP_LOAD_F32 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getFloat32(byteOffset, true), "LE_HEAP_LOAD_F32");
      var LE_HEAP_LOAD_F64 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getFloat64(byteOffset, true), "LE_HEAP_LOAD_F64");
      var LE_HEAP_LOAD_I16 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getInt16(byteOffset, true), "LE_HEAP_LOAD_I16");
      var LE_HEAP_LOAD_I32 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getInt32(byteOffset, true), "LE_HEAP_LOAD_I32");
      var LE_HEAP_LOAD_U16 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getUint16(byteOffset, true), "LE_HEAP_LOAD_U16");
      var LE_HEAP_LOAD_U32 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getUint32(byteOffset, true), "LE_HEAP_LOAD_U32");
      var LE_HEAP_STORE_F32 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setFloat32(byteOffset, value, true), "LE_HEAP_STORE_F32");
      var LE_HEAP_STORE_F64 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setFloat64(byteOffset, value, true), "LE_HEAP_STORE_F64");
      var LE_HEAP_STORE_I16 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setInt16(byteOffset, value, true), "LE_HEAP_STORE_I16");
      var LE_HEAP_STORE_I32 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setInt32(byteOffset, value, true), "LE_HEAP_STORE_I32");
      var LE_HEAP_STORE_U16 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setUint16(byteOffset, value, true), "LE_HEAP_STORE_U16");
      var LE_HEAP_STORE_U32 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setUint32(byteOffset, value, true), "LE_HEAP_STORE_U32");
      var callRuntimeCallbacks = /* @__PURE__ */ __name((callbacks) => {
        while (callbacks.length > 0) {
          callbacks.shift()(Module);
        }
      }, "callRuntimeCallbacks");
      var onPostRuns = [];
      var addOnPostRun = /* @__PURE__ */ __name((cb) => onPostRuns.unshift(cb), "addOnPostRun");
      var onPreRuns = [];
      var addOnPreRun = /* @__PURE__ */ __name((cb) => onPreRuns.unshift(cb), "addOnPreRun");
      var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;
      var UTF8ArrayToString = /* @__PURE__ */ __name((heapOrArray, idx = 0, maxBytesToRead = NaN) => {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        while (heapOrArray[endPtr] && !(endPtr >= endIdx))
          ++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
        }
        var str = "";
        while (idx < endPtr) {
          var u0 = heapOrArray[idx++];
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue;
          }
          var u1 = heapOrArray[idx++] & 63;
          if ((u0 & 224) == 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue;
          }
          var u2 = heapOrArray[idx++] & 63;
          if ((u0 & 240) == 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2;
          } else {
            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
          }
        }
        return str;
      }, "UTF8ArrayToString");
      var getDylinkMetadata = /* @__PURE__ */ __name((binary2) => {
        var offset = 0;
        var end = 0;
        function getU8() {
          return binary2[offset++];
        }
        __name(getU8, "getU8");
        function getLEB() {
          var ret = 0;
          var mul = 1;
          while (true) {
            var byte = binary2[offset++];
            ret += (byte & 127) * mul;
            mul *= 128;
            if (!(byte & 128))
              break;
          }
          return ret;
        }
        __name(getLEB, "getLEB");
        function getString() {
          var len = getLEB();
          offset += len;
          return UTF8ArrayToString(binary2, offset - len, len);
        }
        __name(getString, "getString");
        function failIf(condition, message) {
          if (condition)
            throw new Error(message);
        }
        __name(failIf, "failIf");
        var name2 = "dylink.0";
        if (binary2 instanceof WebAssembly.Module) {
          var dylinkSection = WebAssembly.Module.customSections(binary2, name2);
          if (dylinkSection.length === 0) {
            name2 = "dylink";
            dylinkSection = WebAssembly.Module.customSections(binary2, name2);
          }
          failIf(dylinkSection.length === 0, "need dylink section");
          binary2 = new Uint8Array(dylinkSection[0]);
          end = binary2.length;
        } else {
          var int32View = new Uint32Array(new Uint8Array(binary2.subarray(0, 24)).buffer);
          var magicNumberFound = int32View[0] == 1836278016 || int32View[0] == 6386541;
          failIf(!magicNumberFound, "need to see wasm magic number");
          failIf(binary2[8] !== 0, "need the dylink section to be first");
          offset = 9;
          var section_size = getLEB();
          end = offset + section_size;
          name2 = getString();
        }
        var customSection = {
          neededDynlibs: [],
          tlsExports: /* @__PURE__ */ new Set,
          weakImports: /* @__PURE__ */ new Set
        };
        if (name2 == "dylink") {
          customSection.memorySize = getLEB();
          customSection.memoryAlign = getLEB();
          customSection.tableSize = getLEB();
          customSection.tableAlign = getLEB();
          var neededDynlibsCount = getLEB();
          for (var i2 = 0;i2 < neededDynlibsCount; ++i2) {
            var libname = getString();
            customSection.neededDynlibs.push(libname);
          }
        } else {
          failIf(name2 !== "dylink.0");
          var WASM_DYLINK_MEM_INFO = 1;
          var WASM_DYLINK_NEEDED = 2;
          var WASM_DYLINK_EXPORT_INFO = 3;
          var WASM_DYLINK_IMPORT_INFO = 4;
          var WASM_SYMBOL_TLS = 256;
          var WASM_SYMBOL_BINDING_MASK = 3;
          var WASM_SYMBOL_BINDING_WEAK = 1;
          while (offset < end) {
            var subsectionType = getU8();
            var subsectionSize = getLEB();
            if (subsectionType === WASM_DYLINK_MEM_INFO) {
              customSection.memorySize = getLEB();
              customSection.memoryAlign = getLEB();
              customSection.tableSize = getLEB();
              customSection.tableAlign = getLEB();
            } else if (subsectionType === WASM_DYLINK_NEEDED) {
              var neededDynlibsCount = getLEB();
              for (var i2 = 0;i2 < neededDynlibsCount; ++i2) {
                libname = getString();
                customSection.neededDynlibs.push(libname);
              }
            } else if (subsectionType === WASM_DYLINK_EXPORT_INFO) {
              var count = getLEB();
              while (count--) {
                var symname = getString();
                var flags2 = getLEB();
                if (flags2 & WASM_SYMBOL_TLS) {
                  customSection.tlsExports.add(symname);
                }
              }
            } else if (subsectionType === WASM_DYLINK_IMPORT_INFO) {
              var count = getLEB();
              while (count--) {
                var modname = getString();
                var symname = getString();
                var flags2 = getLEB();
                if ((flags2 & WASM_SYMBOL_BINDING_MASK) == WASM_SYMBOL_BINDING_WEAK) {
                  customSection.weakImports.add(symname);
                }
              }
            } else {
              offset += subsectionSize;
            }
          }
        }
        return customSection;
      }, "getDylinkMetadata");
      function getValue(ptr, type = "i8") {
        if (type.endsWith("*"))
          type = "*";
        switch (type) {
          case "i1":
            return HEAP8[ptr];
          case "i8":
            return HEAP8[ptr];
          case "i16":
            return LE_HEAP_LOAD_I16((ptr >> 1) * 2);
          case "i32":
            return LE_HEAP_LOAD_I32((ptr >> 2) * 4);
          case "i64":
            return HEAP64[ptr >> 3];
          case "float":
            return LE_HEAP_LOAD_F32((ptr >> 2) * 4);
          case "double":
            return LE_HEAP_LOAD_F64((ptr >> 3) * 8);
          case "*":
            return LE_HEAP_LOAD_U32((ptr >> 2) * 4);
          default:
            abort(`invalid type for getValue: ${type}`);
        }
      }
      __name(getValue, "getValue");
      var newDSO = /* @__PURE__ */ __name((name2, handle2, syms) => {
        var dso = {
          refcount: Infinity,
          name: name2,
          exports: syms,
          global: true
        };
        LDSO.loadedLibsByName[name2] = dso;
        if (handle2 != null) {
          LDSO.loadedLibsByHandle[handle2] = dso;
        }
        return dso;
      }, "newDSO");
      var LDSO = {
        loadedLibsByName: {},
        loadedLibsByHandle: {},
        init() {
          newDSO("__main__", 0, wasmImports);
        }
      };
      var ___heap_base = 78224;
      var alignMemory = /* @__PURE__ */ __name((size, alignment) => Math.ceil(size / alignment) * alignment, "alignMemory");
      var getMemory = /* @__PURE__ */ __name((size) => {
        if (runtimeInitialized) {
          return _calloc(size, 1);
        }
        var ret = ___heap_base;
        var end = ret + alignMemory(size, 16);
        ___heap_base = end;
        GOT["__heap_base"].value = end;
        return ret;
      }, "getMemory");
      var isInternalSym = /* @__PURE__ */ __name((symName) => ["__cpp_exception", "__c_longjmp", "__wasm_apply_data_relocs", "__dso_handle", "__tls_size", "__tls_align", "__set_stack_limits", "_emscripten_tls_init", "__wasm_init_tls", "__wasm_call_ctors", "__start_em_asm", "__stop_em_asm", "__start_em_js", "__stop_em_js"].includes(symName) || symName.startsWith("__em_js__"), "isInternalSym");
      var uleb128Encode = /* @__PURE__ */ __name((n, target) => {
        if (n < 128) {
          target.push(n);
        } else {
          target.push(n % 128 | 128, n >> 7);
        }
      }, "uleb128Encode");
      var sigToWasmTypes = /* @__PURE__ */ __name((sig) => {
        var typeNames = {
          i: "i32",
          j: "i64",
          f: "f32",
          d: "f64",
          e: "externref",
          p: "i32"
        };
        var type = {
          parameters: [],
          results: sig[0] == "v" ? [] : [typeNames[sig[0]]]
        };
        for (var i2 = 1;i2 < sig.length; ++i2) {
          type.parameters.push(typeNames[sig[i2]]);
        }
        return type;
      }, "sigToWasmTypes");
      var generateFuncType = /* @__PURE__ */ __name((sig, target) => {
        var sigRet = sig.slice(0, 1);
        var sigParam = sig.slice(1);
        var typeCodes = {
          i: 127,
          p: 127,
          j: 126,
          f: 125,
          d: 124,
          e: 111
        };
        target.push(96);
        uleb128Encode(sigParam.length, target);
        for (var i2 = 0;i2 < sigParam.length; ++i2) {
          target.push(typeCodes[sigParam[i2]]);
        }
        if (sigRet == "v") {
          target.push(0);
        } else {
          target.push(1, typeCodes[sigRet]);
        }
      }, "generateFuncType");
      var convertJsFunctionToWasm = /* @__PURE__ */ __name((func2, sig) => {
        if (typeof WebAssembly.Function == "function") {
          return new WebAssembly.Function(sigToWasmTypes(sig), func2);
        }
        var typeSectionBody = [1];
        generateFuncType(sig, typeSectionBody);
        var bytes = [
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1
        ];
        uleb128Encode(typeSectionBody.length, bytes);
        bytes.push(...typeSectionBody);
        bytes.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
        var module2 = new WebAssembly.Module(new Uint8Array(bytes));
        var instance2 = new WebAssembly.Instance(module2, {
          e: {
            f: func2
          }
        });
        var wrappedFunc = instance2.exports["f"];
        return wrappedFunc;
      }, "convertJsFunctionToWasm");
      var wasmTableMirror = [];
      var wasmTable = new WebAssembly.Table({
        initial: 31,
        element: "anyfunc"
      });
      var getWasmTableEntry = /* @__PURE__ */ __name((funcPtr) => {
        var func2 = wasmTableMirror[funcPtr];
        if (!func2) {
          if (funcPtr >= wasmTableMirror.length)
            wasmTableMirror.length = funcPtr + 1;
          wasmTableMirror[funcPtr] = func2 = wasmTable.get(funcPtr);
        }
        return func2;
      }, "getWasmTableEntry");
      var updateTableMap = /* @__PURE__ */ __name((offset, count) => {
        if (functionsInTableMap) {
          for (var i2 = offset;i2 < offset + count; i2++) {
            var item = getWasmTableEntry(i2);
            if (item) {
              functionsInTableMap.set(item, i2);
            }
          }
        }
      }, "updateTableMap");
      var functionsInTableMap;
      var getFunctionAddress = /* @__PURE__ */ __name((func2) => {
        if (!functionsInTableMap) {
          functionsInTableMap = /* @__PURE__ */ new WeakMap;
          updateTableMap(0, wasmTable.length);
        }
        return functionsInTableMap.get(func2) || 0;
      }, "getFunctionAddress");
      var freeTableIndexes = [];
      var getEmptyTableSlot = /* @__PURE__ */ __name(() => {
        if (freeTableIndexes.length) {
          return freeTableIndexes.pop();
        }
        try {
          wasmTable.grow(1);
        } catch (err2) {
          if (!(err2 instanceof RangeError)) {
            throw err2;
          }
          throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
        }
        return wasmTable.length - 1;
      }, "getEmptyTableSlot");
      var setWasmTableEntry = /* @__PURE__ */ __name((idx, func2) => {
        wasmTable.set(idx, func2);
        wasmTableMirror[idx] = wasmTable.get(idx);
      }, "setWasmTableEntry");
      var addFunction = /* @__PURE__ */ __name((func2, sig) => {
        var rtn = getFunctionAddress(func2);
        if (rtn) {
          return rtn;
        }
        var ret = getEmptyTableSlot();
        try {
          setWasmTableEntry(ret, func2);
        } catch (err2) {
          if (!(err2 instanceof TypeError)) {
            throw err2;
          }
          var wrapped = convertJsFunctionToWasm(func2, sig);
          setWasmTableEntry(ret, wrapped);
        }
        functionsInTableMap.set(func2, ret);
        return ret;
      }, "addFunction");
      var updateGOT = /* @__PURE__ */ __name((exports, replace) => {
        for (var symName in exports) {
          if (isInternalSym(symName)) {
            continue;
          }
          var value = exports[symName];
          GOT[symName] ||= new WebAssembly.Global({
            value: "i32",
            mutable: true
          });
          if (replace || GOT[symName].value == 0) {
            if (typeof value == "function") {
              GOT[symName].value = addFunction(value);
            } else if (typeof value == "number") {
              GOT[symName].value = value;
            } else {
              err(`unhandled export type for '${symName}': ${typeof value}`);
            }
          }
        }
      }, "updateGOT");
      var relocateExports = /* @__PURE__ */ __name((exports, memoryBase2, replace) => {
        var relocated = {};
        for (var e in exports) {
          var value = exports[e];
          if (typeof value == "object") {
            value = value.value;
          }
          if (typeof value == "number") {
            value += memoryBase2;
          }
          relocated[e] = value;
        }
        updateGOT(relocated, replace);
        return relocated;
      }, "relocateExports");
      var isSymbolDefined = /* @__PURE__ */ __name((symName) => {
        var existing = wasmImports[symName];
        if (!existing || existing.stub) {
          return false;
        }
        return true;
      }, "isSymbolDefined");
      var dynCall = /* @__PURE__ */ __name((sig, ptr, args2 = []) => {
        var rtn = getWasmTableEntry(ptr)(...args2);
        return rtn;
      }, "dynCall");
      var stackSave = /* @__PURE__ */ __name(() => _emscripten_stack_get_current(), "stackSave");
      var stackRestore = /* @__PURE__ */ __name((val) => __emscripten_stack_restore(val), "stackRestore");
      var createInvokeFunction = /* @__PURE__ */ __name((sig) => (ptr, ...args2) => {
        var sp = stackSave();
        try {
          return dynCall(sig, ptr, args2);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0)
            throw e;
          _setThrew(1, 0);
          if (sig[0] == "j")
            return 0n;
        }
      }, "createInvokeFunction");
      var resolveGlobalSymbol = /* @__PURE__ */ __name((symName, direct = false) => {
        var sym;
        if (isSymbolDefined(symName)) {
          sym = wasmImports[symName];
        } else if (symName.startsWith("invoke_")) {
          sym = wasmImports[symName] = createInvokeFunction(symName.split("_")[1]);
        }
        return {
          sym,
          name: symName
        };
      }, "resolveGlobalSymbol");
      var onPostCtors = [];
      var addOnPostCtor = /* @__PURE__ */ __name((cb) => onPostCtors.unshift(cb), "addOnPostCtor");
      var UTF8ToString = /* @__PURE__ */ __name((ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "", "UTF8ToString");
      var loadWebAssemblyModule = /* @__PURE__ */ __name((binary, flags, libName, localScope, handle) => {
        var metadata = getDylinkMetadata(binary);
        currentModuleWeakSymbols = metadata.weakImports;
        function loadModule() {
          var memAlign = Math.pow(2, metadata.memoryAlign);
          var memoryBase = metadata.memorySize ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign) : 0;
          var tableBase = metadata.tableSize ? wasmTable.length : 0;
          if (handle) {
            HEAP8[handle + 8] = 1;
            LE_HEAP_STORE_U32((handle + 12 >> 2) * 4, memoryBase);
            LE_HEAP_STORE_I32((handle + 16 >> 2) * 4, metadata.memorySize);
            LE_HEAP_STORE_U32((handle + 20 >> 2) * 4, tableBase);
            LE_HEAP_STORE_I32((handle + 24 >> 2) * 4, metadata.tableSize);
          }
          if (metadata.tableSize) {
            wasmTable.grow(metadata.tableSize);
          }
          var moduleExports;
          function resolveSymbol(sym) {
            var resolved = resolveGlobalSymbol(sym).sym;
            if (!resolved && localScope) {
              resolved = localScope[sym];
            }
            if (!resolved) {
              resolved = moduleExports[sym];
            }
            return resolved;
          }
          __name(resolveSymbol, "resolveSymbol");
          var proxyHandler = {
            get(stubs, prop) {
              switch (prop) {
                case "__memory_base":
                  return memoryBase;
                case "__table_base":
                  return tableBase;
              }
              if (prop in wasmImports && !wasmImports[prop].stub) {
                var res = wasmImports[prop];
                return res;
              }
              if (!(prop in stubs)) {
                var resolved;
                stubs[prop] = (...args2) => {
                  resolved ||= resolveSymbol(prop);
                  return resolved(...args2);
                };
              }
              return stubs[prop];
            }
          };
          var proxy = new Proxy({}, proxyHandler);
          var info = {
            "GOT.mem": new Proxy({}, GOTHandler),
            "GOT.func": new Proxy({}, GOTHandler),
            env: proxy,
            wasi_snapshot_preview1: proxy
          };
          function postInstantiation(module, instance) {
            updateTableMap(tableBase, metadata.tableSize);
            moduleExports = relocateExports(instance.exports, memoryBase);
            if (!flags.allowUndefined) {
              reportUndefinedSymbols();
            }
            function addEmAsm(addr, body) {
              var args = [];
              var arity = 0;
              for (;arity < 16; arity++) {
                if (body.indexOf("$" + arity) != -1) {
                  args.push("$" + arity);
                } else {
                  break;
                }
              }
              args = args.join(",");
              var func = `(${args}) => { ${body} };`;
              ASM_CONSTS[start] = eval(func);
            }
            __name(addEmAsm, "addEmAsm");
            if ("__start_em_asm" in moduleExports) {
              var start = moduleExports["__start_em_asm"];
              var stop = moduleExports["__stop_em_asm"];
              while (start < stop) {
                var jsString = UTF8ToString(start);
                addEmAsm(start, jsString);
                start = HEAPU8.indexOf(0, start) + 1;
              }
            }
            function addEmJs(name, cSig, body) {
              var jsArgs = [];
              cSig = cSig.slice(1, -1);
              if (cSig != "void") {
                cSig = cSig.split(",");
                for (var i in cSig) {
                  var jsArg = cSig[i].split(" ").pop();
                  jsArgs.push(jsArg.replace("*", ""));
                }
              }
              var func = `(${jsArgs}) => ${body};`;
              moduleExports[name] = eval(func);
            }
            __name(addEmJs, "addEmJs");
            for (var name in moduleExports) {
              if (name.startsWith("__em_js__")) {
                var start = moduleExports[name];
                var jsString = UTF8ToString(start);
                var parts = jsString.split("<::>");
                addEmJs(name.replace("__em_js__", ""), parts[0], parts[1]);
                delete moduleExports[name];
              }
            }
            var applyRelocs = moduleExports["__wasm_apply_data_relocs"];
            if (applyRelocs) {
              if (runtimeInitialized) {
                applyRelocs();
              } else {
                __RELOC_FUNCS__.push(applyRelocs);
              }
            }
            var init = moduleExports["__wasm_call_ctors"];
            if (init) {
              if (runtimeInitialized) {
                init();
              } else {
                addOnPostCtor(init);
              }
            }
            return moduleExports;
          }
          __name(postInstantiation, "postInstantiation");
          if (flags.loadAsync) {
            if (binary instanceof WebAssembly.Module) {
              var instance = new WebAssembly.Instance(binary, info);
              return Promise.resolve(postInstantiation(binary, instance));
            }
            return WebAssembly.instantiate(binary, info).then((result) => postInstantiation(result.module, result.instance));
          }
          var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary);
          var instance = new WebAssembly.Instance(module, info);
          return postInstantiation(module, instance);
        }
        __name(loadModule, "loadModule");
        if (flags.loadAsync) {
          return metadata.neededDynlibs.reduce((chain, dynNeeded) => chain.then(() => loadDynamicLibrary(dynNeeded, flags, localScope)), Promise.resolve()).then(loadModule);
        }
        metadata.neededDynlibs.forEach((needed) => loadDynamicLibrary(needed, flags, localScope));
        return loadModule();
      }, "loadWebAssemblyModule");
      var mergeLibSymbols = /* @__PURE__ */ __name((exports, libName2) => {
        for (var [sym, exp] of Object.entries(exports)) {
          const setImport = /* @__PURE__ */ __name((target) => {
            if (!isSymbolDefined(target)) {
              wasmImports[target] = exp;
            }
          }, "setImport");
          setImport(sym);
          const main_alias = "__main_argc_argv";
          if (sym == "main") {
            setImport(main_alias);
          }
          if (sym == main_alias) {
            setImport("main");
          }
        }
      }, "mergeLibSymbols");
      var asyncLoad = /* @__PURE__ */ __name(async (url) => {
        var arrayBuffer = await readAsync(url);
        return new Uint8Array(arrayBuffer);
      }, "asyncLoad");
      function loadDynamicLibrary(libName2, flags2 = {
        global: true,
        nodelete: true
      }, localScope2, handle2) {
        var dso = LDSO.loadedLibsByName[libName2];
        if (dso) {
          if (!flags2.global) {
            if (localScope2) {
              Object.assign(localScope2, dso.exports);
            }
          } else if (!dso.global) {
            dso.global = true;
            mergeLibSymbols(dso.exports, libName2);
          }
          if (flags2.nodelete && dso.refcount !== Infinity) {
            dso.refcount = Infinity;
          }
          dso.refcount++;
          if (handle2) {
            LDSO.loadedLibsByHandle[handle2] = dso;
          }
          return flags2.loadAsync ? Promise.resolve(true) : true;
        }
        dso = newDSO(libName2, handle2, "loading");
        dso.refcount = flags2.nodelete ? Infinity : 1;
        dso.global = flags2.global;
        function loadLibData() {
          if (handle2) {
            var data = LE_HEAP_LOAD_U32((handle2 + 28 >> 2) * 4);
            var dataSize = LE_HEAP_LOAD_U32((handle2 + 32 >> 2) * 4);
            if (data && dataSize) {
              var libData = HEAP8.slice(data, data + dataSize);
              return flags2.loadAsync ? Promise.resolve(libData) : libData;
            }
          }
          var libFile = locateFile(libName2);
          if (flags2.loadAsync) {
            return asyncLoad(libFile);
          }
          if (!readBinary) {
            throw new Error(`${libFile}: file not found, and synchronous loading of external files is not available`);
          }
          return readBinary(libFile);
        }
        __name(loadLibData, "loadLibData");
        function getExports() {
          if (flags2.loadAsync) {
            return loadLibData().then((libData) => loadWebAssemblyModule(libData, flags2, libName2, localScope2, handle2));
          }
          return loadWebAssemblyModule(loadLibData(), flags2, libName2, localScope2, handle2);
        }
        __name(getExports, "getExports");
        function moduleLoaded(exports) {
          if (dso.global) {
            mergeLibSymbols(exports, libName2);
          } else if (localScope2) {
            Object.assign(localScope2, exports);
          }
          dso.exports = exports;
        }
        __name(moduleLoaded, "moduleLoaded");
        if (flags2.loadAsync) {
          return getExports().then((exports) => {
            moduleLoaded(exports);
            return true;
          });
        }
        moduleLoaded(getExports());
        return true;
      }
      __name(loadDynamicLibrary, "loadDynamicLibrary");
      var reportUndefinedSymbols = /* @__PURE__ */ __name(() => {
        for (var [symName, entry] of Object.entries(GOT)) {
          if (entry.value == 0) {
            var value = resolveGlobalSymbol(symName, true).sym;
            if (!value && !entry.required) {
              continue;
            }
            if (typeof value == "function") {
              entry.value = addFunction(value, value.sig);
            } else if (typeof value == "number") {
              entry.value = value;
            } else {
              throw new Error(`bad export type for '${symName}': ${typeof value}`);
            }
          }
        }
      }, "reportUndefinedSymbols");
      var loadDylibs = /* @__PURE__ */ __name(() => {
        if (!dynamicLibraries.length) {
          reportUndefinedSymbols();
          return;
        }
        addRunDependency("loadDylibs");
        dynamicLibraries.reduce((chain, lib) => chain.then(() => loadDynamicLibrary(lib, {
          loadAsync: true,
          global: true,
          nodelete: true,
          allowUndefined: true
        })), Promise.resolve()).then(() => {
          reportUndefinedSymbols();
          removeRunDependency("loadDylibs");
        });
      }, "loadDylibs");
      var noExitRuntime = Module["noExitRuntime"] || true;
      function setValue(ptr, value, type = "i8") {
        if (type.endsWith("*"))
          type = "*";
        switch (type) {
          case "i1":
            HEAP8[ptr] = value;
            break;
          case "i8":
            HEAP8[ptr] = value;
            break;
          case "i16":
            LE_HEAP_STORE_I16((ptr >> 1) * 2, value);
            break;
          case "i32":
            LE_HEAP_STORE_I32((ptr >> 2) * 4, value);
            break;
          case "i64":
            HEAP64[ptr >> 3] = BigInt(value);
            break;
          case "float":
            LE_HEAP_STORE_F32((ptr >> 2) * 4, value);
            break;
          case "double":
            LE_HEAP_STORE_F64((ptr >> 3) * 8, value);
            break;
          case "*":
            LE_HEAP_STORE_U32((ptr >> 2) * 4, value);
            break;
          default:
            abort(`invalid type for setValue: ${type}`);
        }
      }
      __name(setValue, "setValue");
      var ___memory_base = new WebAssembly.Global({
        value: "i32",
        mutable: false
      }, 1024);
      var ___stack_pointer = new WebAssembly.Global({
        value: "i32",
        mutable: true
      }, 78224);
      var ___table_base = new WebAssembly.Global({
        value: "i32",
        mutable: false
      }, 1);
      var __abort_js = /* @__PURE__ */ __name(() => abort(""), "__abort_js");
      __abort_js.sig = "v";
      var _emscripten_get_now = /* @__PURE__ */ __name(() => performance.now(), "_emscripten_get_now");
      _emscripten_get_now.sig = "d";
      var _emscripten_date_now = /* @__PURE__ */ __name(() => Date.now(), "_emscripten_date_now");
      _emscripten_date_now.sig = "d";
      var nowIsMonotonic = 1;
      var checkWasiClock = /* @__PURE__ */ __name((clock_id) => clock_id >= 0 && clock_id <= 3, "checkWasiClock");
      var INT53_MAX = 9007199254740992;
      var INT53_MIN = -9007199254740992;
      var bigintToI53Checked = /* @__PURE__ */ __name((num) => num < INT53_MIN || num > INT53_MAX ? NaN : Number(num), "bigintToI53Checked");
      function _clock_time_get(clk_id, ignored_precision, ptime) {
        ignored_precision = bigintToI53Checked(ignored_precision);
        if (!checkWasiClock(clk_id)) {
          return 28;
        }
        var now;
        if (clk_id === 0) {
          now = _emscripten_date_now();
        } else if (nowIsMonotonic) {
          now = _emscripten_get_now();
        } else {
          return 52;
        }
        var nsec = Math.round(now * 1000 * 1000);
        HEAP64[ptime >> 3] = BigInt(nsec);
        return 0;
      }
      __name(_clock_time_get, "_clock_time_get");
      _clock_time_get.sig = "iijp";
      var getHeapMax = /* @__PURE__ */ __name(() => 2147483648, "getHeapMax");
      var growMemory = /* @__PURE__ */ __name((size) => {
        var b = wasmMemory.buffer;
        var pages = (size - b.byteLength + 65535) / 65536 | 0;
        try {
          wasmMemory.grow(pages);
          updateMemoryViews();
          return 1;
        } catch (e) {}
      }, "growMemory");
      var _emscripten_resize_heap = /* @__PURE__ */ __name((requestedSize) => {
        var oldSize = HEAPU8.length;
        requestedSize >>>= 0;
        var maxHeapSize = getHeapMax();
        if (requestedSize > maxHeapSize) {
          return false;
        }
        for (var cutDown = 1;cutDown <= 4; cutDown *= 2) {
          var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
          overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
          var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
          var replacement = growMemory(newSize);
          if (replacement) {
            return true;
          }
        }
        return false;
      }, "_emscripten_resize_heap");
      _emscripten_resize_heap.sig = "ip";
      var _fd_close = /* @__PURE__ */ __name((fd) => 52, "_fd_close");
      _fd_close.sig = "ii";
      function _fd_seek(fd, offset, whence, newOffset) {
        offset = bigintToI53Checked(offset);
        return 70;
      }
      __name(_fd_seek, "_fd_seek");
      _fd_seek.sig = "iijip";
      var printCharBuffers = [null, [], []];
      var printChar = /* @__PURE__ */ __name((stream, curr) => {
        var buffer = printCharBuffers[stream];
        if (curr === 0 || curr === 10) {
          (stream === 1 ? out : err)(UTF8ArrayToString(buffer));
          buffer.length = 0;
        } else {
          buffer.push(curr);
        }
      }, "printChar");
      var flush_NO_FILESYSTEM = /* @__PURE__ */ __name(() => {
        if (printCharBuffers[1].length)
          printChar(1, 10);
        if (printCharBuffers[2].length)
          printChar(2, 10);
      }, "flush_NO_FILESYSTEM");
      var SYSCALLS = {
        varargs: undefined,
        getStr(ptr) {
          var ret = UTF8ToString(ptr);
          return ret;
        }
      };
      var _fd_write = /* @__PURE__ */ __name((fd, iov, iovcnt, pnum) => {
        var num = 0;
        for (var i2 = 0;i2 < iovcnt; i2++) {
          var ptr = LE_HEAP_LOAD_U32((iov >> 2) * 4);
          var len = LE_HEAP_LOAD_U32((iov + 4 >> 2) * 4);
          iov += 8;
          for (var j = 0;j < len; j++) {
            printChar(fd, HEAPU8[ptr + j]);
          }
          num += len;
        }
        LE_HEAP_STORE_U32((pnum >> 2) * 4, num);
        return 0;
      }, "_fd_write");
      _fd_write.sig = "iippp";
      function _tree_sitter_log_callback(isLexMessage, messageAddress) {
        if (Module.currentLogCallback) {
          const message = UTF8ToString(messageAddress);
          Module.currentLogCallback(message, isLexMessage !== 0);
        }
      }
      __name(_tree_sitter_log_callback, "_tree_sitter_log_callback");
      function _tree_sitter_parse_callback(inputBufferAddress, index, row, column, lengthAddress) {
        const INPUT_BUFFER_SIZE = 10240;
        const string = Module.currentParseCallback(index, {
          row,
          column
        });
        if (typeof string === "string") {
          setValue(lengthAddress, string.length, "i32");
          stringToUTF16(string, inputBufferAddress, INPUT_BUFFER_SIZE);
        } else {
          setValue(lengthAddress, 0, "i32");
        }
      }
      __name(_tree_sitter_parse_callback, "_tree_sitter_parse_callback");
      function _tree_sitter_progress_callback(currentOffset, hasError) {
        if (Module.currentProgressCallback) {
          return Module.currentProgressCallback({
            currentOffset,
            hasError
          });
        }
        return false;
      }
      __name(_tree_sitter_progress_callback, "_tree_sitter_progress_callback");
      function _tree_sitter_query_progress_callback(currentOffset) {
        if (Module.currentQueryProgressCallback) {
          return Module.currentQueryProgressCallback({
            currentOffset
          });
        }
        return false;
      }
      __name(_tree_sitter_query_progress_callback, "_tree_sitter_query_progress_callback");
      var runtimeKeepaliveCounter = 0;
      var keepRuntimeAlive = /* @__PURE__ */ __name(() => noExitRuntime || runtimeKeepaliveCounter > 0, "keepRuntimeAlive");
      var _proc_exit = /* @__PURE__ */ __name((code) => {
        EXITSTATUS = code;
        if (!keepRuntimeAlive()) {
          Module["onExit"]?.(code);
          ABORT = true;
        }
        quit_(code, new ExitStatus(code));
      }, "_proc_exit");
      _proc_exit.sig = "vi";
      var exitJS = /* @__PURE__ */ __name((status, implicit) => {
        EXITSTATUS = status;
        _proc_exit(status);
      }, "exitJS");
      var handleException = /* @__PURE__ */ __name((e) => {
        if (e instanceof ExitStatus || e == "unwind") {
          return EXITSTATUS;
        }
        quit_(1, e);
      }, "handleException");
      var lengthBytesUTF8 = /* @__PURE__ */ __name((str) => {
        var len = 0;
        for (var i2 = 0;i2 < str.length; ++i2) {
          var c = str.charCodeAt(i2);
          if (c <= 127) {
            len++;
          } else if (c <= 2047) {
            len += 2;
          } else if (c >= 55296 && c <= 57343) {
            len += 4;
            ++i2;
          } else {
            len += 3;
          }
        }
        return len;
      }, "lengthBytesUTF8");
      var stringToUTF8Array = /* @__PURE__ */ __name((str, heap, outIdx, maxBytesToWrite) => {
        if (!(maxBytesToWrite > 0))
          return 0;
        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1;
        for (var i2 = 0;i2 < str.length; ++i2) {
          var u = str.charCodeAt(i2);
          if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i2);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023;
          }
          if (u <= 127) {
            if (outIdx >= endIdx)
              break;
            heap[outIdx++] = u;
          } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx)
              break;
            heap[outIdx++] = 192 | u >> 6;
            heap[outIdx++] = 128 | u & 63;
          } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx)
              break;
            heap[outIdx++] = 224 | u >> 12;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
          } else {
            if (outIdx + 3 >= endIdx)
              break;
            heap[outIdx++] = 240 | u >> 18;
            heap[outIdx++] = 128 | u >> 12 & 63;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
          }
        }
        heap[outIdx] = 0;
        return outIdx - startIdx;
      }, "stringToUTF8Array");
      var stringToUTF8 = /* @__PURE__ */ __name((str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite), "stringToUTF8");
      var stackAlloc = /* @__PURE__ */ __name((sz) => __emscripten_stack_alloc(sz), "stackAlloc");
      var stringToUTF8OnStack = /* @__PURE__ */ __name((str) => {
        var size = lengthBytesUTF8(str) + 1;
        var ret = stackAlloc(size);
        stringToUTF8(str, ret, size);
        return ret;
      }, "stringToUTF8OnStack");
      var AsciiToString = /* @__PURE__ */ __name((ptr) => {
        var str = "";
        while (true) {
          var ch = HEAPU8[ptr++];
          if (!ch)
            return str;
          str += String.fromCharCode(ch);
        }
      }, "AsciiToString");
      var stringToUTF16 = /* @__PURE__ */ __name((str, outPtr, maxBytesToWrite) => {
        maxBytesToWrite ??= 2147483647;
        if (maxBytesToWrite < 2)
          return 0;
        maxBytesToWrite -= 2;
        var startPtr = outPtr;
        var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
        for (var i2 = 0;i2 < numCharsToWrite; ++i2) {
          var codeUnit = str.charCodeAt(i2);
          LE_HEAP_STORE_I16((outPtr >> 1) * 2, codeUnit);
          outPtr += 2;
        }
        LE_HEAP_STORE_I16((outPtr >> 1) * 2, 0);
        return outPtr - startPtr;
      }, "stringToUTF16");
      var wasmImports = {
        __heap_base: ___heap_base,
        __indirect_function_table: wasmTable,
        __memory_base: ___memory_base,
        __stack_pointer: ___stack_pointer,
        __table_base: ___table_base,
        _abort_js: __abort_js,
        clock_time_get: _clock_time_get,
        emscripten_resize_heap: _emscripten_resize_heap,
        fd_close: _fd_close,
        fd_seek: _fd_seek,
        fd_write: _fd_write,
        memory: wasmMemory,
        tree_sitter_log_callback: _tree_sitter_log_callback,
        tree_sitter_parse_callback: _tree_sitter_parse_callback,
        tree_sitter_progress_callback: _tree_sitter_progress_callback,
        tree_sitter_query_progress_callback: _tree_sitter_query_progress_callback
      };
      var wasmExports = await createWasm();
      var ___wasm_call_ctors = wasmExports["__wasm_call_ctors"];
      var _malloc = Module["_malloc"] = wasmExports["malloc"];
      var _calloc = Module["_calloc"] = wasmExports["calloc"];
      var _realloc = Module["_realloc"] = wasmExports["realloc"];
      var _free = Module["_free"] = wasmExports["free"];
      var _memcmp = Module["_memcmp"] = wasmExports["memcmp"];
      var _ts_language_symbol_count = Module["_ts_language_symbol_count"] = wasmExports["ts_language_symbol_count"];
      var _ts_language_state_count = Module["_ts_language_state_count"] = wasmExports["ts_language_state_count"];
      var _ts_language_version = Module["_ts_language_version"] = wasmExports["ts_language_version"];
      var _ts_language_abi_version = Module["_ts_language_abi_version"] = wasmExports["ts_language_abi_version"];
      var _ts_language_metadata = Module["_ts_language_metadata"] = wasmExports["ts_language_metadata"];
      var _ts_language_name = Module["_ts_language_name"] = wasmExports["ts_language_name"];
      var _ts_language_field_count = Module["_ts_language_field_count"] = wasmExports["ts_language_field_count"];
      var _ts_language_next_state = Module["_ts_language_next_state"] = wasmExports["ts_language_next_state"];
      var _ts_language_symbol_name = Module["_ts_language_symbol_name"] = wasmExports["ts_language_symbol_name"];
      var _ts_language_symbol_for_name = Module["_ts_language_symbol_for_name"] = wasmExports["ts_language_symbol_for_name"];
      var _strncmp = Module["_strncmp"] = wasmExports["strncmp"];
      var _ts_language_symbol_type = Module["_ts_language_symbol_type"] = wasmExports["ts_language_symbol_type"];
      var _ts_language_field_name_for_id = Module["_ts_language_field_name_for_id"] = wasmExports["ts_language_field_name_for_id"];
      var _ts_lookahead_iterator_new = Module["_ts_lookahead_iterator_new"] = wasmExports["ts_lookahead_iterator_new"];
      var _ts_lookahead_iterator_delete = Module["_ts_lookahead_iterator_delete"] = wasmExports["ts_lookahead_iterator_delete"];
      var _ts_lookahead_iterator_reset_state = Module["_ts_lookahead_iterator_reset_state"] = wasmExports["ts_lookahead_iterator_reset_state"];
      var _ts_lookahead_iterator_reset = Module["_ts_lookahead_iterator_reset"] = wasmExports["ts_lookahead_iterator_reset"];
      var _ts_lookahead_iterator_next = Module["_ts_lookahead_iterator_next"] = wasmExports["ts_lookahead_iterator_next"];
      var _ts_lookahead_iterator_current_symbol = Module["_ts_lookahead_iterator_current_symbol"] = wasmExports["ts_lookahead_iterator_current_symbol"];
      var _ts_parser_delete = Module["_ts_parser_delete"] = wasmExports["ts_parser_delete"];
      var _ts_parser_reset = Module["_ts_parser_reset"] = wasmExports["ts_parser_reset"];
      var _ts_parser_set_language = Module["_ts_parser_set_language"] = wasmExports["ts_parser_set_language"];
      var _ts_parser_timeout_micros = Module["_ts_parser_timeout_micros"] = wasmExports["ts_parser_timeout_micros"];
      var _ts_parser_set_timeout_micros = Module["_ts_parser_set_timeout_micros"] = wasmExports["ts_parser_set_timeout_micros"];
      var _ts_parser_set_included_ranges = Module["_ts_parser_set_included_ranges"] = wasmExports["ts_parser_set_included_ranges"];
      var _ts_query_new = Module["_ts_query_new"] = wasmExports["ts_query_new"];
      var _ts_query_delete = Module["_ts_query_delete"] = wasmExports["ts_query_delete"];
      var _iswspace = Module["_iswspace"] = wasmExports["iswspace"];
      var _iswalnum = Module["_iswalnum"] = wasmExports["iswalnum"];
      var _ts_query_pattern_count = Module["_ts_query_pattern_count"] = wasmExports["ts_query_pattern_count"];
      var _ts_query_capture_count = Module["_ts_query_capture_count"] = wasmExports["ts_query_capture_count"];
      var _ts_query_string_count = Module["_ts_query_string_count"] = wasmExports["ts_query_string_count"];
      var _ts_query_capture_name_for_id = Module["_ts_query_capture_name_for_id"] = wasmExports["ts_query_capture_name_for_id"];
      var _ts_query_capture_quantifier_for_id = Module["_ts_query_capture_quantifier_for_id"] = wasmExports["ts_query_capture_quantifier_for_id"];
      var _ts_query_string_value_for_id = Module["_ts_query_string_value_for_id"] = wasmExports["ts_query_string_value_for_id"];
      var _ts_query_predicates_for_pattern = Module["_ts_query_predicates_for_pattern"] = wasmExports["ts_query_predicates_for_pattern"];
      var _ts_query_start_byte_for_pattern = Module["_ts_query_start_byte_for_pattern"] = wasmExports["ts_query_start_byte_for_pattern"];
      var _ts_query_end_byte_for_pattern = Module["_ts_query_end_byte_for_pattern"] = wasmExports["ts_query_end_byte_for_pattern"];
      var _ts_query_is_pattern_rooted = Module["_ts_query_is_pattern_rooted"] = wasmExports["ts_query_is_pattern_rooted"];
      var _ts_query_is_pattern_non_local = Module["_ts_query_is_pattern_non_local"] = wasmExports["ts_query_is_pattern_non_local"];
      var _ts_query_is_pattern_guaranteed_at_step = Module["_ts_query_is_pattern_guaranteed_at_step"] = wasmExports["ts_query_is_pattern_guaranteed_at_step"];
      var _ts_query_disable_capture = Module["_ts_query_disable_capture"] = wasmExports["ts_query_disable_capture"];
      var _ts_query_disable_pattern = Module["_ts_query_disable_pattern"] = wasmExports["ts_query_disable_pattern"];
      var _ts_tree_copy = Module["_ts_tree_copy"] = wasmExports["ts_tree_copy"];
      var _ts_tree_delete = Module["_ts_tree_delete"] = wasmExports["ts_tree_delete"];
      var _ts_init = Module["_ts_init"] = wasmExports["ts_init"];
      var _ts_parser_new_wasm = Module["_ts_parser_new_wasm"] = wasmExports["ts_parser_new_wasm"];
      var _ts_parser_enable_logger_wasm = Module["_ts_parser_enable_logger_wasm"] = wasmExports["ts_parser_enable_logger_wasm"];
      var _ts_parser_parse_wasm = Module["_ts_parser_parse_wasm"] = wasmExports["ts_parser_parse_wasm"];
      var _ts_parser_included_ranges_wasm = Module["_ts_parser_included_ranges_wasm"] = wasmExports["ts_parser_included_ranges_wasm"];
      var _ts_language_type_is_named_wasm = Module["_ts_language_type_is_named_wasm"] = wasmExports["ts_language_type_is_named_wasm"];
      var _ts_language_type_is_visible_wasm = Module["_ts_language_type_is_visible_wasm"] = wasmExports["ts_language_type_is_visible_wasm"];
      var _ts_language_supertypes_wasm = Module["_ts_language_supertypes_wasm"] = wasmExports["ts_language_supertypes_wasm"];
      var _ts_language_subtypes_wasm = Module["_ts_language_subtypes_wasm"] = wasmExports["ts_language_subtypes_wasm"];
      var _ts_tree_root_node_wasm = Module["_ts_tree_root_node_wasm"] = wasmExports["ts_tree_root_node_wasm"];
      var _ts_tree_root_node_with_offset_wasm = Module["_ts_tree_root_node_with_offset_wasm"] = wasmExports["ts_tree_root_node_with_offset_wasm"];
      var _ts_tree_edit_wasm = Module["_ts_tree_edit_wasm"] = wasmExports["ts_tree_edit_wasm"];
      var _ts_tree_included_ranges_wasm = Module["_ts_tree_included_ranges_wasm"] = wasmExports["ts_tree_included_ranges_wasm"];
      var _ts_tree_get_changed_ranges_wasm = Module["_ts_tree_get_changed_ranges_wasm"] = wasmExports["ts_tree_get_changed_ranges_wasm"];
      var _ts_tree_cursor_new_wasm = Module["_ts_tree_cursor_new_wasm"] = wasmExports["ts_tree_cursor_new_wasm"];
      var _ts_tree_cursor_copy_wasm = Module["_ts_tree_cursor_copy_wasm"] = wasmExports["ts_tree_cursor_copy_wasm"];
      var _ts_tree_cursor_delete_wasm = Module["_ts_tree_cursor_delete_wasm"] = wasmExports["ts_tree_cursor_delete_wasm"];
      var _ts_tree_cursor_reset_wasm = Module["_ts_tree_cursor_reset_wasm"] = wasmExports["ts_tree_cursor_reset_wasm"];
      var _ts_tree_cursor_reset_to_wasm = Module["_ts_tree_cursor_reset_to_wasm"] = wasmExports["ts_tree_cursor_reset_to_wasm"];
      var _ts_tree_cursor_goto_first_child_wasm = Module["_ts_tree_cursor_goto_first_child_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_wasm"];
      var _ts_tree_cursor_goto_last_child_wasm = Module["_ts_tree_cursor_goto_last_child_wasm"] = wasmExports["ts_tree_cursor_goto_last_child_wasm"];
      var _ts_tree_cursor_goto_first_child_for_index_wasm = Module["_ts_tree_cursor_goto_first_child_for_index_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_for_index_wasm"];
      var _ts_tree_cursor_goto_first_child_for_position_wasm = Module["_ts_tree_cursor_goto_first_child_for_position_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_for_position_wasm"];
      var _ts_tree_cursor_goto_next_sibling_wasm = Module["_ts_tree_cursor_goto_next_sibling_wasm"] = wasmExports["ts_tree_cursor_goto_next_sibling_wasm"];
      var _ts_tree_cursor_goto_previous_sibling_wasm = Module["_ts_tree_cursor_goto_previous_sibling_wasm"] = wasmExports["ts_tree_cursor_goto_previous_sibling_wasm"];
      var _ts_tree_cursor_goto_descendant_wasm = Module["_ts_tree_cursor_goto_descendant_wasm"] = wasmExports["ts_tree_cursor_goto_descendant_wasm"];
      var _ts_tree_cursor_goto_parent_wasm = Module["_ts_tree_cursor_goto_parent_wasm"] = wasmExports["ts_tree_cursor_goto_parent_wasm"];
      var _ts_tree_cursor_current_node_type_id_wasm = Module["_ts_tree_cursor_current_node_type_id_wasm"] = wasmExports["ts_tree_cursor_current_node_type_id_wasm"];
      var _ts_tree_cursor_current_node_state_id_wasm = Module["_ts_tree_cursor_current_node_state_id_wasm"] = wasmExports["ts_tree_cursor_current_node_state_id_wasm"];
      var _ts_tree_cursor_current_node_is_named_wasm = Module["_ts_tree_cursor_current_node_is_named_wasm"] = wasmExports["ts_tree_cursor_current_node_is_named_wasm"];
      var _ts_tree_cursor_current_node_is_missing_wasm = Module["_ts_tree_cursor_current_node_is_missing_wasm"] = wasmExports["ts_tree_cursor_current_node_is_missing_wasm"];
      var _ts_tree_cursor_current_node_id_wasm = Module["_ts_tree_cursor_current_node_id_wasm"] = wasmExports["ts_tree_cursor_current_node_id_wasm"];
      var _ts_tree_cursor_start_position_wasm = Module["_ts_tree_cursor_start_position_wasm"] = wasmExports["ts_tree_cursor_start_position_wasm"];
      var _ts_tree_cursor_end_position_wasm = Module["_ts_tree_cursor_end_position_wasm"] = wasmExports["ts_tree_cursor_end_position_wasm"];
      var _ts_tree_cursor_start_index_wasm = Module["_ts_tree_cursor_start_index_wasm"] = wasmExports["ts_tree_cursor_start_index_wasm"];
      var _ts_tree_cursor_end_index_wasm = Module["_ts_tree_cursor_end_index_wasm"] = wasmExports["ts_tree_cursor_end_index_wasm"];
      var _ts_tree_cursor_current_field_id_wasm = Module["_ts_tree_cursor_current_field_id_wasm"] = wasmExports["ts_tree_cursor_current_field_id_wasm"];
      var _ts_tree_cursor_current_depth_wasm = Module["_ts_tree_cursor_current_depth_wasm"] = wasmExports["ts_tree_cursor_current_depth_wasm"];
      var _ts_tree_cursor_current_descendant_index_wasm = Module["_ts_tree_cursor_current_descendant_index_wasm"] = wasmExports["ts_tree_cursor_current_descendant_index_wasm"];
      var _ts_tree_cursor_current_node_wasm = Module["_ts_tree_cursor_current_node_wasm"] = wasmExports["ts_tree_cursor_current_node_wasm"];
      var _ts_node_symbol_wasm = Module["_ts_node_symbol_wasm"] = wasmExports["ts_node_symbol_wasm"];
      var _ts_node_field_name_for_child_wasm = Module["_ts_node_field_name_for_child_wasm"] = wasmExports["ts_node_field_name_for_child_wasm"];
      var _ts_node_field_name_for_named_child_wasm = Module["_ts_node_field_name_for_named_child_wasm"] = wasmExports["ts_node_field_name_for_named_child_wasm"];
      var _ts_node_children_by_field_id_wasm = Module["_ts_node_children_by_field_id_wasm"] = wasmExports["ts_node_children_by_field_id_wasm"];
      var _ts_node_first_child_for_byte_wasm = Module["_ts_node_first_child_for_byte_wasm"] = wasmExports["ts_node_first_child_for_byte_wasm"];
      var _ts_node_first_named_child_for_byte_wasm = Module["_ts_node_first_named_child_for_byte_wasm"] = wasmExports["ts_node_first_named_child_for_byte_wasm"];
      var _ts_node_grammar_symbol_wasm = Module["_ts_node_grammar_symbol_wasm"] = wasmExports["ts_node_grammar_symbol_wasm"];
      var _ts_node_child_count_wasm = Module["_ts_node_child_count_wasm"] = wasmExports["ts_node_child_count_wasm"];
      var _ts_node_named_child_count_wasm = Module["_ts_node_named_child_count_wasm"] = wasmExports["ts_node_named_child_count_wasm"];
      var _ts_node_child_wasm = Module["_ts_node_child_wasm"] = wasmExports["ts_node_child_wasm"];
      var _ts_node_named_child_wasm = Module["_ts_node_named_child_wasm"] = wasmExports["ts_node_named_child_wasm"];
      var _ts_node_child_by_field_id_wasm = Module["_ts_node_child_by_field_id_wasm"] = wasmExports["ts_node_child_by_field_id_wasm"];
      var _ts_node_next_sibling_wasm = Module["_ts_node_next_sibling_wasm"] = wasmExports["ts_node_next_sibling_wasm"];
      var _ts_node_prev_sibling_wasm = Module["_ts_node_prev_sibling_wasm"] = wasmExports["ts_node_prev_sibling_wasm"];
      var _ts_node_next_named_sibling_wasm = Module["_ts_node_next_named_sibling_wasm"] = wasmExports["ts_node_next_named_sibling_wasm"];
      var _ts_node_prev_named_sibling_wasm = Module["_ts_node_prev_named_sibling_wasm"] = wasmExports["ts_node_prev_named_sibling_wasm"];
      var _ts_node_descendant_count_wasm = Module["_ts_node_descendant_count_wasm"] = wasmExports["ts_node_descendant_count_wasm"];
      var _ts_node_parent_wasm = Module["_ts_node_parent_wasm"] = wasmExports["ts_node_parent_wasm"];
      var _ts_node_child_with_descendant_wasm = Module["_ts_node_child_with_descendant_wasm"] = wasmExports["ts_node_child_with_descendant_wasm"];
      var _ts_node_descendant_for_index_wasm = Module["_ts_node_descendant_for_index_wasm"] = wasmExports["ts_node_descendant_for_index_wasm"];
      var _ts_node_named_descendant_for_index_wasm = Module["_ts_node_named_descendant_for_index_wasm"] = wasmExports["ts_node_named_descendant_for_index_wasm"];
      var _ts_node_descendant_for_position_wasm = Module["_ts_node_descendant_for_position_wasm"] = wasmExports["ts_node_descendant_for_position_wasm"];
      var _ts_node_named_descendant_for_position_wasm = Module["_ts_node_named_descendant_for_position_wasm"] = wasmExports["ts_node_named_descendant_for_position_wasm"];
      var _ts_node_start_point_wasm = Module["_ts_node_start_point_wasm"] = wasmExports["ts_node_start_point_wasm"];
      var _ts_node_end_point_wasm = Module["_ts_node_end_point_wasm"] = wasmExports["ts_node_end_point_wasm"];
      var _ts_node_start_index_wasm = Module["_ts_node_start_index_wasm"] = wasmExports["ts_node_start_index_wasm"];
      var _ts_node_end_index_wasm = Module["_ts_node_end_index_wasm"] = wasmExports["ts_node_end_index_wasm"];
      var _ts_node_to_string_wasm = Module["_ts_node_to_string_wasm"] = wasmExports["ts_node_to_string_wasm"];
      var _ts_node_children_wasm = Module["_ts_node_children_wasm"] = wasmExports["ts_node_children_wasm"];
      var _ts_node_named_children_wasm = Module["_ts_node_named_children_wasm"] = wasmExports["ts_node_named_children_wasm"];
      var _ts_node_descendants_of_type_wasm = Module["_ts_node_descendants_of_type_wasm"] = wasmExports["ts_node_descendants_of_type_wasm"];
      var _ts_node_is_named_wasm = Module["_ts_node_is_named_wasm"] = wasmExports["ts_node_is_named_wasm"];
      var _ts_node_has_changes_wasm = Module["_ts_node_has_changes_wasm"] = wasmExports["ts_node_has_changes_wasm"];
      var _ts_node_has_error_wasm = Module["_ts_node_has_error_wasm"] = wasmExports["ts_node_has_error_wasm"];
      var _ts_node_is_error_wasm = Module["_ts_node_is_error_wasm"] = wasmExports["ts_node_is_error_wasm"];
      var _ts_node_is_missing_wasm = Module["_ts_node_is_missing_wasm"] = wasmExports["ts_node_is_missing_wasm"];
      var _ts_node_is_extra_wasm = Module["_ts_node_is_extra_wasm"] = wasmExports["ts_node_is_extra_wasm"];
      var _ts_node_parse_state_wasm = Module["_ts_node_parse_state_wasm"] = wasmExports["ts_node_parse_state_wasm"];
      var _ts_node_next_parse_state_wasm = Module["_ts_node_next_parse_state_wasm"] = wasmExports["ts_node_next_parse_state_wasm"];
      var _ts_query_matches_wasm = Module["_ts_query_matches_wasm"] = wasmExports["ts_query_matches_wasm"];
      var _ts_query_captures_wasm = Module["_ts_query_captures_wasm"] = wasmExports["ts_query_captures_wasm"];
      var _memset = Module["_memset"] = wasmExports["memset"];
      var _memcpy = Module["_memcpy"] = wasmExports["memcpy"];
      var _memmove = Module["_memmove"] = wasmExports["memmove"];
      var _iswalpha = Module["_iswalpha"] = wasmExports["iswalpha"];
      var _iswblank = Module["_iswblank"] = wasmExports["iswblank"];
      var _iswdigit = Module["_iswdigit"] = wasmExports["iswdigit"];
      var _iswlower = Module["_iswlower"] = wasmExports["iswlower"];
      var _iswupper = Module["_iswupper"] = wasmExports["iswupper"];
      var _iswxdigit = Module["_iswxdigit"] = wasmExports["iswxdigit"];
      var _memchr = Module["_memchr"] = wasmExports["memchr"];
      var _strlen = Module["_strlen"] = wasmExports["strlen"];
      var _strcmp = Module["_strcmp"] = wasmExports["strcmp"];
      var _strncat = Module["_strncat"] = wasmExports["strncat"];
      var _strncpy = Module["_strncpy"] = wasmExports["strncpy"];
      var _towlower = Module["_towlower"] = wasmExports["towlower"];
      var _towupper = Module["_towupper"] = wasmExports["towupper"];
      var _setThrew = wasmExports["setThrew"];
      var __emscripten_stack_restore = wasmExports["_emscripten_stack_restore"];
      var __emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"];
      var _emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"];
      var ___wasm_apply_data_relocs = wasmExports["__wasm_apply_data_relocs"];
      Module["setValue"] = setValue;
      Module["getValue"] = getValue;
      Module["UTF8ToString"] = UTF8ToString;
      Module["stringToUTF8"] = stringToUTF8;
      Module["lengthBytesUTF8"] = lengthBytesUTF8;
      Module["AsciiToString"] = AsciiToString;
      Module["stringToUTF16"] = stringToUTF16;
      Module["loadWebAssemblyModule"] = loadWebAssemblyModule;
      function callMain(args2 = []) {
        var entryFunction = resolveGlobalSymbol("main").sym;
        if (!entryFunction)
          return;
        args2.unshift(thisProgram);
        var argc = args2.length;
        var argv = stackAlloc((argc + 1) * 4);
        var argv_ptr = argv;
        args2.forEach((arg) => {
          LE_HEAP_STORE_U32((argv_ptr >> 2) * 4, stringToUTF8OnStack(arg));
          argv_ptr += 4;
        });
        LE_HEAP_STORE_U32((argv_ptr >> 2) * 4, 0);
        try {
          var ret = entryFunction(argc, argv);
          exitJS(ret, true);
          return ret;
        } catch (e) {
          return handleException(e);
        }
      }
      __name(callMain, "callMain");
      function run(args2 = arguments_) {
        if (runDependencies > 0) {
          dependenciesFulfilled = run;
          return;
        }
        preRun();
        if (runDependencies > 0) {
          dependenciesFulfilled = run;
          return;
        }
        function doRun() {
          Module["calledRun"] = true;
          if (ABORT)
            return;
          initRuntime();
          preMain();
          readyPromiseResolve(Module);
          Module["onRuntimeInitialized"]?.();
          var noInitialRun = Module["noInitialRun"];
          if (!noInitialRun)
            callMain(args2);
          postRun();
        }
        __name(doRun, "doRun");
        if (Module["setStatus"]) {
          Module["setStatus"]("Running...");
          setTimeout(() => {
            setTimeout(() => Module["setStatus"](""), 1);
            doRun();
          }, 1);
        } else {
          doRun();
        }
      }
      __name(run, "run");
      if (Module["preInit"]) {
        if (typeof Module["preInit"] == "function")
          Module["preInit"] = [Module["preInit"]];
        while (Module["preInit"].length > 0) {
          Module["preInit"].pop()();
        }
      }
      run();
      moduleRtn = readyPromise;
      return moduleRtn;
    };
  })();
  tree_sitter_default = Module2;
  __name(initializeBinding, "initializeBinding");
  __name(checkModule, "checkModule");
  Parser = class {
    static {
      __name(this, "Parser");
    }
    [0] = 0;
    [1] = 0;
    logCallback = null;
    language = null;
    static async init(moduleOptions) {
      setModule(await initializeBinding(moduleOptions));
      TRANSFER_BUFFER = C._ts_init();
      LANGUAGE_VERSION = C.getValue(TRANSFER_BUFFER, "i32");
      MIN_COMPATIBLE_VERSION = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    }
    constructor() {
      this.initialize();
    }
    initialize() {
      if (!checkModule()) {
        throw new Error("cannot construct a Parser before calling `init()`");
      }
      C._ts_parser_new_wasm();
      this[0] = C.getValue(TRANSFER_BUFFER, "i32");
      this[1] = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    }
    delete() {
      C._ts_parser_delete(this[0]);
      C._free(this[1]);
      this[0] = 0;
      this[1] = 0;
    }
    setLanguage(language) {
      let address;
      if (!language) {
        address = 0;
        this.language = null;
      } else if (language.constructor === Language) {
        address = language[0];
        const version = C._ts_language_version(address);
        if (version < MIN_COMPATIBLE_VERSION || LANGUAGE_VERSION < version) {
          throw new Error(`Incompatible language version ${version}. Compatibility range ${MIN_COMPATIBLE_VERSION} through ${LANGUAGE_VERSION}.`);
        }
        this.language = language;
      } else {
        throw new Error("Argument must be a Language");
      }
      C._ts_parser_set_language(this[0], address);
      return this;
    }
    parse(callback, oldTree, options) {
      if (typeof callback === "string") {
        C.currentParseCallback = (index) => callback.slice(index);
      } else if (typeof callback === "function") {
        C.currentParseCallback = callback;
      } else {
        throw new Error("Argument must be a string or a function");
      }
      if (options?.progressCallback) {
        C.currentProgressCallback = options.progressCallback;
      } else {
        C.currentProgressCallback = null;
      }
      if (this.logCallback) {
        C.currentLogCallback = this.logCallback;
        C._ts_parser_enable_logger_wasm(this[0], 1);
      } else {
        C.currentLogCallback = null;
        C._ts_parser_enable_logger_wasm(this[0], 0);
      }
      let rangeCount = 0;
      let rangeAddress = 0;
      if (options?.includedRanges) {
        rangeCount = options.includedRanges.length;
        rangeAddress = C._calloc(rangeCount, SIZE_OF_RANGE);
        let address = rangeAddress;
        for (let i2 = 0;i2 < rangeCount; i2++) {
          marshalRange(address, options.includedRanges[i2]);
          address += SIZE_OF_RANGE;
        }
      }
      const treeAddress = C._ts_parser_parse_wasm(this[0], this[1], oldTree ? oldTree[0] : 0, rangeAddress, rangeCount);
      if (!treeAddress) {
        C.currentParseCallback = null;
        C.currentLogCallback = null;
        C.currentProgressCallback = null;
        return null;
      }
      if (!this.language) {
        throw new Error("Parser must have a language to parse");
      }
      const result = new Tree(INTERNAL, treeAddress, this.language, C.currentParseCallback);
      C.currentParseCallback = null;
      C.currentLogCallback = null;
      C.currentProgressCallback = null;
      return result;
    }
    reset() {
      C._ts_parser_reset(this[0]);
    }
    getIncludedRanges() {
      C._ts_parser_included_ranges_wasm(this[0]);
      const count = C.getValue(TRANSFER_BUFFER, "i32");
      const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const result = new Array(count);
      if (count > 0) {
        let address = buffer;
        for (let i2 = 0;i2 < count; i2++) {
          result[i2] = unmarshalRange(address);
          address += SIZE_OF_RANGE;
        }
        C._free(buffer);
      }
      return result;
    }
    getTimeoutMicros() {
      return C._ts_parser_timeout_micros(this[0]);
    }
    setTimeoutMicros(timeout) {
      C._ts_parser_set_timeout_micros(this[0], 0, timeout);
    }
    setLogger(callback) {
      if (!callback) {
        this.logCallback = null;
      } else if (typeof callback !== "function") {
        throw new Error("Logger callback must be a function");
      } else {
        this.logCallback = callback;
      }
      return this;
    }
    getLogger() {
      return this.logCallback;
    }
  };
});

// src/storage/sqlite-open.ts
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { dirname } from "path";
function deleteDatabaseFiles(dbPath) {
  try {
    unlinkSync(dbPath);
  } catch {}
  try {
    unlinkSync(dbPath + "-wal");
  } catch {}
  try {
    unlinkSync(dbPath + "-shm");
  } catch {}
}
function isCorruptionMessage(errorMsg) {
  return errorMsg.includes("database disk image is malformed") || errorMsg.includes("corrupt") || errorMsg.includes("SQLITE_CORRUPT") || errorMsg.includes("file is not a database");
}
function applyPragmas(db, pragmas) {
  for (const p of pragmas)
    db.run(p);
}
function createFreshDatabase(dbPath, options) {
  if (options.ensureParentDir) {
    const parentDir = dirname(dbPath);
    if (parentDir && parentDir !== "." && parentDir !== "/") {
      mkdirSync(parentDir, { recursive: true });
    }
  }
  const freshDb = new Database(dbPath);
  applyPragmas(freshDb, options.pragmas);
  options.bootstrap(freshDb);
  return freshDb;
}
function openSqliteWithIntegrityGuard(dbPath, options) {
  options.preOpenCleanup?.(dbPath);
  let db = null;
  let needsBootstrap = false;
  try {
    db = new Database(dbPath);
    applyPragmas(db, options.pragmas);
    const integrityResult = db.prepare("PRAGMA integrity_check").get();
    if (integrityResult.integrity_check !== "ok") {
      db.close();
      console.error(`${options.label} corruption detected at ${dbPath}: ${integrityResult.integrity_check}`);
      deleteDatabaseFiles(dbPath);
      needsBootstrap = true;
      db = null;
    }
    if (db && options.validate) {
      try {
        options.validate(db);
      } catch (validateErr) {
        db.close();
        const msg = validateErr instanceof Error ? validateErr.message : String(validateErr);
        console.error(`${options.label} validation failed at ${dbPath}: ${msg}`);
        deleteDatabaseFiles(dbPath);
        needsBootstrap = true;
        db = null;
      }
    }
  } catch (err2) {
    const errorMsg = err2 instanceof Error ? err2.message : String(err2);
    console.error(`${options.label} open failed at ${dbPath}: ${errorMsg}`);
    if (db) {
      try {
        db.close();
      } catch {}
      db = null;
    }
    if (isCorruptionMessage(errorMsg)) {
      deleteDatabaseFiles(dbPath);
      needsBootstrap = true;
    } else {
      throw err2;
    }
  }
  if (needsBootstrap || db === null) {
    return createFreshDatabase(dbPath, options);
  }
  options.bootstrap(db);
  return db;
}
function cleanupOrphanedShmFile(dbPath) {
  try {
    const shmPath = dbPath + "-shm";
    const walPath = dbPath + "-wal";
    if (existsSync(shmPath) && !existsSync(walPath)) {
      console.debug(`Removing orphaned SHM file for ${dbPath}`);
      try {
        unlinkSync(shmPath);
      } catch {}
    }
  } catch {}
}

// src/graph/database.ts
var databaseInstances = new Map;
var GRAPH_PRAGMAS = [
  "PRAGMA journal_mode=WAL",
  "PRAGMA busy_timeout=5000",
  "PRAGMA synchronous=NORMAL",
  "PRAGMA foreign_keys=ON"
];
function validateGraphDatabase(db) {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  if (tables.some((t) => t.name === "files")) {
    db.prepare("SELECT COUNT(*) as c FROM files").get();
  }
}
function openGraphDatabase(dbPath) {
  return openSqliteWithIntegrityGuard(dbPath, {
    label: "Graph database",
    pragmas: GRAPH_PRAGMAS,
    bootstrap: createTables,
    validate: validateGraphDatabase,
    preOpenCleanup: cleanupOrphanedShmFile
  });
}
function createTables(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL UNIQUE,
      mtime_ms INTEGER NOT NULL,
      language TEXT NOT NULL,
      line_count INTEGER NOT NULL,
      symbol_count INTEGER NOT NULL DEFAULT 0,
      pagerank REAL NOT NULL DEFAULT 0,
      is_barrel INTEGER NOT NULL DEFAULT 0,
      indexed_at INTEGER NOT NULL
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_files_path ON files(path)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_files_language ON files(language)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_files_pagerank ON files(pagerank DESC)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS symbols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      line INTEGER NOT NULL,
      end_line INTEGER NOT NULL,
      is_exported INTEGER NOT NULL DEFAULT 0,
      signature TEXT,
      qualified_name TEXT,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbols_file_id ON symbols(file_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbols_kind ON symbols(kind)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbols_exported ON symbols(is_exported)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS edges (
      source_file_id INTEGER NOT NULL,
      target_file_id INTEGER NOT NULL,
      weight REAL NOT NULL DEFAULT 1,
      confidence REAL NOT NULL DEFAULT 1,
      PRIMARY KEY (source_file_id, target_file_id),
      FOREIGN KEY (source_file_id) REFERENCES files(id) ON DELETE CASCADE,
      FOREIGN KEY (target_file_id) REFERENCES files(id) ON DELETE CASCADE
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_file_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_file_id)`);
  const refsInfo = db.prepare("PRAGMA table_info(refs)").all();
  const hasIsDynamic = refsInfo.some((col) => col.name === "is_dynamic");
  if (!hasIsDynamic) {
    db.run("DROP TABLE IF EXISTS refs");
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS refs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      source_file_id INTEGER,
      import_source TEXT NOT NULL,
      is_dynamic INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
      FOREIGN KEY (source_file_id) REFERENCES files(id) ON DELETE SET NULL
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_refs_file_id ON refs(file_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_refs_source_file_id ON refs(source_file_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_refs_import_source ON refs(import_source)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_refs_name ON refs(name)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS entrypoints (
      file_id INTEGER PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
      reason TEXT NOT NULL
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entrypoints_file_id ON entrypoints(file_id)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caller_symbol_id INTEGER NOT NULL,
      callee_name TEXT NOT NULL,
      callee_symbol_id INTEGER,
      callee_file_id INTEGER,
      line INTEGER NOT NULL,
      FOREIGN KEY (caller_symbol_id) REFERENCES symbols(id) ON DELETE CASCADE,
      FOREIGN KEY (callee_symbol_id) REFERENCES symbols(id) ON DELETE SET NULL,
      FOREIGN KEY (callee_file_id) REFERENCES files(id) ON DELETE SET NULL
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_calls_caller ON calls(caller_symbol_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_calls_callee_name ON calls(callee_name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_calls_callee_file ON calls(callee_file_id)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS cochanges (
      file_id_a INTEGER NOT NULL,
      file_id_b INTEGER NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (file_id_a, file_id_b),
      FOREIGN KEY (file_id_a) REFERENCES files(id) ON DELETE CASCADE,
      FOREIGN KEY (file_id_b) REFERENCES files(id) ON DELETE CASCADE
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS external_imports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL,
      package TEXT NOT NULL,
      specifiers TEXT NOT NULL,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_external_imports_file_id ON external_imports(file_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_external_imports_package ON external_imports(package)`);
  const tableInfo = db.prepare("PRAGMA table_info(semantic_summaries)").all();
  const hasOldSchema = tableInfo.some((col) => col.name === "id" && col.pk === 1);
  const hasNewSchema = tableInfo.length > 0 && !hasOldSchema;
  if (hasOldSchema) {
    db.run(`DROP TABLE IF EXISTS semantic_summaries`);
  }
  if (!hasNewSchema) {
    db.run(`
      CREATE TABLE semantic_summaries (
        symbol_id INTEGER NOT NULL,
        source TEXT NOT NULL,
        summary TEXT NOT NULL,
        file_mtime INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        symbol_name TEXT NOT NULL,
        PRIMARY KEY (symbol_id, source),
        FOREIGN KEY (symbol_id) REFERENCES symbols(id) ON DELETE CASCADE
      )
    `);
  }
  db.run(`CREATE INDEX IF NOT EXISTS idx_semantic_summaries_symbol_id ON semantic_summaries(symbol_id)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS shape_hashes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      line INTEGER NOT NULL,
      end_line INTEGER NOT NULL,
      shape_hash TEXT NOT NULL,
      node_count INTEGER NOT NULL,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_shape_hashes_file_id ON shape_hashes(file_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_shape_hashes_shape_hash ON shape_hashes(shape_hash)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS token_signatures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      line INTEGER NOT NULL,
      end_line INTEGER NOT NULL,
      minhash BLOB NOT NULL,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_token_signatures_file_id ON token_signatures(file_id)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS token_fragments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      file_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      line INTEGER NOT NULL,
      token_offset INTEGER NOT NULL,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_token_fragments_hash ON token_fragments(hash)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_token_fragments_file_id ON token_fragments(file_id)`);
  const ftsInfo = db.prepare("SELECT sql FROM sqlite_master WHERE name='symbols_fts'").get();
  let shouldRebuildFts = ftsInfo?.sql?.includes("content='symbols'") ?? false;
  if (!shouldRebuildFts && ftsInfo) {
    const symbolCount = db.prepare("SELECT COUNT(*) as count FROM symbols").get();
    const ftsCount = db.prepare("SELECT COUNT(*) as count FROM symbols_fts").get();
    if (symbolCount.count !== ftsCount.count) {
      shouldRebuildFts = true;
    }
  }
  if (shouldRebuildFts) {
    db.run("DROP TABLE IF EXISTS symbols_fts");
  }
  db.run(`
    CREATE VIRTUAL TABLE IF NOT EXISTS symbols_fts USING fts5(
      name,
      path,
      kind
    )
  `);
  db.run("DROP TRIGGER IF EXISTS symbols_ai");
  db.run("DROP TRIGGER IF EXISTS symbols_ad");
  db.run("DROP TRIGGER IF EXISTS symbols_au");
  db.run(`
    CREATE TRIGGER symbols_ai AFTER INSERT ON symbols BEGIN
      INSERT INTO symbols_fts(rowid, name, path, kind)
      VALUES (new.id, new.name, (SELECT path FROM files WHERE id = new.file_id), new.kind);
    END
  `);
  db.run(`
    CREATE TRIGGER symbols_ad AFTER DELETE ON symbols BEGIN
      DELETE FROM symbols_fts WHERE rowid = old.id;
    END
  `);
  db.run(`
    CREATE TRIGGER symbols_au AFTER UPDATE ON symbols BEGIN
      DELETE FROM symbols_fts WHERE rowid = old.id;
      INSERT INTO symbols_fts(rowid, name, path, kind)
      VALUES (new.id, new.name, (SELECT path FROM files WHERE id = new.file_id), new.kind);
    END
  `);
}

// src/graph/rpc.ts
import { EventEmitter } from "events";
var RPC_TIMEOUT_MS = parseInt(process.env.GRAPH_RPC_TIMEOUT_MS ?? "120000", 10);

class RpcClient extends EventEmitter {
  logger;
  worker;
  pendingCalls = new Map;
  callId = 0;
  workerTerminated = false;
  workerError = null;
  constructor(worker, logger) {
    super();
    this.logger = logger;
    this.worker = worker;
    this.setupWorkerHandlers();
  }
  setupWorkerHandlers() {
    this.worker.onmessage = (event) => {
      this.handleMessage(event.data);
    };
    this.worker.onerror = (error) => {
      this.workerError = error instanceof Error ? error : new Error(error.message || "Worker error");
      this.logger?.error("Worker error occurred", this.workerError);
      this.rejectAllPending(new Error(`Worker error: ${this.workerError.message}`));
      this.emit("error", error);
    };
    this.worker.addEventListener("messageerror", () => {
      this.workerTerminated = true;
      this.logger?.error("Worker message error - worker may be terminated");
      this.rejectAllPending(new Error("Worker terminated"));
    });
  }
  rejectAllPending(error) {
    for (const [, pending] of this.pendingCalls.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.pendingCalls.clear();
  }
  handleMessage(data) {
    if (data && typeof data === "object" && "callId" in data) {
      const msg = data;
      if (msg.event) {
        this.emit(msg.event, msg.payload);
        return;
      }
      const pending = this.pendingCalls.get(msg.callId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingCalls.delete(msg.callId);
        if (msg.error) {
          pending.reject(new Error(msg.error));
        } else {
          pending.resolve(msg.result);
        }
      }
    }
  }
  async call(method, args2) {
    if (this.workerTerminated) {
      throw new Error("Worker has been terminated");
    }
    if (this.workerError) {
      throw new Error(`Worker error: ${this.workerError.message}`);
    }
    const callId = ++this.callId;
    const message = { callId, method, args: args2 };
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingCalls.delete(callId);
        reject(new Error(`RPC call '${method}' timed out after ${RPC_TIMEOUT_MS}ms`));
      }, RPC_TIMEOUT_MS);
      this.pendingCalls.set(callId, { resolve, reject, timeout });
      try {
        this.worker.postMessage(message);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingCalls.delete(callId);
        this.workerTerminated = true;
        const postError = error instanceof Error ? error : new Error(String(error));
        this.workerError = postError;
        this.logger?.error("Failed to post message to worker", postError);
        this.rejectAllPending(postError);
        reject(postError);
      }
    });
  }
  terminate() {
    this.workerTerminated = true;
    this.worker.terminate();
  }
  isHealthy() {
    return !this.workerTerminated && this.workerError === null;
  }
  markTerminated() {
    this.workerTerminated = true;
    this.rejectAllPending(new Error("Worker terminated"));
  }
}

class RpcServer {
  handlers = new Map;
  register(method, handler) {
    this.handlers.set(method, handler);
  }
  async handle(message, postResponse) {
    if (!message || typeof message !== "object")
      return;
    const msg = message;
    const { callId, method, args: args2 } = msg;
    try {
      const handler = this.handlers.get(method);
      if (!handler) {
        throw new Error(`Unknown method: ${method}`);
      }
      const result = await handler(args2);
      postResponse({ callId, result });
    } catch (error) {
      postResponse({
        callId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  emit(_event, _payload) {}
}

// src/graph/repo-map.ts
import { resolve as resolve2, join as join3, dirname as dirname3, extname as extname2, relative } from "path";
import { existsSync as existsSync3, statSync } from "fs";

// src/graph/tree-sitter.ts
import { existsSync as existsSync2 } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname as dirname2, join, resolve } from "node:path";

// src/graph/types.ts
var EXT_TO_LANGUAGE = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".mts": "typescript",
  ".cts": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".py": "python",
  ".pyw": "python",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".c": "c",
  ".h": "c",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".cxx": "cpp",
  ".hpp": "cpp",
  ".hh": "cpp",
  ".hxx": "cpp",
  ".cs": "csharp",
  ".rb": "ruby",
  ".erb": "ruby",
  ".php": "php",
  ".swift": "swift",
  ".kt": "kotlin",
  ".kts": "kotlin",
  ".scala": "scala",
  ".sc": "scala",
  ".lua": "lua",
  ".ex": "elixir",
  ".exs": "elixir",
  ".dart": "dart",
  ".zig": "zig",
  ".sh": "bash",
  ".bash": "bash",
  ".zsh": "bash",
  ".ml": "ocaml",
  ".mli": "ocaml",
  ".m": "objc",
  ".css": "css",
  ".scss": "css",
  ".less": "css",
  ".html": "html",
  ".htm": "html",
  ".json": "json",
  ".jsonc": "json",
  ".toml": "toml",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".dockerfile": "dockerfile",
  ".vue": "vue",
  ".res": "rescript",
  ".resi": "rescript",
  ".sol": "solidity",
  ".tla": "tlaplus",
  ".el": "elisp"
};
function detectLanguageFromPath(file) {
  const dot = file.lastIndexOf(".");
  if (dot === -1) {
    const name2 = file.slice(file.lastIndexOf("/") + 1);
    if (name2 === "Dockerfile" || name2.startsWith("Dockerfile."))
      return "dockerfile";
    return "unknown";
  }
  return EXT_TO_LANGUAGE[file.slice(dot).toLowerCase()] ?? "unknown";
}

// src/graph/tree-sitter.ts
var QUERIES = {
  typescript: `
    (function_declaration name: (identifier) @name) @func
    (export_statement (function_declaration name: (identifier) @name)) @func
    (class_declaration name: (type_identifier) @name) @class
    (method_definition name: (property_identifier) @name) @method
    (interface_declaration name: (type_identifier) @name) @iface
    (type_alias_declaration name: (type_identifier) @name) @type
    (lexical_declaration (variable_declarator name: (identifier) @name)) @var
    (import_statement source: (string) @source) @import
    (call_expression
      function: (import)
      arguments: (arguments (string) @source)) @dynamic_import
    (export_statement) @export
  `,
  javascript: `
    (function_declaration name: (identifier) @name) @func
    (class_declaration name: (identifier) @name) @class
    (method_definition name: (property_identifier) @name) @method
    (lexical_declaration (variable_declarator name: (identifier) @name)) @var
    (import_statement source: (string) @source) @import
    (call_expression
      function: (import)
      arguments: (arguments (string) @source)) @dynamic_import
    (export_statement) @export
  `,
  python: `
    (function_definition name: (identifier) @name) @func
    (class_definition name: (identifier) @name) @class
    (class_definition body: (block (function_definition name: (identifier) @name) @method))
    (import_statement) @import
    (import_from_statement) @import
  `,
  go: `
    (function_declaration name: (identifier) @name) @func
    (method_declaration name: (field_identifier) @name) @func
    (type_declaration (type_spec name: (type_identifier) @name)) @type
    (import_declaration) @import
  `,
  rust: `
    (function_item name: (identifier) @name) @func
    (struct_item name: (type_identifier) @name) @struct
    (trait_item name: (type_identifier) @name) @trait
    (type_item name: (type_identifier) @name) @type
    (impl_item (declaration_list (function_item name: (identifier) @name) @method))
    (use_declaration) @import
    (impl_item) @impl
  `,
  java: `
    (method_declaration name: (identifier) @name) @func
    (class_declaration name: (identifier) @name) @class
    (interface_declaration name: (identifier) @name) @iface
    (enum_declaration name: (identifier) @name) @type
    (import_declaration) @import
  `,
  c: `
    (function_definition declarator: (function_declarator declarator: (identifier) @name)) @func
    (struct_specifier name: (type_identifier) @name) @struct
    (enum_specifier name: (type_identifier) @name) @type
    (type_definition declarator: (type_identifier) @name) @type
    (preproc_include) @import
  `,
  cpp: `
    (function_definition declarator: (function_declarator declarator: (identifier) @name)) @func
    (class_specifier name: (type_identifier) @name) @class
    (struct_specifier name: (type_identifier) @name) @struct
    (enum_specifier name: (type_identifier) @name) @type
    (namespace_definition name: (namespace_identifier) @name) @type
    (preproc_include) @import
  `,
  csharp: `
    (method_declaration name: (identifier) @name) @func
    (class_declaration name: (identifier) @name) @class
    (interface_declaration name: (identifier) @name) @iface
    (struct_declaration name: (identifier) @name) @struct
    (enum_declaration name: (identifier) @name) @type
    (namespace_declaration name: (identifier) @name) @type
    (using_directive) @import
  `,
  ruby: `
    (method name: (identifier) @name) @func
    (class name: (constant) @name) @class
    (module name: (constant) @name) @type
    (call method: (identifier) @name) @import
  `,
  php: `
    (function_definition name: (name) @name) @func
    (method_declaration name: (name) @name) @func
    (class_declaration name: (name) @name) @class
    (interface_declaration name: (name) @name) @iface
    (trait_declaration name: (name) @name) @trait
    (namespace_use_declaration) @import
  `,
  swift: `
    (function_declaration (simple_identifier) @name) @func
    (class_declaration name: (type_identifier) @name) @class
    (protocol_declaration name: (type_identifier) @name) @iface
    (import_declaration) @import
  `,
  kotlin: `
    (function_declaration (simple_identifier) @name) @func
    (class_declaration (type_identifier) @name) @class
    (object_declaration (type_identifier) @name) @class
    (import_header) @import
  `,
  scala: `
    (function_definition name: (identifier) @name) @func
    (class_definition name: (identifier) @name) @class
    (trait_definition name: (identifier) @name) @trait
    (object_definition name: (identifier) @name) @class
    (import_declaration) @import
  `,
  lua: `
    (function_definition_statement name: (identifier) @name) @func
    (local_function_definition_statement name: (identifier) @name) @func
  `,
  elixir: `
    (call target: (identifier) @name) @func
  `,
  dart: `
    (function_signature (identifier) @name) @func
    (class_definition name: (identifier) @name) @class
    (enum_declaration name: (identifier) @name) @type
    (mixin_declaration name: (identifier) @name) @class
    (import_or_export) @import
  `,
  zig: `
    (function_declaration name: (identifier) @name) @func
    (variable_declaration name: (identifier) @name) @var
  `,
  bash: `
    (function_definition name: (word) @name) @func
  `,
  ocaml: `
    (value_definition (let_binding pattern: (value_name) @name)) @func
    (type_definition (type_binding name: (type_constructor) @name)) @type
    (module_definition (module_binding name: (module_name) @name)) @type
    (open_module) @import
  `,
  objc: `
    (function_definition declarator: (function_declarator declarator: (identifier) @name)) @func
    (class_interface . (identifier) @name) @class
    (protocol_declaration . (identifier) @name) @iface
    (preproc_include) @import
  `,
  css: `
    (rule_set (selectors) @name) @var
    (keyframes_statement (keyframes_name) @name) @type
  `,
  html: `
    (element (start_tag (tag_name) @name)) @var
  `,
  vue: `
    (element (start_tag (tag_name) @name)) @var
  `,
  rescript: `
    (let_declaration (let_binding pattern: (value_identifier) @name)) @func
    (type_declaration (type_binding name: (type_identifier) @name)) @type
    (module_declaration (module_binding name: (module_identifier) @name)) @type
  `,
  solidity: `
    (contract_declaration name: (identifier) @name) @class
    (function_definition name: (identifier) @name) @func
    (event_definition name: (identifier) @name) @type
    (struct_declaration name: (identifier) @name) @struct
    (enum_declaration name: (identifier) @name) @type
    (import_directive) @import
  `,
  tlaplus: `
    (operator_definition name: (identifier) @name) @func
    (function_definition name: (identifier) @name) @func
  `,
  elisp: `
    (function_definition name: (symbol) @name) @func
    (special_form . (symbol) @name) @var
  `
};
var GRAMMAR_FILES = {
  tsx: "tree-sitter-tsx.wasm",
  javascript: "tree-sitter-javascript.wasm",
  python: "tree-sitter-python.wasm",
  go: "tree-sitter-go.wasm",
  rust: "tree-sitter-rust.wasm",
  java: "tree-sitter-java.wasm",
  c: "tree-sitter-c.wasm",
  cpp: "tree-sitter-cpp.wasm",
  csharp: "tree-sitter-c_sharp.wasm",
  ruby: "tree-sitter-ruby.wasm",
  php: "tree-sitter-php.wasm",
  swift: "tree-sitter-swift.wasm",
  kotlin: "tree-sitter-kotlin.wasm",
  scala: "tree-sitter-scala.wasm",
  lua: "tree-sitter-lua.wasm",
  elixir: "tree-sitter-elixir.wasm",
  dart: "tree-sitter-dart.wasm",
  zig: "tree-sitter-zig.wasm",
  bash: "tree-sitter-bash.wasm",
  ocaml: "tree-sitter-ocaml.wasm",
  objc: "tree-sitter-objc.wasm",
  css: "tree-sitter-css.wasm",
  html: "tree-sitter-html.wasm",
  json: "tree-sitter-json.wasm",
  toml: "tree-sitter-toml.wasm",
  vue: "tree-sitter-vue.wasm",
  rescript: "tree-sitter-rescript.wasm",
  solidity: "tree-sitter-solidity.wasm",
  tlaplus: "tree-sitter-tlaplus.wasm",
  elisp: "tree-sitter-elisp.wasm"
};
var TSQueryClass = null;
function createQuery(lang, source) {
  if (!TSQueryClass)
    throw new Error("tree-sitter not initialized");
  return new TSQueryClass(lang, source);
}

class TreeSitterBackend {
  parser = null;
  languages = new Map;
  failedLanguages = new Set;
  initPromise = null;
  cache = null;
  treeCache = new Map;
  treeCacheMaxSize = 50;
  supportsLanguage(language) {
    const key = language === "typescript" ? "tsx" : language;
    return key in GRAMMAR_FILES;
  }
  setCache(cache) {
    this.cache = cache;
  }
  async initialize(_cwd) {
    if (this.parser)
      return;
    if (this.initPromise)
      return this.initPromise;
    this.initPromise = this.doInit();
    return this.initPromise;
  }
  dispose() {
    for (const entry of this.treeCache.values()) {
      entry.tree.delete();
    }
    this.treeCache.clear();
    this.parser?.delete();
    this.parser = null;
    this.languages.clear();
    this.initPromise = null;
  }
  async getFileOutline(file) {
    const tree = await this.parseFile(file);
    if (!tree)
      return null;
    const language = this.detectLang(file);
    const tsLang = this.languages.get(this.grammarKeyForFile(file));
    if (!tsLang) {
      tree.delete();
      return null;
    }
    const symbols = [];
    const imports = [];
    const exports = [];
    const absFile = resolve(file);
    const mainQueryStr = QUERIES[language];
    if (mainQueryStr) {
      const mainQuery = createQuery(tsLang, mainQueryStr);
      try {
        const matches = mainQuery.matches(tree.rootNode);
        for (const match of matches) {
          const nameCapture = match.captures.find((c) => c.name === "name");
          const sourceCapture = match.captures.find((c) => c.name === "source");
          const patternCapture = match.captures.find((c) => c.name !== "name" && c.name !== "source");
          if (patternCapture?.name === "import") {
            const node = patternCapture.node;
            const source = sourceCapture ? sourceCapture.node.text.replace(/['"]/g, "") : node.text;
            const hasTopLevelType = node.children.some((c) => c?.type === "type");
            const { specifiers, allSpecifiersAreType } = extractImportSpecifiersWithTypes(node, language);
            const isDefault = specifiers.length > 0 && node.text.includes("import ") && !node.text.includes("{") && !node.text.includes("*");
            const isNamespace = node.text.includes("* as ");
            imports.push({
              source,
              specifiers,
              isDefault,
              isNamespace,
              isTypeOnly: hasTopLevelType || allSpecifiersAreType,
              isDynamic: false,
              location: {
                file: absFile,
                line: node.startPosition.row + 1,
                column: node.startPosition.column + 1,
                endLine: node.endPosition.row + 1
              }
            });
            continue;
          }
          if (patternCapture?.name === "dynamic_import") {
            const node = patternCapture.node;
            const source = sourceCapture ? sourceCapture.node.text.replace(/['"]/g, "") : node.text;
            imports.push({
              source,
              specifiers: [],
              isDefault: false,
              isNamespace: false,
              isTypeOnly: false,
              isDynamic: true,
              location: {
                file: absFile,
                line: node.startPosition.row + 1,
                column: node.startPosition.column + 1,
                endLine: node.endPosition.row + 1
              }
            });
            continue;
          }
          if (patternCapture?.name === "export") {
            const node = patternCapture.node;
            const isDefault = node.text.includes("export default");
            const decl = node.namedChildren.find((c) => c != null && (c.type === "function_declaration" || c.type === "class_declaration" || c.type === "interface_declaration" || c.type === "type_alias_declaration" || c.type === "lexical_declaration"));
            if (decl) {
              const expNameNode = decl.childForFieldName("name") ?? decl.namedChildren.find((c) => c != null && c.type === "variable_declarator")?.childForFieldName("name");
              if (expNameNode) {
                let kind = "variable";
                if (decl.type.includes("function"))
                  kind = "function";
                else if (decl.type.includes("class"))
                  kind = "class";
                else if (decl.type.includes("interface"))
                  kind = "interface";
                else if (decl.type.includes("type"))
                  kind = "type";
                exports.push({
                  name: expNameNode.text,
                  isDefault,
                  kind,
                  location: {
                    file: absFile,
                    line: node.startPosition.row + 1,
                    column: node.startPosition.column + 1,
                    endLine: node.endPosition.row + 1
                  }
                });
              }
            }
            continue;
          }
          if (nameCapture) {
            const kind = this.captureToKind(patternCapture?.name ?? "unknown");
            const declNode = patternCapture?.node ?? nameCapture.node.parent ?? nameCapture.node;
            const symbol = {
              name: nameCapture.node.text,
              kind,
              location: {
                file: absFile,
                line: nameCapture.node.startPosition.row + 1,
                column: nameCapture.node.startPosition.column + 1,
                endLine: declNode.endPosition.row + 1
              }
            };
            const isDuplicate = symbols.some((s) => s.name === symbol.name && s.kind === symbol.kind && s.location.line === symbol.location.line && s.location.column === symbol.location.column && s.location.endLine === symbol.location.endLine);
            if (!isDuplicate) {
              symbols.push(symbol);
            }
          }
        }
      } finally {
        mainQuery.delete();
      }
    }
    tree.delete();
    if (exports.length === 0 && language !== "typescript" && language !== "javascript") {
      const content = await this.readFileContent(file);
      if (content) {
        const lines = content.split(`
`);
        for (const sym of symbols) {
          const line = lines[sym.location.line - 1] ?? "";
          if (isPublicSymbol(sym.name, line, language, file)) {
            exports.push({
              name: sym.name,
              isDefault: false,
              kind: sym.kind,
              location: sym.location
            });
          }
        }
      }
    }
    return {
      file: absFile,
      language,
      symbols,
      imports,
      exports
    };
  }
  static MIN_HASH_LINES = 5;
  static HASHABLE_KEYWORDS = [
    "function",
    "method",
    "class",
    "impl",
    "struct",
    "trait",
    "module",
    "constructor"
  ];
  static isHashableType(nodeType) {
    return TreeSitterBackend.HASHABLE_KEYWORDS.some((kw) => nodeType.includes(kw));
  }
  serializeShape(node, depth) {
    if (depth > 40)
      return node.type;
    const childCount = node.namedChildCount;
    if (childCount === 0)
      return node.type;
    const children = [];
    for (let i2 = 0;i2 < childCount; i2++) {
      const child = node.namedChild(i2);
      if (child)
        children.push(this.serializeShape(child, depth + 1));
    }
    return `${node.type}(${children.join(",")})`;
  }
  countNodes(node, depth) {
    if (depth > 40)
      return 1;
    let count = 1;
    const childCount = node.namedChildCount;
    for (let i2 = 0;i2 < childCount; i2++) {
      const child = node.namedChild(i2);
      if (child)
        count += this.countNodes(child, depth + 1);
    }
    return count;
  }
  extractNodeName(node) {
    const nameNode = node.childForFieldName("name");
    if (nameNode)
      return nameNode.text;
    if (node.type === "arrow_function" || node.type === "function_expression") {
      const parent = node.parent;
      if (parent?.type === "variable_declarator") {
        const varName = parent.childForFieldName("name");
        if (varName)
          return varName.text;
      }
      if (parent?.type === "pair" || parent?.type === "property") {
        const key = parent.childForFieldName("key");
        if (key)
          return key.text;
      }
    }
    if (node.type === "lexical_declaration" || node.type === "variable_declaration") {
      const declarator = node.namedChildren.find((c) => c != null && c.type === "variable_declarator");
      if (declarator) {
        const varName = declarator.childForFieldName("name");
        if (varName)
          return varName.text;
      }
    }
    return "(anonymous)";
  }
  collectHashableNodes(node, results, depth) {
    if (depth > 10)
      return;
    if (TreeSitterBackend.isHashableType(node.type)) {
      const lines = node.endPosition.row - node.startPosition.row + 1;
      if (lines >= TreeSitterBackend.MIN_HASH_LINES) {
        const name2 = this.extractNodeName(node);
        const kind = node.type.replace(/_declaration|_definition|_item|_statement|_specifier/, "").replace(/^local_/, "");
        results.push({ node, name: name2, kind });
      }
    }
    if (node.type === "lexical_declaration" || node.type === "variable_declaration") {
      const lines = node.endPosition.row - node.startPosition.row + 1;
      if (lines >= TreeSitterBackend.MIN_HASH_LINES) {
        const hasArrow = node.namedChildren.some((c) => {
          if (!c || c.type !== "variable_declarator")
            return false;
          return c.namedChildren.some((gc) => gc != null && (gc.type === "arrow_function" || gc.type === "function_expression"));
        });
        if (hasArrow) {
          const name2 = this.extractNodeName(node);
          results.push({ node, name: name2, kind: "function" });
        }
      }
    }
    const childCount = node.namedChildCount;
    for (let i2 = 0;i2 < childCount; i2++) {
      const child = node.namedChild(i2);
      if (child)
        this.collectHashableNodes(child, results, depth + 1);
    }
  }
  async getShapeHashes(file) {
    const tree = await this.parseFile(file);
    if (!tree)
      return null;
    try {
      const nodes = [];
      this.collectHashableNodes(tree.rootNode, nodes, 0);
      if (nodes.length === 0)
        return [];
      const results = [];
      for (const { node, name: name2, kind } of nodes) {
        const serialized = this.serializeShape(node, 0);
        const hash = Bun.hash(serialized).toString(16);
        const nodeCount = this.countNodes(node, 0);
        results.push({
          name: name2,
          kind,
          line: node.startPosition.row + 1,
          endLine: node.endPosition.row + 1,
          shapeHash: hash,
          nodeCount
        });
      }
      return results;
    } finally {
      tree.delete();
    }
  }
  async doInit() {
    const wasmPath = this.resolveWasm("tree-sitter.wasm");
    if (!existsSync2(wasmPath)) {
      throw new Error(`tree-sitter.wasm not found`);
    }
    const mod = await Promise.resolve().then(() => (init_tree_sitter(), exports_tree_sitter));
    TSQueryClass = mod.Query;
    const ParserClass = mod.Parser;
    await ParserClass.init({
      locateFile: () => wasmPath
    });
    this.parser = new ParserClass;
  }
  resolveWasm(filename) {
    const basename = filename.split("/").pop() ?? filename;
    let dir = import.meta.dir;
    for (let i2 = 0;i2 < 5; i2++) {
      for (const sub of ["node_modules/web-tree-sitter", "node_modules/tree-sitter-wasms/out"]) {
        const p = join(dir, sub, basename);
        if (existsSync2(p))
          return p;
      }
      const parent = dirname2(dir);
      if (parent === dir)
        break;
      dir = parent;
    }
    throw new Error(`tree-sitter.wasm not found`);
  }
  async loadLanguage(language) {
    const cached = this.languages.get(language);
    if (cached)
      return cached;
    if (this.failedLanguages.has(language))
      return null;
    const wasmFile = GRAMMAR_FILES[language];
    if (!wasmFile)
      return null;
    try {
      const mod = await Promise.resolve().then(() => (init_tree_sitter(), exports_tree_sitter));
      const wasmPath = this.resolveWasm(`tree-sitter-wasms/out/${wasmFile}`);
      const lang = await mod.Language.load(wasmPath);
      if (this.parser) {
        this.parser.setLanguage(lang);
        const tree = this.parser.parse("# validate");
        tree?.delete();
      }
      this.languages.set(language, lang);
      return lang;
    } catch {
      this.failedLanguages.add(language);
      return null;
    }
  }
  async parseFile(file) {
    if (!this.parser)
      return null;
    const absPath = resolve(file);
    const content = await this.readFileContent(absPath);
    if (!content)
      return null;
    const cached = this.treeCache.get(absPath);
    if (cached && cached.content === content) {
      return cached.tree.copy();
    }
    const grammarKey = this.grammarKeyForFile(file);
    const lang = await this.loadLanguage(grammarKey);
    if (!lang)
      return null;
    this.parser.setLanguage(lang);
    let tree;
    try {
      tree = this.parser.parse(content);
    } catch {
      this.failedLanguages.add(grammarKey);
      this.languages.delete(grammarKey);
      return null;
    }
    if (!tree)
      return null;
    if (cached)
      cached.tree.delete();
    if (this.treeCache.size >= this.treeCacheMaxSize) {
      const firstKey = this.treeCache.keys().next().value;
      if (firstKey) {
        this.treeCache.get(firstKey)?.tree.delete();
        this.treeCache.delete(firstKey);
      }
    }
    this.treeCache.set(absPath, { tree: tree.copy(), content });
    return tree;
  }
  async readFileContent(file) {
    const absPath = resolve(file);
    if (this.cache) {
      return this.cache.get(absPath);
    }
    try {
      return await readFile(absPath, "utf-8");
    } catch {
      return null;
    }
  }
  detectLang(file) {
    return detectLanguageFromPath(file);
  }
  grammarKeyForFile(file) {
    const language = this.detectLang(file);
    if (language === "typescript")
      return "tsx";
    return language;
  }
  captureToKind(captureName) {
    switch (captureName) {
      case "func":
        return "function";
      case "method":
        return "method";
      case "class":
      case "struct":
        return "class";
      case "iface":
      case "trait":
        return "interface";
      case "type":
        return "type";
      case "var":
        return "variable";
      case "impl":
        return "class";
      default:
        return "unknown";
    }
  }
}
function extractImportSpecifiersWithTypes(node, language) {
  const specifiers = [];
  const state = { seenAnySpecifier: false, allSpecifiersAreType: true };
  collectSpecifiersWithTypes(node, language, specifiers, state);
  return { specifiers, allSpecifiersAreType: state.seenAnySpecifier && state.allSpecifiersAreType };
}
function collectSpecifiersWithTypes(node, language, out2, state) {
  const type = node.type;
  if (language === "typescript" || language === "javascript") {
    if (type === "import_specifier") {
      const name2 = node.childForFieldName("name");
      if (name2) {
        const hasTypeKeyword = node.children[0]?.type === "type";
        const isTypeSpecifier = hasTypeKeyword;
        state.seenAnySpecifier = true;
        if (!isTypeSpecifier) {
          out2.push(name2.text);
          state.allSpecifiersAreType = false;
        }
      }
      return;
    }
    if (type === "identifier" && node.parent?.type === "import_clause") {
      out2.push(node.text);
      state.seenAnySpecifier = true;
      state.allSpecifiersAreType = false;
      return;
    }
    if (type === "namespace_import") {
      const name2 = node.namedChildren.find((c) => c != null && c.type === "identifier");
      if (name2) {
        out2.push(name2.text);
        state.seenAnySpecifier = true;
        state.allSpecifiersAreType = false;
      }
      return;
    }
  } else if (language === "python") {
    if (type === "aliased_import") {
      const name2 = node.childForFieldName("name");
      if (name2) {
        const text = name2.text;
        const last = text.split(".").pop();
        if (last) {
          out2.push(last);
          state.seenAnySpecifier = true;
          state.allSpecifiersAreType = false;
        }
      }
      return;
    }
    if (type === "dotted_name" && node.parent?.type === "import_from_statement") {
      const field = node.parent.childForFieldName("module_name");
      if (node !== field) {
        const last = node.text.split(".").pop();
        if (last) {
          out2.push(last);
          state.seenAnySpecifier = true;
          state.allSpecifiersAreType = false;
        }
        return;
      }
    }
    if (type === "dotted_name" && node.parent?.type === "import_statement") {
      const last = node.text.split(".").pop();
      if (last) {
        out2.push(last);
        state.seenAnySpecifier = true;
        state.allSpecifiersAreType = false;
      }
      return;
    }
  } else if (language === "rust") {
    if (type === "use_as_clause") {
      const path = node.childForFieldName("path");
      if (path) {
        const name2 = path.childForFieldName("name");
        out2.push(name2 ? name2.text : path.text);
        state.seenAnySpecifier = true;
        state.allSpecifiersAreType = false;
        return;
      }
    }
    if (type === "identifier" && (node.parent?.type === "use_list" || node.parent?.type === "scoped_use_list" || node.parent?.type === "use_declaration")) {
      out2.push(node.text);
      state.seenAnySpecifier = true;
      state.allSpecifiersAreType = false;
      return;
    }
    if (type === "scoped_identifier" && !node.parent?.type?.includes("use_list")) {
      const name2 = node.childForFieldName("name");
      if (name2) {
        out2.push(name2.text);
        state.seenAnySpecifier = true;
        state.allSpecifiersAreType = false;
      }
      return;
    }
  } else if (language === "go") {
    if (type === "import_spec") {
      const name2 = node.childForFieldName("name");
      const path = node.childForFieldName("path");
      if (name2 && name2.text !== ".") {
        out2.push(name2.text);
        state.seenAnySpecifier = true;
        state.allSpecifiersAreType = false;
      } else if (path) {
        const raw = path.text.replace(/['"]/g, "");
        const last = raw.split("/").pop();
        if (last) {
          out2.push(last);
          state.seenAnySpecifier = true;
          state.allSpecifiersAreType = false;
        }
      }
      return;
    }
    if (type === "interpreted_string_literal") {
      const raw = node.text.replace(/['"]/g, "");
      const last = raw.split("/").pop();
      if (last) {
        out2.push(last);
        state.seenAnySpecifier = true;
        state.allSpecifiersAreType = false;
      }
      return;
    }
  }
  const childCount = node.namedChildCount;
  for (let i2 = 0;i2 < childCount; i2++) {
    const child = node.namedChild(i2);
    if (child)
      collectSpecifiersWithTypes(child, language, out2, state);
  }
}
function isPublicSymbol(name2, sourceLine, language, _filePath) {
  const trimmed = sourceLine.trimStart();
  switch (language) {
    case "go":
      return /^[A-Z]/.test(name2);
    case "rust":
    case "zig":
      return trimmed.startsWith("pub ");
    case "python":
    case "dart":
      return !name2.startsWith("_");
    case "java":
    case "kotlin":
    case "scala":
    case "swift":
    case "csharp":
      return !/\bprivate\b/.test(trimmed);
    case "php":
      return !/\b(?:private|protected)\b/.test(trimmed);
    case "ruby":
    case "lua":
    case "bash":
    case "tlaplus":
    case "rescript":
    case "ocaml":
      return true;
    case "elixir":
      return !trimmed.startsWith("defp ");
    case "elisp":
      return !name2.startsWith("--");
    default:
      return true;
  }
}

// src/graph/cache.ts
import { readFile as readFile2, stat } from "node:fs/promises";

class FileCache {
  entries = new Map;
  maxSize;
  constructor(maxSize = 200) {
    this.maxSize = maxSize;
  }
  async get(filePath) {
    try {
      const s = await stat(filePath);
      const mtime = s.mtimeMs;
      const cached = this.entries.get(filePath);
      if (cached && cached.mtime === mtime) {
        this.entries.delete(filePath);
        this.entries.set(filePath, cached);
        return cached.content;
      }
      const content = await readFile2(filePath, "utf-8");
      this.set(filePath, content, mtime);
      return content;
    } catch {
      return null;
    }
  }
  set(filePath, content, mtime) {
    if (this.entries.size >= this.maxSize) {
      const toEvict = Math.max(1, Math.floor(this.maxSize * 0.1));
      const iterator = this.entries.keys();
      for (let i2 = 0;i2 < toEvict && this.entries.size >= this.maxSize; i2++) {
        const result = iterator.next();
        if (result.done)
          break;
        this.entries.delete(result.value);
      }
    }
    const mt = mtime ?? Date.now();
    this.entries.set(filePath, { content, mtime: mt });
  }
  invalidate(filePath) {
    this.entries.delete(filePath);
  }
  clear() {
    this.entries.clear();
  }
}

// src/graph/clone-detection.ts
var KEYWORDS = new Set([
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "return",
  "throw",
  "try",
  "catch",
  "finally",
  "new",
  "delete",
  "typeof",
  "instanceof",
  "in",
  "of",
  "class",
  "extends",
  "implements",
  "interface",
  "enum",
  "const",
  "let",
  "var",
  "function",
  "async",
  "await",
  "yield",
  "import",
  "export",
  "from",
  "default",
  "static",
  "public",
  "private",
  "protected",
  "abstract",
  "override",
  "readonly",
  "void",
  "null",
  "undefined",
  "true",
  "false",
  "this",
  "super",
  "def",
  "self",
  "fn",
  "pub",
  "mut",
  "impl",
  "struct",
  "trait",
  "mod",
  "use",
  "crate",
  "match",
  "loop",
  "func",
  "go",
  "chan",
  "select",
  "defer",
  "range",
  "type",
  "package",
  "raise",
  "except",
  "pass",
  "lambda",
  "with",
  "as",
  "is",
  "not",
  "and",
  "or",
  "None",
  "True",
  "False"
]);
var TOKEN_RE = /[a-zA-Z_$]\w*|0[xXbBoO][\da-fA-F_]+|\d[\d_.]*(?:[eE][+-]?\d+)?[fFdDlLuU]?|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|[^\s\w]/g;
function normalizeToken(token) {
  if (token.length === 0)
    return token;
  const first = token[0];
  if (first === '"' || first === "'" || first === "`")
    return "$S";
  if (/^\d/.test(token) || /^0[xXbBoO]/.test(token))
    return "$N";
  if (/^[a-zA-Z_$]/.test(token)) {
    return KEYWORDS.has(token) ? token : "$I";
  }
  return token;
}
function tokenize(source) {
  const tokens = [];
  for (const match of source.matchAll(TOKEN_RE)) {
    tokens.push(normalizeToken(match[0]));
  }
  return tokens;
}
var NUM_HASHES = 128;
var SHINGLE_K = 3;
function computeMinHash(tokens) {
  if (tokens.length < SHINGLE_K + 2)
    return null;
  const sig = new Uint32Array(NUM_HASHES);
  sig.fill(4294967295);
  const shingleCount = tokens.length - SHINGLE_K + 1;
  for (let s = 0;s < shingleCount; s++) {
    const shingle = `${tokens[s]}\x00${tokens[s + 1]}\x00${tokens[s + 2]}`;
    for (let h = 0;h < NUM_HASHES; h++) {
      const v = Number(BigInt(Bun.hash(`${String(h)}\x01${shingle}`)) & 0xffffffffn);
      if (v < sig[h])
        sig[h] = v;
    }
  }
  return sig;
}
function jaccardSimilarity(a, b) {
  let matches = 0;
  for (let i2 = 0;i2 < NUM_HASHES; i2++) {
    if (a[i2] === b[i2])
      matches++;
  }
  return matches / NUM_HASHES;
}
var FRAGMENT_WINDOW = 12;
var MIN_FRAGMENT_TOKENS = FRAGMENT_WINDOW + 4;
function computeFragmentHashes(tokens) {
  if (tokens.length < MIN_FRAGMENT_TOKENS)
    return [];
  const results = [];
  const windowCount = tokens.length - FRAGMENT_WINDOW + 1;
  for (let i2 = 0;i2 < windowCount; i2++) {
    const window2 = tokens.slice(i2, i2 + FRAGMENT_WINDOW).join("\x00");
    const hash = Bun.hash(window2).toString(16);
    results.push({ hash, tokenOffset: i2 });
  }
  return results;
}

// src/graph/constants.ts
var INDEXABLE_EXTENSIONS = EXT_TO_LANGUAGE;
var PAGERANK_ITERATIONS = 20;
var PAGERANK_DAMPING = 0.85;
var GRAPH_SCAN_BATCH_SIZE = 500;

// src/graph/utils.ts
import { readdirSync } from "fs";
import { stat as stat2 } from "fs/promises";
import { join as join2, extname } from "path";
var IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  "nuxt",
  "vendor",
  "venv",
  "__pycache__",
  ".cache",
  "target",
  "out",
  ".idea",
  ".vscode"
]);
var IGNORED_EXTS = new Set([
  ".min.js",
  ".bundle.js",
  ".d.ts",
  ".map",
  ".lock",
  ".yarn"
]);
var MAX_FILE_SIZE = 500000;
var MAX_DEPTH = 10;
var WALK_FILE_CAP = 50000;
async function collectFilesAsync(dir) {
  const gitFiles = await collectFilesViaGit(dir);
  if (gitFiles) {
    return { files: gitFiles };
  }
  const collected = [];
  let hitCap = false;
  const walkDone = collectFilesWalk(dir, 0, undefined, collected).then(() => {
    hitCap = collected.length >= WALK_FILE_CAP;
  });
  const timedOut = await Promise.race([
    walkDone.then(() => false),
    new Promise((r) => setTimeout(() => r(true), 60000))
  ]);
  const warning = timedOut ? `Walk timeout - indexed ${String(collected.length)} of possibly more files (60s limit)` : hitCap ? `Large directory - capped file walk at ${String(WALK_FILE_CAP)} files` : undefined;
  return { files: collected, warning };
}
async function collectFilesViaGit(dir) {
  try {
    const proc = Bun.spawn(["git", "ls-files", "--cached", "--others", "--exclude-standard"], {
      cwd: dir,
      stdout: "pipe",
      stderr: "ignore"
    });
    const code = await Promise.race([
      proc.exited,
      new Promise((r) => setTimeout(() => r("timeout"), 30000))
    ]);
    if (code === "timeout") {
      proc.kill();
      return null;
    }
    const text = await new Response(proc.stdout).text();
    if (code !== 0)
      return null;
    const files = [];
    for (const line of text.split(`
`)) {
      if (!line)
        continue;
      const ext = extname(line).toLowerCase();
      if (!(ext in INDEXABLE_EXTENSIONS))
        continue;
      const fullPath = join2(dir, line);
      try {
        const s = await stat2(fullPath);
        if (s.size < MAX_FILE_SIZE)
          files.push({ path: fullPath, mtimeMs: s.mtimeMs });
      } catch {}
      if (files.length % 50 === 0)
        await new Promise((r) => setTimeout(r, 0));
    }
    return files;
  } catch {
    return null;
  }
}
async function collectFilesWalk(dir, depth, counter, out2) {
  if (depth > MAX_DEPTH)
    return [];
  const ctx = counter ?? { n: 0 };
  const files = out2 ?? [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (ctx.n >= WALK_FILE_CAP)
        break;
      if (entry.name.startsWith(".") && entry.name !== ".")
        continue;
      const fullPath = join2(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          await collectFilesWalk(fullPath, depth + 1, ctx, files);
        }
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (ext in INDEXABLE_EXTENSIONS) {
          try {
            const s = await stat2(fullPath);
            if (s.size < MAX_FILE_SIZE) {
              files.push({ path: fullPath, mtimeMs: s.mtimeMs });
              ctx.n++;
            }
          } catch {}
        }
      }
      if (ctx.n % 50 === 0)
        await new Promise((r) => setTimeout(r, 0));
    }
  } catch {}
  return files;
}
function isBarrelFile(path) {
  const name2 = path.split("/").pop()?.toLowerCase() || "";
  return name2 === "index.ts" || name2 === "index.tsx" || name2 === "index.js" || name2 === "mod.rs" || name2 === "index.py" || name2 === "__init__.py";
}
function extractSignature(lines, lineIdx, kind) {
  const line = lines[lineIdx];
  if (!line)
    return null;
  let sig = line.trimStart();
  if (kind === "function" || kind === "method") {
    if (!sig.includes(")") && !sig.includes("{") && !sig.includes("=>")) {
      for (let i2 = 1;i2 <= 2; i2++) {
        const next = lines[lineIdx + i2];
        if (!next)
          break;
        sig += ` ${next.trim()}`;
        if (next.includes(")") || next.includes("{"))
          break;
      }
    }
  }
  const braceIdx = sig.indexOf("{");
  if (braceIdx > 0)
    sig = sig.slice(0, braceIdx).trimEnd();
  sig = sig.replace(/\s*[{:]\s*$/, "").trimEnd();
  if (sig.length > 120)
    sig = `${sig.slice(0, 117)}...`;
  return sig || null;
}
function kindTag(kind) {
  switch (kind) {
    case "function":
    case "method":
      return "f:";
    case "class":
      return "c:";
    case "interface":
      return "i:";
    case "type":
      return "t:";
    case "variable":
    case "constant":
      return "v:";
    case "enum":
      return "e:";
    default:
      return "";
  }
}

// src/graph/repo-map.ts
class RepoMap {
  db;
  cwd;
  treeSitter;
  cache;
  stmts = {};
  scanFiles = [];
  scanTotalFiles = 0;
  constructor(config) {
    this.cwd = resolve2(config.cwd);
    this.db = config.db;
    this.treeSitter = new TreeSitterBackend;
    this.cache = new FileCache(200);
    this.treeSitter.setCache(this.cache);
    this.prepareStatements();
  }
  prepareStatements() {
    this.stmts = {
      getFileById: this.db.prepare("SELECT * FROM files WHERE id = ?"),
      getFileByPath: this.db.prepare("SELECT * FROM files WHERE path = ?"),
      getSymbolsByFileId: this.db.prepare("SELECT * FROM symbols WHERE file_id = ?"),
      getRefsByFileId: this.db.prepare("SELECT * FROM refs WHERE file_id = ?"),
      getEdgesBySource: this.db.prepare("SELECT * FROM edges WHERE source_file_id = ?"),
      getEdgesByTarget: this.db.prepare("SELECT * FROM edges WHERE target_file_id = ?"),
      getAllFiles: this.db.prepare("SELECT * FROM files ORDER BY pagerank DESC"),
      getAllSymbols: this.db.prepare("SELECT * FROM symbols"),
      getAllEdges: this.db.prepare("SELECT * FROM edges"),
      getAllRefs: this.db.prepare("SELECT * FROM refs"),
      insertFile: this.db.prepare(`
        INSERT OR REPLACE INTO files (path, mtime_ms, language, line_count, symbol_count, pagerank, is_barrel, indexed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),
      insertSymbol: this.db.prepare(`
        INSERT INTO symbols (file_id, name, kind, line, end_line, is_exported, signature, qualified_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),
      insertRef: this.db.prepare(`
        INSERT INTO refs (file_id, name, source_file_id, import_source, is_dynamic)
        VALUES (?, ?, ?, ?, ?)
      `),
      insertEdge: this.db.prepare(`
        INSERT OR REPLACE INTO edges (source_file_id, target_file_id, weight, confidence)
        VALUES (?, ?, ?, ?)
      `),
      insertCoChange: this.db.prepare(`
        INSERT OR REPLACE INTO cochanges (file_id_a, file_id_b, count)
        VALUES (?, ?, ?)
      `),
      deleteFile: this.db.prepare("DELETE FROM files WHERE id = ?"),
      deleteRefsByFileId: this.db.prepare("DELETE FROM refs WHERE file_id = ?"),
      deleteEdgesBySource: this.db.prepare("DELETE FROM edges WHERE source_file_id = ?"),
      deleteEdgesByTarget: this.db.prepare("DELETE FROM edges WHERE target_file_id = ?"),
      deleteSymbolsByFileId: this.db.prepare("DELETE FROM symbols WHERE file_id = ?"),
      deleteShapeHashesByFileId: this.db.prepare("DELETE FROM shape_hashes WHERE file_id = ?"),
      deleteTokenSignaturesByFileId: this.db.prepare("DELETE FROM token_signatures WHERE file_id = ?"),
      deleteTokenFragmentsByFileId: this.db.prepare("DELETE FROM token_fragments WHERE file_id = ?"),
      deleteExternalImportsByFileId: this.db.prepare("DELETE FROM external_imports WHERE file_id = ?"),
      getCounts: this.db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM files) as files,
          (SELECT COUNT(*) FROM symbols) as symbols,
          (SELECT COUNT(*) FROM edges) as edges
      `),
      getEdgesByTargetFile: this.db.prepare("SELECT * FROM edges WHERE target_file_id = ?"),
      getEdgesBySourceFile: this.db.prepare("SELECT * FROM edges WHERE source_file_id = ?"),
      getEdgesTargetIds: this.db.prepare("SELECT target_file_id FROM edges WHERE source_file_id = ?"),
      searchSymbolsFtsQuery: this.db.prepare(`
        SELECT s.name, f.path, s.kind, s.line, s.is_exported AS isExported, f.pagerank, s.id
        FROM symbols_fts ft
        JOIN symbols s ON ft.rowid = s.id
        JOIN files f ON s.file_id = f.id
        WHERE symbols_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `),
      getSymbolByFileAndLine: this.db.prepare("SELECT id, name, kind, line, signature FROM symbols WHERE file_id = ? AND line = ? LIMIT 1"),
      getCallersQuery: this.db.prepare(`
        SELECT s.name as caller_name, f.path as caller_path, s.line as caller_line, c.line as call_line
        FROM calls c
        JOIN symbols s ON c.caller_symbol_id = s.id
        JOIN files f ON s.file_id = f.id
        WHERE c.callee_name = ? AND (c.callee_file_id IS NULL OR c.callee_file_id = ?)
      `),
      getCalleesQuery: this.db.prepare(`
        SELECT c.callee_name, f.path as callee_file, c.line as call_line, s.line as callee_def_line
        FROM calls c
        JOIN files f ON c.callee_file_id = f.id
        JOIN symbols s ON c.callee_symbol_id = s.id
        WHERE c.caller_symbol_id = ?
      `),
      getCoChanges: this.db.prepare(`
        SELECT 
          CASE WHEN file_id_a = ? THEN file_id_b ELSE file_id_a END as other_id,
          count
        FROM cochanges 
        WHERE file_id_a = ? OR file_id_b = ?
        ORDER BY count DESC
        LIMIT 20
      `),
      getFileSymbolsQuery: this.db.prepare("SELECT * FROM symbols WHERE file_id = ?"),
      getUnresolvedRefs: this.db.prepare("SELECT * FROM refs WHERE source_file_id IS NULL"),
      resolveRefMatch: this.db.prepare(`
        SELECT s.id, s.file_id, f.path 
        FROM symbols s 
        JOIN files f ON s.file_id = f.id 
        WHERE s.name = ? AND s.is_exported = 1
      `),
      getTestFiles: this.db.prepare(`
        SELECT id, path FROM files 
        WHERE path LIKE '%.test.%' OR path LIKE '%_test.%' OR path LIKE '%.spec.%'
      `),
      getFilesWithImports: this.db.prepare(`
        SELECT DISTINCT f.id, f.path FROM files f
        WHERE EXISTS (SELECT 1 FROM symbols s WHERE s.file_id = f.id AND s.kind IN ('function', 'method'))
          AND EXISTS (SELECT 1 FROM refs r WHERE r.file_id = f.id AND r.name != '*' AND r.import_source != '<self>')
      `),
      getImportsForFile: this.db.prepare(`
        SELECT DISTINCT r.name, r.source_file_id FROM refs r
        WHERE r.file_id = ? AND r.source_file_id IS NOT NULL AND r.name != '*'
          AND r.import_source != '<self>'
      `),
      getFunctionsForFile: this.db.prepare(`
        SELECT id, name, line, end_line FROM symbols
        WHERE file_id = ? AND kind IN ('function', 'method') AND end_line > line
      `),
      resolveCallee: this.db.prepare(`
        SELECT id FROM symbols WHERE file_id = ? AND name = ? AND is_exported = 1 LIMIT 1
      `),
      insertCall: this.db.prepare(`
        INSERT INTO calls (caller_symbol_id, callee_name, callee_symbol_id, callee_file_id, line)
        VALUES (?, ?, ?, ?, ?)
      `),
      getUnusedExportsQuery: this.db.prepare(`
        SELECT 
          s.id, 
          s.name, 
          s.kind, 
          s.line, 
          s.end_line, 
          f.path, 
          f.line_count,
          EXISTS (
            SELECT 1 FROM refs r 
            WHERE r.name = s.name 
              AND r.source_file_id = s.file_id 
              AND r.import_source = '<self>'
          ) AS has_self
        FROM symbols s
        JOIN files f ON s.file_id = f.id
        WHERE s.is_exported = 1
          AND NOT EXISTS (
            SELECT 1 FROM refs r 
            WHERE r.name = s.name 
              AND r.source_file_id = s.file_id
              AND r.file_id != s.file_id
              AND r.is_dynamic = 0
          )
          AND NOT EXISTS (
            SELECT 1 FROM refs rbarrel
            JOIN files fb ON rbarrel.file_id = fb.id
            WHERE rbarrel.name = s.name
              AND fb.is_barrel = 1
              AND rbarrel.source_file_id != fb.id
              AND EXISTS (
                SELECT 1 FROM refs rimport
                WHERE rimport.name = s.name
                  AND rimport.source_file_id = fb.id
                  AND rimport.file_id != fb.id
                  AND rimport.is_dynamic = 0
              )
          )
          AND NOT EXISTS (
            SELECT 1 FROM refs rdynamic
            WHERE rdynamic.source_file_id = s.file_id
              AND rdynamic.is_dynamic = 1
          )
        LIMIT ?
      `),
      getOrphanFilesQuery: this.db.prepare(`
        SELECT f.path, f.language, f.line_count, f.symbol_count
        FROM files f
        LEFT JOIN edges e ON e.target_file_id = f.id
        LEFT JOIN entrypoints ep ON ep.file_id = f.id
        WHERE e.target_file_id IS NULL
          AND ep.file_id IS NULL
          AND f.is_barrel = 0
          AND f.path NOT LIKE '%.test.%'
          AND f.path NOT LIKE '%.spec.%'
          AND f.path NOT LIKE '%_test.%'
        ORDER BY f.line_count DESC
        LIMIT ?
      `),
      getEdgesSourceIdsByTarget: this.db.prepare("SELECT source_file_id FROM edges WHERE target_file_id = ?"),
      getRefsByName: this.db.prepare(`
        SELECT f.path, r.import_source
        FROM refs r
        JOIN files f ON r.file_id = f.id
        WHERE r.name = ?
          AND r.import_source != '<self>'
      `),
      getCallsByCalleeName: this.db.prepare(`
        SELECT c.line, s.name as caller_name, f.path
        FROM calls c
        JOIN symbols s ON c.caller_symbol_id = s.id
        JOIN files f ON s.file_id = f.id
        WHERE c.callee_name = ?
      `),
      getReexportsByName: this.db.prepare(`
        SELECT f.path, s.line
        FROM symbols s
        JOIN files f ON s.file_id = f.id
        WHERE s.name = ? AND s.is_exported = 1 AND f.is_barrel = 1
      `)
    };
  }
  async initialize() {
    try {
      await this.treeSitter.initialize(this.cwd);
      this.initSchema();
    } catch (err2) {
      console.error("Failed to initialize RepoMap:", err2);
      throw err2;
    }
  }
  initSchema() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS schema_version (
        id INTEGER PRIMARY KEY,
        version INTEGER NOT NULL
      )
    `);
    const version = this.db.prepare("SELECT version FROM schema_version ORDER BY id DESC LIMIT 1").get();
    if (!version || version.version < 1) {
      this.db.run("INSERT INTO schema_version (version) VALUES (1)");
    }
    try {
      const ftsCount = this.db.prepare("SELECT COUNT(*) as c FROM symbols_fts").get();
      if (!ftsCount || ftsCount.c === 0) {
        const symbols = this.stmts.getAllSymbols.all();
        for (const sym of symbols) {
          const file = this.stmts.getFileById.get(sym.file_id);
          if (file) {
            try {
              this.db.run("INSERT INTO symbols_fts (rowid, name, path, kind) VALUES (?, ?, ?, ?)", [sym.id, sym.name, file.path, sym.kind]);
            } catch {}
          }
        }
      }
    } catch {}
  }
  async scan() {
    await this.prepareScan();
    let offset = 0;
    let completed = false;
    while (!completed) {
      const result = await this.scanBatch(offset, GRAPH_SCAN_BATCH_SIZE);
      offset = result.nextOffset;
      completed = result.completed;
    }
    await this.finalizeScan();
  }
  async prepareScan() {
    const result = await collectFilesAsync(this.cwd);
    this.scanFiles = result.files.map((f) => relative(this.cwd, f.path));
    this.scanTotalFiles = this.scanFiles.length;
    this.resetGraphDataForFullScan();
    return {
      totalFiles: this.scanTotalFiles,
      batchSize: GRAPH_SCAN_BATCH_SIZE
    };
  }
  async scanBatch(offset, batchSize) {
    const filesToProcess = this.scanFiles.slice(offset, offset + batchSize);
    const processedCount = filesToProcess.length;
    for (const filePath of filesToProcess) {
      try {
        await this.indexFile(filePath);
      } catch (err2) {
        console.error(`Error indexing ${filePath}:`, err2);
      }
    }
    const nextOffset = offset + processedCount;
    const completed = nextOffset >= this.scanTotalFiles;
    return {
      processed: processedCount,
      completed,
      nextOffset,
      totalFiles: this.scanTotalFiles
    };
  }
  async finalizeScan() {
    await this.collectEntrypoints();
    await this.resolveUnresolvedRefs();
    await this.buildEdges();
    await this.computePageRank();
    this.linkTestFiles();
    await this.buildCallGraph();
    await this.buildCoChanges();
    this.rescueOrphans();
  }
  resetGraphDataForFullScan() {
    this.db.transaction(() => {
      this.db.run("DELETE FROM refs");
      this.db.run("DELETE FROM edges");
      this.db.run("DELETE FROM calls");
      this.db.run("DELETE FROM cochanges");
      this.db.run("DELETE FROM entrypoints");
      this.db.run("DELETE FROM shape_hashes");
      this.db.run("DELETE FROM token_signatures");
      this.db.run("DELETE FROM token_fragments");
      this.db.run("DELETE FROM external_imports");
      this.db.run("DELETE FROM semantic_summaries");
      this.db.run("DROP TABLE IF EXISTS symbols_fts");
      this.db.run(`
        CREATE VIRTUAL TABLE IF NOT EXISTS symbols_fts USING fts5(
          name,
          path,
          kind
        )
      `);
      this.db.run("DROP TRIGGER IF EXISTS symbols_ai");
      this.db.run("DROP TRIGGER IF EXISTS symbols_ad");
      this.db.run("DROP TRIGGER IF EXISTS symbols_au");
      this.db.run(`
        CREATE TRIGGER symbols_ai AFTER INSERT ON symbols BEGIN
          INSERT INTO symbols_fts(rowid, name, path, kind)
          VALUES (new.id, new.name, (SELECT path FROM files WHERE id = new.file_id), new.kind);
        END
      `);
      this.db.run(`
        CREATE TRIGGER symbols_ad AFTER DELETE ON symbols BEGIN
          DELETE FROM symbols_fts WHERE rowid = old.id;
        END
      `);
      this.db.run(`
        CREATE TRIGGER symbols_au AFTER UPDATE ON symbols BEGIN
          DELETE FROM symbols_fts WHERE rowid = old.id;
          INSERT INTO symbols_fts(rowid, name, path, kind)
          VALUES (new.id, new.name, (SELECT path FROM files WHERE id = new.file_id), new.kind);
        END
      `);
      this.db.run("DELETE FROM symbols");
      this.db.run("DELETE FROM files");
    })();
  }
  async indexFile(filePath) {
    const absPath = filePath.startsWith("/") ? filePath : resolve2(this.cwd, filePath);
    const relPath = relative(this.cwd, absPath);
    const ext = extname2(absPath).toLowerCase();
    if (!(ext in INDEXABLE_EXTENSIONS))
      return;
    let stats;
    try {
      stats = statSync(absPath);
    } catch {
      return;
    }
    if (stats.size > 500000)
      return;
    const outline = await this.treeSitter.getFileOutline(absPath);
    if (!outline)
      return;
    const existing = this.stmts.getFileByPath.get(relPath);
    if (existing && existing.mtime_ms === stats.mtimeMs) {
      return;
    }
    const isBarrel = isBarrelFile(relPath);
    const lineCount = outline.symbols.length > 0 ? Math.max(...outline.symbols.map((s) => s.location.endLine || s.location.line)) : 1;
    const { readFile: readFile3 } = await import("fs/promises");
    const content = await readFile3(absPath, "utf-8");
    const lines = content.split(`
`);
    const resolvedImports = [];
    const externalImports = [];
    for (const imp of outline.imports) {
      const isRelative = imp.source.startsWith(".") || imp.source.startsWith("/");
      if (imp.isTypeOnly && isRelative) {
        continue;
      }
      if (isRelative) {
        const resolvedSource = await this.resolveImportSource(imp.source, absPath);
        let sourceFileId = null;
        if (resolvedSource) {
          const resolvedFile = this.stmts.getFileByPath.get(resolvedSource);
          if (resolvedFile) {
            sourceFileId = resolvedFile.id;
          }
        }
        if (!imp.isTypeOnly) {
          resolvedImports.push({ specifiers: imp.specifiers, sourceFileId, importSource: imp.source, isDynamic: imp.isDynamic });
        }
      } else {
        let packageName;
        if (imp.source.startsWith("@")) {
          const parts2 = imp.source.split("/");
          packageName = parts2.length >= 2 ? `${parts2[0]}/${parts2[1]}` : parts2[0];
        } else {
          packageName = imp.source.split("/")[0];
        }
        externalImports.push({ package: packageName, specifiers: imp.specifiers });
      }
    }
    const shapeHashes = await this.treeSitter.getShapeHashes(filePath);
    const tokenSignatures = [];
    let fragmentHashes = [];
    try {
      const cachedContent = await this.cache.get(absPath) || "";
      const tokens = tokenize(cachedContent);
      const minhash = computeMinHash(tokens);
      if (minhash) {
        for (const sym of outline.symbols) {
          const symMinhash = computeMinHash(tokens.slice(Math.floor((sym.location.line - 1) * tokens.length / lineCount), Math.floor((sym.location.endLine || sym.location.line) * tokens.length / lineCount)));
          if (symMinhash) {
            tokenSignatures.push({
              name: sym.name,
              line: sym.location.line,
              endLine: sym.location.endLine || sym.location.line,
              minhash: symMinhash
            });
          }
        }
        fragmentHashes = computeFragmentHashes(tokens);
      }
    } catch (err2) {
      console.debug("Token extraction failed for file:", filePath, err2);
    }
    this.db.transaction(() => {
      if (existing) {
        this.stmts.deleteRefsByFileId.run([existing.id]);
        this.stmts.deleteEdgesBySource.run([existing.id]);
        this.stmts.deleteEdgesByTarget.run([existing.id]);
        this.stmts.deleteSymbolsByFileId.run([existing.id]);
        this.stmts.deleteShapeHashesByFileId.run([existing.id]);
        this.stmts.deleteTokenSignaturesByFileId.run([existing.id]);
        this.stmts.deleteTokenFragmentsByFileId.run([existing.id]);
        this.stmts.deleteFile.run([existing.id]);
      }
      const fileId = this.db.run("INSERT INTO files (path, mtime_ms, language, line_count, symbol_count, pagerank, is_barrel, indexed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [relPath, stats.mtimeMs, outline.language, lineCount, outline.symbols.length, 0, isBarrel ? 1 : 0, Date.now()]).lastInsertRowid;
      const seenSymbols = new Set;
      const exportedSymbols = outline.symbols.filter((sym) => outline.exports.some((e) => e.name === sym.name));
      for (const sym of outline.symbols) {
        const key = `${sym.location.line}-${sym.name}-${sym.kind}`;
        if (seenSymbols.has(key))
          continue;
        seenSymbols.add(key);
        const signature = extractSignature(lines, sym.location.line - 1, sym.kind);
        this.stmts.insertSymbol.run([
          fileId,
          sym.name,
          sym.kind,
          sym.location.line,
          sym.location.endLine || sym.location.line,
          outline.exports.some((e) => e.name === sym.name) ? 1 : 0,
          signature || null,
          sym.name
        ]);
      }
      if (exportedSymbols.length > 0) {
        const exportedNames = new Set(exportedSymbols.map((s) => s.name));
        const seenSelfRefs = new Set;
        for (let lineIdx = 0;lineIdx < lines.length; lineIdx++) {
          const line = lines[lineIdx];
          for (const exportedName of exportedNames) {
            const declaringSymbol = exportedSymbols.find((s) => s.name === exportedName);
            if (declaringSymbol && lineIdx + 1 === declaringSymbol.location.line)
              continue;
            const escapedName = exportedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`(?<![a-zA-Z0-9_$])${escapedName}(?![a-zA-Z0-9_$])`, "g");
            if (regex.test(line)) {
              const refKey = `${exportedName}-${lineIdx}`;
              if (!seenSelfRefs.has(refKey)) {
                seenSelfRefs.add(refKey);
                this.stmts.insertRef.run([fileId, exportedName, fileId, "<self>", 0]);
              }
            }
          }
        }
      }
      for (const ref of resolvedImports) {
        if (ref.isDynamic) {
          this.stmts.insertRef.run([fileId, "*", ref.sourceFileId, ref.importSource, 1]);
        } else {
          for (const specifier of ref.specifiers) {
            this.stmts.insertRef.run([fileId, specifier, ref.sourceFileId, ref.importSource, 0]);
          }
        }
      }
      for (const extImp of externalImports) {
        this.db.run("INSERT INTO external_imports (file_id, package, specifiers) VALUES (?, ?, ?)", [fileId, extImp.package, extImp.specifiers.join(",")]);
      }
      if (shapeHashes) {
        for (const hash of shapeHashes) {
          this.db.run("INSERT INTO shape_hashes (file_id, name, kind, line, end_line, shape_hash, node_count) VALUES (?, ?, ?, ?, ?, ?, ?)", [fileId, hash.name, hash.kind, hash.line, hash.endLine, hash.shapeHash, hash.nodeCount]);
        }
      }
      for (const sig of tokenSignatures) {
        this.db.run("INSERT INTO token_signatures (file_id, name, line, end_line, minhash) VALUES (?, ?, ?, ?, ?)", [fileId, sig.name, sig.line, sig.endLine, sig.minhash]);
      }
      for (const frag of fragmentHashes) {
        this.db.run("INSERT INTO token_fragments (hash, file_id, name, line, token_offset) VALUES (?, ?, ?, ?, ?)", [frag.hash, fileId, "", 1, frag.tokenOffset]);
      }
    })();
  }
  async resolveImportSource(importSource, fromFile) {
    const fromDir = dirname3(fromFile);
    if (importSource.startsWith(".")) {
      const resolved = resolve2(fromDir, importSource);
      if (existsSync3(resolved))
        return relative(this.cwd, resolved);
      for (const ext of [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs", ".py", ".go", ".rs"]) {
        if (existsSync3(resolved + ext)) {
          return relative(this.cwd, resolved + ext);
        }
      }
      for (const index of ["/index.ts", "/index.tsx", "/index.js", "/__init__.py"]) {
        if (existsSync3(resolved + index)) {
          return relative(this.cwd, resolved + index);
        }
      }
      return null;
    }
    return null;
  }
  async resolveUnresolvedRefs() {
    const unresolved = this.stmts.getUnresolvedRefs.all();
    if (unresolved.length === 0)
      return;
    const findExported = this.db.prepare(`
      SELECT s.id, s.file_id, f.path
      FROM symbols s
      JOIN files f ON s.file_id = f.id
      WHERE s.name = ? AND s.is_exported = 1
    `);
    this.db.transaction(() => {
      for (const ref of unresolved) {
        const matches = findExported.all(ref.name);
        if (matches.length >= 1) {
          if (ref.import_source) {
            const pathMatch = matches.find((m) => {
              const importPath = ref.import_source.startsWith(".") ? ref.import_source : ref.import_source;
              return m.path === importPath || m.path.endsWith(importPath);
            });
            if (pathMatch) {
              this.db.run("UPDATE refs SET source_file_id = ? WHERE id = ?", [pathMatch.file_id, ref.id]);
              continue;
            }
          }
          this.db.run("UPDATE refs SET source_file_id = ? WHERE id = ?", [matches[0].file_id, ref.id]);
        }
      }
    })();
  }
  async buildEdges() {
    const refs = this.stmts.getAllRefs.all();
    const edgeMap = new Map;
    for (const ref of refs) {
      if (ref.source_file_id && ref.import_source !== "<self>") {
        const key = `${ref.file_id}-${ref.source_file_id}`;
        const existing = edgeMap.get(key);
        if (existing) {
          edgeMap.set(key, { weight: existing.weight + 1, confidence: existing.confidence });
        } else {
          edgeMap.set(key, { weight: 1, confidence: 1 });
        }
      }
    }
    this.db.transaction(() => {
      for (const [key, data] of edgeMap) {
        const [source, target] = key.split("-").map(Number);
        const idf = Math.log(2);
        const dampenedWeight = data.weight * idf;
        this.stmts.insertEdge.run([source, target, dampenedWeight, data.confidence]);
      }
    })();
  }
  async computePageRank() {
    const files = this.stmts.getAllFiles.all();
    const n = files.length;
    if (n === 0)
      return;
    const damping = PAGERANK_DAMPING;
    const iterations = PAGERANK_ITERATIONS;
    const ranks = new Map;
    for (const file of files) {
      ranks.set(file.id, 1 / n);
    }
    const edges = this.stmts.getAllEdges.all();
    const outgoing = new Map;
    const incoming = new Map;
    for (const edge of edges) {
      outgoing.set(edge.source_file_id, (outgoing.get(edge.source_file_id) || 0) + edge.weight);
      if (!incoming.has(edge.target_file_id)) {
        incoming.set(edge.target_file_id, []);
      }
      incoming.get(edge.target_file_id).push(edge);
    }
    for (let iter = 0;iter < iterations; iter++) {
      const newRanks = new Map;
      for (const file of files) {
        let rank = (1 - damping) / n;
        const incomingEdges = incoming.get(file.id) || [];
        for (const edge of incomingEdges) {
          const outWeight = outgoing.get(edge.source_file_id) || 1;
          const sourceRank = ranks.get(edge.source_file_id) || 0;
          rank += damping * (sourceRank * edge.weight / outWeight);
        }
        newRanks.set(file.id, rank);
      }
      ranks.clear();
      for (const [k, v] of newRanks) {
        ranks.set(k, v);
      }
    }
    this.db.transaction(() => {
      for (const file of files) {
        const rank = ranks.get(file.id) || 0;
        this.db.run("UPDATE files SET pagerank = ? WHERE id = ?", [rank, file.id]);
      }
    })();
  }
  async computePageRankSync() {
    await this.computePageRank();
  }
  async render(opts) {
    const maxFiles = opts?.maxFiles ?? 20;
    const maxSymbolsPerFile = opts?.maxSymbols ?? 5;
    const files = this.stmts.getAllFiles.all();
    if (!files || files.length === 0) {
      return { content: "", paths: [] };
    }
    const topFiles = files.slice(0, maxFiles);
    let content = "";
    const paths = [];
    for (const file of topFiles) {
      const symbols = this.stmts.getSymbolsByFileId.all(file.id);
      if (!symbols || symbols.length === 0)
        continue;
      content += `// ${file.path}
`;
      for (const sym of symbols.slice(0, maxSymbolsPerFile)) {
        content += `//   ${kindTag(sym.kind)}${sym.name}
`;
      }
      content += `
`;
      paths.push(file.path);
    }
    return { content, paths };
  }
  getStats() {
    const counts = this.stmts.getCounts.get();
    const summaries = this.db.prepare("SELECT COUNT(*) as count FROM semantic_summaries").get();
    const calls = this.db.prepare("SELECT COUNT(*) as count FROM calls").get();
    return {
      files: counts.files,
      symbols: counts.symbols,
      edges: counts.edges,
      summaries: summaries.count,
      calls: calls.count
    };
  }
  getTopFiles(limit = 20) {
    const files = this.db.prepare("SELECT * FROM files ORDER BY pagerank DESC LIMIT ?").all(limit);
    return files.map((f) => ({
      path: f.path,
      pagerank: f.pagerank,
      lines: f.line_count,
      symbols: f.symbol_count,
      language: f.language
    }));
  }
  getFileDependents(path) {
    const file = this.stmts.getFileByPath.get(path);
    if (!file)
      return [];
    const edges = this.stmts.getEdgesByTargetFile.all(file.id);
    const results = [];
    for (const edge of edges) {
      const source = this.stmts.getFileById.get(edge.source_file_id);
      if (source) {
        results.push({ path: source.path, weight: edge.weight });
      }
    }
    return results;
  }
  getFileDependencies(path) {
    const file = this.stmts.getFileByPath.get(path);
    if (!file)
      return [];
    const edges = this.stmts.getEdgesBySourceFile.all(file.id);
    const results = [];
    for (const edge of edges) {
      const target = this.stmts.getFileById.get(edge.target_file_id);
      if (target) {
        results.push({ path: target.path, weight: edge.weight });
      }
    }
    return results;
  }
  getFileCoChanges(path) {
    const file = this.stmts.getFileByPath.get(path);
    if (!file)
      return [];
    const cochanges = this.stmts.getCoChanges.all(file.id, file.id, file.id);
    return cochanges.map((c) => {
      const other = this.stmts.getFileById.get(c.other_id);
      return {
        path: other?.path || "",
        count: c.count
      };
    }).filter((r) => r.path);
  }
  getFileBlastRadius(path) {
    const file = this.stmts.getFileByPath.get(path);
    if (!file)
      return 0;
    const visited = new Set;
    const queue = [file.id];
    while (queue.length > 0) {
      const id = queue.shift();
      if (visited.has(id))
        continue;
      visited.add(id);
      const edges = this.stmts.getEdgesTargetIds.all(id);
      for (const edge of edges) {
        if (!visited.has(edge.target_file_id)) {
          queue.push(edge.target_file_id);
        }
      }
    }
    return visited.size - 1;
  }
  getFileSymbols(path) {
    const file = this.stmts.getFileByPath.get(path);
    if (!file)
      return [];
    const symbols = this.stmts.getFileSymbolsQuery.all(file.id);
    return symbols.map((s) => ({
      name: s.name,
      kind: s.kind,
      isExported: !!s.is_exported,
      line: s.line,
      endLine: s.end_line
    }));
  }
  findSymbols(query, limit = 50) {
    const results = this.db.prepare(`
      SELECT s.name, f.path, s.kind, s.line, s.is_exported AS isExported, f.pagerank, s.id
      FROM symbols s
      JOIN files f ON s.file_id = f.id
      WHERE s.name LIKE ?
      ORDER BY f.pagerank DESC
      LIMIT ?
    `).all(`%${query}%`, limit);
    return results;
  }
  searchSymbolsFts(query, limit = 50) {
    try {
      const results = this.stmts.searchSymbolsFtsQuery.all(query, limit);
      return results;
    } catch {
      return [];
    }
  }
  getSymbolSignature(path, line) {
    const file = this.stmts.getFileByPath.get(path);
    if (!file)
      return null;
    const symbol = this.stmts.getSymbolByFileAndLine.get(file.id, line);
    if (!symbol)
      return null;
    return {
      path,
      kind: symbol.kind,
      signature: symbol.signature || "",
      line: symbol.line
    };
  }
  getCallers(path, line) {
    const fileId = this.stmts.getFileByPath.get(path);
    if (!fileId)
      return [];
    const symbol = this.stmts.getSymbolByFileAndLine.get(fileId.id, line);
    if (!symbol)
      return [];
    const callers = this.db.prepare(`
      SELECT s.name as caller_name, f.path as caller_path, s.line as caller_line, c.line as call_line
      FROM calls c
      JOIN symbols s ON c.caller_symbol_id = s.id
      JOIN files f ON s.file_id = f.id
      WHERE c.callee_name = ? AND (c.callee_file_id IS NULL OR c.callee_file_id = ?)
    `).all(symbol.name, fileId.id);
    return callers.map((c) => ({
      callerName: c.caller_name,
      callerPath: c.caller_path,
      callerLine: c.caller_line,
      callLine: c.call_line
    }));
  }
  getCallees(path, line) {
    const fileId = this.stmts.getFileByPath.get(path);
    if (!fileId)
      return [];
    const symbol = this.stmts.getSymbolByFileAndLine.get(fileId.id, line);
    if (!symbol)
      return [];
    const callees = this.db.prepare(`
      SELECT c.callee_name, f.path as callee_file, c.line as call_line, 
             (SELECT line FROM symbols WHERE id = c.callee_symbol_id) as callee_def_line
      FROM calls c
      JOIN files f ON c.callee_file_id = f.id
      WHERE c.caller_symbol_id = ?
    `).all(symbol.id);
    return callees.map((c) => ({
      calleeName: c.callee_name,
      calleeFile: c.callee_file,
      calleeLine: c.callee_def_line || c.call_line,
      callLine: c.call_line
    }));
  }
  getUnusedExports(limit = 50, includeInternalOnly = false) {
    const results = this.stmts.getUnusedExportsQuery.all(limit);
    const filtered = results.filter((r) => includeInternalOnly || r.has_self === 0);
    return filtered.map((r) => ({
      name: r.name,
      path: r.path,
      kind: r.kind,
      line: r.line,
      endLine: r.end_line,
      lineCount: r.line_count,
      usedInternally: r.has_self === 1
    }));
  }
  getDuplicateStructures(limit = 20) {
    const hashes = this.db.prepare(`
      SELECT shape_hash, kind, node_count, 
        GROUP_CONCAT(file_id || ':' || line) as members
      FROM shape_hashes
      GROUP BY shape_hash
      HAVING COUNT(*) > 1
      LIMIT ?
    `).all(limit);
    return hashes.map((h) => ({
      shapeHash: h.shape_hash,
      kind: h.kind,
      nodeCount: h.node_count,
      members: h.members.split(",").map((m) => {
        const [fileId, line] = m.split(":");
        const file = this.stmts.getFileById.get(Number(fileId));
        return { path: file?.path || "", line: Number(line) };
      })
    }));
  }
  getNearDuplicates(threshold = 0.8, limit = 50) {
    const signatures = this.db.prepare("SELECT * FROM token_signatures").all();
    if (signatures.length === 0)
      return [];
    const parsed = signatures.map((s) => ({
      ...s,
      minhashArr: new Uint32Array(s.minhash.buffer, s.minhash.byteOffset, s.minhash.byteLength / 4)
    }));
    const LSH_BANDS = 16;
    const ROWS_PER_BAND = 8;
    const MAX_BUCKET_SIZE = 100;
    const buckets = new Map;
    for (let idx = 0;idx < parsed.length; idx++) {
      const mh = parsed[idx].minhashArr;
      for (let b = 0;b < LSH_BANDS; b++) {
        const offset = b * ROWS_PER_BAND;
        const slice = mh.subarray(offset, offset + ROWS_PER_BAND);
        const key = `${b}:${Bun.hash(new Uint8Array(slice.buffer, slice.byteOffset, slice.byteLength))}`;
        let bucket = buckets.get(key);
        if (!bucket) {
          bucket = [];
          buckets.set(key, bucket);
        }
        bucket.push(idx);
      }
    }
    const candidatePairs = new Set;
    for (const members of buckets.values()) {
      if (members.length < 2 || members.length > MAX_BUCKET_SIZE)
        continue;
      for (let i2 = 0;i2 < members.length; i2++) {
        for (let j = i2 + 1;j < members.length; j++) {
          const a = Math.min(members[i2], members[j]);
          const b = Math.max(members[i2], members[j]);
          candidatePairs.add(`${a}:${b}`);
        }
      }
    }
    const results = [];
    for (const pairKey of candidatePairs) {
      const [ai, bi] = pairKey.split(":").map(Number);
      const a = parsed[ai];
      const b = parsed[bi];
      if (a.file_id === b.file_id)
        continue;
      const similarity = jaccardSimilarity(a.minhashArr, b.minhashArr);
      if (similarity >= threshold) {
        const fileA = this.stmts.getFileById.get(a.file_id);
        const fileB = this.stmts.getFileById.get(b.file_id);
        if (fileA && fileB) {
          results.push({
            similarity,
            a: { path: fileA.path, line: a.line, name: a.name },
            b: { path: fileB.path, line: b.line, name: b.name }
          });
        }
      }
    }
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }
  getExternalPackages(limit = 50) {
    const packages = this.db.prepare(`
      SELECT package, COUNT(DISTINCT file_id) as file_count,
        GROUP_CONCAT(DISTINCT specifiers) as specifiers
      FROM external_imports
      GROUP BY package
      ORDER BY file_count DESC
      LIMIT ?
    `).all(limit);
    return packages.map((p) => ({
      package: p.package,
      fileCount: p.file_count,
      specifiers: p.specifiers ? p.specifiers.split(",").map((s) => s.trim()) : []
    }));
  }
  getOrphanFiles(limit = 50) {
    const results = this.stmts.getOrphanFilesQuery.all(limit);
    return results.map((r) => ({
      path: r.path,
      language: r.language,
      lineCount: r.line_count,
      symbolCount: r.symbol_count
    }));
  }
  getCircularDependencies(limit = 20) {
    const edges = this.stmts.getAllEdges.all();
    const files = this.stmts.getAllFiles.all();
    if (files.length === 0 || edges.length === 0)
      return [];
    const adj = new Map;
    const selfEdges = new Set;
    for (const edge of edges) {
      if (edge.source_file_id === edge.target_file_id) {
        selfEdges.add(edge.source_file_id);
        continue;
      }
      let list = adj.get(edge.source_file_id);
      if (!list) {
        list = [];
        adj.set(edge.source_file_id, list);
      }
      list.push(edge.target_file_id);
    }
    const index = new Map;
    const lowlink = new Map;
    const onStack = new Set;
    const stack = [];
    let idx = 0;
    const sccs = [];
    const allNodeIds = files.map((f) => f.id);
    for (const startNode of allNodeIds) {
      if (index.has(startNode))
        continue;
      const callStack = [];
      index.set(startNode, idx);
      lowlink.set(startNode, idx);
      idx++;
      stack.push(startNode);
      onStack.add(startNode);
      callStack.push({ node: startNode, ni: 0 });
      while (callStack.length > 0) {
        const frame = callStack[callStack.length - 1];
        const neighbors = adj.get(frame.node) || [];
        if (frame.ni < neighbors.length) {
          const w = neighbors[frame.ni];
          frame.ni++;
          if (!index.has(w)) {
            index.set(w, idx);
            lowlink.set(w, idx);
            idx++;
            stack.push(w);
            onStack.add(w);
            callStack.push({ node: w, ni: 0 });
          } else if (onStack.has(w)) {
            lowlink.set(frame.node, Math.min(lowlink.get(frame.node), lowlink.get(w)));
          }
        } else {
          if (lowlink.get(frame.node) === index.get(frame.node)) {
            const scc = [];
            let w;
            do {
              w = stack.pop();
              onStack.delete(w);
              scc.push(w);
            } while (w !== frame.node);
            sccs.push(scc);
          }
          callStack.pop();
          if (callStack.length > 0) {
            const parent = callStack[callStack.length - 1];
            lowlink.set(parent.node, Math.min(lowlink.get(parent.node), lowlink.get(frame.node)));
          }
        }
      }
    }
    const filePathMap = new Map;
    for (const f of files)
      filePathMap.set(f.id, f.path);
    const results = [];
    for (const scc of sccs) {
      if (scc.length > 1 || scc.length === 1 && selfEdges.has(scc[0])) {
        results.push({
          cycle: scc.map((id) => filePathMap.get(id) || ""),
          length: scc.length
        });
      }
    }
    return results.sort((a, b) => b.length - a.length).slice(0, limit);
  }
  getChangeImpact(paths, maxDepth = 5) {
    const startIds = [];
    const validPaths = [];
    for (const p of paths) {
      const file = this.stmts.getFileByPath.get(p);
      if (file) {
        startIds.push(file.id);
        validPaths.push(p);
      }
    }
    if (startIds.length === 0)
      return { changedFiles: [], impactedFiles: [], totalAffected: 0 };
    const visited = new Map;
    const queue = [];
    for (const id of startIds) {
      visited.set(id, 0);
      queue.push({ id, depth: 0 });
    }
    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      if (depth >= maxDepth)
        continue;
      const dependents = this.stmts.getEdgesSourceIdsByTarget.all(id);
      for (const dep of dependents) {
        if (!visited.has(dep.source_file_id)) {
          visited.set(dep.source_file_id, depth + 1);
          queue.push({ id: dep.source_file_id, depth: depth + 1 });
        }
      }
    }
    const seedSet = new Set(startIds);
    const impactedFiles = [];
    for (const [fileId, depth] of visited) {
      if (seedSet.has(fileId))
        continue;
      const file = this.stmts.getFileById.get(fileId);
      if (file) {
        impactedFiles.push({ path: file.path, depth });
      }
    }
    impactedFiles.sort((a, b) => a.depth - b.depth);
    return {
      changedFiles: validPaths,
      impactedFiles,
      totalAffected: impactedFiles.length
    };
  }
  getSymbolReferences(name2, limit = 50) {
    const results = [];
    const imports = this.stmts.getRefsByName.all(name2);
    for (const imp of imports) {
      results.push({
        kind: "import",
        path: imp.path,
        line: 0,
        context: `import { ${name2} } from '${imp.import_source}'`
      });
    }
    const calls = this.stmts.getCallsByCalleeName.all(name2);
    for (const call of calls) {
      results.push({
        kind: "call",
        path: call.path,
        line: call.line,
        context: call.caller_name
      });
    }
    const reexports = this.stmts.getReexportsByName.all(name2);
    for (const re of reexports) {
      results.push({
        kind: "reexport",
        path: re.path,
        line: re.line
      });
    }
    return results.slice(0, limit);
  }
  async onFileChanged(path) {
    const absPath = resolve2(path);
    const relPath = relative(this.cwd, absPath);
    try {
      try {
        statSync(absPath);
      } catch {
        await this.removeFile(relPath);
        await this.buildEdges();
        await this.resolveUnresolvedRefs();
        await this.computePageRank();
        await this.buildCallGraph();
        return { status: "ok" };
      }
      await this.indexFile(relPath);
      const file = this.stmts.getFileByPath.get(relPath);
      if (file) {
        this.stmts.deleteEdgesBySource.run([file.id]);
        this.stmts.deleteEdgesByTarget.run([file.id]);
        await this.resolveUnresolvedRefs();
        await this.buildEdges();
        await this.computePageRank();
        await this.buildCallGraph();
      }
      return { status: "ok" };
    } catch (err2) {
      console.error("Error updating file:", err2);
      return { status: "error" };
    }
  }
  async removeFile(relPath) {
    const existing = this.stmts.getFileByPath.get(relPath);
    if (!existing)
      return;
    this.stmts.deleteRefsByFileId.run([existing.id]);
    this.stmts.deleteEdgesBySource.run([existing.id]);
    this.stmts.deleteEdgesByTarget.run([existing.id]);
    this.stmts.deleteSymbolsByFileId.run([existing.id]);
    this.stmts.deleteShapeHashesByFileId.run([existing.id]);
    this.stmts.deleteTokenSignaturesByFileId.run([existing.id]);
    this.stmts.deleteTokenFragmentsByFileId.run([existing.id]);
    this.stmts.deleteExternalImportsByFileId.run([existing.id]);
    this.stmts.deleteFile.run([existing.id]);
  }
  async buildCoChanges() {
    try {
      const { execSync } = await import("child_process");
      execSync("git rev-parse --git-dir", { cwd: this.cwd, stdio: "pipe" });
    } catch {
      return;
    }
    this.db.run("DELETE FROM cochanges");
    let logOutput;
    try {
      const { execFile } = await import("child_process");
      logOutput = await new Promise((resolve3, reject) => {
        execFile("git", ["log", "--pretty=format:---COMMIT---", "--name-only", "-n", "300"], { cwd: this.cwd, timeout: 1e4, maxBuffer: 5000000 }, (err2, stdout) => err2 ? reject(err2) : resolve3(stdout));
      });
    } catch {
      return;
    }
    const pathToId = new Map;
    for (const row of this.db.prepare("SELECT id, path FROM files").all()) {
      pathToId.set(row.path, row.id);
    }
    const pairCounts = new Map;
    const commits = logOutput.split("---COMMIT---").filter((s) => s.trim());
    for (const commit of commits) {
      const files = commit.split(`
`).map((l) => l.trim()).filter((l) => l && pathToId.has(l));
      if (files.length < 2 || files.length > 20)
        continue;
      for (let i2 = 0;i2 < files.length; i2++) {
        for (let j = i2 + 1;j < files.length; j++) {
          const a = files[i2];
          const b = files[j];
          const key = a < b ? `${a}\x00${b}` : `${b}\x00${a}`;
          pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
        }
      }
    }
    if (pairCounts.size === 0)
      return;
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO cochanges (file_id_a, file_id_b, count)
      VALUES (?, ?, ?)
    `);
    const entries = [...pairCounts.entries()].filter(([, count]) => count >= 2);
    const tx = this.db.transaction(() => {
      for (const [key, count] of entries) {
        const [a, b] = key.split("\x00");
        const idA = pathToId.get(a);
        const idB = pathToId.get(b);
        if (idA !== undefined && idB !== undefined) {
          insert.run(idA, idB, count);
        }
      }
    });
    tx();
  }
  async buildCallGraph() {
    const { readFileSync } = await import("fs");
    const regexCache = new Map;
    this.db.run("DELETE FROM calls");
    const filesWithImports = this.stmts.getFilesWithImports.all();
    if (filesWithImports.length === 0)
      return;
    const fileContents = new Map;
    for (const file of filesWithImports) {
      try {
        const content = readFileSync(join3(this.cwd, file.path), "utf-8");
        fileContents.set(file.id, content.split(`
`));
      } catch {}
    }
    const tx = this.db.transaction(() => {
      for (const file of filesWithImports) {
        const lines = fileContents.get(file.id);
        if (!lines)
          continue;
        const imports = this.stmts.getImportsForFile.all(file.id);
        if (imports.length === 0)
          continue;
        const functions = this.stmts.getFunctionsForFile.all(file.id);
        if (functions.length === 0)
          continue;
        const importPatterns = imports.map((imp) => {
          const escaped = imp.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          let re = regexCache.get(imp.name);
          if (!re) {
            re = new RegExp(`\\b${escaped}\\b`);
            regexCache.set(imp.name, re);
          }
          return { name: imp.name, sourceFileId: imp.source_file_id, re };
        });
        for (const func2 of functions) {
          const bodyStart = func2.line;
          const bodyEnd = Math.min(func2.end_line, lines.length);
          const bodyText = lines.slice(bodyStart - 1, bodyEnd).join(`
`);
          for (const imp of importPatterns) {
            if (imp.name === func2.name)
              continue;
            if (imp.re.test(bodyText)) {
              let callLine = func2.line;
              for (let i2 = bodyStart - 1;i2 < bodyEnd; i2++) {
                const ln = lines[i2];
                if (ln !== undefined && imp.re.test(ln)) {
                  callLine = i2 + 1;
                  break;
                }
              }
              const calleeRow = this.stmts.resolveCallee.get(imp.sourceFileId, imp.name);
              this.stmts.insertCall.run(func2.id, imp.name, calleeRow?.id ?? null, imp.sourceFileId, callLine);
            }
          }
        }
      }
    });
    tx();
  }
  async collectEntrypoints() {
    const { readFile: readFile3 } = await import("fs/promises");
    const { existsSync: existsSync4 } = await import("fs");
    const packageJsonPath = join3(this.cwd, "package.json");
    if (!existsSync4(packageJsonPath))
      return;
    try {
      const content = await readFile3(packageJsonPath, "utf-8");
      const pkg = JSON.parse(content);
      const entrypoints = [];
      if (pkg.bin) {
        const binEntries = typeof pkg.bin === "object" ? Object.values(pkg.bin) : [pkg.bin];
        for (const binPath of binEntries) {
          if (typeof binPath === "string" && binPath.startsWith("./dist/")) {
            const srcPath = binPath.replace(/^\.\/dist\//, "./src/").replace(/\.js$/, ".ts");
            const normalizedPath = srcPath.startsWith("./") ? srcPath.slice(2) : srcPath;
            entrypoints.push({ path: normalizedPath, reason: "bin" });
          }
        }
      }
      if (pkg.scripts) {
        for (const script of Object.values(pkg.scripts)) {
          if (typeof script === "string") {
            const match = script.match(/(?:bun|node)\s+(.+?)(?:\s|$)/);
            if (match) {
              const scriptPath = match[1];
              if (scriptPath.endsWith(".ts")) {
                const normalizedPath = scriptPath.startsWith("./") ? scriptPath.slice(2) : scriptPath;
                entrypoints.push({ path: normalizedPath, reason: "script" });
              }
            }
          }
        }
      }
      const insertEntrypoint = this.db.prepare(`
        INSERT OR REPLACE INTO entrypoints (file_id, reason)
        VALUES (?, ?)
      `);
      this.db.transaction(() => {
        for (const entrypoint of entrypoints) {
          const file = this.stmts.getFileByPath.get(entrypoint.path);
          if (file) {
            insertEntrypoint.run(file.id, entrypoint.reason);
          }
        }
      })();
    } catch {}
  }
  linkTestFiles() {
    const testFiles = this.stmts.getTestFiles.all();
    this.db.transaction(() => {
      for (const testFile of testFiles) {
        const sourcePath = testFile.path.replace(/\.test\./, ".").replace(/_test\./, ".").replace(/\.spec\./, ".");
        const source = this.stmts.getFileByPath.get(sourcePath);
        if (source) {
          this.stmts.insertEdge.run([testFile.id, source.id, 1, 1]);
        }
      }
    })();
  }
  rescueOrphans() {
    const orphans = this.db.prepare(`
      SELECT f.id, f.path
      FROM files f
      LEFT JOIN edges e ON e.target_file_id = f.id
      WHERE e.target_file_id IS NULL
        AND f.is_barrel = 0
    `).all();
    if (orphans.length === 0)
      return;
    const orphanIds = new Set(orphans.map((o) => o.id));
    this.db.transaction(() => {
      for (const orphan of orphans) {
        let rescued = false;
        const cochanges = this.stmts.getCoChanges.all(orphan.id, orphan.id, orphan.id);
        for (const cc of cochanges) {
          if (cc.count >= 2 && !orphanIds.has(cc.other_id)) {
            this.stmts.insertEdge.run([cc.other_id, orphan.id, 0.5, 0.5]);
            rescued = true;
            break;
          }
        }
        if (rescued)
          continue;
        const dir = orphan.path.substring(0, orphan.path.lastIndexOf("/"));
        if (dir) {
          const sibling = this.db.prepare(`
            SELECT f.id FROM files f
            WHERE f.path LIKE ? || '/%'
              AND f.id != ?
              AND EXISTS (SELECT 1 FROM edges e WHERE e.target_file_id = f.id)
            LIMIT 1
          `).get(`${dir}`, orphan.id);
          if (sibling) {
            this.stmts.insertEdge.run([sibling.id, orphan.id, 0.3, 0.3]);
          }
        }
      }
    })();
  }
}

// src/graph/worker.ts
var dbPath = process.env["GRAPH_DB_PATH"] || "";
var cwd = process.env["GRAPH_CWD"] || ".";
var rpcServer = new RpcServer;
self.onmessage = (event) => {
  const data = event.data;
  if (data && typeof data === "object" && "callId" in data) {
    const msg = data;
    rpcServer.handle(msg, (response) => {
      postMessage(response);
    });
  }
};
rpcServer.register("scan", async () => {
  await repoMap.scan();
});
rpcServer.register("prepareScan", async () => {
  return repoMap.prepareScan();
});
rpcServer.register("scanBatch", async (args2) => {
  const offset = args2[0] || 0;
  const batchSize = args2[1] || 500;
  return repoMap.scanBatch(offset, batchSize);
});
rpcServer.register("finalizeScan", async () => {
  await repoMap.finalizeScan();
});
rpcServer.register("getStats", async () => {
  return repoMap.getStats();
});
rpcServer.register("getTopFiles", async (args2) => {
  const limit = args2[0] || 20;
  return repoMap.getTopFiles(limit);
});
rpcServer.register("getFileDependents", async (args2) => {
  const path = args2[0] || "";
  return repoMap.getFileDependents(path);
});
rpcServer.register("getFileDependencies", async (args2) => {
  const path = args2[0] || "";
  return repoMap.getFileDependencies(path);
});
rpcServer.register("getFileCoChanges", async (args2) => {
  const path = args2[0] || "";
  return repoMap.getFileCoChanges(path);
});
rpcServer.register("getFileBlastRadius", async (args2) => {
  const path = args2[0] || "";
  return repoMap.getFileBlastRadius(path);
});
rpcServer.register("getFileSymbols", async (args2) => {
  const path = args2[0] || "";
  return repoMap.getFileSymbols(path);
});
rpcServer.register("findSymbols", async (args2) => {
  const query = args2[0] || "";
  const limit = args2[1] || 50;
  return repoMap.findSymbols(query, limit);
});
rpcServer.register("searchSymbolsFts", async (args2) => {
  const query = args2[0] || "";
  const limit = args2[1] || 50;
  return repoMap.searchSymbolsFts(query, limit);
});
rpcServer.register("getSymbolSignature", async (args2) => {
  const path = args2[0] || "";
  const line = args2[1] || 0;
  return repoMap.getSymbolSignature(path, line);
});
rpcServer.register("getCallers", async (args2) => {
  const path = args2[0] || "";
  const line = args2[1] || 0;
  return repoMap.getCallers(path, line);
});
rpcServer.register("getCallees", async (args2) => {
  const path = args2[0] || "";
  const line = args2[1] || 0;
  return repoMap.getCallees(path, line);
});
rpcServer.register("getUnusedExports", async (args2) => {
  const limit = args2[0] || 50;
  const includeInternalOnly = args2[1] || false;
  return repoMap.getUnusedExports(limit, includeInternalOnly);
});
rpcServer.register("getDuplicateStructures", async (args2) => {
  const limit = args2[0] || 20;
  return repoMap.getDuplicateStructures(limit);
});
rpcServer.register("getNearDuplicates", async (args2) => {
  const threshold = args2[0] || 0.8;
  const limit = args2[1] || 50;
  return repoMap.getNearDuplicates(threshold, limit);
});
rpcServer.register("getExternalPackages", async (args2) => {
  const limit = args2[0] || 50;
  return repoMap.getExternalPackages(limit);
});
rpcServer.register("render", async (args2) => {
  const opts = args2[0];
  return repoMap.render(opts);
});
rpcServer.register("getOrphanFiles", async (args2) => {
  const limit = args2[0] || 50;
  return repoMap.getOrphanFiles(limit);
});
rpcServer.register("getCircularDependencies", async (args2) => {
  const limit = args2[0] || 20;
  return repoMap.getCircularDependencies(limit);
});
rpcServer.register("getChangeImpact", async (args2) => {
  const paths = args2[0] || [];
  const maxDepth = args2[1] || 5;
  return repoMap.getChangeImpact(paths, maxDepth);
});
rpcServer.register("getSymbolReferences", async (args2) => {
  const name2 = args2[0] || "";
  const limit = args2[1] || 50;
  return repoMap.getSymbolReferences(name2, limit);
});
rpcServer.register("onFileChanged", async (args2) => {
  const path = args2[0] || "";
  return repoMap.onFileChanged(path);
});
var db = openGraphDatabase(dbPath);
var repoMap = new RepoMap({ cwd, db });
try {
  await repoMap.initialize();
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  postMessage({
    callId: -1,
    error: `Worker initialization failed: ${errorMsg}`
  });
  throw error;
}
