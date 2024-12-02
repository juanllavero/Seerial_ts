import React, { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface ResolvedImageProps {
	src: string;
	alt?: string;
	[key: string]: any; // Allow other props
}

const ResolvedImage: React.FC<ResolvedImageProps> = ({
	src,
	alt = "",
	...props
}) => {
	const [resolvedPath, setResolvedPath] = useState<string>("");

	useEffect(() => {
		const fetchResolvedPath = async () => {
			// @ts-ignore
			window.electronAPI.getExternalPath(src).then((data: string) => {
					let absolutePath = data;
					setResolvedPath(absolutePath);
				})
				.catch((error: unknown) => {
					if (error instanceof Error) {
						console.error("Error fetching image path:", error.message);
					} else {
						console.error("Unexpected error:", error);
					}
				});
		};

		fetchResolvedPath();
	}, [src]);

	return resolvedPath ? (
		<LazyLoadImage src={resolvedPath} alt={alt} {...props} />
	) : null;
};

export default ResolvedImage;
