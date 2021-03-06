// This snippet file was generated by processing the source file:
// ./analytics-next/ecommerce.js
//
// To update the snippets in this file, edit the source and then run
// 'npm run snippets'.

// [START analytics_ecommerce_view_item_list_modular]
import { getAnalytics, logEvent } from "firebase/analytics";

// Prepare ecommerce params
const params1 = {
  item_list_id: 'L001',
  item_list_name: 'Related products',
  items: [item_jeggings, item_boots, item_socks]
};

// Log event
const analytics = getAnalytics();
logEvent(analytics, 'view_item_list', params1);
// [END analytics_ecommerce_view_item_list_modular]