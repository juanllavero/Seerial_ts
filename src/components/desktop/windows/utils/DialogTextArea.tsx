import { LockIcon } from "@components/utils/IconLibrary";

interface DialogTextAreaProps {
	title: string;
	value: string;
	setValue: (newValue: string) => void;
	lock: boolean;
	setLock: (lock: boolean) => void;
}

const DialogTextArea = ({
	title,
	value,
	setValue,
	lock,
	setLock,
}: DialogTextAreaProps) => {
	return (
		<div className="dialog-input-box">
			<span>{title}</span>
			<div className={`dialog-input-lock ${lock ? " locked" : ""}`}>
				<a href="#" onClick={() => setLock(!lock)}>
					<LockIcon />
				</a>
				<textarea
					rows={5}
					value={value}
					onChange={(e) => {
						setLock(true);
						setValue(e.target.value);
					}}
				/>
			</div>
		</div>
	);
};

export default DialogTextArea;
