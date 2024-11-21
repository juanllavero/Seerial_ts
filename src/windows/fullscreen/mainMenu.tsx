import '../../i18n';
import '../../Fullscreen.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toggleMainMenu } from 'redux/slices/contextMenuSlice';
import { RootState } from 'redux/store';
import "./MainMenu.scss";

function MainMenu() {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const mainMenuOpen = useSelector((state: RootState) => state.contextMenu.mainMenu);

    return (
        <>
            {
                mainMenuOpen ? (
                    <div className="main-menu">
                        <span>SEERIAL</span>
                        <button>
                            {t('settings')}
                        </button>
                        <button>
                            {t('switchToDesktop')}
                        </button>
                        <button onClick={() => dispatch(toggleMainMenu())}>
                            {t('backButton')}
                        </button>
                        <button>
                            {t('exitFullscreen')}
                        </button>
                    </div>
                ) : null
            }
            
        </>
    );
}

export default MainMenu;