import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import MainFullscreen from "./windows/fullscreen/MainFullscreen";
import { store } from "./redux/store";
import "./Fullscreen.scss";
import { SectionProvider } from "context/section.context";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<SectionProvider>
			<MainFullscreen />
		</SectionProvider>
	</Provider>
);
