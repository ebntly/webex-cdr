"use client";

import { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ConvergedRecording } from "webex-data/dist/models";
import { hosts } from "@/lib/hosts";

const { wxOps } = hosts;

interface Props {
  userId: string;
  date: Date;
  corrId?: string;
}

type refScroll = (opt: { behavior: 'smooth', block: 'start' }) => void;

export function PersonRecordingsLoader({userId, date, corrId}: Props) {
  const ref = useRef(null);
  // userId from Webex is BAse 64 encoded.
  const cleaned = Buffer.from(userId, 'base64').toString('utf8');
  const userRealId = cleaned.split('/').pop();
  const [items, setItems] = useState<ConvergedRecording[]>([]);
  const [month, year, day] = [date.getMonth(), date.getFullYear(), date.getDate()]
  const startDate = new Date(year, month, day, 0, 0, 0, 0).toISOString();
  const endDate = new Date(year, month, day, 23,59, 59, 999).toISOString();
  function convertSecondsToTime(seconds: number) {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
  }

  useEffect(() => {
    fetch(`${wxOps}/recording/list/100/0?where={"and": [{"createdTime": {"between": ["${startDate}", "${endDate}"]}}, {"ownerId": "${userRealId}"}]}`).then(async (data) => {
      const json = await data.json();
      const items = json.data as ConvergedRecording[];
      setItems(items || []);

    }).catch((e) => {
      console.log(e)
    });
  }, [userId, date, endDate, startDate, userRealId]);

  useEffect(() => {
    if (ref && ref.current) {
      (ref.current as {scrollIntoView: refScroll}).scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    }
  }, [corrId]);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (            
            // Add context menu for viewing the trace or playing the recording in drawer
            <TableRow
              key={item.id}
              className={corrId === item.callSessionId ? 'bg-input': ""}
              ref={corrId === item.callSessionId ? ref : undefined}
            >
              <TableCell>{new Date(item.createdTime).toLocaleString()}</TableCell>
              <TableCell><a href={`/v0/trace/${item.callSessionId}`}>{item.topic}</a></TableCell>
              <TableCell>{convertSecondsToTime(item.duration)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}