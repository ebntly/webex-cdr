"use client";

import { useEffect, useState } from "react";
import { TableCell, TableRow } from "./ui/table";
import { CheckIcon, XIcon } from "lucide-react";
import { Timeline } from "webex-ops/dist/lib/types";
import { hosts } from "@/lib/hosts";

const { wxOps } = hosts;
type Props = {
  correlationId: string
  onRowSelect: (corrId: string) => void;
  isActive: boolean;
}

export function PersonCdrRow({correlationId, onRowSelect, isActive}: Props) {
  const [entryItem, setEntryItem] = useState<Timeline>();

  useEffect(() => {
    fetch(`${wxOps}/trace/${correlationId}`).then(async (resp) => {
      const data = await resp.json() as {timeline: Timeline[]};

      const item = data.timeline[0];
      setEntryItem(item);
    });
  }, [correlationId])

  return (
    entryItem
      ? (
        // Add context menu for viewing the trace, seeing calls and to remote number
        <TableRow
          key={entryItem.entry.id}
          className={isActive ? "bg-input": ""}
          onClick={() => onRowSelect(correlationId)}
        >
          <TableCell>{entryItem.entry.answered === "true" ? <CheckIcon /> : <XIcon />}</TableCell>
          <TableCell>{new Date(entryItem.time).toLocaleString()}</TableCell>
          <TableCell>
            <a href={`/v0/trace/${correlationId}`} title={`${entryItem.entry.callingNumber} -> ${entryItem.entry.calledNumber}`}>{entryItem.description}</a></TableCell>
          <TableCell>{entryItem.duration}</TableCell>
        </TableRow>
      )
      : <TableRow key="empty"></TableRow>
  )
}