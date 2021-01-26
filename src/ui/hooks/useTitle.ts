import { useEffect } from "react";

export function useTitle(title: string) {
    useEffect(() => {
        let before = document.title;
        document.title = title;
        return () => { document.title = before; };
    }, [title]);
}