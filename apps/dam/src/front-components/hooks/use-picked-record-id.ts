import { useState } from 'react';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';

import { type NamedRecord } from 'src/front-components/types/dam-asset.types';
import {
  readStoredSelection,
  writeStoredSelection,
} from 'src/front-components/utils/stored-selection';

// On a record page the shown record wins; on the standalone page the viewer picks one.
export const usePickedRecordId = ({
  storageKey,
  records,
}: {
  storageKey: string;
  records: NamedRecord[];
}) => {
  const [contextRecordId] = useSelectedRecordIds();
  const [pickedRecordId, setPickedRecordId] = useState<string | null>(() =>
    readStoredSelection(storageKey),
  );

  const isRecordContext = contextRecordId !== undefined;
  const isPickedRecordListed = records.some(
    (record) => record.id === pickedRecordId,
  );
  const recordId = isRecordContext
    ? contextRecordId
    : isPickedRecordListed
      ? pickedRecordId
      : (records[0]?.id ?? null);

  const pickRecordId = (nextRecordId: string | null) => {
    setPickedRecordId(nextRecordId);
    writeStoredSelection(storageKey, nextRecordId);
  };

  return { recordId, isRecordContext, pickRecordId };
};
