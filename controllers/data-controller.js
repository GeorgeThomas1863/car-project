import { carSearchAI } from "../src/car-search.js";

export const mainSubmitController = async (req, res) => {
    const params = req.body;
    if (!params) return res.status(400).json({ success: false, message: "No parameters provided" });

    const data = await carSearchAI(params);
    if (!data) return res.status(500).json({ success: false, message: "Failed to search for car" });

    return res.json({ success: true, data });
};