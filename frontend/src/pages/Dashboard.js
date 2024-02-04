import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Col, Container, Form, Row, Button, InputGroup } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { getUserID } from "../hooks/getUserID";
import { NavBar } from '../components/NavBar';
import "./Dashboard.css"

export const Dashboard = () => {
  // State variables
  const [cookies] = useCookies(["access_token"])
  const [balance, setBalance] = useState("null");
  const [balanceUsed, setBalanceUsed] = useState("null");
  const [balanceLeft, setBalanceLeft] = useState("null");
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [subMode, setSubMode] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [newSubscriptionName, setNewSubscriptionName] = useState("");
  const [newSubscriptionCost, setNewSubscriptionCost] = useState("");
  const [newBalance, setNewBalance] = useState(""); // Add state for the new budget value
  const [expenseTitle, setExpenseTitle] = useState(""); // State for the new expense title
  const [expenseCost, setExpenseCost] = useState(""); // State for the new expense cost
  const [expenses, setExpenses] = useState([]);
  const [addToSaved, setAddToSaved] = useState(false); // State for adding to saved expenses
  const [selectedSavedExpense, setSelectedSavedExpense] = useState('');
  const [savedExpenses, setSavedExpenses] = useState([]);
  const expensesContainerRef = useRef(null);
  const userID = getUserID();

  // Dummy data (replace with your backend calls)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: new Date().getFullYear() - 2019 }, (_, index) => 2020 + index);

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/auth/balance/${userID}`,
          { headers: { authorization: cookies.access_token } });
      setBalance(response.data.balance.toFixed(2));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsed = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/data/getused/${userID}`,
        {
          month: selectedMonth,
          year: selectedYear,
        },
        {
          headers: { authorization: cookies.access_token },
        }
      );
      setBalanceUsed(response.data.totalUsed.toFixed(2));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRemaining = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/data/getremaining/${userID}`,
        {
          month: selectedMonth,
          year: selectedYear,
        },
        {
          headers: { authorization: cookies.access_token },
        }
      );

      let tempRemaining = response.data.remainingBalance.toFixed(2);

      if (tempRemaining < 0) {
        tempRemaining = 0;
      }

      setBalanceLeft(tempRemaining);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Set default values to current month and year
    const currentDate = new Date();
    const currentMonth = months[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, []); // Empty dependency array ensures that this effect runs only once, similar to componentDidMount

  useEffect(() => {
    if (cookies.access_token) {
      fetchBalance();
      fetchExpenses();
      fetchSubscriptions();
      fetchUsed();
      fetchRemaining();
    }
  }, [])

  const handleUpdateBalance = async () => {
    try {
      const response = await axios.put(`http://localhost:3001/auth/balance/${userID}`, { balance: newBalance },
          { headers: { authorization: cookies.access_token } });
      setBalance(response.data.balance);
      fetchBalance();
      fetchUsed();
      fetchRemaining();
    } catch (err) {
      console.error(err);
    }
    setEditMode(false);
  };

  const handleAddSubscription = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/subscriptions/newsubscription`,
        {
          title: newSubscriptionName,
          cost: newSubscriptionCost,
          monthAdded: selectedMonth,
          yearAdded: selectedYear,
          userID: userID,
        },
        {
          headers: { authorization: cookies.access_token },
        }
      );

      // Update the UI or perform any other necessary actions
      console.log("Subscription added successfully:", response.data);

      // Fetch the updated balance after adding the expense
      fetchSubscriptions();
      fetchBalance();
      fetchExpenses();
      fetchUsed();
      fetchRemaining();

      // Reset the subscription form fields
      setNewSubscriptionName("");
      setNewSubscriptionCost("");

      setSubMode(false);
    } catch (err) {
      console.error("Error adding subscription:", err);
      // Handle errors appropriately
    }
  }

  const handleEndSubscription = async (subscriptionId) => {
    try {
      console.log("TEST " + newSubscriptionCost);
      const response = await axios.put(
        `http://localhost:3001/subscriptions/removesubscription/${userID}`,
        {
          title: subscriptionId.title,
          monthRemoved: selectedMonth.toString(),
          yearRemoved: selectedYear.toString(),
        },
        {
          headers: { authorization: cookies.access_token },
        }
      );
      fetchUsed();
      fetchRemaining();
      // Update the UI or perform any other necessary actions
      console.log("Subscription ended successfully:", response.data);

      // Fetch the updated balance after adding the expense
      fetchSubscriptions();
    } catch (err) {
      console.error("Error ending subscription:", err);
      // Handle errors appropriately
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/subscriptions/userSubscriptions/${userID}`,
        {
          month: selectedMonth,
          year: selectedYear,
        },
        {
          headers: { authorization: cookies.access_token },
        }
      );
      setSubscriptions(response.data);
    } catch (err) {
      console.error(err);
    }
  }


  const handleAddExpense = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/expenses/newexpense`,
        {
          title: expenseTitle,
          cost: expenseCost,
          month: selectedMonth,
          year: selectedYear,
          userID: userID,
        },
        {
          headers: { authorization: cookies.access_token },
        }
      );

      if (addToSaved) {
        const expenseToSave = await axios.post(
          `http://localhost:3001/auth/saveexpense/${userID}`,
          {
            expense: expenseTitle,
          },
          {
            headers: { authorization: cookies.access_token },
          }
        );
      }
      await fetchSavedExpenses();

      // Update the UI or perform any other necessary actions
      console.log("Expense added successfully:", response.data);

      // Fetch the updated balance after adding the expense
      fetchBalance();
      fetchExpenses();
      fetchUsed();
      fetchRemaining();

      // Scroll to the bottom of the expenses container
      if (expensesContainerRef.current) {
        expensesContainerRef.current.scrollTop = expensesContainerRef.current.scrollHeight;
      }

    } catch (err) {
      console.error("Error adding expense:", err);
      // Handle errors appropriately
    }

    // Reset the expense form fields
    setExpenseTitle("");
    setExpenseCost("");
    setAddToSaved(false);
    setSelectedSavedExpense("");
  };

  const handleRemoveExpense = async (expenseID) => {
    try {
      const response = await axios.delete(`http://localhost:3001/expenses/removeexpense/${userID}/${expenseID}`, {
        headers: { authorization: cookies.access_token },
      });

      console.log(response.data); // Log the server response if needed

      fetchExpenses();
      fetchUsed();
      fetchRemaining();
    } catch (err) {
      console.error("Error removing expense:", err);
      // Handle errors appropriately
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/expenses/getexpenses/${userID}`,
        {
          month: selectedMonth,
          year: selectedYear,
        },
        {
          headers: { authorization: cookies.access_token },
        }
      );
      setExpenses(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchSavedExpenses = async () => {
    try {
        const response = await axios.get(
            `http://localhost:3001/auth/getsaved/${userID}`,
            { headers: { authorization: cookies.access_token } }
        );
        console.log("Saved Expenses:", response.data.savedExpenses);
        // Update state or perform any other necessary actions with saved expenses
        setSavedExpenses(response.data.savedExpenses);
    } catch (err) {
        console.error("Error fetching saved expenses:", err);
        // Handle errors appropriately
    }
};

  useEffect(() => {
    fetchExpenses();
    fetchSubscriptions();
    fetchUsed();
    fetchRemaining();
    fetchSavedExpenses();
  }, [userID, selectedMonth, selectedYear, cookies.access_token]);

  return (
    <Container className="dashboard">
      <NavBar />
      <Row className="top-select">
        <Col xs={2} md={1.5} className="custom-left-align">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="">Select Month</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </Col>
        <Col xs={1} md={1}>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">Select Year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        </Col>
      </Row>
      <Row className="numbers-container justify-content-md-center">
      <Col md={4} className="number-col">
          <div className="number-wrapper">
            <h6 className="label">Budget</h6>
            <div className="budget-box">
              {editMode ? (
                <>
                  <InputGroup className="new-balance-input">
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder={balance}
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                    />
                    <Button className="update-button" onClick={handleUpdateBalance}>Update</Button>
                  </InputGroup>
                </>
              ) : (
                <>
                  <h1 className="number">${balance}</h1>
                  <button
                    className="edit-button"
                    onClick={() => setEditMode(true)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </Col>
        <Col md={4} className="number-col">
          <div className="number-wrapper">
            <h6 className="label">Remaining Budget</h6>
            <h1 className="number">${balanceLeft}</h1>
          </div>
        </Col>
        <Col md={4} className="number-col">
          <div className="number-wrapper">
            <h6 className="label">Used Budget</h6>
            <h1 className="number">${balanceUsed}</h1>
          </div>
        </Col>
      </Row>
      <Row className="header-title">
        <Col className="expense-header" xs lg="8"><h3>Expenses</h3></Col>
        <Col className="sub-header" xs lg="1"><h3>Subscriptions</h3></Col>
      </Row>
      <Row>
      <Col md={7} className="expense-box">
        <div className="expense-container" ref={expensesContainerRef}>
          {expenses.map((expense) => (
            <div key={expense._id} className="expense-item">
              <div className="expense-details">
                <p className="expense-title">{expense.title}</p>
                <p className="expense-cost">${expense.cost.toFixed(2)}</p>
              </div>
              <Button className="delete-btn" variant="danger" onClick={() => handleRemoveExpense(expense._id)}>
                -
              </Button>
            </div>
          ))}
        </div>
      </Col>
        <Col md={4} className="sub-box">
          <div className="sub-container">
          {subscriptions.map((subscription) => (
            <div key={subscription._id} className="subscription-item">
              <div className="subscription-details">
                <p className="subscription-title">{subscription.title}</p>
                <p className="subscription-cost">${subscription.cost.toFixed(2)}</p>
              </div>
              <Button className="delete-btn" variant="danger" onClick={() => handleEndSubscription(subscription)}>
                -
              </Button>
            </div>
          ))}
          </div>
          <div className="subscription-input-container">
                {subMode ? (
                  <>
                    <InputGroup className="new-subscription-input">
                      <Form.Control
                        type="text"
                        placeholder="Subscription"
                        value={newSubscriptionName}
                        onChange={(e) => setNewSubscriptionName(e.target.value)}
                      />
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Cost"
                        value={newSubscriptionCost}
                        onChange={(e) => setNewSubscriptionCost(e.target.value)}
                      />
                      <Button className="sub-add-btn" onClick={handleAddSubscription}>Add</Button>
                    </InputGroup>
                  </>
                ) : (
                  <>
                    <button
                      className="add-button"
                      onClick={() => setSubMode(true)}
                    >
                      +
                    </button>
                  </>
                )}
              </div>
        </Col>
      </Row>
      <Row className="input-container">
        <Col>
          <Form className="expense-input-container">
            <div className="expense-input-item">
            <Form.Select 
              className="saved-expenses" 
              value={selectedSavedExpense} 
              onChange={(e) => {
                const selectedValue = e.target.value;
                setSelectedSavedExpense(selectedValue);
                setExpenseTitle(selectedValue);
              }}
            >
              <option value="">Custom</option>
              {savedExpenses.map((savedExpense) => (
                <option key={savedExpense} value={savedExpense}>
                  {savedExpense}
                </option>
              ))}
            </Form.Select>
            </div>
            <div className="expense-input-item expense-text-input">
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Expense"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="expense-input-item expense-text-input">
              <InputGroup className="mb-3">
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  placeholder="Cost"
                  value={expenseCost}
                  onChange={(e) => setExpenseCost(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="expense-input-item">
              <Form.Check
                type="switch"
                id="custom-switch"
                label="Add to Saved"
                checked={addToSaved}
                onChange={() => setAddToSaved(!addToSaved)}
              />
            </div>
            <Button className="add-expense-btn" onClick={handleAddExpense}>Add Expense</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
