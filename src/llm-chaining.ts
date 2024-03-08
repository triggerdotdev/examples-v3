// hide-code
const client = new TriggerClient({ id: "api-reference" });
// end-hide-code

//<> Chain together calls to LLMs or other AI APIs reliably.
export const stripePlanChanged = stripe.task({
  id: "subscription-plan-changed",
  on: "customer.subscription.updated",
  //</>
  run: async ({ payload, context, prepared }) => {
    const user = await db.users.find({ stripeId: payload.customer });
    const planId = getNewPlanId(payload);

    //<> Load data from your DB or vector store simply
    if (user.planId !== planId) {
      await db.users.update(user.id, { planId });
      await resend.emails.send({
        to: user.email,
        from: "jane@acme.inc",
        subject: "Your plan has changed",
        html: planEmail(payload),
      });
      //</>
      //<> and stream responses to your client.
      if (isPlanUpgraded(user.planId, planId)) {
        await slack.chat.postMessage({
          text: `Plan upgraded for ${user.email} to ${planId}`,
          channel: "subscriptions",
        });
      }
      //</>
    }
  },
});

// hide-code
const client = new TriggerClient({ id: "api-reference" });
// end-hide-code
