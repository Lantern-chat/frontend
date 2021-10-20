import React, { useEffect, useState } from "react";
import { fetch } from "lib/fetch";
import dayjs, { parse_shorthand } from "lib/time";
import { LinearYAxis, LineChart, LineSeries } from "reaviz";

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
        fetch({
            url: "/api/v1/metrics",
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
        <div className="ln-status-page ln-scroll-y">
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

const DOMAINS = {

};

const Metric = React.memo((props: IMetricProps) => {
    let data = props.metrics.map(metrics => ({
        key: metrics.ts.toDate(),
        data: metrics.metrics[props.which]
    }));

    let yAxis = <LinearYAxis />

    return (
        <div className="ln-metric">
            Graph for {props.which}:

            <div className="ln-metric__chart">
                <LineChart data={data} margins={5} yAxis={yAxis} series={
                    <LineSeries interpolation="smooth" />
                } />
            </div>
        </div>
    )
});

export default StatusPage;