// api/customer.js
import axios from 'axios';

const API_BASE = '/api/customer';

export const getDashboardData = async () => {
  const res = await axios.get(`${API_BASE}/dashboard.php`, {
    withCredentials: true,
  });
  console.log(res.data); // ← check this in browser console
  return res.data;       // { success, username, stats, repairs, transactions, timeline }
};