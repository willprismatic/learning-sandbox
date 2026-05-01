import { trigger } from "@prismatic-io/spectral";
import { connectionInput } from "./actions";
import { ShiphawkClient } from "@shiphawk/shiphawk-lib";

const pollForChanges = trigger({
  display: {
    label: "Poll for Changes",
    description: "Poll for new or updated shipments on a schedule",
  },
  inputs: {
    connection: connectionInput,
  },
  scheduleSupport: "required",
  synchronousResponseSupport: "invalid",
  perform: async (context, payload, { connection }) => {
    const client = new ShiphawkClient({ connection });

    const lastPoll = context.instanceState["lastPoll"] as string | undefined;

    const response = await client.shipment.list();
    const allItems = response.data || [];

    const newItems = lastPoll
      ? allItems.filter((item) =>
          new Date(item.updatedAt || item.createdAt) > new Date(lastPoll)
        )
      : allItems;

    const now = new Date().toISOString();

    return {
      payload: {
        ...payload,
        body: {
          data: JSON.stringify(newItems),
          contentType: "application/json",
        },
      },
      instanceState: { lastPoll: now },
    };
  },
});

export default { pollForChanges };
