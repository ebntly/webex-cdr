"use client"

import { PersonCdrLoader } from "./person-cdr-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Person } from "webex-proxy-api/dist/schema";

type Props = {
  user: Person;
  onRowSelect: (corrId: string) => void;
  corrId?: string
}
export function PersonCdr({user, onRowSelect, corrId}: Props) {
  const phoneNumbers = user.phoneNumbers;
  const workNumber = phoneNumbers.find((item) => item.type ==="work");
  const num = workNumber ? workNumber.value : "+9999999999";
  // tabs Correlated Inbound - Outbound for today sorted earliest first
  return (
    <Card>
      <CardHeader>
        <CardTitle>CDR</CardTitle>
        <CardDescription>Today&apos;s 100 most recent CDR Entries</CardDescription>
      </CardHeader>
      <CardContent>
        <a href={`/v0/people/${user.id}/cdr`}>View all</a>
        <Tabs defaultValue="inbound">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inbound">Inbound</TabsTrigger>
            <TabsTrigger value="outbound">Outbound</TabsTrigger>
          </TabsList>
          <TabsContent value="inbound" className="w-full overflow-auto" style={{maxHeight: "30rem"}}>
            <PersonCdrLoader date={new Date()} direction="called" number={num} key={"inbound-calls"} onRowSelect={onRowSelect} corrId={corrId} />
          </TabsContent>
          <TabsContent value="outbound">
            <PersonCdrLoader date={new Date()} direction="calling" number={num} key={"outbound-calls"} onRowSelect={onRowSelect} corrId={corrId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}