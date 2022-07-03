Frontend guidelines:

* Avoid pixel values. Use `em` for properties that should scale with their parent elements, and `rem` for properties that do not.
    * Only exception to this would be 1 or 2 pixel thick borders
* Don't access any SolidJS store values directly in the function component body, as changes will not be tracked
    * Use `createMemo` for a computation used multiple times, otherwise it's fine to inline expressions into JSX attributes
* Consider `Branch`/`Branch.If`/`Branch.ElseIf`/`Branch.Else` for if/if else/else-like chains of show logic instead of `Switch`/`Match`
* Never use React-like conditional rendering patterns. You *must* use `Show` or similar.
* Async/await is your friend
* Try to use direction-less CSS attributes, such as `margin-inline-start` instead of `margin-left`, or `padding-block-start` instead of `padding-top`
    * This helps with languages that use right-to-left flow.
* Children of `Show` and similar that are functions are entirely recreated each time the `when` parameter changes
    * Use regular JSX children instead to avoid this, only `<Show when={value}>{value => <thing/>}</Show>` patterns are affected
* Try to take advantage of SCSS with nesting and prepending using `&`
* Follow BEM-like guidelines for CSS, with `.element`, `.element__subelement`, and `.element--modifier`