import { useDispatch, useSelector } from 'react-redux';
import { selectLibrary } from '../redux/slices/librarySlice';
import { resetSelection } from '../redux/slices/seriesSlice';
import { RootState } from '../redux/store';

export const renderLibrariesList = () => {
    const dispatch = useDispatch();
    const libraries = useSelector((state: RootState) => state.library.libraries);

    const handleSelectLibrary = (library: any) => {
        dispatch(selectLibrary(library));
        dispatch(resetSelection());
    };

    return (
        <div className="libraries-list scroll">
            {libraries.map((library) => (
                <button key={library.id} onClick={() => handleSelectLibrary(library)}>
                    {library.name}
                </button>
        ))}
        </div>
    )
};