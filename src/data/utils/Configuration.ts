import * as fs from 'fs';
import * as ini from 'ini';

class Configuration {
    private static CONFIG_FILE: string;

    public static setConfigFile(filePath: string): void {
        Configuration.CONFIG_FILE = filePath;
    }

    public static saveConfig(key: string, value: string): void {
        let properties: { [key: string]: string } = {};

        // Leer el archivo de configuración si existe
        if (fs.existsSync(this.CONFIG_FILE)) {
            try {
                const fileContent = fs.readFileSync(this.CONFIG_FILE, 'utf-8');
                properties = ini.parse(fileContent);
            } catch (error) {
                console.error('saveConfig: Error reading the configuration file', error);
            }
        }

        // Establecer la nueva configuración
        properties[key] = value;

        // Guardar la configuración de nuevo en el archivo
        try {
            fs.writeFileSync(this.CONFIG_FILE, ini.stringify(properties));
        } catch (error) {
            console.error('saveConfig: Value could not be saved in config.properties', error);
        }
    }

    public static loadConfig(key: string, defaultValue: string): string {
        if (!fs.existsSync(this.CONFIG_FILE)) {
            // Retorna el valor predeterminado si el archivo no existe
            return defaultValue;
        }

        try {
            const fileContent = fs.readFileSync(this.CONFIG_FILE, 'utf-8');
            const properties = ini.parse(fileContent);
            return properties[key] || defaultValue;
        } catch (error) {
            console.error('loadConfig: Error reading the configuration file', error);
            return defaultValue;
        }
    }
}

export default Configuration;