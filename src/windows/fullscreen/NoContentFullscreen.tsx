import { useTranslation } from "react-i18next"

function NoContentFullscreen() {
  const {t} = useTranslation();
  return (
    <div>{t('noLibraryFound')}</div>
  )
}

export default NoContentFullscreen