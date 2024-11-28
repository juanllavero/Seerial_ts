import { LockIcon } from "@components/utils/IconLibrary";

interface DialogInputProps<T> {
	type: "text" | "number";
	title: string;
	value: T;
	setValue: (newValue: T) => void;
	lock: boolean;
	setLock: (lock: boolean) => void;
}

const DialogInput = <T,>({
	type,
	title,
	value,
	setValue,
	lock,
	setLock,
}: DialogInputProps<T>) => {
	return (
		<div className="dialog-input-box">
			<span>{title}</span>
			<div className={`dialog-input-lock ${lock ? " locked" : ""}`}>
				<a href="#" onClick={() => setLock(!lock)}>
					<LockIcon />
				</a>
				<input
					type={type}
					value={value as any}
					onChange={(e) => {
						setLock(true);
						setValue(
							type === "number"
								? (Number.parseInt(e.target.value) as T) || (0 as T)
								: (e.target.value as T)
						);
					}}
				/>
			</div>
		</div>
	);
};

export default DialogInput;
