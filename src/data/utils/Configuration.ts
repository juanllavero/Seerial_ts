class ConfigManager {
	private static instance: ConfigManager;

	private constructor() {}

	public static getInstance(): ConfigManager {
		if (!ConfigManager.instance) {
			ConfigManager.instance = new ConfigManager();
		}
		return ConfigManager.instance;
	}

	// Get a configuration value with a default value
	public async get(key: string, defaultValue: any): Promise<any> {
		// Call the main process to get the configuration
		return window.ipcRenderer.invoke("get-config", key, defaultValue);
	}

	// Set a configuration value
	public async set(key: string, value: any): Promise<void> {
		// Call the main process to set the configuration
		await window.ipcRenderer.invoke("set-config", key, value);
	}
}

export default ConfigManager;
