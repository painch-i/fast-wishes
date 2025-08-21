# Notifications

Fast Wishes relies on custom Ant Design toasts and disables automatic messages from Refine.

- The `Refine` app runs without a `notificationProvider`, preventing default snackbars like "Success".
- Mutations such as `useCreate`, `useUpdate` and `useDelete` pass `successNotification: false` and `errorNotification: false`.
- User feedback is provided through `message.success`, `message.error` and `message.open` with our own copy (e.g. "Souhait ajouté ✨").

This ensures a single, consistent toast per action.
