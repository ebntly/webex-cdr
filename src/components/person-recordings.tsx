"use client"

import { PersonRecordingsLoader } from "./person-recordings-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Person } from "webex-proxy-api/dist/schema";

type Props = {
  user: Person;
  corrId?: string;
}
export function PersonRecordings({user, corrId}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recordings</CardTitle>
        <CardDescription>Today&apos;s 100 most recent recordings</CardDescription>
      </CardHeader>
      <CardContent>
        <div  className="w-full overflow-auto" style={{maxHeight: "30rem"}}>
          <PersonRecordingsLoader date={new Date()} userId={user.id} corrId={corrId} />
        </div>
      </CardContent>
    </Card>
  );
}