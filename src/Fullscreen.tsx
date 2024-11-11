import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import MainFullscreen from "./windows/fullscreen/MainFullscreen";
import { store } from "./redux/store";
import "./Fullscreen.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<MainFullscreen />
	</Provider>
);
