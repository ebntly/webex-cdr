"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import { PersonCdrRow } from "./person-cdr-row";
import { hosts } from "@/lib/hosts";
import { CdrEntry } from "webex-data/dist/models";

const { wxOps } = hosts;

interface Props {
  number: string;
  direction: "calling" | "called";
  date: Date;
  corrId?: string;
  onRowSelect: (corrId: string) => void;
}

export function PersonCdrLoader({direction, number, date, onRowSelect, corrId}: Props) {
  const [items, setItems] = useState<string[]>([]);
  const [month, year, day] = [date.getMonth(), date.getFullYear(), date.getDate()]
  const startDate = new Date(year, month, day, 0, 0, 0, 0).toISOString();
  const endDate = new Date(year, month, day, 23,59, 59, 999).toISOString();

  useEffect(() => {
    fetch(`${wxOps}/cdr/${direction}/${number}/100/0?where={"reportTime": {"between": ["${startDate}", "${endDate}"]}}`).then(async (data) => {
      const json = await data.json();
      const items = json.data as CdrEntry[];

      const correlationIds = items.reduce((acc: string[], curr) => {
        if (acc.includes(curr.correlationId!)) return acc;
        acc.push(curr.correlationId!);

        return acc;
      }, [] as string[]);

      setItems(correlationIds);

    }).catch((e) => {
      console.log(e)
    });
  }, [number, direction, date, endDate, startDate]);

  return (
    <div>
      <Table >
        <TableHeader>
          <TableRow>
            <TableHead>Answered</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <PersonCdrRow key={item} correlationId={item} onRowSelect={onRowSelect} isActive={corrId === item} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}