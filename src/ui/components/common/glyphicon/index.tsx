import Preact, { useState, useEffect } from "preact/compat";

import "./glyphicon.scss";

interface IGlyphiconProps {
    import: () => Promise<{ default: string }>,
}

export const Glyphicon: Preact.FunctionComponent<IGlyphiconProps> = Preact.memo((props: IGlyphiconProps) => {
    let [data, setData] = useState<string>("");
    useEffect(() => { props.import().then(data => setData(data.default)); }, []);
    return (
        <span className="ln-glyphicon-wrapper">
            <span className="ln-glyphicon" dangerouslySetInnerHTML={{ __html: data }} />
        </span>
    );
});

if(process.env.NODE_ENV !== 'production') {
    Glyphicon.displayName = "Glyphicon";
}