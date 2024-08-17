import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { loadTransparentImage, removeTransparentImage } from 'redux/slices/transparentImageLoadedSlice';

export const renderTransparentImage = () => {
    const dispatch = useDispatch();
    const selectedSeries = useSelector((state: RootState) => state.series.selectedSeries);
    const imageLoaded = useSelector((state: RootState) => state.transparentImageLoaded.isTransparentImageLoaded);

    const handleImageLoad = () => {
        dispatch(loadTransparentImage());
    }

    const removeImageLoad = () => {
        dispatch(removeTransparentImage());
    }

    if (selectedSeries && selectedSeries.seasons.length > 0
        && selectedSeries.seasons[0].backgroundSrc != ""){
        return (
            <div className="background-image">
                <img src="./src/assets/transparencyEffect.png" alt="Season Background"
                onLoad={handleImageLoad} className={imageLoaded ? 'loaded' : ''}></img>
            </div>
        )
    }else{
        removeImageLoad();
    }
}