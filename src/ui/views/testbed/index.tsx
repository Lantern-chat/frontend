import Adapter from "webrtc-adapter";

export const Testbed = () => {
    return (
        <div>{JSON.stringify(Adapter.browserDetails)}</div>
    );
};
export default Testbed;