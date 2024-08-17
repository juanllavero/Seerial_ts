import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { loadImage, removeImage } from 'redux/slices/imageLoadedSlice';

export const renderMainBackgroundImage = () => {
    const dispatch = useDispatch();
    const selectedLibrary = useSelector((state: RootState) => state.library.selectedLibrary);
    const selectedSeries = useSelector((state: RootState) => state.series.selectedSeries);
    const imageLoaded = useSelector((state: RootState) => state.imageLoaded.isImageLoaded);

    const handleImageLoad = () => {
        dispatch(loadImage());
    }

    const removeImageLoad = () => {
        dispatch(removeImage());
    }

    if (selectedLibrary && selectedSeries && selectedSeries.seasons.length > 0
        && selectedSeries.seasons[0].backgroundSrc != ""){
        return (
            <div className="main-background">
                <img src={"./src/assets/fullBlur.jpg" || selectedSeries.seasons[0].backgroundSrc}
                onLoad={handleImageLoad} className={imageLoaded ? 'loaded' : ''}></img>
            </div>
        )
    }else{
        removeImageLoad();
    }
}