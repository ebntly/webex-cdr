"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { CronJob, CronLog } from "webex-cron-dark-api/dist/models";
import { hosts } from "@/lib/hosts";

const { wxCronOps } = hosts;

export default function Page({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const [job, setJob] = useState<CronJob>();
  const [logs, setLogs] = useState<CronLog[]>([]);
  const { setBreadcrumbs } = useSidebar();
  
  useEffect(() => {
    params.then(async ({jobId}) => {
      
      const jobResp = await fetch(`${wxCronOps}/cron-job/${jobId}`);      
      const job = await jobResp.json() as CronJob;
      const logsResp = await fetch(`${wxCronOps}/cron-job/${jobId}/logs?filter={"limit": 20, "order": ["timestamp DESC"]}`);
      const logs = await logsResp.json() as CronLog[];

      setJob(job);
      setLogs(logs);

      setBreadcrumbs([
        {
          label: 'Home',
          url: '/v0',
        },
        {
          label: 'Scheduled Jobs',
          url: '/v0/cron'
        },
        {
          label: job.name
        }
      ])
    });
  }, [params, setBreadcrumbs])

  
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl">{job ? job.name : "Loading job..."}</h1>
      {job 
        ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((item) => (
                <TableRow
                  key={item.id}
                >
                  <TableCell>{new Date(item.timestamp || "").toLocaleString()}</TableCell>
                  <TableCell>{item.message}</TableCell>
                  <TableCell><details><summary>Show data</summary><pre>{(item.data as {error?: string})?.error ? JSON.stringify({error: JSON.parse((item.data as {error: string}).error)}, undefined, 2): JSON.stringify(item.data, undefined, 2 )}</pre></details></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
        : (
          <div>

          </div>
        )
      }
      
    </div>
  )
}