import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { loadImage, removeImage } from '../../redux/slices/imageLoadedSlice'; 
import ResolvedImage from '@components/Image';

// Componente definido sin React.FC
export function renderMainBackgroundImage() {
    const dispatch = useDispatch();
    const selectedSeason = useSelector((state: RootState) => state.series.selectedSeason);
    const imageLoaded = useSelector((state: RootState) => state.imageLoaded.isImageLoaded);

    const handleImageLoad = () => {
        dispatch(loadImage());
    };

    // Renderiza la imagen de fondo si todos los datos están disponibles
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

export default renderMainBackgroundImage;