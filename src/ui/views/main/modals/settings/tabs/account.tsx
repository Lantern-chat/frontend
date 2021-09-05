import { useSelector } from "react-redux";
import { RootState } from "state/root";

export const AccountSettingsTab = () => {
    let user = useSelector((state: RootState) => state.user.user!);

    return (
        <>
            <div>Username: {user.username}</div>
            <div>Email: {user.email}</div>
            <div>Change Password</div>
            <div>2-Factor Authentication</div>
        </>
    );
};