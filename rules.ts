import fs from "fs";
import { KarabinerRules } from "./types";
import { createHyperSubLayers, app, open, rectangle, shell } from "./utils";

const rules: KarabinerRules[] = [
  // Define the Layer Toggle key (Caps Lock)
  {
    description: "Layer Toggle/Hold (Caps Lock)",
    manipulators: [
      {
        description: "Caps Lock -> Layer Toggle/Hold",
        from: {
          key_code: "caps_lock",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: "layer",
              value: 1,
            },
          },
          {
            set_variable: {
              name: "layer_hold",
              value: 1,
            },
          },
        ],
        to_after_key_up: [
          {
            set_variable: {
              name: "layer",
              value: 0,
            },
          },
          {
            set_variable: {
              name: "layer_hold",
              value: 0,
            },
          },
        ],
        to_if_alone: [
          {
            set_variable: {
              name: "layer",
              value: "toggle",
            },
          },
        ],
        type: "basic",
      },
      {
        description: "Right Command -> Layer ON",
        from: {
          key_code: "right_command",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: "layer",
              value: 1,
            },
          },
        ],
        type: "basic",
      },
      {
        description: "Left Command -> Layer OFF",
        from: {
          key_code: "left_command",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: "layer",
              value: 0,
            },
          },
        ],
        conditions: [
          {
            type: "variable_if",
            name: "layer",
            value: 1,
          },
        ],
        type: "basic",
      },
    ],
  },
  // Home row mods and layer mappings
  {
    description: "Home Row Mods and Layer Mappings",
    manipulators: [
      // Base home row mods (when layer is not active)
      {
        type: "basic",
        from: {
          key_code: "a",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "left_shift" }],
        to_if_alone: [{ key_code: "a" }],
        conditions: [{ type: "variable_if", name: "layer", value: 0 }],
      },
      {
        type: "basic",
        from: {
          key_code: "s",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "left_control" }],
        to_if_alone: [{ key_code: "s" }],
        conditions: [{ type: "variable_if", name: "layer", value: 0 }],
      },
      {
        type: "basic",
        from: {
          key_code: "d",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "left_option" }],
        to_if_alone: [{ key_code: "d" }],
        conditions: [{ type: "variable_if", name: "layer", value: 0 }],
      },
      {
        type: "basic",
        from: {
          key_code: "f",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "left_command" }],
        to_if_alone: [{ key_code: "f" }],
        conditions: [{ type: "variable_if", name: "layer", value: 0 }],
      },
      // Right-hand home row mods
      {
        type: "basic",
        from: {
          key_code: "j",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "right_command" }],
        to_if_alone: [{ key_code: "j" }],
        conditions: [{ type: "variable_if", name: "layer", value: 0 }],
      },
      {
        type: "basic",
        from: {
          key_code: "k",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "right_option" }],
        to_if_alone: [{ key_code: "k" }],
        conditions: [{ type: "variable_if", name: "layer", value: 0 }],
      },
      {
        type: "basic",
        from: {
          key_code: "l",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "right_control" }],
        to_if_alone: [{ key_code: "l" }],
        conditions: [{ type: "variable_if", name: "layer", value: 0 }],
      },
      {
        type: "basic",
        from: {
          key_code: "semicolon",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "right_shift" }],
        to_if_alone: [{ key_code: "semicolon" }],
        conditions: [{ type: "variable_if", name: "layer", value: 0 }],
      },
      // Layer-active mappings (your existing mappings)
      // A key
      {
        type: "basic",
        from: {
          key_code: "a",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "left_shift" }],
        to_if_alone: [{ key_code: "grave_accent_and_tilde" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // S key
      {
        type: "basic",
        from: {
          key_code: "s",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "left_control" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // D key
      {
        type: "basic",
        from: {
          key_code: "d",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "left_option" }],
        to_if_alone: [{ key_code: "open_bracket" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // F key
      {
        type: "basic",
        from: {
          key_code: "f",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "left_command" }],
        to_if_alone: [{ key_code: "close_bracket" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // G key
      {
        type: "basic",
        from: {
          key_code: "g",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "equal_sign" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // H key
      {
        type: "basic",
        from: {
          key_code: "h",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "left_arrow" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // J key
      {
        type: "basic",
        from: {
          key_code: "j",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "right_command" }],
        to_if_alone: [{ key_code: "down_arrow" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // K key
      {
        type: "basic",
        from: {
          key_code: "k",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "right_option" }],
        to_if_alone: [{ key_code: "up_arrow" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // L key
      {
        type: "basic",
        from: {
          key_code: "l",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "right_control" }],
        to_if_alone: [{ key_code: "right_arrow" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // Semicolon key
      {
        type: "basic",
        from: {
          key_code: "semicolon",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "right_shift" }],
        to_if_alone: [{ key_code: "quote" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // Additional keys
      {
        type: "basic",
        from: { key_code: "c" },
        to: [{ key_code: "9", modifiers: ["left_shift"] }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "v" },
        to: [{ key_code: "0", modifiers: ["left_shift"] }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "b" },
        to: [{ key_code: "backslash" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "n" },
        to: [{ key_code: "hyphen" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      // Number row mappings
      {
        type: "basic",
        from: { key_code: "q" },
        to: [{ key_code: "1" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "w" },
        to: [{ key_code: "2" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "e" },
        to: [{ key_code: "3" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "r" },
        to: [{ key_code: "4" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "t" },
        to: [{ key_code: "5" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "y" },
        to: [{ key_code: "6" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "u" },
        to: [{ key_code: "7" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "i" },
        to: [{ key_code: "8" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "o" },
        to: [{ key_code: "9" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
      {
        type: "basic",
        from: { key_code: "p" },
        to: [{ key_code: "0" }],
        conditions: [{ type: "variable_if", name: "layer", value: 1 }],
      },
    ],
  },
];

fs.writeFileSync(
  "karabiner.json",
  JSON.stringify(
    {
      global: {
        show_in_menu_bar: false,
      },
      profiles: [
        {
          name: "Default",
          complex_modifications: {
            parameters: {
              "basic.simultaneous_threshold_milliseconds": 150,
              "basic.to_delayed_action_delay_milliseconds": 200,
              "basic.to_if_alone_timeout_milliseconds": 200,
              "basic.to_if_held_down_threshold_milliseconds": 200,
            },
            rules,
          },
        },
      ],
    },
    null,
    2
  )
);
