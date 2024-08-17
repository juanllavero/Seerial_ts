import { useDispatch, useSelector } from 'react-redux';
import { selectLibrary } from '../redux/slices/librarySlice';
import { resetSelection } from '../redux/slices/seriesSlice';
import { RootState } from '../redux/store';

export const renderLibrariesList = () => {
    const dispatch = useDispatch();
    const libraries = useSelector((state: RootState) => state.library.libraries);
    const selectedLibrary = useSelector((state: RootState) => state.library.selectedLibrary);

    const handleSelectLibrary = (library: any) => {
        dispatch(selectLibrary(library));
        dispatch(resetSelection());
    };

    return (
        <div className="libraries-list scroll">
            {libraries.map((library) => (
                <button 
                    key={library.id} 
                    className={`libraries-button ${library === selectedLibrary ? 'selected' : ''}`} 
                    title={library.name} 
                    onClick={() => handleSelectLibrary(library)}
                >
                {library.type === "Shows" ? (
                    <svg 
                        id="libraries-button-svg" 
                        aria-hidden="true" 
                        height="24" 
                        viewBox="0 0 48 48" 
                        width="24" 
                        xmlns="http://www.w3.org/2000/svg">
                        <path 
                            clipRule="evenodd" 
                            d="M6 5H42C42.7957 5 43.5587 5.31607 44.1213 5.87868C44.6839 6.44129 45 7.20435 45 8V34C45 34.7957 44.6839 35.5587 44.1213 36.1213C43.5587 36.6839 42.7957 37 42 37H6C5.20435 37 4.44129 36.6839 3.87868 36.1213C3.31607 35.5587 3 34.7957 3 34V8C3 7.20435 3.31607 6.44129 3.87868 5.87868C4.44129 5.31607 5.20435 5 6 5ZM6 34H42V8H6V34Z" 
                            fill="#FFFFFF"
                            fillRule="evenodd">
                        </path>
                        <path d="M36 43V40H12V43H36Z" fill="#FFFFFF"></path>
                    </svg>
                ) : (
                    <svg 
                        id="libraries-button-svg" 
                        aria-hidden="true" 
                        fill="currentColor" 
                        height="24" 
                        viewBox="0 0 48 48" 
                        width="24" 
                        xmlns="http://www.w3.org/2000/svg">
                        <path 
                            clipRule="evenodd" 
                            d="M6 3H42C42.7957 3 43.5587 3.31607 44.1213 3.87868C44.6839 4.44129 45 5.20435 45 6V42C45 42.7957 44.6839 43.5587 44.1213 44.1213C43.5587 44.6839 42.7957 45 42 45H6C5.20435 45 4.44129 44.6839 3.87868 44.1213C3.31607 43.5587 3 42.7957 3 42V6C3 5.20435 3.31607 4.44129 3.87868 3.87868C4.44129 3.31607 5.20435 3 6 3ZM6 42H9L9 38H6V42ZM36 42H12V25H36V42ZM39 42H42V38H39V42ZM39 35H42V30H39V35ZM39 27H42V22H39V27ZM39 19H42V14H39V19ZM39 11H42V6H39V11ZM36 6L12 6L12 22H36V6ZM6 6L9 6V11H6L6 6ZM6 14H9V19H6L6 14ZM6 22H9V27H6L6 22ZM6 30H9V35H6L6 30Z" 
                            fill="#FFFFFF"
                            fillRule="evenodd">
                        </path>
                    </svg>
                )}
                <span className="library-name">
                    {library.name}
                </span>
            </button>
            ))}
        </div>
    )
};