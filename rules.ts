import fs from "fs";
import { KarabinerRules } from "./types";
import { createLayer, map } from "./utils";

const { setLayer, inLayer } = createLayer("symnav", {
  description: "Symbol and Navigation Layer",
});

const rules: KarabinerRules[] = [
  {
    description: "Hyper Key (Caps Lock)",
    manipulators: [
      {
        description: "Caps Lock -> Hyper Key (⌃⌥⇧⌘)",
        type: "basic",
        from: {
          key_code: "caps_lock",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            key_code: "left_shift",
            modifiers: ["left_command", "left_control", "left_option"],
          },
        ],
      },
    ],
  },
  {
    description: "symnav layer controls",
    manipulators: [
      ...inLayer(0, [
        map("right_command", setLayer(1), {
          description: "Right Command -> Layer ON",
        }),

        map("left_command", "escape", {
          description: "Left Command -> Escape",
        }),
      ]),

      ...inLayer(1, [
        map("left_command", setLayer(0), {
          description: "Left Command -> Layer OFF",
        }),
      ]),
    ],
  },
  {
    description: "Homerow mods and symnav mappings",
    manipulators: [
      ...inLayer(0, [
        map("a", { tap: "a", hold: "left_shift" }),
        map("s", { tap: "s", hold: "left_control" }),
        map("d", { tap: "d", hold: "left_option" }),
        map("f", { tap: "f", hold: "left_command" }),

        map("j", { tap: "j", hold: "right_command" }),
        map("k", { tap: "k", hold: "right_option" }),
        map("l", { tap: "l", hold: "right_control" }),
        map("semicolon", { tap: "semicolon", hold: "right_shift" }),
      ]),

      ...inLayer(1, [
        map("a", { tap: "grave_accent_and_tilde", hold: "left_shift" }),
        map("s", { hold: "left_control" }),
        map("d", { tap: "open_bracket", hold: "left_option" }),
        map("f", { tap: "close_bracket", hold: "left_command" }),

        map("j", { tap: "down_arrow", hold: "right_command" }),
        map("k", { tap: "up_arrow", hold: "right_option" }),
        map("l", { tap: "right_arrow", hold: "right_control" }),
        map("semicolon", { tap: "quote", hold: "right_shift" }),

        map("g", "equal_sign"),
        map("h", "left_arrow"),
        map("c", { key_code: "9", modifiers: ["left_shift"] }),
        map("v", { key_code: "0", modifiers: ["left_shift"] }),
        map("b", "backslash"),
        map("n", "hyphen"),

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
              // These parameters are optimized for home row mods
              "basic.to_delayed_action_delay_milliseconds": 100, // short for responsive typing
              "basic.to_if_held_down_threshold_milliseconds": 100, // short for quick modifier activation
              "basic.to_if_alone_timeout_milliseconds": 150, // moderate to distinguish taps from holds
              "basic.simultaneous_threshold_milliseconds": 50, // short for better multi-key detection
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
