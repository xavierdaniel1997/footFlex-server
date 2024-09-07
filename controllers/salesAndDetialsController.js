import Order from "../models/orderModel.js";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { generateReport } from "../utils/generateReport.js";

const generateSalesReport = async (req, res) => {
  try {
    const {filter, fromDate, toDate} = req.query;

    let startDate, endDate;

    if (fromDate && toDate) {
      startDate = new Date(fromDate);
      endDate = new Date(toDate);
    } else {       
      const today = new Date();
      switch (filter) {
        case "Daily":
          startDate = new startOfDay(today);
          endDate = new endOfDay(today);
          break;
        case "Weekly":
          startDate = new startOfWeek(today);
          endDate = new endOfWeek(today);
          break;
        case "Monthly":
          startDate = new startOfMonth(today); 
          endDate = new endOfMonth(today);
          break;     
        default:
          return res.status(400).json({message: "Invalid filter type"});
      }
    }

    const report = await generateReport(startDate, endDate);   

    return res.status(200).json({message: "Success", report});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Failed to get the sales report "});
  }
};

export {generateSalesReport};
