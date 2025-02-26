import { To, KeyCode, Manipulator, Conditions } from "./types";

/**
 * Represents a layer in Karabiner
 */
export interface Layer {
  name: string;
  description?: string;
}

/**
 * Create a layer with associated utility functions
 */
export function createLayer(
  name: string,
  options: { description?: string } = {}
) {
  const layer: Layer = {
    name,
    description: options.description,
  };

  return {
    layerName: layer.name,

    // Set the layer's state
    setLayer: (value: number): To => ({
      set_variable: {
        name: layer.name,
        value: value ?? 0,
      },
    }),

    // Create a condition to check if the layer is active
    whenInLayer: (value: number | string = 1): Conditions => ({
      type: "variable_if",
      name: layer.name,
      value,
    }),

    // Apply a layer condition to one or more manipulators
    inLayer: (
      value: number | string | Manipulator | Manipulator[],
      mappings?: Manipulator | Manipulator[]
    ): Manipulator[] => {
      // Handle the case where value is actually the mappings (and layer value defaults to 1)
      if (typeof value === "object") {
        mappings = value;
        value = 1;
      }

      if (!mappings) {
        throw new Error("No mappings provided to inLayer");
      }

      const condition = {
        type: "variable_if" as const,
        name: layer.name,
        value: value as number | string,
      };

      if (Array.isArray(mappings)) {
        return mappings.map((mapping) => ({
          ...mapping,
          conditions: [...(mapping.conditions || []), condition],
        }));
      }

      return [
        {
          ...mappings,
          conditions: [...(mappings.conditions || []), condition],
        },
      ];
    },

    // Create a layer toggle key
    createToggle: (
      fromKey: KeyCode,
      options: {
        toggleIfAlone?: boolean;
        description?: string;
      } = {}
    ): Manipulator => {
      const { toggleIfAlone = true, description } = options;

      const manipulator: Manipulator = {
        type: "basic",
        description: description || `${fromKey} -> ${layer.name} Toggle/Hold`,
        from: {
          key_code: fromKey,
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: layer.name,
              value: 1,
            },
          },
          {
            set_variable: {
              name: `${layer.name}_hold`,
              value: 1,
            },
          },
        ],
        to_after_key_up: [
          {
            set_variable: {
              name: layer.name,
              value: 0,
            },
          },
          {
            set_variable: {
              name: `${layer.name}_hold`,
              value: 0,
            },
          },
        ],
      };

      if (toggleIfAlone) {
        manipulator.to_if_alone = [
          {
            set_variable: {
              name: layer.name,
              value: "toggle",
            },
          },
        ];
      }

      return manipulator;
    },
  };
}

/**
 * Determine if a key is a modifier key
 */
function isModifier(key: string): boolean {
  return (
    key.includes("shift") ||
    key.includes("control") ||
    key.includes("option") ||
    key.includes("command")
  );
}

/**
 * Convert a string key code or To object to a To object
 */
function toToObject(action: KeyCode | To): To {
  if (typeof action === "string") {
    return { key_code: action };
  }
  return action;
}

/**
 * Map a key to an action,
 *
 * the when both "tap" and "hold" actions are defined,
 * use a dual-path activation strategy and lazy modifiers
 * to improve the typing experience.
 * Very important with homerow mods, as it prevents "of course"
 * or "if ()" from triggering cmd(f)+space if you type fast.
 *
 * Details:
 * 1. DUAL-PATH ACTIVATION:
 * - When you tap a key quickly, it immediately sends the
 * character via to_delayed_action.to_if_canceled
 * - When you hold a key, it activates the modifier via
 * to_if_held_down
 * - The halt:true property prevents both actions from
 * happening simultaneously
 *
 * 2. LAZY MODIFIERS:
 * The lazy:true property ensures modifiers only activate
 * when another key is pressed. This prevents accidental modifier
 * activations during normal typing.
 */
export function map(
  fromKey: KeyCode,
  toAction:
    | KeyCode
    | To
    | {
        tap?: KeyCode | To;
        hold?: KeyCode | To;
      },
  options: {
    description?: string;
    conditions?: Conditions[];
  } = {}
): Manipulator {
  const { description, conditions = [] } = options;

  const manipulator: Manipulator = {
    type: "basic",
    description,
    from: {
      key_code: fromKey,
      modifiers: {
        optional: ["any"],
      },
    },
    ...(conditions.length > 0 && { conditions }),
  };

  // Handle string or To object
  if (
    typeof toAction === "string" ||
    "key_code" in toAction ||
    "shell_command" in toAction ||
    "set_variable" in toAction
  ) {
    const action = toToObject(toAction as KeyCode | To);

    // If it's a modifier key, make it a dual-role key
    if (typeof toAction === "string" && isModifier(toAction)) {
      // Traditional implementation for modifiers
      manipulator.to = [action];
      manipulator.to_if_alone = [{ key_code: fromKey }];
    } else {
      manipulator.to = [action];
    }
  }
  // Handle explicit tap/hold configuration
  else if ("tap" in toAction || "hold" in toAction) {
    const { tap, hold } = toAction;

    if (hold && tap) {
      // Check if hold is a modifier key
      const isHoldModifier = typeof hold === "string" && isModifier(hold);

      if (isHoldModifier) {
        // Add halt to prevent double triggering
        manipulator.to_if_alone = [
          {
            ...toToObject(tap),
            halt: true,
          },
        ];

        // Add the modifier with lazy:true to prevent unwanted activations
        // The lazy property ensures the modifier only activates when another key is pressed
        manipulator.to_if_held_down = [
          {
            ...toToObject(hold),
            halt: true,
            lazy: true,
          },
        ];

        // Add to_delayed_action to improve responsiveness when typing quickly. This is the key to the dual-path activation strategy
        manipulator.to_delayed_action = {
          to_if_canceled: [toToObject(tap)],
          to_if_invoked: [],
        };
      } else {
        // Standard implementation for non-modifier hold actions
        manipulator.to_if_alone = [toToObject(tap)];
        manipulator.to_if_held_down = [toToObject(hold)];
      }
    } else {
      // Handle cases where only one of tap or hold is defined
      if (hold) {
        manipulator.to_if_held_down = [toToObject(hold)];
      }

      if (tap) {
        manipulator.to_if_alone = [toToObject(tap)];
      }
    }
  }

  return manipulator;
}

/**
 * Create a layer toggle key
 */
export function createLayerToggle(
  fromKey: KeyCode,
  layer: Layer | string,
  options: {
    toggleIfAlone?: boolean;
    description?: string;
  } = {}
): Manipulator {
  const { toggleIfAlone = true, description } = options;
  const layerName = typeof layer === "string" ? layer : layer.name;

  const manipulator: Manipulator = {
    type: "basic",
    description: description || `${fromKey} -> ${layerName} Toggle/Hold`,
    from: {
      key_code: fromKey,
      modifiers: {
        optional: ["any"],
      },
    },
    to: [
      {
        set_variable: {
          name: layerName,
          value: 1,
        },
      },
      {
        set_variable: {
          name: `${layerName}_hold`,
          value: 1,
        },
      },
    ],
    to_after_key_up: [
      {
        set_variable: {
          name: layerName,
          value: 0,
        },
      },
      {
        set_variable: {
          name: `${layerName}_hold`,
          value: 0,
        },
      },
    ],
  };

  if (toggleIfAlone) {
    manipulator.to_if_alone = [
      {
        set_variable: {
          name: layerName,
          value: "toggle",
        },
      },
    ];
  }

  return manipulator;
}
