import React, { useState, useEffect } from "react";

function App() {
  // Initialize state with localStorage data or empty array
  const [transactions, setTransactions] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem("keuangan-toko-dgi");
        return savedData ? JSON.parse(savedData) : [];
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        return [];
      }
    }
    return [];
  });
  
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("income");
  const [selectedCategory, setSelectedCategory] = useState("Es Krim & Mainan");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Save data to localStorage whenever transactions change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("keuangan-toko-dgi", JSON.stringify(transactions));
        console.log("Data saved to localStorage:", transactions.length, "transactions");
      } catch (error) {
        console.error("Error saving data to localStorage:", error);
      }
    }
  }, [transactions]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;

  const calculateTotal = (type, category) => {
    return transactions
      .filter((t) => t.type === type && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get date ranges
  const getWeekRange = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
      label: `${monday.getDate()}/${monday.getMonth() + 1} - ${sunday.getDate()}/${sunday.getMonth() + 1}/${sunday.getFullYear()}`
    };
  };

  const getMonthRange = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
      label: `${getMonthName(month)} ${year}`
    };
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthIndex];
  };

  const filterTransactionsByDateRange = (startDate, endDate) => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  };

  const calculateTotalsForRange = (startDate, endDate) => {
    const filteredTransactions = filterTransactionsByDateRange(startDate, endDate);
    const income = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, profit: income - expense, transactions: filteredTransactions };
  };

  const getWeeklyReports = () => {
    const reports = [];
    const today = new Date();
    
    for (let i = 0; i < 4; i++) {
      const weekDate = new Date(today);
      weekDate.setDate(today.getDate() - (i * 7));
      const weekRange = getWeekRange(weekDate);
      const totals = calculateTotalsForRange(weekRange.start, weekRange.end);
      
      reports.push({
        ...weekRange,
        ...totals,
        period: `Minggu ${i + 1}`
      });
    }
    
    return reports.reverse();
  };

  const getMonthlyReports = () => {
    const reports = [];
    const today = new Date();
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthRange = getMonthRange(monthDate);
      const totals = calculateTotalsForRange(monthRange.start, monthRange.end);
      
      reports.push({
        ...monthRange,
        ...totals,
        period: monthRange.label
      });
    }
    
    return reports.reverse();
  };

  const handleSubmit = () => {
    if (!amount) {
      alert("Masukkan jumlah!");
      return;
    }

    if (editingTransaction) {
      setTransactions(
        transactions.map((t) =>
          t.id === editingTransaction.id
            ? {
                ...t,
                amount: parseFloat(amount),
                category: selectedCategory,
                date: date,
                description: description || "",
              }
            : t
        )
      );
      setEditingTransaction(null);
    } else {
      const newTransaction = {
        id: Date.now(),
        type: formType,
        amount: parseFloat(amount),
        category: selectedCategory,
        date: date,
        description: description || "",
      };
      setTransactions([...transactions, newTransaction]);
    }

    setAmount("");
    setDescription("");
    setShowForm(false);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setSelectedCategory(transaction.category);
    setAmount(transaction.amount.toString());
    setDescription(transaction.description || "");
    setDate(transaction.date);
    setShowForm(true);
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      setTransactions([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("keuangan-toko-dgi");
      }
      alert("Semua data telah dihapus!");
    }
  };

  const downloadReport = () => {
    const today = new Date().toLocaleDateString("id-ID");
    let content = "";
    content = content + "========================================\n";
    content = content + "       LAPORAN KEUANGAN TOKO DGI\n";
    content = content + "========================================\n";
    content = content + "Tanggal: " + today + "\n\n";

    content = content + "RINGKASAN KEUANGAN KESELURUHAN:\n";
    content = content + "----------------------------------------\n";
    content = content + "Total Pemasukan    : " + formatCurrency(totalIncome) + "\n";
    content = content + "Total Pengeluaran  : " + formatCurrency(totalExpense) + "\n";
    content = content + "Keuntungan Bersih  : " + formatCurrency(profit) + "\n\n";

    // Weekly Reports
    content = content + "LAPORAN MINGGUAN (4 MINGGU TERAKHIR):\n";
    content = content + "----------------------------------------\n";
    const weeklyReports = getWeeklyReports();
    weeklyReports.forEach((week, index) => {
      content = content + `\n${week.period} (${week.label}):\n`;
      content = content + "  Pemasukan    : " + formatCurrency(week.income) + "\n";
      content = content + "  Pengeluaran  : " + formatCurrency(week.expense) + "\n";
      content = content + "  Keuntungan   : " + formatCurrency(week.profit) + "\n";
      content = content + "  Transaksi    : " + week.transactions.length + " item\n";
    });

    // Monthly Reports
    content = content + "\n\nLAPORAN BULANAN (6 BULAN TERAKHIR):\n";
    content = content + "----------------------------------------\n";
    const monthlyReports = getMonthlyReports();
    monthlyReports.forEach((month, index) => {
      content = content + `\n${month.period}:\n`;
      content = content + "  Pemasukan    : " + formatCurrency(month.income) + "\n";
      content = content + "  Pengeluaran  : " + formatCurrency(month.expense) + "\n";
      content = content + "  Keuntungan   : " + formatCurrency(month.profit) + "\n";
      content = content + "  Transaksi    : " + month.transactions.length + " item\n";
    });

    content = content + "\n\nLAPORAN PER KATEGORI:\n";
    content = content + "----------------------------------------\n";

    const categories = ["Es Krim & Mainan", "Gas"];
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const income = calculateTotal("income", category);
      const expense = calculateTotal("expense", category);
      const categoryProfit = income - expense;

      content = content + "\n" + category + ":\n";
      content = content + "  Pemasukan    : " + formatCurrency(income) + "\n";
      content = content + "  Pengeluaran  : " + formatCurrency(expense) + "\n";
      content = content + "  Keuntungan   : " + formatCurrency(categoryProfit) + "\n";
    }

    content = content + "\n\nDETAIL TRANSAKSI:\n";
    content = content + "----------------------------------------\n";
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      const jenis = t.type === "income" ? "Pemasukan" : "Pengeluaran";
      const desc = t.description ? " - " + t.description : "";
      content = content + (i + 1) + ". " + t.date + " | " + t.category + " | " + jenis + " | " + formatCurrency(t.amount) + desc + "\n";
    }

    content = content + "\n========================================\n";
    content = content + "           Generated by Toko DGI\n";
    content = content + "========================================\n";

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Laporan_Keuangan_Toko_DGI_" + new Date().toISOString().split("T")[0] + ".txt";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const backgroundStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 40, 80, 0.9) 100%)",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "10px",
    position: "relative",
  };

  return (
    <div style={backgroundStyle}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "15px 20px",
          borderRadius: "20px",
          marginBottom: "15px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
            }}
          >
            <span style={{ color: "white", fontSize: "20px" }}>✓</span>
          </div>
          <h1
            style={{
              fontSize: "22px",
              margin: "0",
              color: "#1a202c",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Keuangan Toko DGI
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "8px",
          borderRadius: "20px",
          marginBottom: "15px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {[
            { key: "dashboard", icon: "📊", label: "Dashboard" },
            { key: "pemasukan", icon: "💰", label: "Masuk" }, 
            { key: "pengeluaran", icon: "💸", label: "Keluar" },
            { key: "transaksi", icon: "📋", label: "Data" },
            { key: "laporan", icon: "📊", label: "Report" }
          ].map((nav) => (
            <button
              key={nav.key}
              onClick={() => setCurrentPage(nav.key)}
              style={{
                flex: "1",
                minWidth: "60px",
                padding: "12px 8px",
                background: currentPage === nav.key 
                  ? nav.key === "dashboard" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : nav.key === "pemasukan" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : nav.key === "pengeluaran" ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  : nav.key === "transaksi" ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                  : "transparent",
                color: currentPage === nav.key ? "white" : "#64748b",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: currentPage === nav.key ? "0 4px 15px rgba(102, 126, 234, 0.3)" : "none",
              }}
            >
              {nav.icon} {nav.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard */}
      {currentPage === "dashboard" && (
        <div>
          {/* DGI Hotspot Banner */}
          <div
            style={{
              backgroundColor: "#4a2c2a",
              borderRadius: "25px",
              padding: "0",
              marginBottom: "15px",
              boxShadow: "0 8px 32px rgba(74, 44, 42, 0.3)",
              overflow: "hidden",
              position: "relative",
              border: "2px solid #d4af37",
            }}
          >
            <div style={{ textAlign: "center", padding: "25px 20px 15px" }}>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#d4af37",
                  margin: "0 0 12px 0",
                  letterSpacing: "2px",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                DGI HOTSPOT
              </h1>
              <div
                style={{
                  backgroundColor: "#d4af37",
                  color: "#4a2c2a",
                  padding: "8px 0",
                  fontSize: "14px",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                  margin: "0 -20px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                MENYEDIAKAN
              </div>
            </div>

            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ color: "white" }}>
                {[
                  "PULSA ALL OPERATOR",
                  "TOKEN LISTRIK & TAGIHAN LISTRIK", 
                  "TOP UP GAME (MOBILE LEGEND, FREE FIRE, PUBG, DLL.)",
                  "TOP UP DANA, SHOPEEPAY, GOPAY, OVO"
                ].map((service, idx) => (
                  <div key={idx} style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ color: "#d4af37", fontSize: "14px", marginTop: "2px" }}>•</span>
                    <span style={{ fontSize: "13px", lineHeight: "1.4" }}>{service}</span>
                  </div>
                ))}
              </div>
              <div style={{ color: "white" }}>
                {[
                  "PAKET DATA / KUOTA",
                  "PAKET TELEPON / SMS",
                  "BPJS & PDAM",
                  "VOUCHER WIFI 2000/JAM",
                  "ALAT TULIS & JAS HUJAN",
                  "GAS LPG 3KG"
                ].map((service, idx) => (
                  <div key={idx} style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ color: "#d4af37", fontSize: "14px", marginTop: "2px" }}>•</span>
                    <span style={{ fontSize: "13px", lineHeight: "1.4" }}>{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#d4af37",
                color: "#4a2c2a",
                padding: "12px 20px",
                fontSize: "12px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", marginRight: "6px" }}>📍</span>
                <span>PILAR, SAMPING WARUNG & LAUNDRY</span>
              </div>
              <div>
                <span style={{ fontSize: "14px", marginRight: "6px" }}>📱</span>
                <span>082218472975</span>
              </div>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                padding: "20px",
                borderRadius: "20px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
              }}
            >
              <div style={{ fontSize: "12px", opacity: "0.9", marginBottom: "8px", fontWeight: "500" }}>
                Total Pemasukan
              </div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                {formatCurrency(totalIncome)}
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                padding: "20px",
                borderRadius: "20px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(239, 68, 68, 0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
              }}
            >
              <div style={{ fontSize: "12px", opacity: "0.9", marginBottom: "8px", fontWeight: "500" }}>
                Total Pengeluaran
              </div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                {formatCurrency(totalExpense)}
              </div>
            </div>

            <div
              style={{
                background: profit >= 0 ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                padding: "20px",
                borderRadius: "20px",
                textAlign: "center",
                boxShadow: profit >= 0 ? "0 8px 32px rgba(59, 130, 246, 0.3)" : "0 8px 32px rgba(245, 158, 11, 0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
              }}
            >
              <div style={{ fontSize: "12px", opacity: "0.9", marginBottom: "8px", fontWeight: "500" }}>
                {profit >= 0 ? "Keuntungan" : "Kerugian"}
              </div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                {formatCurrency(Math.abs(profit))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pemasukan */}
      {currentPage === "pemasukan" && (
        <div>
          <h2
            style={{
              marginBottom: "20px",
              color: "white",
              textAlign: "center",
              fontSize: "20px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            💰 Tambah Pemasukan
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px",
            }}
          >
            {["Es Krim & Mainan", "Gas"].map((category) => (
              <div
                key={category}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  padding: "20px",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <h3 style={{ marginBottom: "15px", color: "#1f2937", textAlign: "center" }}>
                  {category === "Es Krim & Mainan" ? "🍦🧸" : "⛽"} {category}
                </h3>
                <button
                  onClick={() => {
                    setFormType("income");
                    setSelectedCategory(category);
                    setShowForm(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "15px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  + Tambah Pemasukan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pengeluaran */}
      {currentPage === "pengeluaran" && (
        <div>
          <h2
            style={{
              marginBottom: "20px",
              color: "white",
              textAlign: "center",
              fontSize: "20px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            💸 Tambah Pengeluaran
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px",
            }}
          >
            {["Es Krim & Mainan", "Gas"].map((category) => (
              <div
                key={category}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  padding: "20px",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <h3 style={{ marginBottom: "15px", color: "#1f2937", textAlign: "center" }}>
                  {category === "Es Krim & Mainan" ? "🍦🧸" : "⛽"} {category}
                </h3>
                <button
                  onClick={() => {
                    setFormType("expense");
                    setSelectedCategory(category);
                    setShowForm(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "15px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  - Tambah Pengeluaran
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaksi */}
      {currentPage === "transaksi" && (
        <div>
          <h2
            style={{
              marginBottom: "20px",
              color: "white",
              textAlign: "center",
              fontSize: "20px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            📋 Daftar Transaksi
          </h2>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {transactions.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                Belum ada transaksi
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    padding: "15px 20px",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      {transaction.category === "Es Krim & Mainan" ? "🍦🧸" : "⛽"}
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: transaction.type === "income" ? "#dcfce7" : "#fee2e2",
                          color: transaction.type === "income" ? "#166534" : "#dc2626",
                        }}
                      >
                        {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>
                        {transaction.category}
                      </span>
                    </div>
                    {transaction.description && (
                      <p style={{ fontSize: "12px", color: "#4b5563", margin: "5px 0", fontStyle: "italic" }}>
                        "{transaction.description}"
                      </p>
                    )}
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0" }}>
                      {transaction.date}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: transaction.type === "income" ? "#16a34a" : "#dc2626",
                        margin: "0 0 8px 0",
                      }}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleEdit(transaction)}
                        style={{
                          fontSize: "12px",
                          color: "#3b82f6",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          backgroundColor: "#eff6ff",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Hapus transaksi?")) {
                            setTransactions(transactions.filter((t) => t.id !== transaction.id));
                          }
                        }}
                        style={{
                          fontSize: "12px",
                          color: "#ef4444",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          backgroundColor: "#fef2f2",
                        }}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Laporan */}
      {currentPage === "laporan" && (
        <div>
          <h2
            style={{
              marginBottom: "20px",
              color: "white",
              textAlign: "center",
              fontSize: "20px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            📊 Laporan Keuangan
          </h2>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              padding: "20px",
              borderRadius: "20px",
              marginBottom: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#1f2937" }}>Ringkasan Keuangan</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
              }}
            >
              <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f0fdf4", borderRadius: "15px" }}>
                <div style={{ fontSize: "14px", color: "#16a34a", marginBottom: "5px" }}>Total Pemasukan</div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#15803d" }}>
                  {formatCurrency(totalIncome)}
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#fef2f2", borderRadius: "15px" }}>
                <div style={{ fontSize: "14px", color: "#dc2626", marginBottom: "5px" }}>Total Pengeluaran</div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#dc2626" }}>
                  {formatCurrency(totalExpense)}
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  backgroundColor: profit >= 0 ? "#eff6ff" : "#fff7ed",
                  borderRadius: "15px",
                }}
              >
                <div style={{ fontSize: "14px", color: profit >= 0 ? "#2563eb" : "#ea580c", marginBottom: "5px" }}>
                  {profit >= 0 ? "Keuntungan" : "Kerugian"}
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: profit >= 0 ? "#1d4ed8" : "#ea580c" }}>
                  {formatCurrency(Math.abs(profit))}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              padding: "20px",
              borderRadius: "20px",
              marginBottom: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#1f2937" }}>📅 Laporan Mingguan (4 Minggu Terakhir)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
              {getWeeklyReports().map((week, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "15px",
                    padding: "15px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937", textAlign: "center" }}>
                    {week.period}
                  </h4>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
                    {week.label}
                  </p>
                  <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#6b7280" }}>Pemasukan:</span>
                      <span style={{ color: "#10b981", fontWeight: "600" }}>{formatCurrency(week.income)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#6b7280" }}>Pengeluaran:</span>
                      <span style={{ color: "#ef4444", fontWeight: "600" }}>{formatCurrency(week.expense)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: "4px", marginTop: "6px" }}>
                      <span style={{ fontWeight: "600", color: "#374151" }}>Profit:</span>
                      <span style={{ color: week.profit >= 0 ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                        {formatCurrency(week.profit)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ color: "#6b7280", fontSize: "11px" }}>Transaksi:</span>
                      <span style={{ color: "#6b7280", fontSize: "11px" }}>{week.transactions.length} item</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              padding: "20px",
              borderRadius: "20px",
              marginBottom: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#1f2937" }}>📊 Laporan Bulanan (6 Bulan Terakhir)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
              {getMonthlyReports().map((month, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "15px",
                    padding: "15px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937", textAlign: "center" }}>
                    {month.period}
                  </h4>
                  <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#6b7280" }}>Pemasukan:</span>
                      <span style={{ color: "#10b981", fontWeight: "600" }}>{formatCurrency(month.income)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#6b7280" }}>Pengeluaran:</span>
                      <span style={{ color: "#ef4444", fontWeight: "600" }}>{formatCurrency(month.expense)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: "4px", marginTop: "6px" }}>
                      <span style={{ fontWeight: "600", color: "#374151" }}>Profit:</span>
                      <span style={{ color: month.profit >= 0 ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                        {formatCurrency(month.profit)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ color: "#6b7280", fontSize: "11px" }}>Transaksi:</span>
                      <span style={{ color: "#6b7280", fontSize: "11px" }}>{month.transactions.length} item</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              padding: "20px",
              borderRadius: "20px",
              marginBottom: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#1f2937" }}>🏪 Laporan Per Kategori (Keseluruhan)</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              {["Es Krim & Mainan", "Gas"].map((category) => {
                const income = calculateTotal("income", category);
                const expense = calculateTotal("expense", category);
                const categoryProfit = income - expense;

                return (
                  <div
                    key={category}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "15px",
                      padding: "15px",
                      backgroundColor: "#fafbfc",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "16px",
                        textAlign: "center",
                        color: "#1f2937",
                      }}
                    >
                      {category === "Es Krim & Mainan" ? "🍦🧸" : "⛽"} {category}
                    </h4>
                    <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ color: "#6b7280" }}>Pemasukan:</span>
                        <span style={{ color: "#10b981", fontWeight: "600" }}>{formatCurrency(income)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ color: "#6b7280" }}>Pengeluaran:</span>
                        <span style={{ color: "#ef4444", fontWeight: "600" }}>{formatCurrency(expense)}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          borderTop: "1px solid #e5e7eb",
                          paddingTop: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <span style={{ fontWeight: "600", color: "#374151" }}>Keuntungan:</span>
                        <span
                          style={{
                            color: categoryProfit >= 0 ? "#10b981" : "#ef4444",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          {formatCurrency(categoryProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              padding: "20px",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#1f2937" }}>💾 Download Laporan</h3>
            <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>
              Download laporan keuangan lengkap dengan analisis mingguan dan bulanan
            </p>

            <button
              onClick={downloadReport}
              style={{
                padding: "15px 30px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                color: "white",
                border: "none",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                marginRight: "10px",
              }}
            >
              📄 Download Laporan TXT
            </button>

            <button
              onClick={clearAllData}
              style={{
                padding: "15px 30px",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
              }}
            >
              🗑️ Hapus Semua Data
            </button>

            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                backgroundColor: "#f8fafc",
                borderRadius: "15px",
                border: "1px solid #e2e8f0",
              }}
            >
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                💡 File berisi ringkasan keseluruhan, laporan mingguan, bulanan, per kategori, dan detail transaksi
              </p>
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0", lineHeight: "1.4" }}>
                📊 Data tersimpan otomatis di browser. Total transaksi: {transactions.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(15px)",
              borderRadius: "25px",
              padding: "30px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <h3 style={{ fontSize: "18px", marginBottom: "20px", color: "#1f2937", textAlign: "center" }}>
              {editingTransaction
                ? `✏️ Edit ${editingTransaction.type === "income" ? "Pemasukan" : "Pengeluaran"}`
                : formType === "income"
                ? "💰 Tambah Pemasukan"
                : "💸 Tambah Pengeluaran"}
              <br />
              <span style={{ fontSize: "14px", color: "#6b7280" }}>{selectedCategory}</span>
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", marginBottom: "5px", color: "#374151" }}>
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={!editingTransaction}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "15px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: !editingTransaction ? "#f9fafb" : "white",
                  color: !editingTransaction ? "#6b7280" : "#374151",
                }}
              >
                <option value="Es Krim & Mainan">🍦🧸 Es Krim & Mainan</option>
                <option value="Gas">⛽ Gas</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", marginBottom: "5px", color: "#374151" }}>
                Jumlah (Rp)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "15px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                placeholder="Masukkan jumlah..."
                min="0"
              />
            </div>

            {formType === "expense" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", marginBottom: "5px", color: "#374151" }}>
                  Keterangan Pengeluaran (Opsional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "15px",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="Contoh: Beli bahan baku, Bayar listrik, dll..."
                />
              </div>
            )}

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", fontSize: "14px", marginBottom: "5px", color: "#374151" }}>
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "15px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTransaction(null);
                  setAmount("");
                  setDescription("");
                }}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: "12px 20px",
                  background: editingTransaction
                    ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                    : formType === "income"
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {editingTransaction
                  ? "✏️ Update Transaksi"
                  : formType === "income"
                  ? "💰 Simpan Pemasukan"
                  : "💸 Simpan Pengeluaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
