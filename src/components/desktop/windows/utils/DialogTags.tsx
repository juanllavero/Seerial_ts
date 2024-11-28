import { LockIcon } from "@components/utils/IconLibrary";
import { TagsInput } from "react-tag-input-component";

interface DialogTagsProps {
	title: string;
	value: string[];
	setValue: (newValue: string[]) => void;
	lock: boolean;
	setLock: (lock: boolean) => void;
}

const DialogTags = ({
	title,
	value,
	setValue,
	lock,
	setLock,
}: DialogTagsProps) => {
	return (
		<div className="dialog-input-box">
			<span>{title}</span>
			<div className={`dialog-input-lock ${lock ? " locked" : ""}`}>
				<a href="#" onClick={() => setLock(!lock)}>
					<LockIcon />
				</a>
				<TagsInput
               value={value}
               onChange={setValue}
               name={`${title} tagsInput`}
               placeHolder=""
            />
			</div>
		</div>
	);
};

export default DialogTags