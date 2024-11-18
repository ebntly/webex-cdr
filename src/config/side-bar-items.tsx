import { HomeIcon, PersonStanding, Clock, Route, PhoneIncoming } from "lucide-react";
import { ReactElement, ReactNode } from "react";
import { CronJob } from "webex-cron-dark-api/dist/models";
import { Person } from 'webex-proxy-api/dist/schema';
import { hosts } from "@/lib/hosts";

const { wxOps, wxProxy, wxCronOps } = hosts;

export type SidebarData = {
  name: string;
  description: string;
  url: string;
  badge: string;
}

export type SidebarItem = {
  title: string;
  url: string;
  icon: ReactNode;
  active?: boolean;
  hide?: boolean;
  loadData: (filter?: string) => Promise<SidebarData[]>;
  emptyMessage: Omit<SidebarData, 'url'>;
}

export const sideBarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/v0",
    icon: <HomeIcon />,
    emptyMessage: {
      name: 'No favorites 😫',
      description: 'The favorites feature is not available yet.',
      badge: '',
    },
    loadData: () => {
      return Promise.resolve([        
      ]);
    }
  },
  {
    title: "People",
    url: "/v0/people",
    icon: <PersonStanding />,
    emptyMessage: {
      name: 'No results',
      description: 'Search above to list available users.',
      badge: '',
    },
    loadData: async (filter) => {
      if (!filter) return Promise.resolve([]);
        
      const response = await fetch(`${wxProxy}/people?displayName=${filter}`);      
      const data = await response.json() as Person[];

      return data.map((item) => ({
        name: item.displayName,
        description: item.emails[0],
        url: `/v0/people/${item.id}`,
        badge: item.phoneNumbers.find((item: any) => item.type === 'work_extension')!.value
      }))
    }
  },
  {
    title: 'CDR',
    url: '/v0/cdr',
    icon: <PhoneIncoming />,
    emptyMessage: {
      name: 'No results',
      description: 'Edit search above to list available CDR filters.',
      badge: '',
    },
    loadData: async (filter?: string) => {
      const filters = filter ? filter?.split('') : [];
      const now = new Date();
      const lastHour = new Date(now.setHours(now.getHours() - 1));
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfYesterday = new Date(now.setDate(now.getDate() - 1));
      const startOfThisWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const items = [
        {
          name: 'Last Hour',
          description: 'Show CDR entries for the last hour',
          url: `/v0/cdr?where=${JSON.stringify({
              startTime:{
                gte: lastHour.toISOString(),
              }
          })}&order={"startTime":"DESC"}`,
          badge: ''
        },
        {
          name: 'Today',
          description: 'Show CDR entries for today',
          url: `/v0/cdr?where=${JSON.stringify({
              startTime: {
                gte:startOfDay.toISOString()
              },
          })}&order={"startTime":"DESC"}`,
          badge: ''
        },
        {          
          name: 'Yesterday',
          description: 'Show CDR entries for yesterday',
          url: `/v0/cdr?where=${JSON.stringify({
            startTime: {
              between: [startOfYesterday.toISOString(), startOfDay.toISOString()]
            },
          })}&order={"startTime":"DESC"}`,
          badge: ''
        },
        {
          name: 'This Week',
          description: 'Show CDR entries for this week',
          url: `/v0/cdr?where=${JSON.stringify({
            reportTime: { gte: startOfThisWeek.toISOString()}
          })}&order={"reportTime": "DESC"}}`,
          badge: ''
        },
      ];

      return Promise.resolve(items.filter((item) => {
        return filters.length === 0 || filters.every((filter) => {
          return item.name.includes(filter) || item.description.includes(filter)
        });
      }));
    }
  },
  {
    title: 'Scheduled Jobs',
    url: '/v0/cron',
    icon: <Clock />,
    emptyMessage: {
      name: 'No scheduled jobs',
      description: 'There are no scheduled jobs yet.',
      badge: '',
    },
    loadData: async () => {
      const response = await fetch(`${wxCronOps}/cron-job/list`).then(async (data) => {
        const json = await data.json();
        const jobs = json as CronJob[];
       
        const getBadge = (item: CronJob) => {
          const nextRun = new Date(item.lastRun).getTime() + (11 * 60 * 1000);
          return new Date(nextRun - Date.now()).toISOString().slice(11, 19);
        };

        return jobs.map((item) => ({
          name: item.name,
          description: new Date(item.lastSuccess).toLocaleString(),
          url: `/v0/cron/${item.id}`,
          badge: getBadge(item)
        }));
      });

      return response;
    }
  },
  {
    title: "Trace",
    url: "/v0/trace",
    icon: <Route />,
    hide: true,
    emptyMessage: {
      name: 'No favorites 😫',
      description: 'The favorites feature is not available yet.',
      badge: '',
    },
    loadData: () => {
      return Promise.resolve([        
      ]);
    }
  },
  {
    title: 'User CDR',
    url: '/v0/people/.*/cdr',
    icon: <PhoneIncoming />,
    hide: true,
    emptyMessage: {
      name: 'No results',
      description: 'Edit search above to list available CDR filters.',
      badge: '',
    },
    loadData: async (filter?: string) => {
      const filters = filter ? filter?.split('') : [];
      const now = new Date();
      const lastHour = new Date(now.setHours(now.getHours() - 1));
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfYesterday = new Date(now.setDate(now.getDate() - 1));
      const startOfThisWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const items = [
        {
          name: 'Last Hour',
          description: 'Show CDR entries for the last hour',
          url: `?where=${JSON.stringify({
            startTime:{
              gte: lastHour.toISOString(),
            }
          })}&order={"startTime":"DESC"}`,
          badge: ''
        },
        {
          name: 'Today',
          description: 'Show CDR entries for today',
          url: `?where=${JSON.stringify({
            startTime: {
              gte:startOfDay.toISOString()
            },
          })}&order={"startTime":"DESC"}`,
          badge: ''
        },
        {          
          name: 'Yesterday',
          description: 'Show CDR entries for yesterday',
          url: `?where=${JSON.stringify({
            startTime: {
              between: [startOfYesterday.toISOString(), startOfDay.toISOString()]
            },
          })}&order={"startTime":"DESC"}`,
          badge: ''
        },
        {
          name: 'This Week',
          description: 'Show CDR entries for this week',
          url: `?where=${JSON.stringify({
            reportTime: { gte: startOfThisWeek.toISOString()}
          })}&order={"reportTime": "DESC"}`,
          badge: ''
        },
      ];

      return Promise.resolve(items.filter((item) => {
        return filters.length === 0 || filters.every((filter) => {
          return item.name.includes(filter) || item.description.includes(filter)
        });
      }));
    }
  },
];
