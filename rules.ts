import fs from "fs";
import { KarabinerRules } from "./types";
import { createLayer, map } from "./utils";

const { setLayer, inLayer } = createLayer("symnav", {
  description: "Symbol and Navigation Layer",
});

const rules: KarabinerRules[] = [
  {
    description: "symnav layer controls",
    manipulators: [
      ...inLayer(0, [
        map("left_command", {
          tap: "escape",
          hold: "left_command",
        }),
        map("right_command", setLayer(1), {
          description: "Right Command -> Layer ON",
        }),
      ]),

      ...inLayer(1, [
        map("left_command", setLayer(0), {
          description: "Left Command -> Layer OFF",
        }),

        map("right_command", setLayer(0), {
          description: "Right Command -> Layer OFF",
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
            // These parameters are optimized for home row mods:
            // - short to_delayed_action_delay (100ms) for responsive typing
            // - short to_if_held_down_threshold (100ms) for quick modifier activation
            // - moderate to_if_alone_timeout (150ms) to distinguish taps from holds
            // - short simultaneous_threshold (50ms) for better multi-key detection
            parameters: {
              "basic.simultaneous_threshold_milliseconds": 50,
              "basic.to_delayed_action_delay_milliseconds": 100,
              "basic.to_if_alone_timeout_milliseconds": 150,
              "basic.to_if_held_down_threshold_milliseconds": 100,
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
