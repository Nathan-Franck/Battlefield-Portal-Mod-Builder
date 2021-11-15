import { what } from "../../libs/common";

import React from "preact/compat";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import Blockly from "blockly";

const INITIAL_XML =
  '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="text" x="70" y="30"><field name="TEXT"></field></block></xml>';

const INITIAL_TOOLBOX_JSON = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Logic",
      colour: 210,
      contents: [
        {
          kind: "block",
          type: "controls_if",
        },
        {
          kind: "block",
          blockxml:
            '<block type="logic_compare"><field name="OP">EQ</field></block>',
        },
        {
          kind: "block",
          blockxml:
            '<block type="logic_operation"><field name="OP">AND</field></block>',
        },
        {
          kind: "block",
          type: "logic_negate",
        },
        {
          kind: "block",
          blockxml:
            '<block type="logic_boolean"><field name="BOOL">TRUE</field></block>',
        },
        {
          kind: "block",
          type: "logic_null",
        },
        {
          kind: "block",
          type: "logic_ternary",
        },
      ],
    },
    {
      kind: "category",
      name: "Loops",
      colour: 120,
      contents: [
        {
          kind: "block",
          blockxml:
            '<block type="controls_repeat_ext">\n' +
            '      <value name="TIMES">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">10</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="controls_whileUntil">\n' +
            '      <field name="MODE">WHILE</field>\n' +
            "    </block>",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="controls_for">\n' +
            '      <field name="VAR" id="C(8;cYCF}~vSgkxzJ+{O" variabletype="">i</field>\n' +
            '      <value name="FROM">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">1</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="TO">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">10</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="BY">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">1</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="controls_forEach">\n' +
            '      <field name="VAR" id="Cg!CSk/ZJo2XQN3=VVrz" variabletype="">j</field>\n' +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="controls_flow_statements">\n' +
            '      <field name="FLOW">BREAK</field>\n' +
            "    </block>\n",
        },
      ],
    },
    {
      kind: "category",
      name: "Math",
      colour: 230,
      contents: [
        {
          kind: "block",
          blockxml:
            '    <block type="math_round">\n' +
            '      <field name="OP">ROUND</field>\n' +
            '      <value name="NUM">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">3.1</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_number">\n' +
            '      <field name="NUM">0</field>\n' +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_single">\n' +
            '      <field name="OP">ROOT</field>\n' +
            '      <value name="NUM">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">9</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_trig">\n' +
            '      <field name="OP">SIN</field>\n' +
            '      <value name="NUM">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">45</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_constant">\n' +
            '      <field name="CONSTANT">PI</field>\n' +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_number_property">\n' +
            '      <mutation divisor_input="false"></mutation>\n' +
            '      <field name="PROPERTY">EVEN</field>\n' +
            '      <value name="NUMBER_TO_CHECK">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">0</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_arithmetic">\n' +
            '      <field name="OP">ADD</field>\n' +
            '      <value name="A">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">1</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="B">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">1</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_on_list">\n' +
            '      <mutation op="SUM"></mutation>\n' +
            '      <field name="OP">SUM</field>\n' +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_modulo">\n' +
            '      <value name="DIVIDEND">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">64</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="DIVISOR">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">10</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_constrain">\n' +
            '      <value name="VALUE">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">50</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="LOW">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">1</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="HIGH">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">100</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="math_random_int">\n' +
            '      <value name="FROM">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">1</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="TO">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">100</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          type: "math_random_float",
        },
      ],
    },
    {
      kind: "category",
      name: "Text",
      colour: 160,
      contents: [
        {
          kind: "block",
          blockxml:
            '    <block type="text_charAt">\n' +
            '      <mutation at="true"></mutation>\n' +
            '      <field name="WHERE">FROM_START</field>\n' +
            '      <value name="VALUE">\n' +
            '        <block type="variables_get">\n' +
            '          <field name="VAR" id="q@$ZF(L?Zo/z`d{o.Bp!" variabletype="">text</field>\n' +
            "        </block>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text">\n' +
            '      <field name="TEXT"></field>\n' +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_append">\n' +
            '      <field name="VAR" id=":};P,s[*|I8+L^-.EbRi" variabletype="">item</field>\n' +
            '      <value name="TEXT">\n' +
            '        <shadow type="text">\n' +
            '          <field name="TEXT"></field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_length">\n' +
            '      <value name="VALUE">\n' +
            '        <shadow type="text">\n' +
            '          <field name="TEXT">abc</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_isEmpty">\n' +
            '      <value name="VALUE">\n' +
            '        <shadow type="text">\n' +
            '          <field name="TEXT"></field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_indexOf">\n' +
            '      <field name="END">FIRST</field>\n' +
            '      <value name="VALUE">\n' +
            '        <block type="variables_get">\n' +
            '          <field name="VAR" id="q@$ZF(L?Zo/z`d{o.Bp!" variabletype="">text</field>\n' +
            "        </block>\n" +
            "      </value>\n" +
            '      <value name="FIND">\n' +
            '        <shadow type="text">\n' +
            '          <field name="TEXT">abc</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_join">\n' +
            '      <mutation items="2"></mutation>\n' +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_getSubstring">\n' +
            '      <mutation at1="true" at2="true"></mutation>\n' +
            '      <field name="WHERE1">FROM_START</field>\n' +
            '      <field name="WHERE2">FROM_START</field>\n' +
            '      <value name="STRING">\n' +
            '        <block type="variables_get">\n' +
            '          <field name="VAR" id="q@$ZF(L?Zo/z`d{o.Bp!" variabletype="">text</field>\n' +
            "        </block>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_changeCase">\n' +
            '      <field name="CASE">UPPERCASE</field>\n' +
            '      <value name="TEXT">\n' +
            '        <shadow type="text">\n' +
            '          <field name="TEXT">abc</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_trim">\n' +
            '      <field name="MODE">BOTH</field>\n' +
            '      <value name="TEXT">\n' +
            '        <shadow type="text">\n' +
            '          <field name="TEXT">abc</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_print">\n' +
            '      <value name="TEXT">\n' +
            '        <shadow type="text">\n' +
            '          <field name="TEXT">abc</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="text_prompt_ext">\n' +
            '      <mutation type="TEXT"></mutation>\n' +
            '      <field name="TYPE">TEXT</field>\n' +
            '      <value name="TEXT">\n' +
            '        <shadow type="text">\n' +
            '          <field name="TEXT">abc</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
      ],
    },
    {
      kind: "category",
      name: "Lists",
      colour: 259,
      contents: [
        {
          kind: "block",
          blockxml:
            '    <block type="lists_indexOf">\n' +
            '      <field name="END">FIRST</field>\n' +
            '      <value name="VALUE">\n' +
            '        <block type="variables_get">\n' +
            '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
            "        </block>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="lists_create_with">\n' +
            '      <mutation items="0"></mutation>\n' +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="lists_repeat">\n' +
            '      <value name="NUM">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">5</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          type: "lists_length",
        },
        {
          kind: "block",
          type: "lists_isEmpty",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="lists_create_with">\n' +
            '      <mutation items="3"></mutation>\n' +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="lists_getIndex">\n' +
            '      <mutation statement="false" at="true"></mutation>\n' +
            '      <field name="MODE">GET</field>\n' +
            '      <field name="WHERE">FROM_START</field>\n' +
            '      <value name="VALUE">\n' +
            '        <block type="variables_get">\n' +
            '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
            "        </block>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="lists_setIndex">\n' +
            '      <mutation at="true"></mutation>\n' +
            '      <field name="MODE">SET</field>\n' +
            '      <field name="WHERE">FROM_START</field>\n' +
            '      <value name="LIST">\n' +
            '        <block type="variables_get">\n' +
            '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
            "        </block>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="lists_getSublist">\n' +
            '      <mutation at1="true" at2="true"></mutation>\n' +
            '      <field name="WHERE1">FROM_START</field>\n' +
            '      <field name="WHERE2">FROM_START</field>\n' +
            '      <value name="LIST">\n' +
            '        <block type="variables_get">\n' +
            '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
            "        </block>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="lists_split">\n' +
            '      <mutation mode="SPLIT"></mutation>\n' +
            '      <field name="MODE">SPLIT</field>\n' +
            '      <value name="DELIM">\n' +
            '        <shadow type="text">\n' +
            '          <field name="TEXT">,</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="lists_sort">\n' +
            '      <field name="TYPE">NUMERIC</field>\n' +
            '      <field name="DIRECTION">1</field>\n' +
            "    </block>\n",
        },
      ],
    },
    {
      kind: "category",
      name: "Colour",
      colour: 19,
      contents: [
        {
          kind: "block",
          blockxml:
            '    <block type="colour_picker">\n' +
            '      <field name="COLOUR">#ff0000</field>\n' +
            "    </block>\n",
        },
        {
          kind: "block",
          type: "colour_random",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="colour_rgb">\n' +
            '      <value name="RED">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">100</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="GREEN">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">50</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="BLUE">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">0</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
        {
          kind: "block",
          blockxml:
            '    <block type="colour_blend">\n' +
            '      <value name="COLOUR1">\n' +
            '        <shadow type="colour_picker">\n' +
            '          <field name="COLOUR">#ff0000</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="COLOUR2">\n' +
            '        <shadow type="colour_picker">\n' +
            '          <field name="COLOUR">#3333ff</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            '      <value name="RATIO">\n' +
            '        <shadow type="math_number">\n' +
            '          <field name="NUM">0.5</field>\n' +
            "        </shadow>\n" +
            "      </value>\n" +
            "    </block>\n",
        },
      ],
    },
    { kind: "sep" },
    {
      kind: "category",
      name: "Custom Button",
      colour: 19,
      contents: [
        {
          kind: "button",
          text: "A button",
          callbackKey: "myFirstButtonPressed",
        },
      ],
    },
    {
      kind: "category",
      name: "Variables",
      custom: "VARIABLE",
      colour: 330,
    },
    {
      kind: "category",
      name: "Functions",
      custom: "PROCEDURE",
      colour: 290,
    },
  ],
};

const INITIAL_TOOLBOX_XML =
  '<xml xmlns="http://www.w3.org/1999/xhtml" id="toolbox" style="display: none;">\n' +
  '  <category name="Logic" colour="#5C81A6">\n' +
  '    <block type="controls_if"></block>\n' +
  '    <block type="logic_compare">\n' +
  '      <field name="OP">EQ</field>\n' +
  "    </block>\n" +
  '    <block type="logic_operation">\n' +
  '      <field name="OP">AND</field>\n' +
  "    </block>\n" +
  '    <block type="logic_negate"></block>\n' +
  '    <block type="logic_boolean">\n' +
  '      <field name="BOOL">TRUE</field>\n' +
  "    </block>\n" +
  '    <block type="logic_null"></block>\n' +
  '    <block type="logic_ternary"></block>\n' +
  "  </category>\n" +
  '  <category name="Loops" colour="#5CA65C">\n' +
  '    <block type="controls_repeat_ext">\n' +
  '      <value name="TIMES">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">10</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="controls_whileUntil">\n' +
  '      <field name="MODE">WHILE</field>\n' +
  "    </block>\n" +
  '    <block type="controls_for">\n' +
  '      <field name="VAR" id="C(8;cYCF}~vSgkxzJ+{O" variabletype="">i</field>\n' +
  '      <value name="FROM">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">1</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="TO">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">10</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="BY">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">1</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="controls_forEach">\n' +
  '      <field name="VAR" id="Cg!CSk/ZJo2XQN3=VVrz" variabletype="">j</field>\n' +
  "    </block>\n" +
  '    <block type="controls_flow_statements">\n' +
  '      <field name="FLOW">BREAK</field>\n' +
  "    </block>\n" +
  "  </category>\n" +
  '  <category name="Math" colour="#5C68A6">\n' +
  '    <block type="math_round">\n' +
  '      <field name="OP">ROUND</field>\n' +
  '      <value name="NUM">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">3.1</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="math_number">\n' +
  '      <field name="NUM">0</field>\n' +
  "    </block>\n" +
  '    <block type="math_single">\n' +
  '      <field name="OP">ROOT</field>\n' +
  '      <value name="NUM">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">9</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="math_trig">\n' +
  '      <field name="OP">SIN</field>\n' +
  '      <value name="NUM">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">45</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="math_constant">\n' +
  '      <field name="CONSTANT">PI</field>\n' +
  "    </block>\n" +
  '    <block type="math_number_property">\n' +
  '      <mutation divisor_input="false"></mutation>\n' +
  '      <field name="PROPERTY">EVEN</field>\n' +
  '      <value name="NUMBER_TO_CHECK">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">0</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="math_arithmetic">\n' +
  '      <field name="OP">ADD</field>\n' +
  '      <value name="A">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">1</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="B">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">1</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="math_on_list">\n' +
  '      <mutation op="SUM"></mutation>\n' +
  '      <field name="OP">SUM</field>\n' +
  "    </block>\n" +
  '    <block type="math_modulo">\n' +
  '      <value name="DIVIDEND">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">64</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="DIVISOR">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">10</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="math_constrain">\n' +
  '      <value name="VALUE">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">50</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="LOW">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">1</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="HIGH">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">100</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="math_random_int">\n' +
  '      <value name="FROM">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">1</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="TO">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">100</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="math_random_float"></block>\n' +
  "  </category>\n" +
  '  <category name="Text" colour="#5CA68D">\n' +
  '    <block type="text_charAt">\n' +
  '      <mutation at="true"></mutation>\n' +
  '      <field name="WHERE">FROM_START</field>\n' +
  '      <value name="VALUE">\n' +
  '        <block type="variables_get">\n' +
  '          <field name="VAR" id="q@$ZF(L?Zo/z`d{o.Bp!" variabletype="">text</field>\n' +
  "        </block>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="text">\n' +
  '      <field name="TEXT"></field>\n' +
  "    </block>\n" +
  '    <block type="text_append">\n' +
  '      <field name="VAR" id=":};P,s[*|I8+L^-.EbRi" variabletype="">item</field>\n' +
  '      <value name="TEXT">\n' +
  '        <shadow type="text">\n' +
  '          <field name="TEXT"></field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="text_length">\n' +
  '      <value name="VALUE">\n' +
  '        <shadow type="text">\n' +
  '          <field name="TEXT">abc</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="text_isEmpty">\n' +
  '      <value name="VALUE">\n' +
  '        <shadow type="text">\n' +
  '          <field name="TEXT"></field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="text_indexOf">\n' +
  '      <field name="END">FIRST</field>\n' +
  '      <value name="VALUE">\n' +
  '        <block type="variables_get">\n' +
  '          <field name="VAR" id="q@$ZF(L?Zo/z`d{o.Bp!" variabletype="">text</field>\n' +
  "        </block>\n" +
  "      </value>\n" +
  '      <value name="FIND">\n' +
  '        <shadow type="text">\n' +
  '          <field name="TEXT">abc</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="text_join">\n' +
  '      <mutation items="2"></mutation>\n' +
  "    </block>\n" +
  '    <block type="text_getSubstring">\n' +
  '      <mutation at1="true" at2="true"></mutation>\n' +
  '      <field name="WHERE1">FROM_START</field>\n' +
  '      <field name="WHERE2">FROM_START</field>\n' +
  '      <value name="STRING">\n' +
  '        <block type="variables_get">\n' +
  '          <field name="VAR" id="q@$ZF(L?Zo/z`d{o.Bp!" variabletype="">text</field>\n' +
  "        </block>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="text_changeCase">\n' +
  '      <field name="CASE">UPPERCASE</field>\n' +
  '      <value name="TEXT">\n' +
  '        <shadow type="text">\n' +
  '          <field name="TEXT">abc</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="text_trim">\n' +
  '      <field name="MODE">BOTH</field>\n' +
  '      <value name="TEXT">\n' +
  '        <shadow type="text">\n' +
  '          <field name="TEXT">abc</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="text_print">\n' +
  '      <value name="TEXT">\n' +
  '        <shadow type="text">\n' +
  '          <field name="TEXT">abc</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="text_prompt_ext">\n' +
  '      <mutation type="TEXT"></mutation>\n' +
  '      <field name="TYPE">TEXT</field>\n' +
  '      <value name="TEXT">\n' +
  '        <shadow type="text">\n' +
  '          <field name="TEXT">abc</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  "  </category>\n" +
  '  <category name="Lists" colour="#745CA6">\n' +
  '    <block type="lists_indexOf">\n' +
  '      <field name="END">FIRST</field>\n' +
  '      <value name="VALUE">\n' +
  '        <block type="variables_get">\n' +
  '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
  "        </block>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="lists_create_with">\n' +
  '      <mutation items="0"></mutation>\n' +
  "    </block>\n" +
  '    <block type="lists_repeat">\n' +
  '      <value name="NUM">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">5</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="lists_length"></block>\n' +
  '    <block type="lists_isEmpty"></block>\n' +
  '    <block type="lists_create_with">\n' +
  '      <mutation items="3"></mutation>\n' +
  "    </block>\n" +
  '    <block type="lists_getIndex">\n' +
  '      <mutation statement="false" at="true"></mutation>\n' +
  '      <field name="MODE">GET</field>\n' +
  '      <field name="WHERE">FROM_START</field>\n' +
  '      <value name="VALUE">\n' +
  '        <block type="variables_get">\n' +
  '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
  "        </block>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="lists_setIndex">\n' +
  '      <mutation at="true"></mutation>\n' +
  '      <field name="MODE">SET</field>\n' +
  '      <field name="WHERE">FROM_START</field>\n' +
  '      <value name="LIST">\n' +
  '        <block type="variables_get">\n' +
  '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
  "        </block>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="lists_getSublist">\n' +
  '      <mutation at1="true" at2="true"></mutation>\n' +
  '      <field name="WHERE1">FROM_START</field>\n' +
  '      <field name="WHERE2">FROM_START</field>\n' +
  '      <value name="LIST">\n' +
  '        <block type="variables_get">\n' +
  '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
  "        </block>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="lists_split">\n' +
  '      <mutation mode="SPLIT"></mutation>\n' +
  '      <field name="MODE">SPLIT</field>\n' +
  '      <value name="DELIM">\n' +
  '        <shadow type="text">\n' +
  '          <field name="TEXT">,</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="lists_sort">\n' +
  '      <field name="TYPE">NUMERIC</field>\n' +
  '      <field name="DIRECTION">1</field>\n' +
  "    </block>\n" +
  "  </category>\n" +
  '  <category name="Colour" colour="#A6745C">\n' +
  '    <block type="colour_picker">\n' +
  '      <field name="COLOUR">#ff0000</field>\n' +
  "    </block>\n" +
  '    <block type="colour_random"></block>\n' +
  '    <block type="colour_rgb">\n' +
  '      <value name="RED">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">100</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="GREEN">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">50</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="BLUE">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">0</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  '    <block type="colour_blend">\n' +
  '      <value name="COLOUR1">\n' +
  '        <shadow type="colour_picker">\n' +
  '          <field name="COLOUR">#ff0000</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="COLOUR2">\n' +
  '        <shadow type="colour_picker">\n' +
  '          <field name="COLOUR">#3333ff</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  '      <value name="RATIO">\n' +
  '        <shadow type="math_number">\n' +
  '          <field name="NUM">0.5</field>\n' +
  "        </shadow>\n" +
  "      </value>\n" +
  "    </block>\n" +
  "  </category>\n" +
  "  <sep></sep>\n" +
  '  <category name="Custom Button" colour="#A6745C">\n' +
  '    <button text="A button" callbackKey="myFirstButtonPressed"></button>\n' +
  "  </category>\n" +
  '  <category name="Variables" colour="#A65C81" custom="VARIABLE"></category>\n' +
  '  <category name="Functions" colour="#9A5CA6" custom="PROCEDURE"></category>\n' +
  "</xml>";

const INITIAL_TOOLBOX_CATEGORIES = [
  {
    name: "Controls",
    blocks: [
      { type: "controls_if" },
      {
        type: "controls_repeat_ext",
        values: {
          TIMES: {
            type: "math_number",
            shadow: true,
            fields: {
              NUM: 10,
            },
          },
        },
        statements: {
          DO: {
            type: "text_print",
            shadow: true,
            values: {
              TEXT: {
                type: "text",
                shadow: true,
                fields: {
                  TEXT: "abc",
                },
              },
            },
          },
        },
      },
    ],
  },
  {
    name: "Text",
    blocks: [
      { type: "text" },
      {
        type: "text_print",
        values: {
          TEXT: {
            type: "text",
            shadow: true,
            fields: {
              TEXT: "abc",
            },
          },
        },
      },
    ],
  },
];

const ConfigFiles = {
  INITIAL_XML,
  INITIAL_TOOLBOX_XML,
  INITIAL_TOOLBOX_JSON,
  INITIAL_TOOLBOX_CATEGORIES,
};

const TestEditor = () => {
  const [toolboxConfiguration, setToolboxConfiguration] = React.useState<any>(
    ConfigFiles.INITIAL_TOOLBOX_JSON
  );

  React.useEffect(() => {
    window.setTimeout(() => {
      setToolboxConfiguration((prevConfig: any) => ({
        ...prevConfig,
        contents: [
          ...prevConfig.contents,
          {
            kind: "category",
            name: "Dynamically added category",
            contents: [
              { kind: "block", type: "text" },
              {
                kind: "block",
                blockxml:
                  '<block type="text_print"><value name="TEXT"><shadow type="text">abc</shadow></value></block>',
              },
            ],
          },
        ],
      }));
    }, 2000);

    window.setTimeout(() => {
      setToolboxConfiguration((prevConfig: any) => ({
        ...prevConfig,
        contents: [
          ...prevConfig.contents.slice(0, prevConfig.contents.length - 1),
          {
            ...prevConfig.contents[prevConfig.contents.length - 1],
            contents: [{ kind: "block", type: "text" }],
          },
        ],
      }));
    }, 4000);

    window.setTimeout(() => {
      setToolboxConfiguration((prevConfig: any) => ({
        ...prevConfig,
        contents: [
          ...prevConfig.contents.slice(0, prevConfig.contents.length - 1),
        ],
      }));
    }, 10000);
  }, []);

  const onWorkspaceChange = React.useCallback((workspace: any) => {
    workspace.registerButtonCallback("myFirstButtonPressed", () => {
      alert("button is pressed");
    });
    const newXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    document.getElementById("generated-xml")!.innerText = newXml;

    //@ts-ignore
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    //@ts-ignore
    document.getElementById("code").value = code;
  }, []);

  const onXmlChange = React.useCallback((newXml) => {
    document.getElementById("generated-xml")!.innerText = newXml;
  }, []);

  return (
    <BlocklyWorkspace
      toolboxConfiguration={toolboxConfiguration}
      workspaceConfiguration={{
        grid: {
          spacing: 20,
          length: 3,
          colour: "#ccc",
          snap: true,
        },
      }}
      initialXml={ConfigFiles.INITIAL_XML}
      className="fill-height"
      onWorkspaceChange={onWorkspaceChange}
      onXmlChange={onXmlChange}
    />
  );
};

window.addEventListener("load", () => {
  const editor = React.createElement(TestEditor);
  ReactDOM.render(editor, document.getElementById("blockly"));
});


function debounce(func: any, wait: any) {
    let timeout: any = null;
    let later: any = null;
  
    const debouncedFunction = (...args: any) => {
      later = () => {
        timeout = null;
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  
    const cancel = () => {
      if (timeout !== null) {
        clearTimeout(timeout);
        later();
      }
    };
  
    return
}

const propTypes = {
  initialXml: PropTypes.string,
  toolboxConfiguration: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  workspaceConfiguration: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  className: PropTypes.string,
  onWorkspaceChange: PropTypes.func,
  onImportXmlError: PropTypes.func,
  onXmlChange: PropTypes.func,
  onInject: PropTypes.func,
  onDispose: PropTypes.func,
};

const defaultProps: any = {
  initialXml: null,
  toolboxConfiguration: null,
  workspaceConfiguration: null,
  className: null,
  onWorkspaceChange: null,
  onImportXmlError: null,
  onXmlChange: null,
  onInject: null,
  onDispose: null,
};

function BlocklyWorkspace({
  initialXml,
  toolboxConfiguration,
  workspaceConfiguration,
  className,
  onWorkspaceChange,
  onXmlChange,
  onImportXmlError,
  onInject,
  onDispose,
}: any): any {
  const editorDiv = React.useRef(null);
  const { xml } = useBlocklyWorkspace({
    ref: editorDiv,
    initialXml,
    toolboxConfiguration,
    workspaceConfiguration,
    onWorkspaceChange,
    onImportXmlError,
    onInject,
    onDispose,
  });
  const onXmlChangeRef = React.useRef(onXmlChange);
  React.useEffect(() => {
    onXmlChangeRef.current = onXmlChange;
  }, [onXmlChange]);
  React.useEffect(() => {
    if (onXmlChangeRef.current && xml) {
      onXmlChangeRef.current(xml);
    }
  }, [xml]);

  return <div className={className} ref={editorDiv} />;
}

BlocklyWorkspace.propTypes = propTypes;
BlocklyWorkspace.defaultProps = defaultProps;

function importFromXml(xml, workspace, onImportXmlError) {
    try {
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
      return true;
    } catch (e) {
      if (onImportXmlError) {
        onImportXmlError(e);
      }
      return false;
    }
  }
  
  const useBlocklyWorkspace = ({
    ref,
    initialXml,
    toolboxConfiguration,
    workspaceConfiguration,
    onWorkspaceChange,
    onImportXmlError,
    onInject,
    onDispose,
  }) => {
    const [workspace, setWorkspace] = React.useState(null);
    const [xml, setXml] = React.useState(initialXml);
    const [didInitialImport, setDidInitialImport] = React.useState(false);
    const [didHandleNewWorkspace, setDidHandleNewWorkspace] =
      React.useState(false);
  
    // we explicitly don't want to recreate the workspace when the configuration changes
    // so, we'll keep it in a ref and update as necessary in an effect hook
    const workspaceConfigurationRef = React.useRef(workspaceConfiguration);
    React.useEffect(() => {
      workspaceConfigurationRef.current = workspaceConfiguration;
    }, [workspaceConfiguration]);
  
    const toolboxConfigurationRef = React.useRef(toolboxConfiguration);
    React.useEffect(() => {
      toolboxConfigurationRef.current = toolboxConfiguration;
      if (toolboxConfiguration && workspace) {
        workspace.updateToolbox(toolboxConfiguration);
      }
    }, [toolboxConfiguration, workspace]);
  
    const onInjectRef = React.useRef(onInject);
    const onDisposeRef = React.useRef(onDispose);
    React.useEffect(() => {
      onInjectRef.current = onInject;
    }, [onInject]);
    React.useEffect(() => {
      onDisposeRef.current = onDispose;
    }, [onDispose]);
  
    const handleWorkspaceChanged = React.useCallback(
      (newWorkspace) => {
        if (onWorkspaceChange) {
          onWorkspaceChange(newWorkspace);
        }
      },
      [onWorkspaceChange]
    );
  
    // Workspace creation
    React.useEffect(() => {
      const newWorkspace = Blockly.inject(ref.current, {
        ...workspaceConfigurationRef.current,
        toolbox: toolboxConfigurationRef.current,
      });
      setWorkspace(newWorkspace);
      setDidInitialImport(false); // force a re-import if we recreate the workspace
      setDidHandleNewWorkspace(false); // Singal that a workspace change event needs to be sent.
  
      if (onInjectRef.current) {
        onInjectRef.current(newWorkspace);
      }
  
      const onDisposeFunction = onDisposeRef.current;
  
      // Dispose of the workspace when our div ref goes away (Equivalent to didComponentUnmount)
      return () => {
        newWorkspace.dispose();
  
        if (onDisposeFunction) {
          onDisposeFunction(newWorkspace);
        }
      };
    }, [ref]);
  
    // Send a workspace change event when the workspace is created
    React.useEffect(() => {
      if (workspace && !didHandleNewWorkspace) {
        handleWorkspaceChanged(workspace);
      }
    }, [handleWorkspaceChanged, didHandleNewWorkspace, workspace]);
  
    // Workspace change listener
    React.useEffect(() => {
      if (workspace == null) {
        return undefined;
      }
  
      const listener = () => {
        handleWorkspaceChanged(workspace);
      };
      workspace.addChangeListener(listener);
      return () => {
        workspace.removeChangeListener(listener);
      };
    }, [workspace, handleWorkspaceChanged]);
  
    // xmlDidChange callback
    React.useEffect(() => {
      if (workspace == null) {
        return undefined;
      }
  
      const [callback, cancel] = debounce(() => {
        const newXml = Blockly.Xml.domToText(
          Blockly.Xml.workspaceToDom(workspace)
        );
        if (newXml === xml) {
          return;
        }
  
        setXml(newXml);
      }, 200);
  
      workspace.addChangeListener(callback);
  
      return () => {
        workspace.removeChangeListener(callback);
        cancel();
      };
    }, [workspace, xml]);
  
    // Initial Xml Changes
    React.useEffect(() => {
      if (xml && workspace && !didInitialImport) {
        const success = importFromXml(xml, workspace, onImportXmlError);
        if (!success) {
          setXml(null);
        }
        setDidInitialImport(true);
      }
    }, [xml, workspace, didInitialImport, onImportXmlError]);
  
    return { workspace, xml };
  };