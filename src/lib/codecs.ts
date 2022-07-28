import { createSignal } from "solid-js";

const [SUPPORTS_AVIF, setAvif] = createSignal(false);
const [SUPPORTS_WEBM, setWebM] = createSignal(false);

{
    var AVIF = new Image();
    AVIF.onload = AVIF.onerror = () => setAvif(AVIF.height == 2);
    AVIF.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
}

{
    let v = document.createElement('video');
    setWebM('' != v.canPlayType('video/webm; codecs="vp8, vorbis"'));
    v.remove();
}

export { SUPPORTS_AVIF, SUPPORTS_WEBM };
