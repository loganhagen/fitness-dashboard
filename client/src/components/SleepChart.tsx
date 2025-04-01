import { Card, CardContent, Typography, Stack, Skeleton } from "@mui/material";
import ModeNightIcon from "@mui/icons-material/ModeNight";
import { useEffect, useState } from "react";
import { Sleep, SleepResponse, Summary } from "../../types/api/sleep";
import {
  minutesToHours,
  millisecondsToHours,
  sleepThread,
} from "../../utils/utils";
import { Gauge, gaugeClasses, PieChart } from "@mui/x-charts";

interface SleepData {
  duration: number;
  efficiency: number;
  wake: number;
  light: number;
  deep: number;
}

export default function SleepChart() {
  const [isLoading, setIsLoading] = useState(false);
  const [sleepData, setSleepData] = useState<SleepData>({
    duration: 0,
    efficiency: 0,
    wake: 0,
    light: 0,
    deep: 0,
  });

  useEffect(() => {
    const fetchSleepData = async () => {
      try {
        setIsLoading(true);
        await sleepThread(1000);
        const data = await fetch("http://localhost:3000/sleep-endpoint");
        const res = (await data.json()) as SleepResponse;
        const sleep = res.sleep as Sleep[];
        const summary = res.summary as Summary;

        // There will only be 1 object in the sleep array since it
        // retrieves the previous night's sleep data.
        const sleepData: SleepData = {
          duration: millisecondsToHours(sleep[0].duration),
          efficiency: sleep[0].efficiency,
          wake: minutesToHours(summary.stages.wake),
          light: minutesToHours(summary.stages.light),
          deep: minutesToHours(summary.stages.deep),
        };
        setSleepData(sleepData);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchSleepData();
  }, []);

  if (isLoading) {
    return (
      <Card
        sx={{
          width: "fit-content",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CardContent
          sx={{
            textAlign: "center",
            pb: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Stack direction="row" sx={{ mb: 1 }}>
            <Skeleton variant="text" width={80} height={40} />
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ ml: 1 }}
            />
          </Stack>

          <Stack direction="column" sx={{ alignItems: "center" }}>
            <Skeleton variant="text" width={100} />
            <Skeleton variant="circular" width={100} height={100} />
          </Stack>

          <Stack direction="column" sx={{ alignItems: "center" }}>
            <Skeleton variant="text" width={120} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width={200} height={100} />

            <Stack direction="row" sx={{ mt: 1 }}>
              <Stack direction="column">
                <Skeleton variant="text" width={80} />
              </Stack>
              <Stack direction="column">
                <Skeleton variant="text" width={60} sx={{ ml: 1 }} />
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        width: "fit-content",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <CardContent
        sx={{
          textAlign: "center",
          pb: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Stack direction="row" sx={{ mb: 1 }}>
          <Typography variant="h5" sx={{ mr: 1 }}>
            Sleep
          </Typography>
          <ModeNightIcon />
        </Stack>

        <Stack direction="column" sx={{ alignItems: "center" }}>
          <Typography sx={{ mb: -3 }}>Efficiency</Typography>
          <Gauge
            width={100}
            height={100}
            value={sleepData.efficiency}
            startAngle={-90}
            endAngle={90}
            sx={{
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 15,
                transform: "translate(0px, 0px)",
              },
            }}
            text={({ value }) => `${value}%`}
          />
        </Stack>

        <Stack direction="column" sx={{ alignItems: "center" }}>
          <Typography sx={{ mb: 1 }}>Sleep Stages</Typography>
          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: sleepData.deep, label: "Deep" },
                  { id: 1, value: sleepData.light, label: "Light" },
                  { id: 2, value: sleepData.wake, label: "Wake" },
                ],
              },
            ]}
            width={200}
            height={100}
            slotProps={{
              legend: {
                position: { vertical: "middle", horizontal: "right" },
                itemMarkWidth: 10,
                itemMarkHeight: 10,
                markGap: 5,
                itemGap: 5,
                labelStyle: {
                  fontSize: 10,
                },
              },
            }}
          />
          <Stack direction="row" sx={{ mt: 1 }}>
            <Stack direction="column">
              <Typography>Duration:</Typography>
            </Stack>
            <Stack direction="column">
              <Typography sx={{ ml: 1 }} fontWeight="bold">
                {sleepData?.duration} hrs
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
