import { Setting } from "../models/index.js";

export const getSettingsMap = async (settingType) => {
    const rows = await Setting.find({ setting_type: settingType, status: 1 });
    return rows.reduce((acc, row) => {
        acc[row.setting_name] = row.filed_value;
        return acc;
    }, {});
};
