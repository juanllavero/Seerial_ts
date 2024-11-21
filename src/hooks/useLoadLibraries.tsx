import { setLibraries } from "@redux/slices/dataSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useLoadLibraries = () => {
	const dispatch = useDispatch();
	const [loading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setTimeout(() => {
			// @ts-ignore
			window.electronAPI.getLibraryData()
				.then((data: any[]) => {
					dispatch(setLibraries(data));
					setIsLoading(false);
					setError(null);
				})
				.catch((error: unknown) => {
					setIsLoading(false);
					setError(error instanceof Error ? error.message : String(error));
				});
		}, 3600);
	}, []);

	return { loading, error, setIsLoading, setError };
};

export default useLoadLibraries;
