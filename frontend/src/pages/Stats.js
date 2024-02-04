import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useCookies } from "react-cookie";
import { NavBar } from '../components/NavBar';
import { getUserID } from "../hooks/getUserID";
import "./Stats.css"

export const Stats = () => {
  const [loading, setLoading] = useState(false);
  const [cookies] = useCookies(["access_token"])
  const [balance, setBalance] = useState("null");
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('Used'); // Default to 'Used'
  const userID = getUserID();

  const years = Array.from({ length: new Date().getFullYear() - 2019 }, (_, index) => 2020 + index);
  const types = ['Used', 'Remaining'];

  useEffect(() => {
    // Set default values to the current month and year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    setSelectedYear(currentYear);
  }, []);
  
  const fetchBalance = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/auth/balance/${userID}`,
          { headers: { authorization: cookies.access_token } });
      setBalance(response.data.balance.toFixed(2));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    fetchBalance();
    try {
      let response;
      if (selectedType === 'Used') {
        response = await axios.post(`http://localhost:3001/data/getallused/${userID}`, {
          year: selectedYear
        });
      } else if (selectedType === 'Remaining') {
        response = await axios.post(`http://localhost:3001/data/getallremaining/${userID}`, {
          year: selectedYear
        });
      }
      setData(response.data.allRemainingBalances);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedType]);

  return (
    <div className='stats-container'>
      <NavBar />
      <div className='year-type-selection'>
      <div className='top-select'>
        <label>Select Year:</label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className='top-select'>
        <label>Select Type:</label>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div></div>
      <div>
        {loading && <div className='loading-text'><h2>Loading...</h2></div>}
        {!loading && data.length > 0 && (
          <BarChart className='graph' width={1100} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom',  }} />
          <YAxis domain={[0, parseInt(balance)]} label={{ value: 'Balance', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey={selectedType.toLowerCase() + "Balance"} fill="#ff0000" />
        </BarChart>
        )}
      </div>
    </div>
  );
};
