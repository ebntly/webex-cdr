"use client";
import { CdrEntry } from "webex-data/dist/models";
import { Page as PageData } from "webex-ops/dist/lib"
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useSearchParams } from 'next/navigation';
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { hosts } from "@/lib/hosts";
import { Person } from "webex-proxy-api/dist/schema";

const { wxProxy } = hosts;

const { wxOps } = hosts;
// TODO: Add params for user and load user data
export default function Page({
  params,
}: {
  params: Promise<{ personId: string }>
}) {
  const queryString = useSearchParams();
  const { setBreadcrumbs } = useSidebar();

  const [user, setUser] = useState<Person>();


  const [page, setPage] = useState<PageData<CdrEntry>>();
  const [target, setTarget] = useState<string>("");
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  const toDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const filter = queryString.get('where') || `{"startTime":{"gt":"${lastHour.toISOString()}"}}`;
  const order = queryString.get('order') || '{"startTime":"DESC"}';
  const limit = queryString.get('limit') || '20';
  const currentPage = queryString.get('page') || '0';
  const showPrev = parseInt(currentPage) > 0;
  const showNext = page && page.total > (parseInt(limit) * (parseInt(currentPage) + 1));

  useEffect(() => {
    params.then(async ({personId}) => {      
      const response = await fetch(`${wxProxy}/people/${personId}`);      
      const userData = await response.json() as Person;
      const origFilter = JSON.parse(filter);
      const where = origFilter.and ? origFilter : {and: [origFilter]};
      console.log(userData);
      const targetFilter = {or: userData.phoneNumbers.map((phone) => ({calledNumber: phone.value}))};
      where.and.push(targetFilter);
      const cdrData = await fetch(`${wxOps}/cdr/list/${limit}/${currentPage}?where=${encodeURIComponent(JSON.stringify(where))}&order=${order}`)
      const page = await cdrData.json() as PageData<CdrEntry>;
      
      setUser(userData);
      setPage(page);
      setBreadcrumbs([
        {
          label: 'Home',
          url: '/v0',
        },
        {
          label: 'People',
          url: '/v0/people'
        },
        {
          label: userData.displayName,
          url: `/v0/people/${userData.id}`
        },
        {
          label: 'CDR Entries'
        }
      ])
    });
  }, [params, queryString]);

  const getFilterLink = () => {
    if (!user) return '';
    const origFilter = JSON.parse(filter);
    const where = origFilter.and ? origFilter : {and: [origFilter]};

    const targetFilter = {callingNumber: {like: target}};

    where.and.push(targetFilter);
    return `/v0/people/${user.id}/?where=${JSON.stringify(where)}&order=${order}&limit=${limit}&page=0`;
  };
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl">{user ? `${user.displayName} - CDR Entries` : "Loading user..."}</h1>
      {!JSON.parse(filter).and && (
        <div className="flex gap-4">
          <Input defaultValue={target} onKeyUp={(e) => setTarget(e.currentTarget.value)} placeholder="Enter target number"/>
          {target ? (
            <a href={getFilterLink()}>
              <Button>Search</Button>
            </a>
          ): (
            <Button disabled>Search</Button>
          )}      
        </div>
      )}
      {page && (
        <Pagination>
          <PaginationContent>
            {showPrev && (
              <PaginationItem>
                <PaginationPrevious href={`/v0/people/${user?.id}/cdr?limit=${limit}&page=${parseInt(currentPage) - 1}&where=${filter}&order=${order}`} />
              </PaginationItem>
            )}          
            <PaginationItem>
              <small>Showing entries {parseInt(currentPage) * parseInt(limit) + 1} - {Math.min((parseInt(currentPage) + 1) * parseInt(limit), page?.total || 0)} of {page?.total || 0}</small>
            </PaginationItem>
            {showNext && (
              <PaginationItem>
                <PaginationNext href={`/v0/people/${user?.id}/cdr?limit=${limit}&page=${parseInt(currentPage) + 1}&where=${filter}&order=${order}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
        )}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Answered</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Calling Number</TableHead>
              <TableHead>Calling ID</TableHead>
              <TableHead>Called Number</TableHead>
              <TableHead>Called ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page?.data?.map((item) => (
              <TableRow
                key={item.id}
              >
                <TableCell><a href={`/v0/trace/${item.correlationId}`}>Trace</a></TableCell>
                <TableCell>{item.answered === 'true' ? "" : <X className="text-destructive"/>}</TableCell>
                <TableCell>{new Date(item.startTime!).toLocaleString()}</TableCell>
                <TableCell>{item.callingNumber}</TableCell>
                <TableCell>{item.callingLineId}</TableCell>
                <TableCell>{item.calledNumber}</TableCell>
                <TableCell>{item.calledLineId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}