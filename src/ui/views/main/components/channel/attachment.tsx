import { IChannelProps } from "./channel"
import './attachment.scss';
import { MediaPreview } from "ui/components/file";
const Attachment = (props: IChannelProps) => {
    return (
        <div class="ln-attachment-area">
            {props.attaching_files.map(file => (
            <div class="ln-channel-attachment" onClick={() => props.remove_attaching_file(file)}>
                <div class="ln-channel-attachment-delete-btn"> {/*TODO: delete button icon*/}
                    &times;
                </div>
                <MediaPreview file={file} />
                <div class="ln-channel-attachment-file-name"><span>{file.name}</span></div>
            </div>
            ))}
        </div>
    )
}
export default Attachment;