import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import MainFullscreen from "./windows/fullscreen/MainFullscreen";
import { store } from "./redux/store";
import "./Fullscreen.scss";
import { SectionProvider } from "context/section.context";
import { FullscreenProvider } from "context/fullscreen.context";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<FullscreenProvider>
			<SectionProvider>
				<MainFullscreen />
			</SectionProvider>
		</FullscreenProvider>
	</Provider>
);
