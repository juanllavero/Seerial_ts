import React from "react";
import ResolvedImage from "./ExternalImage";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface ImageProps {
	src: string;
	alt: string;
	width: number;
	height: number;
	errorSrc: string;
	isRelative: boolean;
}

function Image({ src, alt, width, height, errorSrc, isRelative }: ImageProps) {
	return (
		<>
			{isRelative ? (
				<ResolvedImage
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
				/>
			) : (
				<LazyLoadImage
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
				/>
			)}
		</>
	);
}

export default React.memo(Image);
