"use client";

import { PersonCdr } from "@/components/person-cdr";
import { PersonRecordings } from "@/components/person-recordings";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Person } from 'webex-proxy-api/dist/schema';
import { hosts } from "@/lib/hosts";

const { wxProxy } = hosts;
export default function Page({
  params,
}: {
  params: Promise<{ personId: string }>
}) {
  const [user, setUser] = useState<Person>();
  const [corrId, setCorrId] = useState<string>();
  const { setBreadcrumbs } = useSidebar();
  
  useEffect(() => {
    params.then(async ({personId}) => {
      
      const response = await fetch(`${wxProxy}/people/${personId}`);      
      const data = await response.json() as Person;
      setUser(data);

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
          label: data.displayName
        }
      ])
    });
  }, [params, setBreadcrumbs]);

  
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl">{user ? user.displayName : "Loading user..."}</h1>
      {user 
        ? (
          <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
            <PersonCdr user={user} corrId={corrId} onRowSelect={(id) => setCorrId(id === corrId ? undefined : id)} />
            <PersonRecordings user={user} corrId={corrId} />
          </div>
        )
        : (
          <div>

          </div>
        )
      }
      
    </div>
  )
}