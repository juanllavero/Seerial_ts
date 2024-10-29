class ConfigManager {
  private static instance: ConfigManager;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
        ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // Obtener un valor de configuración con valor por defecto
  public async get(key: string, defaultValue: any): Promise<any> {
    // Llama al proceso principal para obtener la configuración
    return await window.ipcRenderer.invoke('get-config', key, defaultValue);
  }

  // Establecer un valor de configuración
  public async set(key: string, value: any): Promise<void> {
    // Llama al proceso principal para establecer la configuración
    await window.ipcRenderer.invoke('set-config', key, value);
  }
}

export default ConfigManager;