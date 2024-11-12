import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { loadImage, removeImage } from '../../redux/slices/imageLoadedSlice'; 
import ResolvedImage from '@components/image/Image';

export function MainBackgroundImage() {
    const dispatch = useDispatch();
    const selectedSeason = useSelector((state: RootState) => state.data.selectedSeason);
    const imageLoaded = useSelector((state: RootState) => state.imageLoaded.isImageLoaded);

    const handleImageLoad = () => {
        dispatch(loadImage());
    };

    if (selectedSeason && selectedSeason.backgroundSrc !== "") {
        return (
            <div className="main-background">
                <ResolvedImage
                    src={`/resources/img/backgrounds/${selectedSeason.id}/fullBlur.jpg`}
                    onLoad={handleImageLoad}
                    className={imageLoaded ? 'loaded' : ''}
                    alt="Background"
                />
            </div>
        );
    } else {
        dispatch(removeImage());
        return null;
    }
}

export default MainBackgroundImage;