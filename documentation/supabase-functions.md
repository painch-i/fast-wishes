Supabase Edge Function: set-auth-email

Goal: Update a user's primary auth email without sending a confirmation email.

Create an Edge Function named `set-auth-email` with the code below. It uses the service role to call the Admin API and mark the new email as confirmed.

File: supabase/functions/set-auth-email/index.ts

```ts
// supabase/functions/set-auth-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const { email } = await req.json().catch(() => ({}));
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get caller user from JWT (provided automatically by invoke from client)
    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwt) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    // Validate token and get user id
    const { data: authed } = await supabase.auth.getUser(jwt);
    const userId = authed.user?.id;
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    // Update primary email as confirmed (no confirmation email sent)
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      email,
      email_confirm: true,
    });
    if (error) throw error;

    return new Response(JSON.stringify({ user: data.user }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
```

Deploy

- supabase functions deploy set-auth-email
- Ensure the function has access to `SUPABASE_SERVICE_ROLE_KEY` (set by default on Supabase platform).
- From the app, it is invoked via:

```ts
await supabaseClient.functions.invoke("set-auth-email", { body: { email } });
```

Notes

- This changes the primary auth email immediately and marks it confirmed. Use with care.
- If you don't want to bypass confirmation, use `supabase.auth.updateUser({ email })` directly from the client instead.

