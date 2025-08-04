import React, { useState } from "react";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("income");
  const [selectedCategory, setSelectedCategory] = useState("Es Krim & Mainan");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedReportTab, setSelectedReportTab] = useState("ringkasan");

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const profit = totalIncome - totalExpense;

  const calculateTotal = (type, category) => {
    return transactions
      .filter(t => t.type === type && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    let weekStart = new Date(firstDayOfMonth);
    let weekNumber = 1;
    
    while (weekStart <= lastDayOfMonth) {
      let weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      if (weekEnd > lastDayOfMonth) {
        weekEnd = new Date(lastDayOfMonth);
      }
      
      const weekRange = {
        start: weekStart.toISOString().split('T')[0],
        end: weekEnd.toISOString().split('T')[0],
        label: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}/${weekEnd.getFullYear()}`
      };
      
      const totals = calculateTotalsForRange(weekRange.start, weekRange.end);
      
      reports.push({
        ...weekRange,
        ...totals,
        period: `Minggu ${weekNumber}`
      });
      
      weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() + 1);
      weekNumber++;
    }
    
    return reports;
  };

  const getMonthlyReports = () => {
    const reports = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentYear, month, 1);
      const monthRange = getMonthRange(monthDate);
      const totals = calculateTotalsForRange(monthRange.start, monthRange.end);
      
      reports.push({
        ...monthRange,
        ...totals,
        period: monthRange.label,
        isCurrentMonth: month === today.getMonth()
      });
    }
    
    return reports;
  };

  const handleSubmit = () => {
    if (!amount) {
      alert("Masukkan jumlah!");
      return;
    }

    if (editingTransaction) {
      setTransactions(transactions.map(t =>
        t.id === editingTransaction.id
          ? {
              ...t,
              amount: parseFloat(amount),
              category: selectedCategory,
              date: date,
              description: description || "",
            }
          : t
      ));
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
    if (window.confirm("Apakah Anda yakin ingin menghapus semua data?")) {
      setTransactions([]);
      alert("Semua data telah dihapus!");
    }
  };

  const downloadReport = () => {
    const today = new Date().toLocaleDateString("id-ID");
    let content = "========================================\n";
    content += "       LAPORAN KEUANGAN TOKO DGI\n";
    content += "========================================\n";
    content += "Tanggal: " + today + "\n\n";
    content += "RINGKASAN KEUANGAN:\n";
    content += "----------------------------------------\n";
    content += "Total Pemasukan    : " + formatCurrency(totalIncome) + "\n";
    content += "Total Pengeluaran  : " + formatCurrency(totalExpense) + "\n";
    content += "Keuntungan Bersih  : " + formatCurrency(profit) + "\n\n";

    content += "LAPORAN MINGGUAN BULAN INI:\n";
    content += "----------------------------------------\n";
    const weeklyReports = getWeeklyReports();
    weeklyReports.forEach((week, index) => {
      content += `\n${week.period} (${week.label}):\n`;
      content += "  Pemasukan    : " + formatCurrency(week.income) + "\n";
      content += "  Pengeluaran  : " + formatCurrency(week.expense) + "\n";
      content += "  Keuntungan   : " + formatCurrency(week.profit) + "\n";
      content += "  Transaksi    : " + week.transactions.length + " item\n";
    });

    content += "\n\nLAPORAN BULANAN TAHUN INI:\n";
    content += "----------------------------------------\n";
    const monthlyReports = getMonthlyReports();
    monthlyReports.forEach((month, index) => {
      content += `\n${month.period}:\n`;
      content += "  Pemasukan    : " + formatCurrency(month.income) + "\n";
      content += "  Pengeluaran  : " + formatCurrency(month.expense) + "\n";
      content += "  Keuntungan   : " + formatCurrency(month.profit) + "\n";
      content += "  Transaksi    : " + month.transactions.length + " item\n";
    });

    const categories = ["Es Krim & Mainan", "Gas"];
    content += "\n\nLAPORAN PER KATEGORI:\n";
    content += "----------------------------------------\n";
    categories.forEach(category => {
      const income = calculateTotal("income", category);
      const expense = calculateTotal("expense", category);
      const categoryProfit = income - expense;
      content += "\n" + category + ":\n";
      content += "  Pemasukan    : " + formatCurrency(income) + "\n";
      content += "  Pengeluaran  : " + formatCurrency(expense) + "\n";
      content += "  Keuntungan   : " + formatCurrency(categoryProfit) + "\n";
    });

    content += "\n\nDETAIL TRANSAKSI:\n";
    content += "----------------------------------------\n";
    transactions.forEach((t, i) => {
      const jenis = t.type === "income" ? "Pemasukan" : "Pengeluaran";
      const desc = t.description ? " - " + t.description : "";
      content += (i + 1) + ". " + t.date + " | " + t.category + " | " + jenis + " | " + formatCurrency(t.amount) + desc + "\n";
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Laporan_Keuangan_Toko_DGI_" + new Date().toISOString().split("T")[0] + ".txt";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Style objects
  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 40, 80, 0.9) 100%)",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "10px"
  };

  const headerStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "15px 20px",
    borderRadius: "20px",
    marginBottom: "15px",
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    border: "1px solid rgba(255,255,255,0.2)"
  };

  const navigationStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "8px",
    borderRadius: "20px",
    marginBottom: "15px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    border: "1px solid rgba(255,255,255,0.2)"
  };

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <div style={{
            width: "45px",
            height: "45px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
          }}>
            <span style={{ color: "white", fontSize: "20px" }}>✓</span>
          </div>
          <h1 style={{
            fontSize: "22px",
            margin: "0",
            color: "#1a202c",
            fontWeight: "700",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Keuangan Toko DGI
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div style={navigationStyle}>
        <div style={{ display: "flex", gap: "4px", justifyContent: "space-between" }}>
          {[
            { key: "dashboard", icon: "📊", label: "Dashboard", color: "#667eea" },
            { key: "pemasukan", icon: "💰", label: "Masuk", color: "#10b981" },
            { key: "pengeluaran", icon: "💸", label: "Keluar", color: "#ef4444" },
            { key: "transaksi", icon: "📋", label: "Data", color: "#f59e0b" },
            { key: "laporan", icon: "📊", label: "Report", color: "#6366f1" }
          ].map(nav => (
            <button
              key={nav.key}
              onClick={() => setCurrentPage(nav.key)}
              style={{
                flex: "1",
                padding: "12px 8px",
                background: currentPage === nav.key ? `linear-gradient(135deg, ${nav.color} 0%, ${nav.color}dd 100%)` : "transparent",
                color: currentPage === nav.key ? "white" : "#64748b",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "600"
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
          {/* DGI Banner */}
          <div style={{
            backgroundColor: "#4a2c2a",
            borderRadius: "25px",
            marginBottom: "15px",
            boxShadow: "0 8px 32px rgba(74, 44, 42, 0.3)",
            border: "2px solid #d4af37"
          }}>
            <div style={{ textAlign: "center", padding: "25px 20px 15px" }}>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "bold", 
                color: "#d4af37",
                margin: "0 0 12px 0",
                letterSpacing: "2px"
              }}>
                DGI HOTSPOT
              </h1>
              <div style={{
                backgroundColor: "#d4af37",
                color: "#4a2c2a",
                padding: "8px 0",
                fontSize: "14px",
                fontWeight: "bold",
                margin: "0 -20px"
              }}>
                MENYEDIAKAN
              </div>
            </div>

            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ color: "white" }}>
                {["PULSA ALL OPERATOR", "TOKEN LISTRIK & TAGIHAN", "TOP UP GAME", "TOP UP E-WALLET"].map((service, idx) => (
                  <div key={idx} style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
                    <span style={{ color: "#d4af37" }}>•</span>
                    <span style={{ fontSize: "13px" }}>{service}</span>
                  </div>
                ))}
              </div>
              <div style={{ color: "white" }}>
                {["PAKET DATA / KUOTA", "PAKET TELEPON / SMS", "BPJS & PDAM", "VOUCHER WIFI", "ALAT TULIS", "GAS LPG 3KG"].map((service, idx) => (
                  <div key={idx} style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
                    <span style={{ color: "#d4af37" }}>•</span>
                    <span style={{ fontSize: "13px" }}>{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: "#d4af37",
              color: "#4a2c2a",
              padding: "12px 20px",
              fontSize: "12px",
              fontWeight: "bold",
              textAlign: "center"
            }}>
              <div style={{ marginBottom: "8px" }}>📍 PILAR, SAMPING WARUNG & LAUNDRY</div>
              <div>📱 082218472975</div>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            <div style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              color: "white"
            }}>
              <div style={{ fontSize: "12px", marginBottom: "8px" }}>Total Pemasukan</div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{formatCurrency(totalIncome)}</div>
            </div>
            
            <div style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              padding: "20px",
              borderRadius: "20px", 
              textAlign: "center",
              color: "white"
            }}>
              <div style={{ fontSize: "12px", marginBottom: "8px" }}>Total Pengeluaran</div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{formatCurrency(totalExpense)}</div>
            </div>
            
            <div style={{
              background: profit >= 0 ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center", 
              color: "white"
            }}>
              <div style={{ fontSize: "12px", marginBottom: "8px" }}>
                {profit >= 0 ? "Keuntungan" : "Kerugian"}
              </div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{formatCurrency(Math.abs(profit))}</div>
            </div>
          </div>
        </div>
      )}

      {/* Pemasukan */}
      {currentPage === "pemasukan" && (
        <div>
          <h2 style={{ marginBottom: "20px", color: "white", textAlign: "center", fontSize: "20px" }}>
            💰 Tambah Pemasukan
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
            {["Es Krim & Mainan", "Gas"].map(category => (
              <div key={category} style={cardStyle}>
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
                    fontWeight: "600"
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
          <h2 style={{ marginBottom: "20px", color: "white", textAlign: "center", fontSize: "20px" }}>
            💸 Tambah Pengeluaran
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
            {["Es Krim & Mainan", "Gas"].map(category => (
              <div key={category} style={cardStyle}>
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
                    fontWeight: "600"
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
          <h2 style={{ marginBottom: "20px", color: "white", textAlign: "center", fontSize: "20px" }}>
            📋 Daftar Transaksi
          </h2>
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
          }}>
            {transactions.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                Belum ada transaksi
              </div>
            ) : (
              transactions.map(transaction => (
                <div key={transaction.id} style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      {transaction.category === "Es Krim & Mainan" ? "🍦🧸" : "⛽"}
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        backgroundColor: transaction.type === "income" ? "#dcfce7" : "#fee2e2",
                        color: transaction.type === "income" ? "#166534" : "#dc2626"
                      }}>
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
                    <p style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: transaction.type === "income" ? "#16a34a" : "#dc2626",
                      margin: "0 0 8px 0"
                    }}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEdit(transaction)}
                        style={{
                          fontSize: "12px",
                          color: "#3b82f6",
                          background: "#eff6ff",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "8px"
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Hapus transaksi?")) {
                            setTransactions(transactions.filter(t => t.id !== transaction.id));
                          }
                        }}
                        style={{
                          fontSize: "12px",
                          color: "#ef4444",
                          background: "#fef2f2",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "8px"
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
          <h2 style={{ marginBottom: "20px", color: "white", textAlign: "center", fontSize: "20px" }}>
            📊 Laporan & Analisis Keuangan
          </h2>

          {/* Tabs for different reports */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "8px",
            borderRadius: "20px",
            marginBottom: "15px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", gap: "4px", justifyContent: "space-between" }}>
              {[
                { key: "ringkasan", icon: "📊", label: "Ringkasan" },
                { key: "mingguan", icon: "📅", label: "Mingguan" },
                { key: "bulanan", icon: "📆", label: "Bulanan" },
                { key: "kategori", icon: "🏪", label: "Kategori" },
                { key: "export", icon: "💾", label: "Export" }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedReportTab(tab.key)}
                  style={{
                    flex: "1",
                    padding: "10px 6px",
                    background: selectedReportTab === tab.key ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" : "transparent",
                    color: selectedReportTab === tab.key ? "white" : "#64748b",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "10px",
                    fontWeight: "600"
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ringkasan Tab */}
          {selectedReportTab === "ringkasan" && (
            <div>
              <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                padding: "20px",
                borderRadius: "20px",
                marginBottom: "20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
              }}>
                <h3 style={{ marginBottom: "15px", color: "#1f2937" }}>Ringkasan Keuangan Keseluruhan</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
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
                  <div style={{ 
                    textAlign: "center", 
                    padding: "15px", 
                    backgroundColor: profit >= 0 ? "#eff6ff" : "#fff7ed", 
                    borderRadius: "15px" 
                  }}>
                    <div style={{ 
                      fontSize: "14px", 
                      color: profit >= 0 ? "#2563eb" : "#ea580c", 
                      marginBottom: "5px" 
                    }}>
                      {profit >= 0 ? "Keuntungan" : "Kerugian"}
                    </div>
                    <div style={{ 
                      fontSize: "18px", 
                      fontWeight: "bold", 
                      color: profit >= 0 ? "#1d4ed8" : "#ea580c" 
                    }}>
                      {formatCurrency(Math.abs(profit))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Laporan Mingguan Tab */}
          {selectedReportTab === "mingguan" && (
            <div>
              <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                padding: "20px",
                borderRadius: "20px",
                marginBottom: "20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
              }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h3 style={{ color: "#1f2937", margin: "0 0 8px 0" }}>
                    📅 Laporan Mingguan - {getMonthName(new Date().getMonth())} {new Date().getFullYear()}
                  </h3>
                  <p style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
                    Analisis keuangan per minggu dalam bulan ini
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                  {getWeeklyReports().map((week, index) => (
                    <div key={index} style={{
                      border: "2px solid #06b6d4",
                      borderRadius: "20px",
                      padding: "20px",
                      backgroundColor: "#f0fdff",
                      boxShadow: "0 4px 20px rgba(6, 182, 212, 0.1)"
                    }}>
                      <div style={{ textAlign: "center", marginBottom: "15px" }}>
                        <h4 style={{ margin: "0 0 5px 0", fontSize: "18px", color: "#0891b2", fontWeight: "bold" }}>
                          {week.period}
                        </h4>
                        <p style={{ margin: "0", fontSize: "13px", color: "#0891b2" }}>
                          {week.label}
                        </p>
                      </div>
                      
                      <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", padding: "8px 0", borderBottom: "1px solid #e0f7fa" }}>
                          <span style={{ color: "#374151", fontWeight: "500" }}>💰 Pemasukan:</span>
                          <span style={{ color: "#10b981", fontWeight: "700", fontSize: "15px" }}>{formatCurrency(week.income)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", padding: "8px 0", borderBottom: "1px solid #e0f7fa" }}>
                          <span style={{ color: "#374151", fontWeight: "500" }}>💸 Pengeluaran:</span>
                          <span style={{ color: "#ef4444", fontWeight: "700", fontSize: "15px" }}>{formatCurrency(week.expense)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", padding: "12px 0", backgroundColor: "rgba(6, 182, 212, 0.1)", borderRadius: "10px", paddingLeft: "12px", paddingRight: "12px" }}>
                          <span style={{ fontWeight: "700", color: "#0891b2" }}>📊 Keuntungan:</span>
                          <span style={{ color: week.profit >= 0 ? "#10b981" : "#ef4444", fontWeight: "bold", fontSize: "16px" }}>
                            {formatCurrency(week.profit)}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                          <span style={{ color: "#6b7280", fontSize: "12px" }}>📋 Total Transaksi:</span>
                          <span style={{ color: "#0891b2", fontSize: "12px", fontWeight: "600" }}>{week.transactions.length} item</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Laporan Bulanan Tab */}
          {selectedReportTab === "bulanan" && (
            <div>
              <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                padding: "20px",
                borderRadius: "20px",
                marginBottom: "20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
              }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h3 style={{ color: "#1f2937", margin: "0 0 8px 0" }}>
                    📆 Laporan Bulanan - Tahun {new Date().getFullYear()}
                  </h3>
                  <p style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
                    Analisis keuangan per bulan sepanjang tahun
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                  {getMonthlyReports().map((month, index) => (
                    <div key={index} style={{
                      border: month.isCurrentMonth ? "3px solid #8b5cf6" : "2px solid #e5e7eb",
                      borderRadius: "20px",
                      padding: "18px",
                      backgroundColor: month.isCurrentMonth ? "#f3f4f6" : "#fafbfc",
                      position: "relative",
                      boxShadow: month.isCurrentMonth ? "0 8px 25px rgba(139, 92, 246, 0.2)" : "0 2px 10px rgba(0,0,0,0.05)"
                    }}>
                      {month.isCurrentMonth && (
                        <div style={{
                          position: "absolute",
                          top: "-12px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "#8b5cf6",
                          color: "white",
                          fontSize: "11px",
                          padding: "4px 12px",
                          borderRadius: "15px",
                          fontWeight: "bold",
                          boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"
                        }}>
                          🏃 BULAN AKTIF
                        </div>
                      )}
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", color: month.isCurrentMonth ? "#8b5cf6" : "#1f2937", textAlign: "center", fontWeight: "bold" }}>
                        {month.period}
                      </h4>
                      <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ color: "#6b7280" }}>💰 Pemasukan:</span>
                          <span style={{ color: "#10b981", fontWeight: "700" }}>{formatCurrency(month.income)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ color: "#6b7280" }}>💸 Pengeluaran:</span>
                          <span style={{ color: "#ef4444", fontWeight: "700" }}>{formatCurrency(month.expense)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", backgroundColor: month.isCurrentMonth ? "rgba(139, 92, 246, 0.1)" : "rgba(59, 130, 246, 0.1)", borderRadius: "8px", paddingLeft: "10px", paddingRight: "10px", marginTop: "8px" }}>
                          <span style={{ fontWeight: "700", color: month.isCurrentMonth ? "#8b5cf6" : "#3b82f6" }}>📊 Profit:</span>
                          <span style={{ color: month.profit >= 0 ? "#10b981" : "#ef4444", fontWeight: "bold", fontSize: "14px" }}>
                            {formatCurrency(month.profit)}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                          <span style={{ color: "#6b7280", fontSize: "11px" }}>📋 Transaksi:</span>
                          <span style={{ color: month.isCurrentMonth ? "#8b5cf6" : "#6b7280", fontSize: "11px", fontWeight: "600" }}>{month.transactions.length} item</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Laporan Kategori Tab */}
          {selectedReportTab === "kategori" && (
            <div>
              <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                padding: "20px",
                borderRadius: "20px",
                marginBottom: "20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
              }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h3 style={{ color: "#1f2937", margin: "0 0 8px 0" }}>
                    🏪 Laporan Per Kategori Bisnis
                  </h3>
                  <p style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
                    Analisis performa setiap kategori produk/layanan
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                  {["Es Krim & Mainan", "Gas"].map(category => {
                    const income = calculateTotal("income", category);
                    const expense = calculateTotal("expense", category);
                    const categoryProfit = income - expense;
                    const categoryTransactions = transactions.filter(t => t.category === category);

                    return (
                      <div key={category} style={{
                        border: "2px solid #f59e0b",
                        borderRadius: "20px",
                        padding: "25px",
                        backgroundColor: "#fffbeb",
                        boxShadow: "0 8px 25px rgba(245, 158, 11, 0.15)"
                      }}>
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                          <h4 style={{
                            margin: "0 0 8px 0",
                            fontSize: "20px",
                            color: "#92400e",
                            fontWeight: "bold"
                          }}>
                            {category === "Es Krim & Mainan" ? "🍦🧸" : "⛽"} {category}
                          </h4>
                          <div style={{
                            backgroundColor: "#f59e0b",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "15px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            display: "inline-block"
                          }}>
                            {categoryTransactions.length} Transaksi
                          </div>
                        </div>
                        
                        <div style={{ fontSize: "15px", lineHeight: "2" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", padding: "10px 0", borderBottom: "2px solid #fde68a" }}>
                            <span style={{ color: "#92400e", fontWeight: "600" }}>
                              💰 Total Pemasukan:
                            </span>
                            <span style={{ color: "#10b981", fontWeight: "800", fontSize: "16px" }}>{formatCurrency(income)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", padding: "10px 0", borderBottom: "2px solid #fde68a" }}>
                            <span style={{ color: "#92400e", fontWeight: "600" }}>
                              💸 Total Pengeluaran:
                            </span>
                            <span style={{ color: "#ef4444", fontWeight: "800", fontSize: "16px" }}>{formatCurrency(expense)}</span>
                          </div>
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            padding: "15px", 
                            backgroundColor: categoryProfit >= 0 ? "#dcfce7" : "#fee2e2", 
                            borderRadius: "15px", 
                            marginTop: "15px",
                            border: `3px solid ${categoryProfit >= 0 ? "#10b981" : "#ef4444"}20`
                          }}>
                            <span style={{ 
                              fontWeight: "800", 
                              color: categoryProfit >= 0 ? "#166534" : "#dc2626"
                            }}>
                              📊 {categoryProfit >= 0 ? "Keuntungan Bersih:" : "Kerugian Bersih:"}
                            </span>
                            <span style={{
                              color: categoryProfit >= 0 ? "#10b981" : "#ef4444",
                              fontWeight: "900",
                              fontSize: "18px"
                            }}>
                              {formatCurrency(Math.abs(categoryProfit))}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginTop: "15px", textAlign: "center" }}>
                          <div style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            backgroundColor: categoryProfit >= 0 ? "#dcfce7" : "#fee2e2",
                            color: categoryProfit >= 0 ? "#166534" : "#dc2626",
                            border: `2px solid ${categoryProfit >= 0 ? "#10b981" : "#ef4444"}30`
                          }}>
                            {categoryProfit >= 0 ? "📈 Performa Baik" : "📉 Perlu Evaluasi"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Export Tab */}
          {selectedReportTab === "export" && (
            <div>
              <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                padding: "25px",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                textAlign: "center"
              }}>
                <div style={{ marginBottom: "25px" }}>
                  <h3 style={{ marginBottom: "15px", color: "#1f2937", fontSize: "22px" }}>💾 Export & Backup Data</h3>
                  <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "15px", lineHeight: "1.6" }}>
                    Download laporan keuangan lengkap dan backup semua data transaksi Toko DGI
                  </p>
                </div>

                {/* Quick Stats */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
                  gap: "12px",
                  marginBottom: "25px",
                  padding: "15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "15px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>{transactions.length}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Total Transaksi</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                      {transactions.filter(t => t.type === "income").length}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Pemasukan</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ef4444" }}>
                      {transactions.filter(t => t.type === "expense").length}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Pengeluaran</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>2</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Kategori</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
                  <button
                    onClick={downloadReport}
                    style={{
                      padding: "18px 35px",
                      background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "18px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "700",
                      boxShadow: "0 8px 25px rgba(99, 102, 241, 0.3)"
                    }}
                  >
                    📄 Download Laporan Lengkap
                  </button>

                  <button
                    onClick={clearAllData}
                    style={{
                      padding: "18px 35px",
                      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "18px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "700",
                      boxShadow: "0 8px 25px rgba(239, 68, 68, 0.3)"
                    }}
                  >
                    🗑️ Reset Semua Data
                  </button>
                </div>

                <div style={{
                  marginTop: "20px",
                  padding: "20px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "18px",
                  border: "1px solid #e2e8f0"
                }}>
                  <h4 style={{ marginBottom: "12px", color: "#1f2937", fontSize: "16px" }}>📋 Isi Laporan Yang Akan Di-Download:</h4>
                  <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.8", textAlign: "left" }}>
                    <div style={{ marginBottom: "8px" }}>✅ Ringkasan keuangan keseluruhan (pemasukan, pengeluaran, profit)</div>
                    <div style={{ marginBottom: "8px" }}>✅ Laporan mingguan untuk bulan berjalan</div>
                    <div style={{ marginBottom: "8px" }}>✅ Laporan bulanan untuk tahun berjalan</div>
                    <div style={{ marginBottom: "8px" }}>✅ Analisis per kategori (Es Krim & Mainan, Gas)</div>
                    <div style={{ marginBottom: "8px" }}>✅ Detail lengkap semua transaksi dengan tanggal dan keterangan</div>
                    <div>✅ Format file: TXT (mudah dibuka di semua device)</div>
                  </div>
                </div>

                <div style={{
                  marginTop: "15px",
                  padding: "15px",
                  backgroundColor: "#eff6ff",
                  borderRadius: "15px",
                  border: "2px solid #3b82f620"
                }}>
                  <p style={{ fontSize: "12px", color: "#1e40af", margin: "0 0 8px 0", lineHeight: "1.5", fontWeight: "600" }}>
                    💡 Tips: Data tersimpan otomatis di memory browser selama sesi ini
                  </p>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: "0", lineHeight: "1.4" }}>
                    📊 Untuk backup permanen, pastikan download laporan secara berkala
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{
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
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(15px)",
            borderRadius: "25px",
            padding: "30px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
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
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "15px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box"
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
                  boxSizing: "border-box"
                }}
                placeholder="Masukkan jumlah..."
                min="0"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", marginBottom: "5px", color: "#374151" }}>
                Keterangan (Opsional)
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
                  boxSizing: "border-box"
                }}
                placeholder="Contoh: Beli bahan baku, Bayar listrik, dll..."
              />
            </div>

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
                  boxSizing: "border-box"
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
                  fontSize: "14px"
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
                  fontWeight: "600"
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
