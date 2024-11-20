import React from "react";
import ResolvedImage from "./ExternalImage";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface ImageProps {
	id?: string;
	src: string;
	alt: string;
	width?: number;
	height?: number;
	errorSrc: string;
	isRelative: boolean;
	className?: string;
	onLoad?: (e?: any) => void;
}

function Image({
	id,
	src,
	alt,
	width,
	height,
	errorSrc,
	isRelative,
	className,
	onLoad,
}: ImageProps) {
	return (
		<>
			{isRelative ? (
				<ResolvedImage
					id={id && id}
					src={src}
					alt={alt}
					style={
						width &&
						height && {
							width: `${width}px`,
							height: `${height}px`,
						}
					}
					onError={(e: any) => {
						e.target.onerror = null; // To avoid infinite loop
						e.target.src = errorSrc;
					}}
					className={className || ""}
					onLoad={onLoad}
				/>
			) : (
				<LazyLoadImage
					id={id && id}
					src={src}
					alt={alt}
					style={{
						width: `${width}px`,
						height: `${height}px`,
					}}
					onError={(e: any) => {
						e.target.onerror = null; // To avoid infinite loop
						e.target.src = errorSrc;
					}}
					className={className || ""}
					onLoad={onLoad}
				/>
			)}
		</>
	);
}

export default React.memo(Image);
