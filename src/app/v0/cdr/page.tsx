"use client";
import { CdrEntry } from "webex-data/dist/models";
import { Page as PageData } from "webex-ops/dist/lib"
import { useSidebar } from "@/components/ui/sidebar";
import { Suspense, useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useSearchParams } from 'next/navigation';
import { Route, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { hosts } from "@/lib/hosts";

const { wxOps } = hosts;

export default function Page() {
  const queryString = useSearchParams();
  const { setBreadcrumbs } = useSidebar();

  const [page, setPage] = useState<PageData<CdrEntry>>();
  const [targetType, setTargetType] = useState<"calling" | "called" | "either" | "none">("none");
  const [target, setTarget] = useState<string>("");
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

  const filter = queryString.get('where') || `{"startTime":{"gt":"${lastHour.toISOString()}"}}`;
  const order = queryString.get('order') || '{"startTime":"DESC"}';
  const limit = queryString.get('limit') || '20';
  const currentPage = queryString.get('page') || '0';
  const showPrev = parseInt(currentPage) > 0;
  const showNext = page && page.total > (parseInt(limit) * (parseInt(currentPage) + 1));

  useEffect(() => {
    fetch(`${wxOps}/cdr/list/${limit}/${currentPage}?where=${filter}&order=${order}`).then(async (data) => {
      const page = await data.json() as PageData<CdrEntry>;

      setPage(page);
      setBreadcrumbs([
        {
          label: 'Home',
          url: '/v0',
        },
        {
          label: 'CDR Entries'
        }
      ]);
    }).catch((e) => {
      console.log(e)
    });
  }, [queryString, currentPage, filter, limit, order, setBreadcrumbs]);

  const getFilterLink = () => {
    if (targetType === 'none') return '';
    const origFilter = JSON.parse(filter);
    const where = origFilter.and ? origFilter : {and: [origFilter]};

    const targetFilter = targetType === 'either'
      ? {or: [{callingNumber: { like: target}}, {calledNumber: {like: target}}]}
      : {[`${targetType}Number`]: {like: target}};

    where.and.push(targetFilter);
    return `/v0/cdr?where=${JSON.stringify(where)}&order=${order}&limit=${limit}&page=0`;
  };
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="text-2xl">CDR Entries</h1>
        {!JSON.parse(filter).and && (
          <div className="flex gap-4">
            <Select value={targetType} onValueChange={(value) => setTargetType(value as typeof targetType)}>              
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='neither'>Select target type</SelectItem>
                <SelectItem value="calling">Calling</SelectItem>
                <SelectItem value="called">Called</SelectItem>
                <SelectItem value="either">Calling/called</SelectItem>
              </SelectContent>
            </Select>
            <Input defaultValue={target} onKeyUp={(e) => setTarget(e.currentTarget.value)} placeholder="Enter target number" disabled={targetType === 'none'}/>
            {targetType !== 'none' && target ? (
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
                  <PaginationPrevious href={`/v0/cdr?limit=${limit}&page=${parseInt(currentPage) - 1}&where=${filter}&order=${order}`} />
                </PaginationItem>
              )}          
              <PaginationItem>
                <small>Showing entries {parseInt(currentPage) * parseInt(limit) + 1} - {Math.min((parseInt(currentPage) + 1) * parseInt(limit), page?.total || 0)} of {page?.total || 0}</small>
              </PaginationItem>
              {showNext && (
                <PaginationItem>
                  <PaginationNext href={`/v0/cdr?limit=${limit}&page=${parseInt(currentPage) + 1}&where=${filter}&order=${order}`} />
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
              {page?.data.map((item) => (
                <TableRow
                  key={item.id}
                >
                  <TableCell><a href={`/v0/trace/${item.correlationId}`} title="Trace"><Button size="sm" variant="ghost"><Route /></Button></a></TableCell>
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
    </Suspense>
  )
}