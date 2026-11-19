import { isNonEmptyString } from '@sniptt/guards';

import {
  type WhatsappWebhookChange,
  type WhatsappWebhookPayload,
} from 'src/meta/types/whatsapp-webhook-payload.type';

export type WhatsappWorkspaceWebhook = {
  workspaceId: string;
  payload: WhatsappWebhookPayload;
};

// Splits one Meta delivery into one payload per workspace, keyed by the
// phone_number_id claims. Changes for unclaimed numbers are dropped.
export const groupWhatsappWebhookByWorkspace = async ({
  payload,
  findClaimedWorkspaceId,
}: {
  payload: WhatsappWebhookPayload;
  findClaimedWorkspaceId: (phoneNumberId: string) => Promise<string | null>;
}): Promise<WhatsappWorkspaceWebhook[]> => {
  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  const phoneNumberIds = [
    ...new Set(
      entries
        .flatMap(({ changes }) => (Array.isArray(changes) ? changes : []))
        .map(({ value }) => value?.metadata?.phone_number_id)
        .filter(isNonEmptyString),
    ),
  ];

  const workspaceIdByPhoneNumberId = new Map(
    await Promise.all(
      phoneNumberIds.map(
        async (phoneNumberId) =>
          [phoneNumberId, await findClaimedWorkspaceId(phoneNumberId)] as const,
      ),
    ),
  );

  const changesByWorkspaceAndEntry = new Map<
    string,
    Map<string, WhatsappWebhookChange[]>
  >();

  for (const entry of entries) {
    for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
      const phoneNumberId = change.value?.metadata?.phone_number_id;
      const workspaceId = isNonEmptyString(phoneNumberId)
        ? workspaceIdByPhoneNumberId.get(phoneNumberId)
        : undefined;

      if (!isNonEmptyString(workspaceId)) {
        continue;
      }

      const changesByEntry =
        changesByWorkspaceAndEntry.get(workspaceId) ??
        new Map<string, WhatsappWebhookChange[]>();

      changesByEntry.set(entry.id, [
        ...(changesByEntry.get(entry.id) ?? []),
        change,
      ]);
      changesByWorkspaceAndEntry.set(workspaceId, changesByEntry);
    }
  }

  return [...changesByWorkspaceAndEntry].map(
    ([workspaceId, changesByEntry]) => ({
      workspaceId,
      payload: {
        object: payload.object,
        entry: [...changesByEntry].map(([id, changes]) => ({ id, changes })),
      },
    }),
  );
};
