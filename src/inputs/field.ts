/**
 * What a FormRow tells the kit control inside it, so the row's label names the control and its hint / error describe
 * it: the control takes an id (its own, or one made here), registers it so the label's `htmlFor` points at it, and
 * picks up `aria-describedby` and the invalid state.
 */
import { createContext, useContext, useEffect, useId } from "react";

/** @internal */
export type FieldInfo = {
  /** the id of the row's label element */
  labelId: string;
  /** the hint / error ids, space separated */
  describedBy?: string;
  /** the row shows an error */
  invalid: boolean;
  /** a control inside the row registers its id; the first one is the label's `htmlFor` */
  register: (id: string) => () => void;
};

/** @internal */
export const FieldContext = createContext<FieldInfo | null>(null);

/** @internal joins id lists for aria-describedby / aria-labelledby; undefined when empty */
export const joinIds = (...ids: Array<string | false | null | undefined>) => ids.filter(Boolean).join(" ") || undefined;

/**
 * @internal
 * For a kit control: its id (the one passed, or one made up inside a FormRow) and the row it sits in.
 */
export function useFieldControl(id?: string) {
  const field = useContext(FieldContext);
  const auto = useId();
  const own = id ?? (field ? auto : undefined);
  const register = field?.register;
  useEffect(() => (register && own ? register(own) : undefined), [register, own]);
  return { id: own, field };
}
