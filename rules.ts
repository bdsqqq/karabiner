import fs from "fs";
import { KarabinerRules, Manipulator } from "./types";
import { createLayer, map } from "./utils";

// Create a layer with all its utilities
const { setLayer, inLayer, createToggle } = createLayer("symnav", {
  description: "Symbol and Navigation Layer",
});

const rules: KarabinerRules[] = [
  // Define the Layer Toggle key (Caps Lock)
  {
    description: "Layer Toggle/Hold (Caps Lock)",
    manipulators: [
      // Caps Lock toggles layer when tapped, activates while held
      createToggle("caps_lock"),

      // Right Command activates layer
      map("right_command", setLayer(1), {
        description: "Right Command -> Layer ON",
      }),

      // Left Command deactivates layer when layer is active
      ...inLayer(
        1,
        map("left_command", setLayer(0), {
          description: "Left Command -> Layer OFF",
        })
      ),
    ],
  },
  // Home row mods and layer mappings
  {
    description: "Home Row Mods and Layer Mappings",
    manipulators: [
      // Base home row mods (when layer is not active)
      ...inLayer(0, [
        map("a", { tap: "a", hold: "left_shift" }),
        map("s", { tap: "s", hold: "left_control" }),
        map("d", { tap: "d", hold: "left_option" }),
        map("f", { tap: "f", hold: "left_command" }),

        // Right-hand home row mods
        map("j", { tap: "j", hold: "right_command" }),
        map("k", { tap: "k", hold: "right_option" }),
        map("l", { tap: "l", hold: "right_control" }),
        map("semicolon", { tap: "semicolon", hold: "right_shift" }),
      ]),

      // Layer-active mappings
      ...inLayer(1, [
        // Home row mods with different tap behavior
        map("a", { tap: "grave_accent_and_tilde", hold: "left_shift" }),
        map("s", { hold: "left_control" }),
        map("d", { tap: "open_bracket", hold: "left_option" }),
        map("f", { tap: "close_bracket", hold: "left_command" }),

        // Right-hand home row mods with arrow keys
        map("j", { tap: "down_arrow", hold: "right_command" }),
        map("k", { tap: "up_arrow", hold: "right_option" }),
        map("l", { tap: "right_arrow", hold: "right_control" }),
        map("semicolon", { tap: "quote", hold: "right_shift" }),

        // Additional keys
        map("g", "equal_sign"),
        map("h", "left_arrow"),
        map("c", { key_code: "9", modifiers: ["left_shift"] }),
        map("v", { key_code: "0", modifiers: ["left_shift"] }),
        map("b", "backslash"),
        map("n", "hyphen"),

        // Number row mappings
        map("q", "1"),
        map("w", "2"),
        map("e", "3"),
        map("r", "4"),
        map("t", "5"),
        map("y", "6"),
        map("u", "7"),
        map("i", "8"),
        map("o", "9"),
        map("p", "0"),
      ]),
    ],
  },
];

// Write the configuration to karabiner.json
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
