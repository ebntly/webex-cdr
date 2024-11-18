'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConvergedRecording } from 'webex-data/dist/models';
import { Timeline } from 'webex-ops/dist/lib';
import { RecordingObjectDetail } from 'webex-proxy-api/dist/schema';
import { hosts } from "@/lib/hosts";

const { wxProxy, wxOps } = hosts;
type Trace = {
  recordings: ConvergedRecording[];
  timeline: Timeline[];
}

export default function Page({
  params,
}: {
  params: Promise<{ corrId: string }>
}) {
  const [trace, setTrace] = useState<Trace>();
  const [recording, setRecording] = useState<RecordingObjectDetail>();
  const { setBreadcrumbs } = useSidebar();

  const loadRecording = async (recording: ConvergedRecording) => {
    fetch(`${wxProxy}/recordings/${recording.reportId}`).then(async (data) => {
      const recording = await data.json() as RecordingObjectDetail[];
      setRecording(recording[0]);
    });
  };

  useEffect(() => {
    params.then(async ({corrId}) => {
      
      const response = await fetch(`${wxOps}/trace/${corrId}`);      
      const data = await response.json() as Trace;
      setTrace(data);

      setBreadcrumbs([
        {
          label: 'Home',
          url: '/v0',
        },
        {
          label: 'Trace',
          url: '/v0/trace'
        },
        {
          label: data.timeline[0].entry.correlationId!
        }
      ])
    });
  }, [params]);
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl">{trace ? trace.timeline[0].description : "Loading trace..."}</h1>
      <h2 className="text-xl">Call trace</h2>
      <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        {trace?.timeline.map((item) => (
          <Card className="grid grid-cols-2 gap-4 align-top">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div>
                <div>
                  <Label>Duration: </Label>
                  <span><small>{item.duration}</small></span>
                </div>
                <div></div>
                <div>
                  <Label>Type: </Label>
                  <span><small>{item.type}</small></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {trace?.recordings.length !== 0 && (
        <div>
          <h2 className="text-xl">Recordings</h2>
          <div className="flex flex-col gap-4">
            <div>
              {trace?.recordings.map((rec) => (
                <div className="flex flex-row items-center gap-4">                  
                  <Label>{rec.topic}</Label> 
                  <Button disabled={recording && recording.id === rec.reportId} key={rec.id} size={"sm"} variant={"ghost"} onClick={() => loadRecording(rec)}><Play/> Load</Button>
                </div>
              ))}
            </div>
            <Separator />
            <div>
              <h3 className="text-md mb-2">{recording?.topic || "Click a recording to load"}</h3>
              <audio controls src={recording?.temporaryDirectDownloadLinks.audioDownloadLink} />
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}