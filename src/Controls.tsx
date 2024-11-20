import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import Controls from "windows/videoPlayer/controls";
import { store } from "./redux/store";
import "./Controls.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<Controls />
	</Provider>
);
