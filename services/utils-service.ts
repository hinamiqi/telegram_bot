import { MENU_SUFFIX } from "../constants/constants";

export class UtilsService {
    static getMenuTrigger(menuId: string): string {
        return menuId + MENU_SUFFIX;
    }

    static getMenuIdFromTrigger(menuTrigger: string): string {
        return menuTrigger.replace(MENU_SUFFIX, '');
    }
} 