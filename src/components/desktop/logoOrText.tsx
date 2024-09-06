import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

export const renderLogoOrText = () => {
    const selectedLibrary = useSelector((state: RootState) => state.data.selectedLibrary);
    const selectedSeries = useSelector((state: RootState) => state.data.selectedSeries);
    const selectedSeason = useSelector((state: RootState) => state.data.selectedSeason);

    if (selectedLibrary && selectedLibrary.type == "Shows"){
        if (selectedSeries && selectedSeries.logoSrc != ""){
            return (
                <img src={"./src/" + selectedSeries.logoSrc}></img>
            )
        }else if (selectedSeries){
            <span id="seriesTitle">{selectedSeries.name}</span>
        }
    }else{
        if (selectedSeason && selectedSeason.logoSrc != ""){
            return (
                <img src={"./src/" + selectedSeason.logoSrc}></img>
            )
        }else if (selectedSeason){
            <span id="seriesTitle">{selectedSeason.name}</span>
        }else if (selectedSeries){
            <span id="seriesTitle">{selectedSeries.name}</span>
        }
    }
}

