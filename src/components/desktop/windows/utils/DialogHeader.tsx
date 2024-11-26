import { WindowCloseIcon } from "@components/utils/IconLibrary";

function DialogHeader({
	title,
	onClose,
}: {
	title: string;
	onClose: () => void;
}) {
	return (
		<section className="dialog-top">
			<span>{title}</span>
			<button className="close-window-btn" onClick={onClose}>
            <WindowCloseIcon />
			</button>
		</section>
	);
}

export default DialogHeader;
