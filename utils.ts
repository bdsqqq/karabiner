import { To, KeyCode, Manipulator, KarabinerRules, Conditions } from "./types";

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
 * Map a key to an action
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
      manipulator.to = [action];
      manipulator.to_if_alone = [{ key_code: fromKey }];
    } else {
      manipulator.to = [action];
    }
  }
  // Handle explicit tap/hold configuration
  else if ("tap" in toAction || "hold" in toAction) {
    const { tap, hold } = toAction;

    if (hold) {
      manipulator.to = [toToObject(hold)];
    }

    if (tap) {
      manipulator.to_if_alone = [toToObject(tap)];
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
