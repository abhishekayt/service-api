import { Setting } from "../models/index.js";
import { ensureSettingsSeeded } from "../controller/admin/setting.controller.js";

export const getSettingsMap = async (settingType) => {
    let rows = await Setting.find({ setting_type: settingType, status: 1 });
    if (!rows.length) {
        await ensureSettingsSeeded();
        rows = await Setting.find({ setting_type: settingType, status: 1 });
    }
    return rows.reduce((acc, row) => {
        acc[row.setting_name] = row.filed_value;
        return acc;
    }, {});
};
