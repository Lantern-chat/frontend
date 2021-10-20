import React, { useEffect, useState } from "react";
import { fetch } from "lib/fetch";
import dayjs, { parse_shorthand } from "lib/time";
import { ChartZoomPan, DiscreteLegend, DiscreteLegendEntry, LinearXAxis, LinearXAxisTickLabel, LinearXAxisTickSeries, LinearYAxis, LineChart, LineSeries } from "reaviz";

interface IMetric {
    mem: number,
    upload: number,
    reqs: number,
    errs: number,
    conns: number,
    events: number,
    p50: number,
    p95: number,
    p99: number,
}

const METRICS: Array<keyof IMetric> = ["mem", "upload", "reqs", "errs", "conns", "events", "p50", "p95", "p99"];

interface IMetrics {
    ts: dayjs.Dayjs,
    key: string,
    metrics: IMetric,
}

import "./status.scss";
const StatusPage = React.memo(() => {
    let [state, setState] = useState<IMetrics[] | null>(null);

    useEffect(() => {
        let now = dayjs().subtract(2, 'day');

        fetch({
            url: `/api/v1/metrics?resolution=30&start=${now.toISOString()}`,
        }).then(req => {
            if(req.status !== 200) return;

            let raw = req.response;

            let metrics = [];

            for(let ts_key in raw) {
                let ts = parse_shorthand(ts_key);
                if(!ts.isValid()) {
                    console.log("HERE");
                    return;
                }

                metrics.push({
                    ts,
                    key: ts_key,
                    metrics: raw[ts_key],
                });
            }

            if(metrics.length == 0) return;

            metrics.sort((a, b) => a.ts.diff(b.ts));

            setState(metrics);
        });
    }, []);

    if(!state) {
        return (
            <div>Loading...</div>
        );
    }

    return (
        <div className="ln-status-page">
            {METRICS.map(metric => (
                <Metric key={metric} metrics={state!} which={metric} />
            ))}
        </div>
    )
});

interface IMetricProps {
    metrics: IMetrics[],
    which: keyof IMetric,
}

function process(metric: number, which: keyof IMetric): number {
    switch(which) {
        case 'mem':
        case 'upload': {
            return metric / 1_000_000; // bytes to megabytes
        }
        case 'conns':
        case 'events':
            return Math.ceil(metric);

        default: return metric;
    }
}

const TITLES = {
    mem: "Allocated Memory (in Megabytes)",
    upload: "User Uploaded Data (in Megabytes)",
    reqs: "HTTP Requests",
    errs: "Errors (Any)",
    conns: "Gateway Connections",
    events: "Gateway Events",
    p50: "50th Percentile Latency (in Milliseconds)",
    p95: "95th Percentile Latency (in Milliseconds)",
    p99: "99th Percentile Latency (in Milliseconds)",
};

const Metric = React.memo((props: IMetricProps) => {
    let data = props.metrics.map(metrics => ({
        key: metrics.ts.toDate(),
        data: process(metrics.metrics[props.which], props.which),
    }));

    let domain, color = '#4444ff';
    switch(props.which) {
        case 'p50': {
            let max = 0;
            for(let metric of props.metrics) {
                max = Math.max(max, metric.metrics.p50);
            }
            domain = [0, max * 3];
            break;
        }
        case 'p95':
        case 'p99': domain = [0, 1000]; break;
        //case 'errs':
        //case 'reqs': domain = [0, undefined]; break;
    }

    switch(props.which) {
        case 'mem':
        case 'upload': color = 'yellow'; break;
        case 'p50':
        case 'p95':
        case 'p99': color = 'green'; break;
        case 'errs': color = '#f44'; break;
    }

    //if(['mem', 'upload'].includes(props.which)) {
    //    legend = (
    //        <DiscreteLegend
    //            orientation="horizontal"
    //            style={{ justifyContent: 'center' }}
    //            entries={[
    //                <DiscreteLegendEntry label="Megabytes" color={color} />,
    //            ]}
    //        />
    //    )
    //}

    let yAxis = <LinearYAxis domain={domain} />
    let xAxis = <LinearXAxis type="time" tickSeries={
        <LinearXAxisTickSeries
            label={<LinearXAxisTickLabel padding={10} />}
        />
    } />;

    return (
        <div className="ln-metric">
            {TITLES[props.which]}:

            <div className="ln-metric__chart">
                <LineChart data={data} margins={5}
                    yAxis={yAxis} xAxis={xAxis}
                    series={
                        <LineSeries animated={false} interpolation="smooth" colorScheme={color} />
                    }
                />
            </div>
        </div>
    )
});

export default StatusPage;