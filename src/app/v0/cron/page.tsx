"use client";
import { CronJob } from 'webex-cron-dark-api/dist/models';
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { hosts } from "@/lib/hosts";

const { wxCronOps } = hosts;
export default function Page() {
  const { setBreadcrumbs } = useSidebar();
  const [jobs, setJobs] = useState<CronJob[]>([]);

  useEffect(() => {
    fetch(`${wxCronOps}/cron-job/list`).then(async (data) => {
      const jobs = await data.json() as CronJob[];

      setJobs(jobs);

    }).catch((e) => {
      console.log(e)
    });
    
    setBreadcrumbs([
      {
        label: 'Home',
        url: '/v0',
      },
      {
        label: 'Cron Jobs'
      }
    ]);
  }, [])

  return (    
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl">Cron Jobs</h1>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Last Success</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((item) => (
              <TableRow
                key={item.id}
              >
                <TableCell><a href={`/v0/cron/${item.id}`}>{item.name}</a></TableCell>
                <TableCell>{new Date(item.lastRun).toLocaleString()}</TableCell>
                <TableCell>{new Date(item.lastSuccess).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}