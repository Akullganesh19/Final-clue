## 2024-06-20 - [Accessibility in Custom Tabs]
**Learning:** Custom tab implementations often lack semantic meaning and keyboard focus indicators, making them difficult for screen reader users and keyboard navigators.
**Action:** Always add `role="tablist"` to the container, `role="tab"` and `aria-selected` to the buttons, and use `focus-visible` to provide clear keyboard focus states without affecting mouse users.
