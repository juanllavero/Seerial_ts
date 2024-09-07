import * as fs from 'fs';
import { Utils } from './Utils';
import path from 'path';

export class DataManager {

    public static initFolders = async () => {
        this.createFolder('resources/');
        this.createFolder('resources/img/');
        this.createFolder('resources/img/posters/');
        this.createFolder('resources/img/logos/');
        this.createFolder('resources/img/backgrounds/');
        this.createFolder('resources/img/thumbails/');
        this.createFolder('resources/img/thumbails/video/');
        this.createFolder('resources/img/thumbails/chapters/');
        this.createFolder('resources/img/DownloadCache/');
    }

    public static createFolder = async (folderDir: string) => {
        Utils.getExternalPath(folderDir)
        if (!fs.existsSync(folderDir)) {
            fs.mkdirSync(folderDir);
        }
    }

    public static getImages = async (dirPath: string) => {
        const files = fs.readdirSync(dirPath);
        const images = files.filter((file) =>
            ['.png', '.jpg', '.jpeg', '.gif'].includes(path.extname(file).toLowerCase())
        );
        return images.map((image) => path.join(dirPath, image));
    }
}